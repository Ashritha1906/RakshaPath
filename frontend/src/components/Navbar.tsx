'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is on dashboard or other internal pages to simulate login state
    const checkLogin = () => {
      const path = window.location.pathname;
      const internalPaths = ['/dashboard', '/guardian', '/report', '/insights', '/chatbot'];
      if (internalPaths.some(p => path.startsWith(p))) {
        setIsLoggedIn(true);
      }
    };
    checkLogin();
  }, []);

  const handleLogout = () => {
    window.location.href = '/';
  };

  const getLinkStyle = (path: string) => {
    const isActive = pathname?.startsWith(path);
    return {
      fontSize: '0.9rem',
      opacity: isActive ? 1 : 0.7,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 14px',
      borderRadius: '8px',
      background: isActive ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
      border: isActive ? '1px solid rgba(0, 210, 255, 0.4)' : '1px solid transparent',
      color: isActive ? 'var(--primary-color)' : 'inherit',
      fontWeight: isActive ? 600 as const : 400 as const,
      transition: 'all 0.2s ease'
    };
  };

  return (
    <nav className="glass-panel" style={{ margin: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.location.href='/'}>
        <img src="/logo.png" alt="Raksha Path Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 210, 255, 0.4)' }} />
        <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>RAKSHA PATH</h1>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {isLoggedIn ? (
          <>
            <a href="/dashboard" style={getLinkStyle('/dashboard')}>Route Engine</a>
            <a href="/guardian" style={getLinkStyle('/guardian')}>Guardian Mode</a>
            <a href="/report" style={getLinkStyle('/report')}>Report Incident</a>
            <a href="/chatbot" style={getLinkStyle('/chatbot')}>AI Assistant</a>
            <a href="/insights" style={getLinkStyle('/insights')}>City Insights</a>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', marginLeft: '10px' }}>Logout</button>
          </>
        ) : (
          <>
            <a href="/login" className="btn-secondary">Login</a>
            <a href="/signup" className="btn-primary">Sign Up</a>
          </>
        )}
      </div>
    </nav>
  );
}
