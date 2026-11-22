const test = require("node:test");
const assert = require("node:assert/strict");

const helpers = import("../src/utils/footballScores.js");
const game = {
  eventId: "123", opponent: { name: "Penn State" }, homeAway: "away",
  state: "in", status: "STATUS_IN_PROGRESS", completed: false,
  kickoff: "2026-11-07T20:30:00Z", uwScore: 0, opponentScore: 7, statusDetail: "1st Quarter",
};

test("dashboard maps real API objects into score rows without losing zero scores", async () => {
  const { footballGames } = await helpers;
  const [row] = footballGames({ game });
  assert.equal(row.id, "123");
  assert.equal(row.opponent, "Penn State");
  assert.equal(row.homeAway, "away");
  assert.equal(row.status, "live");
  assert.equal(row.uwScore, 0);
  assert.equal(row.statusDetail, "1st Quarter");
});

test("dashboard shows latest final and upcoming game, deduplicating event IDs", async () => {
  const { footballGames } = await helpers;
  const final = { ...game, completed: true, state: "post" };
  const next = { ...game, eventId: "456", state: "pre", uwScore: null, opponentScore: null };
  assert.deepEqual(footballGames({ game: final, nextGame: next }).map((row) => row.status), ["final", "upcoming"]);
  assert.equal(footballGames({ game, nextGame: game }).length, 1);
  assert.deepEqual(footballGames(null), []);
});

test("dashboard includes previous football results without repeating the latest final", async () => {
  const { footballGames } = await helpers;
  const final = { ...game, completed: true, state: "post" };
  const older = { ...final, eventId: "older", uwScore: 21, opponentScore: 14 };
  const next = { ...game, eventId: "next", state: "pre" };
  const rows = footballGames({ game: final, nextGame: next, previousGames: [final, older] });
  assert.deepEqual(rows.map((row) => row.id), ["123", "next", "older"]);
  assert.equal(rows[2].uwScore, 21);
});

test("refresh is frequent during games and fifteen minutes before kickoff", async () => {
  const { scoreRefreshInterval } = await helpers;
  assert.equal(scoreRefreshInterval({ game }), 15_000);
  const next = { ...game, state: "pre" };
  assert.equal(scoreRefreshInterval({ nextGame: next }, Date.parse("2026-11-07T20:14Z")), 60_000);
  assert.equal(scoreRefreshInterval({ nextGame: next }, Date.parse("2026-11-07T20:15Z")), 15_000);
});

test("idle, TBD and stopped games use one-minute dashboard refresh", async () => {
  const { scoreRefreshInterval } = await helpers;
  for (const next of [
    { ...game, startTimeTbd: true },
    { ...game, status: "STATUS_POSTPONED" },
    { ...game, status: "STATUS_CANCELED" },
  ]) assert.equal(scoreRefreshInterval({ nextGame: next }, Date.parse("2026-11-07T21:00Z")), 60_000);
  assert.equal(scoreRefreshInterval(null), 60_000);
});

test("finals are marked win, loss or tie from UW's point of view", async () => {
  const { footballGames } = await helpers;
  const final = { ...game, completed: true, state: "post" };
  const rows = footballGames({ previousGames: [
    { ...final, eventId: "w", uwScore: 3, opponentScore: 0 },
    { ...final, eventId: "l", uwScore: 0, opponentScore: 3 },
    { ...final, eventId: "t", uwScore: 2, opponentScore: 2 },
    { ...final, eventId: "n", uwScore: null, opponentScore: null },
  ] });
  assert.deepEqual(rows.map((row) => row.result), ["win", "loss", "tie", null]);
  // A live game that UW leads is not yet a win.
  assert.equal(footballGames({ game: { ...game, uwScore: 14, opponentScore: 7 } })[0].result, null);
});

test("sport page splits live, schedule and results, grouping results by season", async () => {
  const { footballGames, splitGames, resultsBySeason, formatRecord } = await helpers;
  const final = { ...game, completed: true, state: "post" };
  const response = {
    game,
    upcomingGames: [
      { ...game, eventId: "later", state: "pre", kickoff: "2026-11-21T20:00:00Z" },
      { ...game, eventId: "sooner", state: "pre", kickoff: "2026-11-14T20:00:00Z" },
    ],
    previousGames: [
      { ...final, eventId: "a", season: 2026, kickoff: "2026-10-01T00:00:00Z", uwScore: 10, opponentScore: 3 },
      { ...final, eventId: "b", season: 2026, kickoff: "2026-10-08T00:00:00Z", uwScore: 3, opponentScore: 10 },
      { ...final, eventId: "c", season: 2025, kickoff: "2025-10-01T00:00:00Z", uwScore: 7, opponentScore: 0 },
    ],
  };
  const { live, upcoming, results } = splitGames(footballGames(response));
  assert.deepEqual(live.map((row) => row.id), ["123"]);
  assert.deepEqual(upcoming.map((row) => row.id), ["sooner", "later"]);
  assert.deepEqual(results.map((row) => row.id), ["b", "a", "c"]);
  const seasons = resultsBySeason(results);
  assert.deepEqual(seasons.map(({ season }) => season), [2026, 2025]);
  assert.equal(formatRecord(seasons[0].record), "1–1");
  assert.equal(formatRecord({ wins: 5, losses: 2, ties: 1 }), "5–2–1");
});

test("today summary merges sports and skips postponed games for up next", async () => {
  const { todaySummary } = await helpers;
  const football = { id: "football", name: "Football" };
  const baseball = { id: "baseball", name: "Baseball" };
  const final = { ...game, completed: true, state: "post", uwScore: 1, opponentScore: 0 };
  const summary = todaySummary([football, baseball], {
    football: {
      game,
      upcomingGames: [
        { ...game, eventId: "postponed", state: "pre", status: "STATUS_POSTPONED", kickoff: "2026-11-10T00:00:00Z" },
        { ...game, eventId: "fb-next", state: "pre", kickoff: "2026-11-20T00:00:00Z" },
      ],
      previousGames: [{ ...final, eventId: "fb-old", kickoff: "2026-10-01T00:00:00Z" }],
    },
    baseball: {
      upcomingGames: [{ ...game, eventId: "bb-next", state: "pre", kickoff: "2026-11-15T00:00:00Z" }],
      previousGames: [{ ...final, eventId: "bb-old", kickoff: "2026-10-05T00:00:00Z" }],
    },
  }, 1);
  assert.deepEqual(summary.live.map((row) => [row.sport.id, row.id]), [["football", "123"]]);
  assert.deepEqual(summary.upNext.map((row) => row.id), ["bb-next", "fb-next"]);
  assert.deepEqual(summary.recent.map((row) => row.id), ["bb-old"]);
  assert.deepEqual(todaySummary([football], {}), { live: [], upNext: [], recent: [] });
});

test("up next cards stop at three playable games", async () => {
  const { takeUpcomingCards } = await helpers;
  const rows = Array.from({ length: 8 }, (_, index) => ({
    id: String(index + 1),
    status: "upcoming",
    stopped: false,
    kickoff: `2026-12-${String(index + 1).padStart(2, "0")}T00:00:00Z`,
  }));
  rows.push({ id: "postponed", status: "upcoming", stopped: true, kickoff: "2026-12-20T00:00:00Z" });
  assert.deepEqual(takeUpcomingCards(rows).map((row) => row.id), ["1", "2", "3"]);
});
