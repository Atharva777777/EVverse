import pytest
from backend.data.open_charge_map import OpenChargeMapService
from backend.api.routers.live_data import get_live_stations
import asyncio

def test_resolve_city_center_unknown_city():
    service = OpenChargeMapService()
    with pytest.raises(ValueError, match="Unsupported city: UnknownCity. Cannot resolve coordinates without explicit lat/lng parameters."):
        service.resolve_city_center("UnknownCity")

def test_resolve_city_center_known_city():
    service = OpenChargeMapService()
    # Mumbai is in CITY_COORDINATES
    lat, lng = service.resolve_city_center("Mumbai")
    assert lat == 19.0760
    assert lng == 72.8777
