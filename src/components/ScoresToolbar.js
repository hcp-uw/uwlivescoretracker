// Page title, freshness line, refresh button and any feed problems, shared by
// the Today and sport pages. Notices name the sport so a single failing feed
// doesn't read as the whole site being down.
export default function ScoresToolbar({ title, subtitle, sports, scores }) {
  const { responses, errors, pending, lastUpdated, refreshNow } = scores;
  const notices = sports.flatMap((sport) => {
    const prefix = sports.length > 1 ? `${sport.name}: ` : "";
    if (errors[sport.id]) {
      return [`${prefix}${errors[sport.id]}${responses[sport.id] ? " Showing the last scores we received." : ""}`];
    }
    if (responses[sport.id]?.stale) return [`${prefix}The live feed is running behind. Scores may be a little out of date.`];
    return [];
  });

  return (
    <>
      <div className="scores-toolbar">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        <div className="scores-toolbar-actions">
          <span className="scores-updated" role="status" aria-live="polite">
            {pending ? "Updating…" : lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}` : ""}
          </span>
          <button className="score-refresh-button" type="button" onClick={refreshNow} disabled={pending}>
            Refresh
          </button>
        </div>
      </div>
      {notices.map((notice) => (
        <p key={notice} className="form-notice error">{notice}</p>
      ))}
    </>
  );
}
