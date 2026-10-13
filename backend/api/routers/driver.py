"""
backend/api/routers/driver.py
=============================
REST router for EV Verse driver services:
- Session & Authentication handling (Bearer or X-Driver-Token)
- Garage Vehicles CRUD with pagination
- Vehicle Preferences (active vehicle, auto-compatibility filter)
- Favourites persistence
- Community Station Issue Reports with categorization
- Charging Session history & receipts
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Response, status
from pydantic import BaseModel, Field, field_validator

from backend.data import driver_db

log = logging.getLogger(__name__)
router = APIRouter()

SUPPORTED_PLUGS = ["CCS2 Combo", "Type 2 (AC)", "CHAdeMO", "GB/T DC"]

VALID_REPORT_CATEGORIES = [
    "Broken / Damaged Connector",
    "Charger Powered Down / Offline",
    "ICEing (Blocked by Non-EV)",
    "Payment Terminal Failed",
    "Access Gate Locked / Closed",
    "Incorrect Location / Wrong Pin",
]


# ── Pydantic Request & Response Schemas ────────────────────────────────────────

class DriverSessionResponse(BaseModel):
    driver_id: str
    token: str
    name: str
    created_at: str


class SessionInitRequest(BaseModel):
    token: Optional[str] = Field(default=None, description="Existing driver token to resume session")
    name: Optional[str] = Field(default=None, max_length=50, description="Driver display name")


class VehicleSchema(BaseModel):
    id: str
    make: str = Field(min_length=2, max_length=50)
    model: str = Field(min_length=1, max_length=50)
    year: int = Field(ge=2010, le=2030, default=2025)
    image: Optional[str] = Field(default="/images/car-model.png")
    battery_kwh: float = Field(gt=0, le=250)
    usable_kwh: float = Field(gt=0, le=250)
    current_battery_pct: int = Field(ge=0, le=100, default=70)
    wltp_range_km: int = Field(gt=0, le=1500, default=450)
    efficiency_kwh100km: float = Field(gt=0, le=50, default=18.0)
    max_dc_speed_kw: int = Field(ge=0, le=500)
    max_ac_speed_kw: int = Field(ge=0, le=43, default=11)
    plug_type: str
    plug_image: Optional[str] = Field(default="/images/plug-ccs2.png")
    vin: Optional[str] = Field(default="")
    soh_pct: float = Field(ge=50.0, le=100.0, default=99.0)
    is_active: bool = Field(default=False)

    @field_validator("plug_type")
    @classmethod
    def validate_plug_type(cls, v: str) -> str:
        if v not in SUPPORTED_PLUGS:
            raise ValueError(f"Plug type must be one of {SUPPORTED_PLUGS}")
        return v


class VehicleCreateRequest(BaseModel):
    id: Optional[str] = Field(default=None, description="Optional custom vehicle ID")
    make: str = Field(min_length=2, max_length=50)
    model: str = Field(min_length=1, max_length=50)
    year: int = Field(ge=2010, le=2030, default=2025)
    image: Optional[str] = Field(default="/images/car-model.png")
    battery_kwh: Optional[float] = Field(default=None, gt=0, le=250)
    usable_kwh: float = Field(gt=0, le=250)
    current_battery_pct: int = Field(ge=0, le=100, default=75)
    wltp_range_km: int = Field(gt=0, le=1500, default=450)
    efficiency_kwh100km: float = Field(gt=0, le=50, default=18.0)
    max_dc_speed_kw: int = Field(ge=0, le=500)
    max_ac_speed_kw: int = Field(ge=0, le=43, default=11)
    plug_type: str
    plug_image: Optional[str] = Field(default=None)
    vin: Optional[str] = Field(default="")
    soh_pct: float = Field(ge=50.0, le=100.0, default=99.0)
    is_active: bool = Field(default=False)

    @field_validator("plug_type")
    @classmethod
    def validate_plug_type(cls, v: str) -> str:
        if v not in SUPPORTED_PLUGS:
            raise ValueError(f"Plug type must be one of {SUPPORTED_PLUGS}")
        return v


class VehicleUpdateRequest(BaseModel):
    make: Optional[str] = Field(default=None, min_length=2, max_length=50)
    model: Optional[str] = Field(default=None, min_length=1, max_length=50)
    year: Optional[int] = Field(default=None, ge=2010, le=2030)
    usable_kwh: Optional[float] = Field(default=None, gt=0, le=250)
    current_battery_pct: Optional[int] = Field(default=None, ge=0, le=100)
    wltp_range_km: Optional[int] = Field(default=None, gt=0, le=1500)
    efficiency_kwh100km: Optional[float] = Field(default=None, gt=0, le=50)
    max_dc_speed_kw: Optional[int] = Field(default=None, ge=0, le=500)
    max_ac_speed_kw: Optional[int] = Field(default=None, ge=0, le=43)
    plug_type: Optional[str] = None
    vin: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("plug_type")
    @classmethod
    def validate_plug_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in SUPPORTED_PLUGS:
            raise ValueError(f"Plug type must be one of {SUPPORTED_PLUGS}")
        return v


class VehiclesPaginatedResponse(BaseModel):
    items: List[VehicleSchema]
    total: int
    page: int
    limit: int


class PreferencesResponse(BaseModel):
    driver_id: str
    active_vehicle_id: str
    auto_compatibility: bool
    default_city: str


class PreferencesUpdateRequest(BaseModel):
    active_vehicle_id: Optional[str] = None
    auto_compatibility: Optional[bool] = None
    default_city: Optional[str] = None


class FavouritesResponse(BaseModel):
    station_ids: List[str]
    total: int
    page: int
    limit: int


class StationReportCreateRequest(BaseModel):
    station_id: str = Field(min_length=1)
    category: str = Field(description="Category of issue")
    connector_type: Optional[str] = None
    notes: Optional[str] = Field(default=None, max_length=500)

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in VALID_REPORT_CATEGORIES:
            raise ValueError(f"Category must be one of {VALID_REPORT_CATEGORIES}")
        return v


class StationReportResponse(BaseModel):
    id: str
    driver_id: str
    station_id: str
    category: str
    connector_type: Optional[str]
    notes: Optional[str]
    created_at: str


class ReportsPaginatedResponse(BaseModel):
    items: List[StationReportResponse]
    total: int
    page: int
    limit: int


class ChargingSessionCreateRequest(BaseModel):
    station_id: str = Field(min_length=1)
    station_name: str = Field(min_length=1)
    kwh_delivered: float = Field(ge=0, le=200)
    duration_seconds: int = Field(ge=0, le=86400)
    cost: float = Field(ge=0)
    max_power_kw: float = Field(ge=0, le=500)


class ChargingSessionResponse(BaseModel):
    id: str
    driver_id: str
    station_id: str
    station_name: str
    kwh_delivered: float
    duration_seconds: int
    cost: float
    max_power_kw: float
    created_at: str


class SessionsPaginatedResponse(BaseModel):
    items: List[ChargingSessionResponse]
    total: int
    page: int
    limit: int


# ── Authentication Dependency ──────────────────────────────────────────────────

def get_current_driver(
    x_driver_token: Optional[str] = Header(None, alias="X-Driver-Token"),
    authorization: Optional[str] = Header(None),
) -> Dict[str, Any]:
    """
    Extract token from X-Driver-Token header or Bearer authorization.
    Automatically resolves or provisions a driver session.
    """
    token = x_driver_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()

    return driver_db.get_or_create_driver_session(token=token)


# ── Session Endpoints ──────────────────────────────────────────────────────────

@router.post("/session", response_model=DriverSessionResponse, summary="Initialize or resume driver session")
async def init_session(
    body: Optional[SessionInitRequest] = None,
    response: Response = None,
    x_driver_token: Optional[str] = Header(None, alias="X-Driver-Token"),
) -> DriverSessionResponse:
    token = (body.token if body and body.token else None) or x_driver_token
    name = body.name if body and body.name else None
    driver = driver_db.get_or_create_driver_session(token=token, name=name)
    if response:
        response.headers["X-Driver-Token"] = driver["token"]
    return DriverSessionResponse(
        driver_id=driver["driver_id"],
        token=driver["token"],
        name=driver["name"],
        created_at=driver["created_at"],
    )


# ── Vehicles Endpoints ─────────────────────────────────────────────────────────

@router.get("/vehicles", response_model=VehiclesPaginatedResponse, summary="List driver garage vehicles")
async def get_vehicles(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    driver: Dict[str, Any] = Depends(get_current_driver),
) -> VehiclesPaginatedResponse:
    result = driver_db.list_driver_vehicles(driver["driver_id"], page=page, limit=limit)
    return VehiclesPaginatedResponse(**result)


@router.post(
    "/vehicles",
    response_model=VehicleSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new vehicle to the driver's garage",
)
async def create_vehicle(
    payload: VehicleCreateRequest,
    driver: Dict[str, Any] = Depends(get_current_driver),
) -> VehicleSchema:
    import re

    # Generate a clean ID if omitted
    v_id = payload.id
    if not v_id:
        slug = re.sub(r"[^a-z0-9]+", "-", f"{payload.make}-{payload.model}".lower()).strip("-")
        v_id = f"{slug}-{int(payload.year)}"

    # Determine default plug image
    plug_img = payload.plug_image
    if not plug_img:
        plug_map = {
            "CCS2 Combo": "/images/plug-ccs2.png",
            "Type 2 (AC)": "/images/plug-type2.png",
            "CHAdeMO": "/images/plug-chademo.png",
            "GB/T DC": "/images/plug-gbt.png",
        }
        plug_img = plug_map.get(payload.plug_type, "/images/plug-ccs2.png")

    v_data = payload.model_dump()
    v_data["id"] = v_id
    v_data["plug_image"] = plug_img
    if not v_data.get("battery_kwh"):
        v_data["battery_kwh"] = v_data["usable_kwh"]

    created = driver_db.create_driver_vehicle(driver["driver_id"], v_data)
    return VehicleSchema(**created)


@router.put("/vehicles/{vehicle_id}", response_model=VehicleSchema, summary="Update vehicle in garage")
async def update_vehicle(
    vehicle_id: str,
    payload: VehicleUpdateRequest,
    driver: Dict[str, Any] = Depends(get_current_driver),
) -> VehicleSchema:
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = driver_db.update_driver_vehicle(driver["driver_id"], vehicle_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Vehicle not found in garage.")
    return VehicleSchema(**updated)


@router.delete("/vehicles/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove vehicle from garage")
async def delete_vehicle(
    vehicle_id: str,
    driver: Dict[str, Any] = Depends(get_current_driver),
):
    success = driver_db.delete_driver_vehicle(driver["driver_id"], vehicle_id)
    if not success:
        raise HTTPException(status_code=404, detail="Vehicle not found in garage.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ── Preferences Endpoints ──────────────────────────────────────────────────────

@router.get("/preferences", response_model=PreferencesResponse, summary="Get driver vehicle & app preferences")
async def get_preferences(
    driver: Dict[str, Any] = Depends(get_current_driver),
) -> PreferencesResponse:
    prefs = driver_db.get_driver_preferences(driver["driver_id"])
    return PreferencesResponse(**prefs)


@router.put("/preferences", response_model=PreferencesResponse, summary="Update driver preferences")
async def update_preferences(
    payload: PreferencesUpdateRequest,
    driver: Dict[str, Any] = Depends(get_current_driver),
) -> PreferencesResponse:
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = driver_db.update_driver_preferences(driver["driver_id"], updates)
    return PreferencesResponse(**updated)


# ── Favourites Endpoints ───────────────────────────────────────────────────────

@router.get("/favourites", response_model=FavouritesResponse, summary="List favourite station IDs")
async def get_favourites(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=100, ge=1, le=200),
    driver: Dict[str, Any] = Depends(get_current_driver),
) -> FavouritesResponse:
    favs = driver_db.list_driver_favourites(driver["driver_id"], page=page, limit=limit)
    return FavouritesResponse(**favs)


@router.post("/favourites/{station_id}", summary="Add station to favourites")
async def add_favourite(
    station_id: str,
    driver: Dict[str, Any] = Depends(get_current_driver),
) -> Dict[str, Any]:
    driver_db.add_driver_favourite(driver["driver_id"], station_id)
    return {"status": "ok", "station_id": station_id, "is_favourite": True}


@router.delete("/favourites/{station_id}", summary="Remove station from favourites")
async def remove_favourite(
    station_id: str,
    driver: Dict[str, Any] = Depends(get_current_driver),
) -> Dict[str, Any]:
    driver_db.remove_driver_favourite(driver["driver_id"], station_id)
    return {"status": "ok", "station_id": station_id, "is_favourite": False}


# ── Station Reports Endpoints ─────────────────────────────────────────────────

@router.get("/reports", response_model=ReportsPaginatedResponse, summary="List station issue reports")
async def get_reports(
    station_id: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    driver: Dict[str, Any] = Depends(get_current_driver),
) -> ReportsPaginatedResponse:
    result = driver_db.list_station_reports(station_id=station_id, page=page, limit=limit)
    return ReportsPaginatedResponse(**result)


@router.post(
    "/reports",
    response_model=StationReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a community station issue report",
)
async def submit_report(
    payload: StationReportCreateRequest,
    driver: Dict[str, Any] = Depends(get_current_driver),
) -> StationReportResponse:
    report = driver_db.create_station_report(driver["driver_id"], payload.model_dump())
    return StationReportResponse(**report)


# ── Charging Sessions Endpoints ───────────────────────────────────────────────

@router.get("/charging-sessions", response_model=SessionsPaginatedResponse, summary="List past charging sessions")
async def get_charging_sessions(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    driver: Dict[str, Any] = Depends(get_current_driver),
) -> SessionsPaginatedResponse:
    result = driver_db.list_charging_sessions(driver["driver_id"], page=page, limit=limit)
    return SessionsPaginatedResponse(**result)


@router.post(
    "/charging-sessions",
    response_model=ChargingSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record completed charging session receipt",
)
async def create_charging_session(
    payload: ChargingSessionCreateRequest,
    driver: Dict[str, Any] = Depends(get_current_driver),
) -> ChargingSessionResponse:
    session = driver_db.record_charging_session(driver["driver_id"], payload.model_dump())
    return ChargingSessionResponse(**session)
