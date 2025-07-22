import React, { useState } from "react";
import Login from "../auth/Login";
import SignUp from "../auth/SignUp";

const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleShowLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
  };

  const handleShowSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
  };

  const handleClose = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  return (
    <div className="bg-white shadow-md px-4 py-3 flex justify-between items-center relative z-40">
      <h2 className="text-xl font-bold text-gray-800">Welcome to MedTracker</h2>
      <div className="space-x-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleShowLogin}
        >
          Login
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleShowSignup}
        >
          Sign Up
        </button>
      </div>

      {/* Pop-up Forms */}
      {showLogin && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
          <Login onSwitch={handleShowSignup} onClose={handleClose} />
        </div>
      )}
      {showSignup && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
          <SignUp onSwitch={handleShowLogin} onClose={handleClose} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
