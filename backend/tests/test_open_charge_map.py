import pytest
from unittest.mock import patch, MagicMock
from backend.data.open_charge_map import OpenChargeMapService, LiveEnrichmentResult
import urllib.error

def test_fetch_city_stations_empty_response():
    """Test that an empty list from OCM is gracefully handled and does not fallback to baseline if it's a valid 200 response."""
    service = OpenChargeMapService()
    service.get_api_key = MagicMock(return_value="test_key")
    service.resolve_city_center = MagicMock(return_value=(18.5204, 73.8567))

    mock_response = MagicMock()
    mock_response.status = 200
    mock_response.read.return_value = b'[]'
    mock_response.__enter__.return_value = mock_response
    mock_response.__exit__.return_value = None

    with patch('urllib.request.urlopen', return_value=mock_response):
        result = service.fetch_city_stations("Pune")

    assert result.is_live is True
    assert result.live_station_count == 0
    assert result.source == "open_charge_map"
    assert result.status_message == "No stations found in this area"
    assert result.fallback_reason is None


def test_fetch_city_stations_provider_failure_with_dataset():
    """Test that a provider failure triggers a fallback to the baseline dataset if available."""
    service = OpenChargeMapService()
    service.get_api_key = MagicMock(return_value=None)
    service.resolve_city_center = MagicMock(return_value=(18.5204, 73.8567))

    mock_loader = MagicMock()
    mock_loader.has_dataset = True
    mock_loader.filter_by_city.return_value = MagicMock()
    mock_loader.filter_by_city.return_value.head.return_value.iterrows.return_value = []
    mock_loader.filter_by_city.return_value.__len__.return_value = 0

    with patch('urllib.request.urlopen', side_effect=urllib.error.HTTPError(
            "url", 403, "Forbidden", {}, None)):
        with patch('backend.data.open_charge_map.get_loader', return_value=mock_loader):
            result = service.fetch_city_stations("Pune")

    assert result.is_live is False
    assert result.source == "kaggle_baseline"
    assert result.fallback_reason == "OCM API HTTP 403 (Forbidden)"


def test_fetch_city_stations_provider_failure_without_dataset():
    """Test that a provider failure triggers a fallback to unavailable if baseline dataset is missing."""
    service = OpenChargeMapService()
    service.get_api_key = MagicMock(return_value=None)
    service.resolve_city_center = MagicMock(return_value=(18.5204, 73.8567))

    mock_loader = MagicMock()
    mock_loader.has_dataset = False

    with patch('urllib.request.urlopen', side_effect=urllib.error.HTTPError(
            "url", 403, "Forbidden", {}, None)):
        with patch('backend.data.open_charge_map.get_loader', return_value=mock_loader):
            result = service.fetch_city_stations("Pune")

    assert result.is_live is False
    assert result.source == "unavailable"
    assert "OCM API HTTP 403 (Forbidden)" in result.fallback_reason
    assert "Baseline dataset missing on disk" in result.fallback_reason

