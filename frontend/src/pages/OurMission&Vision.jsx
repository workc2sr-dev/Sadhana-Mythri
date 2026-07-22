import InfoPage from "../components/InfoPage";

export default function MissionVisionPage() {
  return (
    <InfoPage
      title="Our Mission & Vision"
      intro="We help businesses establish a credible, professional presence with reliable virtual office solutions."
      sections={[
        {
          heading: "Our Mission",
          body: [
            "To empower businesses with reliable virtual office solutions that simplify operations, build credibility, and enable sustainable growth.",
          ],
        },
        {
          heading: "Our Vision",
          body: [
            "To become the most trusted virtual office platform, helping businesses establish a professional presence from anywhere.",
          ],
        },
      ]}
    />
  );
}
