import React, { useState } from 'react';
export default function Settings() {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

    const toggleDarkMode = () => setDarkMode(!darkMode);
    const toggleNotifications = () => setNotifications(!notifications);

    return(
        <div className="p-6 bg-gray-100 min-h-screen">
            <h2 className="text-2xl font-semibold mb-6">Settings</h2>

            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Profile Informtion</h3>
                <form className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Full Name</label>
                        <input className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"placeholder="Neba James"/>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Email</label>
                        <input
                        type="email"
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder="ngwa@example.com"/>
                    </div>
                    <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Save Changes
                    </button>

                </form>
                </div>
                {/* Psaaword Section */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                    <form className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium">Current Password</label>
                            <input
                            type="password"
                            className="w-full p-2 border rounded-md"placeholder="......."/>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium">New Password</label>
                            <input 
                            type="password"
                            className="w-full p-2 border rounded-md"
                            placeholder="......."/>
                        </div>
                        <button 
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            Update Password
                            </button>
                    </form>
                    </div>
                    {/* { Preferences Section } */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Preference</h3>
                        <div className="flex items-center justify-between mb-4">
                            <span>Dark Mode</span>
                            <button 
                                onClick={toggleDarkMode}
                                className={`px-3 py-1 rounded-full text-white ${darkMode ? 'bg-gray-800' : 'bg-gray-400'}`}>
                                {darkMode ? 'On' : 'Off'}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Enable Notification</span>
                            <button 
                                onClick={toggleNotifications}
                                className={`px-3 py-1 rounded-full text-white ${notifications ? 'bg-green-600' : 'bg-gray-400'}`}>
                                {notifications ? 'On' : 'Off'}
                            </button>

                        </div>
                    </div>
                </div>

    

    );
}