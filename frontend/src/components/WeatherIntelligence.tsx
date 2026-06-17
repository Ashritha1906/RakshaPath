'use client';

import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudLightning, Wind, Eye, Droplets, Thermometer, AlertTriangle, ShieldCheck, ShieldAlert, BarChart3, CloudFog, AlertOctagon } from 'lucide-react';
import axios from 'axios';

// Icon Helper based on weather description
export function getWeatherIcon(desc: string = '', size: number = 24, className: string = '') {
  const d = String(desc).toLowerCase();
  if (d.includes('thunder') || d.includes('storm')) {
    return <CloudLightning size={size} className={`text-danger-red animate-pulse ${className}`} style={{ color: 'var(--danger-red)' }} />;
  }
  if (d.includes('heavy rain') || d.includes('torrential') || d.includes('downpour')) {
    return <CloudRain size={size} className={`text-danger-red ${className}`} style={{ color: 'var(--danger-red)' }} />;
  }
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower') || d.includes('patchy')) {
    return <CloudRain size={size} className={`text-warn-yellow ${className}`} style={{ color: 'var(--warning-orange)' }} />;
  }
  if (d.includes('fog') || d.includes('mist') || d.includes('haze')) {
    return <CloudFog size={size} className={`${className}`} style={{ color: '#e2e8f0' }} />;
  }
  if (d.includes('cloud') || d.includes('overcast')) {
    return <Cloud size={size} className={`${className}`} style={{ color: '#cbd5e1' }} />;
  }
  // Default Sunny / Clear
  return <Thermometer size={size} className={`text-primary-color ${className}`} style={{ color: 'var(--primary-color)' }} />;
}

// Color helper based on risk level
export function getRiskColor(category: string = 'Safe') {
  const cat = String(category).toLowerCase();
  if (cat === 'dangerous' || cat === 'high' || cat === 'red') {
    return {
      bg: 'rgba(255, 23, 68, 0.15)',
      border: '1px solid var(--danger-red)',
      text: 'var(--danger-red)',
      shadow: '0 0 15px rgba(255, 23, 68, 0.3)'
    };
  }
  if (cat === 'moderate' || cat === 'medium' || cat === 'yellow') {
    return {
      bg: 'rgba(255, 152, 0, 0.15)',
      border: '1px solid var(--warning-orange)',
      text: 'var(--warning-orange)',
      shadow: '0 0 15px rgba(255, 152, 0, 0.3)'
    };
  }
  // Safe
  return {
    bg: 'rgba(0, 230, 118, 0.15)',
    border: '1px solid var(--safe-green)',
    text: 'var(--safe-green)',
    shadow: '0 0 15px rgba(0, 230, 118, 0.2)'
  };
}

// 1. WeatherCard Component
interface WeatherCardProps {
  weather?: {
    temperature: number;
    humidity: number;
    visibility: number;
    windspeed: number;
    description: string;
    chanceofrain: number;
    risk: number;
    risk_category: string;
    reason: string;
    city?: string;
  } | null;
  city?: string;
}

export function WeatherCard({ weather: propWeather, city = 'Hyderabad' }: WeatherCardProps) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propWeather) {
      setWeather(propWeather);
      return;
    }

    const fetchDefaultWeather = async () => {
      setLoading(true);
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/weather/current?city=${encodeURIComponent(city)}`;
        const riskUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/weather/risk?city=${encodeURIComponent(city)}`;
        
        const [currRes, riskRes] = await Promise.all([
          axios.get(url),
          axios.get(riskUrl)
        ]);

        setWeather({
          ...currRes.data,
          risk: riskRes.data.risk_score,
          risk_category: riskRes.data.risk_category,
          reason: riskRes.data.reason
        });
      } catch (err) {
        console.error("Failed to load live weather for Card:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDefaultWeather();
  }, [propWeather, city]);

  if (loading) {
    return (
      <div className="glass-panel flex-center" style={{ padding: '20px', minHeight: '180px' }}>
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Loading weather intelligence...
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const style = getRiskColor(weather.risk_category || 'Safe');

  return (
    <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden', borderLeft: `6px solid ${style.text}`, transition: 'all 0.3s ease' }}>
      <div className="flex-between" style={{ marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.0rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
            Weather Security {weather.city ? `(${weather.city})` : `(${city})`}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Live environmental scanning active.</p>
        </div>
        <div style={{ padding: '6px 12px', borderRadius: '20px', background: style.bg, border: style.border, color: style.text, fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: style.shadow }}>
          {weather.risk_category || 'Safe'} Risk
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div className="flex-center" style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)' }}>
          {getWeatherIcon(weather.description, 30)}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{Math.round(weather.temperature)}°C</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{weather.description}</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: style.text, marginTop: '2px', fontWeight: '500' }}>{weather.reason}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Droplets size={16} color="var(--primary-color)" />
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Humidity</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>{weather.humidity}%</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={16} color="var(--primary-color)" />
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Visibility</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>{weather.visibility} km</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wind size={16} color="var(--primary-color)" />
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Wind Speed</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>{weather.windspeed} km/h</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CloudRain size={16} color="var(--primary-color)" />
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Rain Chance</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>{weather.chanceofrain}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. WeatherRiskBadge Component
interface WeatherRiskBadgeProps {
  score: number;
  category: string;
}

export function WeatherRiskBadge({ score, category }: WeatherRiskBadgeProps) {
  const style = getRiskColor(category);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', background: style.bg, border: style.border, color: style.text, fontSize: '0.7rem', fontWeight: 'bold' }}>
      <span>Weather Risk: {score}</span>
    </div>
  );
}

// 3. WeatherAlertBanner Component
interface WeatherAlertBannerProps {
  alerts?: any[];
  city?: string;
}

export function WeatherAlertBanner({ alerts: propAlerts, city = 'Hyderabad' }: WeatherAlertBannerProps) {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (propAlerts) {
      setAlerts(propAlerts);
      return;
    }

    const fetchAlerts = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/weather/alerts?city=${encodeURIComponent(city)}`;
        const res = await axios.get(url);
        setAlerts(res.data);
      } catch (err) {
        console.error("Failed to load alerts for banner:", err);
      }
    };

    fetchAlerts();
  }, [propAlerts, city]);

  if (!alerts || alerts.length === 0) return null;

  const hasHighAlert = alerts.some((a: any) => a.severity === 'High');
  const bannerColor = hasHighAlert ? 'var(--danger-red)' : 'var(--warning-orange)';
  const bannerBg = hasHighAlert ? 'rgba(255, 23, 68, 0.15)' : 'rgba(255, 152, 0, 0.15)';

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '12px 20px', border: `1px solid ${bannerColor}`, background: bannerBg, borderLeft: `5px solid ${bannerColor}`, display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '12px', marginBottom: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: bannerColor, color: 'white' }}>
        {hasHighAlert ? <AlertOctagon size={20} className="animate-pulse" /> : <AlertTriangle size={20} />}
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>
          {alerts[0].title} {alerts.length > 1 ? `(+${alerts.length - 1} more alert)` : ''}
        </h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {alerts[0].message} Recommended Action: {alerts[0].suggested_actions?.[0] || 'Proceed with high caution.'}
        </p>
      </div>
    </div>
  );
}

// 4. WeatherAnalyticsPanel Component
export function WeatherAnalyticsPanel({ city = 'Hyderabad' }: { city?: string }) {
  const [data, setData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const weatherUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/weather/current?city=${encodeURIComponent(city)}`;
        const riskUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/weather/risk?city=${encodeURIComponent(city)}`;
        const alertsUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/weather/alerts?city=${encodeURIComponent(city)}`;
        
        const [wRes, rRes, aRes] = await Promise.all([
          axios.get(weatherUrl),
          axios.get(riskUrl),
          axios.get(alertsUrl)
        ]);

        setData({
          weather: wRes.data,
          risk: rRes.data
        });
        setAlerts(aRes.data);
      } catch (err) {
        console.error("Failed to load weather analytics:", err);
      }
    };
    fetchAnalytics();
  }, [city]);

  if (!data) {
    return (
      <div className="glass-panel flex-center" style={{ padding: '20px', minHeight: '200px' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading Weather Analytics...</div>
      </div>
    );
  }

  const weatherEvents = [
    { name: "Visibility Scan", value: `${data.weather.visibility} km`, status: data.weather.visibility <= 3 ? "Warning" : "Normal" },
    { name: "Rain Forecast", value: `${data.weather.chanceofrain}% Probability`, status: data.weather.chanceofrain > 60 ? "Warning" : data.weather.chanceofrain > 20 ? "Caution" : "Clear" },
    { name: "Wind Status", value: `${data.weather.windspeed} km/h`, status: data.weather.windspeed > 25 ? "Warning" : "Normal" }
  ];

  return (
    <div className="glass-panel" style={{ background: 'rgba(20, 20, 25, 0.45)', border: '1px solid var(--glass-border)' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)' }}>
        <BarChart3 size={20} /> Weather Safety Analytics
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Risk Score Gauge */}
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: data.risk.risk_category === 'Dangerous' ? 'var(--danger-red)' : data.risk.risk_category === 'Moderate' ? 'var(--warning-orange)' : 'var(--safe-green)' }}>
            {data.risk.risk_score}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'white', marginTop: '4px' }}>
            Weather Risk Score
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px', textAlign: 'center' }}>
            {data.risk.reason}
          </div>
        </div>

        {/* Analytics stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Weather Events Today:</span>
            <span style={{ fontWeight: 'bold', color: 'white' }}>{alerts.length > 0 ? alerts.length : '0 Active'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Flood Risk Status:</span>
            <span style={{ fontWeight: 'bold', color: data.weather.chanceofrain > 60 ? 'var(--danger-red)' : 'var(--safe-green)' }}>
              {data.weather.chanceofrain > 60 ? 'HIGH ALERT' : 'SECURE'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Route Safety Impact:</span>
            <span style={{ fontWeight: 'bold', color: data.risk.risk_score > 30 ? 'var(--danger-red)' : data.risk.risk_score > 15 ? 'var(--warning-orange)' : 'var(--safe-green)' }}>
              {data.risk.risk_score > 30 ? 'High Impact' : data.risk.risk_score > 15 ? 'Moderate' : 'Negligible'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>
          Live Sensory Scans
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {weatherEvents.map((evt, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: '500' }}>{evt.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>{evt.value}</span>
              </div>
              <span style={{ 
                fontSize: '0.65rem', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                fontWeight: 'bold',
                background: evt.status === 'Warning' ? 'rgba(255, 23, 68, 0.15)' : evt.status === 'Caution' ? 'rgba(255, 152, 0, 0.15)' : 'rgba(0, 230, 118, 0.15)',
                color: evt.status === 'Warning' ? 'var(--danger-red)' : evt.status === 'Caution' ? 'var(--warning-orange)' : 'var(--safe-green)'
              }}>
                {evt.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
