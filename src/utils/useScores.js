"use client";

import { useEffect, useState } from "react";
import { getScore } from "@/api/ScoreAPI";
import { scoreRefreshInterval } from "@/utils/footballScores";

// Polls the score API for each sport id. Each sport refreshes on its own
// schedule: every 15s while a game is live or about to start, otherwise every
// minute. A failed refresh keeps the last good response so the page never
// blanks out mid-game.
export default function useScores(sportIds) {
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [requestLog, setRequestLog] = useState([]);
  const [refreshIndex, setRefreshIndex] = useState(0);
  // A string key keeps the effect from restarting when callers pass a new
  // array with the same sports.
  const sportKey = sportIds.join(",");

  useEffect(() => {
    const ids = sportKey.split(",");
    const controller = new AbortController();
    const timers = {};
    let firstRoundRemaining = ids.length;

    async function refresh(sport) {
      let interval = 60_000;
      try {
        const response = await getScore({
          sport,
          signal: controller.signal,
          onDebug: (entry) => {
            if (!controller.signal.aborted) setRequestLog((previous) => [entry, ...previous].slice(0, 10));
          },
        });
        if (controller.signal.aborted) return;
        setResponses((previous) => ({ ...previous, [sport]: response }));
        setErrors((previous) => ({ ...previous, [sport]: null }));
        setLastUpdated(new Date());
        interval = scoreRefreshInterval(response);
      } catch (error) {
        if (controller.signal.aborted) return;
        setErrors((previous) => ({
          ...previous,
          [sport]: error.response?.data?.error?.reason || "Unable to reach the score service.",
        }));
      }
      firstRoundRemaining -= 1;
      if (firstRoundRemaining === 0) setPending(false);
      timers[sport] = setTimeout(() => refresh(sport), interval);
    }

    ids.forEach(refresh);
    return () => {
      controller.abort();
      Object.values(timers).forEach(clearTimeout);
    };
  }, [sportKey, refreshIndex]);

  function refreshNow() {
    setPending(true);
    setRefreshIndex((index) => index + 1);
  }

  return { responses, errors, pending, lastUpdated, requestLog, refreshNow };
}
