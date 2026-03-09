﻿import React, { useState } from "react";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const SignUp = ({ onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const MIN_PASSWORD_LENGTH = 8;

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const getRedirectTarget = () => {
    const fromState = location.state?.from;
    if (fromState?.pathname) {
      return `${fromState.pathname}${fromState.search || ""}${fromState.hash || ""}`;
    }
    try {
      const stored = sessionStorage.getItem("postLoginRedirect");
      if (stored) return stored;
    } catch (err) {
      // ignore storage issues
    }
    return "/dashboard";
  };

  const clearRedirectTarget = () => {
    try {
      sessionStorage.removeItem("postLoginRedirect");
    } catch (err) {
      // ignore storage issues
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otpSent) {
      await verifyOtp();
    } else {
      await requestOtp();
    }
  };

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  const requestOtp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      const { data } = await api.post("/auth/register", formData);
      if (data?.otp) {
        setOtp(data.otp);
        setOtpNotice("Email delivery failed. Use the prefilled code to verify.");
        toast.info(`Dev OTP: ${data.otp}`);
      } else {
        setOtpNotice("");
        toast.success("Verification code sent. Check your email.");
      }
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send verification code.");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the verification code.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/register/verify", { email, otp });
      if (data?.user) {
        login(data.user);
      }
      toast.success("Account created successfully!");
      const target = getRedirectTarget();
      clearRedirectTarget();
      navigate(target);
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const apiBase = baseUrl
      ? baseUrl.endsWith("/api")
        ? baseUrl
        : `${baseUrl}/api`
      : "/api";
    window.location.href = `${apiBase}/auth/google`;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-blue-200 dark:bg-slate-950 px-4 sm:px-6">
      <div className="relative bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md md:max-w-lg">
        {onClose && (
          <button
            className="absolute top-3 right-3 text-gray-600 dark:text-slate-300 hover:text-red-500"
            onClick={onClose}
          >
            x
          </button>
        )}

        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800 dark:text-slate-100">
          Sign Up
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">
              Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={otpSent || submitting}
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">
              Profile Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-600 dark:text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-slate-200 dark:hover:file:bg-slate-700"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              disabled={otpSent || submitting}
            />
            {avatarPreview && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={avatarPreview}
                  alt="Selected profile"
                  className="h-14 w-14 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {avatarFile?.name}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={otpSent || submitting}
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                minLength={MIN_PASSWORD_LENGTH}
                disabled={otpSent || submitting}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                minLength={MIN_PASSWORD_LENGTH}
                disabled={otpSent || submitting}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>

          {otpSent && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">
                Verification Code
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the 6-digit code"
                disabled={submitting}
                required
              />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                {otpNotice || `We emailed a verification code to ${email}.`}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-60"
            disabled={submitting}
          >
            {submitting
              ? otpSent
                ? "Verifying..."
                : "Sending..."
              : otpSent
              ? "Verify & Create Account"
              : "Send Verification Code"}
          </button>

          {!otpSent && (
            <>
              <div className="relative flex items-center justify-center w-full mt-4 border-t border-slate-300 dark:border-slate-700 pt-4">
                <div className="absolute px-3 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-sm -top-2.5">
                  Or
                </div>
              </div>

              {/* <button
                type="button"
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-slate-200 font-medium"
              >
                <FcGoogle size={20} />
                Sign up with Google
              </button> */}
            </>
          )}

          <p className="text-center text-sm sm:text-base mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
