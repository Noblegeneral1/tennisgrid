// Clean monochromatic SVG icons for ATP Grid categories
// All icons are 24x24 viewBox, stroke-based for consistency

const ICONS = {
  // Trophies & Achievements
  trophy: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4a2 2 0 01-2-2V6a2 2 0 012-2h2"/><path d="M18 9h2a2 2 0 002-2V6a2 2 0 00-2-2h-2"/><path d="M6 4h12v6a6 6 0 01-12 0V4z"/><path d="M10 16h4"/><path d="M9 20h6"/><path d="M12 16v4"/></svg>`,

  medal: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="15" r="5"/><path d="M8.21 13.89L7 3h10l-1.21 10.89"/><path d="M12 12v3"/><path d="M10 15h4"/></svg>`,

  olympicRings: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="10" r="3.5"/><circle cx="12" cy="10" r="3.5"/><circle cx="18" cy="10" r="3.5"/><circle cx="9" cy="14" r="3.5"/><circle cx="15" cy="14" r="3.5"/></svg>`,

  crown: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M4 17l2-12 4 5 2-7 2 7 4-5 2 12z"/></svg>`,

  // Tennis-specific
  tennisBall: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M18.5 7.5c-3 2-6.5 2-9 0"/><path d="M5.5 16.5c3-2 6.5-2 9 0"/></svg>`,

  racket: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="13" cy="8" rx="6" ry="7"/><path d="M7 15l-4 4"/><line x1="10" y1="4" x2="10" y2="12" opacity="0.35"/><line x1="16" y1="4" x2="16" y2="12" opacity="0.35"/><line x1="7.5" y1="8" x2="18.5" y2="8" opacity="0.35"/></svg>`,

  serve: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4l3-2"/><circle cx="19" cy="2" r="1.5"/><path d="M10 6l5-2"/><path d="M12 8v6"/><path d="M8 14l4-2 4 2"/><path d="M9 20l3-6 3 6"/></svg>`,

  // Stats & Numbers
  chart: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>`,

  trendUp: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,

  dollar: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,

  hash: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,

  // Time / Calendar
  calendar: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,

  // Globe / Geography
  globe: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,

  flag: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,

  // Hands
  handLeft: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 00-4 0v1"/><path d="M14 10V4a2 2 0 00-4 0v6"/><path d="M10 10.5V5a2 2 0 00-4 0v9"/><path d="M18 11a2 2 0 014 0v3a8 8 0 01-8 8h-2c-2.8 0-4.5-.9-5.7-2.4L3.7 16a2 2 0 013-2.5l.3.3"/></svg>`,

  handRight: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 11V6a2 2 0 014 0v1"/><path d="M10 10V4a2 2 0 014 0v6"/><path d="M14 10.5V5a2 2 0 014 0v9"/><path d="M6 11a2 2 0 00-4 0v3a8 8 0 008 8h2c2.8 0 4.5-.9 5.7-2.4l2.6-3.6a2 2 0 00-3-2.5l-.3.3"/></svg>`,

  // Status
  check: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,

  x: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,

  slash: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,

  star: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,

  award: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,

  // Tennis player (mid-serve silhouette) - stroke 1.8
  playerServing: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2.5"/><path d="M12 6.5v5"/><path d="M9 21l2-7h2l2 7"/><path d="M8 13l4-2 4 2"/><path d="M16 7l2.5-2.5"/><circle cx="19.5" cy="3.5" r="1.5"/></svg>`,

  // Retired player - stroke 1.8
  playerRetired: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2.5"/><path d="M12 6.5v5"/><path d="M9 21l2-7h2l2 7"/><path d="M8 13l4-2 4 2"/><path d="M17 2l3 3M20 2l-3 3" opacity="0.5"/></svg>`,

  // Tennis racquet (clean oval head + strings + handle) - stroke 1.8
  tennisRacquet: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="13" cy="9" rx="6" ry="7.5"/><path d="M8.5 15l-4.5 6"/><line x1="10" y1="4" x2="10" y2="14" opacity="0.35"/><line x1="13" y1="2" x2="13" y2="16" opacity="0.35"/><line x1="16" y1="4" x2="16" y2="14" opacity="0.35"/><line x1="7.5" y1="7" x2="18.5" y2="7" opacity="0.35"/><line x1="7" y1="11" x2="19" y2="11" opacity="0.35"/></svg>`,

  // Ball with motion trail (for career wins) - stroke 1.8
  ballMotion: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="12" r="5"/><path d="M19.5 9c-1.5 1-3.5 1-5 0"/><path d="M12.5 15c1.5-1 3.5-1 5 0"/><line x1="2" y1="10" x2="8" y2="10" opacity="0.35"/><line x1="3" y1="12" x2="9" y2="12" opacity="0.5"/><line x1="2" y1="14" x2="8" y2="14" opacity="0.35"/></svg>`,

  // Court surfaces
  clay: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="1"/><line x1="12" y1="6" x2="12" y2="18"/><line x1="2" y1="12" x2="22" y2="12"/><rect x="8" y="9" width="8" height="6" rx="0.5"/></svg>`,

  grass: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l2-8"/><path d="M8 20l1-12"/><path d="M12 20V6"/><path d="M16 20l-1-12"/><path d="M20 20l-2-8"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,

  // Height / Measuring
  ruler: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3H3v18h18V3zM6 17v-2h3v2H6zm0-4v-2h5v2H6zm0-4V7h3v2H6z"/></svg>`,

  // Fire / Surface wins
  flame: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 23c-3.9 0-7-3.1-7-7 0-3.2 2.9-6.8 5.1-9.4L12 4.5l1.9 2.1C16.1 9.2 19 12.8 19 16c0 3.9-3.1 7-7 7z"/></svg>`,

  // Time / Age
  clock: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,

  // Lightning bolt / Power
  zap: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,

  // Davis Cup specific
  davisCup: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4a2 2 0 01-2-2V6a2 2 0 012-2h2"/><path d="M18 9h2a2 2 0 002-2V6a2 2 0 00-2-2h-2"/><path d="M6 4h12v6a6 6 0 01-12 0V4z"/><path d="M12 16v-2"/><path d="M8 20h8l-1-4h-6z"/></svg>`,
};

// Map category IDs to their SVG icon
const CATEGORY_ICONS = {
  // Grand Slams
  ao_champ: ICONS.trophy,
  rg_champ: ICONS.trophy,
  w_champ: ICONS.trophy,
  uso_champ: ICONS.trophy,
  gs_champ: ICONS.trophy,
  multi_gs: ICONS.star,
  no_gs: ICONS.slash,
  one_slam_wonder: ICONS.medal,
  clay_specialist: ICONS.clay,
  grass_specialist: ICONS.grass,

  // Countries (use flag icon)
  usa: ICONS.flag, spain: ICONS.flag, switzerland: ICONS.flag,
  serbia: ICONS.flag, france: ICONS.flag, germany: ICONS.flag,
  australia: ICONS.flag, argentina: ICONS.flag, sweden: ICONS.flag,
  uk: ICONS.flag, russia: ICONS.flag, italy: ICONS.flag,
  czech: ICONS.flag, croatia: ICONS.flag, chile: ICONS.flag,
  netherlands: ICONS.flag, canada: ICONS.flag, austria: ICONS.flag,
  brazil: ICONS.flag, belgium: ICONS.flag, south_africa: ICONS.flag,
  japan: ICONS.flag, romania: ICONS.flag, poland: ICONS.flag, new_zealand: ICONS.flag,

  // Regional
  south_american: ICONS.globe,
  european: ICONS.globe,
  non_european: ICONS.globe,

  // Eras
  era_1960: ICONS.tennisRacquet, era_1970: ICONS.tennisRacquet, era_1980: ICONS.tennisRacquet,
  era_1990: ICONS.tennisRacquet, era_2000: ICONS.tennisRacquet, era_2010: ICONS.tennisRacquet,
  era_2020: ICONS.tennisRacquet,

  // Stats
  no_titles: ICONS.slash,
  titles_5plus: ICONS.chart,
  titles_10plus: ICONS.chart,
  titles_20plus: ICONS.chart,
  wins_300plus: ICONS.award,
  wins_500plus: ICONS.award,
  prize_1m: ICONS.dollar,
  prize_5m: ICONS.dollar,
  prize_10m: ICONS.dollar,
  left_handed: ICONS.handLeft,
  right_handed: ICONS.handRight,
  active: ICONS.playerServing,
  retired: ICONS.playerRetired,

  // Achievements
  year_end_no1: ICONS.crown,
  olympic_gold: ICONS.olympicRings,
  davis_cup: ICONS.davisCup,
  atp_finals: ICONS.trophy,

  // Rankings
  peaked_no1: ICONS.crown,
  peaked_top3: ICONS.hash,
  peaked_top5: ICONS.hash,
  peaked_top10: ICONS.hash,
  peaked_top20: ICONS.hash,
  never_top10: ICONS.x,
  never_top20: ICONS.x,
  peaked_outside50: ICONS.x,

  // Elite categories
  career_grand_slam: ICONS.crown,
  masters_1000_champ: ICONS.medal,
  masters_5plus: ICONS.medal,
  masters_10plus: ICONS.medal,
  weeks_no1_100: ICONS.crown,

  // Underdog categories
  sub_100_wins: ICONS.ballMotion,
  sub_50_wins: ICONS.ballMotion,
  one_title_wonder: ICONS.medal,
  no_masters: ICONS.slash,
  no_slam_no_masters: ICONS.slash,

  // Height / Surface / Age / Career
  tall_player: ICONS.ruler,
  short_player: ICONS.ruler,
  clay_100_wins: ICONS.flame,
  hard_100_wins: ICONS.flame,
  grass_50_wins: ICONS.flame,
  clay_200_wins: ICONS.flame,
  young_first_title: ICONS.clock,
  title_after_30: ICONS.clock,
  long_career: ICONS.clock,
  big_server: ICONS.zap,
};

// Get SVG icon for a category (fallback to empty string)
function getCategoryIcon(categoryId) {
  return CATEGORY_ICONS[categoryId] || ICONS.tennisBall;
}
