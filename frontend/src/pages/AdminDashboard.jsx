import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";

const sections = [
  "Overview", "Users", "Subscriptions", "Plans", "Infrastructure", "Documents",
  "Invoices", "Payments", "Support", "Notifications", "Reports", "Staff & Admin",
  "Settings", "Audit Logs",
];

const moduleDescriptions = {
  Infrastructure: "Manage desks, cabins, meeting rooms, and their availability.",
  Documents: "Review customer verification documents and retain approval history.",
  Payments: "Reconcile payment transactions and refunds.",
  Support: "Track support requests and assign them to the right team member.",
  Notifications: "Create operational alerts and customer-facing announcements.",
  Reports: "Export occupancy, revenue, subscription, and service reports.",
  "Staff & Admin": "Manage staff access and administrator permissions.",
  Settings: "Configure business details, policies, and service preferences.",
  "Audit Logs": "Review security-sensitive changes and administrative activity.",
};

function number(value) {
  return value?.toLocaleString("en-IN") ?? "—";
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("Overview");
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
      return;
    }
    if (!user?.is_admin) {
      navigate("/dashboard", { replace: true });
      return;
    }
    Promise.all([api.getAdminUsers(), api.getPlans(), api.getAdminVerifications()])
      .then(([adminUsers, catalog, kycVerifications]) => {
        setUsers(adminUsers);
        setPlans(catalog);
        setVerifications(kycVerifications);
      })
      .catch((requestError) => setError(requestError.message));
  }, [isAuthenticated, navigate, user?.is_admin]);

  const signOut = () => {
    logout();
    navigate("/", { replace: true });
  };

  const reviewVerification = async (verificationId, reviewStatus) => {
    setError("");
    try {
      const updated = await api.reviewVerification(verificationId, reviewStatus);
      setVerifications((current) => current.map((verification) => verification.id === updated.id ? { ...verification, ...updated } : verification));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const deleteUser = async (account) => {
    if (!window.confirm(`Delete ${account.full_name}'s account and all related records? This cannot be undone.`)) return;
    setError("");
    try {
      await api.deleteAdminUser(account.id);
      setUsers((current) => current.filter((userAccount) => userAccount.id !== account.id));
      setVerifications((current) => current.filter((verification) => verification.user_id !== account.id));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const viewVerification = async (verificationId) => {
    setError("");
    try {
      const document = await api.getVerificationDocument(verificationId);
      window.open(URL.createObjectURL(document), "_blank", "noopener,noreferrer");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const content = () => {
    if (tab === "Overview") return <>
      <div className="admin-intro"><div><p className="eyebrow">ADMINISTRATOR CONSOLE</p><h1>Operations at a glance.</h1><p>Manage the people, services, and activity behind Sadhana Mythri.</p></div><button className="secondary-btn" onClick={() => setTab("Users")}>Manage users</button></div>
      {error && <p className="form-error">Some dashboard data could not be loaded: {error}</p>}
      <div className="admin-metrics">
        <article><span>Total users</span><strong>{number(users.length)}</strong><small>{number(users.filter((account) => account.is_admin).length)} administrators</small></article>
        <article><span>Plans</span><strong>{number(plans.length)}</strong><small>Published service plans</small></article>
        <article><span>Infrastructure</span><strong>—</strong><small>Configure desks and cabins</small></article>
        <article><span>Open support</span><strong>—</strong><small>Support module not configured</small></article>
      </div>
      <section className="admin-card"><div className="admin-card-heading"><div><p className="eyebrow">QUICK ACCESS</p><h2>Operational modules</h2></div></div><div className="admin-shortcuts">{sections.slice(1).map((section) => <button key={section} onClick={() => setTab(section)}>{section}<span>→</span></button>)}</div></section>
    </>;

    if (tab === "Users") return <section className="admin-card"><div className="admin-card-heading"><div><p className="eyebrow">USERS</p><h2>Account directory</h2></div><span>{number(users.length)} accounts</span></div>{error ? <p className="form-error">{error}</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead><tbody>{users.map((account) => <tr key={account.id}><td>{account.full_name}</td><td>{account.email}</td><td><span className={`role-chip ${account.is_admin ? "role-admin" : ""}`}>{account.is_admin ? "Administrator" : "User"}</span></td><td>{account.is_admin ? "Protected" : <button className="delete-user-btn" onClick={() => deleteUser(account)}>Delete</button>}</td></tr>)}</tbody></table></div>}</section>;

    if (tab === "Plans") return <section className="admin-card"><div className="admin-card-heading"><div><p className="eyebrow">PLANS</p><h2>Service catalogue</h2></div></div><div className="admin-plan-grid">{plans.map((plan) => <article key={plan.id}><p>{plan.id}</p><h3>{plan.name}</h3><strong>₹{number(plan.price)}</strong><span>{plan.workspace_days} workspace days</span></article>)}</div></section>;

    if (tab === "Documents") return <section className="admin-card"><div className="admin-card-heading"><div><p className="eyebrow">KYC DOCUMENTS</p><h2>Government ID reviews</h2></div><span>{number(verifications.filter((verification) => verification.status === "pending").length)} pending</span></div>{error ? <p className="form-error">{error}</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>User</th><th>Government ID</th><th>Status</th><th>Decision</th></tr></thead><tbody>{verifications.length ? verifications.map((verification) => <tr key={verification.id}><td><strong>{verification.user_name}</strong><br /><span>{verification.user_email}</span></td><td>{verification.document_type}<br /><span>{verification.document_name}</span><button className="text-btn" onClick={() => viewVerification(verification.id)}>View ID</button></td><td><span className={`kyc-status kyc-${verification.status}`}>{verification.status}</span></td><td>{verification.status === "pending" ? <div className="review-actions"><button className="primary-btn" onClick={() => reviewVerification(verification.id, "approved")}>Accept</button><button className="secondary-btn" onClick={() => reviewVerification(verification.id, "declined")}>Decline</button></div> : "Reviewed"}</td></tr>) : <tr><td colSpan="4">No government IDs have been submitted.</td></tr>}</tbody></table></div>}</section>;

    if (tab === "Subscriptions") return <section className="admin-card"><p className="eyebrow">SUBSCRIPTIONS</p><h2>Subscription operations</h2><p className="admin-module-copy">Subscription review and status management will appear here once the administrative subscription API is connected.</p></section>;

    return <section className="admin-card admin-module"><p className="eyebrow">{tab.toUpperCase()}</p><h2>{tab}</h2><p className="admin-module-copy">{moduleDescriptions[tab]}</p><span>This module is ready for its data source and workflows.</span></section>;
  };

  return <div className="admin-dashboard"><aside className="admin-sidebar"><button className="logo" onClick={() => navigate("/")}>SADHANA <em>MYTHRI</em></button><div className="sidebar-label">ADMIN DASHBOARD</div><nav>{sections.map((section) => <button key={section} className={tab === section ? "active" : ""} onClick={() => setTab(section)}>{section}</button>)}</nav><button className="back" onClick={() => navigate("/")}>Back to website</button><button className="back" onClick={signOut}>Logout</button></aside><main className="admin-main">{content()}</main></div>;
}
