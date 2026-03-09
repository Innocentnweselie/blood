import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success(`OTP sent to ${email}. Please check your console/email.`);
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send OTP.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center app-shell px-4 sm:px-6 lg:px-8">
      <div className="app-card p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-[var(--text)]">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-[var(--muted)]">
              Email
            </label>
            <input
              type="email"
              className="app-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <button
            type="submit"
            className="app-btn app-btn-primary w-full"
          >
            Send Reset Link
          </button>
        </form>

        {/* Back to login link */}
        <p className="mt-6 text-center text-sm sm:text-base text-[var(--muted)]">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="text-[var(--primary)] hover:underline font-medium"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
