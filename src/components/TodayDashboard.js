"use client";

import Link from "next/link";
import useScores from "@/utils/useScores";
import { todaySummary } from "@/utils/footballScores";
import { SCORED_SPORTS } from "@/utils/sports";
import ScoresSection from "@/components/ScoresSection";
import ScoresToolbar from "@/components/ScoresToolbar";
import ScoreApiLog from "@/components/ScoreApiLog";

const SPORT_IDS = SCORED_SPORTS.map((sport) => sport.id);

// Home page: answers "is UW playing right now, and how did we do?" across
// every sport, without making visitors pick one first.
export default function TodayDashboard() {
  const scores = useScores(SPORT_IDS);
  const { live, upNext, recent } = todaySummary(SCORED_SPORTS, scores.responses);
  const loading = scores.pending && Object.keys(scores.responses).length === 0;

  return (
    <main className="page">
      <ScoresToolbar title="Today" subtitle="Live games, what's next and recent results across UW sports."
        sports={SCORED_SPORTS} scores={scores} />

      {live.length > 0 && (
        <ScoresSection title="Live now" games={live} showSport>
          <span className="live-dot" aria-hidden="true" />
        </ScoresSection>
      )}

      <ScoresSection title="Up next" games={upNext} showSport
        emptyMessage={loading ? "Loading schedules…" : "No upcoming games are scheduled yet."} />

      <ScoresSection title="Recent results" games={recent} showSport
        emptyMessage={loading ? "Loading results…" : "No results yet."} />

      <nav className="sport-cards" aria-label="Full schedules and results">
        {SCORED_SPORTS.map((sport) => (
          <Link key={sport.id} className="sport-card" href={`/sports/${sport.id}`}>
            {sport.name} <span aria-hidden="true">→</span>
          </Link>
        ))}
      </nav>

      {process.env.NODE_ENV === "development" && <ScoreApiLog entries={scores.requestLog} />}
    </main>
  );
}
