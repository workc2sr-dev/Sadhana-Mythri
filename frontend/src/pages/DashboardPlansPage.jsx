import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PortalLayout from "../layouts/PortalLayout";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { annualPlanPrice, monthlyPlanPrices } from "../utils/pricing";

const plans = [
  { id: "essential", name: "Starter Plan", note: "For freelancers", price: monthlyPlanPrices.essential },
  { id: "business", name: "Growth Plan", note: "For startups", price: monthlyPlanPrices.business, featured: true },
  { id: "enterprise", name: "Enterprise Plan", note: "For growing businesses", price: monthlyPlanPrices.enterprise },
];

const statusLabels = {
  not_started: "Government ID required",
  pending: "KYC submitted — awaiting review",
  approved: "KYC approved",
  declined: "KYC declined — upload a new document",
};

export default function DashboardPlansPage() {
  const [searchParams] = useSearchParams();
  const [verification, setVerification] = useState({ status: "not_started" });
  const [documentType, setDocumentType] = useState("Aadhaar card");
  const [document, setDocument] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const selectedPlanId = searchParams.get("plan");

  const loadVerification = () => api.getVerification().then(setVerification).catch((requestError) => setError(requestError.message));

  useEffect(() => {
    if (!isAuthenticated) { navigate("/auth", { replace: true }); return; }
    if (sessionStorage.getItem("sadhana_otp_verified") !== "true") { navigate("/otp", { replace: true }); return; }
    loadVerification();
  }, [isAuthenticated, navigate]);

  const signOut = () => { logout(); navigate("/"); };

  const uploadKyc = async (event) => {
    event.preventDefault();
    if (!document) { setError("Choose a government ID file to upload."); return; }
    setBusy(true);
    setError("");
    try {
      await api.submitVerification(documentType, document);
      await loadVerification();
      setDocument(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const subscribe = async (planId) => {
    if (verification.status !== "approved") {
      setError("Government ID verification must be approved before subscribing.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.createSubscription(planId);
      navigate(`/dashboard?plan=${planId}`, { replace: true });
    } catch (requestError) {
      if (requestError.message === "One plan per account") navigate("/dashboard?notice=one-plan", { replace: true });
      else setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return <PortalLayout onBack={() => navigate("/")} onLogout={signOut}>
    <div className="welcome"><div><p className="eyebrow">PLANS & KYC</p><h1>Verify your ID, then subscribe.</h1></div></div>
    <section className="empty-panel kyc-panel"><p className="eyebrow">GOVERNMENT ID VERIFICATION</p><h2>{statusLabels[verification.status] || "KYC status unavailable"}</h2>{verification.document_name && <p>Submitted document: {verification.document_name}</p>}{verification.status !== "approved" && <form className="kyc-form" onSubmit={uploadKyc}><label>Government ID type<select value={documentType} onChange={(event) => setDocumentType(event.target.value)}><option>Aadhaar card</option><option>PAN card</option><option>Passport</option><option>Driving licence</option><option>Voter ID</option></select></label><label>Upload ID (PDF, JPG, or PNG; max 5 MB)<input required type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setDocument(event.target.files?.[0] || null)} /></label><button className="secondary-btn" disabled={busy}>{busy ? "Uploading…" : "Submit for review"}</button></form>}{verification.status === "pending" && <p>Your document is waiting for an administrator’s decision.</p>}</section>
    {error && <p className="form-error" role="alert">{error}</p>}
    <section className="dashboard-plans"><p className="eyebrow">AVAILABLE PLANS</p><div className="plans-page-grid">{plans.map((plan) => <article key={plan.id} className={`plan-card ${plan.featured ? "featured" : ""} ${selectedPlanId === plan.id ? "selected-plan" : ""}`}><h3>{plan.name}</h3><p className="plan-note">{plan.note}</p><p className="plan-price">₹{plan.price.toLocaleString("en-IN")}<small> / month</small></p><p className="plan-note">₹{annualPlanPrice(plan.price).toLocaleString("en-IN")} billed annually</p><button className={plan.featured ? "primary-btn" : "secondary-btn"} disabled={busy || verification.status !== "approved"} onClick={() => subscribe(plan.id)}>{verification.status === "approved" ? "Subscribe" : "KYC approval required"}</button></article>)}</div></section>
  </PortalLayout>;
}
