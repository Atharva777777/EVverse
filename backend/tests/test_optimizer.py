import pytest
from unittest.mock import patch, MagicMock
from backend.api.services.optimizer import run_pipeline

@patch("backend.data.open_charge_map.OpenChargeMapService.fetch_city_stations")
def test_optimizer_fallback_missing_dataset(mock_fetch):
    """
    Test that the optimization pipeline can successfully fall back to OCM and
    execute the classical exhaustive solver when the local dataset is missing.
    """
    # Mock the OCM response to return 8 dummy stations so CityManager can cluster them
    mock_result = MagicMock()
    mock_result.stations = []
    
    class DummyStation:
        def __init__(self, lat, lon):
            self.latitude = lat
            self.longitude = lon
            self.bays = 4
            self.power_kw = 120.0
            
    # Generate 8 distinct coordinates to satisfy KMeans(n_clusters=8)
    coords = [
        (18.5204, 73.8567), (18.5210, 73.8570), (18.5220, 73.8580), (18.5230, 73.8590),
        (18.5240, 73.8600), (18.5250, 73.8610), (18.5260, 73.8620), (18.5270, 73.8630)
    ]
    for lat, lon in coords:
        mock_result.stations.append(DummyStation(lat, lon))
        
    mock_fetch.return_value = mock_result
    
    # We clear the cache to ensure CityManager runs again for "Pune"
    from backend.data.city_manager import get_city_manager
    manager = get_city_manager()
    if "Pune" in manager._bundles:
        del manager._bundles["Pune"]

    # Run the pipeline
    # NOTE: qiskit_aer is not installed in the test environment, so this will
    # seamlessly fall back to the classical solver which is exactly what we want.
    result = run_pipeline(city="Pune", station_count=3, scenario="all_hours")
    
    assert "pipeline_runtime_s" in result
    assert result["recommendation"]["feasible"] is True
    assert result["recommendation"]["city"] == "Pune"
    assert result["recommendation"]["n_stations"] == 3
    assert result["recommendation"]["method"] == "classical_exhaustive"
    assert len(result["recommendation"]["selected_zones"]) == 3
