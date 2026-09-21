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
    detail: "Your government ID is being reviewed. Once an admin approves it, your account activates immediately.",
  },
  created: {
    title: "Account created.",
    detail: "Your account is active and ready to use.",
  },
};

const ACTIVE_SUBSCRIPTION_STATUSES = ["under_review", "approved", "active"];

// Main user dashboard showing account status, plan, and quick stats
export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout, isAuthenticated, refreshUser } = useAuth();
  const notice = searchParams.get("notice");
  const plan = activeSubscription ? planCatalog[activeSubscription.plan_id] : null;
  const accountStatus = user?.account_status || "under_review";
  const currentStatus = accountStatusCopy[accountStatus] || accountStatusCopy.under_review;

  useEffect(() => {
    if (!isAuthenticated) { navigate("/auth", { replace: true }); return; }
    refreshUser();
    api.getSubscriptions().then((subscriptions) => {
      setApplications(subscriptions);
      setActiveSubscription(subscriptions.find((subscription) => ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) || null);
    }).catch(() => setApplications([]));
  }, [isAuthenticated, navigate]);


  // Log out and return to the homepage
  const signOut = () => {
    logout();
    sessionStorage.removeItem("sadhana_otp_verified");
    navigate("/");
  };

  return <PortalLayout onBack={() => navigate("/")} onLogout={signOut}>
    {notice === "one-plan" && <div className="toast" role="status">One plan per account</div>}
    <div className="welcome"><div><p className="eyebrow">WELCOME BACK</p><h1>Manage your applications.</h1></div><div className="dashboard-user-name">{user?.full_name}</div></div>
    <div className="status-card"><div><p className="eyebrow">ACCOUNT STATUS</p><h2>{currentStatus.title}</h2><p>{currentStatus.detail}</p><p className="eyebrow">Step: {accountStatus === "under_review" ? "1) Under review" : "2) Created"}</p></div><button onClick={() => navigate("/dashboard/applications")}>View applications</button></div>
    <div className="dashboard-grid"><article><p>SELECTED PLAN</p><h3>{plan?.name || "No plan selected"}</h3><span>{plan ? `₹${annualPlanPrice(plan.price).toLocaleString("en-IN")} / year` : "Explore plans to get started"}</span></article><article><p>APPLICATIONS</p><h3>{applications.length}</h3><span>View application progress</span></article><article><p>NOTIFICATIONS</p><h3>0</h3><span>No new updates</span></article></div>
  </PortalLayout>;
}
