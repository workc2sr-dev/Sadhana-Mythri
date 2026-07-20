import { createContext, useEffect, useState } from "react";
import { api } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
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

  const login = async (credentials) => {
    const result = await api.login(credentials);
    localStorage.setItem("sadhana_token", result.access_token);
    setUser(result.user);
    return result.user;
  };
  const register = (details) => api.register(details);
  const logout = () => {
    localStorage.removeItem("sadhana_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, isAuthenticated: Boolean(user) }}
    >
      {children}
    </AuthContext.Provider>
  );
}
