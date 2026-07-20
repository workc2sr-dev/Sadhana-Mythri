import InfoPage from "../components/InfoPage";

export default function RefundPage() {
  return (
    <InfoPage
      title="Refund Policy"
      intro="This policy explains how cancellations and refund requests are handled."
      sections={[
        {
          heading: "Eligibility",
          body: [
            "Refund eligibility may depend on the service stage, verification progress, and whether work has already been initiated.",
            "Any approved refund will be processed using the original payment method where possible.",
          ],
        },
        {
          heading: "How to request a refund",
          body: [
            "Contact support with your order details, reason for the request, and any relevant account information.",
            "We review refund requests case by case and respond within a reasonable support window.",
          ],
        },
      ]}
    />
  );
}
