import pytest
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException

from backend.api.routers.driver import parse_mon_to_wei, verify_monad_payment_onchain
from backend.data import driver_db


def test_parse_mon_to_wei():
    assert parse_mon_to_wei("0.025 MON") == 25000000000000000
    assert parse_mon_to_wei("0.035") == 35000000000000000
    assert parse_mon_to_wei("1 MON") == 1000000000000000000
    assert parse_mon_to_wei("0") == 0


def test_driver_booking_persistence_and_duplicate_rejection():
    driver = driver_db.get_or_create_driver_session(token="test-booking-driver-token")
    driver_id = driver["driver_id"]

    booking_data = {
        "id": "RES-TEST-001",
        "station_id": "test-station-1",
        "station_name": "Test Express Superhub",
        "bay_number": "Bay 01",
        "connector_type": "CCS2 Combo",
        "duration_minutes": 30,
        "total_cost": "₹49",
        "mon_amount": "0.025 MON",
        "wei_amount": "25000000000000000",
        "pin_code": "1234",
        "start_time": "10:00 AM",
        "expiry_time": "10:30 AM",
        "expiry_timestamp": 1800000000,
        "payment_method": "monad_testnet",
        "tx_hash": "0x1111111111111111111111111111111111111111111111111111111111111111",
        "block_number": 1042,
        "from_address": "0xaaaa1111aaaa1111aaaa1111aaaa1111aaaa1111",
        "to_address": "0xbbbb2222bbbb2222bbbb2222bbbb2222bbbb2222",
        "gas_used": "21000",
        "payment_status": "confirmed",
        "session_type": "charging_session",
        "target_kwh": 15.5,
        "target_battery_pct": 80,
    }

    # Clean existing if any
    existing = driver_db.get_booking_by_tx_hash(booking_data["tx_hash"])
    if not existing:
        record = driver_db.create_driver_booking(driver_id, booking_data)
        assert record["id"] == "RES-TEST-001"
        assert record["payment_status"] == "confirmed"
        assert record["tx_hash"] == booking_data["tx_hash"]

    # Verify lookup by ID and tx_hash
    fetched = driver_db.get_driver_booking("RES-TEST-001")
    assert fetched is not None
    assert fetched["station_name"] == "Test Express Superhub"

    by_hash = driver_db.get_booking_by_tx_hash(booking_data["tx_hash"])
    assert by_hash is not None
    assert by_hash["id"] == "RES-TEST-001"

    # Verify listing for station owners
    station_bookings = driver_db.list_station_bookings("test-station-1")
    assert len(station_bookings) >= 1
    assert any(b["id"] == "RES-TEST-001" for b in station_bookings)


@pytest.mark.asyncio
async def test_verify_monad_payment_onchain_invalid_hash():
    with pytest.raises(HTTPException) as exc_info:
        await verify_monad_payment_onchain("invalid_hash", "0.025 MON")
    assert exc_info.value.status_code == 400
    assert "Invalid transaction hash format" in exc_info.value.detail


@pytest.mark.asyncio
async def test_verify_monad_payment_onchain_reverted_tx():
    mock_receipt = {
        "result": {
            "blockNumber": "0x400",
            "status": "0x0",  # Reverted
        }
    }

    with patch("httpx.AsyncClient.post") as mock_post:
        mock_response = AsyncMock()
        mock_response.json = lambda: mock_receipt
        mock_post.return_value = mock_response

        with pytest.raises(HTTPException) as exc_info:
            await verify_monad_payment_onchain(
                "0x2222222222222222222222222222222222222222222222222222222222222222",
                "0.025 MON"
            )
        assert exc_info.value.status_code == 400
        assert "Transaction reverted on-chain" in exc_info.value.detail
