import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from "./ThemeToggle";
import { useAuth } from '../context/AuthContext';

export default function About() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const isLoggedIn = isAuthenticated;
  const role = user?.role || 'storekeeper';
  const isSalesRole = role === 'sales' || role === 'storekeeper';
  const dashboardPath = isSalesRole ? '/sales-dashboard' : '/dashboard';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
    { name: 'Reviews', path: '/reviews' }
  ];
  const visibleLinks = navLinks.filter(l => l.name !== 'About');

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
        <div className="app-container grid gap-10 md:grid-cols-2 items-center">
          <div className="app-card p-8">
            <h1 className="text-3xl font-semibold text-[var(--primary)] mb-4">
              About MedTracker
            </h1>
            <p className="text-[var(--muted)] mb-4">
              MedTracker is a modern medical stock management platform designed to help
              healthcare facilities efficiently monitor and manage their medical inventory.
            </p>

            <ul className="list-disc pl-6 text-[var(--muted)] space-y-2 mb-4">
              <li>Real-time inventory monitoring</li>
              <li>Expiry date tracking and notifications</li>
              <li>Low-stock alerts</li>
              <li>Comprehensive reporting tools</li>
              <li>Secure and user-friendly interface</li>
            </ul>

            <p className="text-[var(--muted)]">
              Our mission is to streamline healthcare supply management, reduce waste, and
              improve patient care by providing reliable and easy-to-use inventory solutions.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -right-6 h-32 w-32 rounded-full bg-[var(--accent)]/20 blur-3xl"></div>
            <img
              src="/about%20pic.jpg"
              alt="Nurse on duty"
              className="w-full h-auto max-w-md rounded-3xl object-cover border border-[var(--border)] shadow-2xl"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
