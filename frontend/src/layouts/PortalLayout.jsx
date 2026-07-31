import { NavLink } from "react-router-dom";

export default function PortalLayout({ onBack, onLogout, children }) {
  const tabs = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "My Profile", to: "/dashboard/profile" },
    { label: "My Applications", to: "/dashboard/applications" },
    { label: "Plans & KYC", to: "/dashboard/plans" },
    { label: "Notifications", to: "/dashboard/notifications" },
  ];

  const confirmLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) onLogout();
  };

  return (
    <div className="dashboard">
      <aside>
        <button className="logo" onClick={onBack}>SADHANA <em>MYTHRI</em></button>
        <div className="sidebar-label">USER DASHBOARD</div>
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.to === "/dashboard"}>
            {({ isActive }) => <span className={isActive ? "active" : ""}>{tab.label}</span>}
          </NavLink>
        ))}
        <button className="back" onClick={onBack}>Back to website</button>
        <button className="back" onClick={confirmLogout}>Logout</button>
      </aside>
      <section className="dashboard-main">{children}</section>
    </div>
  );
}
