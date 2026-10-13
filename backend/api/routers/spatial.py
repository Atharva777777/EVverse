"""
backend/api/routers/spatial.py
==============================
Spatial Digital Twin endpoints for EV Verse Spatial.
Provides real city infrastructure baselines and live scenario impact calculation.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from backend.api.services.spatial_optimizer import get_spatial_service

log = logging.getLogger(__name__)
router = APIRouter()


class ScenarioCalculateRequest(BaseModel):
    city: str = Field(default="Mumbai", description="Target metropolitan city")
    latitude: float = Field(..., description="Target site latitude")
    longitude: float = Field(..., description="Target site longitude")
    candidate_label: Optional[str] = Field(default=None, description="Pre-identified zone label (e.g. Z0–Z7)")
    charger_type: str = Field(default="ultra_fast_dc", description="Charger specification")
    bays_count: int = Field(default=4, ge=1, le=24, description="Number of charging bays/ports")
    power_kw_per_port: float = Field(default=150.0, ge=7.0, le=1000.0, description="Rated power per port in kW")
    capex_per_kw: float = Field(default=450.0, ge=50.0, le=2000.0, description="Hardware CapEx per kW")
    civil_works_cost: float = Field(default=45000.0, ge=0.0, description="Civil preparation and ground works")
    grid_interconnect_cost: float = Field(default=35000.0, ge=0.0, description="Transformer and utility interconnect")
    permit_inspection_cost: float = Field(default=12000.0, ge=0.0, description="Regulatory permits and inspection fees")
    service_radius_km: float = Field(default=2.5, ge=0.5, le=15.0, description="Catchment accessibility threshold in km")
    budget_usd: float = Field(default=350000.0, ge=10000.0, description="Available planning budget in USD")
    forecast_years: int = Field(default=5, ge=1, le=10, description="Financial forecast horizon")
    equity_priority_weight: float = Field(default=0.35, ge=0.0, le=1.0, description="Weighting towards underserved areas")
    scenario: str = Field(default="all_hours", description="Temporal traffic scenario")


@router.get(
    "/spatial/context",
    summary="Get 3D spatial baseline & candidate infrastructure for a city",
    description="Returns existing operational chargers, candidate zones, unmet demand, and baseline coverage."
)
def get_spatial_context(city: str = Query(default="Mumbai")):
    try:
        service = get_spatial_service()
        return service.get_city_spatial_context(city)
    except Exception as exc:
        log.exception("Failed to get spatial context for %s: %s", city, exc)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post(
    "/spatial/calculate",
    summary="Calculate exact impact of a proposed charging installation",
    description="Evaluates CapEx, annual revenue, payback, population access, and coverage changes."
)
def calculate_scenario(req: ScenarioCalculateRequest):
    try:
        service = get_spatial_service()
        result = service.evaluate_scenario(
            city=req.city,
            latitude=req.latitude,
            longitude=req.longitude,
            candidate_label=req.candidate_label,
            charger_type=req.charger_type,
            bays_count=req.bays_count,
            power_kw_per_port=req.power_kw_per_port,
            capex_per_kw=req.capex_per_kw,
            civil_works_cost=req.civil_works_cost,
            grid_interconnect_cost=req.grid_interconnect_cost,
            permit_inspection_cost=req.permit_inspection_cost,
            service_radius_km=req.service_radius_km,
            budget_usd=req.budget_usd,
            forecast_years=req.forecast_years,
            equity_priority_weight=req.equity_priority_weight,
            scenario=req.scenario,
        )
        return result
    except Exception as exc:
        log.exception("Scenario calculation failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
