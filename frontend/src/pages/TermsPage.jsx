import InfoPage from "../components/InfoPage";

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms & Conditions"
      intro="These terms outline how Sadhana Mythri's website and services may be used."
      sections={[
        {
          heading: "Use of the service",
          body: [
            "By using the site, you agree to follow applicable laws and treat all submitted information as accurate and complete.",
            "Access to the client portal, address services, and billing tools may be limited until onboarding requirements are completed.",
          ],
        },
        {
          heading: "Service availability",
          body: [
            "We may update, suspend, or discontinue specific features when needed for maintenance, compliance, or service improvements.",
            "Any changes to pricing, package contents, or support scope will be reflected on the website or in your customer communications.",
          ],
        },
      ]}
    />
  );
}
