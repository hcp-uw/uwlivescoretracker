"use client";

import useScores from "@/utils/useScores";
import { footballGames, formatRecord, resultsBySeason, splitGames } from "@/utils/footballScores";
import ScoresSection from "@/components/ScoresSection";
import ScoresToolbar from "@/components/ScoresToolbar";
import ScoreApiLog from "@/components/ScoreApiLog";

// One sport's page: live game, full upcoming schedule, then results grouped by
// season with that season's record.
export default function SportScores({ sport }) {
  const scores = useScores([sport.id]);
  const response = scores.responses[sport.id];
  const { live, upcoming, results } = splitGames(footballGames(response));
  const seasons = resultsBySeason(results);
  const loading = scores.pending && !response;
  const currentRecord = seasons[0] && formatRecord(seasons[0].record);

  return (
    <main className="page">
      <ScoresToolbar title={sport.name} sports={[sport]} scores={scores}
        subtitle={currentRecord ? `${seasons[0].season} season · ${currentRecord}` : null} />

      {live.length > 0 && (
        <ScoresSection title="Live now" games={live}>
          <span className="live-dot" aria-hidden="true" />
        </ScoresSection>
      )}

      <ScoresSection title="Upcoming" games={upcoming}
        emptyMessage={loading ? "Loading schedule…" : "No upcoming games are scheduled yet."} />

      {seasons.length === 0 ? (
        <ScoresSection title="Results" emptyMessage={loading ? "Loading results…" : "No results yet."} />
      ) : seasons.map(({ season, games, record }) => (
        <ScoresSection key={season} title={`${season} results`} games={games}>
          <span className="season-record">{formatRecord(record)}</span>
        </ScoresSection>
      ))}

      {process.env.NODE_ENV === "development" && <ScoreApiLog entries={scores.requestLog} />}
    </main>
  );
}
