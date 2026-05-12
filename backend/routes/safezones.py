from fastapi import APIRouter, Query
import requests

router = APIRouter()

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def fetch_places(lat, lon, amenity_regex, radius=3000):
    print(f"DEBUG: Fetching {amenity_regex} for lat={lat}, lon={lon} with radius {radius}m")
    
    # Radius is 3km by default to ensure only 'nearby' places are shown
    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"~"{amenity_regex}"](around:{radius},{lat},{lon});
      way["amenity"~"{amenity_regex}"](around:{radius},{lat},{lon});
      rel["amenity"~"{amenity_regex}"](around:{radius},{lat},{lon});
    );
    out center;
    """

    try:
        headers = {"User-Agent": "RakshaPathSafetyApp/1.0"}
        response = requests.post(OVERPASS_URL, data=query, timeout=10, headers=headers)
        if response.status_code != 200:
            return []
        data = response.json()
    except Exception as e:
        print(f"DEBUG: Overpass Request Failed: {e}")
        return []
        
    places = []
    for element in data.get("elements", []):
        lat_val = element.get("lat") or element.get("center", {}).get("lat")
        lon_val = element.get("lon") or element.get("center", {}).get("lon")
        
        if lat_val and lon_val:
            amenity = element.get("tags", {}).get("amenity", "facility")
            places.append({
                "name": element.get("tags", {}).get("name", f"Unnamed {amenity}"),
                "lat": lat_val,
                "lon": lon_val,
                "type": amenity
            })

    return places

@router.get("/safezones")
def get_safezones(
    lat: float = Query(...),
    lon: float = Query(...),
    is_route: bool = Query(False)
):
    # If it's for a route destination or navigation, we use a tighter radius (2km)
    # If it's a general discovery, we use 3km
    search_radius = 2000 if is_route else 3000
    
    hospitals = fetch_places(lat, lon, "hospital|clinic|doctors", radius=search_radius)
    police = fetch_places(lat, lon, "police|police_station", radius=search_radius)
    pharmacies = fetch_places(lat, lon, "pharmacy", radius=search_radius)

    return {
        "hospitals": hospitals,
        "police_stations": police,
        "pharmacies": pharmacies
    }
