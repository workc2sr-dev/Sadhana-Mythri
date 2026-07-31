import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PortalLayout from "../layouts/PortalLayout";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { annualPlanPrice, monthlyPlanPrices } from "../utils/pricing";
import "../assets/styles.css";

const planCatalog = {
  essential: { name: "Starter Plan", price: monthlyPlanPrices.essential },
  business: { name: "Growth Plan", price: monthlyPlanPrices.business },
  enterprise: { name: "Enterprise Plan", price: monthlyPlanPrices.enterprise },
};

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout, isAuthenticated } = useAuth();
  const planFromQuery = searchParams.get("plan");
  const notice = searchParams.get("notice");
  const plan = planFromQuery ? planCatalog[planFromQuery] : null;

  useEffect(() => {
    if (!isAuthenticated) { navigate("/auth", { replace: true }); return; }
    if (sessionStorage.getItem("sadhana_otp_verified") !== "true") {
      navigate(planFromQuery ? `/otp?plan=${planFromQuery}` : "/otp", { replace: true });
      return;
    }
    api.getSubscriptions().then(setApplications).catch(() => setApplications([]));
  }, [isAuthenticated, navigate, planFromQuery]);

  const signOut = () => {
    logout();
    sessionStorage.removeItem("sadhana_otp_verified");
    navigate("/");
  };

  return <PortalLayout onBack={() => navigate("/")} onLogout={signOut}>
    {notice === "one-plan" && <div className="toast" role="status">One plan per account</div>}
    <div className="welcome"><div><p className="eyebrow">WELCOME BACK</p><h1>Manage your applications.</h1></div><div className="dashboard-user-name">{user?.full_name}</div></div>
    <div className="status-card"><div><p className="eyebrow">ACCOUNT STATUS</p><h2>Your account is ready.</h2><p>Your applications are sent for review and updates will appear here.</p></div><button onClick={() => navigate("/dashboard/applications")}>View applications</button></div>
    <div className="dashboard-grid"><article><p>SELECTED PLAN</p><h3>{plan?.name || "No plan selected"}</h3><span>{plan ? `₹${annualPlanPrice(plan.price).toLocaleString("en-IN")} / year` : "Explore plans to get started"}</span></article><article><p>APPLICATIONS</p><h3>{applications.length}</h3><span>View application progress</span></article><article><p>NOTIFICATIONS</p><h3>0</h3><span>No new updates</span></article></div>
  </PortalLayout>;
}
