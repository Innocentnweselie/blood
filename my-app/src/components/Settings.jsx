import React, { useState, useEffect } from 'react';

export default function Settings() {
  // Profile state
  const [profile, setProfile] = useState({
    name: 'Neba James',
    email: 'ngwa@example.com',
  });
  const [profileMsg, setProfileMsg] = useState('');

  // Password state
  const [password, setPassword] = useState({
    current: '',
    new: '',
  });
  const [passwordMsg, setPasswordMsg] = useState('');

  // Preferences
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileMsg('Profile updated!');
    setTimeout(() => setProfileMsg(''), 2000);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword((prev) => ({ ...prev, [name]: value }));
  };
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password.current || !password.new) {
      setPasswordMsg('Please fill all fields.');
      return;
    }
    setPasswordMsg('Password updated!');
    setPassword({ current: '', new: '' });
    setTimeout(() => setPasswordMsg(''), 2000);
  };

  // Toggle dark mode and update root class
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((d) => !d);
  const toggleNotifications = () => setNotifications((n) => !n);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <h2 className="text-center text-3xl font-bold mb-8 text-blue-800">Settings</h2>

      {/* Profile Section */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 max-w-xl mx-auto transition-colors duration-300">
        <h3 className="text-xl font-semibold mb-4 text-blue-700">Profile Information</h3>
        <form className="space-y-4" onSubmit={handleProfileSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium">Full Name</label>
            <input
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
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
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow"
          >
            Save Changes
          </button>
          {profileMsg && <div className="text-green-600 text-sm mt-2">{profileMsg}</div>}
        </form>
      </section>

      {/* Password Section */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 max-w-xl mx-auto transition-colors duration-300">
        <h3 className="text-xl font-semibold mb-4 text-blue-700">Change Password</h3>
        <form className="space-y-4" onSubmit={handlePasswordSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium">Current Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded-md"
              name="current"
              value={password.current}
              onChange={handlePasswordChange}
              required
              placeholder="Current password"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">New Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded-md"
              name="new"
              value={password.new}
              onChange={handlePasswordChange}
              required
              placeholder="New password"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow"
          >
            Update Password
          </button>
          {passwordMsg && <div className="text-green-600 text-sm mt-2">{passwordMsg}</div>}
        </form>
      </section>

      {/* Preferences Section */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 max-w-xl mx-auto transition-colors duration-300">
        <h3 className="text-xl font-semibold mb-4 text-blue-700">Preferences</h3>
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">Dark Mode</span>
          <button
            onClick={toggleDarkMode}
            className={`px-4 py-1 rounded-full text-white transition-colors duration-200 ${darkMode ? 'bg-gray-800' : 'bg-gray-400'}`}
          >
            {darkMode ? 'On' : 'Off'}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Enable Notifications</span>
          <button
            onClick={toggleNotifications}
            className={`px-4 py-1 rounded-full text-white transition-colors duration-200 ${notifications ? 'bg-green-600' : 'bg-gray-400'}`}
          >
            {notifications ? 'On' : 'Off'}
          </button>
        </div>
      </section>
    </div>
  );
}