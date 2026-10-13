"""
backend/tests/test_driver_api.py
================================
Automated integration tests for EV Verse Driver backend endpoints:
- Session & Authentication
- Garage Vehicles CRUD
- Driver Preferences
- Favourites Persistence
- Community Station Reports
- Charging Sessions & History
"""

import os
import pytest
from fastapi.testclient import TestClient

from backend.api.main import app
from backend.data import driver_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_test_db(tmp_path, monkeypatch):
    """Use an isolated temporary sqlite database for testing."""
    test_db_path = tmp_path / "test_driver.db"
    monkeypatch.setattr(driver_db, "DB_PATH", test_db_path)
    driver_db.init_driver_db()


def test_driver_session_creation():
    """Verify session creation produces a valid driver_id and token."""
    response = client.post("/api/v1/driver/session", json={"name": "Test Driver"})
    assert response.status_code == 200
    data = response.json()
    assert data["driver_id"].startswith("drv_")
    assert data["token"].startswith("tok_")
    assert data["name"] == "Test Driver"
    assert "created_at" in data


def test_driver_vehicles_initial_seed_and_pagination():
    """Verify newly created driver has verified vehicles seeded and supports pagination."""
    # Create driver session
    sess = client.post("/api/v1/driver/session", json={"name": "Fleet Driver"}).json()
    token = sess["token"]

    # List vehicles (limit 2)
    resp = client.get("/api/v1/driver/vehicles?page=1&limit=2", headers={"X-Driver-Token": token})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 5
    assert len(data["items"]) == 2
    assert data["page"] == 1
    assert data["limit"] == 2
    assert data["items"][0]["make"] == "Porsche"


def test_driver_vehicle_crud():
    """Verify adding, updating, and deleting a vehicle in the garage."""
    sess = client.post("/api/v1/driver/session").json()
    token = sess["token"]

    # 1. Add Vehicle
    new_vehicle = {
        "make": "Polestar",
        "model": "3 Long Range",
        "year": 2025,
        "usable_kwh": 107.0,
        "current_battery_pct": 80,
        "wltp_range_km": 610,
        "efficiency_kwh100km": 19.8,
        "max_dc_speed_kw": 250,
        "max_ac_speed_kw": 11,
        "plug_type": "CCS2 Combo",
        "vin": "YSMED02E4R1098412",
        "soh_pct": 99.5,
    }
    create_resp = client.post("/api/v1/driver/vehicles", json=new_vehicle, headers={"X-Driver-Token": token})
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["make"] == "Polestar"
    assert created["usable_kwh"] == 107.0
    v_id = created["id"]

    # 2. Update Vehicle
    update_resp = client.put(
        f"/api/v1/driver/vehicles/{v_id}",
        json={"current_battery_pct": 90, "max_dc_speed_kw": 260},
        headers={"X-Driver-Token": token},
    )
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["current_battery_pct"] == 90
    assert updated["max_dc_speed_kw"] == 260

    # 3. Delete Vehicle
    del_resp = client.delete(f"/api/v1/driver/vehicles/{v_id}", headers={"X-Driver-Token": token})
    assert del_resp.status_code == 204

    # 4. Verify deletion
    list_resp = client.get("/api/v1/driver/vehicles", headers={"X-Driver-Token": token}).json()
    assert not any(v["id"] == v_id for v in list_resp["items"])


def test_driver_vehicle_validation_errors():
    """Verify validation rejects invalid plug types, negative capacity, or extreme power."""
    sess = client.post("/api/v1/driver/session").json()
    token = sess["token"]

    # Invalid plug type
    bad_plug = {
        "make": "Custom",
        "model": "EV",
        "usable_kwh": 60,
        "max_dc_speed_kw": 100,
        "plug_type": "Proprietary Wireless",
    }
    resp1 = client.post("/api/v1/driver/vehicles", json=bad_plug, headers={"X-Driver-Token": token})
    assert resp1.status_code == 422

    # Negative usable capacity
    bad_capacity = {
        "make": "Custom",
        "model": "EV",
        "usable_kwh": -10,
        "max_dc_speed_kw": 100,
        "plug_type": "CCS2 Combo",
    }
    resp2 = client.post("/api/v1/driver/vehicles", json=bad_capacity, headers={"X-Driver-Token": token})
    assert resp2.status_code == 422


def test_driver_preferences():
    """Verify getting and updating driver preferences."""
    sess = client.post("/api/v1/driver/session").json()
    token = sess["token"]

    # Get initial preferences
    get_resp = client.get("/api/v1/driver/preferences", headers={"X-Driver-Token": token})
    assert get_resp.status_code == 200
    prefs = get_resp.json()
    assert prefs["auto_compatibility"] is True

    # Update preferences
    update_resp = client.put(
        "/api/v1/driver/preferences",
        json={"auto_compatibility": False, "default_city": "Pune"},
        headers={"X-Driver-Token": token},
    )
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["auto_compatibility"] is False
    assert updated["default_city"] == "Pune"


def test_driver_favourites():
    """Verify adding, listing, and removing station favourites."""
    sess = client.post("/api/v1/driver/session").json()
    token = sess["token"]

    # Add favourite
    add_resp = client.post("/api/v1/driver/favourites/OCM-100234", headers={"X-Driver-Token": token})
    assert add_resp.status_code == 200
    assert add_resp.json()["is_favourite"] is True

    # List favourites
    list_resp = client.get("/api/v1/driver/favourites", headers={"X-Driver-Token": token})
    assert list_resp.status_code == 200
    assert "OCM-100234" in list_resp.json()["station_ids"]

    # Remove favourite
    del_resp = client.delete("/api/v1/driver/favourites/OCM-100234", headers={"X-Driver-Token": token})
    assert del_resp.status_code == 200
    assert del_resp.json()["is_favourite"] is False

    # Check empty
    list_resp_2 = client.get("/api/v1/driver/favourites", headers={"X-Driver-Token": token})
    assert "OCM-100234" not in list_resp_2.json()["station_ids"]


def test_station_reports():
    """Verify submitting and querying community station issue reports."""
    sess = client.post("/api/v1/driver/session").json()
    token = sess["token"]

    # Submit valid report
    report_data = {
        "station_id": "OCM-500",
        "category": "Charger Powered Down / Offline",
        "connector_type": "CCS2 Combo",
        "notes": "Display screen blank, no power flow.",
    }
    submit_resp = client.post("/api/v1/driver/reports", json=report_data, headers={"X-Driver-Token": token})
    assert submit_resp.status_code == 201
    created = submit_resp.json()
    assert created["station_id"] == "OCM-500"
    assert created["category"] == "Charger Powered Down / Offline"

    # Query reports for station
    query_resp = client.get("/api/v1/driver/reports?station_id=OCM-500", headers={"X-Driver-Token": token})
    assert query_resp.status_code == 200
    items = query_resp.json()["items"]
    assert len(items) >= 1
    assert items[0]["notes"] == "Display screen blank, no power flow."


def test_charging_sessions():
    """Verify recording and querying charging session receipts."""
    sess = client.post("/api/v1/driver/session").json()
    token = sess["token"]

    session_data = {
        "station_id": "OCM-999",
        "station_name": "Metro Fast Hub",
        "kwh_delivered": 42.5,
        "duration_seconds": 1820,
        "cost": 11.90,
        "max_power_kw": 180.0,
    }
    record_resp = client.post("/api/v1/driver/charging-sessions", json=session_data, headers={"X-Driver-Token": token})
    assert record_resp.status_code == 201
    created = record_resp.json()
    assert created["kwh_delivered"] == 42.5
    assert created["cost"] == 11.90

    # Query sessions
    history_resp = client.get("/api/v1/driver/charging-sessions", headers={"X-Driver-Token": token})
    assert history_resp.status_code == 200
    items = history_resp.json()["items"]
    assert len(items) == 1
    assert items[0]["station_name"] == "Metro Fast Hub"
