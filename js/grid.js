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
  "belgium", "south_africa", "japan", "romania", "poland", "new_zealand",
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
  // Fun - elite
  "one_slam_wonder", "clay_specialist", "grass_specialist",
  "career_grand_slam",
  "masters_1000_champ", "masters_5plus", "masters_10plus", "weeks_no1_100",
  // Fun - underdog
  "never_top10", "never_top20", "peaked_outside50",
  "sub_100_wins", "sub_50_wins", "one_title_wonder",
  "no_masters", "no_slam_no_masters",
  // Height / Surface / Age / Career
  "tall_player", "short_player", "clay_100_wins", "hard_100_wins",
  "grass_50_wins", "clay_200_wins", "young_first_title", "title_after_30",
  "long_career", "big_server",
  // Broader stats
  "titles_1plus", "titles_3plus", "wins_100plus", "wins_200plus",
  "peaked_top50", "peaked_top100",
  "clay_50_wins", "hard_50_wins", "hard_200_wins", "grass_20_wins",
  "career_10plus", "career_20plus",
  "first_title_before_23", "title_after_28",
  "ace_rate_5plus", "ace_rate_15plus",
  // Height / Physical
  "height_190plus", "height_185plus", "height_under_183", "height_under_175",
  // More countries
  "india", "greece", "norway", "denmark", "colombia", "ukraine", "portugal",
  "georgia", "bulgaria", "hungary", "finland", "israel", "chinese_taipei",
  "korea", "ecuador", "slovakia", "slovenia", "kazakhstan", "uzbekistan",
  // Broader regions
  "asian", "african", "north_american", "oceanian",
  "slavic", "scandinavian", "latin_american"
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
  ["non_european", "south_africa"], ["non_european", "canada"], ["non_european", "new_zealand"],
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
  ["european", "south_africa"], ["european", "canada"], ["european", "new_zealand"],
  // South American vs non-SA countries
  ["south_american", "usa"], ["south_american", "spain"], ["south_american", "france"],
  ["south_american", "germany"], ["south_american", "australia"], ["south_american", "uk"],
  ["south_american", "russia"], ["south_american", "italy"], ["south_american", "serbia"],
  ["south_american", "czech"], ["south_american", "croatia"], ["south_american", "switzerland"],
  ["south_american", "sweden"], ["south_american", "japan"], ["south_american", "canada"],
  ["south_american", "south_africa"], ["south_american", "new_zealand"], ["south_american", "netherlands"],
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

  // ===== REMAINING CATEGORY CONFLICTS =====
  // Career grand slam overlaps
  ["career_grand_slam", "ao_champ"], ["career_grand_slam", "rg_champ"],
  ["career_grand_slam", "w_champ"], ["career_grand_slam", "uso_champ"],
  ["career_grand_slam", "gs_champ"], ["career_grand_slam", "multi_gs"],
  ["career_grand_slam", "one_slam_wonder"],
  // Masters subsets
  ["masters_1000_champ", "masters_5plus"], ["masters_1000_champ", "masters_10plus"],
  ["masters_5plus", "masters_10plus"],
  // Weeks at #1 implies peaked #1
  ["weeks_no1_100", "peaked_no1"], ["weeks_no1_100", "year_end_no1"],
  // Underdog conflicts with elite
  ["sub_100_wins", "wins_300plus"], ["sub_100_wins", "wins_500plus"],
  ["sub_50_wins", "wins_300plus"], ["sub_50_wins", "wins_500plus"],
  ["sub_50_wins", "sub_100_wins"],
  ["sub_100_wins", "titles_10plus"], ["sub_100_wins", "titles_20plus"],
  ["sub_50_wins", "titles_5plus"], ["sub_50_wins", "titles_10plus"], ["sub_50_wins", "titles_20plus"],
  ["one_title_wonder", "no_titles"], ["one_title_wonder", "titles_5plus"],
  ["one_title_wonder", "titles_10plus"], ["one_title_wonder", "titles_20plus"],
  ["no_masters", "masters_1000_champ"], ["no_masters", "masters_5plus"], ["no_masters", "masters_10plus"],
  ["no_slam_no_masters", "gs_champ"], ["no_slam_no_masters", "multi_gs"],
  ["no_slam_no_masters", "masters_1000_champ"], ["no_slam_no_masters", "masters_5plus"],
  ["no_slam_no_masters", "ao_champ"], ["no_slam_no_masters", "rg_champ"],
  ["no_slam_no_masters", "w_champ"], ["no_slam_no_masters", "uso_champ"],
  ["no_slam_no_masters", "no_gs"], ["no_slam_no_masters", "no_masters"],
  ["no_slam_no_masters", "no_titles"],
  // Underdog + underdog is boring
  ["sub_100_wins", "no_titles"], ["sub_50_wins", "no_titles"],
  ["sub_100_wins", "peaked_outside50"], ["sub_50_wins", "peaked_outside50"],
  ["sub_100_wins", "never_top20"], ["sub_50_wins", "never_top20"],
  // Height / Surface / Age conflicts
  ["tall_player", "short_player"],
  ["clay_100_wins", "clay_200_wins"],
  ["no_titles", "young_first_title"],
  ["no_titles", "title_after_30"],

  // ===== NEW BROADER CATEGORY CONFLICTS =====
  // Title tiers are subsets of each other
  ["titles_1plus", "titles_3plus"], ["titles_1plus", "titles_5plus"],
  ["titles_1plus", "titles_10plus"], ["titles_1plus", "titles_20plus"],
  ["titles_3plus", "titles_5plus"], ["titles_3plus", "titles_10plus"],
  ["titles_3plus", "titles_20plus"],
  ["titles_1plus", "no_titles"], ["titles_3plus", "no_titles"],
  ["titles_1plus", "one_title_wonder"],
  // Win tiers are subsets
  ["wins_100plus", "wins_200plus"], ["wins_100plus", "wins_300plus"],
  ["wins_100plus", "wins_500plus"],
  ["wins_200plus", "wins_300plus"], ["wins_200plus", "wins_500plus"],
  ["wins_100plus", "sub_100_wins"], ["wins_100plus", "sub_50_wins"],
  ["wins_200plus", "sub_100_wins"], ["wins_200plus", "sub_50_wins"],
  // Ranking tiers
  ["peaked_top50", "peaked_top20"], ["peaked_top50", "peaked_top10"],
  ["peaked_top50", "peaked_top5"], ["peaked_top50", "peaked_top3"],
  ["peaked_top50", "peaked_no1"],
  ["peaked_top100", "peaked_top50"], ["peaked_top100", "peaked_top20"],
  ["peaked_top100", "peaked_top10"], ["peaked_top100", "peaked_top5"],
  ["peaked_top100", "peaked_top3"], ["peaked_top100", "peaked_no1"],
  ["peaked_top50", "peaked_outside50"], ["peaked_top100", "peaked_outside50"],
  ["peaked_top50", "never_top10"], ["peaked_top50", "never_top20"],
  // Surface win tiers
  ["clay_50_wins", "clay_100_wins"], ["clay_50_wins", "clay_200_wins"],
  ["hard_50_wins", "hard_100_wins"], ["hard_50_wins", "hard_200_wins"],
  ["hard_100_wins", "hard_200_wins"],
  ["grass_20_wins", "grass_50_wins"],
  // Career length tiers
  ["career_10plus", "career_20plus"], ["career_10plus", "long_career"],
  ["career_20plus", "long_career"],
  // Age-of-title tiers
  ["first_title_before_23", "young_first_title"],
  ["title_after_28", "title_after_30"],
  ["no_titles", "titles_1plus"], ["no_titles", "titles_3plus"],
  ["no_titles", "first_title_before_23"], ["no_titles", "title_after_28"],
  // Ace rate tiers
  ["ace_rate_5plus", "ace_rate_15plus"], ["ace_rate_5plus", "big_server"],
  ["ace_rate_15plus", "big_server"],
  // Height tiers
  ["height_190plus", "height_185plus"], ["height_190plus", "tall_player"],
  ["height_185plus", "tall_player"],
  ["height_under_183", "height_under_175"], ["height_under_183", "short_player"],
  ["height_under_175", "short_player"],
  ["height_190plus", "height_under_183"], ["height_190plus", "height_under_175"],
  ["height_185plus", "height_under_175"],
  ["tall_player", "height_under_183"], ["tall_player", "height_under_175"],
  ["short_player", "height_185plus"], ["short_player", "height_190plus"],
  // Region vs country conflicts
  ["asian", "japan"], ["asian", "india"], ["asian", "korea"], ["asian", "chinese_taipei"],
  ["asian", "kazakhstan"], ["asian", "uzbekistan"],
  ["asian", "european"], ["asian", "non_european"],
  ["african", "south_africa"], ["african", "european"], ["african", "non_european"],
  ["north_american", "usa"], ["north_american", "canada"],
  ["north_american", "european"], ["north_american", "non_european"],
  ["oceanian", "australia"], ["oceanian", "new_zealand"],
  ["oceanian", "european"], ["oceanian", "non_european"],
  ["slavic", "serbia"], ["slavic", "croatia"], ["slavic", "czech"],
  ["slavic", "poland"], ["slavic", "russia"], ["slavic", "bulgaria"],
  ["slavic", "ukraine"], ["slavic", "slovakia"], ["slavic", "slovenia"],
  ["scandinavian", "sweden"], ["scandinavian", "norway"],
  ["scandinavian", "denmark"], ["scandinavian", "finland"],
  ["latin_american", "south_american"],
  ["latin_american", "argentina"], ["latin_american", "brazil"],
  ["latin_american", "chile"], ["latin_american", "colombia"], ["latin_american", "ecuador"],
  ["latin_american", "european"], ["latin_american", "non_european"],
  // New countries vs regions
  ["european", "india"], ["european", "korea"], ["european", "chinese_taipei"],
  ["european", "kazakhstan"], ["european", "uzbekistan"], ["european", "ecuador"],
  ["european", "colombia"], ["european", "israel"],
  ["non_european", "greece"], ["non_european", "norway"], ["non_european", "denmark"],
  ["non_european", "ukraine"], ["non_european", "portugal"], ["non_european", "georgia"],
  ["non_european", "bulgaria"], ["non_european", "hungary"], ["non_european", "finland"],
  ["non_european", "slovakia"], ["non_european", "slovenia"],
  // Broad stats with underdogs — too easy/boring
  ["peaked_top100", "no_titles"],
  ["wins_100plus", "no_titles"],
  // Davis Cup appears too frequently — add conflicts to reduce it
  ["davis_cup", "olympic_gold"], ["davis_cup", "atp_finals"],
  ["davis_cup", "year_end_no1"], ["davis_cup", "masters_5plus"],
  ["davis_cup", "long_career"], ["davis_cup", "career_10plus"],
  ["davis_cup", "career_20plus"], ["davis_cup", "wins_200plus"],
  ["davis_cup", "wins_300plus"],
];

// Check if two category IDs conflict
function categoriesConflict(id1, id2) {
  return CONFLICTS.some(([a, b]) => (a === id1 && b === id2) || (a === id2 && b === id1));
}

// Cache for subset checks (computed once on load)
let _subsetCache = null;
function buildSubsetCache() {
  if (_subsetCache) return _subsetCache;
  _subsetCache = new Set();
  const cats = CATEGORIES;
  // Pre-compute which players match each category
  const catPlayers = {};
  for (const cat of cats) {
    catPlayers[cat.id] = new Set(PLAYERS.filter(p => cat.check(p)).map(p => p.id));
  }
  for (let i = 0; i < cats.length; i++) {
    const a = cats[i];
    const setA = catPlayers[a.id];
    if (setA.size < 3) continue;
    for (let j = i + 1; j < cats.length; j++) {
      const b = cats[j];
      const setB = catPlayers[b.id];
      if (setB.size < 3) continue;
      // Count overlap
      let overlap = 0;
      for (const id of setA) { if (setB.has(id)) overlap++; }
      const aSubsetPct = overlap / setA.size;
      const bSubsetPct = overlap / setB.size;
      // If either is 90%+ subset of the other, mark as conflicting
      if (aSubsetPct >= 0.9 || bSubsetPct >= 0.9) {
        _subsetCache.add(`${a.id}|${b.id}`);
        _subsetCache.add(`${b.id}|${a.id}`);
      }
    }
  }
  return _subsetCache;
}

// Combined conflict check: explicit rules OR dynamic subset detection
function fullConflictCheck(id1, id2) {
  if (categoriesConflict(id1, id2)) return true;
  const cache = buildSubsetCache();
  return cache.has(`${id1}|${id2}`);
}

// Generate the daily grid
function generateDailyGrid(dateStr) {
  if (!dateStr) {
    const today = new Date();
    dateStr = today.toISOString().split('T')[0];
  }

  // Birthday easter egg: April 11 grid — Rohan Cameron valid for center cell only
  if (dateStr === '2026-04-11') {
    const rows = [getCategoryById("davis_cup"), getCategoryById("oceanian"), getCategoryById("wins_200plus")];
    const cols = [getCategoryById("era_2000"), getCategoryById("height_185plus"), getCategoryById("titles_5plus")];
    return {
      date: dateStr,
      rows,
      cols,
      validAnswers: rows.map(r => cols.map(c => getPlayersForIntersection(r, c).map(p => p.id)))
    };
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

      // Check for conflicts with ALL already-picked categories (explicit + subset)
      const hasConflict = picked.some(existing => fullConflictCheck(id, existing.id));
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

    // Validate: every cell must have at least 10 valid players
    // This ensures there are always both obvious and niche options per cell
    let valid = true;
    for (const rowCat of rowCats) {
      for (const colCat of colCats) {
        const matches = getPlayersForIntersection(rowCat, colCat);
        if (matches.length < 10) {
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
