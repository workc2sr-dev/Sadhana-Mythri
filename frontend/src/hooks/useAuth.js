import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Access the shared auth context; throws if used outside AuthProvider
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
