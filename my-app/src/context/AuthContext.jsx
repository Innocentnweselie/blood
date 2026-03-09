import { createContext, useCallback, useEffect, useState, useContext } from "react";
import api from "../utils/axiosInstance";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("userInfo") || "null");
      if (stored?.token) {
        delete stored.token;
      }
      return stored;
    } catch (err) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const persistUser = (nextUser) => {
    try {
      if (nextUser) {
        const safeUser = { ...nextUser };
        if (safeUser.token) {
          delete safeUser.token;
        }
        localStorage.setItem("userInfo", JSON.stringify(safeUser));
      } else {
        localStorage.removeItem("userInfo");
      }
    } catch (err) {
      // ignore storage issues
    }
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/auth/me");
      if (data?.user) {
        setUser(data.user);
        persistUser(data.user);
      } else {
        setUser(null);
        persistUser(null);
      }
    } catch (err) {
      setUser(null);
      persistUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = (userData) => {
    setUser(userData);
    persistUser(userData);
  };

  const logout = () => {
    setUser(null);
    persistUser(null);
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...patch };
      persistUser(nextUser);
      return nextUser;
    });
  };

  const isAuthenticated = Boolean(user?._id || user?.id || user?.email);

  return (
    <AuthContext.Provider value={{ user, login, logout, refresh, updateUser, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
