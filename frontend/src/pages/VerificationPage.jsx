import { useNavigate } from "react-router-dom";

export default function VerificationPage() {
  const navigate = useNavigate();

  return (
    <main className="landing">
      <section className="section-page">
        <div className="section-page-header">
          <div>
            <p className="hero-kicker">VERIFICATION</p>
            <h1>Finish verification to activate your address.</h1>
          </div>
          <button className="secondary-btn" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </button>
        </div>

        <div className="empty-panel verification-panel">
          <h2>Verification flow</h2>
          <p>
            This page is now a real route. You can connect your document upload
            and approval workflow here next.
          </p>
          <div className="verification-actions">
            <button className="primary-btn" onClick={() => navigate("/dashboard")}>
              Return to dashboard
            </button>
            <button className="secondary-btn" onClick={() => navigate("/")}>
              Back to home
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
