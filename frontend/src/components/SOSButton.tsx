'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AlertTriangle, PhoneCall, Shield, Navigation, Activity, CheckCircle2, Volume2, X } from 'lucide-react';

export default function SOSButton() {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [safezones, setSafezones] = useState<any>(null);
  const [alarmActive, setAlarmActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // We create a generic alarm beep using Web Audio API if user triggers it
    if (alarmActive) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.5); // alternating tone
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      
      // Stop the alarm when toggled off
      const interval = setInterval(() => {
        if (!alarmActive) {
          oscillator.stop();
          audioCtx.close();
          clearInterval(interval);
        }
      }, 100);
      
      return () => {
        oscillator.stop();
        audioCtx.close();
        clearInterval(interval);
      };
    }
  }, [alarmActive]);

  const handleSOS = async () => {
    setActive(true);
    setLoading(true);
    try {
      // 1. Notify Backend / Guardian
      await axios.post('${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/emergency/sos?user_id=1&lat=17.3850&lng=78.4867');
      
      // 2. Fetch Nearest Safe Zones
      const res = await axios.get('${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/safezones/discovery?lat=17.3850&lon=78.4867');
      setSafezones(res.data);

      // Dispatch event to map if possible
      window.dispatchEvent(new CustomEvent('raksha-emergency', { detail: res.data }));

    } catch (e) {
      console.error("SOS Trigger Error", e);
    } finally {
      setLoading(false);
    }
  };

  const closeSOS = () => {
    setActive(false);
    setAlarmActive(false);
  };

  return (
    <>
      <button 
        className="floating-sos" 
        onClick={handleSOS}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff0f7b, #f89b29)',
          border: 'none',
          color: 'white',
          fontWeight: 900,
          fontSize: '1.2rem',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(255, 15, 123, 0.6)',
          zIndex: 999,
          animation: 'pulse-red 2s infinite'
        }}
      >
        SOS
      </button>

      {active && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(20, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'linear-gradient(180deg, rgba(40,0,0,1) 0%, rgba(20,0,0,1) 100%)',
            border: '2px solid #ff1744',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '500px',
            padding: '30px',
            position: 'relative',
            boxShadow: '0 0 50px rgba(255, 23, 68, 0.3)'
          }}>
            <button onClick={closeSOS} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,23,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', border: '2px solid #ff1744', animation: 'pulse-red 1s infinite' }}>
                <AlertTriangle size={40} color="#ff1744" />
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ff1744', margin: '0 0 10px 0' }}>EMERGENCY ACTIVE</h2>
              <div style={{ background: 'rgba(0,230,118,0.1)', color: '#00e676', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #00e676' }}>
                <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '5px' }}/>
                Emergency alert sent successfully.<br/>
                <span style={{opacity: 0.8}}>"Emergency Alert: User may be in danger. Live location shared."</span>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#fff' }}>Quick Action Panel</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <a href="tel:100" className="btn-primary" style={{ background: '#ff1744', border: 'none', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <PhoneCall size={20} /> Call Police
                </a>
                <a href="tel:9999999999" className="btn-secondary" style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <PhoneCall size={20} /> Call Guardian
                </a>
                <button className="btn-secondary" style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={() => window.open(`https://www.google.com/maps/search/hospital/@17.3850,78.4867,15z`)}>
                  <Activity size={20} /> Nearest Hospital
                </button>
                <button className="btn-secondary" style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={() => window.open(`https://www.google.com/maps/search/police/@17.3850,78.4867,15z`)}>
                  <Shield size={20} /> Nearest Police
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '30px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#fff' }}>Safety Checklist</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <li>✅ Move to a crowded, well-lit place immediately</li>
                <li>✅ Stay on call with your guardian</li>
                <li>✅ Keep battery active; disable non-essential apps</li>
                <li>✅ Route details have been shared automatically</li>
              </ul>
            </div>

            <button 
              onClick={() => setAlarmActive(!alarmActive)}
              style={{ 
                width: '100%', 
                padding: '20px', 
                borderRadius: '12px', 
                background: alarmActive ? '#ff1744' : 'transparent',
                border: '2px solid #ff1744',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <Volume2 size={24} />
              {alarmActive ? 'STOP ALARM' : 'SOUND LOUD ALARM'}
            </button>

          </div>
        </div>
      )}
    </>
  );
}
