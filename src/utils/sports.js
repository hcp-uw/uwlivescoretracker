// UW's NCAA Division I programs. `id` is a stable key used in URLs
// (/sports/<id>) and by the score API. `hasScores` marks sports with a
// collector; only those get navigation links and pages, so visitors never land
// on an empty sport. Set it when a sport's collector and API route ship.
const SPORTS = [
  { id: "football", name: "Football", hasScores: true },
  { id: "mens-basketball", name: "Men's Basketball", shortName: "Men's Hoops", hasScores: true },
  { id: "womens-basketball", name: "Women's Basketball", shortName: "Women's Hoops", hasScores: true },
  { id: "volleyball", name: "Volleyball" },
  { id: "baseball", name: "Baseball", hasScores: true },
  { id: "softball", name: "Softball" },
  { id: "mens-soccer", name: "Men's Soccer" },
  { id: "womens-soccer", name: "Women's Soccer" },
  { id: "gymnastics", name: "Gymnastics" },
  { id: "beach-volleyball", name: "Beach Volleyball" },
  { id: "mens-rowing", name: "Men's Rowing" },
  { id: "womens-rowing", name: "Women's Rowing" },
  { id: "mens-golf", name: "Men's Golf" },
  { id: "womens-golf", name: "Women's Golf" },
  { id: "mens-tennis", name: "Men's Tennis" },
  { id: "womens-tennis", name: "Women's Tennis" },
  { id: "mens-cross-country", name: "Men's Cross Country" },
  { id: "womens-cross-country", name: "Women's Cross Country" },
  { id: "mens-track-and-field", name: "Men's Track & Field" },
  { id: "womens-track-and-field", name: "Women's Track & Field" },
];

const SCORED_SPORTS = SPORTS.filter((sport) => sport.hasScores);

function findScoredSport(id) {
  return SCORED_SPORTS.find((sport) => sport.id === id) || null;
}

export { SPORTS, SCORED_SPORTS, findScoredSport };
