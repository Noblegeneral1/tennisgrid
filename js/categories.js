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
    id: "new_zealand",
    label: "New Zealander",
    shortLabel: "New Zealand",
    type: "country",
    check: (p) => p.country === "New Zealand"
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
    shortLabel: "0 Career Titles",
    icon: "\ud83d\ude45",
    type: "stat",
    check: (p) => p.titles === 0
  },
  {
    id: "titles_20plus",
    label: "Won 20+ Career Titles",
    shortLabel: "20+ Career Titles",
    icon: "\ud83c\udfc5",
    type: "stat",
    check: (p) => p.titles >= 20
  },
  {
    id: "titles_10plus",
    label: "Won 10+ Career Titles",
    shortLabel: "10+ Career Titles",
    icon: "\ud83c\udfc5",
    type: "stat",
    check: (p) => p.titles >= 10
  },
  {
    id: "titles_5plus",
    label: "Won 5+ Career Titles",
    shortLabel: "5+ Career Titles",
    icon: "\ud83c\udfc5",
    type: "stat",
    check: (p) => p.titles >= 5
  },
  {
    id: "wins_500plus",
    label: "500+ Career Match Wins",
    shortLabel: "500+ Career Wins",
    icon: "\u2705",
    type: "stat",
    check: (p) => p.careerWins >= 500
  },
  {
    id: "wins_300plus",
    label: "300+ Career Match Wins",
    shortLabel: "300+ Career Wins",
    icon: "\u2705",
    type: "stat",
    check: (p) => p.careerWins >= 300
  },
  {
    id: "prize_10m",
    label: "$10M+ Prize Money in One Season",
    shortLabel: "$10M+ in 1 Season",
    icon: "\ud83d\udcb0",
    type: "stat",
    check: (p) => p.bestPrizeMoneySeason >= 10000000
  },
  {
    id: "prize_5m",
    label: "$5M+ Prize Money in One Season",
    shortLabel: "$5M+ in 1 Season",
    icon: "\ud83d\udcb0",
    type: "stat",
    check: (p) => p.bestPrizeMoneySeason >= 5000000
  },
  {
    id: "prize_1m",
    label: "$1M+ Prize Money in One Season",
    shortLabel: "$1M+ in 1 Season",
    icon: "\ud83d\udcb0",
    type: "stat",
    check: (p) => p.bestPrizeMoneySeason >= 1000000
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
    shortLabel: "Career High Top 3",
    icon: "\ud83d\udcca",
    type: "achievement",
    check: (p) => p.peakRanking <= 3
  },
  {
    id: "peaked_top5",
    label: "Career-High Top 5",
    shortLabel: "Career High Top 5",
    icon: "\ud83d\udcca",
    type: "achievement",
    check: (p) => p.peakRanking <= 5
  },
  {
    id: "peaked_top10",
    label: "Career-High Top 10",
    shortLabel: "Career High Top 10",
    icon: "\ud83d\udcca",
    type: "achievement",
    check: (p) => p.peakRanking <= 10
  },
  {
    id: "peaked_top20",
    label: "Career-High Top 20",
    shortLabel: "Career High Top 20",
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
    shortLabel: "Career High Below 50",
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
    check: (p) => ["Spain","France","Germany","Italy","Switzerland","Sweden","United Kingdom","Serbia","Croatia","Czech Republic","Austria","Netherlands","Belgium","Romania","Norway","Denmark","Greece","Bulgaria","Finland","Poland","Latvia","Slovenia","Slovakia","Hungary","Ukraine","Belarus","Moldova","Estonia","Portugal","Bosnia and Herzegovina","Georgia","Turkey","Russia","Lithuania","Luxembourg","Monaco","Ireland","Cyprus"].includes(p.country)
  },
  {
    id: "non_european",
    label: "Non-European Player",
    shortLabel: "Non-European",
    icon: "\ud83c\udf0f",
    type: "country",
    check: (p) => !["Spain","France","Germany","Italy","Switzerland","Sweden","United Kingdom","Serbia","Croatia","Czech Republic","Austria","Netherlands","Belgium","Romania","Norway","Denmark","Greece","Bulgaria","Finland","Poland","Latvia","Slovenia","Slovakia","Hungary","Ukraine","Belarus","Moldova","Estonia","Portugal","Bosnia and Herzegovina","Georgia","Turkey","Russia","Lithuania","Luxembourg","Monaco","Ireland","Cyprus"].includes(p.country)
  },

  // ===== ELITE CATEGORIES (derived from scrapable data) =====
  {
    id: "career_grand_slam",
    label: "Career Grand Slam (Won All 4)",
    shortLabel: "Career Slam",
    type: "achievement",
    check: (p) => p.grandSlams.ao > 0 && p.grandSlams.rg > 0 && p.grandSlams.w > 0 && p.grandSlams.uso > 0
  },
  {
    id: "masters_1000_champ",
    label: "Won a Masters 1000 Title",
    shortLabel: "Won a Masters 1000",
    type: "achievement",
    check: (p) => p.masters1000 > 0
  },
  {
    id: "masters_5plus",
    label: "5+ Masters 1000 Titles",
    shortLabel: "5+ Masters 1000s",
    type: "achievement",
    check: (p) => p.masters1000 >= 5
  },
  {
    id: "masters_10plus",
    label: "10+ Masters 1000 Titles",
    shortLabel: "10+ Masters 1000s",
    type: "achievement",
    check: (p) => p.masters1000 >= 10
  },
  {
    id: "weeks_no1_100",
    label: "100+ Weeks at World #1",
    shortLabel: "100+ Wks at #1",
    type: "achievement",
    check: (p) => p.weeksAtNo1 >= 100
  },

  // ===== FUN UNDERDOG / "LESS GOOD" CATEGORIES =====
  {
    id: "sub_100_wins",
    label: "Fewer Than 100 Career Wins",
    shortLabel: "< 100 Career Wins",
    type: "stat",
    check: (p) => p.careerWins > 0 && p.careerWins < 100
  },
  {
    id: "sub_50_wins",
    label: "Fewer Than 50 Career Wins",
    shortLabel: "< 50 Career Wins",
    type: "stat",
    check: (p) => p.careerWins > 0 && p.careerWins < 50
  },
  {
    id: "one_title_wonder",
    label: "Exactly One Career Title",
    shortLabel: "Only 1 Career Title",
    type: "stat",
    check: (p) => p.titles === 1
  },
  {
    id: "no_masters",
    label: "Never Won a Masters 1000",
    shortLabel: "No Masters 1000 Title",
    type: "stat",
    check: (p) => p.masters1000 === 0
  },
  {
    id: "no_slam_no_masters",
    label: "No Slam and No Masters Title",
    shortLabel: "No Slam/M1000",
    type: "stat",
    check: (p) => (p.grandSlams.ao + p.grandSlams.rg + p.grandSlams.w + p.grandSlams.uso) === 0 && p.masters1000 === 0
  },

  // ===== HEIGHT / SURFACE / AGE / CAREER STATS =====
  { id: "tall_player", label: "Over 6'4\" (193cm+)", shortLabel: "Over 6'4\"", type: "stat", icon: "ruler", check: p => p.heightCm >= 193 },
  { id: "short_player", label: "Under 5'10\" (178cm)", shortLabel: "Under 5'10\"", type: "stat", icon: "ruler", check: p => p.heightCm > 0 && p.heightCm < 178 },
  { id: "clay_100_wins", label: "100+ Wins on Clay", shortLabel: "100+ Clay Wins", type: "stat", icon: "flame", check: p => p.clayWins >= 100 },
  { id: "hard_100_wins", label: "100+ Wins on Hard", shortLabel: "100+ Hard Wins", type: "stat", icon: "flame", check: p => p.hardWins >= 100 },
  { id: "grass_50_wins", label: "50+ Wins on Grass", shortLabel: "50+ Grass Wins", type: "stat", icon: "flame", check: p => p.grassWins >= 50 },
  { id: "clay_200_wins", label: "200+ Wins on Clay", shortLabel: "200+ Clay Wins", type: "stat", icon: "flame", check: p => p.clayWins >= 200 },
  { id: "young_first_title", label: "Won First Title Before 21", shortLabel: "Won ATP Title Before 21", type: "stat", icon: "clock", check: p => p.ageFirstTitle > 0 && p.ageFirstTitle < 21 },
  { id: "title_after_30", label: "Won a Title After 30", shortLabel: "Won ATP Title After 30", type: "stat", icon: "clock", check: p => p.ageLastTitle >= 30 },
  { id: "long_career", label: "15+ Year Career", shortLabel: "15+ Year Career", type: "stat", icon: "clock", check: p => p.careerLength >= 15 },
  { id: "big_server", label: "Big Server (10%+ Ace Rate)", shortLabel: "10%+ Ace Rate", type: "stat", icon: "zap", check: p => p.aceRate >= 10 },

  // ===== BROADER STAT CATEGORIES =====
  { id: "titles_1plus", label: "Won At Least 1 Title", shortLabel: "1+ Career Title", type: "stat", check: p => p.titles >= 1 },
  { id: "titles_3plus", label: "Won 3+ Career Titles", shortLabel: "3+ Career Titles", type: "stat", check: p => p.titles >= 3 },
  { id: "wins_100plus", label: "100+ Career Match Wins", shortLabel: "100+ Career Wins", type: "stat", check: p => p.careerWins >= 100 },
  { id: "wins_200plus", label: "200+ Career Match Wins", shortLabel: "200+ Career Wins", type: "stat", check: p => p.careerWins >= 200 },
  { id: "peaked_top50", label: "Career-High Top 50", shortLabel: "Career High Top 50", type: "stat", check: p => p.peakRanking <= 50 },
  { id: "peaked_top100", label: "Career-High Top 100", shortLabel: "Career High Top 100", type: "stat", check: p => p.peakRanking <= 100 },
  { id: "clay_50_wins", label: "50+ Wins on Clay", shortLabel: "50+ Clay Wins", type: "stat", check: p => p.clayWins >= 50 },
  { id: "hard_50_wins", label: "50+ Wins on Hard", shortLabel: "50+ Hard Wins", type: "stat", check: p => p.hardWins >= 50 },
  { id: "hard_200_wins", label: "200+ Wins on Hard", shortLabel: "200+ Hard Wins", type: "stat", check: p => p.hardWins >= 200 },
  { id: "grass_20_wins", label: "20+ Wins on Grass", shortLabel: "20+ Grass Wins", type: "stat", check: p => p.grassWins >= 20 },
  { id: "career_10plus", label: "10+ Year Career", shortLabel: "10+ Year Career", type: "stat", check: p => p.careerLength >= 10 },
  { id: "career_20plus", label: "20+ Year Career", shortLabel: "20+ Year Career", type: "stat", check: p => p.careerLength >= 20 },
  { id: "first_title_before_23", label: "Won First Title Before 23", shortLabel: "1st Title Before 23", type: "stat", check: p => p.ageFirstTitle > 0 && p.ageFirstTitle < 23 },
  { id: "title_after_28", label: "Won a Title After 28", shortLabel: "Title After 28", type: "stat", check: p => p.ageLastTitle >= 28 },
  { id: "ace_rate_5plus", label: "5%+ Ace Rate", shortLabel: "5%+ Ace Rate", type: "stat", check: p => p.aceRate >= 5 },
  { id: "ace_rate_15plus", label: "15%+ Ace Rate", shortLabel: "15%+ Ace Rate", type: "stat", check: p => p.aceRate >= 15 },

  // ===== HEIGHT / PHYSICAL =====
  { id: "height_190plus", label: "190cm+ (6'3\"+)", shortLabel: "6'3\"+ Tall", type: "stat", check: p => p.heightCm >= 190 },
  { id: "height_185plus", label: "185cm+ (6'1\"+)", shortLabel: "6'1\"+ Tall", type: "stat", check: p => p.heightCm >= 185 },
  { id: "height_under_183", label: "Under 183cm (6'0\")", shortLabel: "Under 6'0\"", type: "stat", check: p => p.heightCm > 0 && p.heightCm < 183 },
  { id: "height_under_175", label: "Under 175cm (5'9\")", shortLabel: "Under 5'9\"", type: "stat", check: p => p.heightCm > 0 && p.heightCm < 175 },

  // ===== MORE COUNTRIES =====
  { id: "india", label: "Indian", shortLabel: "India", type: "country", check: p => p.country === "India" },
  { id: "greece", label: "Greek", shortLabel: "Greece", type: "country", check: p => p.country === "Greece" },
  { id: "norway", label: "Norwegian", shortLabel: "Norway", type: "country", check: p => p.country === "Norway" },
  { id: "denmark", label: "Danish", shortLabel: "Denmark", type: "country", check: p => p.country === "Denmark" },
  { id: "colombia", label: "Colombian", shortLabel: "Colombia", type: "country", check: p => p.country === "Colombia" },
  { id: "ukraine", label: "Ukrainian", shortLabel: "Ukraine", type: "country", check: p => p.country === "Ukraine" },
  { id: "portugal", label: "Portuguese", shortLabel: "Portugal", type: "country", check: p => p.country === "Portugal" },
  { id: "georgia", label: "Georgian", shortLabel: "Georgia", type: "country", check: p => p.country === "Georgia" },
  { id: "bulgaria", label: "Bulgarian", shortLabel: "Bulgaria", type: "country", check: p => p.country === "Bulgaria" },
  { id: "hungary", label: "Hungarian", shortLabel: "Hungary", type: "country", check: p => p.country === "Hungary" },
  { id: "finland", label: "Finnish", shortLabel: "Finland", type: "country", check: p => p.country === "Finland" },
  { id: "israel", label: "Israeli", shortLabel: "Israel", type: "country", check: p => p.country === "Israel" },
  { id: "chinese_taipei", label: "Chinese Taipei", shortLabel: "Chinese Taipei", type: "country", check: p => p.country === "Chinese Taipei" },
  { id: "korea", label: "South Korean", shortLabel: "South Korea", type: "country", check: p => p.country === "South Korea" },
  { id: "ecuador", label: "Ecuadorian", shortLabel: "Ecuador", type: "country", check: p => p.country === "Ecuador" },
  { id: "slovakia", label: "Slovak", shortLabel: "Slovakia", type: "country", check: p => p.country === "Slovakia" },
  { id: "slovenia", label: "Slovenian", shortLabel: "Slovenia", type: "country", check: p => p.country === "Slovenia" },
  { id: "kazakhstan", label: "Kazakhstani", shortLabel: "Kazakhstan", type: "country", check: p => p.country === "Kazakhstan" },
  { id: "uzbekistan", label: "Uzbekistani", shortLabel: "Uzbekistan", type: "country", check: p => p.country === "Uzbekistan" },

  // ===== BROADER REGIONS =====
  { id: "asian", label: "Asian Player", shortLabel: "Asian", type: "country", check: p => ["Japan", "South Korea", "India", "Chinese Taipei", "Thailand", "Philippines", "Kazakhstan", "Uzbekistan", "China"].includes(p.country) },
  { id: "african", label: "African Player", shortLabel: "African", type: "country", check: p => ["South Africa", "Morocco", "Tunisia", "Egypt", "Zimbabwe"].includes(p.country) },
  { id: "north_american", label: "North American Player", shortLabel: "North American", type: "country", check: p => ["USA", "Canada", "Mexico"].includes(p.country) },
  { id: "oceanian", label: "Oceanian Player", shortLabel: "Oceanian", type: "country", check: p => ["Australia", "New Zealand"].includes(p.country) },
  { id: "slavic", label: "Slavic Nation Player", shortLabel: "Slavic Nation", type: "country", check: p => ["Serbia", "Croatia", "Czech Republic", "Slovakia", "Slovenia", "Poland", "Russia", "Bulgaria", "Ukraine", "Belarus", "Bosnia and Herzegovina"].includes(p.country) },
  { id: "scandinavian", label: "Scandinavian Player", shortLabel: "Scandinavian", type: "country", check: p => ["Sweden", "Norway", "Denmark", "Finland"].includes(p.country) },
  { id: "latin_american", label: "Latin American Player", shortLabel: "Latin American", type: "country", check: p => ["Argentina", "Brazil", "Chile", "Colombia", "Ecuador", "Uruguay", "Venezuela", "Mexico", "Peru", "Dominican Republic", "Bolivia"].includes(p.country) },
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
