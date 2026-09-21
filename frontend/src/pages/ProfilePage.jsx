import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PortalLayout from "../layouts/PortalLayout";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

const accountStatusLabels = {
  under_review: "Under review",
  created: "Created",
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

  useEffect(() => {
    if (!isAuthenticated) navigate("/auth", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshUser();
    api.getVerification().then(setVerification).catch(() => {});
  }, [isAuthenticated]);

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
  </PortalLayout>;
}
