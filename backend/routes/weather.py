from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from services.weather_service import fetch_weather_data, parse_weather_condition, calculate_weather_risk, get_weather_alerts

router = APIRouter(prefix="/api/weather", tags=["weather"])

@router.get("/current")
def get_current_weather(
    city: Optional[str] = Query(None, description="City name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude")
):
    raw_data = fetch_weather_data(lat=lat, lon=lon, city=city)
    if not raw_data:
        raise HTTPException(status_code=502, detail="Failed to fetch weather data from wttr.in")
    return parse_weather_condition(raw_data)

@router.get("/risk")
def get_weather_risk(
    city: Optional[str] = Query(None, description="City name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude")
):
    raw_data = fetch_weather_data(lat=lat, lon=lon, city=city)
    if not raw_data:
        raise HTTPException(status_code=502, detail="Failed to fetch weather data from wttr.in")
    weather_info = parse_weather_condition(raw_data)
    return calculate_weather_risk(weather_info)

@router.get("/alerts")
def get_active_alerts(
    city: Optional[str] = Query(None, description="City name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude")
):
    raw_data = fetch_weather_data(lat=lat, lon=lon, city=city)
    if not raw_data:
        raise HTTPException(status_code=502, detail="Failed to fetch weather data from wttr.in")
    weather_info = parse_weather_condition(raw_data)
    risk_info = calculate_weather_risk(weather_info)
    return get_weather_alerts(weather_info, risk_info)
