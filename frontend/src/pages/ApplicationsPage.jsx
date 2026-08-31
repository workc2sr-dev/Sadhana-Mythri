import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PortalLayout from "../layouts/PortalLayout";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

const planCatalog = {
  essential: "Starter Plan",
  business: "Growth Plan",
  enterprise: "Enterprise Plan",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) { navigate("/auth", { replace: true }); return; }
    api.getSubscriptions().then(setApplications).catch(() => setApplications([]));
  }, [isAuthenticated, navigate]);

  const signOut = () => {
    logout();
    navigate("/");
  };
  return <PortalLayout onBack={() => navigate("/")} onLogout={signOut}>
    <div className="welcome"><div><p className="eyebrow">MY APPLICATIONS</p><h1>Track your applications.</h1></div></div>
    <div className="empty-panel"><h2>Application status</h2>{applications.length ? <div className="application-list">{applications.map((application) => <p key={application.id}><strong>{planCatalog[application.plan_id] || application.plan_id}</strong><span>{application.status.replaceAll("_", " ")}</span></p>)}</div> : <p>No applications yet. Select a plan from the website to get started.</p>}<p className="status-legend">Submitted · Under review · Approved · Rejected</p></div>
  </PortalLayout>;
}
