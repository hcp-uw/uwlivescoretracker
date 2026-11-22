"use client";

import useScores from "@/utils/useScores";
import { footballGames, formatRecord, resultsBySeason, splitGames, todaySummary } from "@/utils/footballScores";
import { SCORED_SPORTS } from "@/utils/sports";
import ScoresSection from "@/components/ScoresSection";
import ScoresSubbar from "@/components/ScoresSubbar";
import ScoreApiLog from "@/components/ScoreApiLog";

const SPORT_IDS = SCORED_SPORTS.map((sport) => sport.id);

function metaBySport(responses) {
  const meta = {};
  for (const sport of SCORED_SPORTS) {
    const { results } = splitGames(footballGames(responses[sport.id]));
    const seasons = resultsBySeason(results);
    if (seasons[0]) {
      meta[sport.id] = { season: seasons[0].season, record: formatRecord(seasons[0].record) };
    }
  }
  return meta;
}

// Home page: answers "is UW playing right now, and how did we do?" across
// every sport, without making visitors pick one first.
export default function TodayDashboard() {
  const scores = useScores(SPORT_IDS);
  const { live, upNext, recent } = todaySummary(SCORED_SPORTS, scores.responses);
  const loading = scores.pending && Object.keys(scores.responses).length === 0;
  const meta = metaBySport(scores.responses);
  const liveNote = live.length === 1 ? "One game in progress"
    : live.length > 1 ? `${live.length} games in progress` : null;

  return (
    <main className="page page-today">
      <ScoresSubbar sports={SCORED_SPORTS} responses={scores.responses} scores={scores} />

      {live.length > 0 && (
        <ScoresSection
          title="Live now"
          games={live}
          showSport
          variant="live-hero"
          metaBySportId={meta}
          sectionNote={liveNote && <span className="scores-heading-note">{liveNote}</span>}
        />
      )}

      <ScoresSection
        title="Up next"
        games={upNext}
        showSport
        variant="up-next-grid"
        sectionNote={<span className="scores-heading-note">Times in PT</span>}
        emptyMessage={loading ? "Loading schedules…" : "No upcoming games are scheduled yet."}
      />

      <ScoresSection
        title="Recent results"
        games={recent}
        showSport
        variant="results-strip"
        emptyMessage={loading ? "Loading results…" : "No results yet."}
      />

      {process.env.NODE_ENV === "development" && <ScoreApiLog entries={scores.requestLog} />}
    </main>
  );
}