import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { monthlyPlanPrices } from "../utils/pricing";
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
    title: <strong>Login / Signup</strong>,
    text: "Login or create an account with your Gmail and a password to get started with your virtual office address.",
  },
  /*{
    n: "2",
    title: <strong>Register & Verify</strong>,
    text: "Complete your details and verify online in minutes.",
  },*/
  {
    n: "2",
    title: <strong>Subscription Approval</strong>,
    text: "We verify your details and activate your plan.",
  },
  {
    n: "3",
    title: <strong>Your Virtual Office Address</strong>,
    text: "Use your address for business registration and grow confidently.",
  },
];

const plans = [
  {
    id: "essential",
    name: "Starter Plan",
    note: "For freelancers",
    price: monthlyPlanPrices.essential,
    items: [
      "Official Business Address",
      "Mail & Document Handling",
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
      "1 physical working space, access to 2-wheeler parking",
    ],
    featured: true,
  },
  {
    name: "Enterprise Plan",
    note: "For growing businesses",
    id: "enterprise",
    price: monthlyPlanPrices.enterprise,
    items: [
      "Official Business Address",
      "Mail & Document Handling",
      "2 physical working spaces",
      "access to printer, conference room, reserved 2-wheeler parking ",
    ],
  },
];

/*const testimonials = [
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
];*/

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
  const { isAuthenticated } = useAuth();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const choosePlan = async (plan) => {
    setNotice(`${plan.name} selected.`);
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
    const paymentPath = sessionStorage.getItem("sadhana_otp_verified") === "true"
      ? `/dashboard/plans?plan=${plan.id}`
      : `/otp?plan=${plan.id}`;
    navigate(isAuthenticated ? paymentPath : `/auth?plan=${plan.id}`, {
      state: { plan },
    });
  };

  return (
    <main className="landing">
      <header className="site-header">
        <a className="brand-block" href="#home" onClick={() => scrollToSection("home")}>
          <img className="brand-logo" src={logoImage} alt="Sadhana Mythri" />
          <p className="brand-tagline"><strong>Where Ambition Finds Its Space</strong></p>
        </a>

        <nav className="main-nav" aria-label="Primary">
          <a href="#solutions" onClick={() => scrollToSection("solutions")}>
            Solutions <span>⌄</span>
          </a>
          <a href="#plans" onClick={() => navigate("/plans")}>
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
          <button className="login-btn" onClick={() => navigate("/auth")}>
            Login
          </button>
          <button className="signup-btn" onClick={() => navigate("/auth")}>
            Sign Up
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

      {/*<div className="trust-row">
            <span>🛡 GST Compliant</span>
            <span>🔒 Secure & Private</span>
            <span>🎧 24x7 Support</span>
          </div> */}
        </div>

        <div className="hero-right" aria-hidden="true">
          {/*<div className="floating-card floating-top-left">
            <span className="mini-icon">🏢</span>
            <div>
              <strong>Professional</strong>
              <span>Address</span>
            </div>
          </div>*/}
          {/*<div className="floating-card floating-bottom-left">
            <span className="mini-icon">🔐</span>
            <div>
              <strong>Privacy</strong>
              <span>Assured</span>
            </div>
          </div>*/}

          <div className="scene">
            <div className="window-panel" />
            <div className="cityline" />
            <div className="desk">
              <div className="desk-shadow" />
              <div className="plant plant-left">
                <img className="plant-image" src={plantImage} alt="" />
              </div>
              <div className="monitor">
                {/* <i className="monitor-glow" /> */}
                <span><strong>A SADHANA</strong></span>
                <span><strong>MYTHRI</strong></span>
                <span><strong>PRODUCT</strong></span>
               </div>
              <div className="monitor-stand" />
              {/* <div className="lamp"><i /></div> */}
              <div className="plant plant-right">
                <img className="plant-image" src={plantImage} alt="" />
              </div>
            </div>
             {/* <div className="address-bubble"> 
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
             <div className="ok">✓</div>
             </div> */}
            {/*  <div className="pin">📍</div> */}
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
              <div className="step-line" aria-hidden="false" />
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
              <h3><strong>{plan.name}</strong></h3>
              <p className="plan-note">{plan.note}</p>
              <p className="plan-price">
                <span>₹</span>
                {plan.price.toLocaleString("en-IN")}
                <small> /month (billed annually)</small>
              </p>
              <ul>
                {plan.items.map((item) => (
                  <CheckItem key={item}>{item}</CheckItem>
                ))}
              </ul>
              <button
                className={plan.featured ? "primary-btn" : "secondary-btn"}
                onClick={() => choosePlan(plan)}
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
        <div className="footer-main">
        <div className="footer-brand">
          <strong>SADHANA MYTHRI</strong>
          <p>
          follow us on social media for updates and offers.
          </p>
          <div className="social-row">
              <ul><span>f</span></ul>
              <ul><span>in</span></ul>
              <ul><span>ig</span></ul>
              <ul><span>X</span></ul>
          </div>
        </div>
        <div className="footer-links">
        <div className="footer-col">
          {/*<h4>Company</h4>
          <button type="button" onClick={() => navigate("/careers")}>
           <li>Careers</li>
          </button>
          <button type="button" onClick={() => navigate("/mission-vision")}>
            <li>Mission & Vision</li>
          </button>
          <button type="button" onClick={() => navigate("/documentation")}>
            <li>Documentation</li>
          </button>
          <button type="button" onClick={() => navigate("/faq")}>
            FAQ
          </button>
          <button type="button" onClick={() => navigate("/terms")}>
            Terms & Conditions
          </button>
          <button type="button" onClick={() => navigate("/privacy")}>
            Privacy Policy
          </button>*/}
        </div>
       {/* <div className="footer-col">
          <h4>Solutions</h4>
          <a href="#features">Virtual Office Address</a>
          <a href="#features">Mail Handling</a>
          <a href="#features">Compliance Support</a>
          <a href="#features">Document Management</a>
        </div> */}
        <div className="footer-col">
          <h4>Plans</h4>
          <a href="#plans" onClick={() => navigate("/plans")}><li>All Plans</li></a>
          <a href="#plans"><li>Pricing</li></a>

        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <button type="button" onClick={() => navigate("/terms")}>
            <li>Terms & Conditions</li>
          </button>
          <button type="button" onClick={() => navigate("/privacy")}>
            <li>Privacy Policy</li>
          </button>
          <button type="button" onClick={() => navigate("/refunds")}>
            <li>Refund Policy</li>
          </button>
          <button type="button" onClick={() => navigate("/faq")}>
            <li>FAQs</li>
          </button>
          <button type="button" onClick={() => navigate("/documentation")}>
            <li>Documentation</li>
          </button>
        </div>
        </div>
        </div>
       {/* <div className="footer-newsletter">
          <h4>Stay Connected</h4>
          <p>Subscribe to get updates and offers.</p>
          <div className="newsletter-row">
            <input type="email" placeholder="Enter your email" />
            <button className="login-btn" onClick={() => navigate("/plans")}>
              Subscribe
            </button>
          </div>
        </div>*/}
        <div className="footer-contact">
          <p>Contact Us:</p>
          <div className="footer-contact-line">
            <a href="tel:+919876543210">+91-9632587410</a>
            <span className="footer-divider" aria-hidden="true">||</span>
            <a href="mailto:info@sadhanamythri.com">info@sadhanamythri.com</a>
          </div>
        </div>
        <div className="footer-note"><b>© 2026 Sadhana Mythri. All rights reserved. All content, trademarks, logos, software, and materials on this website are the exclusive property of Sadhana Mythri and may not be reproduced, distributed, or used without prior written permission.</b></div>
        <div className="footer-made">Made with ♥ in India</div>
      </footer>

      <div title="Click here to chat with our virtual assistance">
        <button className="chat-bubble"
         type="button" 
         aria-label="Open support chat" 
         onClick={() => navigate("/support-chat")}
        >
          💬
        </button>
      </div>

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
