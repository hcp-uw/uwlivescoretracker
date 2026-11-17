// Score API response → display rows. Every sport's API shares the football
// response shape, so these helpers are used for all sports.
const STOPPED_STATUSES = ["STATUS_CANCELED", "STATUS_CANCELLED", "STATUS_POSTPONED"];

// "win" | "loss" | "tie" for a final with both scores; null otherwise.
function gameResult({ status, uwScore, opponentScore }) {
  if (status !== "final" || uwScore == null || opponentScore == null) return null;
  if (uwScore > opponentScore) return "win";
  if (uwScore < opponentScore) return "loss";
  return "tie";
}

function footballGames(response) {
  const games = [response?.game, response?.nextGame, ...(response?.previousGames || []),
    ...(response?.upcomingGames || [])].filter(Boolean);
  return games.filter((game, index) => games.findIndex((entry) => entry.eventId === game.eventId) === index)
    .map((game) => {
      const row = {
        id: game.eventId,
        season: game.season,
        opponent: game.opponent.name,
        kickoff: game.kickoff,
        startTimeTbd: game.startTimeTbd,
        homeAway: game.homeAway,
        status: game.completed ? "final" : game.state === "in" ? "live" : "upcoming",
        stopped: STOPPED_STATUSES.includes(game.status),
        statusDetail: game.statusDetail,
        uwScore: game.uwScore,
        opponentScore: game.opponentScore,
      };
      return { ...row, result: gameResult(row) };
    });
}

const byKickoff = (a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff);

// Rows for a sport page: live first, then the schedule soonest-first, then
// results newest-first.
function splitGames(rows) {
  return {
    live: rows.filter((row) => row.status === "live"),
    upcoming: rows.filter((row) => row.status === "upcoming").sort(byKickoff),
    results: rows.filter((row) => row.status === "final").sort((a, b) => byKickoff(b, a)),
  };
}

function seasonRecord(rows) {
  const record = { wins: 0, losses: 0, ties: 0 };
  for (const row of rows) {
    if (row.result === "win") record.wins += 1;
    if (row.result === "loss") record.losses += 1;
    if (row.result === "tie") record.ties += 1;
  }
  return record;
}

function formatRecord({ wins, losses, ties }) {
  return ties ? `${wins}–${losses}–${ties}` : `${wins}–${losses}`;
}

// Newest season first; each group keeps the input order (newest game first).
function resultsBySeason(results) {
  const seasons = new Map();
  for (const row of results) {
    if (!seasons.has(row.season)) seasons.set(row.season, []);
    seasons.get(row.season).push(row);
  }
  return [...seasons].sort(([a], [b]) => b - a)
    .map(([season, games]) => ({ season, games, record: seasonRecord(games) }));
}

// The Today page across sports: every live game, each sport's next playable
// game (postponed/canceled ones skipped), and the most recent finals.
function todaySummary(sports, responses, recentLimit = 6) {
  const live = [];
  const upNext = [];
  const recent = [];
  for (const sport of sports) {
    const { live: sportLive, upcoming, results } = splitGames(footballGames(responses[sport.id]));
    const tag = (row) => ({ ...row, sport });
    live.push(...sportLive.map(tag));
    const next = upcoming.find((row) => !row.stopped);
    if (next) upNext.push(tag(next));
    recent.push(...results.map(tag));
  }
  return {
    live,
    upNext: upNext.sort(byKickoff),
    recent: recent.sort((a, b) => byKickoff(b, a)).slice(0, recentLimit),
  };
}

function scoreRefreshInterval(response, now = Date.now()) {
  if (response?.game?.state === "in") return 15_000;
  const next = response?.nextGame;
  if (next && !next.startTimeTbd && !STOPPED_STATUSES.includes(next.status) &&
      Date.parse(next.kickoff) - 15 * 60_000 <= now) return 15_000;
  return 60_000;
}

export {
  footballGames, gameResult, splitGames, seasonRecord, formatRecord, resultsBySeason,
  todaySummary, scoreRefreshInterval,
};
