import InfoPage from "../components/InfoPage";

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      intro="This policy explains how we handle account details, documents, and site activity."
      sections={[
        {
          heading: "Information we collect",
          body: [
            "We may collect contact details, business information, portal activity, and any documents you submit for verification.",
            "We use this information to provide services, support your account, and meet legal or regulatory obligations.",
          ],
        },
        {
          heading: "How information is used",
          body: [
            "Your data is used only to operate the service, communicate with you, and improve the experience.",
            "We do not sell personal data. Limited sharing may occur with trusted providers who help us run the service.",
          ],
        },
      ]}
    />
  );
}
