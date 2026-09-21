import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PortalLayout from "../layouts/PortalLayout";
import ConfirmationModal from "../components/ConfirmationModal";
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

const ACTIVE_SUBSCRIPTION_STATUSES = ["under_review", "approved", "active"];

// KYC upload and plan subscription page shown inside the user portal
export default function DashboardPlansPage() {
  const [verification, setVerification] = useState({ status: "not_started" });
  const [documentType, setDocumentType] = useState("Aadhaar card");
  const [document, setDocument] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pendingPlanId = searchParams.get("plan");
  const kycRequired = searchParams.get("kyc") === "required";
  const { user, logout, isAuthenticated, refreshUser } = useAuth();
  const accountState = user?.account_status || "under_review";
  const isCreated = accountState === "created";
  const hasActivePlan = Boolean(activeSubscription);

  // Fetch the current KYC verification status
  const loadVerification = () => api.getVerification().then(setVerification).catch((requestError) => setError(requestError.message));
  // Fetch subscriptions and track any currently active one
  const loadSubscriptions = () =>
    api
      .getSubscriptions()
      .then((subscriptions) => setActiveSubscription(subscriptions.find((subscription) => ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) || null))
      .catch(() => setActiveSubscription(null));

  useEffect(() => {
    if (!isAuthenticated) { navigate("/auth", { replace: true }); return; }
    refreshUser();
    loadVerification();
    loadSubscriptions();
  }, [isAuthenticated, navigate]);

  // Once KYC is approved and the account is created, resume the pending plan straight to payment.
  useEffect(() => {
    if (pendingPlanId && isCreated && verification.status === "approved" && !hasActivePlan) {
      navigate(`/payment?plan=${pendingPlanId}`, { replace: true });
    }
  }, [pendingPlanId, isCreated, verification.status, hasActivePlan, navigate]);

  // Log out and return to the homepage
  const signOut = () => {
    logout();
    navigate("/");
  };

  // Submit the selected government ID file for KYC review
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

  // Navigate to payment for a plan after validating KYC/account eligibility
  const subscribe = (planId) => {
    if (hasActivePlan) {
      setError("You already have an active plan. Cancel it before selecting another.");
      return;
    }
    if (accountState !== "created" || verification.status !== "approved") {
      setError("Government ID verification must be approved and your account must be created before subscribing.");
      return;
    }
    setError("");
    navigate(`/payment?plan=${planId}`);
  };

  // Cancel the user's active subscription after confirmation
  const cancelPlan = async () => {
    setCancelOpen(false);
    if (!activeSubscription) return;
    setBusy(true);
    setError("");
    try {
      await api.cancelSubscription(activeSubscription.id);
      await loadSubscriptions();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return <PortalLayout onBack={() => navigate("/")} onLogout={signOut}>
    <div className="welcome"><div><p className="eyebrow">PLANS & KYC</p><h1>Verify your ID, then subscribe.</h1></div></div>
    {kycRequired && verification.status !== "approved" && <p className="toast" role="status">Submit and get your government ID approved to continue to payment for your selected plan.</p>}
    <section className="empty-panel kyc-panel"><p className="eyebrow">GOVERNMENT ID VERIFICATION</p><h2>{statusLabels[verification.status] || "KYC status unavailable"}</h2>{verification.document_name && <p>Submitted document: {verification.document_name}</p>}{verification.status !== "approved" && <form className="kyc-form" onSubmit={uploadKyc}><label>Government ID type<select value={documentType} onChange={(event) => setDocumentType(event.target.value)}><option>Aadhaar card</option><option>PAN card</option><option>Passport</option><option>Driving licence</option><option>Voter ID</option></select></label><label>Upload ID (PDF, JPG, or PNG; max 5 MB)<input required type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setDocument(event.target.files?.[0] || null)} /></label><button className="secondary-btn" disabled={busy}>{busy ? "Uploading…" : "Submit for review"}</button></form>}{verification.status === "pending" && <p>Your document is waiting for an administrator’s decision.</p>}{accountState === "created" && <p>Your account has been created and is ready for plan selection.</p>}</section>
    {error && <p className="form-error" role="alert">{error}</p>}
    {hasActivePlan && <p className="form-error" role="status">You already have an active plan ({activeSubscription.plan_id}). One plan per account.<button className="secondary-btn" disabled={busy} onClick={() => setCancelOpen(true)}>Cancel plan</button></p>}
    <section className="dashboard-plans"><p className="eyebrow">AVAILABLE PLANS</p><div className="plans-page-grid">{plans.map((plan) => <article key={plan.id} className={`plan-card ${plan.featured ? "featured" : ""} ${activeSubscription?.plan_id === plan.id ? "selected-plan" : ""}`}><h3>{plan.name}</h3><p className="plan-note">{plan.note}</p><p className="plan-price">₹{plan.price.toLocaleString("en-IN")}<small> / month</small></p><p className="plan-note">₹{annualPlanPrice(plan.price).toLocaleString("en-IN")} billed annually</p><button className={plan.featured ? "primary-btn" : "secondary-btn"} disabled={busy || !isCreated || hasActivePlan} onClick={() => subscribe(plan.id)}>{activeSubscription?.plan_id === plan.id ? "Plan active" : hasActivePlan ? "Plan already active" : isCreated ? "Subscribe" : "Account pending activation"}</button></article>)}</div></section>
    <ConfirmationModal
      open={cancelOpen}
      title="Cancel plan"
      message="Cancelling ends your current plan and access to its benefits at the end of this billing period. Fees already paid are non-refundable per our refund policy. Continue?"
      confirmLabel="Yes, cancel plan"
      cancelLabel="Keep plan"
      onConfirm={cancelPlan}
      onCancel={() => setCancelOpen(false)}
    />
  </PortalLayout>;
}
