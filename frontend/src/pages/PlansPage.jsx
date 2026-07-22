import { useNavigate } from "react-router-dom";

const plans = [
  {
    id: "essential",
    name: "Starter Plan",
    note: "For freelancers",
    price: 2999,
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
    price: 4999,
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
    price: 6999,
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
        <div className="plans-column">
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
                <small> /Month</small>
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
                onClick={() => navigate(`/auth?plan=${plan.id}`)}
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
