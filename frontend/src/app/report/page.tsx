'use client';
import { Camera, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export default function ReportIncident() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    incident_type: 'accident',
    description: '',
    latitude: 17.3850,
    longitude: 78.4867
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/incidents', formData);
      alert('Incident reported successfully!');
      setFormData({ ...formData, description: '' });
    } catch (e) {
      console.error(e);
      alert('Failed to report incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>


      <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Crowdsourced Reporting</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Help the community by reporting hazards, accidents, or suspicious activities.</p>
          
          <div className="glass-panel">
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Incident Type</label>
                <select 
                  className="input-field" 
                  style={{ appearance: 'none', background: 'rgba(255,255,255,0.03)' }}
                  value={formData.incident_type}
                  onChange={(e) => setFormData({...formData, incident_type: e.target.value})}
                >
                  <option value="accident">Accident / Roadblock</option>
                  <option value="harassment">Harassment / Suspicious Person</option>
                  <option value="flood">Flooding / Weather Hazard</option>
                  <option value="pothole">Severe Pothole / Infrastructure</option>
                  <option value="isolated">Extremely Isolated Area</option>
                </select>
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea 
                  className="input-field" 
                  rows={4} 
                  placeholder="Describe what you saw..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Submitting...' : <><Send size={18} /> Submit Report Anonymously</>}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
