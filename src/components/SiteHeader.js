"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SportSearch from "@/components/SportSearch";

// Sport links live in SportNav below this bar.
const NAV_LINKS = [
  { href: "/login", label: "Sign in" },
];

// Top bar shown on every page. Scores are public, so sign-in is optional and
// kept on its own page.
export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/" aria-label="UW Score Tracker home">
          <span className="brand-mark" aria-hidden="true">W</span>
          <span className="brand-text">
            <span className="brand-name">UW Score Tracker</span>
            <span className="brand-tagline">University of Washington</span>
          </span>
        </Link>
        <div className="site-header-actions">
          <SportSearch />
          <nav className="site-nav" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="site-nav-link sign-in-link"
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}