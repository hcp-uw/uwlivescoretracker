"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SCORED_SPORTS } from "@/utils/sports";

const LINKS = [
  { href: "/", label: "Today" },
  ...SCORED_SPORTS.map((sport) => ({ href: `/sports/${sport.id}`, label: sport.name })),
];

// Secondary navigation under the site header. Lists only sports that have
// scores; it scrolls sideways on narrow screens rather than wrapping.
export default function SportNav() {
  const pathname = usePathname();
  return (
    <nav className="sport-nav" aria-label="Sports">
      <div className="sport-nav-inner">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="sport-nav-link"
            aria-current={pathname === link.href ? "page" : undefined}>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
