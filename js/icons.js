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

  racket: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="13" cy="8" rx="6" ry="7"/><path d="M7 15l-4 4"/><path d="M10 5v6"/><path d="M16 5v6"/><path d="M7 8h12"/></svg>`,

  serve: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M12 6v4"/><path d="M8 14l4-4 4 4"/><path d="M12 10v10"/><path d="M8 20h8"/><path d="M16 8l3-3"/><circle cx="20" cy="4" r="1.5"/></svg>`,

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

  // People
  userActive: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><circle cx="19" cy="4" r="2" fill="currentColor" stroke="none" opacity="0.5"/></svg>`,

  userRetired: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M17 3l4 4M21 3l-4 4" opacity="0.5"/></svg>`,

  // Court surfaces
  clay: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="1"/><line x1="12" y1="6" x2="12" y2="18"/><line x1="2" y1="12" x2="22" y2="12"/><rect x="8" y="9" width="8" height="6" rx="0.5"/></svg>`,

  grass: `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l2-8"/><path d="M8 20l1-12"/><path d="M12 20V6"/><path d="M16 20l-1-12"/><path d="M20 20l-2-8"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,

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
  japan: ICONS.flag, romania: ICONS.flag, poland: ICONS.flag,

  // Regional
  south_american: ICONS.globe,
  european: ICONS.globe,
  non_european: ICONS.globe,

  // Eras
  era_1960: ICONS.calendar, era_1970: ICONS.calendar, era_1980: ICONS.calendar,
  era_1990: ICONS.calendar, era_2000: ICONS.calendar, era_2010: ICONS.calendar,
  era_2020: ICONS.calendar,

  // Stats
  no_titles: ICONS.slash,
  titles_5plus: ICONS.chart,
  titles_10plus: ICONS.chart,
  titles_20plus: ICONS.chart,
  wins_300plus: ICONS.trendUp,
  wins_500plus: ICONS.trendUp,
  prize_1m: ICONS.dollar,
  prize_5m: ICONS.dollar,
  prize_10m: ICONS.dollar,
  first_serve_80: ICONS.serve,
  left_handed: ICONS.handLeft,
  right_handed: ICONS.handRight,
  active: ICONS.userActive,
  retired: ICONS.userRetired,

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
};

// Get SVG icon for a category (fallback to empty string)
function getCategoryIcon(categoryId) {
  return CATEGORY_ICONS[categoryId] || ICONS.tennisBall;
}
