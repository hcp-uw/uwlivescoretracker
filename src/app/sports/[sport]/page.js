import { notFound } from "next/navigation";
import SportScores from "@/components/SportScores";
import { SCORED_SPORTS, findScoredSport } from "@/utils/sports";

// The sport list is fixed, so each sport page is prerendered at build time.
// Scores themselves load in the browser.
export function generateStaticParams() {
  return SCORED_SPORTS.map((sport) => ({ sport: sport.id }));
}

export async function generateMetadata({ params }) {
  const { sport: id } = await params;
  const sport = findScoredSport(id);
  return { title: sport ? `${sport.name} · UW Score Tracker` : "UW Score Tracker" };
}

// Only sports with a score collector have pages; anything else is a 404.
export default async function SportPage({ params }) {
  const { sport: id } = await params;
  const sport = findScoredSport(id);
  if (!sport) notFound();
  return <SportScores sport={sport} />;
}
