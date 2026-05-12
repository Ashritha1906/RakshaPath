'use client';
import { useState } from 'react';

export default function Login() {
  return (
    <main className="container flex-center" style={{ minHeight: '80vh' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '2rem' }}>Welcome Back</h2>
        <form onSubmit={(e) => { e.preventDefault(); window.location.href='/dashboard'; }}>
          <div className="input-group">
            <label>Email</label>
            <input type="email" required className="input-field" placeholder="Enter your email" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" required className="input-field" placeholder="Enter password" />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>Login</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
          Don't have an account? <a href="/signup" style={{ color: 'var(--primary-color)' }}>Sign up</a>
        </p>
      </div>
    </main>
  );
}
