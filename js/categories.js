// Category definitions for ATP Grid
// Each category has a label, short label, type, and a check function

const CATEGORIES = [
  // ===== GRAND SLAM SINGLES CHAMPIONS =====
  {
    id: "ao_champ",
    label: "Australian Open Singles Champion",
    shortLabel: "AO Singles Champ",
    icon: "\ud83c\udfc6",
    type: "achievement",
    check: (p) => p.grandSlams.ao > 0
  },
  {
    id: "rg_champ",
    label: "French Open Singles Champion",
    shortLabel: "RG Singles Champ",
    icon: "\ud83c\udfc6",
    type: "achievement",
    check: (p) => p.grandSlams.rg > 0
  },
  {
    id: "w_champ",
    label: "Wimbledon Singles Champion",
    shortLabel: "Wimbledon Champ",
    icon: "\ud83c\udfc6",
    type: "achievement",
    check: (p) => p.grandSlams.w > 0
  },
  {
    id: "uso_champ",
    label: "US Open Singles Champion",
    shortLabel: "US Open Champ",
    icon: "\ud83c\udfc6",
    type: "achievement",
    check: (p) => p.grandSlams.uso > 0
  },
  {
    id: "gs_champ",
    label: "Grand Slam Singles Champion",
    shortLabel: "Slam Winner",
    icon: "\ud83c\udfc6",
    type: "achievement",
    check: (p) => p.grandSlams.ao + p.grandSlams.rg + p.grandSlams.w + p.grandSlams.uso > 0
  },
  {
    id: "multi_gs",
    label: "Won Multiple Grand Slams",
    shortLabel: "2+ Slams",
    icon: "\ud83c\udfc6\ud83c\udfc6",
    type: "achievement",
    check: (p) => p.grandSlams.ao + p.grandSlams.rg + p.grandSlams.w + p.grandSlams.uso >= 2
  },
  {
    id: "no_gs",
    label: "Never Won a Grand Slam",
    shortLabel: "No Slams",
    icon: "\ud83d\ude45",
    type: "achievement",
    check: (p) => p.grandSlams.ao + p.grandSlams.rg + p.grandSlams.w + p.grandSlams.uso === 0
  },

  // ===== COUNTRY-BASED =====
  {
    id: "usa",
    label: "American",
    shortLabel: "USA",
    icon: "\ud83c\uddfa\ud83c\uddf8",
    type: "country",
    check: (p) => p.country === "USA"
  },
  {
    id: "spain",
    label: "Spanish",
    shortLabel: "Spain",
    icon: "\ud83c\uddea\ud83c\uddf8",
    type: "country",
    check: (p) => p.country === "Spain"
  },
  {
    id: "switzerland",
    label: "Swiss",
    shortLabel: "Switzerland",
    icon: "\ud83c\udde8\ud83c\udded",
    type: "country",
    check: (p) => p.country === "Switzerland"
  },
  {
    id: "serbia",
    label: "Serbian",
    shortLabel: "Serbia",
    icon: "\ud83c\uddf7\ud83c\uddf8",
    type: "country",
    check: (p) => p.country === "Serbia"
  },
  {
    id: "france",
    label: "French",
    shortLabel: "France",
    icon: "\ud83c\uddeb\ud83c\uddf7",
    type: "country",
    check: (p) => p.country === "France"
  },
  {
    id: "germany",
    label: "German",
    shortLabel: "Germany",
    icon: "\ud83c\udde9\ud83c\uddea",
    type: "country",
    check: (p) => p.country === "Germany"
  },
  {
    id: "australia",
    label: "Australian",
    shortLabel: "Australia",
    icon: "\ud83c\udde6\ud83c\uddfa",
    type: "country",
    check: (p) => p.country === "Australia"
  },
  {
    id: "argentina",
    label: "Argentine",
    shortLabel: "Argentina",
    icon: "\ud83c\udde6\ud83c\uddf7",
    type: "country",
    check: (p) => p.country === "Argentina"
  },
  {
    id: "sweden",
    label: "Swedish",
    shortLabel: "Sweden",
    icon: "\ud83c\uddf8\ud83c\uddea",
    type: "country",
    check: (p) => p.country === "Sweden"
  },
  {
    id: "uk",
    label: "British",
    shortLabel: "Great Britain",
    icon: "\ud83c\uddec\ud83c\udde7",
    type: "country",
    check: (p) => p.country === "United Kingdom"
  },
  {
    id: "russia",
    label: "Russian",
    shortLabel: "Russia",
    icon: "\ud83c\uddf7\ud83c\uddfa",
    type: "country",
    check: (p) => p.country === "Russia"
  },
  {
    id: "italy",
    label: "Italian",
    shortLabel: "Italy",
    icon: "\ud83c\uddee\ud83c\uddf9",
    type: "country",
    check: (p) => p.country === "Italy"
  },
  {
    id: "czech",
    label: "Czech",
    shortLabel: "Czech Republic",
    icon: "\ud83c\udde8\ud83c\uddff",
    type: "country",
    check: (p) => p.country === "Czech Republic"
  },
  {
    id: "croatia",
    label: "Croatian",
    shortLabel: "Croatia",
    icon: "\ud83c\udded\ud83c\uddf7",
    type: "country",
    check: (p) => p.country === "Croatia"
  },
  {
    id: "chile",
    label: "Chilean",
    shortLabel: "Chile",
    icon: "\ud83c\udde8\ud83c\uddf1",
    type: "country",
    check: (p) => p.country === "Chile"
  },
  {
    id: "netherlands",
    label: "Dutch",
    shortLabel: "Netherlands",
    icon: "\ud83c\uddf3\ud83c\uddf1",
    type: "country",
    check: (p) => p.country === "Netherlands"
  },
  {
    id: "canada",
    label: "Canadian",
    shortLabel: "Canada",
    icon: "\ud83c\udde8\ud83c\udde6",
    type: "country",
    check: (p) => p.country === "Canada"
  },
  {
    id: "austria",
    label: "Austrian",
    shortLabel: "Austria",
    icon: "\ud83c\udde6\ud83c\uddf9",
    type: "country",
    check: (p) => p.country === "Austria"
  },
  {
    id: "brazil",
    label: "Brazilian",
    shortLabel: "Brazil",
    icon: "\ud83c\udde7\ud83c\uddf7",
    type: "country",
    check: (p) => p.country === "Brazil"
  },
  {
    id: "belgium",
    label: "Belgian",
    shortLabel: "Belgium",
    icon: "\ud83c\udde7\ud83c\uddea",
    type: "country",
    check: (p) => p.country === "Belgium"
  },
  {
    id: "south_africa",
    label: "South African",
    shortLabel: "South Africa",
    icon: "\ud83c\uddff\ud83c\udde6",
    type: "country",
    check: (p) => p.country === "South Africa"
  },
  {
    id: "japan",
    label: "Japanese",
    shortLabel: "Japan",
    icon: "\ud83c\uddef\ud83c\uddf5",
    type: "country",
    check: (p) => p.country === "Japan"
  },
  {
    id: "romania",
    label: "Romanian",
    shortLabel: "Romania",
    icon: "\ud83c\uddf7\ud83c\uddf4",
    type: "country",
    check: (p) => p.country === "Romania"
  },
  {
    id: "poland",
    label: "Polish",
    shortLabel: "Poland",
    icon: "\ud83c\uddf5\ud83c\uddf1",
    type: "country",
    check: (p) => p.country === "Poland"
  },

  // ===== DECADE-BASED (full labels) =====
  {
    id: "era_1960",
    label: "Played in the 1960s",
    shortLabel: "Played in 1960s",
    icon: "\ud83d\udcc5",
    type: "era",
    check: (p) => p.decades.includes(1960)
  },
  {
    id: "era_1970",
    label: "Played in the 1970s",
    shortLabel: "Played in 1970s",
    icon: "\ud83d\udcc5",
    type: "era",
    check: (p) => p.decades.includes(1970)
  },
  {
    id: "era_1980",
    label: "Played in the 1980s",
    shortLabel: "Played in 1980s",
    icon: "\ud83d\udcc5",
    type: "era",
    check: (p) => p.decades.includes(1980)
  },
  {
    id: "era_1990",
    label: "Played in the 1990s",
    shortLabel: "Played in 1990s",
    icon: "\ud83d\udcc5",
    type: "era",
    check: (p) => p.decades.includes(1990)
  },
  {
    id: "era_2000",
    label: "Played in the 2000s",
    shortLabel: "Played in 2000s",
    icon: "\ud83d\udcc5",
    type: "era",
    check: (p) => p.decades.includes(2000)
  },
  {
    id: "era_2010",
    label: "Played in the 2010s",
    shortLabel: "Played in 2010s",
    icon: "\ud83d\udcc5",
    type: "era",
    check: (p) => p.decades.includes(2010)
  },
  {
    id: "era_2020",
    label: "Played in the 2020s",
    shortLabel: "Played in 2020s",
    icon: "\ud83d\udcc5",
    type: "era",
    check: (p) => p.decades.includes(2020)
  },

  // ===== STAT-BASED =====
  {
    id: "no_titles",
    label: "Zero Career Singles Titles",
    shortLabel: "0 Titles",
    icon: "\ud83d\ude45",
    type: "stat",
    check: (p) => p.titles === 0
  },
  {
    id: "titles_20plus",
    label: "Won 20+ Career Titles",
    shortLabel: "20+ Titles",
    icon: "\ud83c\udfc5",
    type: "stat",
    check: (p) => p.titles >= 20
  },
  {
    id: "titles_10plus",
    label: "Won 10+ Career Titles",
    shortLabel: "10+ Titles",
    icon: "\ud83c\udfc5",
    type: "stat",
    check: (p) => p.titles >= 10
  },
  {
    id: "titles_5plus",
    label: "Won 5+ Career Titles",
    shortLabel: "5+ Titles",
    icon: "\ud83c\udfc5",
    type: "stat",
    check: (p) => p.titles >= 5
  },
  {
    id: "wins_500plus",
    label: "500+ Career Match Wins",
    shortLabel: "500+ Wins",
    icon: "\u2705",
    type: "stat",
    check: (p) => p.careerWins >= 500
  },
  {
    id: "wins_300plus",
    label: "300+ Career Match Wins",
    shortLabel: "300+ Wins",
    icon: "\u2705",
    type: "stat",
    check: (p) => p.careerWins >= 300
  },
  {
    id: "prize_10m",
    label: "$10M+ Prize Money in One Season",
    shortLabel: "$10M+ Season",
    icon: "\ud83d\udcb0",
    type: "stat",
    check: (p) => p.bestPrizeMoneySeason >= 10000000
  },
  {
    id: "prize_5m",
    label: "$5M+ Prize Money in One Season",
    shortLabel: "$5M+ Season",
    icon: "\ud83d\udcb0",
    type: "stat",
    check: (p) => p.bestPrizeMoneySeason >= 5000000
  },
  {
    id: "prize_1m",
    label: "$1M+ Prize Money in One Season",
    shortLabel: "$1M+ Season",
    icon: "\ud83d\udcb0",
    type: "stat",
    check: (p) => p.bestPrizeMoneySeason >= 1000000
  },
  {
    id: "first_serve_80",
    label: "80%+ First Serve Points Won (Career)",
    shortLabel: "80%+ 1st Serve",
    icon: "\ud83d\udca8",
    type: "stat",
    check: (p) => p.firstServeWinPct80
  },
  {
    id: "left_handed",
    label: "Left-Handed Player",
    shortLabel: "Left-Handed",
    icon: "\ud83e\udd1a",
    type: "stat",
    check: (p) => p.hand === "L"
  },
  {
    id: "right_handed",
    label: "Right-Handed Player",
    shortLabel: "Right-Handed",
    icon: "\ud83d\udd90\ufe0f",
    type: "stat",
    check: (p) => p.hand === "R"
  },
  {
    id: "active",
    label: "Currently Active on Tour",
    shortLabel: "Active Player",
    icon: "\ud83c\udfbe",
    type: "stat",
    check: (p) => p.active
  },
  {
    id: "retired",
    label: "Retired from the Tour",
    shortLabel: "Retired",
    icon: "\ud83d\udc4b",
    type: "stat",
    check: (p) => !p.active
  },

  // ===== ACHIEVEMENT-BASED =====
  {
    id: "year_end_no1",
    label: "Finished Year-End World #1",
    shortLabel: "Year-End #1",
    icon: "\ud83e\udd47",
    type: "achievement",
    check: (p) => p.yearEndNo1
  },
  {
    id: "olympic_gold",
    label: "Olympic Singles Gold Medalist",
    shortLabel: "Olympic Gold",
    icon: "\ud83c\udfc5",
    type: "achievement",
    check: (p) => p.olympicSinglesGold
  },
  {
    id: "davis_cup",
    label: "Davis Cup Champion",
    shortLabel: "Davis Cup Champ",
    icon: "\ud83c\udfc6",
    type: "achievement",
    check: (p) => p.davisCup
  },
  {
    id: "atp_finals",
    label: "ATP Finals / Tour Finals Champion",
    shortLabel: "ATP Finals Champ",
    icon: "\ud83c\udfc6",
    type: "achievement",
    check: (p) => p.atpFinals
  },

  // ===== RANKING PEAKS =====
  {
    id: "peaked_no1",
    label: "Reached World #1",
    shortLabel: "Former #1",
    icon: "\ud83e\udd47",
    type: "achievement",
    check: (p) => p.peakRanking === 1
  },
  {
    id: "peaked_top3",
    label: "Career-High Top 3",
    shortLabel: "Top 3 Peak",
    icon: "\ud83d\udcca",
    type: "achievement",
    check: (p) => p.peakRanking <= 3
  },
  {
    id: "peaked_top5",
    label: "Career-High Top 5",
    shortLabel: "Top 5 Peak",
    icon: "\ud83d\udcca",
    type: "achievement",
    check: (p) => p.peakRanking <= 5
  },
  {
    id: "peaked_top10",
    label: "Career-High Top 10",
    shortLabel: "Top 10 Peak",
    icon: "\ud83d\udcca",
    type: "achievement",
    check: (p) => p.peakRanking <= 10
  },
  {
    id: "peaked_top20",
    label: "Career-High Top 20",
    shortLabel: "Top 20 Peak",
    icon: "\ud83d\udcca",
    type: "achievement",
    check: (p) => p.peakRanking <= 20
  },
  {
    id: "never_top10",
    label: "Never Reached Top 10",
    shortLabel: "Never Top 10",
    icon: "\ud83d\udcca",
    type: "stat",
    check: (p) => p.peakRanking > 10
  },
  {
    id: "never_top20",
    label: "Never Reached Top 20",
    shortLabel: "Never Top 20",
    icon: "\ud83d\udcca",
    type: "stat",
    check: (p) => p.peakRanking > 20
  },
  {
    id: "peaked_outside50",
    label: "Career-High Outside Top 50",
    shortLabel: "Never Top 50",
    icon: "\ud83d\udcca",
    type: "stat",
    check: (p) => p.peakRanking > 50
  },

  // ===== FUN / QUIRKY CATEGORIES =====
  {
    id: "one_slam_wonder",
    label: "Exactly One Grand Slam Title",
    shortLabel: "1-Slam Wonder",
    icon: "\u261d\ufe0f",
    type: "achievement",
    check: (p) => {
      const total = p.grandSlams.ao + p.grandSlams.rg + p.grandSlams.w + p.grandSlams.uso;
      return total === 1;
    }
  },
  {
    id: "clay_specialist",
    label: "Won French Open But No Other Slam",
    shortLabel: "Clay Specialist",
    icon: "\ud83e\uddf1",
    type: "achievement",
    check: (p) => p.grandSlams.rg > 0 && p.grandSlams.ao === 0 && p.grandSlams.w === 0 && p.grandSlams.uso === 0
  },
  {
    id: "grass_specialist",
    label: "Won Wimbledon But No Other Slam",
    shortLabel: "Grass Specialist",
    icon: "\ud83c\udf3f",
    type: "achievement",
    check: (p) => p.grandSlams.w > 0 && p.grandSlams.ao === 0 && p.grandSlams.rg === 0 && p.grandSlams.uso === 0
  },
  {
    id: "south_american",
    label: "South American Player",
    shortLabel: "South American",
    icon: "\ud83c\udf0e",
    type: "country",
    check: (p) => ["Argentina", "Brazil", "Chile", "Colombia", "Ecuador", "Uruguay", "Venezuela"].includes(p.country)
  },
  {
    id: "european",
    label: "European Player",
    shortLabel: "European",
    icon: "\ud83c\udf0d",
    type: "country",
    check: (p) => ["Spain","France","Germany","Italy","Switzerland","Sweden","United Kingdom","Serbia","Croatia","Czech Republic","Austria","Netherlands","Belgium","Romania","Norway","Denmark","Greece","Bulgaria","Finland","Poland","Latvia","Slovenia","Slovakia","Hungary","Ukraine","Belarus","Moldova","Estonia","Portugal","Bosnia and Herzegovina","Georgia","Turkey"].includes(p.country)
  },
  {
    id: "non_european",
    label: "Non-European Player",
    shortLabel: "Non-European",
    icon: "\ud83c\udf0f",
    type: "country",
    check: (p) => !["Spain","France","Germany","Italy","Switzerland","Sweden","United Kingdom","Serbia","Croatia","Czech Republic","Austria","Netherlands","Belgium","Romania","Norway","Denmark","Greece","Bulgaria","Finland","Poland","Latvia","Slovenia","Slovakia","Hungary","Ukraine","Belarus","Moldova","Estonia","Portugal","Bosnia and Herzegovina","Georgia","Turkey"].includes(p.country)
  }
];

// Get a category by ID
function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id);
}

// Get players matching a category
function getPlayersForCategory(category) {
  return PLAYERS.filter(p => category.check(p));
}

// Get players matching two categories
function getPlayersForIntersection(cat1, cat2) {
  return PLAYERS.filter(p => cat1.check(p) && cat2.check(p));
}

// Check if a player matches a category
function playerMatchesCategory(player, category) {
  return category.check(player);
}
