// Displays a single subscription plan's details with a selection button
export default function PlanCard({ plan, onChoose }) {
  return (
    <article className={`plan-card ${plan.featured ? "featured" : ""}`}>
      {plan.featured && <div className="badge">MOST POPULAR</div>}
      <h3>{plan.name}</h3>
      <p className="plan-text">{plan.description}</p>
      <p className="price">
        <strong>₹{plan.price.toLocaleString("en-IN")}</strong> / month
      </p>
      <ul>
        {plan.features.map((item) => (
          <li key={item}>✓ {item}</li>
        ))}
      </ul>
      <button onClick={() => onChoose(plan)}>
        {plan.featured ? "Get started" : "Choose plan"} <span>→</span>
      </button>
    </article>
  );
}
