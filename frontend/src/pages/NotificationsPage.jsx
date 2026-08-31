import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PortalLayout from "../layouts/PortalLayout";
import { useAuth } from "../hooks/useAuth";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) navigate("/auth", { replace: true });
  }, [isAuthenticated, navigate]);

  const signOut = () => {
    logout();
    navigate("/");
  };
  return <PortalLayout onBack={() => navigate("/")} onLogout={signOut}>
    <div className="welcome"><div><p className="eyebrow">NOTIFICATIONS</p><h1>Stay up to date.</h1></div></div>
    <div className="empty-panel"><h2>You’re all caught up.</h2><p>Updates about application decisions will appear here.</p></div>
  </PortalLayout>;
}
