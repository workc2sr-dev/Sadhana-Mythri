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
            <ul>
              <li>We may collect contact details, business information, portal activity, and any documents you submit for verification.</li>
              <li>We use this information to provide services, support your account, and meet legal or regulatory obligations.</li>
            </ul>,
          ],
        },
        {
          heading: "How information is used",
          body: [
            <ul>
              <li>Your data is used only to operate the service, communicate with you, and improve the experience.</li>
              <li>We do not sell personal data. Limited sharing may occur with trusted providers who help us run the service.</li>
            </ul>,
          ],
        },
        {
          heading: "Cookies",
          body: [
            <ul>
              <li>Our website may use cookies and similar technologies to improve user experience, remember preferences, and analyze website traffic.</li>
              <li>You may disable cookies through your browser settings; however, some features may not function properly.</li>
            </ul>,
          ],
        },
        {
          heading: "Information Sharing",
          body: [
            <ul>
              <li>We do not sell your personal information.</li>
              <li>We may share information with payment processors, government authorities where legally required, technology and hosting providers, professional advisors, and service partners assisting in service delivery.</li>
            </ul>,
          ],
        },
        {
          heading: "Data Security",
          body: [
            <ul>
              <li>We implement reasonable technical and organizational measures to safeguard your information. However, no internet transmission is completely secure.</li>
            </ul>,
          ],
        },
        {
          heading: "Data Retention",
          body: [
            <ul>
              <li>We retain personal information only for as long as necessary to provide services, comply with legal obligations, resolve disputes, and enforce agreements.</li>
            </ul>,
          ],
        },
        {
          heading: "Your Rights",
          body: [
            <ul>
              <li>Subject to applicable law, you may access your information, request corrections, request deletion where legally permissible, withdraw consent where applicable, and contact us regarding privacy concerns.</li>
            </ul>,
          ],
        },
        {
          heading: "Third-Party Websites",
          body: [
            <ul>
              <li>Our website may contain links to external websites. We are not responsible for their privacy practices.</li>
            </ul>,
          ],
        },
        {
          heading: "Children's Privacy",
          body: [
            <ul>
              <li>Our services are not intended for individuals under 18 years of age.</li>
            </ul>,
          ],
        },
        {
          heading: "Policy Updates",
          body: [
            <ul>
              <li>We may revise this Privacy Policy periodically. Updated versions will be posted on this page.</li>
            </ul>,
          ],
        },
        {
          heading: "Contact",
          body: [
            <ul>
              <li>For privacy-related questions or requests, please contact us using the details available on our website.</li>
            </ul>,
          ],
        },
      ]}
    />
  );
}
