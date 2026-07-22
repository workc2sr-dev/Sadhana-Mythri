import { useNavigate } from "react-router-dom";

export default function InfoPage({ title, intro, sections, children, backLabel = "Back to home", backTo = "/" }) {
  const navigate = useNavigate();

  return (
    <main className="landing">
      <section className="section-page">
        <div className="section-page-header">
          <div>
            <p className="hero-kicker">INFORMATION</p>
            <h1>{title}</h1>
            <p className="page-intro">{intro}</p>
          </div>
          <button className="secondary-btn" onClick={() => navigate(backTo)}>
            {backLabel}
          </button>
        </div>

        <div className="info-grid">
          {sections.map((section) => (
            <article key={section.heading} className="info-card">
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list?.length ? (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
        {children ? <div className="page-actions">{children}</div> : null}
      </section>
    </main>
  );
}
