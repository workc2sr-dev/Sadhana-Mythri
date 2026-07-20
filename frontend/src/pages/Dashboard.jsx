import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import PortalLayout from "../layouts/PortalLayout";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const [tab, setTab] = useState("Overview");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const planFromState = location.state?.plan;
  const planFromQuery = searchParams.get("plan");
  const planCatalog = {
    "starter-plan": { name: "Starter Plan", price: 999 },
    "growth-plan": { name: "Growth Plan", price: 1999 },
    "enterprise-plan": { name: "Enterprise Plan", price: 4999 },
  };
  const initials =
    user?.full_name
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SM";

  const plan =
    planFromState ||
    (planFromQuery ? planCatalog[planFromQuery] || null : null);

  const planPrice =
    typeof plan?.price === "number" ? plan.price : Number.parseInt("0", 10);

  return (
    <PortalLayout
      activeTab={tab}
      onTabChange={setTab}
      onBack={() => navigate("/")}
    >
      <div className="welcome">
        <div>
          <p className="eyebrow">WELCOME BACK</p>
          <h1>Manage your business presence.</h1>
        </div>
        <div className="avatar">{initials}</div>
      </div>

      {tab === "Overview" ? (
        <>
          <div className="status-card">
            <div>
              <p className="eyebrow">ACCOUNT STATUS</p>
              <h2>Complete verification to activate your address.</h2>
              <p>
                We need a few documents before your virtual office is ready to
                use.
              </p>
            </div>
            <button onClick={() => navigate("/verification")}>
              Start verification →
            </button>
          </div>

          <div className="dashboard-grid">
            <article>
              <p>SELECTED PLAN</p>
              <h3>{plan?.name || "No plan selected"}</h3>
              <span>
                {plan
                  ? `₹${planPrice.toLocaleString("en-IN")} / month`
                  : "Explore plans to get started"}
              </span>
            </article>
            <article>
              <p>VIRTUAL ADDRESS</p>
              <h3>Pending activation</h3>
              <span>Available after verification</span>
            </article>
            <article>
              <p>NEXT INVOICE</p>
              <h3>—</h3>
              <span>Subscribe to view billing</span>
            </article>
          </div>
        </>
      ) : (
        <div className="empty-panel">
          <p className="eyebrow">{tab.toUpperCase()}</p>
          <h2>{tab} management</h2>
          <p>
            This area is ready to connect to the API as you add your account and
            subscription data.
          </p>
        </div>
      )}
    </PortalLayout>
  );
}
