'use client';
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Activity } from 'lucide-react';
import axios from 'axios';

// Add type for SpeechRecognition to avoid TS errors
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceCommand() {
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  let recognition: any = null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          console.log("Voice Command Received:", transcript);
          handleVoiceCommand(transcript);
        };

        recognition.onspeechend = () => {
          recognition.stop();
          setListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setListening(false);
        };
      }
    }
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleVoiceCommand = async (transcript: string) => {
    showFeedback('Analyzing request...');
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/voice/intent`, { transcript });
      const intent = response.data.intent;
      
      switch(intent) {
        case 'SOS':
          showFeedback('SOS Activated');
          speak('Activating Emergency SOS Protocols.');
          axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/emergency/sos?user_id=1&lat=17.3850&lng=78.4867`).catch(() => {});
          break;
        case 'GUARDIAN':
          showFeedback('Calling Guardian...');
          speak('Calling your guardian now.');
          window.location.href = 'tel:9999999999';
          break;
        case 'POLICE':
          showFeedback('Finding Nearest Police Station');
          speak('Routing to the nearest police station.');
          window.location.href = `https://www.google.com/maps/search/police/@17.3850,78.4867,15z`;
          break;
        case 'HOSPITAL':
          showFeedback('Finding Nearest Hospital');
          speak('Routing to the nearest hospital.');
          window.location.href = `https://www.google.com/maps/search/hospital/@17.3850,78.4867,15z`;
          break;
        default:
          showFeedback('Command not recognized.');
          speak("I didn't catch that. Do you need help?");
      }
    } catch (e) {
      console.error("Voice intent error", e);
      showFeedback('Connection error.');
    }
  };

  const toggleListen = () => {
    if (listening) {
      recognition?.stop();
      setListening(false);
    } else {
      try {
        recognition?.start();
        setListening(true);
        showFeedback('Listening...');
      } catch (e) {
        console.error("Mic start error", e);
      }
    }
  };

  return (
    <>
      <button 
        onClick={toggleListen}
        style={{
          position: 'fixed',
          bottom: '100px', // Just above the SOS button
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: listening ? 'linear-gradient(135deg, #00d2ff, #3a7bd5)' : 'rgba(10, 10, 15, 0.8)',
          border: listening ? 'none' : '2px solid var(--primary-color)',
          color: listening ? 'white' : 'var(--primary-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: listening ? '0 0 20px rgba(0, 210, 255, 0.6)' : 'none',
          zIndex: 999,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s'
        }}
        title="Voice Safety Assistant"
      >
        {listening ? <Activity className="animate-pulse" size={28} /> : <Mic size={24} />}
      </button>

      {feedback && (
        <div style={{
          position: 'fixed',
          bottom: '180px',
          right: '20px',
          background: 'rgba(0, 210, 255, 0.1)',
          border: '1px solid var(--primary-color)',
          backdropFilter: 'blur(10px)',
          padding: '10px 20px',
          borderRadius: '20px',
          color: 'white',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          zIndex: 999,
          boxShadow: '0 0 15px rgba(0, 210, 255, 0.2)',
          animation: 'fade-in 0.3s'
        }}>
          {feedback}
        </div>
      )}
    </>
  );
}
