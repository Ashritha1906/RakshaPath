'use client';

export default function Signup() {
  return (
    <main className="container flex-center" style={{ minHeight: '80vh', padding: '40px 0' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '2rem' }}>Create Account</h2>
        <form onSubmit={(e) => { e.preventDefault(); window.location.href='/onboarding'; }}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" required className="input-field" placeholder="John Doe" />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" required className="input-field" placeholder="john@example.com" />
          </div>
          <div className="input-group">
            <label>Phone Number</label>
            <input type="tel" required className="input-field" placeholder="+1 234 567 890" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" required className="input-field" placeholder="Create a strong password" />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>Sign Up</button>
        </form>
      </div>
    </main>
  );
}
