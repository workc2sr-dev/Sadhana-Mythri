import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();
  const planId = searchParams.get("plan");

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "register") await register(form);
      const signedInUser = await login({ email: form.email, password: form.password });
      sessionStorage.removeItem("sadhana_otp_verified");
      navigate(signedInUser.is_admin ? "/otp" : planId ? `/otp?plan=${planId}` : "/otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="landing">
      <section className="section-page auth-page">
        <div className="section-page-header">
          <div><p className="hero-kicker">USER ACCESS</p><h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1></div>
          <button className="secondary-btn" onClick={() => navigate("/")}>Back to website</button>
        </div>
        <form className="empty-panel auth-form" onSubmit={submit}>
          {planId && <p>You’ll continue with your selected plan after signing in.</p>}
          {mode === "register" && <label>Full name<input required minLength="2" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} /></label>}
          <label>Email address<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Password<input required minLength="8" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-btn" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Login" : "Register"}</button>
          <button type="button" className="text-btn" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "New here? Register" : "Already registered? Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
