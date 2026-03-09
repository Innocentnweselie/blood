import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";
import api from "../utils/axiosInstance";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword: password });
      toast.success("Password reset successful! Please login.");
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || "Reset failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center app-shell">
      <div className="app-card p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-[var(--text)]">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-[var(--muted)]">OTP Code</label>
            <input
              type="text"
              className="app-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-[var(--muted)]">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="app-input pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-[var(--muted)] hover:text-[var(--text)]"
                aria-label={showPassword ? "Hide new password" : "Show new password"}
              >
                {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-[var(--muted)]">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="app-input pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-[var(--muted)] hover:text-[var(--text)]"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="app-btn app-btn-primary w-full"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
