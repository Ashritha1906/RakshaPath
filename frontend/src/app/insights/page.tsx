'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BarChart3, Users, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function InsightsPage() {
  const [selectedArea, setSelectedArea] = useState('Hitech City');
  const [searchInput, setSearchInput] = useState('Hitech City');
  const [areaDetails, setAreaDetails] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areaRes, statsRes, forecastRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/insights/area/${selectedArea}`),
          axios.get(`http://localhost:8000/api/insights/stats?area=${selectedArea}`),
          axios.get(`http://localhost:8000/api/insights/forecast?area=${selectedArea}`)
        ]);
        setAreaDetails(areaRes.data);
        setStats(statsRes.data);
        setForecast(forecastRes.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [selectedArea]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
      <aside className="glass-panel" style={{ width: '250px', borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none', background: 'rgba(142, 45, 226, 0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-purple)' }}>Safety Intelligence</h3>
        
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label>Location Scan</label>
          <input 
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedArea(searchInput)}
            placeholder="Enter any location..."
            className="input-field"
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--accent-purple)', marginBottom: '10px' }}
          />
          <button 
            className="btn-primary" 
            style={{ width: '100%', fontSize: '0.8rem', padding: '10px' }}
            onClick={() => setSelectedArea(searchInput)}
          >
            Analyze Insights
          </button>
        </div>

        {areaDetails && (
          <div className="animate-fade-in" style={{ background: 'rgba(142, 45, 226, 0.1)', padding: '16px', borderRadius: '12px', marginTop: '20px' }}>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent-purple)', fontWeight: 'bold' }}>Local Alert</p>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>{areaDetails.top_concern}</p>
            <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Patrols: <span style={{ color: 'white' }}>{areaDetails.patrol_density}</span></p>
          </div>
        )}

        <a href="/insights" className="btn-secondary" style={{ textAlign: 'left', borderColor: 'var(--accent-purple)', width: '100%', marginTop: 'auto' }}>Reset View</a>
      </aside>

      <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '2rem' }}>City Safety Insights</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Analyzing current trends for <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>{selectedArea}</span></p>
          </div>
          <span className="glass-panel" style={{ padding: '8px 16px', fontSize: '0.9rem', color: 'var(--safe-green)' }}>● Live Data Feed Active</span>
        </div>

        {stats && (
          <>
            <div className="grid-layout" style={{ marginBottom: '24px' }}>
              <div className="glass-panel flex-center" style={{ flexDirection: 'column', gap: '8px' }}>
                <AlertTriangle size={32} color="var(--danger-red)" />
                <h3 style={{ fontSize: '2rem' }}>{stats.active_risk_zones}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center' }}>Live Hazard Zones<br/><span style={{ fontSize: '0.7rem' }}>Flood, Traffic, or Crime Reports</span></p>
              </div>
              <div className="glass-panel flex-center" style={{ flexDirection: 'column', gap: '8px' }}>
                <Users size={32} color="var(--primary-color)" />
                <h3 style={{ fontSize: '2rem' }}>{stats.active_commuters}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center' }}>Commuters Online<br/><span style={{ fontSize: '0.7rem' }}>Contributing to Live Safety Data</span></p>
              </div>
              <div className="glass-panel flex-center" style={{ flexDirection: 'column', gap: '8px' }}>
                <ShieldCheck size={32} color="var(--safe-green)" />
                <h3 style={{ fontSize: '2rem' }}>{stats.safety_index}%</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center' }}>City Safety Index<br/><span style={{ fontSize: '0.7rem' }}>Overall Security Rating Today</span></p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
              <div className="glass-panel">
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BarChart3 color="var(--primary-color)" /> Neighborhood Safety Rankings
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        <th style={{ padding: '12px' }}>NEIGHBORHOOD</th>
                        <th style={{ padding: '12px' }}>SAFETY SCORE</th>
                        <th style={{ padding: '12px' }}>STATUS</th>
                        <th style={{ padding: '12px' }}>TREND</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.neighborhood_rankings?.map((rank: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                          <td style={{ padding: '16px', fontWeight: 'bold' }}>{rank.area}</td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', maxWidth: '60px' }}>
                                <div style={{ width: `${rank.score}%`, height: '100%', background: rank.score > 80 ? 'var(--safe-green)' : 'var(--warn-yellow)', borderRadius: '2px' }} />
                              </div>
                              {rank.score}%
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              fontSize: '0.7rem', 
                              background: rank.status === 'Secure' ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 234, 0, 0.1)',
                              color: rank.status === 'Secure' ? 'var(--safe-green)' : 'var(--warn-yellow)',
                              border: rank.status === 'Secure' ? '1px solid var(--safe-green)' : '1px solid var(--warn-yellow)'
                            }}>
                              {rank.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px', color: rank.trend === 'up' ? 'var(--safe-green)' : rank.trend === 'down' ? 'var(--danger-red)' : 'var(--text-secondary)' }}>
                            {rank.trend === 'up' ? '↗ Increasing' : rank.trend === 'down' ? '↘ Decreasing' : '→ Stable'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-panel">
                <h3 style={{ marginBottom: '20px' }}>Critical Safety Log</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {stats.recent_alerts.map((alert: any, i: number) => (
                    <div key={i} style={{ 
                      padding: '16px', 
                      background: 'rgba(255,255,255,0.03)', 
                      borderRadius: '12px',
                      borderLeft: `4px solid ${alert.severity === 'High' ? 'var(--danger-red)' : alert.severity === 'Medium' ? 'var(--warn-yellow)' : 'var(--primary-color)'}`
                    }}>
                      <div className="flex-between" style={{ marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{alert.type}</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{alert.time}</span>
                      </div>
                      <p style={{ fontSize: '1rem', fontWeight: '600' }}>{alert.area}</p>
                      <div style={{ marginTop: '8px', fontSize: '0.75rem', display: 'flex', gap: '8px' }}>
                        <span style={{ color: alert.severity === 'High' ? 'var(--danger-red)' : 'inherit' }}>Priority: {alert.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PREDICTIVE FORECASTING MODULE */}
            {forecast && (
              <div className="glass-panel" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '8px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle color="var(--warn-yellow)" /> Predictive Risk Forecast
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>AI-driven timeline predicting future hazards based on historical data, weather, and traffic patterns.</p>
                
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
                  {forecast.timeline.map((f: any, i: number) => (
                    <div key={i} className="glass-panel" style={{ minWidth: '200px', flex: 1, borderLeft: `4px solid ${f.status === 'High Risk' ? 'var(--danger-red)' : f.status === 'Moderate Risk' ? 'var(--warn-yellow)' : 'var(--safe-green)'}` }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{f.time}</p>
                      <h4 style={{ fontSize: '1.2rem', margin: '8px 0' }}>{f.risk_score}% Risk</h4>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.7rem', 
                        background: f.status === 'Safe' ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 234, 0, 0.1)',
                        color: f.status === 'Safe' ? 'var(--safe-green)' : f.status === 'High Risk' ? 'var(--danger-red)' : 'var(--warn-yellow)'
                      }}>
                        {f.status}
                      </span>
                      <ul style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '20px' }}>
                        {f.predicted_hazards.map((h: string, j: number) => (
                          <li key={j}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
