
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    let timer;
    const runLogout = async () => {
      try {
        await api.post('/auth/logout');
      } catch (err) {
        // ignore logout errors
      } finally {
        logout();
        timer = setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      }
    };

    runLogout();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [navigate, logout]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen app-shell">
      <div className="app-card p-8 flex flex-col items-center">
        <svg className="w-16 h-16 text-[var(--primary)] mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
        </svg>
        <h2 className="text-2xl font-bold mb-2 text-[var(--primary)]">Logging out...</h2>
        <p className="text-[var(--muted)]">You are being redirected to the home page.</p>
      </div>
    </div>
  );
}
