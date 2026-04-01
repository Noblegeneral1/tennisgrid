// Grid Generation Logic
// Generates a daily grid seeded by the current date

// Simple seeded random number generator (mulberry32)
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Convert date string to numeric seed
function dateToSeed(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Shuffle array using seeded random
function seededShuffle(arr, rng) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// All category IDs available for row/column headers
const ALL_CANDIDATE_IDS = [
  // Countries
  "usa", "spain", "france", "germany", "australia", "argentina",
  "sweden", "uk", "russia", "italy", "czech", "croatia", "switzerland",
  "serbia", "chile", "netherlands", "canada", "austria", "brazil",
  "belgium", "south_africa", "japan", "romania", "poland",
  // Regional
  "south_american", "european", "non_european",
  // Eras
  "era_1970", "era_1980", "era_1990", "era_2000", "era_2010", "era_2020",
  // Grand Slams
  "ao_champ", "rg_champ", "w_champ", "uso_champ",
  "gs_champ", "multi_gs", "no_gs",
  // Achievements
  "year_end_no1", "olympic_gold", "davis_cup", "atp_finals",
  "peaked_no1", "peaked_top3", "peaked_top5", "peaked_top10", "peaked_top20",
  // Stats
  "no_titles", "titles_20plus", "titles_10plus", "titles_5plus",
  "wins_500plus", "wins_300plus",
  "prize_10m", "prize_5m", "prize_1m",
  "first_serve_80", "left_handed",
  "active", "retired",
  // Fun
  "one_slam_wonder", "clay_specialist", "grass_specialist",
  "never_top10", "never_top20", "peaked_outside50"
];

// Pairs of categories that conflict / are contradictory / too overlapping
// If one is picked, the other cannot appear in the same grid
const CONFLICTS = [
  // Regional vs specific countries it contains
  ["european", "spain"], ["european", "france"], ["european", "germany"],
  ["european", "italy"], ["european", "uk"], ["european", "sweden"],
  ["european", "serbia"], ["european", "croatia"], ["european", "czech"],
  ["european", "switzerland"], ["european", "austria"], ["european", "netherlands"],
  ["european", "belgium"], ["european", "romania"], ["european", "poland"],
  ["european", "russia"],
  ["non_european", "usa"], ["non_european", "australia"], ["non_european", "argentina"],
  ["non_european", "chile"], ["non_european", "brazil"], ["non_european", "japan"],
  ["non_european", "south_africa"], ["non_european", "canada"],
  // Non-european conflicts with european countries (impossible intersection)
  ["non_european", "spain"], ["non_european", "france"], ["non_european", "germany"],
  ["non_european", "italy"], ["non_european", "uk"], ["non_european", "sweden"],
  ["non_european", "serbia"], ["non_european", "croatia"], ["non_european", "czech"],
  ["non_european", "switzerland"], ["non_european", "austria"], ["non_european", "netherlands"],
  ["non_european", "belgium"], ["non_european", "romania"], ["non_european", "poland"],
  ["non_european", "russia"],
  // European conflicts with non-european countries (impossible intersection)
  ["european", "usa"], ["european", "australia"], ["european", "argentina"],
  ["european", "chile"], ["european", "brazil"], ["european", "japan"],
  ["european", "south_africa"], ["european", "canada"],
  // South American vs non-SA countries
  ["south_american", "usa"], ["south_american", "spain"], ["south_american", "france"],
  ["south_american", "germany"], ["south_american", "australia"], ["south_american", "uk"],
  ["south_american", "russia"], ["south_american", "italy"], ["south_american", "serbia"],
  ["south_american", "czech"], ["south_american", "croatia"], ["south_american", "switzerland"],
  ["south_american", "sweden"], ["south_american", "japan"], ["south_american", "canada"],
  ["south_american", "south_africa"], ["south_american", "netherlands"],
  ["south_american", "belgium"], ["south_american", "romania"], ["south_american", "poland"],
  ["south_american", "austria"],
  // Direct contradictions
  ["european", "non_european"], ["european", "south_american"],
  ["active", "retired"],
  ["left_handed", "right_handed"],
  ["gs_champ", "no_gs"], ["multi_gs", "no_gs"],
  ["multi_gs", "one_slam_wonder"],
  ["no_titles", "titles_5plus"], ["no_titles", "titles_10plus"], ["no_titles", "titles_20plus"],
  ["titles_5plus", "titles_10plus"], ["titles_10plus", "titles_20plus"], ["titles_5plus", "titles_20plus"],
  ["wins_300plus", "wins_500plus"],
  ["prize_1m", "prize_5m"], ["prize_5m", "prize_10m"], ["prize_1m", "prize_10m"],
  ["peaked_no1", "peaked_top3"], ["peaked_no1", "peaked_top5"], ["peaked_no1", "peaked_top10"], ["peaked_no1", "peaked_top20"],
  ["peaked_top3", "peaked_top5"], ["peaked_top3", "peaked_top10"], ["peaked_top3", "peaked_top20"],
  ["peaked_top5", "peaked_top10"], ["peaked_top5", "peaked_top20"],
  ["peaked_top10", "peaked_top20"],
  ["never_top10", "peaked_top10"], ["never_top10", "peaked_top5"], ["never_top10", "peaked_top3"], ["never_top10", "peaked_no1"],
  ["never_top10", "year_end_no1"],
  ["never_top20", "peaked_top20"], ["never_top20", "peaked_top10"], ["never_top20", "peaked_top5"], ["never_top20", "peaked_top3"], ["never_top20", "peaked_no1"],
  ["never_top20", "never_top10"],
  ["peaked_outside50", "peaked_top20"], ["peaked_outside50", "peaked_top10"], ["peaked_outside50", "peaked_top5"], ["peaked_outside50", "peaked_top3"], ["peaked_outside50", "peaked_no1"],
  ["peaked_outside50", "year_end_no1"],
  // Overlapping slams
  ["ao_champ", "gs_champ"], ["rg_champ", "gs_champ"], ["w_champ", "gs_champ"], ["uso_champ", "gs_champ"],
  ["clay_specialist", "ao_champ"], ["clay_specialist", "w_champ"], ["clay_specialist", "uso_champ"],
  ["grass_specialist", "ao_champ"], ["grass_specialist", "rg_champ"], ["grass_specialist", "uso_champ"],
  // year_end_no1 is subset of peaked_no1
  ["year_end_no1", "peaked_no1"],

  // ===== BORING / OBVIOUS COMBOS =====
  // Old eras + retired is trivially obvious (everyone from 1970s/80s/90s is retired)
  ["era_1960", "retired"], ["era_1970", "retired"], ["era_1980", "retired"], ["era_1990", "retired"],
  // Old eras + active is almost always impossible or trivially 1-2 people
  ["era_1960", "active"], ["era_1970", "active"], ["era_1980", "active"],
  // New era + retired is boring the other way
  ["era_2020", "retired"],
  // Two eras next to each other is boring (most players span adjacent decades)
  ["era_1960", "era_1970"], ["era_1970", "era_1980"], ["era_1980", "era_1990"],
  ["era_1990", "era_2000"], ["era_2000", "era_2010"], ["era_2010", "era_2020"],
  // No titles + high achievement is near-impossible and not fun
  ["no_titles", "gs_champ"], ["no_titles", "multi_gs"], ["no_titles", "one_slam_wonder"],
  ["no_titles", "year_end_no1"], ["no_titles", "atp_finals"], ["no_titles", "peaked_no1"],
  ["no_titles", "wins_500plus"], ["no_titles", "titles_20plus"], ["no_titles", "titles_10plus"],
  ["no_titles", "prize_10m"],
  // Big achievements + "never top X" is contradictory or trivially boring
  ["never_top10", "gs_champ"], ["never_top10", "multi_gs"], ["never_top10", "atp_finals"],
  ["never_top10", "titles_20plus"], ["never_top10", "wins_500plus"], ["never_top10", "prize_10m"],
  ["never_top10", "olympic_gold"],
  ["never_top20", "gs_champ"], ["never_top20", "multi_gs"], ["never_top20", "atp_finals"],
  ["never_top20", "titles_10plus"], ["never_top20", "wins_300plus"],
  ["peaked_outside50", "gs_champ"], ["peaked_outside50", "multi_gs"],
  ["peaked_outside50", "titles_5plus"], ["peaked_outside50", "davis_cup"],
  ["peaked_outside50", "atp_finals"], ["peaked_outside50", "olympic_gold"],
  // Right-handed is ~85% of players, boring with almost anything
  ["right_handed", "retired"], ["right_handed", "active"],
  ["right_handed", "european"], ["right_handed", "non_european"],
  // "No slams" with low-achievement categories is too easy
  ["no_gs", "no_titles"], ["no_gs", "never_top10"], ["no_gs", "never_top20"],
  ["no_gs", "peaked_outside50"],
  // 500+ wins + retired/active is boring (just filters by era)
  ["wins_500plus", "retired"], ["wins_500plus", "active"],
  ["wins_300plus", "retired"],
  // $1M+ season is too easy (almost everyone modern qualifies)
  ["prize_1m", "active"], ["prize_1m", "era_2020"], ["prize_1m", "era_2010"],
  ["prize_1m", "retired"],
  // Multiple slam categories together is redundant
  ["ao_champ", "rg_champ"], ["ao_champ", "w_champ"], ["ao_champ", "uso_champ"],
  ["rg_champ", "w_champ"], ["rg_champ", "uso_champ"], ["w_champ", "uso_champ"],
  ["ao_champ", "multi_gs"], ["rg_champ", "multi_gs"], ["w_champ", "multi_gs"], ["uso_champ", "multi_gs"],
  ["ao_champ", "one_slam_wonder"], ["rg_champ", "one_slam_wonder"],
  ["w_champ", "one_slam_wonder"], ["uso_champ", "one_slam_wonder"],
  // Clay/grass specialist + slam they won is redundant
  ["clay_specialist", "rg_champ"], ["grass_specialist", "w_champ"],
];

// Check if two category IDs conflict
function categoriesConflict(id1, id2) {
  return CONFLICTS.some(([a, b]) => (a === id1 && b === id2) || (a === id2 && b === id1));
}

// Generate the daily grid
function generateDailyGrid(dateStr) {
  if (!dateStr) {
    const today = new Date();
    dateStr = today.toISOString().split('T')[0];
  }

  const seed = dateToSeed(dateStr);
  const rng = mulberry32(seed);

  let attempts = 0;
  const maxAttempts = 500;

  while (attempts < maxAttempts) {
    attempts++;

    const shuffled = seededShuffle(ALL_CANDIDATE_IDS, rng);

    // Pick 6 unique, non-conflicting categories: 3 for rows, 3 for cols
    const picked = [];
    const pickedTypes = { row: [], col: [] };

    for (const id of shuffled) {
      if (picked.length >= 6) break;
      const cat = getCategoryById(id);
      if (!cat) continue;
      if (picked.find(c => c.id === id)) continue;

      // Check for conflicts with ALL already-picked categories
      const hasConflict = picked.some(existing => categoriesConflict(id, existing.id));
      if (hasConflict) continue;

      // For variety, avoid too many of the same type per axis
      const isRow = picked.length < 3;
      const bucket = isRow ? 'row' : 'col';
      const typeCount = pickedTypes[bucket].filter(t => t === cat.type).length;

      // Max 2 of same type per axis
      if (typeCount >= 2) continue;

      picked.push(cat);
      pickedTypes[bucket].push(cat.type);
    }

    if (picked.length < 6) continue;

    const rowCats = picked.slice(0, 3);
    const colCats = picked.slice(3, 6);

    // Validate: every cell must have at least 2 valid players (for interesting gameplay)
    let valid = true;
    for (const rowCat of rowCats) {
      for (const colCat of colCats) {
        const matches = getPlayersForIntersection(rowCat, colCat);
        if (matches.length < 2) {
          valid = false;
          break;
        }
      }
      if (!valid) break;
    }

    if (valid) {
      return {
        date: dateStr,
        rows: rowCats,
        cols: colCats,
        validAnswers: rowCats.map((rowCat) =>
          colCats.map((colCat) =>
            getPlayersForIntersection(rowCat, colCat).map(p => p.id)
          )
        )
      };
    }
  }

  // Fallback: use a known-good grid
  return {
    date: dateStr,
    rows: [getCategoryById("spain"), getCategoryById("usa"), getCategoryById("australia")],
    cols: [getCategoryById("w_champ"), getCategoryById("davis_cup"), getCategoryById("active")],
    validAnswers: [
      [getPlayersForIntersection(getCategoryById("spain"), getCategoryById("w_champ")).map(p=>p.id), getPlayersForIntersection(getCategoryById("spain"), getCategoryById("davis_cup")).map(p=>p.id), getPlayersForIntersection(getCategoryById("spain"), getCategoryById("active")).map(p=>p.id)],
      [getPlayersForIntersection(getCategoryById("usa"), getCategoryById("w_champ")).map(p=>p.id), getPlayersForIntersection(getCategoryById("usa"), getCategoryById("davis_cup")).map(p=>p.id), getPlayersForIntersection(getCategoryById("usa"), getCategoryById("active")).map(p=>p.id)],
      [getPlayersForIntersection(getCategoryById("australia"), getCategoryById("w_champ")).map(p=>p.id), getPlayersForIntersection(getCategoryById("australia"), getCategoryById("davis_cup")).map(p=>p.id), getPlayersForIntersection(getCategoryById("australia"), getCategoryById("active")).map(p=>p.id)]
    ]
  };
}

// Get today's date string
function getTodayString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}
