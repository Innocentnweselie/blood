import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isLoggedIn = isAuthenticated;
  const role = user?.role || 'storekeeper';
  const isSalesRole = role === 'sales' || role === 'storekeeper';
  const dashboardPath = isSalesRole ? '/sales-dashboard' : '/dashboard';
  const attemptedPath = `${location.pathname}${location.search}`;

  return (
    <div className="app-shell flex flex-col">
      <style>{`
        @keyframes floatDrift {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-12px) translateX(6px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
        .error-orb {
          animation: floatDrift 6s ease-in-out infinite;
        }
        .error-glow {
          animation: pulseGlow 4s ease-in-out infinite;
        }
      `}</style>

      <nav className="app-nav sticky top-0 z-40">
        <div className="app-container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center font-semibold">
              MT
            </div>
            <span className="text-lg font-semibold tracking-wide">MedTracker</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="app-btn app-btn-outline text-sm">Home</Link>
            {isLoggedIn && (
              <Link to={dashboardPath} className="app-btn app-btn-primary text-sm">Dashboard</Link>
            )}
          </div>
        </div>
      </nav>

      <section className="app-section app-hero flex-1">
        <div className="app-container">
          <div className="app-card p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-10 -right-8 h-32 w-32 rounded-full bg-[var(--accent)]/30 blur-3xl error-orb" aria-hidden="true"></div>
            <div className="absolute bottom-0 -left-10 h-40 w-40 rounded-full bg-[var(--primary)]/20 blur-3xl error-glow" aria-hidden="true"></div>

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div className="space-y-6">
                <p className="app-chip">Error 404</p>
                <h1 className="text-5xl md:text-6xl font-semibold leading-tight">
                  Page or item not found.
                </h1>
                <p className="text-[var(--muted)] text-base md:text-lg max-w-xl">
                  The link might be broken, the page may have moved, or the address was mistyped.
                  You can head back home or jump into your dashboard.
                </p>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted)]">
                  Tried:
                  <span className="ml-2 font-mono text-[var(--text)] break-all">
                    {attemptedPath || '/'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/" className="app-btn app-btn-primary">Back to Home</Link>
                  {isLoggedIn ? (
                    <Link to={dashboardPath} className="app-btn app-btn-outline">Open Dashboard</Link>
                  ) : (
                    <Link to="/login" className="app-btn app-btn-outline">Log In</Link>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="app-btn app-btn-outline"
                  >
                    Go Back
                  </button>
                </div>
              </div>

              <div className="app-card-strong p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-3">Popular destinations</h2>
                <p className="text-sm text-[var(--muted)] mb-6">
                  These pages usually get you back on track quickly.
                </p>
                <div className="grid gap-3 text-sm">
                  <Link to="/services" className="app-btn app-btn-outline justify-between">
                    Services
                    <span className="text-[var(--muted)]">Overview</span>
                  </Link>
                  <Link to="/contact" className="app-btn app-btn-outline justify-between">
                    Contact
                    <span className="text-[var(--muted)]">Support</span>
                  </Link>
                  <Link to="/reviews" className="app-btn app-btn-outline justify-between">
                    Reviews
                    <span className="text-[var(--muted)]">Customer stories</span>
                  </Link>
                  <Link to="/privacy-policy" className="app-btn app-btn-outline justify-between">
                    Privacy Policy
                    <span className="text-[var(--muted)]">Compliance</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
