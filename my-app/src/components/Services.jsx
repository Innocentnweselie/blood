import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const Services = ({
  title = "Our Services",
  description =
    "We provide personalized medication reminders and tracking to help you stay on top of your treatment plan. With features like customizable alerts, medication database, and secure storage, MedTracker empowers you to deliver better outcomes.",
  services = [
    {
      img: "/analysis.webp",
      alt: "Reporting and Analytics",
      text:
        "Reporting and analytics give you the insights needed to improve adherence and optimize care.",
    },
    {
      img: "/data%20sec.jpg",
      alt: "Data Security",
      text:
        "Data security ensures encryption, authentication, and automated backup systems for confidence.",
    },
    {
      img: "/expiry.png",
      alt: "Expiry Tracker",
      text:
        "Expiry tracking keeps you ahead of medication expiration dates with proactive alerts.",
    },
  ],
}) => {
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
  const visibleLinks = navLinks.filter(l => l.name !== 'Services');

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

      <div className="app-section app-section-alt">
        <div className="app-container">
          <motion.h2
            className="text-center text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--primary)] mb-4"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {title}
          </motion.h2>

          <motion.p
            className="text-center text-[var(--muted)] text-sm sm:text-base max-w-2xl mx-auto mb-10 px-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {description}
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                className="app-card p-6 text-center"
                initial={{ opacity: 0, y: 50, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: idx * 0.15 }}
                whileHover={{
                  scale: 1.04,
                  boxShadow:
                    "0px 16px 40px rgba(15, 23, 42, 0.2)",
                }}
              >
                <img
                  src={service.img}
                  alt={service.alt}
                  className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 object-contain mb-4 mx-auto"
                />
                <p className="text-sm sm:text-base text-[var(--muted)]">{service.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
