import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

const emptyForm = {
  business_name: "",
  business_type: "",
  gst_number: "",
  phone: "",
  address_line: "",
  city: "",
  state: "",
  pincode: "",
};

// Collects customer/business profile details before the user can subscribe
export default function BusinessDetailsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshUser } = useAuth();
  const planId = searchParams.get("plan");
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) { navigate(`/auth${planId ? `?plan=${planId}` : ""}`, { replace: true }); return; }
    api.getBusinessDetails().then((details) => { if (details) setForm({ ...emptyForm, ...details }); }).catch(() => {});
  }, [isAuthenticated, navigate, planId]);

  const isIndividual = user?.account_type !== "business";
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  // Save the business/customer details and route to payment or KYC as needed
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = isIndividual
        ? { ...form, business_type: "Individual / Personal", business_name: form.business_name || user?.full_name || "Individual customer" }
        : form;
      await api.submitBusinessDetails(payload);
      if (!planId) { navigate("/dashboard", { replace: true }); return; }

      const freshUser = (await refreshUser()) || user;
      const verification = await api.getVerification();
      const kycApproved = verification?.status === "approved" && freshUser?.account_status === "created";
      navigate(kycApproved ? `/payment?plan=${planId}` : `/dashboard/plans?plan=${planId}&kyc=required`, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="landing">
      <section className="section-page auth-page">
        <div className="section-page-header">
          <div><p className="hero-kicker">CUSTOMER / BUSINESS DETAILS</p><h1>Tell us about yourself or your business.</h1></div>
        </div>
        <form className="empty-panel auth-form" onSubmit={submit}>
          {!isIndividual && (
            <>
              <label>Business type
                <select required value={form.business_type} onChange={update("business_type")}>
                  <option value="">Select a type</option>
                  <option>Freelancer / Sole proprietor</option>
                  <option>Partnership</option>
                  <option>Private Limited Company</option>
                  <option>LLP</option>
                  <option>Other</option>
                </select>
              </label>
              <label>Business name<input required minLength="2" value={form.business_name} onChange={update("business_name")} /></label>
            </>
          )}
          <label>GST number (optional)<input value={form.gst_number || ""} onChange={update("gst_number")} /></label>
          <label>Phone number<input required minLength="7" value={form.phone} onChange={update("phone")} /></label>
          <label>Address<input required minLength="3" value={form.address_line} onChange={update("address_line")} /></label>
          <label>City<input required minLength="2" value={form.city} onChange={update("city")} /></label>
          <label>State<input required minLength="2" value={form.state} onChange={update("state")} /></label>
          <label>Pincode<input required minLength="4" value={form.pincode} onChange={update("pincode")} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-btn" disabled={busy}>{busy ? "Saving…" : "Save and continue"}</button>
        </form>
      </section>
    </main>
  );
}
