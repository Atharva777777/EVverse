"""
backend/tests/test_driver_integration_e2e.py
============================================
End-to-End integration test validating the complete EV Verse driver flow:
1. Initialize driver session and obtain token
2. Load garage fleet and add custom EV
3. Update driver preferences (active vehicle & compatibility mode)
4. Query live stations from Open Charge Map / baseline
5. Toggle station favorites and verify persistence
6. Submit a station issue report and retrieve it
7. Complete a charging session and verify receipt history
"""

import pytest
from fastapi.testclient import TestClient

from backend.api.main import app
from backend.data import driver_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def isolated_db(tmp_path, monkeypatch):
    db_file = tmp_path / "e2e_driver.db"
    monkeypatch.setattr(driver_db, "DB_PATH", db_file)
    driver_db.init_driver_db()


def test_complete_driver_lifecycle_e2e():
    # ── Step 1: Session Init & Token Auth ──
    sess_res = client.post("/api/v1/driver/session", json={"name": "Alex Driver"})
    assert sess_res.status_code == 200
    session_data = sess_res.json()
    token = session_data["token"]
    driver_id = session_data["driver_id"]
    assert token.startswith("tok_")
    assert driver_id.startswith("drv_")

    auth_headers = {"X-Driver-Token": token}

    # ── Step 2: Garage Fleet & Vehicle CRUD ──
    vehicles_res = client.get("/api/v1/driver/vehicles", headers=auth_headers)
    assert vehicles_res.status_code == 200
    vehicles_data = vehicles_res.json()
    assert vehicles_data["total"] == 5
    default_vehicle_id = vehicles_data["items"][0]["id"]

    # Add new vehicle
    new_car = {
        "make": "Audi",
        "model": "Q8 e-tron 55 quattro",
        "year": 2025,
        "usable_kwh": 106.0,
        "current_battery_pct": 85,
        "wltp_range_km": 582,
        "efficiency_kwh100km": 20.5,
        "max_dc_speed_kw": 170,
        "max_ac_speed_kw": 22,
        "plug_type": "CCS2 Combo",
        "vin": "WAUZZZGE9PA019482",
    }
    create_car_res = client.post("/api/v1/driver/vehicles", json=new_car, headers=auth_headers)
    assert create_car_res.status_code == 201
    created_car = create_car_res.json()
    new_car_id = created_car["id"]
    assert created_car["make"] == "Audi"

    # Verify garage now has 6 vehicles
    vehicles_res_2 = client.get("/api/v1/driver/vehicles", headers=auth_headers)
    assert vehicles_res_2.json()["total"] == 6

    # ── Step 3: Driver Preferences ──
    prefs_res = client.get("/api/v1/driver/preferences", headers=auth_headers)
    assert prefs_res.status_code == 200
    assert prefs_res.json()["auto_compatibility"] is True

    update_prefs_res = client.put(
        "/api/v1/driver/preferences",
        json={"active_vehicle_id": new_car_id, "default_city": "Pune"},
        headers=auth_headers,
    )
    assert update_prefs_res.status_code == 200
    assert update_prefs_res.json()["active_vehicle_id"] == new_car_id
    assert update_prefs_res.json()["default_city"] == "Pune"

    # ── Step 4: Live Stations Endpoint ──
    live_res = client.get("/api/v1/live-stations?city=Mumbai&max_results=10")
    assert live_res.status_code == 200
    live_data = live_res.json()
    assert "stations" in live_data
    assert len(live_data["stations"]) > 0
    target_station = live_data["stations"][0]
    target_station_id = target_station["station_id"]

    # ── Step 5: Favourites Persistence ──
    fav_add = client.post(f"/api/v1/driver/favourites/{target_station_id}", headers=auth_headers)
    assert fav_add.status_code == 200
    assert fav_add.json()["is_favourite"] is True

    fav_list = client.get("/api/v1/driver/favourites", headers=auth_headers)
    assert fav_list.status_code == 200
    assert target_station_id in fav_list.json()["station_ids"]

    # ── Step 6: Community Station Issue Reporting ──
    report_res = client.post(
        "/api/v1/driver/reports",
        json={
            "station_id": target_station_id,
            "category": "Broken / Damaged Connector",
            "connector_type": "CCS2 Combo",
            "notes": "Connector latch mechanism jammed.",
        },
        headers=auth_headers,
    )
    assert report_res.status_code == 201
    report_data = report_res.json()
    assert report_data["category"] == "Broken / Damaged Connector"

    # Retrieve reports for this station
    reports_list = client.get(f"/api/v1/driver/reports?station_id={target_station_id}", headers=auth_headers)
    assert reports_list.status_code == 200
    assert reports_list.json()["total"] >= 1
    assert reports_list.json()["items"][0]["notes"] == "Connector latch mechanism jammed."

    # ── Step 7: Charging Session & Receipt ──
    session_res = client.post(
        "/api/v1/driver/charging-sessions",
        json={
            "station_id": target_station_id,
            "station_name": target_station["name"],
            "kwh_delivered": 48.2,
            "duration_seconds": 1950,
            "cost": 13.50,
            "max_power_kw": 150.0,
        },
        headers=auth_headers,
    )
    assert session_res.status_code == 201
    session_data = session_res.json()
    assert session_data["kwh_delivered"] == 48.2

    # Query driver charging history
    history_res = client.get("/api/v1/driver/charging-sessions", headers=auth_headers)
    assert history_res.status_code == 200
    assert history_res.json()["total"] == 1
    assert history_res.json()["items"][0]["station_name"] == target_station["name"]
