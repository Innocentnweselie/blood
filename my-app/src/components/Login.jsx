import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Login = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, loading } = useAuth();

  const isSalesRole = (role) => role === "sales" || role === "storekeeper";
  const getDefaultDashboard = (role) => (isSalesRole(role) ? "/sales-dashboard" : "/dashboard");

  const isAdminOnlyPath = (path) => {
    const adminPrefixes = [
      "/dashboard",
      "/inventory",
      "/create-item",
      "/edit-item",
      "/suppliers",
      "/categories",
      "/purchases",
      "/report",
      "/settings",
      "/sales-team",
    ];
    return adminPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  };

  const isSalesOnlyPath = (path) => path === "/sales-dashboard" || path.startsWith("/sales-dashboard/");

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
    return null;
  };

  const resolveRedirectTarget = (role) => {
    const target = getRedirectTarget();
    const defaultTarget = getDefaultDashboard(role);
    if (!target) return defaultTarget;
    if (isSalesRole(role) && isAdminOnlyPath(target)) {
      return defaultTarget;
    }
    if (!isSalesRole(role) && isSalesOnlyPath(target)) {
      return defaultTarget;
    }
    return target;
  };

  const clearRedirectTarget = () => {
    try {
      sessionStorage.removeItem("postLoginRedirect");
    } catch (err) {
      // ignore storage issues
    }
  };

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      const target = resolveRedirectTarget(user?.role);
      clearRedirectTarget();
      navigate(target, { replace: true });
    }
  }, [loading, isAuthenticated, user?.role, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleAuthError = params.get("googleAuthError");
    const googleAuth = params.get("googleAuth");
    if (googleAuthError) {
      const message =
        googleAuthError === "disabled"
          ? "Google signup is disabled. Contact your administrator."
          : "Google login failed. Please try again.";
      toast.error(message);
      navigate("/login", { replace: true });
      return;
    }
    if (!googleAuth) return;

    const completeGoogleLogin = async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (!data?.user) {
          throw new Error("Missing user");
        }
        login(data.user);
        toast.success("Logged in with Google!");
        const target = resolveRedirectTarget(data.user?.role);
        clearRedirectTarget();
        navigate(target, { replace: true });
        if (onClose) onClose();
      } catch (error) {
        console.error("Google login parse error:", error);
        toast.error("Google login failed. Please try again.");
        navigate("/login", { replace: true });
      }
    };

    if (googleAuth === "success") {
      completeGoogleLogin();
      return;
    }

    // Backward-compatible: older backend sent user JSON in the query param
    try {
      const legacyUser = JSON.parse(decodeURIComponent(googleAuth));
      if (legacyUser && (legacyUser._id || legacyUser.id || legacyUser.email)) {
        login(legacyUser);
        const target = resolveRedirectTarget(legacyUser?.role);
        clearRedirectTarget();
        navigate(target, { replace: true });
        if (onClose) onClose();
        return;
      }
    } catch (err) {
      // ignore legacy parse errors
    }

    navigate("/login", { replace: true });
  }, [location.search, navigate, onClose, login]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const userData =
        data?.user && (data.user._id || data.user.id || data.user.email)
          ? data.user
          : data && (data._id || data.id || data.email)
            ? data
            : null;
      if (userData) {
        login(userData);
      } else {
        throw new Error("Login succeeded but no user payload returned.");
      }
      toast.success("Logged in successfully!");
      const target = resolveRedirectTarget(userData?.role);
      clearRedirectTarget();
      navigate(target);
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const apiBase = baseUrl
      ? baseUrl.endsWith("/api")
        ? baseUrl
        : `${baseUrl}/api`
      : "/api";
    window.location.href = `${apiBase}/auth/google`;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-blue-100 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-md w-full max-w-md">
        {onClose && (
          <button
            className="absolute top-2 right-2 text-gray-600 dark:text-slate-300 hover:text-red-500"
            onClick={onClose}
          >
            x
          </button>
        )}
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-slate-100">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
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
            <div className="flex justify-end mt-1">
              <Link to="/forgot-password" className="text-sm text-blue-500 hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Login
          </button>

          <div className="relative flex items-center justify-center w-full mt-4 border-t border-slate-300 dark:border-slate-700 pt-4">
            <div className="absolute px-3 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-sm -top-2.5">
              Or
            </div>
          </div>

          {/* <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-slate-200 font-medium"
          >
            <FcGoogle size={20} />
            Login with Google
          </button> */}

          <div className="flex flex-col items-center mt-2 space-y-1">
            <p>
              Don&apos;t have an account?{" "}
              <Link to="/sign-up" className="text-blue-500 hover:underline">
                Sign Up
              </Link>
            </p>
            <Link to="/reset-password" className="text-sm text-blue-500 hover:underline">
              Reset Password
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
