import InfoPage from "../components/InfoPage";

// Static careers information page
export default function CareersPage() {
  return (
    <InfoPage
      title="Careers"
      intro="We're building a focused team around support, operations, and service delivery."
      sections={[
        {
          heading: "Open roles",
          body: [
            "We welcome interest from people who are strong in customer support, operations coordination, document handling, or digital product work.",
            "If there are no open roles listed yet, you're still welcome to introduce yourself and share your background.",
          ],
          list: [
            "Customer Support Associate",
            "Operations Coordinator",
            "Business Services Specialist",
          ],
        },
        {
          heading: "How to apply",
          body: [
            "Send your resume, a short introduction, and the role you are most interested in.",
            "We review applications manually and reach out when there is a fit.",
          ],
        },
      ]}
    />
  );
}
