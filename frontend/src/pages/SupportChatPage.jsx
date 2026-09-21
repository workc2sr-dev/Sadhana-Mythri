import { useState } from "react";
import { useNavigate } from "react-router-dom";

const welcomeMessage = {
  role: "assistant",
  text: "Hi! How can I help you today?",
};

// Standalone support chat page (no auth required)
export default function SupportChatPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([welcomeMessage]);

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
      const response = await fetch("/api/chat/support", {
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
            "Sorry, I’m temporarily unavailable. Please contact our support team at +91 96325 87410 or info@sadhanamythri.com.",
        },
      ]);
    }
  };

  return (
    <main className="landing support-chat-page">
      <section className="section-page">
        <div className="section-page-header">
          <div>
            <p className="hero-kicker"><u>SUPPORT</u></p>
            <h1>Chat with us</h1>
            <p className="page-intro">
              Get quick help with your queries about your account.
            </p>
          </div>

          <button
            className="secondary-btn"
            onClick={() => navigate("/")}
          >
            Back to home
          </button>
        </div>

        <section className="support-chat" aria-label="Support chat">
          <div
            className="support-chat-messages"
            aria-live="polite"
          >
            {messages.map((chatMessage, index) => (
              <p
                key={`${chatMessage.role}-${index}`}
                className={`chat-message ${chatMessage.role}`}
              >
                {chatMessage.text}
              </p>
            ))}
          </div>

          {/* Chat session note */}
          <p className="support-chat-note">
            <strong>Note:</strong> This chat session is not maintained and may
            be lost upon <strong>page refresh</strong>.
          </p>

          <form
            className="support-chat-form"
            onSubmit={sendMessage}
          >
            <div>
              <input
                id="support-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask your query here..."
              />

              <button
                className="primary-btn"
                type="submit"
              >
                Submit
              </button>

              <button
                className="secondary-btn"
                type="button"
                onClick={() => setMessages([welcomeMessage])}
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
        </section>
      </section>
    </main>
  );
}