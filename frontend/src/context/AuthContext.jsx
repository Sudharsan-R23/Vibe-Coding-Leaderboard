import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../api/client.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "vibe_jwt";

function normalizeUser(u) {
  if (!u) return null;
  return { ...u, id: u.id ?? u._id };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    setAuthToken(token);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/users/me");
        if (!cancelled) setUser(normalizeUser(data.user));
      } catch {
        if (!cancelled) {
          localStorage.removeItem(STORAGE_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(normalizeUser(data.user));
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(normalizeUser(data.user));
    return data;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const refreshMe = async () => {
    const { data } = await api.get("/users/me");
    setUser(normalizeUser(data.user));
    return normalizeUser(data.user);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      refreshMe,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
