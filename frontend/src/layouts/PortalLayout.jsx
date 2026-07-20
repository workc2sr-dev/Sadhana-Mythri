export default function PortalLayout({
  activeTab,
  onTabChange,
  onBack,
  children,
}) {
  const tabs = [
    "Overview",
    "Subscription",
    "Verification",
    "Invoices",
    "Account",
  ];

  return (
    <div className="dashboard">
      <aside>
        <button className="logo" onClick={onBack}>
          SADHANA <em>MYTHRI</em>
        </button>
        <div className="sidebar-label">CLIENT PORTAL</div>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
        <button className="back" onClick={onBack}>
          ← Back to website
        </button>
      </aside>
      <section className="dashboard-main">{children}</section>
    </div>
  );
}
