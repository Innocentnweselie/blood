import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axiosInstance';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import ThemeToggle from "./ThemeToggle";
import { useAuth } from '../context/AuthContext';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const isLoggedIn = isAuthenticated;
  const role = user?.role || 'storekeeper';
  const isSalesRole = role === 'sales' || role === 'storekeeper';
  const dashboardPath = isSalesRole ? '/sales-dashboard' : '/dashboard';
  const captchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY || '';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
    { name: 'Reviews', path: '/reviews' }
  ];
  const visibleLinks = navLinks.filter(l => l.name !== 'Contact');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (captchaSiteKey && !captchaToken) {
      setStatus('Please complete the captcha before sending your message.');
      return;
    }

    const formData = {
      name,
      email,
      message,
    };
    if (captchaToken) {
      formData.captchaToken = captchaToken;
    }

    try {
      await api.post('/contact', formData);
      setStatus('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
      setCaptchaToken('');
      setCaptchaKey((prev) => prev + 1);
    } catch (error) {
      setStatus(error.response?.data?.error || 'Failed to send message. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="app-shell">
      <nav className="app-nav sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="app-container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center font-semibold">MT</div>
            <span className="text-lg font-semibold tracking-wide">MedTracker</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {visibleLinks.map(link => (
              <Link key={link.name} to={link.path} className="hover:text-[var(--primary)] transition-colors">{link.name}</Link>
            ))}
            <ThemeToggle />
            {isLoggedIn ? (
              <Link to={dashboardPath} className="app-btn app-btn-primary text-sm">Dashboard</Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="app-btn app-btn-outline text-sm">Login</Link>
                <Link to="/sign-up" className="app-btn app-btn-primary text-sm">Sign Up</Link>
              </div>
            )}
          </div>
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex flex-col justify-center items-center w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface)]">
              <span className={`block w-5 h-0.5 bg-[var(--text)] transition-transform duration-300 ${menuOpen ? "rotate-45 translate-y-1" : ""}`}></span>
              <span className={`block w-5 h-0.5 bg-[var(--text)] my-1 transition-opacity duration-300 ${menuOpen ? "opacity-0" : "opacity-100"}`}></span>
              <span className={`block w-5 h-0.5 bg-[var(--text)] transition-transform duration-300 ${menuOpen ? "-rotate-45 -translate-y-1" : ""}`}></span>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)]">
            <div className="app-container flex flex-col gap-4 py-6 text-sm font-medium">
              {visibleLinks.map(link => (
                <Link key={link.name} to={link.path} className="hover:text-[var(--primary)] transition-colors" onClick={() => setMenuOpen(false)}>{link.name}</Link>
              ))}
              <div className="flex gap-3 pt-2">
                {isLoggedIn ? <Link to={dashboardPath} className="app-btn app-btn-primary text-sm w-full">Dashboard</Link> : <><Link to="/login" className="app-btn app-btn-outline text-sm w-full">Login</Link><Link to="/sign-up" className="app-btn app-btn-primary text-sm w-full">Sign Up</Link></>}
              </div>
            </div>
          </div>
        )}
      </nav>

      <section className="app-section">
        <div className="app-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold text-[var(--primary)]">Contact Us</h1>
            <p className="text-[var(--muted)]">
              Have questions or need support? Reach out to the MedTracker team and we will
              help you fast.
            </p>
            <div className="app-card p-6 space-y-3 text-sm text-[var(--muted)]">
              <p>
                Email:{' '}
                <a href="mailto:ngwainnocentnweselie3@gmail.com" className="text-[var(--primary)] underline">
                  ngwainnocentnweselie3@gmail.com
                </a>
              </p>
              <p>Phone: +237 670661722</p>
              <p>address: 123 Health St Bonaberi, Cameroon</p>
            </div>
          </div>

          <div className="app-card p-8">
            <h2 className="text-xl font-semibold mb-4">Send a message</h2>
            {status && (
              <p className={`text-sm mb-4 ${status.includes('successfully') ? 'text-emerald-600' : 'text-rose-500'}`}>
                {status}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="app-input"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="app-input"
                  placeholder="Your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="app-input min-h-[140px]"
                  placeholder="Tell us what you need"
                  required
                />
              </div>

              {captchaSiteKey && (
                <div className="space-y-2">
                  <HCaptcha
                    key={captchaKey}
                    sitekey={captchaSiteKey}
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken('')}
                    onError={() => setStatus('Captcha failed. Please try again.')}
                  />
                  <p className="text-xs text-[var(--muted)]">Protected by hCaptcha to prevent abuse.</p>
                </div>
              )}

              <button type="submit" className="app-btn app-btn-primary w-full">
                Send message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
