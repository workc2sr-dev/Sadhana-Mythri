import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PortalLayout from "../layouts/PortalLayout";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

const accountStatusLabels = {
  under_review: "Awaiting admin verification",
  created: "Verified by admin",
};

const kycStatusLabels = {
  not_started: "Government ID not submitted",
  pending: "KYC submitted — awaiting admin review",
  approved: "KYC approved",
  declined: "KYC declined",
};

// Shows the user's account and KYC verification status
export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, refreshUser } = useAuth();
  const [verification, setVerification] = useState({ status: "not_started" });
  const [documentType, setDocumentType] = useState("Aadhaar Card");
  const [document, setDocument] = useState(null);
  const documentInput = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isAuthenticated) navigate("/auth", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshUser();
    api.getVerification()
      .then((result) => {
        setVerification(result);
        if (result.document_type) setDocumentType(result.document_type);
      })
      .catch((requestError) => setError(requestError.message));
  }, [isAuthenticated, refreshUser]);

  const submitVerification = async (event) => {
    event.preventDefault();
    if (!document) {
      setError("Choose a government ID document to upload.");
      return;
    }

    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const updated = await api.submitVerification(documentType, document);
      setVerification(updated);
      setDocument(null);
      if (documentInput.current) documentInput.current.value = "";
      setSuccess("Your ID has been submitted for admin review.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  // Log out and return to the homepage
  const signOut = () => {
    logout();
    navigate("/");
  };
  const initials = user?.full_name?.split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase() || "SM";
  const accountStatus = user?.account_status || "under_review";

  return <PortalLayout onBack={() => navigate("/")} onLogout={signOut}>
    <div className="welcome"><div><p className="eyebrow">MY PROFILE</p><h1>Your account details.</h1></div><div className="avatar">{initials}</div></div>
    <div className="empty-panel"><h2>{user?.full_name}</h2><p>{user?.email}</p><p>Keep your contact details up to date for application updates.</p></div>
    <div className="empty-panel">
      <p className="eyebrow">ADMIN APPROVAL STATUS</p>
      <h2>{accountStatusLabels[accountStatus] || accountStatusLabels.under_review}</h2>
      <p>Government ID verification: {kycStatusLabels[verification.status] || kycStatusLabels.not_started}</p>
    </div>
    {verification.status !== "approved" && (
      <form className="empty-panel auth-form" onSubmit={submitVerification}>
        <p className="eyebrow">GOVERNMENT ID VERIFICATION</p>
        <h2>{verification.status === "pending" ? "Replace your submitted ID" : "Submit your ID for review"}</h2>
        <p>Upload a PDF, JPG, or PNG file (up to 5 MB). An admin will review it before your account is activated.</p>
        <label>Document type
          <select required value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
            <option>Aadhaar Card</option>
            <option>PAN Card</option>
            <option>Passport</option>
            <option>Driving Licence</option>
            <option>Voter ID</option>
            <option>Other</option>
          </select>
        </label>
        <label>Government ID document
          <input
            ref={documentInput}
            required
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={(event) => setDocument(event.target.files?.[0] || null)}
          />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}
        <button className="primary-btn" disabled={busy}>{busy ? "Uploading…" : "Submit for admin review"}</button>
      </form>
    )}
  </PortalLayout>;
}
