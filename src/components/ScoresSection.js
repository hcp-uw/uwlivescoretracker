import Link from "next/link";
import { takeUpcomingCards } from "@/utils/footballScores";

const RESULT_LABELS = { win: "Win", loss: "Loss", tie: "Tie" };

function statusBadge(game) {
  if (game.result) return { label: RESULT_LABELS[game.result], className: game.result };
  if (game.status === "final") return { label: "Final", className: "final" };
  if (game.status === "live") return { label: "Live", className: "live" };
  if (game.stopped) return { label: game.statusDetail || "Postponed", className: "stopped" };
  return { label: "Upcoming", className: "upcoming" };
}

function formatKickoffPT(game) {
  if (!game.kickoff) return null;
  const d = new Date(game.kickoff);
  const date = d.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  if (game.startTimeTbd) return `${date} · Time TBD`;
  const time = `${d.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })} PT`;
  return `${date} ${time}`;
}

function formatKickoff(game) {
  if (!game.kickoff) return null;
  return new Date(game.kickoff).toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric",
    ...(game.startTimeTbd ? {} : { hour: "numeric", minute: "2-digit" }),
  }) + (game.startTimeTbd ? " · Time TBD" : "");
}

function shortOpponent(name = "") {
  const words = name.trim().split(/\s+/);
  if (words.length <= 2) return name.toUpperCase();
  return words.slice(0, -1).join(" ").toUpperCase();
}

function sportLabel(game, showSport) {
  if (!showSport || !game.sport) return null;
  return (game.sport.shortName || game.sport.name).toUpperCase();
}

function seasonLine(game, metaBySportId) {
  const meta = game.sport && metaBySportId?.[game.sport.id];
  if (!meta?.record) return game.season ? `${game.season} season` : null;
  return `${meta.season ?? game.season} season · ${meta.record}`;
}

function FinalScore({ game, className = "match-score" }) {
  const win = game.result === "win";
  const loss = game.result === "loss";
  return (
    <p className={`${className} ${game.result ?? ""}`}>
      <span className={`match-score-side match-score-uw${win ? " match-score-uw--win" : ""}${loss ? " match-score-uw--loss" : ""}`}>
        <span className="sr-only">UW </span>
        {game.uwScore ?? "—"}
      </span>
      <span className="match-score-dash" aria-hidden="true">–</span>
      <span className="match-score-side match-score-opp">
        <span className="sr-only">Opponent </span>
        {game.opponentScore ?? "—"}
      </span>
    </p>
  );
}

function LiveHeroCard({ game, showSport, metaBySportId }) {
  const sport = sportLabel(game, showSport);
  const season = seasonLine(game, metaBySportId);
  const clock = game.statusDetail || "";
  return (
    <article className="live-hero-card">
      <div className="live-hero-top">
        <div className="live-hero-tags">
          {sport && <span className="sport-badge">{sport}</span>}
          {season && <span className="live-hero-season">{season}</span>}
        </div>
        <div className="live-hero-status">
          <span className="live-pill">
            <span className="live-dot" aria-hidden="true" />
            Live
          </span>
          {clock && <span className="live-hero-clock">{clock}</span>}
        </div>
      </div>
      <div className="live-hero-matchup">
        <div className="live-hero-team">
          <span className="live-hero-team-name uw">Washington</span>
          <span className="live-hero-team-meta">Huskies · {game.homeAway === "away" ? "Away" : "Home"}</span>
        </div>
        <div className="live-hero-score" aria-label={`Washington ${game.uwScore ?? "unknown"}, opponent ${game.opponentScore ?? "unknown"}`}>
          <span className="live-hero-score-uw">{game.uwScore ?? "—"}</span>
          <span className="live-hero-score-sep">–</span>
          <span className="live-hero-score-opp">{game.opponentScore ?? "—"}</span>
        </div>
        <div className="live-hero-team away">
          <span className="live-hero-team-name">{shortOpponent(game.opponent)}</span>
          <span className="live-hero-team-meta">{game.opponent.split(/\s+/).pop()} · {game.homeAway === "away" ? "Home" : "Away"}</span>
        </div>
      </div>
    </article>
  );
}

function UpNextCard({ game, showSport }) {
  const sport = sportLabel(game, showSport);
  const venue = game.homeAway === "away" ? "Away" : "Home";
  const prep = game.homeAway === "away" ? "At" : "Vs";
  return (
    <article className="up-next-card">
      <div className="up-next-card-top">
        {sport && <span className="sport-badge">{sport}</span>}
        <span className="up-next-venue">{venue}</span>
      </div>
      <p className="up-next-opponent">
        <span className="up-next-prep">{prep}</span> {shortOpponent(game.opponent)}
      </p>
      <p className="up-next-time">{formatKickoffPT(game)}</p>
    </article>
  );
}

function ResultStrip({ game, showSport }) {
  const badge = statusBadge(game);
  const resultLetter = game.result === "win" ? "W" : game.result === "loss" ? "L" : badge.label.charAt(0);
  const sport = sportLabel(game, showSport);
  const prep = game.homeAway === "away" ? "At" : "Vs";
  return (
    <li className={`result-strip ${game.result ?? game.status}`}>
      <span className={`result-letter ${badge.className}`}>{resultLetter}</span>
      <div className="result-strip-main">
        {sport && (
          <Link className="result-strip-sport" href={`/sports/${game.sport.id}`}>
            {game.sport.shortName || game.sport.name}
          </Link>
        )}
        <p className="result-strip-opponent">
          <span className="score-home-away">{prep}</span> {shortOpponent(game.opponent)}
        </p>
      </div>
      <FinalScore game={game} className="result-strip-score match-score" />
    </li>
  );
}

// Rows use the shape produced by footballGames(). `variant` switches between the
// compact lists on sport pages and the mock's hero cards on Today.
export default function ScoresSection({
  title,
  games = [],
  emptyMessage,
  showSport = false,
  children,
  variant = "list",
  metaBySportId = {},
  sectionNote,
}) {
  const headingNote = sectionNote ?? children;
  const cardGames = variant === "up-next-grid" ? takeUpcomingCards(games) : games;

  return (
    <section className={`scores-section scores-section--${variant}`}>
      <div className="scores-heading">
        <h2>{title}</h2>
        {headingNote}
      </div>

      {cardGames.length === 0 ? (
        <p className="scores-empty-text">{emptyMessage}</p>
      ) : variant === "live-hero" ? (
        <div className="live-hero-list">
          {games.map((game) => (
            <LiveHeroCard
              key={`${game.sport?.id ?? ""}-${game.id}`}
              game={game}
              showSport={showSport}
              metaBySportId={metaBySportId}
            />
          ))}
        </div>
      ) : variant === "up-next-grid" ? (
        <div className="up-next-grid">
          {cardGames.map((game) => (
            <UpNextCard key={`${game.sport?.id ?? ""}-${game.id}`} game={game} showSport={showSport} />
          ))}
        </div>
      ) : variant === "results-strip" ? (
        <ul className="results-strip-list">
          {games.map((game) => (
            <ResultStrip key={`${game.sport?.id ?? ""}-${game.id}`} game={game} showSport={showSport} />
          ))}
        </ul>
      ) : (
        <ul className="scores-list">
          {games.map((game) => {
            const badge = statusBadge(game);
            const showDetail = game.status === "live" || (game.statusDetail && !game.stopped &&
              !/^(final|scheduled)$/i.test(game.statusDetail));
            return (
              <li key={`${game.sport?.id ?? ""}-${game.id}`} className={`score-row ${game.result ?? game.status}`}>
                <div className="score-main">
                  {showSport && game.sport && (
                    <Link className="score-sport" href={`/sports/${game.sport.id}`}>
                      {game.sport.shortName || game.sport.name}
                    </Link>
                  )}
                  <p className="score-opponent">
                    <span className="score-home-away">{game.homeAway === "away" ? "at" : "vs"}</span> {game.opponent}
                  </p>
                  <p className="score-date">
                    {formatKickoff(game)}
                    {showDetail && game.statusDetail && ` · ${game.statusDetail}`}
                  </p>
                </div>
                <span className={`score-status ${badge.className}`}>{badge.label}</span>
                {game.status === "upcoming" ? (
                  <p className="score-value"><span className="score-pending">—</span></p>
                ) : (
                  <FinalScore game={game} className="score-value match-score" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}