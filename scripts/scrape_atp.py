#!/usr/bin/env python3
"""
ATP Grid Data Scraper
Downloads ATP match/player/ranking data from JeffSackmann/tennis_atp (GitHub)
and generates js/players.js for the ATP Grid game.

Usage: python3 scripts/scrape_atp.py
"""

import csv
import io
import json
import os
import sys
from collections import defaultdict
from urllib.request import urlopen, Request

REPO_BASE = "https://raw.githubusercontent.com/JeffSackmann/tennis_atp/master"
# TML-Database has 2025+ data in the same CSV schema as Sackmann
TML_BASE = "https://raw.githubusercontent.com/Tennismylife/TML-Database/master"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
OUTPUT_PATH = os.path.join(PROJECT_DIR, "js", "players.js")
CUSTOM_PLAYERS_PATH = os.path.join(SCRIPT_DIR, "custom_players.json")
OVERRIDES_PATH = os.path.join(SCRIPT_DIR, "overrides.json")

# IOC country code -> full country name mapping
IOC_TO_COUNTRY = {
    "USA": "USA", "ESP": "Spain", "SUI": "Switzerland", "SRB": "Serbia",
    "FRA": "France", "GER": "Germany", "AUS": "Australia", "ARG": "Argentina",
    "SWE": "Sweden", "GBR": "United Kingdom", "RUS": "Russia", "ITA": "Italy",
    "CZE": "Czech Republic", "CRO": "Croatia", "CHI": "Chile", "NED": "Netherlands",
    "CAN": "Canada", "AUT": "Austria", "BRA": "Brazil", "BEL": "Belgium",
    "RSA": "South Africa", "JPN": "Japan", "ROU": "Romania", "NZL": "New Zealand",
    "POL": "Poland", "GRE": "Greece", "NOR": "Norway", "DEN": "Denmark",
    "FIN": "Finland", "BUL": "Bulgaria", "GEO": "Georgia", "KAZ": "Kazakhstan",
    "POR": "Portugal", "UKR": "Ukraine", "IND": "India", "MEX": "Mexico",
    "URU": "Uruguay", "KOR": "South Korea", "THA": "Thailand", "CYP": "Cyprus",
    "ZIM": "Zimbabwe", "HUN": "Hungary", "CHN": "China", "BIH": "Bosnia and Herzegovina",
    "LAT": "Latvia", "SLO": "Slovenia", "SVK": "Slovakia", "MDA": "Moldova",
    "BLR": "Belarus", "EST": "Estonia", "ECU": "Ecuador", "COL": "Colombia",
    "DOM": "Dominican Republic", "JAM": "Jamaica", "TPE": "Taiwan", "UZB": "Uzbekistan",
    "TUR": "Turkey", "TUN": "Tunisia", "PAK": "Pakistan", "EGY": "Egypt",
    "HKG": "Hong Kong", "PAR": "Paraguay", "PER": "Peru", "BOL": "Bolivia",
    "VEN": "Venezuela", "CRC": "Costa Rica", "PHI": "Philippines", "INA": "Indonesia",
    "MAS": "Malaysia", "LUX": "Luxembourg", "MON": "Monaco", "ISR": "Israel",
    "LTU": "Lithuania", "MAR": "Morocco", "SEN": "Senegal", "NGR": "Nigeria",
    "BOT": "Botswana", "HAI": "Haiti", "BAR": "Barbados", "BAH": "Bahamas",
    "TTO": "Trinidad and Tobago", "PUR": "Puerto Rico", "VIE": "Vietnam",
    "IRL": "Ireland", "SCG": "Serbia", "YUG": "Serbia", "URS": "Russia",
    "TCH": "Czech Republic", "FRG": "Germany", "RHO": "Zimbabwe",
}

# Grand Slam tournament name patterns -> key
SLAM_PATTERNS = {
    "Australian Open": "ao",
    "Roland Garros": "rg",
    "Wimbledon": "w",
    "Us Open": "uso",
    "US Open": "uso",
}

def download_csv(url):
    """Download a CSV file and return rows as list of dicts."""
    print(f"  Downloading {url.split('/')[-1]}...")
    req = Request(url, headers={"User-Agent": "ATP-Grid-Scraper/1.0"})
    try:
        resp = urlopen(req, timeout=60)
        text = resp.read().decode("utf-8", errors="replace")
        reader = csv.DictReader(io.StringIO(text))
        return list(reader)
    except Exception as e:
        print(f"  WARNING: Failed to download {url}: {e}")
        return []

def main():
    print("=== ATP Grid Data Scraper ===\n")

    # 1. Download player bio data
    print("[1/4] Downloading player bios...")
    players_csv = download_csv(f"{REPO_BASE}/atp_players.csv")
    player_lookup = {}
    for row in players_csv:
        pid = row.get("player_id", "").strip()
        if not pid:
            continue
        height_str = row.get("height", "").strip()
        try:
            height = int(float(height_str)) if height_str else 0
        except (ValueError, TypeError):
            height = 0
        player_lookup[pid] = {
            "name": f"{row.get('name_first', '').strip()} {row.get('name_last', '').strip()}".strip(),
            "ioc": row.get("ioc", "").strip(),
            "hand": row.get("hand", "R").strip() or "R",
            "dob": row.get("dob", "").strip(),
            "height": height,
        }
    print(f"  Loaded {len(player_lookup)} player bios")

    # 2. Download and process match data (1968-2025)
    print("\n[2/4] Downloading match data (this may take a minute)...")
    stats = defaultdict(lambda: {
        "wins": 0,
        "titles": 0,
        "slams": {"ao": 0, "rg": 0, "w": 0, "uso": 0},
        "masters": 0,
        "atp_finals": 0,
        "davis_cup": False,
        "olympic_gold": False,
        "years_active": set(),
        "best_prize_season": 0,
        "clay_wins": 0,
        "hard_wins": 0,
        "grass_wins": 0,
        "total_aces": 0,
        "total_svpt": 0,
        "title_years": [],
    })

    match_years = list(range(1968, 2027))
    for year in match_years:
        rows = download_csv(f"{REPO_BASE}/atp_matches_{year}.csv")
        # For recent years not yet in Sackmann, try TML-Database (same CSV schema)
        if not rows and year >= 2025:
            print(f"  Trying TML-Database for {year}...")
            rows = download_csv(f"{TML_BASE}/{year}.csv")
        if not rows:
            continue

        for row in rows:
            wid = row.get("winner_id", "").strip()
            if not wid:
                continue

            # Auto-create player bio entries from match data if not in Sackmann's player list
            if wid not in player_lookup:
                w_name = f"{row.get('winner_name', '').strip()}" if 'winner_name' in row else ""
                # Some CSVs have first/last separate
                if not w_name:
                    w_name = f"{row.get('winner_first', '').strip()} {row.get('winner_last', '').strip()}".strip()
                if w_name:
                    player_lookup[wid] = {
                        "name": w_name,
                        "ioc": row.get("winner_ioc", "").strip(),
                        "hand": row.get("winner_hand", "R").strip() or "R",
                        "dob": "",
                    }

            lid = row.get("loser_id", "").strip()
            if lid and lid not in player_lookup:
                l_name = f"{row.get('loser_name', '').strip()}" if 'loser_name' in row else ""
                if not l_name:
                    l_name = f"{row.get('loser_first', '').strip()} {row.get('loser_last', '').strip()}".strip()
                if l_name:
                    player_lookup[lid] = {
                        "name": l_name,
                        "ioc": row.get("loser_ioc", "").strip(),
                        "hand": row.get("loser_hand", "R").strip() or "R",
                        "dob": "",
                    }

            tourney_level = row.get("tourney_level", "").strip()
            tourney_name = row.get("tourney_name", "").strip()
            rnd = row.get("round", "").strip()
            surface = row.get("surface", "").strip()

            # Count win
            stats[wid]["wins"] += 1
            stats[wid]["years_active"].add(year)

            # Surface wins
            if surface == "Clay":
                stats[wid]["clay_wins"] += 1
            elif surface == "Hard":
                stats[wid]["hard_wins"] += 1
            elif surface == "Grass":
                stats[wid]["grass_wins"] += 1

            # Serve stats (available ~1991+)
            try:
                aces = int(row.get("w_ace", "") or 0)
                svpt = int(row.get("w_svpt", "") or 0)
                if svpt > 0:
                    stats[wid]["total_aces"] += aces
                    stats[wid]["total_svpt"] += svpt
            except (ValueError, TypeError):
                pass

            # Also track loser's active years
            if lid:
                stats[lid]["years_active"].add(year)

            # Title = won the final
            if rnd == "F":
                stats[wid]["titles"] += 1
                stats[wid]["title_years"].append(year)

                # Grand Slam finals
                if tourney_level == "G":
                    for pattern, key in SLAM_PATTERNS.items():
                        if pattern.lower() in tourney_name.lower():
                            stats[wid]["slams"][key] += 1
                            break

                # Masters 1000
                if tourney_level == "M":
                    stats[wid]["masters"] += 1

                # ATP Finals / Tour Finals
                if tourney_level == "F":
                    stats[wid]["atp_finals"] += 1

                # Davis Cup
                if tourney_level == "D":
                    stats[wid]["davis_cup"] = True

            # Olympics (tourney_level can vary - check tourney_name)
            if "Olympic" in tourney_name or "Olympics" in tourney_name:
                if rnd == "F":
                    stats[wid]["olympic_gold"] = True

    print(f"  Processed matches for {len(stats)} players")

    # 3. Download and process ranking data
    print("\n[3/4] Downloading ranking data...")
    peak_rankings = {}  # pid -> min rank
    weeks_at_no1 = defaultdict(int)  # pid -> count
    year_end_no1 = set()  # set of pids

    # Download ranking files for multiple years
    ranking_files = [f"atp_rankings_{decade}s.csv" for decade in ["70", "80", "90", "00", "10", "20"]]
    ranking_files.append("atp_rankings_current.csv")

    for fname in ranking_files:
        rows = download_csv(f"{REPO_BASE}/{fname}")
        for row in rows:
            pid = row.get("player", "").strip()
            rank_str = row.get("rank", "").strip()
            date_str = row.get("ranking_date", "").strip()
            if not pid or not rank_str:
                continue
            try:
                rank = int(rank_str)
            except ValueError:
                continue

            # Peak ranking
            if pid not in peak_rankings or rank < peak_rankings[pid]:
                peak_rankings[pid] = rank

            # Weeks at #1
            if rank == 1:
                weeks_at_no1[pid] += 1

            # Year-end #1 (last ranking of each year, roughly late December)
            if date_str and rank == 1:
                try:
                    month = int(date_str[4:6]) if len(date_str) >= 6 else 0
                    if month >= 11:  # Nov/Dec rankings
                        year_end_no1.add(pid)
                except (ValueError, IndexError):
                    pass

    print(f"  Loaded rankings for {len(peak_rankings)} players")
    print(f"  Found {len(weeks_at_no1)} players who reached #1")
    print(f"  Found {len(year_end_no1)} year-end #1s")

    # 4. Build player objects
    print("\n[4/4] Building player database...")

    # Determine which players to include:
    # - Anyone with a peak ranking in top 500, OR
    # - Anyone with at least 1 title, OR
    # - Anyone with 50+ career wins, OR
    # - Anyone who reached top 200 in rankings
    included_pids = set()
    for pid, s in stats.items():
        if s["titles"] > 0 or s["wins"] >= 50:
            included_pids.add(pid)
    for pid, rank in peak_rankings.items():
        if rank <= 500:
            included_pids.add(pid)

    # Build the output
    player_data = []
    for pid in included_pids:
        bio = player_lookup.get(pid)
        if not bio or not bio["name"] or bio["name"].strip() == "":
            continue

        s = stats.get(pid, {
            "wins": 0, "titles": 0,
            "slams": {"ao": 0, "rg": 0, "w": 0, "uso": 0},
            "masters": 0, "atp_finals": 0,
            "davis_cup": False, "olympic_gold": False,
            "years_active": set(), "best_prize_season": 0,
            "clay_wins": 0, "hard_wins": 0, "grass_wins": 0,
            "total_aces": 0, "total_svpt": 0, "title_years": [],
        })

        country = IOC_TO_COUNTRY.get(bio["ioc"], bio["ioc"])
        hand = bio["hand"] if bio["hand"] in ("R", "L") else "R"
        peak = peak_rankings.get(pid, 9999)

        # Compute decades active
        years = s["years_active"]
        decades = sorted(set((y // 10) * 10 for y in years)) if years else []

        # Compute active status (match in 2024, 2025, or 2026)
        active = bool(years & {2024, 2025, 2026})

        # Compute flags bitmask
        flags = 0
        if pid in year_end_no1:
            flags |= 1
        if s["olympic_gold"]:
            flags |= 2
        if s["davis_cup"]:
            flags |= 4
        if s["atp_finals"] > 0:
            flags |= 8
        if active:
            flags |= 16

        # Extended attributes
        ext = {}
        if s["masters"] > 0:
            ext["m1000"] = s["masters"]
        if weeks_at_no1.get(pid, 0) > 0:
            ext["wks1"] = weeks_at_no1[pid]

        # Height
        height = bio.get("height", 0)
        if height > 0:
            ext["ht"] = height

        # Surface wins
        if s["clay_wins"] > 0:
            ext["cw"] = s["clay_wins"]
        if s["hard_wins"] > 0:
            ext["hw"] = s["hard_wins"]
        if s["grass_wins"] > 0:
            ext["gw"] = s["grass_wins"]

        # Ace rate (min 500 service points to avoid noise)
        if s["total_svpt"] >= 500:
            ace_rate = round(s["total_aces"] / s["total_svpt"] * 100, 1)
            if ace_rate > 0:
                ext["ar"] = ace_rate

        # Age-based stats
        dob = bio.get("dob", "")
        birth_year = 0
        if dob and len(dob) >= 4:
            try:
                birth_year = int(dob[:4])
            except ValueError:
                pass

        if birth_year > 0 and s["title_years"]:
            age_first_title = min(s["title_years"]) - birth_year
            age_last_title = max(s["title_years"]) - birth_year
            if age_first_title > 0:
                ext["aft"] = age_first_title
            if age_last_title > 0:
                ext["alt"] = age_last_title

        if years:
            career_length = max(years) - min(years) + 1
            if career_length > 1:
                ext["cl"] = career_length

        player_entry = [
            bio["name"],
            country,
            s["slams"],
            s["titles"],
            s["wins"],
            s.get("best_prize_season", 0),
            flags,
            hand,
            decades,
            peak,
        ]
        if ext:
            player_entry.append(ext)

        player_data.append(player_entry)

    # Deduplicate by name: merge stats from players with different IDs (e.g. Sackmann vs TML)
    name_to_best = {}
    for p in player_data:
        name = p[0]
        if name in name_to_best:
            existing = name_to_best[name]
            # Merge: take max of numeric stats, combine decades, OR flags
            existing[2] = {k: max(existing[2].get(k, 0), p[2].get(k, 0)) for k in ("ao", "rg", "w", "uso")}
            existing[3] = max(existing[3], p[3])  # titles
            existing[4] = max(existing[4], p[4])  # wins (take max to avoid double-counting)
            existing[5] = max(existing[5], p[5])  # prize
            existing[6] |= p[6]                   # flags: OR together
            # Merge decades
            existing_decades = set(existing[8])
            existing_decades.update(p[8])
            existing[8] = sorted(existing_decades)
            # Take best (lowest) peak ranking
            existing[9] = min(existing[9], p[9])
            # Merge extended attributes
            if len(existing) > 10 and len(p) > 10 and p[10]:
                for k, v in p[10].items():
                    if k == "aft":  # age at first title: take min
                        existing[10][k] = min(existing[10].get(k, v), v)
                    else:
                        existing[10][k] = max(existing[10].get(k, 0), v)
            elif len(p) > 10 and p[10]:
                if len(existing) <= 10:
                    existing.append(p[10])
                else:
                    existing[10] = p[10]
        else:
            name_to_best[name] = p

    player_data = list(name_to_best.values())
    print(f"  After name-based dedup: {len(player_data)} unique players")

    # Apply manual overrides
    overrides = {}
    if os.path.exists(OVERRIDES_PATH):
        with open(OVERRIDES_PATH, "r") as f:
            overrides = json.load(f)

    davis_cup_names = set(overrides.get("davis_cup_winners", []))
    olympic_gold_names = set(overrides.get("olympic_gold_winners", []))
    slam_corrections = overrides.get("slam_corrections", {})

    overrides_applied = {"davis": 0, "olympic": 0, "slam": 0}
    for p in player_data:
        name = p[0]
        flags = p[6]

        # Davis Cup override
        if name in davis_cup_names:
            flags |= 4
            overrides_applied["davis"] += 1

        # Olympic gold override
        if name in olympic_gold_names:
            flags |= 2
            overrides_applied["olympic"] += 1

        # Slam corrections (for 2025 data not yet in dataset)
        if name in slam_corrections:
            p[2] = slam_corrections[name]
            overrides_applied["slam"] += 1

        p[6] = flags

    print(f"  Applied overrides: {overrides_applied}")

    # Sort by peak ranking (best first), then by name
    player_data.sort(key=lambda p: (p[9] if p[9] else 9999, p[0]))

    # Load and merge custom players
    custom_players = []
    if os.path.exists(CUSTOM_PLAYERS_PATH):
        with open(CUSTOM_PLAYERS_PATH, "r") as f:
            custom_list = json.load(f)
        for cp in custom_list:
            country = IOC_TO_COUNTRY.get(cp.get("country", ""), cp.get("country", ""))
            flags = 16 if cp.get("active", False) else 0
            entry = [
                cp["name"],
                country,
                {"ao": 0, "rg": 0, "w": 0, "uso": 0},
                0,  # titles
                0,  # wins
                0,  # prize money
                flags,
                cp.get("hand", "R"),
                cp.get("decades", [2020]),
                cp.get("peakRanking", 9999),
            ]
            custom_players.append(entry)
        print(f"  Merged {len(custom_players)} custom players")

    all_players = player_data + custom_players

    print(f"\n  Total players: {len(all_players)}")
    print(f"  With titles: {sum(1 for p in all_players if p[3] > 0)}")
    print(f"  Grand Slam winners: {sum(1 for p in all_players if sum(p[2].values()) > 0)}")
    print(f"  Active: {sum(1 for p in all_players if p[6] & 16)}")

    # 5. Generate JS output
    print("\n  Writing js/players.js...")
    generate_js(all_players)
    print(f"\n=== Done! {len(all_players)} players written to {OUTPUT_PATH} ===")


def generate_js(player_data):
    """Generate the players.js file from processed data."""

    lines = []
    lines.append("// ATP Player Database - Auto-generated by scrape_atp.py")
    lines.append("// Source: github.com/JeffSackmann/tennis_atp (Creative Commons)")
    lines.append(f"// Generated: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(f"// Total players: {len(player_data)}")
    lines.append("//")
    lines.append("// Compact format: [name, country, {ao,rg,w,uso}, titles, careerWins, bestPrizeSeason$, flags, hand, decades[], peakRanking, ext?]")
    lines.append("// flags bitmask: 1=yearEndNo1, 2=olympicGold, 4=davisCup, 8=atpFinals, 16=active")
    lines.append("// ext keys: m1000=masters titles, wks1=weeks at #1, ht=height(cm), cw=clay wins, hw=hard wins, gw=grass wins, ar=ace rate, aft=age first title, alt=age last title, cl=career length")
    lines.append("")
    lines.append("const PLAYER_DATA = [")

    for p in player_data:
        name = p[0].replace('"', '\\"')
        country = p[1].replace('"', '\\"')
        slams = p[2]
        titles = p[3]
        wins = p[4]
        prize = p[5]
        flags = p[6]
        hand = p[7]
        decades = p[8]
        peak = p[9]

        slam_str = f"{{ao:{slams['ao']},rg:{slams['rg']},w:{slams['w']},uso:{slams['uso']}}}"
        decades_str = "[" + ",".join(str(d) for d in decades) + "]"

        entry = f'  ["{name}","{country}",{slam_str},{titles},{wins},{prize},{flags},"{hand}",{decades_str},{peak}'

        # Add extended attributes if present
        if len(p) > 10 and p[10]:
            ext = p[10]
            ext_parts = []
            for k, v in ext.items():
                ext_parts.append(f"{k}:{v}")
            entry += ",{" + ",".join(ext_parts) + "}"

        entry += "],"
        lines.append(entry)

    lines.append("];")
    lines.append("")

    # Add the parser and helper functions (same as original)
    lines.append("""
// Filter out duplicates and invalid entries
const validPlayerData = PLAYER_DATA.filter(p =>
  p[0] && p[1] && p[8] && p[8].length > 0
);

// Remove exact duplicate names
const seenNames = new Set();
const uniquePlayerData = validPlayerData.filter(p => {
  const name = p[0];
  if (seenNames.has(name)) return false;
  seenNames.add(name);
  return true;
});

// Parse compact data into full player objects
const PLAYERS = uniquePlayerData.map((p, idx) => {
  const flags = p[6];
  const ext = p[10] || {};
  return {
    id: p[0].toLowerCase().replace(/[^a-z0-9]/g, '_'),
    name: p[0],
    country: p[1],
    grandSlams: p[2],
    titles: p[3],
    careerWins: p[4],
    bestPrizeMoneySeason: p[5],
    yearEndNo1: !!(flags & 1),
    olympicSinglesGold: !!(flags & 2),
    davisCup: !!(flags & 4),
    atpFinals: !!(flags & 8),
    active: !!(flags & 16),
    hand: p[7],
    decades: p[8],
    peakRanking: p[9],
    masters1000: ext.m1000 || 0,
    weeksAtNo1: ext.wks1 || 0,
    heightCm: ext.ht || 0,
    clayWins: ext.cw || 0,
    hardWins: ext.hw || 0,
    grassWins: ext.gw || 0,
    aceRate: ext.ar || 0,
    ageFirstTitle: ext.aft || 0,
    ageLastTitle: ext.alt || 0,
    careerLength: ext.cl || 0,
    photoUrl: getPlayerPhotoUrl(p[0])
  };
});

// Player photo URL
function getPlayerPhotoUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=120&background=2d6a4f&color=fff&bold=true&format=svg`;
}

// Helper to get country flag emoji
function getCountryFlag(country) {
  const flags = {
    "USA": "\\ud83c\\uddfa\\ud83c\\uddf8", "Spain": "\\ud83c\\uddea\\ud83c\\uddf8", "Switzerland": "\\ud83c\\udde8\\ud83c\\udded",
    "Serbia": "\\ud83c\\uddf7\\ud83c\\uddf8", "United Kingdom": "\\ud83c\\uddec\\ud83c\\udde7", "France": "\\ud83c\\uddeb\\ud83c\\uddf7",
    "Germany": "\\ud83c\\udde9\\ud83c\\uddea", "Australia": "\\ud83c\\udde6\\ud83c\\uddfa", "Argentina": "\\ud83c\\udde6\\ud83c\\uddf7",
    "Sweden": "\\ud83c\\uddf8\\ud83c\\uddea", "Russia": "\\ud83c\\uddf7\\ud83c\\uddfa", "Czech Republic": "\\ud83c\\udde8\\ud83c\\uddff",
    "Croatia": "\\ud83c\\udded\\ud83c\\uddf7", "Austria": "\\ud83c\\udde6\\ud83c\\uddf9", "Italy": "\\ud83c\\uddee\\ud83c\\uddf9",
    "Chile": "\\ud83c\\udde8\\ud83c\\uddf1", "Brazil": "\\ud83c\\udde7\\ud83c\\uddf7", "Netherlands": "\\ud83c\\uddf3\\ud83c\\uddf1",
    "Japan": "\\ud83c\\uddef\\ud83c\\uddf5", "Canada": "\\ud83c\\udde8\\ud83c\\udde6", "Greece": "\\ud83c\\uddec\\ud83c\\uddf7",
    "Norway": "\\ud83c\\uddf3\\ud83c\\uddf4", "Poland": "\\ud83c\\uddf5\\ud83c\\uddf1", "Bulgaria": "\\ud83c\\udde7\\ud83c\\uddec",
    "Belgium": "\\ud83c\\udde7\\ud83c\\uddea", "South Africa": "\\ud83c\\uddff\\ud83c\\udde6", "Romania": "\\ud83c\\uddf7\\ud83c\\uddf4",
    "Ecuador": "\\ud83c\\uddea\\ud83c\\udde8", "Latvia": "\\ud83c\\uddf1\\ud83c\\uddfb", "Denmark": "\\ud83c\\udde9\\ud83c\\uddf0",
    "Finland": "\\ud83c\\uddeb\\ud83c\\uddee", "Georgia": "\\ud83c\\uddec\\ud83c\\uddea", "Kazakhstan": "\\ud83c\\uddf0\\ud83c\\uddff",
    "Portugal": "\\ud83c\\uddf5\\ud83c\\uddf9", "Ukraine": "\\ud83c\\uddfa\\ud83c\\udde6", "India": "\\ud83c\\uddee\\ud83c\\uddf3",
    "Mexico": "\\ud83c\\uddf2\\ud83c\\uddfd", "Uruguay": "\\ud83c\\uddfa\\ud83c\\uddfe", "South Korea": "\\ud83c\\uddf0\\ud83c\\uddf7",
    "Thailand": "\\ud83c\\uddf9\\ud83c\\udded", "Cyprus": "\\ud83c\\udde8\\ud83c\\uddfe", "Zimbabwe": "\\ud83c\\uddff\\ud83c\\uddfc",
    "Hungary": "\\ud83c\\udded\\ud83c\\uddfa", "China": "\\ud83c\\udde8\\ud83c\\uddf3",
    "Bosnia and Herzegovina": "\\ud83c\\udde7\\ud83c\\udde6",
    "New Zealand": "\\ud83c\\uddf3\\ud83c\\uddff", "Hong Kong": "\\ud83c\\udded\\ud83c\\uddf0",
    "Tunisia": "\\ud83c\\uddf9\\ud83c\\uddf3", "Colombia": "\\ud83c\\udde8\\ud83c\\uddf4",
    "Dominican Republic": "\\ud83c\\udde9\\ud83c\\uddf4", "Jamaica": "\\ud83c\\uddef\\ud83c\\uddf2",
    "Taiwan": "\\ud83c\\uddf9\\ud83c\\uddfc", "Uzbekistan": "\\ud83c\\uddfa\\ud83c\\uddff",
    "Slovenia": "\\ud83c\\uddf8\\ud83c\\uddee", "Slovakia": "\\ud83c\\uddf8\\ud83c\\uddf0",
    "Moldova": "\\ud83c\\uddf2\\ud83c\\udde9", "Belarus": "\\ud83c\\udde7\\ud83c\\uddfe",
    "Morocco": "\\ud83c\\uddf2\\ud83c\\udde6", "Israel": "\\ud83c\\uddee\\ud83c\\uddf1",
    "Turkey": "\\ud83c\\uddf9\\ud83c\\uddf7", "Ireland": "\\ud83c\\uddee\\ud83c\\uddea",
    "Luxembourg": "\\ud83c\\uddf1\\ud83c\\uddfa", "Monaco": "\\ud83c\\uddf2\\ud83c\\udde8",
    "Lithuania": "\\ud83c\\uddf1\\ud83c\\uddf9", "Estonia": "\\ud83c\\uddea\\ud83c\\uddea",
    "Peru": "\\ud83c\\uddf5\\ud83c\\uddea", "Venezuela": "\\ud83c\\uddfb\\ud83c\\uddea",
    "Paraguay": "\\ud83c\\uddf5\\ud83c\\uddfe", "Bolivia": "\\ud83c\\udde7\\ud83c\\uddf4",
    "Puerto Rico": "\\ud83c\\uddf5\\ud83c\\uddf7", "Pakistan": "\\ud83c\\uddf5\\ud83c\\uddf0",
    "Egypt": "\\ud83c\\uddea\\ud83c\\uddec",
  };
  return flags[country] || "\\ud83c\\udff3\\ufe0f";
}
""")

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


if __name__ == "__main__":
    main()
