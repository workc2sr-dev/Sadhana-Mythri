import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PortalLayout from "../layouts/PortalLayout";
import { useAuth } from "../hooks/useAuth";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) navigate("/auth", { replace: true });
  }, [isAuthenticated, navigate]);

  const signOut = () => {
    logout();
    navigate("/");
  };
  const initials = user?.full_name?.split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase() || "SM";

  return <PortalLayout onBack={() => navigate("/")} onLogout={signOut}>
    <div className="welcome"><div><p className="eyebrow">MY PROFILE</p><h1>Your account details.</h1></div><div className="avatar">{initials}</div></div>
    <div className="empty-panel"><h2>{user?.full_name}</h2><p>{user?.email}</p><p>Keep your contact details up to date for application updates.</p></div>
  </PortalLayout>;
}
