"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SPORTS } from "@/utils/sports";

function sportHref(id) {
  return id === "football" ? "/sports/football" : `/sports/${id}`;
}

// Expandable search for jumping to scored sports and previewing upcoming ones.
export default function SportSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef(null);
  const rootRef = useRef(null);
  const listId = useId();

  const normalized = query.trim().toLowerCase();
  const results = normalized
    ? SPORTS.filter((sport) => sport.name.toLowerCase().includes(normalized))
    : [];

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(sport) {
    if (!sport.hasScores) return;
    router.push(sportHref(sport.id));
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className={`sport-search${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="sport-search-toggle"
        aria-label={open ? "Close sport search" : "Search sports"}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? (setOpen(false), setQuery("")) : setOpen(true))}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="sport-search-field">
        <input
          ref={inputRef}
          id={listId}
          className="sport-search-input"
          type="search"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-autocomplete="list"
          placeholder="Filter sports…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          tabIndex={open ? 0 : -1}
        />
        {open && results.length > 0 && (
          <ul className="sport-search-results" role="listbox">
            {results.map((sport) => (
              <li key={sport.id} role="option">
                <button
                  type="button"
                  className="sport-search-option"
                  disabled={!sport.hasScores}
                  onClick={() => choose(sport)}
                >
                  <span>{sport.name}</span>
                  {!sport.hasScores && <span className="sport-search-soon">Coming soon</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
        {open && normalized && results.length === 0 && (
          <p className="sport-search-empty">No sports match that filter.</p>
        )}
      </div>
    </div>
  );
}