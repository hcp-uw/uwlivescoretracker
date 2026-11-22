"use client";

import useScores from "@/utils/useScores";
import { footballGames, formatRecord, resultsBySeason, splitGames, takeUpcomingCards } from "@/utils/footballScores";
import ScoresSection from "@/components/ScoresSection";
import ScoresSubbar from "@/components/ScoresSubbar";
import ScoreApiLog from "@/components/ScoreApiLog";
// One sport's page: live game, full upcoming schedule, then results grouped by
// season with that season's record.
export default function SportScores({ sport }) {
  const scores = useScores([sport.id]);
  const response = scores.responses[sport.id];
  const tag = (row) => ({ ...row, sport });
  const { live, upcoming, results } = splitGames(footballGames(response));
  const liveGames = live.map(tag);
  const upcomingGames = takeUpcomingCards(upcoming).map(tag);
  const seasons = resultsBySeason(results);
  const loading = scores.pending && !response;
  const meta = {};
  if (seasons[0]) {
    meta[sport.id] = { season: seasons[0].season, record: formatRecord(seasons[0].record) };
  }

  return (
    <main className="page">
      <ScoresSubbar sports={[sport]} responses={scores.responses} scores={scores} />

      {liveGames.length > 0 && (
        <ScoresSection
          title="Live now"
          games={liveGames}
          showSport
          variant="live-hero"
          metaBySportId={meta}
          sectionNote={<span className="scores-heading-note">One game in progress</span>}
        />
      )}

      <ScoresSection
        title="Up next"
        games={upcomingGames}
        showSport
        variant="up-next-grid"
        sectionNote={<span className="scores-heading-note">Times in PT</span>}
        emptyMessage={loading ? "Loading schedule…" : "No upcoming games are scheduled yet."}
      />

      {seasons.length === 0 ? (
        <ScoresSection title="Recent results" variant="results-strip"
          emptyMessage={loading ? "Loading results…" : "No results yet."} />
      ) : seasons.map(({ season, games, record }) => (
        <ScoresSection key={season} title={`${season} results`} games={games.map(tag)} showSport variant="results-strip">
          <span className="season-record">{formatRecord(record)}</span>
        </ScoresSection>
      ))}

      {process.env.NODE_ENV === "development" && <ScoreApiLog entries={scores.requestLog} />}
    </main>
  );
}