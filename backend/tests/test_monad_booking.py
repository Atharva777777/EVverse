import httpx
import pytest
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException

from backend.api.routers.driver import (
    parse_mon_to_wei,
    verify_monad_payment_onchain,
    get_alchemy_rpc_config,
    get_active_monad_rpc,
    mask_rpc_url,
    get_rpc_status,
)
from backend.api.main import app
from fastapi.testclient import TestClient
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


def test_get_alchemy_rpc_config():
    with patch.dict("os.environ", {}, clear=True):
        url, configured = get_alchemy_rpc_config()
        assert configured is False
        assert url is None

    with patch.dict("os.environ", {"ALCHEMY_API_KEY": "test_key_123"}, clear=True):
        url, configured = get_alchemy_rpc_config()
        assert configured is True
        assert url == "https://monad-testnet.g.alchemy.com/v2/test_key_123"

    with patch.dict("os.environ", {"MONAD_ALCHEMY_RPC_URL": "https://custom-proxy.internal/v2/abc"}, clear=True):
        url, configured = get_alchemy_rpc_config()
        assert configured is True
        assert url == "https://custom-proxy.internal/v2/abc"


def test_mask_rpc_url():
    assert mask_rpc_url("https://monad-testnet.g.alchemy.com/v2/secret_key_12345") == "https://monad-testnet.g.alchemy.com/v2/********"
    assert mask_rpc_url("https://testnet-rpc.monad.xyz") == "https://testnet-rpc.monad.xyz"
    assert mask_rpc_url("") == ""


@pytest.mark.asyncio
async def test_rpc_status_no_alchemy():
    mock_block = {"result": "0x43ff"}  # 17407
    mock_chain = {"result": "0x279f"}  # 10143

    async def mock_post(url, **kwargs):
        json_body = kwargs.get("json", {})
        method = json_body.get("method")
        resp = AsyncMock()
        if method == "eth_blockNumber":
            resp.json = lambda: mock_block
        elif method == "eth_chainId":
            resp.json = lambda: mock_chain
        return resp

    with patch.dict("os.environ", {}, clear=True):
        with patch("httpx.AsyncClient.post", side_effect=mock_post):
            status_res = await get_rpc_status()
            assert status_res["connected"] is True
            assert status_res["is_alchemy"] is False
            assert status_res["alchemy_configured"] is False
            assert status_res["provider"] == "Monad Public Testnet RPC"
            assert status_res["chain_id"] == 10143
            assert status_res["latest_block"] == 17407
            assert status_res["error"] is None


@pytest.mark.asyncio
async def test_rpc_status_alchemy_success():
    secret_key = "super_secret_alchemy_key_abc"
    mock_block = {"result": "0x4400"}  # 17408
    mock_chain = {"result": "0x279f"}  # 10143

    async def mock_post(url, **kwargs):
        assert "monad-testnet.g.alchemy.com" in url
        json_body = kwargs.get("json", {})
        method = json_body.get("method")
        resp = AsyncMock()
        if method == "eth_blockNumber":
            resp.json = lambda: mock_block
        elif method == "eth_chainId":
            resp.json = lambda: mock_chain
        return resp

    with patch.dict("os.environ", {"ALCHEMY_API_KEY": secret_key}, clear=True):
        with patch("httpx.AsyncClient.post", side_effect=mock_post):
            status_res = await get_rpc_status()
            assert status_res["connected"] is True
            assert status_res["is_alchemy"] is True
            assert status_res["alchemy_configured"] is True
            assert status_res["fallback_active"] is False
            assert status_res["provider"] == "Alchemy Monad Testnet RPC"
            assert status_res["latest_block"] == 17408
            assert secret_key not in status_res["rpc_endpoint_masked"]
            assert status_res["rpc_endpoint_masked"] == "https://monad-testnet.g.alchemy.com/v2/********"


@pytest.mark.asyncio
async def test_rpc_status_alchemy_failover_to_public():
    secret_key = "failing_alchemy_key"
    mock_block = {"result": "0x4401"}
    mock_chain = {"result": "0x279f"}

    async def mock_post(url, **kwargs):
        # Alchemy endpoint fails
        if "alchemy.com" in url:
            raise httpx.ConnectTimeout("Alchemy node timeout")
        # Fallback Monad public RPC succeeds
        json_body = kwargs.get("json", {})
        method = json_body.get("method")
        resp = AsyncMock()
        if method == "eth_blockNumber":
            resp.json = lambda: mock_block
        elif method == "eth_chainId":
            resp.json = lambda: mock_chain
        return resp

    with patch.dict("os.environ", {"ALCHEMY_API_KEY": secret_key}, clear=True):
        with patch("httpx.AsyncClient.post", side_effect=mock_post):
            status_res = await get_rpc_status()
            assert status_res["connected"] is True
            assert status_res["is_alchemy"] is False
            assert status_res["alchemy_configured"] is True
            assert status_res["fallback_active"] is True
            assert status_res["provider"] == "Monad Public Testnet RPC (Fallback)"
            assert status_res["latest_block"] == 17409
            assert "ConnectTimeout" in status_res["error"]


@pytest.mark.asyncio
async def test_verify_monad_payment_alchemy_success():
    secret_key = "active_alchemy_key"
    recipient = "0x3333333333333333333333333333333333333333"

    mock_chain = {"result": "0x279f"}
    mock_receipt = {
        "result": {
            "blockNumber": "0x500",
            "status": "0x1",
            "gasUsed": "0x5208",
            "to": recipient,
        }
    }
    mock_tx = {
        "result": {
            "to": recipient,
            "from": "0x4444444444444444444444444444444444444444",
            "value": hex(25000000000000000),  # 0.025 MON in wei
        }
    }

    async def mock_post(url, **kwargs):
        assert "monad-testnet.g.alchemy.com" in url
        json_body = kwargs.get("json", {})
        method = json_body.get("method")
        resp = AsyncMock()
        if method == "eth_chainId":
            resp.json = lambda: mock_chain
        elif method == "eth_getTransactionReceipt":
            resp.json = lambda: mock_receipt
        elif method == "eth_getTransactionByHash":
            resp.json = lambda: mock_tx
        return resp

    with patch.dict("os.environ", {"ALCHEMY_API_KEY": secret_key}, clear=True):
        with patch("httpx.AsyncClient.post", side_effect=mock_post):
            verified = await verify_monad_payment_onchain(
                tx_hash="0x3333333333333333333333333333333333333333333333333333333333333333",
                expected_mon_str="0.025 MON",
                station_recipient_override=recipient,
            )
            assert verified["verified"] is True
            assert verified["provider"] == "Alchemy Monad Testnet RPC"
            assert verified["is_alchemy"] is True
            assert verified["fallback_used"] is False
            assert verified["block_number"] == 1280
            assert verified["to_address"] == recipient.lower()


@pytest.mark.asyncio
async def test_verify_monad_payment_alchemy_failover_to_public():
    secret_key = "active_alchemy_key"
    recipient = "0x5555555555555555555555555555555555555555"

    mock_chain = {"result": "0x279f"}
    mock_receipt = {
        "result": {
            "blockNumber": "0x600",
            "status": "0x1",
            "gasUsed": "0x5208",
            "to": recipient,
        }
    }
    mock_tx = {
        "result": {
            "to": recipient,
            "from": "0x6666666666666666666666666666666666666666",
            "value": hex(25000000000000000),
        }
    }

    async def mock_post(url, **kwargs):
        if "alchemy.com" in url:
            raise httpx.NetworkError("Alchemy connection dropped")
        json_body = kwargs.get("json", {})
        method = json_body.get("method")
        resp = AsyncMock()
        if method == "eth_chainId":
            resp.json = lambda: mock_chain
        elif method == "eth_getTransactionReceipt":
            resp.json = lambda: mock_receipt
        elif method == "eth_getTransactionByHash":
            resp.json = lambda: mock_tx
        return resp

    with patch.dict("os.environ", {"ALCHEMY_API_KEY": secret_key}, clear=True):
        with patch("httpx.AsyncClient.post", side_effect=mock_post):
            verified = await verify_monad_payment_onchain(
                tx_hash="0x5555555555555555555555555555555555555555555555555555555555555555",
                expected_mon_str="0.025 MON",
                station_recipient_override=recipient,
            )
            assert verified["verified"] is True
            assert verified["provider"] == "Monad Public Testnet RPC (Fallback)"
            assert verified["is_alchemy"] is False
            assert verified["fallback_used"] is True
            assert verified["block_number"] == 1536


@pytest.mark.asyncio
async def test_verify_monad_payment_both_providers_fail():
    secret_key = "active_alchemy_key"

    async def mock_post(url, **kwargs):
        raise httpx.ConnectError("Network unreachable")

    with patch.dict("os.environ", {"ALCHEMY_API_KEY": secret_key}, clear=True):
        with patch("httpx.AsyncClient.post", side_effect=mock_post):
            with pytest.raises(HTTPException) as exc_info:
                await verify_monad_payment_onchain(
                    tx_hash="0x7777777777777777777777777777777777777777777777777777777777777777",
                    expected_mon_str="0.025 MON",
                )
            assert exc_info.value.status_code == 502
            assert "Failed to reach Monad Testnet RPC providers" in exc_info.value.detail


@pytest.mark.asyncio
async def test_rpc_status_alchemy_http_403_failover_to_public():
    secret_key = "forbidden_key"
    mock_block = {"result": "0x4402"}
    mock_chain = {"result": "0x279f"}
    alchemy_403_error = {
        "jsonrpc": "2.0",
        "id": 1,
        "error": {"code": -32600, "message": "MONAD_TESTNET is not enabled for this app."}
    }

    async def mock_post(url, **kwargs):
        resp = AsyncMock()
        if "alchemy.com" in url:
            resp.status_code = 403
            resp.json = lambda: alchemy_403_error
            return resp
        # Public Monad RPC succeeds
        resp.status_code = 200
        json_body = kwargs.get("json", {})
        method = json_body.get("method")
        if method == "eth_blockNumber":
            resp.json = lambda: mock_block
        elif method == "eth_chainId":
            resp.json = lambda: mock_chain
        return resp

    with patch.dict("os.environ", {"ALCHEMY_API_KEY": secret_key}, clear=True):
        with patch("httpx.AsyncClient.post", side_effect=mock_post):
            status_res = await get_rpc_status()
            assert status_res["connected"] is True
            assert status_res["is_alchemy"] is False
            assert status_res["alchemy_configured"] is True
            assert status_res["fallback_active"] is True
            assert status_res["provider"] == "Monad Public Testnet RPC (Fallback)"
            assert status_res["latest_block"] == 17410


@pytest.mark.asyncio
async def test_verify_monad_payment_alchemy_http_403_failover_to_public():
    secret_key = "forbidden_key"
    recipient = "0x8888888888888888888888888888888888888888"

    mock_chain = {"result": "0x279f"}
    mock_receipt = {
        "result": {
            "blockNumber": "0x700",
            "status": "0x1",
            "gasUsed": "0x5208",
            "to": recipient,
        }
    }
    mock_tx = {
        "result": {
            "to": recipient,
            "from": "0x9999999999999999999999999999999999999999",
            "value": hex(25000000000000000),
        }
    }
    alchemy_403_error = {
        "jsonrpc": "2.0",
        "id": 1,
        "error": {"code": -32600, "message": "MONAD_TESTNET is not enabled for this app."}
    }

    async def mock_post(url, **kwargs):
        resp = AsyncMock()
        if "alchemy.com" in url:
            resp.status_code = 403
            resp.json = lambda: alchemy_403_error
            return resp
        # Public Monad RPC succeeds
        resp.status_code = 200
        json_body = kwargs.get("json", {})
        method = json_body.get("method")
        if method == "eth_chainId":
            resp.json = lambda: mock_chain
        elif method == "eth_getTransactionReceipt":
            resp.json = lambda: mock_receipt
        elif method == "eth_getTransactionByHash":
            resp.json = lambda: mock_tx
        return resp

    with patch.dict("os.environ", {"ALCHEMY_API_KEY": secret_key}, clear=True):
        with patch("httpx.AsyncClient.post", side_effect=mock_post):
            verified = await verify_monad_payment_onchain(
                tx_hash="0x8888888888888888888888888888888888888888888888888888888888888888",
                expected_mon_str="0.025 MON",
                station_recipient_override=recipient,
            )
            assert verified["verified"] is True
            assert verified["provider"] == "Monad Public Testnet RPC (Fallback)"
            assert verified["is_alchemy"] is False
            assert verified["fallback_used"] is True
            assert verified["block_number"] == 1792


def test_driver_booking_upi_rail():
    """Verify that instant UPI / Bharat QR bookings succeed and return correct settlement note."""
    client = TestClient(app)
    sess_res = client.post("/api/v1/driver/session", json={"name": "Pune Community Host Driver"})
    assert sess_res.status_code == 200
    token = sess_res.json()["token"]

    booking_payload = {
        "station_id": "STN-PUNE-SWAR-02",
        "station_name": "Swargate Junction Community Charger",
        "bay_number": "Bay 02",
        "connector_type": "Type 2 (AC)",
        "duration_minutes": 45,
        "total_cost": "₹49",
        "mon_amount": "₹49 UPI",
        "payment_method": "sandbox_upi",
        "tx_hash": "UPI-994821049381"
    }

    res = client.post(
        "/api/v1/driver/bookings",
        json=booking_payload,
        headers={"X-Driver-Token": token}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["payment_status"] == "confirmed"
    assert data["payment_method"] == "sandbox_upi"
    assert data["total_cost"] == "₹49"
    assert data["explorer_url"] is None
    assert "Bharat QR" in data["settlement_note"]
    assert len(data["pin_code"]) == 4


