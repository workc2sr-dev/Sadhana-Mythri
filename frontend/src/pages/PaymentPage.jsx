import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { annualPlanPrice, monthlyPlanPrices } from "../utils/pricing";

const planCatalog = {
  essential: { name: "Starter Plan", monthlyPrice: monthlyPlanPrices.essential },
  business: { name: "Growth Plan", monthlyPrice: monthlyPlanPrices.business },
  enterprise: { name: "Enterprise Plan", monthlyPrice: monthlyPlanPrices.enterprise },
};

// Annual plan payment review and Razorpay checkout page
export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan");
  const plan = planCatalog[planId];
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [kycApproved, setKycApproved] = useState(null);
  const [hasBusinessDetails, setHasBusinessDetails] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([api.getVerification(), api.getBusinessDetails().catch(() => null)])
      .then(([verification, businessDetails]) => {
        setKycApproved(verification.status === "approved" && user?.account_status === "created");
        setHasBusinessDetails(Boolean(businessDetails));
      })
      .catch(() => { setKycApproved(false); setHasBusinessDetails(false); });
  }, [isAuthenticated, user?.account_status]);

  if (!plan) {
    return <Navigate to="/plans" replace />;
  }
  if (!isAuthenticated) {
    return <Navigate to={`/auth?plan=${planId}`} replace />;
  }
  if (sessionStorage.getItem("sadhana_otp_verified") !== "true") {
    return <Navigate to={`/otp?plan=${planId}`} replace />;
  }
  if (hasBusinessDetails === false) {
    return <Navigate to={`/business-details?plan=${planId}`} replace />;
  }
  if (kycApproved === false) {
    return <Navigate to={`/dashboard/plans?plan=${planId}&kyc=required`} replace />;
  }
  if (kycApproved === null || hasBusinessDetails === null) {
    return null;
  }

  const annualTotal = annualPlanPrice(plan.monthlyPrice);
  // Run the Razorpay checkout flow and create the subscription on success
  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      if (typeof window.Razorpay !== "function") {
        setError("Payment gateway failed to load. Please refresh and try again.");
        return;
      }

      const order = await api.createPaymentOrder(annualTotal * 100, `plan_${planId}`);

      await new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          name: "Sadhana Mythri",
          description: `${plan.name} — Annual Subscription`,
          order_id: order.order_id,
          handler: async (response) => {
            try {
              await api.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              resolve();
            } catch (verifyError) {
              reject(verifyError);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment was cancelled")),
          },
          theme: { color: "#102a24" },
        });
        razorpay.on("payment.failed", (response) => {
          reject(new Error(response.error?.description || "Payment failed. Please try again."));
        });
        razorpay.open();
      });

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
