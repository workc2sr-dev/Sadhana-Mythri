import { useState } from "react";
import { useNavigate } from "react-router-dom";

const welcomeMessage = {
  role: "assistant",
  text: "Hi! How can we help with your virtual office, subscription, or account today?",
};

function getReply(message) {
  const text = message.toLowerCase();

  if (text.includes("plan") || text.includes("price") || text.includes("pricing")) {
    return "You can compare our available plans and pricing on the Plans page.";
  }
  if (text.includes("payment") || text.includes("invoice")) {
    return "For payment or invoice help, please share your registered email with our support team.";
  }
  if (text.includes("address") || text.includes("gst") || text.includes("registration")) {
    return "Our team can guide you through virtual office, GST, and business-registration requirements.";
  }
  if( text.includes("document") || text.includes("verification") || text.includes("upload")) {
    return "For document upload or verification assistance, please contact our support team with your registered email.";
  }
  if (text.includes("account") || text.includes("login") || text.includes("signup")) {
    return "For account-related help, please contact our support team with your registered email.";
  }
  if (text.includes("support") || text.includes("help") || text.includes("contact")) {
    return "You can reach our support team by phone at +91 96325 87410 or by email at info@sadhanamythri.com.";
  }
  if( text.includes("refund") || text.includes("cancellation") || text.includes("policy")) {
    return "You can review our Refund Policy on the Refund page for details on eligibility, process, and timelines.";
  }
  if (text.includes("faq") || text.includes("question") || text.includes("answer")) {
    return "You can find answers to common questions on our FAQ page.";
  }

  return "Thanks for your message. For personalised assistance, contact our support team by phone or email and we will help you further.";
}

export default function SupportChatPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([welcomeMessage]);

  const sendMessage = (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", text: trimmedMessage },
      { role: "assistant", text: getReply(trimmedMessage) },
    ]);
    setMessage("");
  };

  return (
    <main className="landing support-chat-page">
      <section className="section-page">
        <div className="section-page-header">
          <div>
            <p className="hero-kicker">SUPPORT</p>
            <h1>Chat with us</h1>
            <p className="page-intro">Get quick help with plans, payments, virtual office services, and your account.</p>
          </div>
          <button className="secondary-btn" onClick={() => navigate("/")}>Back to home</button>
        </div>

        <section className="support-chat" aria-label="Support chat">
          <div className="support-chat-messages" aria-live="polite">
            {messages.map((chatMessage, index) => (
              <p key={`${chatMessage.role}-${index}`} className={`chat-message ${chatMessage.role}`}>
                {chatMessage.text}
              </p>
            ))}
          </div>
          <form className="support-chat-form" onSubmit={sendMessage}>
            <label htmlFor="support-message">Your message</label>
            <div>
              <input id="support-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type your question..." />
              <button className="primary-btn" type="submit">Send</button>
            </div>
          </form>
          <p className="support-chat-contact">
            Prefer to speak with our team? <a href="tel:+919632587410">+91 96325 87410</a> or <a href="mailto:info@sadhanamythri.com">info@sadhanamythri.com</a>
          </p>
        </section>
      </section>
    </main>
  );
}
