'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Mic, Volume2, VolumeX, Activity } from 'lucide-react';
import axios from 'axios';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: '### 🛡️ Safety Status: Online\nHello! I am your Raksha AI Assistant.\n\n### 📝 Strategic Advisory\n- **Ask**: "Nearest hospital?"\n- **Ask**: "Emergency protocols?"\n- **Ask**: "Current risk assessment?"' }
  ]);
  const [input, setInput] = useState('');

  const submitMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    
    // Fetch dynamic response from Backend
    const getBotResponse = async () => {
      try {
        let lat = 17.3850;
        let lon = 78.4867;

        // Try to get real location
        if (navigator.geolocation) {
          try {
            const pos: any = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
            });
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
          } catch (e) { console.warn("Using default center for AI context"); }
        }

        const history = messages.map(m => ({ role: m.role, text: m.text }));
        const res = await axios.post('http://localhost:8000/api/chatbot', { 
          message: text,
          history: history,
          lat: lat,
          lon: lon,
          language: spokenLang
        });
        
        const replyText = res.data.reply;
        setMessages(prev => [...prev, { role: 'bot', text: replyText }]);
        
        // Auto-speak reply if voice mode is on
        if (voiceMode && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel(); 
          // Clean markdown for TTS
          const cleanText = replyText.replace(/[#*`]/g, '');
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = spokenLang; 
          utterance.pitch = 1.1;
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        }

      } catch (err) {
        setMessages(prev => [...prev, { role: 'bot', text: "### ⚠️ System Error\nI'm having trouble connecting to my safety neural network. Please check your connection." }]);
      }
    };
    getBotResponse();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const userMsg = input;
    setInput('');
    submitMessage(userMsg);
  };

  // --- Voice Features ---
  const [voiceMode, setVoiceMode] = useState(true);
  const [listening, setListening] = useState(false);
  const [spokenLang, setSpokenLang] = useState('en-US'); 
  
  const toggleListen = () => {
    if (listening) {
      setListening(false);
      return;
    }
    
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = spokenLang;
        recognition.interimResults = false;
        
        recognition.onstart = () => setListening(true);
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          submitMessage(transcript);
        };
        
        recognition.onspeechend = () => {
          recognition.stop();
          setListening(false);
        };
        
        recognition.onerror = () => setListening(false);
        
        recognition.start();
      } else {
        alert("Speech recognition not supported in this browser.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>


      <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          <div className="flex-between" style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Bot color="var(--primary-color)" /> Raksha AI</h2>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select 
                value={spokenLang} 
                onChange={(e) => setSpokenLang(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '6px' }}
              >
                <option value="en-US">English</option>
                <option value="hi-IN">Hindi (हिंदी)</option>
                <option value="te-IN">Telugu (తెలుగు)</option>
                <option value="ta-IN">Tamil (தமிழ்)</option>
                <option value="mr-IN">Marathi (మరాठी)</option>
              </select>

              <button 
                onClick={() => {
                  setVoiceMode(!voiceMode);
                  if (voiceMode) window.speechSynthesis.cancel();
                }} 
                className="btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                {voiceMode ? <Volume2 size={16} color="var(--safe-green)" /> : <VolumeX size={16} />} 
                {voiceMode ? 'Voice Mode On' : 'Voice Mode Off'}
              </button>
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ 
                  maxWidth: '70%', 
                  padding: '12px 16px', 
                  borderRadius: '16px', 
                  background: msg.role === 'user' ? 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)' : 'rgba(255,255,255,0.05)',
                  border: msg.role === 'bot' ? '1px solid var(--glass-border)' : 'none',
                  display: 'flex', gap: '12px', alignItems: 'flex-start'
                }}>
                  {msg.role === 'bot' ? <Bot size={20} style={{ flexShrink: 0, marginTop: '2px' }} /> : <User size={20} style={{ flexShrink: 0, marginTop: '2px' }} />}
                  <div className="markdown-chat" style={{ lineHeight: 1.5, fontSize: '0.95rem' }}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              className="input-field" 
              style={{ flex: 1, marginBottom: 0 }}
              placeholder="Ask anything..." 
            />
            <button type="button" onClick={toggleListen} className="btn-secondary" style={{ padding: '0 16px', background: listening ? 'rgba(0,210,255,0.2)' : 'transparent', borderColor: listening ? 'var(--primary-color)' : 'var(--glass-border)' }}>
              {listening ? <Activity size={18} className="animate-pulse" color="var(--primary-color)" /> : <Mic size={18} />}
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '0 24px' }}><Send size={18} /></button>
          </form>
        </div>
      </main>
    </div>
  );
}
