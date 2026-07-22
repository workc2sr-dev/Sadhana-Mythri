import InfoPage from "../components/InfoPage";

export default function RefundPage() {
  return (
    <InfoPage
      title="Refund Policy"
      intro={<strong><b>Fees paid for virtual office subscriptions and related services are generally <u>non-refundable</u> once the service has been activated or <u>provisioning has begun</u>.</b></strong>} 
      sections={[
        {
          heading: "Eligibility for Refund",
          body: [
            <ul><li>Refund eligibility may depend on the service stage, verification progress, and whether work has already been initiated.</li></ul>,
            <ul>
              <li>Refunds may be considered if: payment was made more than once due to a technical error, an incorrect amount was charged, Sadhana Mythri is unable to provide the purchased service due to reasons solely attributable to us, or required verification fails before service activation and the service cannot be provided.</li>
            </ul>,
            <ul><li>Any approved refund will be processed using the original payment method where possible.</li></ul>,
          ],
        },
        {
          heading: "Non-Refundable Situations",
          body: [
            <ul><li>Refunds will generally not be issued for: change of mind, partial use of subscription periods, failure to use the service, incorrect information provided by the customer, violation of our Terms and Conditions, or account suspension resulting from policy violations.</li></ul>,
          ],
        },
        {
          heading: "Refund Process",
          body: [
            <ul><li>Eligible refund requests should be submitted with payment details and the reason for the request. Additional documentation may be requested for verification.</li></ul>,
            <ul><li>Contact support with your order details, reason for the request, and any relevant account information. We review refund requests case by case and respond within a reasonable support window.</li></ul>,
          ],
        },
        {
          heading: "Processing Time",
          body: [
            <ul><li>Approved refunds will generally be processed within 7–14 business days through the original payment method, subject to banking and payment provider timelines.</li></ul>,
          ],
        },
        {
          heading: "Cancellation",
          body: [
            <ul><li>Customers may cancel future renewals at any time. Cancellation does not automatically entitle the customer to a refund for the current billing period unless otherwise stated.</li></ul>,
          ],
        },
        {
          heading: "Changes to This Policy",
          body: [
            <ul><li>We reserve the right to modify this Refund Policy at any time. Updated versions will be published on our website.</li></ul>,
          ],
        },
        {
          heading: "Contact",
          body: [
            <ul><li>For more inquiries, please contact our support team using the contact information available on our website.</li></ul>,
          ],
        }
      ]}
    />
  );
}
