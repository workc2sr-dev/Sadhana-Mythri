import { useNavigate, useSearchParams } from "react-router-dom";
import InfoPage from "../components/InfoPage";

const documentationFile = "/documents/Sadhana%20Mythri%20Documentation.docx";

// Static platform documentation page with a download link
export default function DocumentationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan");

  return (
    <InfoPage
      title="Platform Documentation"
      intro="A practical guide to getting started with Sadhana Mythri and managing your virtual office services."
      sections={[
        {
          heading: "About Sadhana Mythri",
          body: [
            "Sadhana Mythri is a virtual office and co-working space platform that helps businesses establish a professional business presence.",
          ],
        },
        {
          heading: "Getting Started",
          body: ["Set up your service in five straightforward steps."],
          list: [
            "Create an account.",
            "Verify your information.",
            "Choose a subscription plan.",
            "Complete payment.",
            "Service activation.",
          ],
        },
        {
          heading: "Services & Account Management",
          body: [
            "Manage your profile, subscriptions, invoices, payment history, and business information through the dashboard.",
          ],
          list: [
            "Virtual Office Address",
            "Business Registration Support",
            "GST Registration Support",
            "Mail Handling",
            "Customer Support",
          ],
        },
        {
          heading: "Payments, Security & Support",
          body: [
            "Secure online payments are supported, with GST applied where required. Use a strong password and enable two-factor authentication whenever available.",
            "Contact the support team for billing, technical, and subscription-related assistance. Please also review the Terms & Conditions, Privacy Policy, and Refund Policy.",
          ],
        },
      ]}
      backLabel="Back to home"
      backTo="/"
    >
      <div className="page-actions" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button className="primary-btn" type="button" onClick={() => navigate(planId ? `/otp?plan=${planId}` : "/auth")}>
          Verify and continue
        </button>
        <a href={documentationFile} download>
          Download documentation
        </a>
      </div>
    </InfoPage>
  );
}
