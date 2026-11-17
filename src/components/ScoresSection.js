import Link from "next/link";

const RESULT_LABELS = { win: "Win", loss: "Loss", tie: "Tie" };

// The badge says the outcome in words as well as color, so a win or loss
// doesn't depend on telling green from red.
function statusBadge(game) {
  if (game.result) return { label: RESULT_LABELS[game.result], className: game.result };
  if (game.status === "final") return { label: "Final", className: "final" };
  if (game.status === "live") return { label: "Live", className: "live" };
  if (game.stopped) return { label: game.statusDetail || "Postponed", className: "stopped" };
  return { label: "Upcoming", className: "upcoming" };
}

function formatKickoff(game) {
  if (!game.kickoff) return null;
  return new Date(game.kickoff).toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric",
    ...(game.startTimeTbd ? {} : { hour: "numeric", minute: "2-digit" }),
  }) + (game.startTimeTbd ? " · Time TBD" : "");
}

// Rows use the shape produced by footballGames(). When `showSport` is set
// (the Today page mixes sports), rows carry `sport` and link to its page.
export default function ScoresSection({ title, games = [], emptyMessage, showSport = false, children }) {
  return (
    <section className="scores-section">
      <div className="scores-heading">
        <h2>{title}</h2>
        {children}
      </div>

      {games.length === 0 ? (
        <p className="scores-empty-text">{emptyMessage}</p>
      ) : (
        <ul className="scores-list">
          {games.map((game) => {
            const badge = statusBadge(game);
            // Live and in-game details ("2nd Quarter") are useful; "Final" and
            // "Scheduled" repeat the badge, so they're left out.
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
                <p className="score-value">
                  {game.status === "upcoming"
                    ? <span className="score-pending">—</span>
                    : <>
                        <span className="sr-only">UW </span>{game.uwScore ?? "—"}
                        <span className="score-dash"> – </span>
                        <span className="sr-only">opponent </span>{game.opponentScore ?? "—"}
                      </>}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
