import React, { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import { useTheme } from '../context/ThemeContext';
import AdminLayout from './AdminLayout';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { theme, toggleTheme, applyTheme } = useTheme();
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [notifications, setNotifications] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/settings/profile');
        const user = data?.user;
        if (user) {
          setProfile({ name: user.name || '', email: user.email || '' });
          updateUser({
            name: user.name || '',
            email: user.email || '',
            theme: user.theme || theme,
          });
        }
        setProfileError('');
      } catch (err) {
        setProfileError(err.response?.data?.error || 'Failed to load profile.');
      } finally {
        setLoadingProfile(false);
      }
    };

    const loadTheme = async () => {
      try {
        const { data } = await api.get('/settings/theme');
        if (data?.theme && data.theme !== theme) {
          applyTheme(data.theme);
        }
      } catch (err) {
        console.error('Failed to load theme preference:', err);
      }
    };

    loadProfile();
    loadTheme();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');

    try {
      const { data } = await api.put('/settings/profile', profile);
      const user = data?.user;
      if (user) {
        setProfile({ name: user.name || '', email: user.email || '' });
        updateUser({
          name: user.name || '',
          email: user.email || '',
          theme: user.theme || theme,
        });
      }
      setProfileMsg('Profile updated!');
      setTimeout(() => setProfileMsg(''), 2000);
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to update profile.');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (!password.currentPassword || !password.newPassword) {
      setPasswordError('Please fill all fields.');
      return;
    }

    try {
      await api.put('/settings/password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      updateUser({ mustChangePassword: false });
      setPasswordMsg('Password updated!');
      setPassword({ currentPassword: '', newPassword: '' });
      setTimeout(() => setPasswordMsg(''), 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to update password.');
    }
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    updateUser({ theme: nextTheme });
  };

  const toggleNotifications = () => setNotifications((n) => !n);

  return (
    <AdminLayout title="Settings">
      <div className="p-4 sm:p-6">
        <h2 className="text-center text-2xl sm:text-3xl font-semibold mb-8 text-[var(--primary)]">
          Settings
        </h2>

      {/* Profile Section */}
      <section className="app-card p-4 sm:p-6 mb-8 max-w-xl w-full mx-auto">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-[var(--primary)]">
          Profile Information
        </h3>
        {loadingProfile && <div className="text-sm text-[var(--muted)] mb-2">Loading profile...</div>}
        {profileError && <div className="text-sm text-rose-500 mb-2">{profileError}</div>}
        <form className="space-y-4" onSubmit={handleProfileSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium">Full Name</label>
            <input
              className="app-input"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              className="app-input"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              required
            />
          </div>
          <button
            type="submit"
            className="app-btn app-btn-primary w-full sm:w-auto"
          >
            Save Changes
          </button>
          {profileMsg && <div className="text-emerald-500 text-sm mt-2">{profileMsg}</div>}
        </form>
      </section>

      {/* Password Section */}
      <section className="app-card p-4 sm:p-6 mb-8 max-w-xl w-full mx-auto">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-[var(--primary)]">
          Change Password
        </h3>
        {passwordError && <div className="text-sm text-rose-500 mb-2">{passwordError}</div>}
        <form className="space-y-4" onSubmit={handlePasswordSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium">Current Password</label>
            <input
              type="password"
              className="app-input"
              name="currentPassword"
              value={password.currentPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Current password"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">New Password</label>
            <input
              type="password"
              className="app-input"
              name="newPassword"
              value={password.newPassword}
              onChange={handlePasswordChange}
              required
              placeholder="New password"
            />
          </div>
          <button
            type="submit"
            className="app-btn app-btn-primary w-full sm:w-auto"
          >
            Update Password
          </button>
          {passwordMsg && <div className="text-emerald-500 text-sm mt-2">{passwordMsg}</div>}
        </form>
      </section>

      {/* Preferences Section */}
      <section className="app-card p-4 sm:p-6 max-w-xl w-full mx-auto">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-[var(--primary)]">
          Preferences
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <span className="font-medium">Dark Mode</span>
          <button
            onClick={handleThemeToggle}
            className={`app-btn ${theme === 'dark' ? 'app-btn-primary' : 'app-btn-outline'}`}
          >
            {theme === 'dark' ? 'On' : 'Off'}
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span className="font-medium">Enable Notifications</span>
          <button
            onClick={toggleNotifications}
            className={`app-btn ${notifications ? 'app-btn-primary' : 'app-btn-outline'}`}
          >
            {notifications ? 'On' : 'Off'}
          </button>
        </div>
      </section>
      </div>
    </AdminLayout>
  );
}
