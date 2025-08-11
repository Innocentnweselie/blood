

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  // Simulate authentication state (replace with real auth logic)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const navigate = useNavigate();

  // Handler for protected navigation
  const handleProtectedNav = (e, path) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="text-xl font-bold">MedTracker</div>
        <div className="flex gap-6 items-center relative">
          <Link to="/" className="hover:text-black">Home</Link>
          {/* Login/Sign-up Dropdown replaced with navigation links */}
          <div className="relative group">
            <button className="hover:text-black focus:outline-none">Login / Sign Up</button>
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg p-2 z-10 hidden group-hover:block group-focus:block">
              <Link to="/login" className="block px-4 py-2 hover:bg-blue-100 rounded">Login</Link>
              <Link to="/sign-up" className="block px-4 py-2 hover:bg-blue-100 rounded">Sign Up</Link>
            </div>
          </div>
          <Link to="/about" className="hover:text-black">About</Link>
          <Link to="/contact" className="hover:text-black">Contact</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {/* Animated Heartbeat (EKG) Line with Medical Cross */}
        <div className="mb-8 mt-10 flex flex-col items-center">
          <svg width="320" height="90" viewBox="0 0 320 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* EKG Line */}
            <polyline
              id="ekg-line"
              points="0,45 40,45 55,65 70,25 90,70 110,45 140,45 160,30 175,60 190,45 320,45"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <animate attributeName="stroke-dasharray" values="0,1000;400,1000" dur="2s" repeatCount="indefinite" />
              <animate attributeName="stroke-dashoffset" values="400;0" dur="2s" repeatCount="indefinite" />
            </polyline>
            {/* Medical Cross */}
            <g>
              <rect x="270" y="25" width="30" height="30" rx="6" fill="#fff" stroke="#2563eb" strokeWidth="3" />
              <rect x="282" y="33" width="6" height="18" rx="2" fill="#2563eb" />
              <rect x="276" y="39" width="18" height="6" rx="2" fill="#2563eb" />
            </g>
          </svg>
          <span className="text-blue-700 font-semibold mt-2">Real-time Medical Stock Monitoring</span>
        </div>
        <h1 className="text-4xl font-bold text-blue-800 mb-4 mt-2">Welcome to MedTracker</h1>
        <p className="text-lg text-black mb-8">Easily manage your medical inventory, track stock levels in real-time,<br></br> monitor expiry dates, receive low-stock alerts, and generate <br></br>comprehensive reports for efficient healthcare supply management.</p>
        {/* Main Content restored to original */}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-black py-4 border-t mt-8">
        Medical Stock Tracker — © {new Date().getFullYear()} All rights reserved.
      </footer>
    </div>
  );
}


