import React, { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }
    setMessage("If this email exists, a password reset link has been sent.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800">
          Forgot Password
        </h2>

        {message && (
          <div className="mb-4 text-blue-500 text-sm sm:text-base text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Send Reset Link
          </button>
        </form>

        {/* Back to login link */}
        <p className="mt-6 text-center text-sm sm:text-base text-gray-600">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

