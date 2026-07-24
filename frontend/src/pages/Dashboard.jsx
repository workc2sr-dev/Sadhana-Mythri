import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import PortalLayout from "../layouts/PortalLayout";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { annualPlanPrice, monthlyPlanPrices } from "../utils/pricing";

const planCatalog = {
  essential: { name: "Starter Plan", price: monthlyPlanPrices.essential },
  business: { name: "Growth Plan", price: monthlyPlanPrices.business },
  enterprise: { name: "Enterprise Plan", price: monthlyPlanPrices.enterprise },
};

export default function Dashboard() {
  const [tab, setTab] = useState("Dashboard");
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, logout, isAuthenticated } = useAuth();
  const planFromQuery = searchParams.get("plan");
  const plan = location.state?.plan || (planFromQuery ? planCatalog[planFromQuery] : null);
  const initials = user?.full_name?.split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase() || "SM";

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

  return <PortalLayout activeTab={tab} onTabChange={setTab} onBack={() => navigate("/")} onLogout={signOut}>
    <div className="welcome"><div><p className="eyebrow">WELCOME BACK</p><h1>Manage your applications.</h1></div><div className="avatar">{initials}</div></div>
    {tab === "Dashboard" && <><div className="status-card"><div><p className="eyebrow">ACCOUNT STATUS</p><h2>Your account is ready.</h2><p>Your applications are sent for review and updates will appear here.</p></div><button onClick={() => setTab("My Applications")}>View applications</button></div><div className="dashboard-grid"><article><p>SELECTED PLAN</p><h3>{plan?.name || "No plan selected"}</h3><span>{plan ? `₹${annualPlanPrice(plan.price).toLocaleString("en-IN")} / year` : "Explore plans to get started"}</span></article><article><p>APPLICATIONS</p><h3>{applications.length}</h3><span>View application progress</span></article><article><p>NOTIFICATIONS</p><h3>0</h3><span>No new updates</span></article></div></>}
    {tab === "My Profile" && <div className="empty-panel"><p className="eyebrow">MY PROFILE</p><h2>{user?.full_name}</h2><p>{user?.email}</p><p>Keep your contact details up to date for application updates.</p></div>}
    {tab === "My Applications" && <div className="empty-panel"><p className="eyebrow">MY APPLICATIONS</p><h2>Application status</h2>{applications.length ? <div className="application-list">{applications.map((application) => <p key={application.id}><strong>{planCatalog[application.plan_id]?.name || application.plan_id}</strong><span>{application.status.replaceAll("_", " ")}</span></p>)}</div> : <p>No applications yet. Select a plan from the website to get started.</p>}<p className="status-legend">Submitted · Under review · Approved · Rejected</p></div>}
    {tab === "Notifications" && <div className="empty-panel"><p className="eyebrow">NOTIFICATIONS</p><h2>You’re all caught up.</h2><p>Updates about application decisions will appear here.</p></div>}
  </PortalLayout>;
}
