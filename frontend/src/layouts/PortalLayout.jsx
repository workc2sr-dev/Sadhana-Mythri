export default function PortalLayout({ activeTab, onTabChange, onBack, onLogout, children }) {
  const tabs = ["Dashboard", "My Profile", "My Applications", "Notifications"];

  return (
    <div className="dashboard">
      <aside>
        <button className="logo" onClick={onBack}>SADHANA <em>MYTHRI</em></button>
        <div className="sidebar-label">USER DASHBOARD</div>
        {tabs.map((tab) => (
          <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => onTabChange(tab)}>{tab}</button>
        ))}
        <button className="back" onClick={onBack}>Back to website</button>
        <button className="back" onClick={onLogout}>Logout</button>
      </aside>
      <section className="dashboard-main">{children}</section>
    </div>
  );
}
