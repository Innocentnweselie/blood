import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import SignUp from './components/Sign-up.jsx';
import Dashboard from './dashboard/Dashboard.jsx';
import Settings from './components/Settings.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

