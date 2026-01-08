import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleProtectedNav = (e, path) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
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

      {/* Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between shadow relative">
        <div className="text-xl font-bold">MedTracker</div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 items-center relative">
          <Link to="/" className="hover:text-black">Home</Link>
          <Link to="/about" className="hover:text-black">About</Link>
          <Link to="/services" className="hover:text-black">Services</Link>
          <Link to="/contact" className="hover:text-black">Contact</Link>

          <div className="relative group">
            <button className="hover:text-black focus:outline-none">
              Login / Sign Up
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg p-2 z-10 hidden group-hover:block">
              <Link to="/login" className="block px-4 py-2 hover:bg-blue-100 rounded">
                Login
              </Link>
              <Link to="/sign-up" className="block px-4 py-2 hover:bg-blue-100 rounded">
                Sign Up
              </Link>
            </div>
          </div>
        </div>

        {/* Hamburger (Mobile only) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 focus:outline-none"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`}></span>
          <span className={`block w-6 h-0.5 bg-white my-1 transition-opacity duration-300 ${menuOpen ? "opacity-0" : "opacity-100"}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-blue-700 text-white flex flex-col items-center py-6 space-y-4 md:hidden animate-slideDown z-20">
            <Link to="/" className="hover:text-black" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/about" className="hover:text-black" onClick={() => setMenuOpen(false)}>About</Link>
            <Link to="/services" className="hover:text-black" onClick={() => setMenuOpen(false)}>Services</Link>
            <Link to="/contact" className="hover:text-black" onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link to="/login" className="hover:text-black" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/sign-up" className="hover:text-black" onClick={() => setMenuOpen(false)}>Sign Up</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between px-6 md:px-20 py-12">
        <div className="max-w-xl">
          <h2 className="font-bold text-4xl md:text-5xl leading-snug">
            Medication <span className="text-blue-700">Management,</span> <br />
            Simplified. <br />
            <span className="text-blue-700">Reminding</span> You To <span className="text-blue-700">Care</span>
          </h2>
          <p className="text-lg mt-5 text-black">
       Optimize medical inventory with real-time stock tracking, expiry monitoring, low-stock alerts, and actionable reports — learn more at /services.
          </p>

          <div className="mt-6">
            <Link
              to="/sign-up"
              onClick={(e) => handleProtectedNav(e, "/sign-up")}
              className="bg-blue-700 text-white px-8 py-3 rounded-2xl hover:bg-black transition"
            >
              Register
            </Link>
          </div>
        </div>

        <div className="mt-10 lg:mt-0 lg:ml-12">
          <img
            src="/Hero pic.jpg"
            alt="Doctor planning treatment"
            className="w-full max-w-md rounded-lg shadow-md"
          />
        </div>
      </div>

      {/* EKG Section */}
      <section className="flex-grow bg-blue-50 flex flex-col items-center justify-center px-6 md:px-20 py-12">
        <main className="text-center">
          <div className="mb-8 mt-15 flex flex-col items-center">
            <svg
              width="340"
              height="80"
              viewBox="0 0 340 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mb-2"
            >
              <polyline
                className="ekg-move"
                points="0,45 40,45 55,65 70,25 90,70 110,45 140,45 160,30 175,60 190,45 320,45"
                fill="none"
                stroke="#2563eb"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Medical Cross with animation */}
              <g className="cross-pulse">
                <rect x="270" y="25" width="30" height="30" rx="6" fill="#fff" stroke="#2563eb" strokeWidth="3" />
                <rect x="282" y="33" width="6" height="18" rx="2" fill="#2563eb" />
                <rect x="276" y="39" width="18" height="6" rx="2" fill="#2563eb" />
              </g>
            </svg>
            <span className="text-blue-700 font-semibold mt-2">
              Real-time Medical Stock Monitoring
            </span>
          </div>
          <h1 className="text-4xl font-bold text-blue-700 mb-3">Welcome to MedTracker</h1>
          <p className="text-lg text-black mb-10 text-center">
            Easily manage your medical inventory, track stock levels in real-time, <br />
            monitor expiry dates, receive low-stock alerts, and generate <br />
            comprehensive reports for efficient healthcare supply management.
          </p>
        </main>
      </section>

      {/* About Section */}
      <div className="flex flex-col md:flex-row items-center justify-center bg-white py-16 px-6 md:px-20">
        <div className="max-w-xl md:mr-6">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">About MedTracker</h1>
          <p className="text-lg text-black mb-4">
            MedTracker is a modern medical stock management platform designed to
            help healthcare facilities efficiently monitor and manage their medical inventory.
          </p>
          <ul className="list-disc pl-6 text-black mb-4">
            <li>Real-time inventory monitoring</li>
            <li>Expiry date tracking and notifications</li>
            <li>Low-stock alerts</li>
            <li>Comprehensive reporting tools</li>
            <li>Secure and user-friendly interface</li>
          </ul>
          {/* <p className="text-md text-black">
            Our mission is to streamline healthcare supply management, reduce waste,
            and improve patient care by providing reliable and easy-to-use inventory solutions.
          </p> */}
        </div>

        <div className="mt-8 md:mt-0">
          <img
            src="/about pic.jpg"
            alt="nurse on duty/about picture"
            className="w-full max-w-sm rounded-lg shadow-md"
          />
        </div>
      </div>

      {/* Services */}
      <section className="bg-blue-100 py-16 px-6 md:px-20">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-6 text-blue-700">Our Services</h2>
        <p className="text-center max-w-2xl mx-auto mb-12 text-gray-700">
          We provide personalized medication reminders, expiry tracking, analytics,
          and secure data storage to help you take control of your health.
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <img src="/analysis.webp" alt="Analytics" className="mx-auto h-28 mb-4" />
            <p className="text-sm text-gray-700">
              Reporting and Analytics provides valuable insights into medication
              adherence and patient outcomes.
            </p>
          </div>
          <div className="text-center">
            <img src="/data sec.jpg" alt="Data security" className="mx-auto h-28 mb-4" />
            <p className="text-sm text-gray-700">
              Ensures data security and integrity through robust encryption,
              authentication, and automated backup systems.
            </p>
          </div>
          <div className="text-center">
            <img src="/expiry.png" alt="Expiry tracker" className="mx-auto h-28 mb-4" />
            <p className="text-sm text-gray-700">
              Stay on top of medication expiration dates with timely reminders.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <h2 className="text-center text-3xl sm:text-4xl font-bold mb-4 text-blue-700">What Our Users Say</h2>
        <p className="text-center font-serif mb-10 max-w-3xl mx-auto text-sm sm:text-base">
          Hear from our satisfied users who have experienced the benefits of MedTracker
          in managing their medical inventory and improving patient care.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-blue-100 p-6 rounded-lg shadow-md max-w-xl mx-auto">
            <p className="mb-4 text-sm sm:text-base">
              "MedTracker has revolutionized the way we manage our medical supplies.
              The real-time tracking and low-stock alerts have significantly reduced
              shortages and improved patient care."
            </p>
            <h3 className="font-bold text-sm sm:text-base">- Dr. Mundi Sarah.</h3>
          </div>

          <div className="bg-blue-100 p-6 rounded-lg shadow-md max-w-xl mx-auto">
            <p className="mb-4 text-sm sm:text-base">
              "The expiry date tracking feature is a game-changer. It has helped us
              minimize waste and ensure that our patients always receive safe and
              effective medications."
            </p>
            <h3 className="font-bold text-sm sm:text-base">- Ngwa Blaise. Pharmacist</h3>
          </div>

          <div className="bg-blue-100 p-6 rounded-lg shadow-md max-w-xl mx-auto">
            <p className="mb-4 text-sm sm:text-base">
              "As a healthcare administrator, MedTracker's reporting tools have provided
              invaluable insights into our inventory management practices, allowing us to
              make data-driven decisions."
            </p>
            <h3 className="font-bold text-sm sm:text-base">- Che Desmond.</h3>
          </div>
        </div>
      </section>
  {/* Frequently Asked Questions */}
<div className="bg-blue-50 p-6 rounded-xl shadow-md max-w-3xl mx-auto">
  <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
    Frequently Asked Questions
  </h2>

  <div className="space-y-4">
    {/* FAQ Card */}
    <div className="bg-white p-4 rounded-lg shadow-sm h-28 flex flex-col justify-center">
      <h3 className="font-semibold text-gray-800">
        What is MedTracker?
      </h3>
      <p className="text-gray-600 text-sm mt-2">
        MedTracker is a medical inventory management system that helps clinics,
        pharmacies, and hospitals track stock, expiry dates, suppliers, and
        generate reports.
      </p>
    </div>

    <div className="bg-white p-4 rounded-lg shadow-sm h-28 flex flex-col justify-center">
      <h3 className="font-semibold text-gray-800">
        Who can use MedTracker?
      </h3>
      <p className="text-gray-600 text-sm mt-2">
        Hospitals, clinics, pharmacies, laboratories, NGOs, and any health
        facility that manages medical supplies.
      </p>
    </div>

    <div className="bg-white p-4 rounded-lg shadow-sm h-28 flex flex-col justify-center">
      <h3 className="font-semibold text-gray-800">
        Does MedTracker alert for expired items?
      </h3>
      <p className="text-gray-600 text-sm mt-2">
        Yes. MedTracker alerts you about expired items, expiring soon, low-stock,
        and out-of-stock items.
      </p>
    </div>

    <div className="bg-white p-4 rounded-lg shadow-sm h-28 flex flex-col justify-center">
      <h3 className="font-semibold text-gray-800">
        Can I generate inventory reports?
      </h3>
      <p className="text-gray-600 text-sm mt-2">
        Yes. You can generate stock, expiry, and supplier-based reports.
      </p>
    </div>

    <div className="bg-white p-4 rounded-lg shadow-sm h-28 flex flex-col justify-center">
      <h3 className="font-semibold text-gray-800">
        Is my data secure?
      </h3>
      <p className="text-gray-600 text-sm mt-2">
        MedTracker uses secure authentication, encrypted connections, and
        role-based access control.
      </p>
    </div>

    <div className="bg-white p-4 rounded-lg shadow-sm h-28 flex flex-col justify-center">
      <h3 className="font-semibold text-gray-800">
        Does it work on mobile?
      </h3>
      <p className="text-gray-600 text-sm mt-2">
        Yes, MedTracker is fully responsive and works on mobile, tablet, and
        desktop devices.
      </p>
    </div>
  </div>
</div>



      {/* Contact */}
      <section className="bg-blue-100 py-16 px-6 md:px-20">
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">Contact Us</h1>
          <p className="mb-4 text-gray-700">
            Get in touch with us! Our team is here to answer your questions and help you
            get the most out of MedTracker.
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4">
            <li>
              Email:{" "}
              <a href="mailto:ngwainnocentnweselie3@gmail.com" className="text-blue-600 underline">
                ngwainnocentnweselie3@gmail.com
              </a>
            </li>
            <li>Phone: <span className="text-blue-600">(+237) 670661722</span></li>
            <li>Address: 123 Health St, Wellness City, Cameroon</li>
          </ul>
          <p className="text-sm text-gray-600">We aim to respond to all inquiries within 24 hours.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-blue-600 text-white pt-10 pb-0 relative z-10">
        <div className="mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-8">
          <div>
            <h2 className="text-2xl font-bold">MedTracker</h2>
            <p className="mt-3 text-sm">
              Easily manage your medical inventory, track stock, and generate reports.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/reviews">Reviews</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li>Inventory Management</li>
              <li>Expiry & Stock Alerts</li>
              <li>Reports & Analytics</li>
              <li>Supplier Management</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Contact Us</h3>
            <p className="text-sm">
              Email:{" "}
              <a href="mailto:ngwainnocentnweselie3@gmail.com" className="underline">
                ngwainnocentnweselie3@gmail.com
              </a>
            </p>
            <p className="text-sm">Phone: +237 670-661-722</p>
          </div>
        </div>
        <div className="text-center mt-6 text-sm text-white bg-blue-800 h-10">
          &copy; 2025 MedTracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
}




