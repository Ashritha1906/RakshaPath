'use client';
import { useState } from 'react';

const profiles = [
  { id: 'Student', icon: '🎒', desc: 'Avoids night crime zones' },
  { id: 'Women commuter', icon: '👩', desc: 'Avoids isolated & dark roads' },
  { id: 'Delivery rider', icon: '🛵', desc: 'Avoids accident-heavy roads' },
  { id: 'Senior citizen', icon: '👴', desc: 'Prioritizes hospitals, shorter paths' },
  { id: 'General traveler', icon: '🚶', desc: 'Balanced routing' }
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState('');
  const [safetyWeight, setSafetyWeight] = useState(50);
  
  const handleComplete = () => {
    localStorage.setItem('raksha_profile', profile || 'General traveler');
    localStorage.setItem('raksha_safety_weight', safetyWeight.toString());
    window.location.href='/dashboard';
  };

  return (
    <main className="container flex-center" style={{ minHeight: '80vh', padding: '40px 0' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ marginBottom: '32px', display: 'flex', gap: '8px' }}>
          <div style={{ height: '4px', background: 'var(--primary-color)', flex: 1, borderRadius: '2px' }} />
          <div style={{ height: '4px', background: step === 2 ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', flex: 1, borderRadius: '2px' }} />
        </div>
        
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Who are you?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Select a profile to personalize your routing algorithms.</p>
            <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {profiles.map(p => (
                <button 
                  key={p.id} 
                  className={`btn-secondary ${profile === p.id ? 'safety-glow' : ''}`} 
                  style={{ padding: '20px', textAlign: 'left', borderColor: profile === p.id ? 'var(--primary-color)' : '' }} 
                  onClick={() => { setProfile(p.id); setTimeout(() => setStep(2), 300); }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{p.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{p.id}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Adjust Preferences</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Fine-tune how Raksha Path protects you.</p>
            
            <div style={{ marginBottom: '32px' }}>
              <div className="flex-between" style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Prioritize Speed</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--safe-green)' }}>Prioritize Safety</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={safetyWeight} 
                onChange={(e) => setSafetyWeight(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
              />
              <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', color: 'var(--primary-color)' }}>
                {safetyWeight > 70 ? 'Maximum Security (Avoids all risks)' : safetyWeight > 30 ? 'Balanced Commute' : 'Fastest Path'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary" style={{ flex: 2 }} onClick={handleComplete}>Save & Start Navigation</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
