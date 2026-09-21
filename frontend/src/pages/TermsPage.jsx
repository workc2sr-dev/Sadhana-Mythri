import InfoPage from "../components/InfoPage";

// Static terms and conditions information page
export default function TermsPage() {
  return (
    <InfoPage
      title="Terms & Conditions"
      intro="Below are the terms and conditions for using Sadhana Mythri's website and services."
      sections={[
        {
          heading: "Use of the service",
          body: [
            <ul>
              <li>By using the site, you agree to follow applicable laws and treat all submitted information as accurate and complete.</li>
              <li>Access to the client portal, address services, and billing tools may be limited until onboarding requirements are completed.</li>
            </ul>,
          ],
        },
        {
          heading: "Service availability",
          body: [
            <ul>
              <li>We may update, suspend, or discontinue specific features when needed for maintenance, compliance, or service improvements.</li>
              <li>Any changes to pricing, package contents, or support scope will be reflected on the website or in your customer communications.</li>
            </ul>,
          ],
        },
        {
          heading: "User eligibility",
          body: [
            <ul>
              <li>You must be at least 18 years of age and provide accurate and complete information during registration.</li>
              <li>Keep your account credentials confidential and use the services only for lawful business purposes.</li>
            </ul>,
          ],
        },
        {
          heading: "Account responsibility",
          body: [
            <ul>
              <li>You are responsible for all activities carried out using your account.</li>
              <li>Notify us immediately if you suspect unauthorized access to your account.</li>
            </ul>,
          ],
        },
        {
          heading: "Payments",
          body: [
            <ul>
              <li>Subscription fees must be paid in advance unless otherwise agreed.</li>
              <li>All applicable taxes, including GST, will be charged where required.</li>
              <li>Failure to make timely payments may result in suspension or termination of services.</li>
            </ul>,
          ],
        },
        {
          heading: "Intellectual property",
          body: [
            <ul>
              <li>All website content, branding, logos, designs, software, and materials are the property of Sadhana Mythri or its licensors.</li>
              <li>Content may not be copied, modified, or distributed without prior written permission.</li>
            </ul>,
          ],
        },
        {
          heading: "Limitation of liability",
          body: [
            <ul>
              <li>To the maximum extent permitted by law, Sadhana Mythri shall not be liable for indirect, incidental, consequential, or special damages.</li>
              <li>This includes damages arising from the use or inability to use our services.</li>
            </ul>,
          ],
        },
        {
          heading: "Suspension and termination",
          body: [
            <ul>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
              <li>This applies to accounts engaged in fraudulent activities or failing to comply with payment obligations.</li>
            </ul>,
          ],
        },
        {
          heading: "Third-party services",
          body: [
            <ul>
              <li>Our website may contain links or integrations with third-party services.</li>
              <li>We are not responsible for the content, policies, or practices of such services.</li>
            </ul>,
          ],
        },
        {
          heading: "Governing law",
          body: [
            <ul>
              <li>These Terms shall be governed by and interpreted in accordance with the laws of India.</li>
              <li>Any disputes shall be subject to the jurisdiction of the competent courts where Sadhana Mythri is registered or operates.</li>
            </ul>,
          ],
        },
      ]
      }
    />
  );
}
