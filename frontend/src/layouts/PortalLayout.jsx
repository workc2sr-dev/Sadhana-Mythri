import { useState } from "react";
import { NavLink } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal";

// Sidebar/dashboard shell shared by all authenticated portal pages
export default function PortalLayout({ onBack, onLogout, children }) {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const tabs = [
    { label: "Dashboard", to: "/dashboard", type: "default" },
    { label: "My Plan", to: "/dashboard/plans", type: "accent" },
    { label: "Update", to: "/dashboard/plans", type: "action" },
    { label: "Cancel", to: "/dashboard/plans", type: "danger" },
    { label: "My Profile", to: "/dashboard/profile", type: "default" },
    { label: "Settings", to: "/dashboard/profile", type: "action" },
    { label: "My Applications", to: "/dashboard/applications", type: "default" },
    { label: "Invoices & Billing", to: "/dashboard/invoices", type: "default" },
    { label: "Notifications", to: "/dashboard/notifications", type: "default" },
  ];

  // Open the logout confirmation dialog
  const confirmLogout = () => {
    setLogoutOpen(true);
  };

  // Close the dialog and perform the actual logout
  const handleLogout = () => {
    setLogoutOpen(false);
    onLogout();
  };

  return (
    <>
      <div className="dashboard">
        <aside>
          <button className="logo" onClick={onBack}>SADHANA <em>MYTHRI</em></button>
          <div className="sidebar-label">USER DASHBOARD</div>
          {tabs.map((tab) => (
            <NavLink
              key={`${tab.to}-${tab.label}`}
              to={tab.to}
              end={tab.to === "/dashboard"}
              className={`sidebar-link ${tab.type}`}
            >
              {({ isActive }) => <span className={isActive ? "active" : ""}>{tab.label}</span>}
            </NavLink>
          ))}
          <button className="back" onClick={onBack}>Back to website</button>
          <button className="back" onClick={confirmLogout}>Logout</button>
        </aside>
        <section className="dashboard-main">{children}</section>
      </div>

      <ConfirmationModal
        open={logoutOpen}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Yes, log out"
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </>
  );
}
