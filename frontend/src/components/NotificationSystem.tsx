'use client';
import { useState, useEffect } from 'react';
import { Bell, Shield, AlertTriangle, X } from 'lucide-react';

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Check for browser notification permission
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check for browser notification permission
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Dynamic alerts will be triggered by the Guardian/Engine modules instead of mock timeouts.
    const handleCustomAlert = (e: any) => {
      addNotification(e.detail);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('raksha-alert', handleCustomAlert);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('raksha-alert', handleCustomAlert);
      }
    };
  }, []);

  const addNotification = (notif: any) => {
    setNotifications(prev => [notif, ...prev]);
    
    // Also trigger browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(`Raksha Path: ${notif.title}`, {
        body: notif.message,
        icon: '/favicon.ico'
      });
    }
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: '100px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', width: '350px' }}>
      {notifications.map((n) => (
        <div key={n.id} className="glass-panel animate-fade-in" style={{ 
          padding: '16px', 
          borderLeft: `4px solid ${n.type === 'warning' ? 'var(--warning-orange)' : 'var(--primary-color)'}`,
          display: 'flex',
          gap: '12px'
        }}>
          <div style={{ padding: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', height: 'fit-content' }}>
            {n.type === 'warning' ? <AlertTriangle size={20} color="var(--warning-orange)"/> : <Shield size={20} color="var(--primary-color)"/>}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '4px' }}>{n.title}</h4>
            <p style={{ fontSize: '0.8rem', opacity: 0.7, lineHeight: '1.4' }}>{n.message}</p>
          </div>
          <button onClick={() => removeNotification(n.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={16}/>
          </button>
        </div>
      ))}
    </div>
  );
}
