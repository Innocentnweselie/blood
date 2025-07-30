import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import SignUp from './components/Sign-up.jsx';
import Dashboard from './dashboard/Dashboard.jsx';
import Settings from './components/Settings.jsx';
import Supplier from './components/Supplier.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import Report from './components/Report.jsx';
import Inventory from './components/Inventory.jsx';
import Logout from './components/Logout.jsx';
// import StockContext from './content/StockContext';
// Correct usage: StockProvider should wrap the app in main.jsx, not as a route/page

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/supplier" element={<Supplier />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/report" element={<Report/>} />
        <Route path="/inventory" element={<Inventory/>} />
         <Route path="/logout" element ={<Logout/>} /> */
        {/* <Route path="/stockcontext" element={<StockContext />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

