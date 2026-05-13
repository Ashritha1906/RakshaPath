'use client';
import { Shield, Share2, Plus, Trash2, Clock, MapPin, AlertCircle, CheckCircle, Navigation2, ShieldAlert, Bot, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Guardian() {
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: 'Friend' });
  const [timer, setTimer] = useState(30); // 30 minutes check-in
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get('${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/guardian/contacts?user_id=1');
      setContacts(res.data);
    } catch (e) {
      console.error("Failed to fetch contacts");
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await axios.post('${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/guardian/share?user_id=1');
      setShareUrl(res.data.share_url);
      setIsActive(true);
    } catch (e) {
      alert('Failed to share trip');
    } finally {
      setSharing(false);
    }
  };

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newContact.name && newContact.phone) {
      try {
        await axios.post('${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/guardian/contacts', newContact);
        setNewContact({ name: '', phone: '', relation: 'Friend' });
        fetchContacts();
      } catch (e) {
        alert('Failed to add contact');
      }
    }
  };

  const removeContact = async (id: number) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/guardian/contacts/${id}`);
      fetchContacts();
    } catch (e) {
      alert('Failed to remove contact');
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: '#0a0a0f' }}>


      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div className="flex-between" style={{ marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Guardian Mode</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Predictive tracking and automated emergency check-ins.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <div className={`status-badge ${isActive ? 'active' : 'idle'}`}>
               {isActive ? <CheckCircle size={14}/> : <Clock size={14}/>}
               {isActive ? 'Tracking Active' : 'System Ready'}
             </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ 
              background: 'linear-gradient(135deg, rgba(0,210,255,0.05) 0%, rgba(10,10,15,0.9) 100%)',
              padding: '32px',
              border: isActive ? '2px solid var(--primary-color)' : '1px solid var(--glass-border)'
            }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div className={`shield-pulse ${isActive ? 'active' : ''}`}>
                  <Shield size={48} color={isActive ? 'var(--primary-color)' : 'var(--text-secondary)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Active Safety Sharing</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Sends your real-time GPS, route deviation alerts, and current area safety scores to your trusted contacts.
                  </p>
                </div>
              </div>

              {isActive && (
                <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0,210,255,0.1)', borderRadius: '12px', border: '1px solid rgba(0,210,255,0.2)' }}>
                  <div className="flex-between" style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14}/> Live Tracking Link:</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Secured by Raksha Token</span>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', wordBreak: 'break-all', fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--primary-color)' }}>
                    {shareUrl}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="control-card">
                  <Clock size={20} style={{ marginBottom: '8px' }}/>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Check-in Timer</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{timer} Minutes</div>
                </div>
                <div className="control-card">
                  <AlertCircle size={20} style={{ marginBottom: '8px' }}/>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Deviation Alert</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Standard</div>
                </div>
              </div>

              {!isActive && (
                <button className="btn-primary" style={{ width: '100%', marginTop: '24px', padding: '16px' }} onClick={handleShare} disabled={sharing}>
                  <Share2 size={20} style={{ marginRight: '10px' }}/>
                  {sharing ? 'Initializing Secure Track...' : 'Initialize Guardian Protocol'}
                </button>
              )}
            </div>

            <div className="glass-panel" style={{ borderLeft: '4px solid var(--warning-orange)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={20} color="var(--warning-orange)"/> Emergency Trigger Info
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                If you deviate more than 200m from your planned route or fail to check-in within the selected timeframe, 
                an immediate alert will be sent to your trusted contacts with your last known coordinates.
              </p>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Plus size={20} color="var(--primary-color)"/> Trusted Circle
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {contacts.length === 0 && (
                <p style={{ textAlign: 'center', padding: '20px', fontSize: '0.8rem', opacity: 0.5 }}>No contacts added yet.</p>
              )}
              {contacts.map((c) => (
                <li key={c.id} className="flex-between animate-fade-in" style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{c.name}</h4>
                    <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>{c.relation} • {c.phone}</p>
                  </div>
                  <button onClick={() => removeContact(c.id)} className="icon-btn-danger"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
            
            <form onSubmit={addContact} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input 
                  className="input-field" 
                  placeholder="Name" 
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                />
                <select 
                  className="input-field" 
                  value={newContact.relation}
                  onChange={(e) => setNewContact({...newContact, relation: e.target.value})}
                >
                  <option>Friend</option>
                  <option>Parent</option>
                  <option>Sibling</option>
                  <option>Other</option>
                </select>
              </div>
              <input 
                className="input-field" 
                placeholder="Phone Number" 
                value={newContact.phone}
                onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
              />
              <button type="submit" className="btn-secondary" style={{ width: '100%', borderStyle: 'dashed' }}><Plus size={16} /> Secure Contact</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
