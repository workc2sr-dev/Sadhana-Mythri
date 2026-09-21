import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

// One-time password confirmation step shown after login/register
export default function OtpPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(() => sessionStorage.getItem("sadhana_otp") || String(Math.floor(100000 + Math.random() * 900000)));
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const planId = searchParams.get("plan");
  const notice = searchParams.get("notice");
  const { user, refreshUser } = useAuth();
  const returnPath = user?.is_admin ? "/admin" : "/";

  useEffect(() => { sessionStorage.setItem("sadhana_otp", otp); }, [otp]);

  // Validate the entered OTP and route to the next required step
  const verify = async (event) => {
    event.preventDefault();
    if (value !== otp) { setError("That OTP does not match. Please try again."); return; }
    sessionStorage.setItem("sadhana_otp_verified", "true");
    sessionStorage.removeItem("sadhana_otp");

    if (!planId) { navigate(returnPath, { replace: true }); return; }

    // Customer/business details and KYC must be submitted and approved before a plan can go to payment.
    try {
      const [freshUser, verification, businessDetails] = await Promise.all([
        refreshUser(),
        api.getVerification(),
        api.getBusinessDetails().catch(() => null),
      ]);
      if (!businessDetails) {
        navigate(`/business-details?plan=${planId}`, { replace: true });
        return;
      }
      const kycApproved = verification?.status === "approved" && freshUser?.account_status === "created";
      navigate(kycApproved ? `/payment?plan=${planId}` : `/dashboard/plans?plan=${planId}&kyc=required`, { replace: true });
    } catch {
      navigate(`/business-details?plan=${planId}`, { replace: true });
    }
  };

  // Generate and store a fresh on-screen OTP
  const resend = () => {
    const nextOtp = String(Math.floor(100000 + Math.random() * 900000));
    setOtp(nextOtp);
    setValue("");
    setError("");
  };

  return <main className="landing"><section className="section-page auth-page"><div className="section-page-header"><div><p className="hero-kicker">ONE-TIME PASSWORD</p><h1>Confirm it’s you.</h1></div></div><form className="empty-panel auth-form" onSubmit={verify}><p>Until an SMS or email provider is connected, use the on-screen OTP below.</p><p className="otp-code" aria-label="One-time password">{otp}</p><label>Enter OTP<input autoFocus inputMode="numeric" maxLength="6" value={value} onChange={(event) => setValue(event.target.value.replace(/\D/g, ""))} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-btn">Verify and continue</button><button type="button" className="text-btn" onClick={resend}>Generate a new OTP</button></form></section></main>;
}
