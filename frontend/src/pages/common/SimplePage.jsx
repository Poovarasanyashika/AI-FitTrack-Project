export default function SimplePage({
  eyebrow,
  title,
  description,
}) {
  return (
    <main className="page-container">
      <header className="page-title-row">
        <div>
          <div className="section-label">
            {eyebrow}
          </div>

          <h1>{title}</h1>

          <p>{description}</p>
        </div>
      </header>

      <section className="dashboard-panel empty-feature-panel">
        <strong>{title}</strong>

        <p>
          This AI FitTrack feature will be connected
          to its existing backend contract in the
          next implementation phase.
        </p>
      </section>
    </main>
  );
}
