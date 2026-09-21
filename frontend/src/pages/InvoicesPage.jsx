import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PortalLayout from "../layouts/PortalLayout";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { annualPlanPrice, monthlyPlanPrices } from "../utils/pricing";

const planCatalog = {
  essential: { name: "Starter Plan", monthlyPrice: monthlyPlanPrices.essential },
  business: { name: "Growth Plan", monthlyPrice: monthlyPlanPrices.business },
  enterprise: { name: "Enterprise Plan", monthlyPrice: monthlyPlanPrices.enterprise },
};

const ACTIVE_SUBSCRIPTION_STATUSES = ["under_review", "approved", "active"];

// Shows invoice history and renewal option for the active subscription
export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();

  // Fetch invoices and the current active subscription
  const load = () => {
    api.getInvoices().then(setInvoices).catch(() => setInvoices([]));
    api
      .getSubscriptions()
      .then((subscriptions) => setActiveSubscription(subscriptions.find((subscription) => ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) || null))
      .catch(() => setActiveSubscription(null));
  };

  useEffect(() => {
    if (!isAuthenticated) { navigate("/auth", { replace: true }); return; }
    load();
  }, [isAuthenticated, navigate]);

  // Log out and return to the homepage
  const signOut = () => {
    logout();
    navigate("/");
  };

  // Run the Razorpay checkout flow to renew the active subscription
  const renew = async () => {
    if (!activeSubscription) return;
    const plan = planCatalog[activeSubscription.plan_id];
    if (!plan) return;
    setBusy(true);
    setError("");
    try {
      if (typeof window.Razorpay !== "function") {
        setError("Payment gateway failed to load. Please refresh and try again.");
        return;
      }
      const annualTotal = annualPlanPrice(plan.monthlyPrice);
      const order = await api.createPaymentOrder(annualTotal * 100, `renew_${activeSubscription.id}`);

      await new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "Sadhana Mythri",
          description: `${plan.name} — Renewal`,
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
          modal: { ondismiss: () => reject(new Error("Payment was cancelled")) },
          theme: { color: "#102a24" },
        });
        razorpay.on("payment.failed", (response) => {
          reject(new Error(response.error?.description || "Payment failed. Please try again."));
        });
        razorpay.open();
      });

      await api.renewSubscription(activeSubscription.id);
      load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return <PortalLayout onBack={() => navigate("/")} onLogout={signOut}>
    <div className="welcome"><div><p className="eyebrow">BILLING</p><h1>Invoices & renewal.</h1></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {activeSubscription && <section className="empty-panel">
      <p className="eyebrow">CURRENT PLAN</p>
      <h2>{planCatalog[activeSubscription.plan_id]?.name || activeSubscription.plan_id}</h2>
      <p>{activeSubscription.expires_at ? `Renews / expires on ${new Date(activeSubscription.expires_at).toLocaleDateString("en-IN")}` : "No expiry on record"}</p>
      <button className="primary-btn" disabled={busy} onClick={renew}>{busy ? "Processing…" : "Renew for another year"}</button>
    </section>}
    <section className="empty-panel">
      <p className="eyebrow">INVOICE HISTORY</p>
      {invoices.length ? <div className="application-list">{invoices.map((invoice) => <p key={invoice.id}>
        <strong>₹{invoice.amount.toLocaleString("en-IN")}</strong>
        <span>{invoice.plan_id || "—"} · {invoice.status} · {new Date(invoice.issued_at).toLocaleDateString("en-IN")}</span>
      </p>)}</div> : <p>No invoices yet. An invoice is generated after your first successful payment.</p>}
    </section>
  </PortalLayout>;
}
