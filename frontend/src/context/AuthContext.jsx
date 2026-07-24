import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api";

export const AuthContext = createContext(null);
const SESSION_EXPIRY_KEY = "sadhana_session_expires_at";

export function AuthProvider({ children }) {
  const logoutTimer = useRef(null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sadhana_user"));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem("sadhana_user", JSON.stringify(user));
    else localStorage.removeItem("sadhana_user");
  }, [user]);

  const clearSession = useCallback(() => {
    localStorage.removeItem("sadhana_token");
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    sessionStorage.removeItem("sadhana_otp_verified");
    setUser(null);
  }, []);

  useEffect(() => {
    const expiresAt = Number(localStorage.getItem(SESSION_EXPIRY_KEY));
    if (!user) return undefined;
    if (!expiresAt) {
      clearSession();
      return undefined;
    }

    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      clearSession();
      return undefined;
    }

    logoutTimer.current = window.setTimeout(clearSession, remaining);
    return () => window.clearTimeout(logoutTimer.current);
  }, [user, clearSession]);

  const login = async (credentials) => {
    const result = await api.login(credentials);
    localStorage.setItem("sadhana_token", result.access_token);
    localStorage.setItem(SESSION_EXPIRY_KEY, String(result.expires_at * 1000));
    setUser(result.user);
    return result.user;
  };
  const register = (details) => api.register(details);
  const logout = clearSession;

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, isAuthenticated: Boolean(user) }}
    >
      {children}
    </AuthContext.Provider>
  );
}
