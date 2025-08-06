
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear user session/token here if needed
    // localStorage.removeItem('token');
    const timer = setTimeout(() => {
      navigate('/');
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center">
        <svg className="w-16 h-16 text-blue-500 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
        </svg>
        <h2 className="text-2xl font-bold mb-2 text-blue-700">Logging out...</h2>
        <p className="text-gray-600">You are being redirected to the login page.</p>
      </div>
    </div>
  );
}
