import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function OtpPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(() => sessionStorage.getItem("sadhana_otp") || String(Math.floor(100000 + Math.random() * 900000)));
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const planId = searchParams.get("plan");
  const notice = searchParams.get("notice");
  const { user } = useAuth();
  const dashboardPath = user?.is_admin ? "/admin" : planId ? `/dashboard/plans?plan=${planId}` : notice ? `/dashboard?notice=${notice}` : "/dashboard";

  useEffect(() => { sessionStorage.setItem("sadhana_otp", otp); }, [otp]);

  const verify = (event) => {
    event.preventDefault();
    if (value !== otp) { setError("That OTP does not match. Please try again."); return; }
    sessionStorage.setItem("sadhana_otp_verified", "true");
    sessionStorage.removeItem("sadhana_otp");
    navigate(dashboardPath, { replace: true });
  };

  const resend = () => {
    const nextOtp = String(Math.floor(100000 + Math.random() * 900000));
    setOtp(nextOtp);
    setValue("");
    setError("");
  };

  return <main className="landing"><section className="section-page auth-page"><div className="section-page-header"><div><p className="hero-kicker">ONE-TIME PASSWORD</p><h1>Confirm it’s you.</h1></div></div><form className="empty-panel auth-form" onSubmit={verify}><p>Until an SMS or email provider is connected, use the on-screen OTP below.</p><p className="otp-code" aria-label="One-time password">{otp}</p><label>Enter OTP<input autoFocus inputMode="numeric" maxLength="6" value={value} onChange={(event) => setValue(event.target.value.replace(/\D/g, ""))} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-btn">Verify and continue</button><button type="button" className="text-btn" onClick={resend}>Generate a new OTP</button></form></section></main>;
}
