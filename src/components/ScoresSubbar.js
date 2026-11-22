"use client";

import SeasonStandings from "@/components/SeasonStandings";

// Season records for the active view, plus refresh controls.
export default function ScoresSubbar({ sports, responses, scores }) {
  return (
    <div className="scores-subbar">
      <SeasonStandings sports={sports} responses={responses} />
      <div className="page-sync-bar">
        <span className="scores-updated" role="status" aria-live="polite">
          {scores.pending ? "Updating…" : scores.lastUpdated
            ? `Updated ${scores.lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
            : ""}
        </span>
        <button className="score-refresh-button" type="button" onClick={scores.refreshNow} disabled={scores.pending}>
          Refresh
        </button>
      </div>
    </div>
  );
}