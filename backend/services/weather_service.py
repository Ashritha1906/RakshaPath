import os
import requests
import datetime
from typing import Optional, Dict, Any, List

def fetch_weather_data(lat: Optional[float] = None, lon: Optional[float] = None, city: Optional[str] = None) -> Dict[str, Any]:
    """
    Fetches raw weather data from wttr.in in JSON format.
    If lat and lon are provided, fetches by coordinates.
    Otherwise, if city is provided, fetches by city name.
    Defaults to Hyderabad if neither is provided.
    """
    if lat is not None and lon is not None:
        url = f"https://wttr.in/{lat},{lon}?format=j1"
    elif city:
        import urllib.parse
        encoded_city = urllib.parse.quote(city)
        url = f"https://wttr.in/{encoded_city}?format=j1"
    else:
        url = "https://wttr.in/Hyderabad?format=j1"

    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Error fetching weather data from wttr.in: {e}")
    
    # Return a mocked fallback wttr.in JSON structure if fetch fails
    return {
        "current_condition": [
            {
                "temp_C": "30",
                "humidity": "50",
                "visibility": "10",
                "windspeedKmph": "10",
                "weatherDesc": [{"value": "Clear"}],
                "weatherCode": "113"
            }
        ],
        "nearest_area": [
            {
                "areaName": [{"value": city or "Hyderabad"}]
            }
        ],
        "weather": [
            {
                "hourly": [
                    {
                        "time": "1200",
                        "chanceofrain": "0"
                    }
                ]
            }
        ]
    }

def parse_weather_condition(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parses wttr.in JSON data and extracts:
    - temperature
    - humidity
    - visibility
    - wind speed
    - weather description
    - chance of rain
    """
    if not data or "current_condition" not in data:
        # Return sensible defaults if data is missing or query failed
        return {
            "city": "Hyderabad",
            "temperature": 30.0,
            "humidity": 50.0,
            "visibility": 10.0,
            "wind_speed": 10.0,
            "description": "Clear",
            "chance_of_rain": 0.0,
            "error": "Failed to fetch weather data. Displaying fallback info."
        }

    # Extract current condition fields
    current = data["current_condition"][0]
    
    # Resolve city name from nearest_area if available
    resolved_city = "Hyderabad"
    if "nearest_area" in data and len(data["nearest_area"]) > 0:
        area = data["nearest_area"][0]
        if "areaName" in area and len(area["areaName"]) > 0:
            resolved_city = area["areaName"][0]["value"]

    # Current condition fields are usually strings in wttr.in format=j1
    temperature = float(current.get("temp_C", 30))
    humidity = float(current.get("humidity", 50))
    visibility = float(current.get("visibility", 10))
    wind_speed = float(current.get("windspeedKmph", 10))
    
    description = "Clear"
    if "weatherDesc" in current and len(current["weatherDesc"]) > 0:
        description = current["weatherDesc"][0]["value"].strip()

    # chance of rain is inside daily weather -> hourly
    chance_of_rain = 0.0
    if "weather" in data and len(data["weather"]) > 0:
        # Get hourly forecasts for today
        hourly = data["weather"][0].get("hourly", [])
        if hourly:
            # Find the hourly block closest to current local hour
            now = datetime.datetime.now()
            current_time_val = now.hour * 100 + now.minute
            
            closest_block = hourly[0]
            min_diff = 2400
            for block in hourly:
                try:
                    block_time = int(block.get("time", 0))
                    diff = abs(block_time - current_time_val)
                    if diff < min_diff:
                        min_diff = diff
                        closest_block = block
                except ValueError:
                    continue
            
            chance_of_rain = float(closest_block.get("chanceofrain", 0))

    return {
        "city": resolved_city,
        "temperature": temperature,
        "humidity": humidity,
        "visibility": visibility,
        "wind_speed": wind_speed,
        "description": description,
        "chance_of_rain": chance_of_rain
    }

def calculate_weather_risk(weather_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates weather risk score and maps condition to category/warning
    """
    desc = weather_info["description"].lower()
    visibility = weather_info["visibility"]
    wind_speed = weather_info["wind_speed"]
    chance_of_rain = weather_info["chance_of_rain"]
    
    risk_score = 5
    risk_category = "Safe"
    reason = "Clear sky."

    # 1. Thunderstorm (Risk = 50)
    if any(x in desc for x in ["thunder", "storm", "lightning"]):
        risk_score = 50
        risk_category = "Dangerous"
        reason = "Thunderstorm warning issued."
        
    # 2. Very Low Visibility (Risk = 40)
    elif visibility <= 3.0: # 3 km or less
        risk_score = 40
        risk_category = "Dangerous"
        reason = "Low visibility reported."
        
    # 3. Heavy Rain (Risk = 35)
    elif any(x in desc for x in ["heavy rain", "torrential", "heavy shower", "monsoon"]) or (chance_of_rain >= 70 and "rain" in desc):
        risk_score = 35
        risk_category = "Dangerous"
        reason = "Heavy rainfall detected ahead."
        
    # 4. Fog (Risk = 30)
    elif any(x in desc for x in ["fog", "mist", "haze"]):
        risk_score = 30
        risk_category = "Moderate"
        reason = "Low visibility reported."
        
    # 5. High Wind (Risk = 25)
    elif wind_speed >= 25.0: # km/h
        risk_score = 25
        risk_category = "Moderate"
        reason = "High wind conditions detected."
        
    # 6. Light Rain (Risk = 20)
    elif any(x in desc for x in ["rain", "drizzle", "shower", "patchy rain", "sleet"]):
        risk_score = 20
        risk_category = "Moderate"
        reason = "Light rainfall detected."
        
    # 7. Cloudy (Risk = 10)
    elif any(x in desc for x in ["cloudy", "overcast", "cloud"]):
        risk_score = 10
        risk_category = "Safe"
        reason = "Cloudy conditions."
        
    # 8. Clear Sky / Default (Risk = 5)
    else:
        risk_score = 5
        risk_category = "Safe"
        reason = "Clear sky."

    return {
        "risk_score": risk_score,
        "risk_category": risk_category,
        "reason": reason
    }

def get_weather_alerts(weather_info: Dict[str, Any], risk_info: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generates structured active alerts based on weather data and risk score.
    """
    alerts = []
    desc_lower = weather_info["description"].lower()
    
    if any(x in desc_lower for x in ["thunder", "storm", "lightning"]):
        alerts.append({
            "type": "thunderstorm",
            "title": "Thunderstorm Warning",
            "message": "Thunderstorm warning issued. Lightning and high wind danger.",
            "severity": "High",
            "suggested_actions": ["Seek shelter in a sturdy building", "Avoid outdoor activities", "Stay away from open windows"]
        })
        
    if weather_info["visibility"] <= 3.0 or any(x in desc_lower for x in ["fog", "mist"]):
        alerts.append({
            "type": "low_visibility",
            "title": "Low Visibility Warning",
            "message": "Low visibility reported. Fog or heavy mist blocking sight.",
            "severity": "Medium" if weather_info["visibility"] > 1.0 else "High",
            "suggested_actions": ["Reduce driving speed", "Turn on low-beam headlights", "Maintain extra distance from other vehicles"]
        })
        
    if any(x in desc_lower for x in ["heavy rain", "torrential", "heavy shower", "monsoon"]):
        alerts.append({
            "type": "heavy_rain",
            "title": "Heavy Rain Alert",
            "message": "Heavy rainfall detected ahead. Potential localized flooding.",
            "severity": "High",
            "suggested_actions": ["Avoid waterlogged subways and low areas", "Drive with caution", "Suggest alternative routes"]
        })
        
    if weather_info["wind_speed"] >= 25.0:
        alerts.append({
            "type": "high_wind",
            "title": "High Wind Warning",
            "message": "High wind conditions detected. Wind speed exceeds 25 km/h.",
            "severity": "Medium",
            "suggested_actions": ["Watch for flying debris", "Keep both hands on steering wheel", "Avoid parking under trees or power lines"]
        })
        
    if len(alerts) == 0 and risk_info["risk_score"] > 15:
        alerts.append({
            "type": "weather_hazard",
            "title": "Weather Hazard Alert",
            "message": risk_info["reason"],
            "severity": "Medium",
            "suggested_actions": ["Proceed with caution", "Stay updated on weather feeds"]
        })
        
    return alerts
