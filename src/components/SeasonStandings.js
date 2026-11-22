"use client";

import { footballGames, formatRecord, resultsBySeason, splitGames } from "@/utils/footballScores";

function seasonRecordLabel(response) {
  const { results } = splitGames(footballGames(response));
  const seasons = resultsBySeason(results);
  if (!seasons[0]) return null;
  return formatRecord(seasons[0].record);
}

// Season W–L chips (not navigation — use SportNav for tabs).
export default function SeasonStandings({ sports, responses = {} }) {
  return (
    <div className="season-standings" aria-label="Season records">
      {sports.map((sport) => {
        const record = seasonRecordLabel(responses[sport.id]);
        return (
          <span key={sport.id} className="season-standing">
            <span className="season-standing-sport">{sport.name}</span>
            {record ? (
              <span className="season-standing-record">{record}</span>
            ) : (
              <span className="season-standing-record season-standing-record--pending">—</span>
            )}
          </span>
        );
      })}
    </div>
  );
}