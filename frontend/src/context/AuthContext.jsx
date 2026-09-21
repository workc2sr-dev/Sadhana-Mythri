import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api";

export const AuthContext = createContext(null);
const SESSION_EXPIRY_KEY = "sadhana_session_expires_at";
const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000;

// Provides auth state (user, tokens) and session/inactivity timeout handling to the app
export function AuthProvider({ children }) {
  const sessionExpiryTimer = useRef(null);
  const inactivityTimer = useRef(null);
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

  // Clear stored tokens/session data and log the user out locally
  const clearSession = useCallback(() => {
    localStorage.removeItem("sadhana_token");
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    sessionStorage.removeItem("sadhana_otp_verified");
    sessionStorage.removeItem("sadhana_otp");
    if (inactivityTimer.current) {
      window.clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
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

    sessionExpiryTimer.current = window.setTimeout(clearSession, remaining);
    return () => window.clearTimeout(sessionExpiryTimer.current);
  }, [user, clearSession]);

  useEffect(() => {
    if (!user) {
      if (inactivityTimer.current) {
        window.clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
      return undefined;
    }

    // Restart the inactivity timer, logging the user out after a period of no activity
    const resetInactivityTimer = () => {
      if (inactivityTimer.current) {
        window.clearTimeout(inactivityTimer.current);
      }

      inactivityTimer.current = window.setTimeout(() => {
        window.alert("Your session expired due to inactivity. Please sign in again.");
        clearSession();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart", "pointerdown"];

    resetInactivityTimer();
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, { passive: true });
    });

    return () => {
      if (inactivityTimer.current) {
        window.clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
    };
  }, [user, clearSession]);

  // Log a user in and persist their token/session expiry
  const login = async (credentials) => {
    const result = await api.login(credentials);
    localStorage.setItem("sadhana_token", result.access_token);
    localStorage.setItem(SESSION_EXPIRY_KEY, String(result.expires_at * 1000));
    setUser(result.user);
    return result.user;
  };
  const register = (details) => api.register(details);
  const logout = clearSession;

  // Refreshes the locally cached account status (e.g. after an admin approves KYC).
  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("sadhana_token")) return null;
    try {
      const freshUser = await api.getCurrentUser();
      setUser(freshUser);
      return freshUser;
    } catch {
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, refreshUser, isAuthenticated: Boolean(user) }}
    >
      {children}
    </AuthContext.Provider>
  );
}
