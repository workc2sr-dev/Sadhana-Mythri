import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api, API_URL } from "../services/api";
import ConfirmationModal from "../components/ConfirmationModal";
import { monthlyPlanPrices } from "../utils/pricing";
import citylineImage from "../cityline-background.png";
import plantImage from "../plant.png";
import logoImage from "../Elevanta Spaces Logo.png?v=2";

// Features offered by the virtual office service
// these features should be visible as a slideshow on the homepage
const features = [
  {
    id: "official-address",
    n: "1",
    title: "Official Business Address",
    text: "Use a credible business address for registrations and growth.",
  },
  {
    id: "online-registration",
    n: "2",
    title: "Easy Online Registration & Verification",
    text: "Quick, paperless, and hassle-free onboarding process.",
  },
  {
    id: "subscription-plans",
    n: "3",
    title: "Flexible Subscription Plans",
    text: "Choose a plan that fits your business needs and budget.",
  },
  {
    id: "billing-dashboard",
    n: "4", 
    title: "Secure Dashboard for Billing & Management",
    text: "Manage documents, payments and renewals in one place.",
  },
];

const steps = [
  {
    id: "login-signup",
    n: "1",
    title: "Login / Signup",
    text: "Login or create an account with your Gmail and a password to get started with your virtual office address.",
  },
  {
    id: "register-verify",
    n: "2",
    title: "KYC-Verification",
    text: "Complete your details and verify online in minutes.",
  },
  {
    id: "choose-plan",
    n: "3",
    title: "Choose a Plan",
    text: "Select the subscription plan that best fits your business needs.",
  },
  {
    id: "subscription-approval",
    n: "4",
    title: "Subscription Approval",
    text: "We verify your details and activate your plan.",
  },
  {
    id: "virtual-office",
    n: "5",
    title: "Your Virtual Office Address",
    text: "Use your address for business registration and grow confidently.",
  },
];
/*plans we offer heading*/

const plans = [
  {
    id: "essential",
    name: "Starter Plan",
    /*note: "For freelancers",*/
    price: monthlyPlanPrices.essential,
    items: [
      "Official Business Address",
      "Mail & Document Handling",
    ],
  },
  {
    id: "business",
    name: "Growth Plan",
    /*note: "For startups",*/
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
    /*note: "For growing businesses",*/
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

// Renders a checklist bullet with a checkmark icon
function CheckItem({ children }) {
  return (
    <li>
      <span className="check">✓</span>
      <span>{children}</span>
    </li>
  );
}

// Public marketing landing page with plans, chat widget, and account menu
export default function HomePage() {
  const [notice, setNotice] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([{
    role: "assistant",
    text: "Hi! How can I help you today?",
  }]);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // Smoothly scroll to a section by its element id
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Log out, clear OTP state, and close the confirmation dialog
  const signOut = () => {
    logout();
    sessionStorage.removeItem("sadhana_otp_verified");
    setLogoutOpen(false);
    navigate("/");
  };

  // Send a chat message to the support endpoint and append the reply
  const sendMessage = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const userMessage = { role: "user", text: trimmedMessage };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/chat/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedMessage,
          history: nextMessages.map(({ role, text }) => ({ role, text })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Unable to get a support reply.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: "assistant", text: data.reply },
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          text:
            "Sorry, I'm temporarily unavailable. Please contact our support team at +91 96325 87410 or info@sadhanamythri.com.",
        },
      ]);
    }
  };

  const accountSidebarItems = [
    { label: "My Plan", to: "/dashboard/plans" },
    { label: "Update", to: "/dashboard/plans" },
    { label: "Settings", to: "/dashboard/profile" },
    { label: "Profile", to: "/dashboard/profile" },
    { label: "Applications", to: "/dashboard/applications" },
    { label: "Notifications", to: "/dashboard/notifications" },
    { label: "Logout", action: "logout" },
  ];

  // Select a plan and route the user to auth, OTP, or plans based on their state
  const choosePlan = async (plan) => {
    setNotice(`${plan.name} selected.`);
    if (isAuthenticated) {
      try {
        const subscriptions = await api.getSubscriptions();
        const hasActivePlan = subscriptions.some((subscription) =>
          ["under_review", "approved", "active"].includes(subscription.status),
        );
        if (hasActivePlan) {
          setNotice("One plan per account.");
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
    <main className={`landing home-page${isAuthenticated && !user?.is_admin ? " landing-authenticated" : ""}`}>
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
          <a className="phone-pill" href="tel:+918904178434" aria-label="Call us">
            <span>☎</span> +91 8904178434
          </a>

          {isAuthenticated && !user?.is_admin ? (
            <div className="user-account-pill" aria-label="Signed in user">
              <span className="user-avatar">{(user?.full_name || "U").split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase() || "U"}</span>
              <span className="user-menu-label">{user?.full_name || "My Account"}</span>
            </div>
          ) : isAuthenticated && user?.is_admin ? (
            <button className="login-btn" onClick={() => navigate("/admin")}>
              Admin Console
            </button>
          ) : (
            <>
              <button className="login-btn" onClick={() => navigate("/auth")}>
                Login
              </button>
              <button className="signup-btn" onClick={() => navigate("/auth")}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      <div className="landing-scroll">
      <ConfirmationModal
        open={logoutOpen}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Yes, log out"
        onConfirm={signOut}
        onCancel={() => setLogoutOpen(false)}
      />

      {isAuthenticated && !user?.is_admin && (
        <div className="landing-account-toolbar" aria-label="Account navigation">
          <div className="landing-account-identity">
            <span className="user-avatar">{(user?.full_name || "U").split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase() || "U"}</span>
            <div>
              <strong>{user?.full_name || "My Account"}</strong> 
              <div>{user?.email}</div>
            </div>
          </div>

          <nav className="landing-account-nav" aria-label="Account navigation links">
            {accountSidebarItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`landing-sidebar-link${item.action === "logout" ? " logout-item" : ""}`}
                onClick={() => {
                  if (item.action === "logout") {
                    setLogoutOpen(true);
                    return;
                  }
                  navigate(item.to);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

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

      {/* <div className="trust-row">
           <span>🛡 GST Compliant</span>
            <span>🔒 Secure & Private</span>
            <span>🎧 24x7 Support</span>
          </div> */}
        </div>

        <div className="hero-right" aria-hidden="true">
          <div className="floating-trait-list">
          <div className="floating-card floating-center">
            {/*<span className="mini-icon">🏢</span>*/}
            <p>
              <u><strong>Easy Verification</strong></u>
            </p>
          </div>
          <div className="floating-card floating-center">
            {/*<span className="mini-icon">🔐</span>*/}
            <p>
              <u><strong>Privacy Assured</strong></u>
            </p>
          </div>

          <div className="floating-card floating-center">
            {/*<span className="mini-icon">A</span>*/}
            <u><strong>Business Address for you</strong></u>
          </div>
          <div className="floating-card floating-center">
            {/*<span className="mini-icon">M</span>*/}
            <u><strong>Mail Handling</strong></u>
          </div>
          </div>

          <div className="scene">
            <div className="window-panel" />
            <div
              className="cityline"
              style={{ backgroundImage: `url(${citylineImage})` }}
            />
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
              <div className="address-bubble"> 
               <div className="building">🏙</div> 
               <p>
                <li><strong>Your Business Address</strong></li>
                <span>TBD</span>
              </p> 
             <div className="floating-card floating-mid-left">
             <span className="mini-icon">📬</span> 
             <p>
              <li><strong>Mail & Document</strong></li>
              <span>Management</span>
            </p> 
          </div>
             <div className="ok">✓</div>
             </div> 
            {/*  <div className="pin">📍</div> */}
          </div>  

          {/* <div className="side-plant left" /> */}
          {/* <div className="side-plant right" /> */}
        </div>
      </section>

      <section className="feature-strip" id="features">
        <div className="marquee">
          <div className="marquee-track marquee-track-reverse">
            {[...features, ...features].map((feature, index) => (
              <article key={`${feature.id}-${index}`} className="feature-card">
                <div className="feature-illustration" aria-hidden="true" />
                <div>
                  <h3><strong>{feature.title}</strong></h3>
                  <p>{feature.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
 

         {/* HOW IT WORKS SECTION*/} 
      <section className="how-it-works" id="solutions">
        <p className="section-title">How It Works</p>
        <div className="marquee">
          <div className="marquee-track">
            {[...steps, ...steps].map((step, index) => (
              <article key={`${step.id}-${index}`} className="step">
                <div className="step-circle">{step.n}</div>
                <div className="step-body">
                  <h3><strong>{step.title}</strong></h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>


      {/* How the pricing works */}
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

     {/* <section className="trust-band">
        <span>GST Compliant</span>
        <span>Secure & Confidential</span>
        <span>Instant Activation</span>
        <span>24x7 Customer Support</span>
      </section>*/}



     {/* blue banner*/}
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
            <a href="tel:+918904178434" aria-label="Call us">+91-8904178434</a>
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
         onClick={() => setChatOpen(true)}
        >
          💬
        </button>
      </div>

      {chatOpen && (
        <div className="chat-modal-overlay" onClick={() => setChatOpen(false)}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <div>
                <h2>Chat with us</h2>
                <p>Get quick help with your queries about your account.</p>
              </div>
              <button
                className="chat-modal-close"
                onClick={() => setChatOpen(false)}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            <div className="support-chat-messages" aria-live="polite">
              {messages.map((chatMessage, index) => (
                <p
                  key={`${chatMessage.role}-${index}`}
                  className={`chat-message ${chatMessage.role}`}
                >
                  {chatMessage.text}
                </p>
              ))}
            </div>

            <p className="support-chat-note">
              <strong>Note:</strong> This chat session is not maintained and may
              be lost upon <strong>closing the chat</strong>.
            </p>

            <form className="support-chat-form" onSubmit={sendMessage}>
              <div>
                <input
                  id="support-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Ask your query here..."
                />

                <button className="primary-btn" type="submit">
                  Submit
                </button>

                <button
                  className="secondary-btn"
                  type="button"
                  onClick={() => setMessages([{
                    role: "assistant",
                    text: "Hi! How can I help you today?",
                  }])}
                >
                  Clear Chat
                </button>
              </div>
            </form>

            <p className="support-chat-contact">
              Prefer to speak with our team?{" "}
              <a href="tel:+918904178434" aria-label="Call us">+91 8904178434</a> or{" "}
              <a href="mailto:info@sadhanamythri.com">
                info@sadhanamythri.com
              </a>
            </p>
          </div>
        </div>
      )}

      {notice && (
        <div className="toast">
          {notice}
          <button aria-label="Dismiss" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
      </div>
    </main>
  );
}
