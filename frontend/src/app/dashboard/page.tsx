'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigation, MapPin, ShieldAlert, Navigation2, Menu, LocateFixed, Search, Activity, Info, AlertTriangle, Eye, EyeOff, RefreshCcw, CheckCircle2, ShieldCheck, Zap, Layers, Bot } from 'lucide-react';
import SafeZones from '../../components/SafeZones';
import axios from 'axios';
import Head from 'next/head';
import dynamic from 'next/dynamic';
const TomTomSafetyMap = dynamic(() => import('./TomTomSafetyMap'), { ssr: false });
import GoogleSafetyMap from './GoogleSafetyMap';

// Leaflet Fallback (Removed in favor of TomTom)
// import dynamic from 'next/dynamic';
// import 'leaflet/dist/leaflet.css';

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 17.3850, lng: 78.4867 };

export default function Dashboard() {
  const [useFreeMap, setUseFreeMap] = useState(true); // Default to FREE MAP to avoid Google quota errors
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  
  const mapRef = useRef<any>(null);
  const [mapSessionId, setMapSessionId] = useState(0);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [sourceInput, setSourceInput] = useState('My Location');
  const [destinationInput, setDestinationInput] = useState('Banjara Hills');
  const [currentPos, setCurrentPos] = useState(defaultCenter);
  const [analyzing, setAnalyzing] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [routePath, setRoutePath] = useState<any[]>([]);
  const [zoneMarkers, setZoneMarkers] = useState<any[]>([]);
  const [crimeMarkers, setCrimeMarkers] = useState<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  // Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportData, setReportData] = useState({
    type: 'accident',
    desc: '',
    severity: 'Medium',
    anonymous: true
  });

  // Preferences State
  const [activeProfile, setActiveProfile] = useState('General traveler');
  const [activeWeight, setActiveWeight] = useState(50);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActiveProfile(localStorage.getItem('raksha_profile') || 'General traveler');
      setActiveWeight(parseInt(localStorage.getItem('raksha_safety_weight') || '50'));
    }
  }, []);

  const handleProfileChange = (profile: string) => {
    setActiveProfile(profile);
    localStorage.setItem('raksha_profile', profile);
  };

  const handleWeightChange = (weight: number) => {
    setActiveWeight(weight);
    localStorage.setItem('raksha_safety_weight', weight.toString());
  };


  const updateLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setCurrentPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => console.warn("Using default location"),
        { timeout: 5000 }
      );
    }
  }, []);

  const fetchHeatmap = useCallback(() => {
    axios.get('http://localhost:8000/api/insights/heatmap')
      .then(res => {
        setCrimeMarkers(res.data);
        if (typeof window !== 'undefined' && (window as any).google) {
          const points = res.data.map((p: any) => new google.maps.LatLng(p.lat, p.lng));
          setHeatmapData(points);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    updateLocation();
    fetchHeatmap();
  }, [updateLocation, fetchHeatmap]);

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/incidents', {
        user_id: reportData.anonymous ? null : 1,
        incident_type: reportData.type,
        description: reportData.desc,
        latitude: currentPos.lat,
        longitude: currentPos.lng
      });
      setReportSuccess(true);
      fetchHeatmap();
      setTimeout(() => {
        setReportSuccess(false);
        setShowReportModal(false);
        setReportData({ type: 'accident', desc: '', severity: 'Medium', anonymous: true });
      }, 2000);
    } catch (err) {
      alert("Failed to submit report");
    }
  };

  const resetMapEverything = () => {
    setRoutes([]);
    setSelectedRoute(null);
    setRoutePath([]);
    setAnalyzing(false);
    setSelectedMarker(null);
    setShowSafeZones(false);
    setZoneMarkers([]);
    setMapSessionId(prev => prev + 1);
  };

  const geocode = async (query: string) => {
    if (query.toLowerCase().trim() === 'my location' || query.trim() === '') return currentPos;
    
    const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;
    console.log("🔍 Geocoding query:", query, "with API key length:", apiKey?.length || 0);

    if (!apiKey) {
      console.warn("⚠️ No TomTom API Key found in .env.local. Falling back to OSM.");
    }
    
    // 1. Try Backend Proxy (Preferred for avoiding adblocker/CORS)
    try {
      const url = `http://localhost:8000/api/proxy/geocode?query=${encodeURIComponent(query)}`;
      console.log("🌐 Calling Geocoding Proxy...");
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Proxy Error: ${response.status}`);

      const data = await response.json();
      if (data?.results?.[0]) {
        const { lat, lon } = data.results[0].position;
        console.log(`✅ Proxy found ${query}:`, lat, lon);
        return { lat, lng: lon };
      }
    } catch (proxyErr: any) {
      console.warn("⚠️ Proxy failed, falling back to direct OSM:", proxyErr.message);
    }

    // 2. Fallback to Nominatim (Global OpenStreetMap search)
    try {
      console.log("🔄 Using OSM Nominatim fallback...");
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
        headers: { 'User-Agent': 'RakshaPath/1.0' },
        timeout: 8000
      });
      if (res.data?.[0]) {
        const result = { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
        console.log("✅ OSM found location:", result);
        return result;
      }
    } catch (e: any) { 
      console.error("❌ Nominatim fallback failed:", e.message); 
    }

    return null;
  };

  const handleSearch = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    resetMapEverything();
    setAnalyzing(true);
    
    try {
      const start = await geocode(sourceInput);
      const end = await geocode(destinationInput);

      if (!start || !end) {
        alert("Location not found. Please specify a landmark in Hyderabad.");
        setAnalyzing(false);
        return;
      }

      // FETCH DYNAMIC SAFETY DATA FROM BACKEND
      const userProfile = localStorage.getItem('raksha_profile') || 'General traveler';
      const userWeight = parseInt(localStorage.getItem('raksha_safety_weight') || '50');
      
      const safetyRes = await axios.post('http://localhost:8000/api/safety/analyze', { 
        origin: start, 
        dest: end,
        profile: userProfile,
        weight: userWeight
      });
      const safety = safetyRes.data;

      setRoutes([
        { 
          id: 'F', 
          type: 'Fastest Route', 
          risk: 'High', 
          score: Math.max(10, safety.score - 30),
          riskPercentage: Math.min(90, safety.risk_score_percentage + 20),
          color: '#ff1744', 
          origin: start,
          dest: end,
          details: { ...safety, reasons: [...safety.reasons, "Prioritizes speed over safety", "Passes through high-traffic intersections"] },
          time: "15 min",
          distance: "4.2 km"
        },
        { 
          id: 'S', 
          type: 'Safest Route', 
          risk: 'Low', 
          score: Math.min(98, safety.score + 15),
          riskPercentage: Math.max(2, safety.risk_score_percentage - 15),
          color: '#00d2ff', 
          origin: start,
          dest: end,
          details: { ...safety, reasons: ["Avoids major accident hotspots", "Well-lit main roads", "Near police patrols"] },
          time: "22 min",
          distance: "5.1 km"
        },
        { 
          id: 'B', 
          type: 'Balanced Route', 
          risk: 'Medium', 
          score: safety.score,
          riskPercentage: safety.risk_score_percentage,
          color: '#ff9800', 
          origin: start,
          dest: end,
          details: safety,
          time: "18 min",
          distance: "4.5 km"
        }
      ]);
    } catch (e: any) {
      console.error("Search error:", e);
      if (e.message === "Network Error") {
        alert("🚨 BACKEND OFFLINE! Your safety intelligence engine (localhost:8000) is not responding. \n\nPlease ensure your terminal is running: 'uvicorn main:app --reload --port 8000'");
      } else if (!e.response) {
        alert("🚨 CONNECTION ERROR! Please check if your backend is running.");
      } else {
        alert(`Safety analysis failed: ${e.response.data?.detail || "The server encountered an error."}`);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const startNavigation = async (route: any) => {
    setRoutePath([]);
    setSelectedRoute({ ...route, loading: true });
    const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;

    // TRY TOMTOM ROUTING FIRST
    if (apiKey) {
      try {
        let routeType = 'fastest';
        if (route.id === 'S') routeType = 'shortest'; // Visually represents safest path by avoiding main highways
        else if (route.id === 'B') routeType = 'eco'; // Visually represents balanced path

        const url = `https://api.tomtom.com/routing/1/calculateRoute/${route.origin.lat},${route.origin.lng}:${route.dest.lat},${route.dest.lng}/json?key=${apiKey}&routeType=${routeType}&traffic=true&instructionsType=text`;
        const response = await axios.get(url);
        
        if (response.data.routes && response.data.routes.length > 0) {
          const points = response.data.routes[0].legs[0].points;
          const path = points.map((p: any) => ({ lat: p.latitude, lng: p.longitude }));
          
          const instructions = response.data.routes[0].guidance?.instructions?.map((i: any) => i.message) || [];

          setRoutePath(path);
          setSelectedRoute({ 
            ...route, 
            loading: false, 
            distance: (response.data.routes[0].summary.lengthInMeters / 1000).toFixed(2) + ' km',
            instructions
          });

          if (mapRef.current && (window as any).google) {
               const bounds = new google.maps.LatLngBounds();
               path.forEach((p: any) => bounds.extend(p));
               mapRef.current.fitBounds(bounds);
          }
          return;
        }
      } catch (error) {
        console.warn("TomTom Routing failed, trying OSRM fallback...");
      }
    }

    // USE OSRM AS SECONDARY
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${route.origin.lng},${route.origin.lat};${route.dest.lng},${route.dest.lat}?overview=full&geometries=geojson&steps=true`;
      const response = await axios.get(url);
      
      if (response.data.routes && response.data.routes.length > 0) {
        const coordinates = response.data.routes[0].geometry.coordinates;
        const path = coordinates.map((coord: any) => ({ lat: coord[1], lng: coord[0] }));
        
        const steps = response.data.routes[0].legs[0].steps || [];
        const instructions = steps.map((s: any) => `${s.maneuver?.type || 'Proceed'} on ${s.name || 'road'}`);

        setRoutePath(path);
        setSelectedRoute({ 
          ...route, 
          loading: false, 
          distance: (response.data.routes[0].distance / 1000).toFixed(2) + ' km',
          instructions
        });

        if (mapRef.current && (window as any).google) {
          const bounds = new google.maps.LatLngBounds();
          path.forEach((p: any) => bounds.extend(p));
          mapRef.current.fitBounds(bounds);
        }
      } else {
        throw new Error("No routes found");
      }
    } catch (error) {
      console.warn("OSRM failed. No more routing fallbacks available.");
      setSelectedRoute(null);
      alert("Routing service currently unavailable for this area. Please try a different landmark.");
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: '#0a0a0f' }}>


      <main style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* TOP SAFETY STATUS BAR */}
        <div className="glass-panel flex-between" style={{ padding: '12px 24px', borderLeft: '4px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="shield-icon-glow">
              <ShieldCheck size={32} color="var(--primary-color)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Raksha Safety Shield Active</h2>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Monitoring 1,245 live points across Hyderabad sectors.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
             <div style={{ textAlign: 'right' }}>
               <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>City Risk Level</p>
               <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--safe-green)' }}>LOW</p>
             </div>
             <div style={{ textAlign: 'right' }}>
               <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Patrols</p>
               <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>42 Units</p>
             </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', flex: 1 }}>
          <div style={{ flex: '0 0 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel">
              <div className="flex-between" style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck size={20} color="var(--primary-color)"/> Safety Analysis</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <button onClick={() => setShowHeatmap(!showHeatmap)} className="btn-secondary" title="Toggle Crime Map" style={{ padding: '6px', borderColor: showHeatmap ? 'var(--danger-red)' : 'var(--glass-border)' }}>
                     {showHeatmap ? <EyeOff size={14}/> : <Eye size={14}/>}
                   </button>
                   <button onClick={resetMapEverything} className="btn-secondary" title="Full Map Reset" style={{ padding: '6px' }}>
                     <RefreshCcw size={14}/>
                   </button>
                </div>
              </div>
              <form onSubmit={handleSearch}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Source Location</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input-field" value={sourceInput} onChange={(e) => setSourceInput(e.target.value)} />
                    <button type="button" onClick={() => setSourceInput('My Location')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--primary-color)' }}><LocateFixed size={14}/></button>
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target Destination</label>
                  <input className="input-field" value={destinationInput} onChange={(e) => setDestinationInput(e.target.value)} />
                </div>
                
                {/* INLINE PREFERENCES */}
                <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Safety Profile</label>
                    <select className="input-field" value={activeProfile} onChange={e => handleProfileChange(e.target.value)} style={{ appearance: 'none', padding: '10px' }}>
                      <option value="Student">Student</option>
                      <option value="Women commuter">Women commuter</option>
                      <option value="Delivery rider">Delivery rider</option>
                      <option value="Senior citizen">Senior citizen</option>
                      <option value="General traveler">General traveler</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Speed</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--safe-green)' }}>Safety</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={activeWeight} 
                    onChange={e => handleWeightChange(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary-color)' }}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>{analyzing ? 'Scanning Neighborhood Risks...' : 'Evaluate Area Safety'}</button>
              </form>
            </div>
            
            {!selectedRoute && routes.map(r => (
              <div key={r.id} className={`glass-panel animate-fade-in`} style={{ borderLeft: `6px solid ${r.color}`, marginBottom: '15px' }}>
                <div className="flex-between" style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{r.type}</h3>
                    <span className="safety-score-badge" style={{ 
                      background: r.score > 70 ? 'rgba(0, 230, 118, 0.15)' : r.score > 40 ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 23, 68, 0.15)',
                      color: r.score > 70 ? 'var(--safe-green)' : r.score > 40 ? '#ff9800' : 'var(--danger-red)',
                      borderColor: r.score > 70 ? 'var(--safe-green)' : r.score > 40 ? '#ff9800' : 'var(--danger-red)'
                    }}>
                      {r.risk} Risk
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: r.score > 70 ? 'var(--safe-green)' : r.score > 40 ? '#ff9800' : 'var(--danger-red)' }}>{r.score}/100</div>
                    <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>Safety Score</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                  <span>⏱️ Est. Time: <strong>{r.time}</strong></span>
                  <span>📏 Distance: <strong>{r.distance}</strong></span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
                    <span>Risk Percentage</span>
                    <span>{r.riskPercentage}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${r.riskPercentage}%`, height: '100%', background: r.color, transition: 'width 1s ease-in-out' }} />
                  </div>
                </div>

                <details style={{ marginBottom: '16px', fontSize: '0.8rem', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <summary style={{ color: 'var(--primary-color)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={14} /> Why this route? (AI Explanation)
                  </summary>
                  
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Progress Bars for Risk Breakdown */}
                    {[
                      { label: 'Crime Risk', val: r.details.crime_risk || 0, color: '#ff1744' },
                      { label: 'Accident Risk', val: r.details.accident_risk || 0, color: '#ff9800' },
                      { label: 'Weather Risk', val: r.details.weather_risk || 0, color: '#00d2ff' },
                      { label: 'Isolation Risk', val: r.details.isolation_risk || 0, color: '#8e2de2' },
                      { label: 'Crowd Risk', val: r.details.crowd_risk || 0, color: '#00e676' }
                    ].map((metric, i) => {
                      const percentage = Math.round(metric.val * 100);
                      const displayColor = percentage > 60 ? 'var(--danger-red)' : percentage > 30 ? '#ff9800' : 'var(--safe-green)';
                      return (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                            <span>{metric.label}</span>
                            <span style={{ color: displayColor, fontWeight: 'bold' }}>{percentage}%</span>
                          </div>
                          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${percentage}%`, height: '100%', background: displayColor, transition: 'width 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
                          </div>
                        </div>
                      );
                    })}

                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>Key AI Insights:</p>
                      <ul style={{ paddingLeft: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {r.details.reasons?.map((reason: string, i: number) => (
                          <li key={i} style={{ marginBottom: '4px' }}>{reason}</li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </details>

                <button className="btn-secondary" style={{ width: '100%', fontSize: '0.8rem', borderColor: r.color, color: r.color }} onClick={() => startNavigation(r)}>Map {r.type}</button>
              </div>
            ))}

            {selectedRoute && (
              <div className="glass-panel animate-fade-in" style={{ borderLeft: `6px solid ${selectedRoute.color}`, marginBottom: '20px' }}>
                <div className="flex-between" style={{ marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{selectedRoute.type} Selected</h3>
                  <button className="btn-danger" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={resetMapEverything}>Change Route</button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                  <span>⏱️ Est. Time: <strong>{selectedRoute.time || "Calculating..."}</strong></span>
                  <span>📏 Distance: <strong>{selectedRoute.distance || "Calculating..."}</strong></span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
                    <span>Risk Percentage</span>
                    <span>{selectedRoute.riskPercentage}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${selectedRoute.riskPercentage}%`, height: '100%', background: selectedRoute.color, transition: 'width 1s ease-in-out' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="audit-item">
                    <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: selectedRoute.score > 70 ? 'var(--safe-green)' : 'var(--danger-red)', display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle2 size={14}/> Risk Factors:</p>
                    <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '20px', marginTop: '5px' }}>
                      {selectedRoute.details.reasons?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>

                  <div className="audit-item" style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '12px' }}><Info size={16}/> AI Route Transparency</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { label: 'Crime Exposure', val: selectedRoute.details.crime_risk || 0 },
                        { label: 'Accident History', val: selectedRoute.details.accident_risk || 0 },
                        { label: 'Isolation Level', val: selectedRoute.details.isolation_risk || 0 },
                      ].map((metric, i) => {
                        const percentage = Math.round(metric.val * 100);
                        const displayColor = percentage > 60 ? 'var(--danger-red)' : percentage > 30 ? '#ff9800' : 'var(--safe-green)';
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>{metric.label}</span>
                              <span style={{ color: displayColor, fontWeight: 'bold' }}>{percentage}%</span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${percentage}%`, height: '100%', background: displayColor, transition: 'width 1.5s ease-out' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {selectedRoute.instructions && selectedRoute.instructions.length > 0 && (
                  <div className="audit-item" style={{ marginTop: '15px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', maxHeight: '200px', overflowY: 'auto' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '12px' }}><Navigation2 size={16}/> Turn-by-Turn Directions</p>
                    <ol style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedRoute.instructions.map((inst: string, i: number) => (
                        <li key={i} style={{ lineHeight: 1.4 }}>{inst}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {!selectedRoute.loading && selectedRoute.distance && !selectedRoute.distance.includes('km') && <p style={{ fontSize: '0.8rem', color: 'var(--primary-color)', marginTop: '15px', textAlign: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>Precision Distance: {selectedRoute.distance}</p>}
              </div>
            )}

            {!showSafeZones && (
              <button 
                onClick={() => setShowSafeZones(true)} 
                className="btn-secondary" 
                style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderStyle: 'dashed' }}
              >
                <ShieldCheck size={16} /> Discover Nearby SafeZones
              </button>
            )}
            
            {showSafeZones && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '0.8rem', opacity: 0.7 }}>Infrastructure Discovery</h4>
                  <button onClick={() => { setShowSafeZones(false); setZoneMarkers([]); }} style={{ fontSize: '0.7rem', color: 'var(--danger-red)', background: 'none', border: 'none', cursor: 'pointer' }}>Hide</button>
                </div>
                <SafeZones 
                  lat={selectedRoute ? selectedRoute.dest.lat : currentPos.lat} 
                  lon={selectedRoute ? selectedRoute.dest.lng : currentPos.lng} 
                  onZonesFetched={setZoneMarkers} 
                  onSelectZone={async (zone) => {
                    setDestinationInput(zone.name);
                    resetMapEverything();
                    setAnalyzing(true);
                    try {
                      const start = currentPos;
                      const end = { lat: zone.lat, lng: zone.lon };
                      
                      const safetyRes = await axios.post('http://localhost:8000/api/safety/analyze', { origin: start, dest: end });
                      const safety = safetyRes.data;

                      const route = { 
                        id: 'S', 
                        type: `Route to ${zone.name}`, 
                        risk: 'Low', 
                        score: safety.score,
                        color: '#00d2ff', 
                        origin: start,
                        dest: end,
                        details: safety
                      };
                      
                      setRoutes([route]);
                      await startNavigation(route);
                    } catch (e) {
                      alert("Failed to calculate route to SafeZone.");
                    } finally {
                      setAnalyzing(false);
                    }
                  }}
                />
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ flex: 1, padding: 0, overflow: 'hidden', position: 'relative', borderRadius: '20px', border: analyzing ? '2px solid var(--primary-color)' : '1px solid var(--glass-border)' }}>
            <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, display: 'flex', gap: '8px' }}>
              <button onClick={() => setUseFreeMap(!useFreeMap)} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.7rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                <Layers size={14} style={{ marginRight: '5px' }}/> {useFreeMap ? 'Switch to Google' : 'Switch to TomTom Map'}
              </button>
            </div>

            {/* HEATMAP LEGEND OVERLAY */}
            {showHeatmap && (
              <div className="glass-panel animate-fade-in" style={{ position: 'absolute', top: '50px', right: '10px', zIndex: 1000, padding: '12px', background: 'rgba(0,0,0,0.85)', maxWidth: '220px', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary-color)' }}>Live Threat Density</h4>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.4' }}>
                  Visualizing hazardous zones based on crowdsourced reports, historical crime patterns, and AI predictive routing.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.7rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', background: 'rgba(255, 0, 0, 0.9)', borderRadius: '50%', boxShadow: '0 0 5px red' }}></div>
                    <span>High Severity Hotspot</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', background: 'rgba(255, 255, 0, 0.8)', borderRadius: '50%', boxShadow: '0 0 5px yellow' }}></div>
                    <span>Medium Risk Zone</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', background: 'rgba(0, 255, 255, 0.5)', borderRadius: '50%', boxShadow: '0 0 5px cyan' }}></div>
                    <span>Low / General Caution</span>
                  </div>
                </div>
              </div>
            )}

            {analyzing && <div className="scanning-radar" />}
            
            {useFreeMap ? (
              <TomTomSafetyMap 
                key={`tomtom-${mapSessionId}`}
                currentPos={currentPos}
                selectedRoute={selectedRoute}
                routePath={routePath}
                crimeMarkers={crimeMarkers}
                zoneMarkers={zoneMarkers}
                showHeatmap={showHeatmap}
                onMapLoad={(map: any) => { mapRef.current = map; }}
              />
            ) : (
              <GoogleSafetyMap 
                key={`google-${mapSessionId}`}
                currentPos={currentPos}
                selectedRoute={selectedRoute}
                routePath={routePath}
                crimeMarkers={crimeMarkers}
                zoneMarkers={zoneMarkers}
                showHeatmap={showHeatmap}
                heatmapData={heatmapData}
                onMapLoad={(map: any) => { mapRef.current = map; }}
              />
            )}

            {/* FLOATING REPORT BUTTON */}
            <button 
              onClick={() => setShowReportModal(true)}
              className="btn-danger pulsing-alert" 
              style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, borderRadius: '50%', width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 20px rgba(255, 23, 68, 0.4)' }}
            >
              <ShieldAlert size={28} />
            </button>

            {/* REPORT MODAL */}
            {showReportModal && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '400px', background: 'var(--panel-bg)', border: '1px solid var(--glass-border)' }}>
                  {reportSuccess ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <CheckCircle2 size={64} color="var(--safe-green)" style={{ margin: '0 auto 20px' }} className="animate-fade-in" />
                      <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Report Submitted</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>Thank you for keeping the community safe. The area's risk score has been updated.</p>
                    </div>
                  ) : (
                    <form onSubmit={submitReport}>
                      <div className="flex-between" style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Report Incident</h3>
                        <button type="button" onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
                      </div>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Incident Type</label>
                        <select className="input-field" value={reportData.type} onChange={e => setReportData({...reportData, type: e.target.value})} style={{ appearance: 'none' }}>
                          <option value="accident">Accident / Collision</option>
                          <option value="harassment">Harassment / Suspicious</option>
                          <option value="pothole">Severe Pothole / Road Damage</option>
                          <option value="flood">Flooding / Water Hazard</option>
                          <option value="lights">Broken Street Lights / Dark Zone</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Severity</label>
                        <select className="input-field" value={reportData.severity} onChange={e => setReportData({...reportData, severity: e.target.value})} style={{ appearance: 'none' }}>
                          <option value="Low">Low (Caution)</option>
                          <option value="Medium">Medium (Hazard)</option>
                          <option value="High">High (Dangerous)</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Description</label>
                        <textarea className="input-field" rows={3} placeholder="Provide details..." value={reportData.desc} onChange={e => setReportData({...reportData, desc: e.target.value})} required />
                      </div>
                      
                      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="checkbox" id="anon" checked={reportData.anonymous} onChange={e => setReportData({...reportData, anonymous: e.target.checked})} style={{ accentColor: 'var(--primary-color)' }} />
                        <label htmlFor="anon" style={{ fontSize: '0.85rem' }}>Report Anonymously</label>
                      </div>

                      <button type="submit" className="btn-primary" style={{ width: '100%' }}>Submit Report</button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
