import { useState } from "react";
import { useNavigate } from "react-router-dom";
import plantImage from "../plant.png";
import logoImage from "../Elevanta Spaces Logo.png?v=2";

const features = [
  {
    title: <strong>Official Business Address</strong>,
    text: "Use a credible business address for registrations and growth.",
  },
  {
    title: <strong>Easy Online Registration & Verification</strong>,
    text: "Quick, paperless, and hassle-free onboarding process.",
  },
  {
    title: <strong>Flexible Subscription Plans</strong>,
    text: "Choose a plan that fits your business needs and budget.",
  },
  {
    title: <strong>Secure Dashboard for Billing & Management</strong>,
    text: "Manage documents, payments and renewals in one place.",
  },
];

const steps = [
  {
    n: "1",
    id: "browse-select-plan",
    title: <strong>Browse & Select a Plan</strong>,
    text: "Pick the plan that suits your business requirements.",
  },
  {
    n: "2",
    title: <strong>Register & Verify</strong>,
    text: "Complete your details and verify online in minutes.",
  },
  {
    n: "3",
    title: <strong>Subscription Approval</strong>,
    text: "We verify your details and activate your plan.",
  },
  {
    n: "4",
    title: <strong>Start Using Your Virtual Office Address</strong>,
    text: "Use your address for business registration and grow confidently.",
  },
];

const plans = [
  {
    name: <strong>Starter Plan</strong>,
    note: "For freelancers",
    price: 1999,
    items: [
      "Official Business Address",
      "Mail & Document Handling",
      "Standard Support",
    ],
  },
  {
    name: <strong>Growth Plan</strong>,
    note: "For startups",
    price: 2999,
    items: [
      "Official Business Address",
      "Mail & Document Handling",
      "Priority Support",
      "Dashboard Access",
    ],
    featured: true,
  },
  {
    name: <strong>Enterprise Plan</strong>,
    note: "For established businesses",
    id: "enterprise-plan",
    price: 5999,
    items: [
      "Official Business Address",
      "Mail & Document Handling",
      "Priority Support",
      "Dashboard Access",
      "Custom Requirements",
    ],
  },
];

const testimonials = [
  {
    quote:
      '"Sadhana Mythri made it incredibly easy to set up my business address. The entire process was smooth and super professional."',
    name: "Rohit Sharma",
    role: "Founder, TechNova",
  },
  {
    quote:
      '"Great service and excellent support. The dashboard is simple to use and keeps everything organized."',
    name: "Anita Verma",
    role: "Co-founder, BrightWorks",
  },
];

function CheckItem({ children }) {
  return (
    <li>
      <span className="check">✓</span>
      <span>{children}</span>
    </li>
  );
}

export default function HomePage() {
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const choosePlan = (plan) => {
    setNotice(`${plan.name.props.children} selected. Create your account to continue.`);
    const slug = plan.name.props.children.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    navigate(`/dashboard?plan=${slug}`, {
      state: { plan },
    });
  };

  return (
    <main className="landing">
      <header className="site-header"> 
           <img className="brand-logo" src={logoImage} alt="" />
        

        <nav className="main-nav" aria-label="Primary">
          <a href="#solutions" onClick={() => scrollToSection("solutions")}>
            Solutions <span>⌄</span>
          </a>
          <a href="#plans" onClick={() => scrollToSection("plans")}>
            Plans
          </a>
          <a href="#features" onClick={() => scrollToSection("features")}>
            Features
          </a>
          <a href="#about" onClick={() => scrollToSection("about")}>
            About Us
          </a>
          <a href="#contact" onClick={() => scrollToSection("contact")}>
            Contact
          </a>
        </nav>

        <div className="header-actions">
          <a className="phone-pill" href="tel:+919632587410">
            <span>☎</span> +91 96325 87410
          </a>
          <button className="login-btn" onClick={() => navigate("/dashboard")}>
            Client Login
          </button>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-left">
          <p className="hero-kicker">BUSINESS ADDRESS SOLUTIONS</p>
          <h1>
            Build your business
            <br />
            from <em>anywhere.</em>
          </h1>
          <p className="hero-copy">
            Get a professional business address, streamline compliance and
            manage your business with ease and flexibility.
          </p>

          <div className="hero-actions">
            <button
              className="primary-btn"
              onClick={() => navigate("/plans")}
            >
              Browse Plans <span>→</span>
            </button>
            <button className="secondary-btn" onClick={() => choosePlan(plans[0])}>
              Get Started Free
            </button>
          </div>

          <div className="trust-row">
            <span>🛡 GST Compliant</span>
            <span>🔒 Secure & Private</span>
            <span>🎧 24x7 Support</span>
          </div>
        </div>

        <div className="hero-right" aria-hidden="true">
          <div className="floating-card floating-top-left">
            <span className="mini-icon">🏢</span>
            <div>
              <strong>Professional</strong>
              <span>Address</span>
            </div>
          </div>
          <div className="floating-card floating-bottom-left">
            <span className="mini-icon">🔐</span>
            <div>
              <strong>Privacy</strong>
              <span>Assured</span>
            </div>
          </div>

          <div className="scene">
            <div className="window-panel" />
            <div className="cityline" />
            <div className="desk">
              <div className="desk-shadow" />
              <div className="plant plant-left">
                <img className="plant-image" src={plantImage} alt="" />
              </div>
              <div className="monitor">
                <i className="monitor-glow" />
                <span>SADHANA</span>
                <span>MYTHRI</span>
              </div>
              <div className="monitor-stand" />
              {/* <div className="lamp"><i /></div> */}
              <div className="plant plant-right">
                <img className="plant-image" src={plantImage} alt="" />
              </div>
            </div>
            <div className="address-bubble">
              <div className="building">🏙</div>
              <div>
                <strong>Your Business Address</strong>
                <span>TBD</span>
              </div>
              <div className="floating-card floating-mid-left">
            <span className="mini-icon">📬</span>
            <div>
              <strong>Mail & Document</strong>
              <span>Management</span>
            </div>
          </div>
            {/* <div className="ok">✓</div>*/}
            </div>
            {/* <div className="pin">📍</div> */}
          </div>

          {/* <div className="side-plant left" /> */}
          {/* <div className="side-plant right" /> */}
        </div>
      </section>

      <section className="feature-strip" id="features">
        {features.map((feature) => (
          <article key={feature.title} className="feature-card">
            <div className="feature-illustration" aria-hidden="true" />
            <div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="how-it-works" id="solutions">
        <p className="section-title">How It Works</p>
        <div className="steps vertical">
          {steps.map((step) => (
            <article key={step.n} className="step">
              <div className="step-circle">{step.n}</div>
              <div className="step-body">
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
              <div className="step-line" aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="pricing-area" id="plans">
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
                <small> /Year</small>
              </p>
              <ul>
                {plan.items.map((item) => (
                  <CheckItem key={item}>{item}</CheckItem>
                ))}
              </ul>
              <button
                className={plan.featured ? "primary-btn" : "secondary-btn"}
                onClick={() => navigate(`/dashboard?plan=${plan.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`)}
              >
                Subscribe Now
              </button>
            </article>
          ))}
        </div>

        <div className="testimonials-column" id="about">
         {/* <div className="testimonial-header">
            <h1>Trusted by Businesses Across India</h1>
            <span aria-hidden="true">❝</span>
          </div> 
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p>{testimonial.quote}</p>
                <div className="person">
                  <div className="avatar">{testimonial.name.slice(0, 1)}</div>
                  <div>
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="dots" aria-hidden="true">
            <span className="active" />
            <span />
            <span />
          </div>*/}
        </div>
      </section>

      <section className="trust-band">
        <span>GST Compliant</span>
        <span>Secure & Confidential</span>
        <span>Instant Activation</span>
        <span>24x7 Customer Support</span>
      </section>

      <section className="cta-band">
        <div className="cta-image left" aria-hidden="true" />
        <div className="cta-content">
          <h2>Ready to establish your business presence?</h2>
          <p>
            Join 1,000+ businesses who trust Sadhana Mythri for their virtual
            office needs.
          </p>
          <button className="light-btn" onClick={() => navigate("/plans")}>
            Get Started Today <span>→</span>
          </button>
        </div>
        <div className="cta-image right" aria-hidden="true" />
      </section>

      <footer className="site-footer" id="contact">
        <div className="footer-brand">
          <strong>SADHANA MYTHRI</strong>
          <p>
            Your trusted partner for virtual office solutions and business
            compliance.
          </p>
          <div className="social-row">
            <span>f</span>
            <span>in</span>
            <span>ig</span>
            <span>tw</span>
          </div>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <button type="button" onClick={() => navigate("/careers")}>
            Careers
          </button>
          <button type="button" onClick={() => navigate("/faq")}>
            FAQ
          </button>
          <button type="button" onClick={() => navigate("/terms")}>
            Terms & Conditions
          </button>
          <button type="button" onClick={() => navigate("/privacy")}>
            Privacy Policy
          </button>
        </div>
        <div className="footer-col">
          <h4>Solutions</h4>
          <a href="#features">Virtual Office Address</a>
          <a href="#features">Mail Handling</a>
          <a href="#features">Compliance Support</a>
          <a href="#features">Document Management</a>
        </div>
        <div className="footer-col">
          <h4>Plans</h4>
          <a href="#plans">All Plans</a>
          <a href="#plans">Pricing</a>
          <button type="button" onClick={() => navigate("/faq")}>
            FAQs
          </button>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <button type="button" onClick={() => navigate("/terms")}>
            Terms & Conditions
          </button>
          <button type="button" onClick={() => navigate("/privacy")}>
            Privacy Policy
          </button>
          <button type="button" onClick={() => navigate("/refunds")}>
            Refund Policy
          </button>
        </div>
        <div className="footer-newsletter">
          <h4>Stay Connected</h4>
          <p>Subscribe to get updates and offers.</p>
          <div className="newsletter-row">
            <input type="email" placeholder="Enter your email" />
            <button className="login-btn" onClick={() => scrollToSection("contact")}>
              Subscribe
            </button>
          </div>
        </div>
        <div className="footer-contact">
          <p>Contact Us:</p>
          <a href="tel:+919876543210">+91-9632587410</a>
          <span>||</span>
          <a href="mailto:info@sadhanamythri.com">info@sadhanamythri.com</a>
        </div>
        <div className="footer-note">© 2026 Sadhana Mythri. All rights reserved.</div>
    {/* <div className="footer-made">Made with ♥ in India</div> */}
      </footer>

      <button className="chat-bubble" aria-label="Open chat">
        💬
      </button>

      {notice && (
        <div className="toast">
          {notice}
          <button aria-label="Dismiss" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
    </main>
  );
}
