import InfoPage from "../components/InfoPage";

// Static frequently asked questions page
export default function FaqPage() {
  return (
    <InfoPage
      title="Frequently Asked Questions"
      intro="A quick guide to the most common questions about virtual office setup, billing, and support."
      sections={[
        {
          heading: "What is Sadhana Mythri?",
          body: [
            "Sadhana Mythri is a virtual office platform that offers businesses a professional address and essential office services, eliminating the need for a physical workspace.",
          ],
        },
        {
          heading: "Getting started",
          body: [
            "You can begin by choosing a plan and submitting the required business details through the site or client portal.",
          ],
          list: [
            "Select a plan",
            "Create an account or log in",
            "Confirm the on-screen OTP",
            "Track your application in the dashboard",
          ],
        },
        {
          heading: "Billing and support",
          body: [
            "Invoices, renewal dates, and subscription status are available in the client portal once your account is active.",
            "Support requests can be submitted through the contact channels listed in the footer.",
          ],
        },
        
        {
          heading: "How do I get started?",
          body: [
            "Simply choose a suitable plan, create an account, confirm the on-screen OTP, and track your application from the dashboard.",
          ],
        },
        {
          heading: "Who can use Sadhana Mythri?",
          body: [
            "Our services are designed for startups, freelancers, entrepreneurs, small businesses, and companies looking for a professional business presence.",
          ],
        },
        /*{
          heading: "What is a virtual office?",
          body: [
            "A virtual office provides a registered business address and office-related services while allowing you to work from anywhere.",
          ],
        },*/
       /* {
          heading: "Can I use the virtual office address for business registration?",
          body: [
            "Yes. Eligible plans allow you to use the provided address for business registration, subject to applicable regulations and documentation requirements.",
          ],
        },*/
        {
          heading: "How does account confirmation work?",
          body: [
            "After signup or login, enter the OTP shown on screen. An SMS or email OTP provider can be connected later.",
          ],
        },
        {
          heading: "How long does activation take?",
          body: [
            "Applications are placed under review after you select a plan. Processing time depends on the plan and submitted business details.",
          ],
        },
        {
          heading: "Are the subscription plans flexible?",
          body: [
            "Yes. We offer multiple plans designed to suit different business needs, with varying features and durations.",
          ],
        },
        {
          heading: "Can I upgrade my plan later?",
          body: [
            "Yes. You can upgrade your subscription as your business requirements grow, subject to plan availability.",
          ],
        },
        {
          heading: "Are my documents and information secure?",
          body: [
            "Yes. We take appropriate measures to protect your personal and business information and handle it securely.",
          ],
        },
        {
          heading: "What payment methods are accepted?",
          body: [
            "We support secure online payment methods for subscription purchases. Either UPI or credit/debit cards are accepted.",
          ],
        },
        {
          heading: "Will I receive invoices for my payments?",
          body: [
            "Yes. GST-compliant invoices are generated for eligible subscriptions after successful payment.",
          ],
        },
        {
          heading: "Can I cancel my subscription?",
          body: [
            "Please refer to our cancellation policy for details. You can cancel your subscription through the client portal, subject to the terms and conditions of your plan.",
          ],
        },
        {
          heading: "Do you provide customer support?",
          body: [
            "Yes. Our support team is available 24/7 to assist you with onboarding, subscriptions, and general queries.",
          ],
        },
        
      ]}
    />
  );
}
