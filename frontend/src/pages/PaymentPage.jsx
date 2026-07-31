import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { annualPlanPrice, monthlyPlanPrices } from "../utils/pricing";

const planCatalog = {
  essential: { name: "Starter Plan", monthlyPrice: monthlyPlanPrices.essential },
  business: { name: "Growth Plan", monthlyPrice: monthlyPlanPrices.business },
  enterprise: { name: "Enterprise Plan", monthlyPrice: monthlyPlanPrices.enterprise },
};

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan");
  const plan = planCatalog[planId];
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!plan) {
    return <Navigate to="/plans" replace />;
  }
  if (!isAuthenticated) {
    return <Navigate to={`/auth?plan=${planId}`} replace />;
  }
  if (sessionStorage.getItem("sadhana_otp_verified") !== "true") {
    return <Navigate to={`/otp?plan=${planId}`} replace />;
  }

  const annualTotal = annualPlanPrice(plan.monthlyPrice);
  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await api.createSubscription(planId);
      navigate(`/dashboard?plan=${planId}`, { replace: true });
    } catch (requestError) {
      if (requestError.message === "One plan per account") {
        navigate("/dashboard?notice=one-plan", { replace: true });
        return;
      }
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return <main className="landing"><section className="section-page payment-page"><div className="section-page-header"><div><p className="hero-kicker">PAYMENT</p><h1>Review your annual subscription.</h1><p className="page-intro">Your plan is priced monthly and billed as a single annual payment.</p></div><button className="secondary-btn" onClick={() => navigate("/plans")}>Change plan</button></div><section className="payment-summary"><div><p className="eyebrow">SELECTED PLAN</p><h2>{plan.name}</h2><p>₹{plan.monthlyPrice.toLocaleString("en-IN")} per month</p></div><dl><div><dt>Monthly plan price</dt><dd>₹{plan.monthlyPrice.toLocaleString("en-IN")}</dd></div><div><dt>Billing period</dt><dd>12 months</dd></div><div className="payment-total"><dt>Annual payment total</dt><dd>₹{annualTotal.toLocaleString("en-IN")}</dd></div></dl><p className="payment-note">The annual total is calculated as the monthly plan price × 12. Taxes, if applicable, are shown by the payment provider.</p>{error && <p className="form-error">{error}</p>}<button className="primary-btn" onClick={submit} disabled={busy}>{busy ? "Submitting…" : `Continue with ₹${annualTotal.toLocaleString("en-IN")}`}</button></section></section></main>;
}
