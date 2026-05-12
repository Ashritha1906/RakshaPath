'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Map, AlertTriangle, Navigation, Activity, ChevronRight, Users, Zap, Eye, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
const TomTomSafetyMap = dynamic(() => import('./dashboard/TomTomSafetyMap'), { ssr: false });

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const isLogged = localStorage.getItem('raksha_profile') || localStorage.getItem('raksha_auth');
      if (isLogged) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/signup';
      }
    }
  };

  if (!mounted) return null;

  return (
    <main className="container animate-fade-in" style={{ padding: '0 20px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* 1. STUNNING HERO SECTION */}
      <section style={{ position: 'relative', textAlign: 'center', paddingTop: '140px', paddingBottom: '100px', minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        {/* Background Glows */}
        <div style={{ position: 'absolute', top: '30%', left: '30%', transform: 'translate(-50%, -50%)', width: '80vw', height: '80vw', maxWidth: '800px', maxHeight: '800px', background: 'radial-gradient(circle, rgba(0, 210, 255, 0.15) 0%, transparent 60%)', zIndex: -1, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '70%', left: '70%', transform: 'translate(-50%, -50%)', width: '80vw', height: '80vw', maxWidth: '800px', maxHeight: '800px', background: 'radial-gradient(circle, rgba(142, 45, 226, 0.15) 0%, transparent 60%)', zIndex: -1, pointerEvents: 'none' }} />

        <div className="safety-score-badge animate-fade-in" style={{ marginBottom: '32px', padding: '12px 28px', fontSize: '0.9rem', letterSpacing: '2px', background: 'rgba(0, 230, 118, 0.1)', color: 'var(--safe-green)', borderColor: 'rgba(0, 230, 118, 0.3)', boxShadow: '0 0 20px rgba(0, 230, 118, 0.2)', backdropFilter: 'blur(10px)' }}>
          ● GLOBAL SAFETY NETWORK ACTIVE
        </div>
        
        <h1 className="animate-fade-in" style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', fontWeight: 900, marginBottom: '24px', lineHeight: 1.05, letterSpacing: '-2px', animationDelay: '0.1s' }}>
          Navigate with <br />
          <span className="gradient-text" style={{ textShadow: '0 0 50px rgba(142, 45, 226, 0.5)' }}>Total Confidence.</span>
        </h1>
        
        <p className="animate-fade-in" style={{ fontSize: 'clamp(1.2rem, 2vw, 1.6rem)', color: 'var(--text-secondary)', maxWidth: '700px', marginBottom: '50px', lineHeight: 1.6, animationDelay: '0.2s', fontWeight: 300, fontStyle: 'italic' }}>
          "Predict the unseen. Navigate with absolute certainty."<br/>
          <span style={{ fontSize: '0.9em', opacity: 0.8, fontStyle: 'normal' }}>Your digital guardian in the physical world.</span>
        </p>
        
        <div className="animate-fade-in" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', animationDelay: '0.3s' }}>
          <button onClick={handleGetStarted} className="btn-primary" style={{ fontSize: '1.2rem', padding: '20px 48px', borderRadius: '50px', boxShadow: '0 10px 40px rgba(0, 210, 255, 0.4)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s ease', cursor: 'pointer', border: 'none' }}>
            <Zap size={20} /> Get Started Free
          </button>
          <a href="#how-it-works" className="btn-secondary" style={{ fontSize: '1.2rem', padding: '20px 48px', borderRadius: '50px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease' }}>
            Explore Technology
          </a>
        </div>
      </section>

      {/* 2. LIVE STATISTICS BAR */}
      <section className="animate-fade-in" style={{ animationDelay: '0.5s', padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '100px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '30px' }}>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary-color)', marginBottom: '8px' }}>2.4M+</h4>
          <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Safe Routes Calculated</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-purple)', marginBottom: '8px' }}>150K</h4>
          <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Active Crowd Sensors</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--safe-green)', marginBottom: '8px' }}>99.8%</h4>
          <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Threat Detection Accuracy</p>
        </div>
      </section>

      {/* 3. CORE FEATURES GRID */}
      <section style={{ padding: '60px 0 120px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '20px', letterSpacing: '-1px' }}>The Safety Ecosystem</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>A unified platform designed from the ground up to protect, predict, and guide you through urban environments.</p>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px' }}>
          <div className="glass-panel" style={{ flex: '1 1 350px', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', padding: '50px 40px', cursor: 'pointer', borderTop: '4px solid var(--primary-color)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-15px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
            <div style={{ background: 'rgba(0, 210, 255, 0.1)', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', boxShadow: 'inset 0 0 20px rgba(0, 210, 255, 0.2)' }}>
              <Shield size={36} color="var(--primary-color)" />
            </div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '16px', fontWeight: 700 }}>AI Safe Routing</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem' }}>Military-grade pathfinding that bypasses high-risk zones, unlit streets, and dynamic accident hotspots in real-time. We don't just find the fastest route; we find the route that keeps you safe.</p>
          </div>
          
          <div className="glass-panel" style={{ flex: '1 1 350px', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', padding: '50px 40px', cursor: 'pointer', borderTop: '4px solid var(--accent-purple)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-15px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
            <div style={{ background: 'rgba(142, 45, 226, 0.1)', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', boxShadow: 'inset 0 0 20px rgba(142, 45, 226, 0.2)' }}>
              <Activity size={36} color="var(--accent-purple)" />
            </div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '16px', fontWeight: 700 }}>Predictive Engine</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem' }}>Harnessing historical datasets and temporal AI models to forecast and map potential dangers hours before they escalate. Know exactly what to expect before you even leave the door.</p>
          </div>
          
          <div className="glass-panel" style={{ flex: '1 1 350px', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', padding: '50px 40px', cursor: 'pointer', borderTop: '4px solid var(--danger-red)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-15px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
            <div style={{ background: 'rgba(255, 23, 68, 0.1)', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', boxShadow: 'inset 0 0 20px rgba(255, 23, 68, 0.2)' }}>
              <AlertTriangle size={36} color="var(--danger-red)" />
            </div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '16px', fontWeight: 700 }}>Crowd Intelligence</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.05rem' }}>A continuous, community-driven early warning system providing hyper-local situational awareness. When someone spots a hazard, the entire network is instantly protected.</p>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE SHOWCASE SECTION */}
      <section id="how-it-works" style={{ padding: '100px 0', position: 'relative' }}>
        <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(15,15,20,0.9) 0%, rgba(25,30,45,0.7) 100%)', borderRadius: '32px', padding: '60px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px', alignItems: 'center' }}>
            
            {/* Text Side */}
            <div style={{ flex: '1 1 450px' }}>
              <div className="safety-score-badge" style={{ display: 'inline-block', marginBottom: '20px', background: 'rgba(142, 45, 226, 0.1)', color: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}>NEXT-GEN INTERFACE</div>
              <h2 style={{ fontSize: '3rem', marginBottom: '30px', fontWeight: 800, lineHeight: 1.1 }}>Not Just a Map.<br/>A Virtual Guardian.</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '40px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(0,210,255,0.1)', padding: '16px', borderRadius: '50%', boxShadow: '0 0 15px rgba(0,210,255,0.2)' }}>
                    <Eye size={28} color="var(--primary-color)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.3rem', marginBottom: '8px', fontWeight: 700 }}>Live Threat Density Maps</h4>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Toggle on our proprietary Heatmap layer to instantly visualize crime densities, isolated zones, and active police patrol routes globally.</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(0,230,118,0.1)', padding: '16px', borderRadius: '50%', boxShadow: '0 0 15px rgba(0,230,118,0.2)' }}>
                    <MapPin size={28} color="var(--safe-green)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.3rem', marginBottom: '8px', fontWeight: 700 }}>SafeZone Discovery</h4>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>One-tap navigation to the nearest verified safe havens—hospitals, police stations, and 24/7 highly-lit establishments.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Mockup Side */}
            <div style={{ flex: '1 1 500px', display: 'flex', justifyContent: 'center' }}>
             <div style={{ width: '100%', position: 'relative' }}>
                {/* Decorative Mockup Frame */}
                <div style={{ position: 'absolute', top: '-15px', left: '-15px', right: '-15px', bottom: '-15px', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-purple))', borderRadius: '32px', zIndex: 0, opacity: 0.5, filter: 'blur(20px)' }}></div>
                <div style={{ position: 'relative', width: '100%', height: '500px', background: '#000', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                  
                  {/* Fake UI Overlay on Map */}
                  <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Current Status</div>
                    <div style={{ color: 'var(--safe-green)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', background: 'var(--safe-green)', borderRadius: '50%' }}></div> High Safety</div>
                  </div>

                  <TomTomSafetyMap 
                    currentPos={{ lat: 17.3850, lng: 78.4867 }}
                    crimeMarkers={[
                      { lat: 17.3950, lng: 78.4967, type: 'crime', desc: 'Mock Incident', severity: 'High' },
                      { lat: 17.3750, lng: 78.4767, type: 'info', desc: 'Safe Corridor', severity: 'Low' }
                    ]}
                    showHeatmap={true}
                  />
                </div>
             </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section style={{ textAlign: 'center', padding: '120px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '24px' }}>Ready to take control of your safety?</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px auto' }}>Join hundreds of thousands of users who navigate the urban landscape with peace of mind. Raksha Path is entirely free.</p>
        <button onClick={handleGetStarted} className="btn-primary" style={{ fontSize: '1.2rem', padding: '20px 48px', borderRadius: '50px', boxShadow: '0 10px 40px rgba(0, 210, 255, 0.4)', cursor: 'pointer', border: 'none' }}>
          Create Free Account
        </button>
      </section>

      {/* PREMIUM FOOTER */}
      <footer style={{ paddingTop: '80px', paddingBottom: '40px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '60px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'space-between', marginBottom: '60px' }}>
          
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <img src="/logo.png" alt="Raksha Path Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', boxShadow: '0 0 15px rgba(0,210,255,0.3)' }} />
              <span style={{ fontWeight: 900, color: 'white', fontSize: '1.4rem', letterSpacing: '1px' }}>RAKSHA PATH</span>
            </div>
            <p style={{ lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '20px', maxWidth: '300px' }}>
              The world's first AI-powered personal safety navigation platform. Empowering urban commuters with real-time threat intelligence and predictive routing.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>X</div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>in</div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>IG</div>
            </div>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '20px', fontSize: '1.1rem' }}>Product</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Safety Engine</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Guardian Mode</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Crowd Alerts</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Live Heatmaps</a></li>
            </ul>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '20px', fontSize: '1.1rem' }}>Resources</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Documentation</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>API Reference</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Safety Datasets</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Community Guidelines</a></li>
            </ul>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '20px', fontSize: '1.1rem' }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>About Us</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Careers</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Press</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>Contact</a></li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
          <p style={{ margin: 0 }}>© 2026 Raksha Path Inc. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" style={{ color: 'inherit' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'inherit' }}>Terms of Service</a>
            <a href="#" style={{ color: 'inherit' }}>Cookie Settings</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
