import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { monthlyPlanPrices } from "../utils/pricing";
import { api } from "../services/api";

const plans = [
  {
    id: "essential",
    name: "Starter Plan",
    note: "For freelancers",
    price: monthlyPlanPrices.essential,
    items: [
      "Official Business Address",
      "Mail & Document Handling",
      "Standard Support",
    ],
  },
  {
    id: "business",
    name: "Growth Plan",
    note: "For startups",
    price: monthlyPlanPrices.business,
    items: [
      "Official Business Address",
      "Mail & Document Handling",
      "Priority Support",
      "Dashboard Access",
    ],
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    note: "For established businesses",
    price: monthlyPlanPrices.enterprise,
    items: [
      "Official Business Address",
      "Mail & Document Handling",
      "Priority Support",
      "Dashboard Access",
      "Custom Requirements",
    ],
  },
];

export default function PlansPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const choosePlan = async (planId) => {
    if (isAuthenticated) {
      try {
        const subscriptions = await api.getSubscriptions();
        const hasActivePlan = subscriptions.some((subscription) =>
          ["under_review", "approved", "active"].includes(subscription.status),
        );
        if (hasActivePlan) {
          navigate("/dashboard?notice=one-plan");
          return;
        }
      } catch {
        // The payment endpoint still enforces the one-plan rule if this check cannot load.
      }
    }
    navigate(isAuthenticated ? `/dashboard/plans?plan=${planId}` : `/auth?plan=${planId}`);
  };

  return (
    <main className="landing">
      <section className="section-page">
        <div className="section-page-header">
          <div>
            <p className="hero-kicker">PLANS</p>
            <h1>Choose the plan that fits your business.</h1>
          </div>
          <button className="secondary-btn" onClick={() => navigate("/")}>
            Back to home
          </button>
        </div>
        <div className="plans-page-grid">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`plan-card ${plan.featured ? "featured" : ""}`}
            >
              {plan.featured && <span className="popular">MOST POPULAR</span>}
              <h3>{plan.name}</h3>
              <p className="plan-note">{plan.note}</p>
              <p className="plan-price">
                <span>₹</span>
                {plan.price.toLocaleString("en-IN")}
                <small>/month <p>(billed annually)</p></small>
              </p>
              <ul>
                {plan.items.map((item) => (
                  <li key={item}>
                    <span className="check">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                className={plan.featured ? "primary-btn" : "secondary-btn"}
                onClick={() => choosePlan(plan.id)}
              >
                Continue <span>→</span>
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
