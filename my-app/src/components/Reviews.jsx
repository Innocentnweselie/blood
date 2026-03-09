import React, { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const Reviews = () => {
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
  const visibleLinks = navLinks.filter(l => l.name !== 'Reviews');

  return (
    <section className="app-shell">
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

    <div className="app-section">
      <div className="app-container">
        <h2 className="text-center text-3xl sm:text-4xl font-semibold text-[var(--primary)] mb-4">
          What Our Users Say
        </h2>
        <p className="text-center text-[var(--muted)] mb-10 max-w-3xl mx-auto text-sm sm:text-base">
          Hear from our users who have experienced the benefits of MedTracker
          in managing medical inventory and improving patient care.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              text:
                "MedTracker has revolutionized how we manage supplies. Real-time tracking and low-stock alerts have reduced shortages dramatically.",
              name: "Dr. Mundi Sarah",
            },
            {
              text:
                "The expiry date tracking feature is a game-changer. It has helped us minimize waste and keep patients safe.",
              name: "Ngwa Blaise, Pharmacist",
            },
            {
              text:
                "Reporting tools deliver invaluable insights into our inventory management practices so we can make data-driven decisions.",
              name: "Che Desmond",
            },
          ].map((review) => (
            <div key={review.name} className="app-card p-6">
              <p className="mb-4 text-sm sm:text-base text-[var(--muted)]">
                "{review.text}"
              </p>
              <h3 className="font-semibold text-sm sm:text-base">{review.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
  );
};

export default Reviews;
