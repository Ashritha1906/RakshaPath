'use client';
import { Shield, MapPin, Clock, Battery, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';

const TomTomMap = dynamic(() => import('../../dashboard/TomTomSafetyMap'), { ssr: false });

export default function TrackingPage({ params }: { params: { token: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/guardian/track/${params.token}`);
        setData(res.data);
        setLoading(false);
      } catch (e) {
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [params.token]);

  if (loading) return (
    <div className="flex-center" style={{ height: '100vh', background: '#0a0a0f', flexDirection: 'column', gap: '20px' }}>
      <div className="shield-pulse active"><Shield size={60} color="var(--primary-color)"/></div>
      <p style={{ color: 'var(--text-secondary)', letterSpacing: '2px' }}>ESTABLISHING SECURE LINK...</p>
    </div>
  );

  if (error) return (
    <div className="flex-center" style={{ height: '100vh', background: '#0a0a0f', flexDirection: 'column', gap: '20px', padding: '20px', textAlign: 'center' }}>
      <AlertTriangle size={60} color="var(--danger-red)"/>
      <h2 style={{ fontSize: '1.5rem' }}>Link Expired or Invalid</h2>
      <p style={{ color: 'var(--text-secondary)' }}>This tracking session has ended or the security token is incorrect.</p>
      <button className="btn-secondary" onClick={() => window.location.href='/'}>Return Home</button>
    </div>
  );

  return (
    <div style={{ height: '100vh', background: '#0a0a0f', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <header className="glass-panel" style={{ margin: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--primary-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="shield-pulse active" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,210,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="var(--primary-color)"/>
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>LIVE TRACK: {data.user_name}</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--safe-green)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--safe-green)', display: 'inline-block' }}></span>
              ENCRYPTED CHANNEL ACTIVE
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <Battery size={18} style={{ opacity: 0.6 }}/>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{data.battery}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Clock size={18} style={{ opacity: 0.6 }}/>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{data.last_seen}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <MapPin size={18} color="var(--primary-color)"/>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{data.safety_status}</div>
          </div>
        </div>
      </header>

      <main style={{ margin: '0 16px 16px 16px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative' }}>
        <TomTomMap 
          center={{ lat: data.lat, lng: data.lng }} 
          zoom={15}
        />
        
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 100 }}>
           <div className="glass-panel" style={{ padding: '16px', maxWidth: '300px' }}>
             <h3 style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Shield size={16} color="var(--primary-color)"/> Guardian Intel
             </h3>
             <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
               User is currently in a <strong>{data.safety_status}</strong> sector. No route deviations detected.
             </p>
           </div>
        </div>
      </main>
    </div>
  );
}
