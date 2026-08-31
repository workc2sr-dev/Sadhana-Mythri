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

const accountStatusCopy = {
  under_review: {
    title: "Account under review.",
    detail: "Your government ID is being reviewed. Once the admin completes the check, the account will move to the verified state and activate the next day.",
  },
  verified: {
    title: "ID verified.",
    detail: "Your account is verified and will activate automatically by tomorrow using the same login credentials.",
  },
  created: {
    title: "Account created.",
    detail: "Your account is active and ready to use.",
  },
};

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout, isAuthenticated } = useAuth();
  const planFromQuery = searchParams.get("plan");
  const notice = searchParams.get("notice");
  const plan = planFromQuery ? planCatalog[planFromQuery] : null;
  const accountStatus = user?.account_status || "under_review";
  const currentStatus = accountStatusCopy[accountStatus] || accountStatusCopy.under_review;

  useEffect(() => {
    if (!isAuthenticated) { navigate("/auth", { replace: true }); return; }
    api.getSubscriptions().then(setApplications).catch(() => setApplications([]));
  }, [isAuthenticated, navigate]);

  const signOut = () => {
    logout();
    sessionStorage.removeItem("sadhana_otp_verified");
    navigate("/");
  };

  return <PortalLayout onBack={() => navigate("/")} onLogout={signOut}>
    {notice === "one-plan" && <div className="toast" role="status">One plan per account</div>}
    <div className="welcome"><div><p className="eyebrow">WELCOME BACK</p><h1>Manage your applications.</h1></div><div className="dashboard-user-name">{user?.full_name}</div></div>
    <div className="status-card"><div><p className="eyebrow">ACCOUNT STATUS</p><h2>{currentStatus.title}</h2><p>{currentStatus.detail}</p><p className="eyebrow">Step: {accountStatus === "under_review" ? "1) Under review" : accountStatus === "verified" ? "2) Verified" : "3) Created"}</p></div><button onClick={() => navigate("/dashboard/applications")}>View applications</button></div>
    <div className="dashboard-grid"><article><p>SELECTED PLAN</p><h3>{plan?.name || "No plan selected"}</h3><span>{plan ? `₹${annualPlanPrice(plan.price).toLocaleString("en-IN")} / year` : "Explore plans to get started"}</span></article><article><p>APPLICATIONS</p><h3>{applications.length}</h3><span>View application progress</span></article><article><p>NOTIFICATIONS</p><h3>0</h3><span>No new updates</span></article></div>
  </PortalLayout>;
}
