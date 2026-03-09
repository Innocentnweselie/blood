import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isLoggedIn = isAuthenticated;
  const role = user?.role || 'storekeeper';
  const isSalesRole = role === 'sales' || role === 'storekeeper';
  const dashboardPath = isSalesRole ? '/sales-dashboard' : '/dashboard';

  return (
    <div className="app-shell flex flex-col">
      <style>{`
        @keyframes pulseCross {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          25% {
            transform: translateY(-3px) scale(1.1);
          }
          50% {
            transform: translateY(3px) scale(1.15);
          }
          75% {
            transform: translateY(-3px) scale(1.1);
          }
        }
        .cross-pulse {
          animation: pulseCross 1.8s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes ekg-move {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -600;
          }
        }
        .ekg-move {
          stroke-dasharray: 100;
          stroke-dashoffset: 0;
          animation: ekg-move 2s linear infinite;
        }
      `}</style>

      <nav className="app-nav sticky top-0 z-40">
        <div className="app-container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center font-semibold">
              MT
            </div>
            <span className="text-lg font-semibold tracking-wide">MedTracker</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
            <Link to="/about" className="hover:text-[var(--primary)] transition-colors">About</Link>
            <Link to="/services" className="hover:text-[var(--primary)] transition-colors">Services</Link>
            <Link to="/contact" className="hover:text-[var(--primary)] transition-colors">Contact</Link>
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
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col justify-center items-center w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface)]"
              aria-label="Toggle Menu"
            >
              <span className={`block w-5 h-0.5 bg-[var(--text)] transition-transform duration-300 ${menuOpen ? "rotate-45 translate-y-1" : ""}`}></span>
              <span className={`block w-5 h-0.5 bg-[var(--text)] my-1 transition-opacity duration-300 ${menuOpen ? "opacity-0" : "opacity-100"}`}></span>
              <span className={`block w-5 h-0.5 bg-[var(--text)] transition-transform duration-300 ${menuOpen ? "-rotate-45 -translate-y-1" : ""}`}></span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)]">
            <div className="app-container flex flex-col gap-4 py-6 text-sm font-medium">
              <Link to="/" className="hover:text-[var(--primary)] transition-colors" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/about" className="hover:text-[var(--primary)] transition-colors" onClick={() => setMenuOpen(false)}>About</Link>
              <Link to="/services" className="hover:text-[var(--primary)] transition-colors" onClick={() => setMenuOpen(false)}>Services</Link>
              <Link to="/contact" className="hover:text-[var(--primary)] transition-colors" onClick={() => setMenuOpen(false)}>Contact</Link>
              <div className="flex gap-3 pt-2">
                {isLoggedIn ? (
                  <Link to={dashboardPath} className="app-btn app-btn-primary text-sm w-full">Dashboard</Link>
                ) : (
                  <>
                    <Link to="/login" className="app-btn app-btn-outline text-sm w-full">Login</Link>
                    <Link to="/sign-up" className="app-btn app-btn-primary text-sm w-full">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <section className="app-hero app-section">
        <div className="app-container grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <span className="app-chip">Expiry intelligence</span>
              <span className="app-chip">Low-stock alerts</span>
              <span className="app-chip">Supplier insights</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Medication management, elevated for modern clinics.
            </h1>
            <p className="text-base md:text-lg text-[var(--muted)] max-w-xl">
              Optimize medical inventory with real-time stock tracking, expiry monitoring,
              low-stock alerts, and actionable reports - built for teams that need clarity fast.
            </p>
            <div className="flex flex-wrap gap-4">
              {isLoggedIn ? (
                <Link to={dashboardPath} className="app-btn app-btn-primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/sign-up" className="app-btn app-btn-primary">
                    Create your workspace
                  </Link>
                  <Link to="/login" className="app-btn app-btn-outline">
                    See live dashboards
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[var(--accent)]/20 blur-3xl"></div>
            <img
              src="/Hero%20pic.jpg"
              alt="Doctor planning treatment"
              className="w-full max-w-md rounded-3xl shadow-2xl border border-[var(--border)]"
            />
            <div className="app-card absolute -bottom-6 left-6 p-4 hidden sm:block">
              <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Live signals</p>
              <p className="text-lg font-semibold">Inventory updates in seconds</p>
            </div>
          </div>
        </div>
      </section>

      <section className="app-section app-section-alt">
        <div className="app-container">
          <div className="app-panel p-8 md:p-10 text-center">
            <div className="flex flex-col items-center">
              <svg
                width="340"
                height="80"
                viewBox="0 0 340 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mb-4"
              >
                <polyline
                  className="ekg-move"
                  points="0,45 40,45 55,65 70,25 90,70 110,45 140,45 160,30 175,60 190,45 320,45"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <g className="cross-pulse">
                  <rect x="270" y="25" width="30" height="30" rx="6" fill="var(--surface)" stroke="var(--primary)" strokeWidth="3" />
                  <rect x="282" y="33" width="6" height="18" rx="2" fill="var(--primary)" />
                  <rect x="276" y="39" width="18" height="6" rx="2" fill="var(--primary)" />
                </g>
              </svg>
              <span className="app-chip">Real-time medical stock monitoring</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold mt-6">
              Welcome to MedTracker
            </h2>
            <p className="text-base md:text-lg text-[var(--muted)] mt-4">
              Easily manage your medical inventory, track stock levels in real-time,
              monitor expiry dates, receive low-stock alerts, and generate comprehensive reports.
            </p>
          </div>
        </div>
      </section>

      <section className="app-section">
        <div className="app-container grid gap-10 md:grid-cols-2 items-center">
          <div className="app-card p-8">
            <h2 className="text-3xl font-semibold text-[var(--primary)] mb-4">About MedTracker</h2>
            <p className="text-[var(--muted)] mb-4">
              MedTracker is a modern medical stock management platform designed to help
              healthcare facilities efficiently monitor and manage their medical inventory.
            </p>
            <ul className="list-disc pl-6 text-[var(--muted)] space-y-2">
              <li>Real-time inventory monitoring</li>
              <li>Expiry date tracking and notifications</li>
              <li>Low-stock alerts</li>
              <li>Comprehensive reporting tools</li>
              <li>Secure and user-friendly interface</li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -bottom-8 -left-6 h-32 w-32 rounded-full bg-[var(--primary)]/15 blur-3xl"></div>
            <img
              src="/about%20pic.jpg"
              alt="Nurse on duty"
              className="w-full max-w-md rounded-3xl shadow-2xl border border-[var(--border)]"
            />
          </div>
        </div>
      </section>

      <section className="app-section app-section-alt">
        <div className="app-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-[var(--primary)]">Our Services</h2>
            <p className="text-[var(--muted)] mt-3 max-w-2xl mx-auto">
              Personalized medication reminders, expiry tracking, analytics,
              and secure data storage to help you take control of your inventory.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                img: "/analysis.webp",
                title: "Reporting and Analytics",
                text: "Insightful reporting that helps you make confident supply decisions.",
              },
              {
                img: "/data%20sec.jpg",
                title: "Data Security",
                text: "Robust encryption, authentication, and automated backup systems.",
              },
              {
                img: "/expiry.png",
                title: "Expiry Tracker",
                text: "Smart reminders keep you ahead of expiry risk and wastage.",
              },
            ].map((service) => (
              <div key={service.title} className="app-card p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <img src={service.img} alt={service.title} className="mx-auto h-24 mb-5" />
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-sm text-[var(--muted)]">{service.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="app-section">
        <div className="app-container">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--primary)]">What Our Users Say</h2>
            <p className="text-[var(--muted)] max-w-3xl mx-auto mt-3">
              Hear from our users who have experienced the benefits of MedTracker
              in managing inventory and improving patient care.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "MedTracker has revolutionized how we manage supplies. Real-time tracking and low-stock alerts have reduced shortages dramatically.",
                name: "Dr. Mundi Sarah",
              },
              {
                quote:
                  "The expiry tracker is a game-changer. We minimize waste while keeping patients safe.",
                name: "Ngwa Blaise, Pharmacist",
              },
              {
                quote:
                  "The reporting tools give us the insight to make better, faster decisions every week.",
                name: "Che Desmond",
              },
            ].map((review) => (
              <div key={review.name} className="app-card p-6">
                <p className="text-sm text-[var(--muted)] mb-4">"{review.quote}"</p>
                <h3 className="font-semibold">{review.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="app-section app-section-alt">
        <div className="app-container">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-[var(--primary)]">Frequently Asked Questions</h2>
            <p className="text-[var(--muted)] mt-3">Quick answers to keep you moving.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                q: "What is MedTracker?",
                a: "A medical inventory management system that tracks stock, expiry dates, suppliers, and reports.",
              },
              {
                q: "Who can use MedTracker?",
                a: "Hospitals, clinics, pharmacies, laboratories, NGOs, and any health facility managing supplies.",
              },
              {
                q: "Does MedTracker alert for expired items?",
                a: "Yes. Alerts cover expired, expiring soon, low-stock, and out-of-stock items.",
              },
              {
                q: "Can I generate inventory reports?",
                a: "Yes. Generate stock, expiry, and supplier-based reports anytime.",
              },
              {
                q: "Is my data secure?",
                a: "We use secure authentication, encrypted connections, and role-based access control.",
              },
              {
                q: "Does it work on mobile?",
                a: "Yes, MedTracker is responsive across mobile, tablet, and desktop devices.",
              },
            ].map((faq) => (
              <div key={faq.q} className="app-card p-5">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-[var(--muted)]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="app-section">
        <div className="app-container">
          <div className="app-card p-8 md:p-10">
            <h2 className="text-3xl font-semibold text-[var(--primary)] mb-4">Contact Us</h2>
            <p className="text-[var(--muted)] mb-4">
              Get in touch with us. Our team is here to answer your questions and help you
              get the most out of MedTracker.
            </p>
            <ul className="list-disc pl-6 text-[var(--muted)] space-y-2 mb-4">
              <li>
                Email:{" "}
                <a href="mailto:ngwainnocentnweselie3@gmail.com" className="text-[var(--primary)] underline">
                  ngwainnocentnweselie3@gmail.com
                </a>
              </li>
              <li>Phone: <span className="text-[var(--primary)]">(+237) 670661722</span></li>
              <li>address: 123 Health St Bonaberi, Cameroon</li>
            </ul>
            <p className="text-sm text-[var(--muted)]">We aim to respond to all inquiries within 24 hours.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="app-container grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          <div>
            <h2 className="text-xl font-semibold">MedTracker</h2>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Manage medical inventory, track stock, and generate reports with confidence.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/reviews">Reviews</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Our Services</h3>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>Inventory Management</li>
              <li>Expiry and Stock Alerts</li>
              <li>Reports and Analytics</li>
              <li>Supplier Management</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <p className="text-sm text-[var(--muted)]">
              Email:{" "}
              <a href="mailto:ngwainnocentnweselie3@gmail.com" className="underline">
                ngwainnocentnweselie3@gmail.com
              </a>
            </p>
            <p className="text-sm text-[var(--muted)]">Phone: +237 670-661-722</p>
          </div>
        </div>
        <div className="border-t border-[var(--border)] text-center py-4 text-xs text-[var(--muted)]">
          (c) 2025 MedTracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
