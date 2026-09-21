// Landing page hero banner with a call-to-action to explore plans
export default function Hero({ onExplore }) {
  return (
    <section className="hero" id="top">
      <div className="hero-content">
        <p className="eyebrow">VIRTUAL OFFICE SOLUTIONS</p>
        <h1>
          Build your business
          <br />
          <i>from anywhere.</i>
        </h1>
        <p>
          Everything you need for a trusted business presence - a professional
          address, flexible workspaces, and straightforward support.
        </p>
        <button onClick={onExplore}>
          Find your plan <span>→</span>
        </button>
      </div>
      <div className="hero-card">
        <p>
          YOUR BUSINESS,
          <br />
          PROPERLY PLACED.
        </p>
        <div className="address-line"></div>
        <span>Professional. Flexible. Compliant.</span>
      </div>
    </section>
  );
}
