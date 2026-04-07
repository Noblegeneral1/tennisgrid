// ATP Grid - Main Application Logic

(function() {
  'use strict';

  // ===== STATE =====
  let grid = null;
  let selectedCell = null;
  let strikes = 0;
  const MAX_STRIKES = 3;
  let gameMode = localStorage.getItem('atpgrid_mode') || 'hard';
  let answers = {}; // { "r0c1": playerId }
  let usedPlayers = new Set();
  let gameOver = false;
  let rarityScores = {};
  let revealedCells = new Set(); // cells auto-filled via hint reveal
  let sampleAnswers = {}; // { "r0c0": playerId } - locked sample answers for strikeout
  let currentView = 'today'; // 'today' or 'archive'
  let archiveDate = null;

  let unsubscribeRarity = null;

  // ===== INITIALIZATION =====
  function init() {
    grid = generateDailyGrid();
    RarityService.setGridContext(grid);
    renderGrid();
    updateModeToggle();
    updateStrikesDisplay();
    setupEventListeners();
    loadSavedState();
    renderArchiveList();
    populateTodayCategories();
    showRulesOnFirstVisit();

    // Preload rarity data and listen for live updates
    RarityService.preloadDate(grid.date).then(() => {
      refreshRarityDisplay();
    });
    unsubscribeRarity = RarityService.listenForUpdates(grid.date, () => {
      refreshRarityDisplay();
    });

    // Auto-refresh grid at midnight if tab is still open
    let lastCheckedDate = grid.date;
    setInterval(() => {
      const now = new Date();
      const todayStr = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0');
      if (todayStr !== lastCheckedDate) {
        lastCheckedDate = todayStr;
        window.location.reload();
      }
    }, 30000);

  }

  // ===== RENDER =====
  function renderGrid() {
    const container = document.getElementById('grid-container');
    container.innerHTML = '';

    const table = document.createElement('div');
    table.className = 'grid-table';

    // Row 0: corner + column headers
    const headerRow = document.createElement('div');
    headerRow.className = 'grid-row header-row';

    const corner = document.createElement('div');
    corner.className = 'grid-cell corner-cell';
    corner.id = 'corner-rarity';
    headerRow.appendChild(corner);

    grid.cols.forEach((col) => {
      const cell = document.createElement('div');
      cell.className = 'grid-cell header-cell col-header';
      cell.innerHTML = `
        <div class="header-content">
          <span class="header-icon">${getCategoryIcon(col.id)}</span>
          <span class="header-label">${col.shortLabel}</span>
        </div>
      `;
      headerRow.appendChild(cell);
    });
    table.appendChild(headerRow);

    // Data rows
    grid.rows.forEach((row, ri) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'grid-row';

      const rowHeader = document.createElement('div');
      rowHeader.className = 'grid-cell header-cell row-header';
      rowHeader.innerHTML = `
        <div class="header-content">
          <span class="header-icon">${getCategoryIcon(row.id)}</span>
          <span class="header-label">${row.shortLabel}</span>
        </div>
      `;
      rowEl.appendChild(rowHeader);

      grid.cols.forEach((col, ci) => {
        const cellKey = `r${ri}c${ci}`;
        const cell = document.createElement('div');
        cell.className = 'grid-cell data-cell';
        cell.dataset.row = ri;
        cell.dataset.col = ci;
        cell.dataset.key = cellKey;

        if (answers[cellKey]) {
          renderAnsweredCell(cell, answers[cellKey], cellKey);
        } else {
          cell.innerHTML = `
            <div class="cell-empty">
              <div class="cell-plus">+</div>
            </div>
          `;
          if (!gameOver) {
            cell.addEventListener('click', () => openSearchModal(ri, ci));
          }
        }

        rowEl.appendChild(cell);
      });
      table.appendChild(rowEl);
    });

    container.appendChild(table);
  }

  function renderAnsweredCell(cell, playerId, cellKey) {
    const player = PLAYERS.find(p => p.id === playerId);
    if (!player) return;

    const isRevealed = revealedCells.has(cellKey);
    const rarity = rarityScores[cellKey] || 50;
    const rarityColor = isRevealed ? '#f5c6c6' : getRarityColor(rarity);
    const initials = getInitials(player.name);

    const hasPhoto = typeof PLAYER_PHOTOS !== 'undefined' && PLAYER_PHOTOS[playerId];
    const photoUrl = hasPhoto ? PLAYER_PHOTOS[playerId] : '';

    cell.className = 'grid-cell data-cell answered' + (isRevealed ? ' revealed' : '');
    cell.style.cursor = 'pointer';
    cell.innerHTML = `
      <div class="cell-answered" style="background: ${rarityColor}">
        ${photoUrl
          ? `<img class="player-photo" src="${photoUrl}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : ''}
        <div class="player-avatar" ${photoUrl ? 'style="display:none"' : ''}>${initials}</div>
        <div class="player-name-cell">${getShortName(player.name)}</div>
        ${isRevealed
          ? '<div class="revealed-badge">REVEALED</div>'
          : `<div class="rarity-badge" style="background:${getRarityBadgeColor(rarity)};color:${getRarityBadgeTextColor(rarity)}">${rarity}%</div>`}
      </div>
    `;

    // Click to open player bio
    const ri = parseInt(cellKey[1]);
    const ci = parseInt(cellKey[3]);
    cell.addEventListener('click', () => {
      showPlayerBio(player);
    });
  }

  function getInitials(name) {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Refresh rarity display for all answered cells (called when live data updates)
  async function refreshRarityDisplay() {
    const dateStr = grid.date;
    let updated = false;
    for (const cellKey in answers) {
      const playerId = answers[cellKey];
      const rarity = await RarityService.getRarity(dateStr, cellKey, playerId);
      if (rarityScores[cellKey] !== rarity) {
        rarityScores[cellKey] = rarity;
        updated = true;
        // Update just this cell's display
        const cellEl = document.querySelector(`[data-key="${cellKey}"]`);
        if (cellEl) renderAnsweredCell(cellEl, playerId, cellKey);
      }
    }
    if (updated) saveState();
  }

  function getShortName(name) {
    const parts = name.split(' ');
    if (parts.length <= 2) return name;
    return parts[0][0] + '. ' + parts.slice(-1)[0];
  }

  // Rarity calculation is now handled by RarityService (js/rarity.js)
  // Falls back to local estimation when Firebase is not configured

  // === RARITY SOURCE OF TRUTH ===
  // Cell bg matches category headers exactly
  function getRarityColor() {
    return '#2d6a4f'; // Lighter green than headers (#1a3c34)
  }

  // Pill colors + share emojis must stay in sync
  // Tier 1: 0-10%  → #FACC15 (yellow)  → 🌟
  // Tier 2: 11-25% → #22C55E (green)   → 🟩
  // Tier 3: 26-50% → #F97316 (orange)  → 🟧
  // Tier 4: 51%+   → #EF4444 (red)     → 🟥
  function getRarityBadgeColor(rarity) {
    if (rarity <= 10) return '#FACC15';
    if (rarity <= 25) return '#22C55E';
    if (rarity <= 50) return '#F97316';
    return '#EF4444';
  }

  function getRarityBadgeTextColor(rarity) {
    if (rarity <= 10) return '#1a1a1a'; // dark text on yellow
    return '#fff'; // white text on green/orange/red
  }

  // ===== GAME MODE =====
  function updateModeToggle() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === gameMode);
    });
  }

  function setGameMode(mode) {
    if (mode === gameMode) return;
    // Save current mode's state before switching
    if (grid) saveState();

    gameMode = mode;
    localStorage.setItem('atpgrid_mode', mode);

    // Load the new mode's state (or start fresh)
    answers = {};
    usedPlayers = new Set();
    strikes = 0;
    gameOver = false;
    rarityScores = {};
    revealedCells = new Set();
    sampleAnswers = {};
    hintCache = {};

    const saved = getSavedStateForDate(grid.date, mode);
    if (saved) {
      answers = saved.answers || {};
      usedPlayers = new Set(saved.usedPlayers || []);
      strikes = saved.strikes ?? 0;
      gameOver = saved.gameOver || false;
      rarityScores = saved.rarityScores || {};
      revealedCells = new Set(saved.revealedCells || []);
      sampleAnswers = saved.sampleAnswers || {};
    }

    updateModeToggle();
    renderGrid();
    updateStrikesDisplay();
    updateCornerRarity();
    updateCountdown();
    renderArchiveList();

    if (gameOver) {
      endGame(Object.keys(answers).length >= 9);
    }
  }

  // ===== RULES / HOW TO PLAY =====
  const CATEGORY_DESCRIPTIONS = {
    ao_champ: "Won at least one Australian Open singles title",
    rg_champ: "Won at least one French Open singles title",
    w_champ: "Won at least one Wimbledon singles title",
    uso_champ: "Won at least one US Open singles title",
    gs_champ: "Won any Grand Slam singles title",
    multi_gs: "Won 2 or more Grand Slam singles titles",
    no_gs: "Never won a Grand Slam singles title",
    one_slam_wonder: "Won exactly one Grand Slam in their career",
    career_grand_slam: "Won all 4 Grand Slam titles during their career",
    clay_specialist: "Won the French Open but no other Slam",
    grass_specialist: "Won Wimbledon but no other Slam",
    year_end_no1: "Finished at least one season ranked World No. 1",
    olympic_gold: "Won Olympic gold in singles",
    davis_cup: "Won the Davis Cup representing their country",
    atp_finals: "Won the year-end ATP Finals championship",
    peaked_no1: "Reached the World No. 1 ranking at some point",
    peaked_top3: "Career-high ranking of No. 3 or better",
    peaked_top5: "Career-high ranking of No. 5 or better",
    peaked_top10: "Career-high ranking in the Top 10",
    peaked_top20: "Career-high ranking in the Top 20",
    masters_1000_champ: "Won at least one ATP Masters 1000 event",
    masters_5plus: "Won 5 or more Masters 1000 titles",
    masters_10plus: "Won 10 or more Masters 1000 titles",
    weeks_no1_100: "Spent 100+ weeks ranked World No. 1",
    no_titles: "Never won an ATP singles title",
    titles_20plus: "Won 20+ career ATP singles titles",
    titles_10plus: "Won 10+ career ATP singles titles",
    titles_5plus: "Won 5+ career ATP singles titles",
    one_title_wonder: "Won exactly one ATP title in their career",
    wins_500plus: "500+ career match wins on the ATP Tour",
    wins_300plus: "300+ career match wins on the ATP Tour",
    sub_100_wins: "Fewer than 100 career match wins",
    sub_50_wins: "Fewer than 50 career match wins",
    prize_10m: "Earned $10M+ in prize money in a single season",
    prize_5m: "Earned $5M+ in prize money in a single season",
    prize_1m: "Earned $1M+ in prize money in a single season",
    left_handed: "Plays with a left-handed forehand",
    right_handed: "Plays with a right-handed forehand",
    active: "Currently competing on the ATP Tour",
    retired: "No longer competing on the ATP Tour",
    never_top10: "Career-high ranking was outside the Top 10",
    never_top20: "Career-high ranking was outside the Top 20",
    peaked_outside50: "Career-high ranking was outside the Top 50",
    no_masters: "Never won a Masters 1000 event",
    no_slam_no_masters: "Never won a Grand Slam or Masters 1000",
    tall_player: "Listed height of 6'4\" (193cm) or taller",
    short_player: "Listed height under 5'10\" (178cm)",
    clay_100_wins: "Won 100+ career matches on clay courts",
    hard_100_wins: "Won 100+ career matches on hard courts",
    grass_50_wins: "Won 50+ career matches on grass courts",
    clay_200_wins: "Won 200+ career matches on clay courts",
    young_first_title: "Won their first ATP title before turning 21",
    title_after_30: "Won an ATP title at age 30 or older",
    long_career: "Professional career spanning 15+ years",
    big_server: "Career ace rate of 10% or higher",
    european: "Represents a European nation",
    non_european: "Represents a nation outside of Europe",
    south_american: "Represents a South American nation",
    // Broader stats
    titles_1plus: "Won at least 1 ATP singles title",
    titles_3plus: "Won 3 or more ATP singles titles",
    wins_100plus: "100+ career match wins on the ATP Tour",
    wins_200plus: "200+ career match wins on the ATP Tour",
    peaked_top50: "Career-high ranking in the Top 50",
    peaked_top100: "Career-high ranking in the Top 100",
    clay_50_wins: "Won 50+ career matches on clay courts",
    hard_50_wins: "Won 50+ career matches on hard courts",
    hard_200_wins: "Won 200+ career matches on hard courts",
    grass_20_wins: "Won 20+ career matches on grass courts",
    career_10plus: "Professional career spanning 10+ years",
    career_20plus: "Professional career spanning 20+ years",
    first_title_before_23: "Won their first ATP title before turning 23",
    title_after_28: "Won an ATP title at age 28 or older",
    ace_rate_5plus: "Career ace rate of 5% or higher",
    ace_rate_15plus: "Career ace rate of 15% or higher",
    // Height
    height_190plus: "Listed height of 190cm (6'3\") or taller",
    height_185plus: "Listed height of 185cm (6'1\") or taller",
    height_under_183: "Listed height under 183cm (6'0\")",
    height_under_175: "Listed height under 175cm (5'9\")",
    // Regions
    asian: "Represents an Asian nation",
    african: "Represents an African nation",
    north_american: "Represents USA, Canada, or Mexico",
    oceanian: "Represents Australia or New Zealand",
    slavic: "Represents a Slavic nation",
    scandinavian: "Represents a Scandinavian nation",
    latin_american: "Represents a Latin American nation",
  };

  function getCategoryDescription(cat) {
    if (CATEGORY_DESCRIPTIONS[cat.id]) return CATEGORY_DESCRIPTIONS[cat.id];
    if (cat.type === 'country') return 'Represents ' + cat.shortLabel + ' on the ATP Tour';
    if (cat.type === 'era') return 'Was active on tour during the ' + cat.shortLabel.replace('Played in ', '');
    return cat.label;
  }

  function populateTodayCategories() {
    const list = document.getElementById('htp-today-categories');
    if (!list || !grid) return;
    const allCats = [...grid.rows, ...grid.cols];
    const seen = new Set();
    list.innerHTML = '';
    allCats.forEach(cat => {
      if (seen.has(cat.id)) return;
      seen.add(cat.id);
      const li = document.createElement('li');
      li.innerHTML = `<strong>${cat.shortLabel}</strong><span>${getCategoryDescription(cat)}</span>`;
      list.appendChild(li);
    });
  }

  function showRulesOnFirstVisit() {
    const today = new Date().toISOString().split('T')[0];
    const key = `atpgrid_rules_shown_${today}`;
    if (!localStorage.getItem(key)) {
      document.getElementById('how-to-play-modal').classList.add('active');
      localStorage.setItem(key, '1');
    }
  }

  // ===== STRIKES DISPLAY =====
  function updateStrikesDisplay() {
    const strikesEl = document.getElementById('strikes-display');
    if (!strikesEl) return;

    const attemptsEl = document.getElementById('attempts-count');
    const counterEl = document.getElementById('guess-counter');

    if (gameMode === 'easy') {
      strikesEl.innerHTML = '';
      if (attemptsEl) attemptsEl.textContent = `${strikes}`;
      counterEl.classList.remove('low');
    } else {
      let html = '';
      for (let i = 0; i < MAX_STRIKES; i++) {
        if (i < strikes) {
          html += '<span class="strike-dot used"></span>';
        } else {
          html += '<span class="strike-dot"></span>';
        }
      }
      strikesEl.innerHTML = html;
      if (attemptsEl) attemptsEl.textContent = `${strikes} / ${MAX_STRIKES}`;
      if (strikes >= 2) {
        counterEl.classList.add('low');
      } else {
        counterEl.classList.remove('low');
      }
    }
  }

  function updateCornerRarity() {
    const el = document.getElementById('corner-rarity');
    if (!el) return;
    // Only count genuinely guessed cells (not revealed)
    let total = 0;
    let count = 0;
    for (const key in rarityScores) {
      if (answers[key] && !revealedCells.has(key)) {
        total += rarityScores[key];
        count++;
      }
    }
    if (count === 0) {
      el.innerHTML = '';
      return;
    }
    const avg = Math.round(total / count);
    el.innerHTML = `<div class="corner-rarity-display"><span class="corner-rarity-value">${avg}%</span><span class="corner-rarity-label">Rarity</span></div>`;
  }

  // ===== SEARCH MODAL =====
  function openSearchModal(rowIdx, colIdx) {
    if (gameOver) return;

    selectedCell = { row: rowIdx, col: colIdx };
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    const headerInfo = document.getElementById('modal-header-info');

    const rowCat = grid.rows[rowIdx];
    const colCat = grid.cols[colIdx];
    // Count valid players for this cell
    const validCount = grid.validAnswers[rowIdx]?.[colIdx]?.length || 0;

    headerInfo.innerHTML = `
      <span class="modal-cat">${getCategoryIcon(rowCat.id)} ${rowCat.shortLabel}</span>
      <span class="modal-x">&amp;</span>
      <span class="modal-cat">${getCategoryIcon(colCat.id)} ${colCat.shortLabel}</span>
    `;

    // Show hint button in easy mode only
    const hintContainer = document.getElementById('hint-container');
    const hintText = document.getElementById('hint-text');
    const cellKey = `r${rowIdx}c${colIdx}`;
    const cached = hintCache[cellKey];

    if (hintContainer) {
      hintContainer.style.display = gameMode === 'easy' ? '' : 'none';
      const hintBtn = document.getElementById('hint-btn');

      if (cached) {
        // Restore previous hints for this cell
        hintPlayer = cached.player;
        hintShown = [...cached.shown];
        hintText.textContent = hintShown.join('\n');
        hintText.style.display = hintShown.length > 0 ? '' : 'none';
        // Restore button state
        if (hintBtn) {
          if (cached.revealed) {
            hintBtn.textContent = '✓ Revealed';
            hintBtn.disabled = true;
          } else {
            // Check if next press would be the last
            hintBtn.textContent = '💡 Hint';
            hintBtn.disabled = false;
          }
        }
      } else {
        // Fresh cell, no hints yet
        hintPlayer = null;
        hintShown = [];
        hintText.textContent = '';
        hintText.style.display = 'none';
        if (hintBtn) {
          hintBtn.textContent = '💡 Hint';
          hintBtn.disabled = false;
        }
      }
    }

    modal.classList.add('active');
    input.value = '';
    input.focus();
    renderSearchResults('');
  }

  let hintPlayer = null;
  let hintShown = [];
  let hintCache = {}; // { "r0c0": { player, shown } } - persists hints per cell

  function showHint() {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const validIds = grid.validAnswers[row]?.[col] || [];
    const available = validIds.filter(id => !usedPlayers.has(id));
    if (available.length === 0) return;

    // Lock to one player per cell opening — pick on first hint press
    if (!hintPlayer || !available.includes(hintPlayer.id)) {
      const randomId = available[Math.floor(Math.random() * available.length)];
      hintPlayer = PLAYERS.find(p => p.id === randomId);
      hintShown = [];
    }
    if (!hintPlayer) return;

    // Build hints ordered from vague to specific (bigger giveaways last)
    const allHints = [];
    const gs = hintPlayer.grandSlams || {};
    const totalSlams = (gs.ao || 0) + (gs.rg || 0) + (gs.w || 0) + (gs.uso || 0);

    // Level 1 — Very vague
    if (hintPlayer.hand === 'L') allHints.push('This player is left-handed');
    else allHints.push('This player is right-handed');
    if (hintPlayer.heightCm > 0) allHints.push(`This player is ${hintPlayer.heightCm}cm tall`);
    if (hintPlayer.decades?.length > 0) allHints.push(`This player was active in the ${hintPlayer.decades.join('s, ')}s`);

    // Level 2 — Moderate
    if (hintPlayer.careerWins > 0) allHints.push(`This player has ${hintPlayer.careerWins} career wins`);
    if (hintPlayer.titles > 0) allHints.push(`This player has ${hintPlayer.titles} career title${hintPlayer.titles > 1 ? 's' : ''}`);
    if (hintPlayer.peakRanking <= 10) allHints.push(`This player peaked at World No. ${hintPlayer.peakRanking}`);

    // Level 3 — Strong hints
    if (hintPlayer.masters1000 > 0) allHints.push(`This player has ${hintPlayer.masters1000} Masters 1000 title${hintPlayer.masters1000 > 1 ? 's' : ''}`);
    if (totalSlams > 0) allHints.push(`This player won ${totalSlams} Grand Slam${totalSlams > 1 ? 's' : ''}`);
    if (hintPlayer.weeksAtNo1 > 0) allHints.push(`This player spent ${hintPlayer.weeksAtNo1} weeks at No. 1`);

    // Level 4 — Biggest giveaway
    if (hintPlayer.country) allHints.push(`This player represents ${hintPlayer.country}`);

    // Reveal hints in order (not random)
    const remaining = allHints.filter(h => !hintShown.includes(h));
    const hintText = document.getElementById('hint-text');
    const hintBtn = document.getElementById('hint-btn');

    const cellKey = `r${row}c${col}`;

    if (remaining.length === 0) {
      // All hints used — auto-fill the player into the grid
      hintCache[cellKey] = { player: hintPlayer, shown: [...hintShown], revealed: true };
      if (selectedCell && hintPlayer) {
        answers[cellKey] = hintPlayer.id;
        usedPlayers.add(hintPlayer.id);
        revealedCells.add(cellKey);

        // Record to rarity
        RarityService.recordSelection(grid.date, cellKey, hintPlayer.id).then(rarity => {
          rarityScores[cellKey] = rarity;
          const cellEl = document.querySelector(`[data-key="${cellKey}"]`);
          if (cellEl) renderAnsweredCell(cellEl, hintPlayer.id, cellKey);
          updateCornerRarity();
          saveState();
        });

        closeSearchModal();
        renderGrid();
        updateCornerRarity();
        saveState();

        // Check if grid is complete
        if (Object.keys(answers).length >= 9) {
          endGame(true);
        }
      }
      return;
    }

    const hint = remaining[0]; // Take next in order
    hintShown.push(hint);

    hintText.textContent = hintShown.join('\n');
    hintText.style.display = '';

    // Save to cache so hints persist when reopening this cell
    hintCache[cellKey] = { player: hintPlayer, shown: [...hintShown], revealed: false };

    // Check if that was the last hint — update button text
    const stillRemaining = allHints.filter(h => !hintShown.includes(h));
    if (stillRemaining.length === 0) {
      hintBtn.textContent = '👤 Reveal';
    }
  }

  function closeSearchModal() {
    const modal = document.getElementById('search-modal');
    modal.classList.remove('active');
    selectedCell = null;
  }

  // Normalize string: remove diacritics, lowercase
  function normalize(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // Fuzzy match: checks if query chars appear in order in the target
  function fuzzyMatch(query, target) {
    const nq = normalize(query);
    const nt = normalize(target);

    // Exact substring match first (highest priority)
    if (nt.includes(nq)) return 2;

    // Fuzzy: all chars in order
    let qi = 0;
    for (let ti = 0; ti < nt.length && qi < nq.length; ti++) {
      if (nt[ti] === nq[qi]) qi++;
    }
    return qi === nq.length ? 1 : 0;
  }

  function renderSearchResults(query) {
    const results = document.getElementById('search-results');
    results.innerHTML = '';

    let filtered = PLAYERS.filter(p => !usedPlayers.has(p.id));

    if (query.length > 0) {
      // Score each player and sort by relevance
      const scored = filtered.map(p => {
        const nameScore = fuzzyMatch(query, p.name);
        const countryScore = fuzzyMatch(query, p.country);
        const score = Math.max(nameScore, countryScore);
        return { player: p, score };
      }).filter(s => s.score > 0);

      // Sort: exact matches first, then fuzzy
      scored.sort((a, b) => b.score - a.score);
      filtered = scored.map(s => s.player);
    }

    const display = filtered.slice(0, 80);

    if (display.length === 0) {
      results.innerHTML = '<div class="no-results">No players found</div>';
      return;
    }

    display.forEach(player => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      const initials = player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const hasPhoto = typeof PLAYER_PHOTOS !== 'undefined' && PLAYER_PHOTOS[player.id];
      const photoSrc = hasPhoto ? PLAYER_PHOTOS[player.id] : '';
      item.innerHTML = `
        <div class="search-avatar-wrap">
          ${photoSrc
            ? `<img class="search-photo" src="${photoSrc}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
            : '<span style="display:none;"></span>'}
          <span class="search-avatar-fallback" ${photoSrc ? 'style="display:none;"' : ''}>${initials}</span>
        </div>
        <div class="search-info">
          <span class="search-name">${player.name}</span> <span class="search-flag">${getCountryFlag(player.country)}</span>
        </div>
      `;
      item.addEventListener('click', () => selectPlayer(player));
      results.appendChild(item);
    });
  }

  // ===== PLAYER SELECTION =====
  function selectPlayer(player) {
    if (!selectedCell || gameOver) return;

    const { row, col } = selectedCell;
    const rowCat = grid.rows[row];
    const colCat = grid.cols[col];

    const matchesRow = rowCat.check(player);
    const matchesCol = colCat.check(player);

    if (matchesRow && matchesCol) {
      // Correct! No strike penalty
      const cellKey = `r${row}c${col}`;
      answers[cellKey] = player.id;
      usedPlayers.add(player.id);

      // Record selection to Firebase and get live rarity
      RarityService.recordSelection(grid.date, cellKey, player.id).then(rarity => {
        rarityScores[cellKey] = rarity;
        // Re-render the cell with live rarity
        const cellEl = document.querySelector(`[data-key="${cellKey}"]`);
        if (cellEl) renderAnsweredCell(cellEl, player.id, cellKey);
        updateCornerRarity();
        saveState();
      });

      closeSearchModal();
      renderGrid();
      updateCornerRarity();
      saveState();

      // Check if grid is complete
      const totalCells = grid.rows.length * grid.cols.length;
      const answeredCells = Object.keys(answers).length;
      if (answeredCells >= totalCells) {
        endGame(true);
      }
    } else {
      // Wrong - add a strike!
      strikes++;
      updateStrikesDisplay();

      // Shake animation on the cell
      const cell = document.querySelector(`[data-key="r${row}c${col}"]`);
      if (cell) {
        cell.classList.add('shake');
        setTimeout(() => cell.classList.remove('shake'), 500);
      }

      showGuessError(player, matchesRow, matchesCol, rowCat, colCat);
      saveState();

      if (gameMode === 'hard' && strikes >= MAX_STRIKES) {
        closeSearchModal();
        endGame(false);
      }
    }
  }

  function showGuessError(player, matchesRow, matchesCol, rowCat, colCat) {
    const toast = document.getElementById('error-toast');
    if (!toast) return;
    const misses = [];
    if (!matchesRow) misses.push(rowCat.shortLabel);
    if (!matchesCol) misses.push(colCat.shortLabel);
    toast.textContent = `${player.name} doesn't match: ${misses.join(' & ')}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ===== PLAYER FACTS =====
  function generatePlayerFact(player) {
    const facts = [];
    const gs = player.grandSlams || {};
    const totalSlams = (gs.ao || 0) + (gs.rg || 0) + (gs.w || 0) + (gs.uso || 0);

    // Slam-related facts
    if (totalSlams > 0) {
      const parts = [];
      if (gs.ao) parts.push(`${gs.ao} Australian Open${gs.ao > 1 ? 's' : ''}`);
      if (gs.rg) parts.push(`${gs.rg} French Open${gs.rg > 1 ? 's' : ''}`);
      if (gs.w) parts.push(`${gs.w} Wimbledon${gs.w > 1 ? 's' : ''}`);
      if (gs.uso) parts.push(`${gs.uso} US Open${gs.uso > 1 ? 's' : ''}`);
      facts.push(`${player.name} won ${totalSlams} Grand Slam${totalSlams > 1 ? 's' : ''}: ${parts.join(', ')}`);
    }

    if (player.careerWins >= 500) facts.push(`${player.name} has ${player.careerWins} career match wins`);
    if (player.titles >= 20) facts.push(`${player.name} has won ${player.titles} career titles`);
    if (player.masters1000 >= 5) facts.push(`${player.name} has ${player.masters1000} Masters 1000 titles`);
    if (player.weeksAtNo1 >= 50) facts.push(`${player.name} spent ${player.weeksAtNo1} weeks ranked World No. 1`);
    if (player.heightCm >= 198) {
      const ft = Math.floor(player.heightCm / 2.54 / 12);
      const inches = Math.round(player.heightCm / 2.54 % 12);
      facts.push(`${player.name} stands ${player.heightCm}cm (${ft}'${inches}") tall`);
    }
    if (player.hand === 'L') facts.push(`${player.name} is a left-handed player`);
    if (player.ageFirstTitle && player.ageFirstTitle <= 19) facts.push(`${player.name} won their first ATP title at just ${player.ageFirstTitle} years old`);
    if (player.careerLength >= 18) facts.push(`${player.name} had a ${player.careerLength}-year professional career`);
    if (player.clayWins >= 200) facts.push(`${player.name} won ${player.clayWins} career matches on clay`);
    if (player.grassWins >= 100) facts.push(`${player.name} won ${player.grassWins} career matches on grass`);
    if (player.peakRanking === 1) facts.push(`${player.name} reached the World No. 1 ranking`);
    if (player.olympicSinglesGold) facts.push(`${player.name} won Olympic gold in singles`);
    if (player.aceRate >= 15) facts.push(`${player.name} has an ace rate of ${player.aceRate}%`);
    if (player.country) facts.push(`${player.name} represents ${player.country}`);

    // Prefer interesting facts over generic country ones
    const good = facts.filter(f => !f.includes('represents'));
    const pool = good.length > 0 ? good : facts;
    return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
  }

  function showFactToast(text) {
    const toast = document.getElementById('fact-toast');
    if (!toast || !text) return;
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  // ===== PLAYER BIO =====
  function showPlayerBio(player) {
    const modal = document.getElementById('player-bio-modal');
    const header = document.getElementById('player-bio-header');
    const factsEl = document.getElementById('player-bio-facts');

    const hasPhoto = typeof PLAYER_PHOTOS !== 'undefined' && PLAYER_PHOTOS[player.id];
    const photoUrl = hasPhoto ? PLAYER_PHOTOS[player.id] : '';
    const initials = getInitials(player.name);
    const gs = player.grandSlams || {};
    const totalSlams = (gs.ao || 0) + (gs.rg || 0) + (gs.w || 0) + (gs.uso || 0);

    header.innerHTML = `
      ${photoUrl
        ? `<img class="bio-photo" src="${photoUrl}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''}
      <div class="bio-avatar" ${photoUrl ? 'style="display:none"' : ''}>${initials}</div>
      <div class="bio-name">${player.name}</div>
      <div class="bio-country">${getCountryFlag(player.country)} ${player.country}${player.active ? ' · Active' : ''}</div>
    `;

    // === HERO STATS (big achievements) ===
    const heroes = [];
    if (totalSlams > 0) heroes.push({ value: totalSlams, label: 'Grand Slams' });
    if (player.titles > 0) heroes.push({ value: player.titles, label: 'ATP Titles' });
    if (player.peakRanking <= 10) heroes.push({ value: '#' + player.peakRanking, label: 'Peak Ranking' });
    if (player.careerWins > 0) heroes.push({ value: player.careerWins, label: 'Career Wins' });

    // SVG icon helper (16x16 inline icons)
    const svgIcon = (d) => `<svg class="bio-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const icons = {
      trophy: svgIcon('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>'),
      target: svgIcon('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
      medal: svgIcon('<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/>'),
      flag: svgIcon('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>'),
      star: svgIcon('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
      crown: svgIcon('<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>'),
      clock: svgIcon('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
      calendar: svgIcon('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
      zap: svgIcon('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
    };

    // === TROPHY CABINET ===
    const trophies = [];
    if (totalSlams > 0) {
      const parts = [];
      if (gs.ao) parts.push(`AO: ${gs.ao}`);
      if (gs.rg) parts.push(`RG: ${gs.rg}`);
      if (gs.w) parts.push(`WIM: ${gs.w}`);
      if (gs.uso) parts.push(`USO: ${gs.uso}`);
      trophies.push({ icon: icons.trophy, text: parts.join(' · ') });
    }
    if (player.masters1000 > 0) trophies.push({ icon: icons.target, text: `${player.masters1000} Masters 1000` });
    if (player.olympicSinglesGold) trophies.push({ icon: icons.medal, text: 'Olympic Gold' });
    if (player.davisCup) trophies.push({ icon: icons.flag, text: 'Davis Cup' });
    if (player.atpFinals) trophies.push({ icon: icons.trophy, text: 'ATP Finals' });
    if (player.yearEndNo1) trophies.push({ icon: icons.star, text: 'Year-End No. 1' });

    // === CAREER MILESTONES ===
    const milestones = [];
    if (player.weeksAtNo1 > 0) milestones.push({ icon: icons.crown, text: `${player.weeksAtNo1} weeks at No. 1` });
    if (player.ageFirstTitle && player.ageFirstTitle <= 21) milestones.push({ icon: icons.zap, text: `First title at ${player.ageFirstTitle}` });
    if (player.careerLength >= 10) milestones.push({ icon: icons.clock, text: `${player.careerLength}-year career` });
    if (player.decades?.length > 0) milestones.push({ icon: icons.calendar, text: `${player.decades.join('s, ')}s` });

    // === SURFACE PERFORMANCE ===
    const surfaces = [];
    if (player.clayWins >= 50) surfaces.push({ label: 'Clay', value: player.clayWins, color: '#c9713d' });
    if (player.hardWins >= 50) surfaces.push({ label: 'Hard', value: player.hardWins, color: '#3d7cc9' });
    if (player.grassWins >= 20) surfaces.push({ label: 'Grass', value: player.grassWins, color: '#4a9e5c' });

    // === PLAYER PROFILE ===
    const profile = [];
    if (player.heightCm > 0) {
      const ft = Math.floor(player.heightCm / 2.54 / 12);
      const inches = Math.round(player.heightCm / 2.54 % 12);
      profile.push({ label: 'Height', value: `${ft}'${inches}"` });
    }
    profile.push({ label: 'Plays', value: player.hand === 'L' ? 'Left' : 'Right' });
    if (player.aceRate >= 5) profile.push({ label: 'Ace Rate', value: `${player.aceRate}%` });

    // === BUILD HTML ===
    let html = '';

    // Hero stats row
    if (heroes.length > 0) {
      html += `<div class="bio-heroes" data-count="${heroes.length}">${heroes.map(h =>
        `<div class="bio-hero"><span class="bio-hero-value">${h.value}</span><span class="bio-hero-label">${h.label}</span></div>`
      ).join('')}</div>`;
    }

    // Trophy cabinet
    if (trophies.length > 0) {
      html += `<div class="bio-section"><div class="bio-section-title">Trophy Cabinet</div><div class="bio-grid">${trophies.map(t =>
        `<div class="bio-chip"><span class="bio-chip-icon">${t.icon}</span>${t.text}</div>`
      ).join('')}</div></div>`;
    }

    // Career milestones
    if (milestones.length > 0) {
      html += `<div class="bio-section"><div class="bio-section-title">Career</div><div class="bio-grid">${milestones.map(m =>
        `<div class="bio-chip"><span class="bio-chip-icon">${m.icon}</span>${m.text}</div>`
      ).join('')}</div></div>`;
    }

    // Surface performance
    if (surfaces.length > 0) {
      html += `<div class="bio-section"><div class="bio-section-title">Surface Wins</div><div class="bio-surfaces">${surfaces.map(s =>
        `<div class="bio-surface"><span class="bio-surface-value" style="color:${s.color}">${s.value}</span><span class="bio-surface-label">${s.label}</span></div>`
      ).join('')}</div></div>`;
    }

    // Player profile micro-grid
    if (profile.length > 0) {
      html += `<div class="bio-section"><div class="bio-profile-grid">${profile.map(p =>
        `<div class="bio-profile-stat"><span class="bio-profile-label">${p.label}</span><span class="bio-profile-value">${p.value}</span></div>`
      ).join('')}</div></div>`;
    }

    factsEl.innerHTML = html;
    modal.classList.add('active');
  }

  // ===== GAME STATE =====
  function endGame(won) {
    gameOver = true;
    document.getElementById('game-over-modal').classList.add('active');
    renderGameOverStats(won);
    if (!won && gameMode === 'hard') {
      revealSampleAnswers();
    }
    saveState();
  }

  function generateCategoryFact(player, rowCat, colCat) {
    const gs = player.grandSlams || {};
    const facts = [];

    // Facts relevant to the row category
    const catFacts = {
      ao_champ: gs.ao ? `${player.name} won the Australian Open ${gs.ao} time${gs.ao > 1 ? 's' : ''}` : null,
      rg_champ: gs.rg ? `${player.name} won the French Open ${gs.rg} time${gs.rg > 1 ? 's' : ''}` : null,
      w_champ: gs.w ? `${player.name} won Wimbledon ${gs.w} time${gs.w > 1 ? 's' : ''}` : null,
      uso_champ: gs.uso ? `${player.name} won the US Open ${gs.uso} time${gs.uso > 1 ? 's' : ''}` : null,
      gs_champ: (gs.ao||0)+(gs.rg||0)+(gs.w||0)+(gs.uso||0) > 0 ? `${player.name} won ${(gs.ao||0)+(gs.rg||0)+(gs.w||0)+(gs.uso||0)} Grand Slam${(gs.ao||0)+(gs.rg||0)+(gs.w||0)+(gs.uso||0) > 1 ? 's' : ''}` : null,
      peaked_no1: player.peakRanking === 1 ? `${player.name} reached World No. 1` : null,
      peaked_top5: player.peakRanking <= 5 ? `${player.name} peaked at World No. ${player.peakRanking}` : null,
      peaked_top10: player.peakRanking <= 10 ? `${player.name} peaked at World No. ${player.peakRanking}` : null,
      masters_1000_champ: player.masters1000 > 0 ? `${player.name} won ${player.masters1000} Masters 1000 title${player.masters1000 > 1 ? 's' : ''}` : null,
      year_end_no1: player.yearEndNo1 ? `${player.name} finished a season as World No. 1` : null,
      olympic_gold: player.olympicSinglesGold ? `${player.name} won Olympic gold in singles` : null,
      davis_cup: player.davisCup ? `${player.name} won the Davis Cup` : null,
      left_handed: player.hand === 'L' ? `${player.name} is a left-handed player` : null,
      active: player.active ? `${player.name} is currently active on tour` : null,
      retired: !player.active ? `${player.name} is retired from professional tennis` : null,
      european: `${player.name} represents ${player.country}`,
      non_european: `${player.name} represents ${player.country}`,
      long_career: player.careerLength >= 15 ? `${player.name} had a ${player.careerLength}-year career` : null,
      clay_200_wins: player.clayWins >= 200 ? `${player.name} won ${player.clayWins} matches on clay` : null,
      clay_100_wins: player.clayWins >= 100 ? `${player.name} won ${player.clayWins} matches on clay` : null,
      wins_500plus: player.careerWins >= 500 ? `${player.name} has ${player.careerWins} career wins` : null,
      wins_300plus: player.careerWins >= 300 ? `${player.name} has ${player.careerWins} career wins` : null,
      titles_20plus: player.titles >= 20 ? `${player.name} won ${player.titles} career titles` : null,
      titles_10plus: player.titles >= 10 ? `${player.name} won ${player.titles} career titles` : null,
      tall_player: player.heightCm >= 193 ? `${player.name} stands ${player.heightCm}cm tall` : null,
      big_server: player.aceRate >= 10 ? `${player.name} has an ace rate of ${player.aceRate}%` : null,
    };

    // Check both categories for relevant facts
    [rowCat, colCat].forEach(cat => {
      const f = catFacts[cat.id];
      if (f) facts.push(f);
    });

    // Fallback to generic fact
    if (facts.length === 0) return generatePlayerFact(player);
    return facts[Math.floor(Math.random() * facts.length)];
  }

  function revealSampleAnswers() {
    // Pick sample answers once and lock them in
    const needsPick = Object.keys(sampleAnswers).length === 0;
    const shownPlayers = new Set(Object.values(sampleAnswers));

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cellKey = `r${r}c${c}`;
        if (answers[cellKey]) continue;

        let sampleId = sampleAnswers[cellKey];
        if (!sampleId && needsPick) {
          const validIds = grid.validAnswers[r]?.[c] || [];
          const available = validIds.filter(id => !usedPlayers.has(id) && !shownPlayers.has(id));
          if (available.length === 0) continue;
          sampleId = available[Math.floor(Math.random() * available.length)];
          sampleAnswers[cellKey] = sampleId;
          shownPlayers.add(sampleId);
        }
        if (!sampleId) continue;

        const player = PLAYERS.find(p => p.id === sampleId);
        if (!player) continue;

        const hasPhoto = typeof PLAYER_PHOTOS !== 'undefined' && PLAYER_PHOTOS[sampleId];
        const photoUrl = hasPhoto ? PLAYER_PHOTOS[sampleId] : '';
        const initials = getInitials(player.name);

        const cellEl = document.querySelector(`[data-key="${cellKey}"]`);
        if (cellEl) {
          cellEl.innerHTML = `
            <div class="cell-sample-answer">
              ${photoUrl
                ? `<img class="sample-photo" src="${photoUrl}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                : ''}
              <div class="sample-avatar" ${photoUrl ? 'style="display:none"' : ''}>${initials}</div>
              <div class="sample-player-name">${getShortName(player.name)}</div>
            </div>
          `;
          cellEl.style.cursor = 'pointer';
          cellEl.addEventListener('click', () => {
            showPlayerBio(player);
          });
        }
      }
    }
  }

  function renderGameOverStats(won) {
    const statsEl = document.getElementById('game-over-stats');
    const answeredCount = Object.keys(answers).length;
    const totalCells = 9;

    // Average rarity of genuinely guessed cells only
    let guessedRarityTotal = 0;
    let guessedRarityCount = 0;
    for (const key in rarityScores) {
      if (answers[key] && !revealedCells.has(key)) {
        guessedRarityTotal += rarityScores[key];
        guessedRarityCount++;
      }
    }
    const avgRarity = guessedRarityCount > 0 ? Math.round(guessedRarityTotal / guessedRarityCount) : 0;

    // Penalized percentile: unguessed cells count as 100% rarity
    let penalizedTotal = guessedRarityTotal + (9 - guessedRarityCount) * 100;
    const penalizedAvg = Math.round(penalizedTotal / 9);

    const title = document.querySelector('.game-over-title');
    if (won) {
      title.textContent = 'Grid Complete!';
      title.style.color = '#2d6a4f';
    } else {
      title.textContent = `${MAX_STRIKES} Strikes - Game Over!`;
      title.style.color = '#e76f51';
    }

    const guessedCount = Object.keys(answers).filter(k => !revealedCells.has(k)).length;

    // Fallback percentile from naive inversion
    const fallbackPercentile = Math.max(0, Math.round(100 - penalizedAvg));

    function renderStats(percentile) {
      let percentileColor;
      if (percentile >= 80) { percentileColor = '#22C55E'; }
      else if (percentile >= 50) { percentileColor = '#F97316'; }
      else { percentileColor = '#EF4444'; }

      statsEl.innerHTML = `
        <div class="stat-row">
          <span class="stat-label">Cells Filled</span>
          <span class="stat-value">${guessedCount}/${totalCells}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Strikes</span>
          <span class="stat-value">${gameMode === 'easy' ? strikes : strikes + '/' + MAX_STRIKES}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Avg Rarity Score</span>
          <span class="stat-value">${avgRarity}%</span>
        </div>
        <div class="percentile-row">
          <span>Better than <span class="percentile-value" style="color:${percentileColor}">${percentile}%</span> of players</span>
        </div>
      `;
    }

    // Render immediately with fallback
    renderStats(fallbackPercentile);

    // Record completion to Firebase and get real percentile
    RarityService.recordCompletion(grid.date, penalizedAvg).then(realPercentile => {
      if (realPercentile !== null) {
        renderStats(realPercentile);
      }
    });
  }

  // ===== SHARE =====
  function getCellEmoji(cellKey) {
    if (!answers[cellKey]) return '\u2b1c'; // white square - empty/missed
    if (revealedCells.has(cellKey)) return '\u2b1c'; // white square - failed/revealed
    const rarity = rarityScores[cellKey] || 50;
    if (rarity <= 10) return '\ud83c\udf1f'; // 🌟 star - very rare
    if (rarity <= 25) return '\ud83d\udfe9'; // 🟩 green - uncommon
    if (rarity <= 50) return '\ud83d\udfe7'; // 🟧 orange - common
    return '\ud83d\udfe5'; // 🟥 red - very common
  }

  function getShareStrikesStr() {
    if (gameMode === 'easy') return strikes.toString();
    return '\ud83d\udd34'.repeat(strikes) + '\u26aa'.repeat(MAX_STRIKES - strikes);
  }

  function getGuessedCount() {
    // Only count cells the user actually guessed (not revealed)
    return Object.keys(answers).filter(k => !revealedCells.has(k)).length;
  }

  function buildShareText() {
    const totalCells = 9;
    const gridNum = getGridNumber(grid.date);
    const modeLabel = gameMode === 'easy' ? ' (Easy)' : ' (Hard)';
    let shareText = `ATP Grid #${gridNum}${modeLabel}\n`;
    shareText += `Score: ${getGuessedCount()}/${totalCells} | Strikes: ${getShareStrikesStr()}\n\n`;

    for (let r = 0; r < 3; r++) {
      let row = '';
      for (let c = 0; c < 3; c++) {
        row += getCellEmoji(`r${r}c${c}`);
      }
      shareText += row + '\n';
    }
    shareText += '\natpgrid.com';
    return shareText;
  }

  function buildSharePreviewHTML() {
    const totalCells = 9;
    const gridNum = getGridNumber(grid.date);
    const modeLabel = gameMode === 'easy' ? ' (Easy)' : ' (Hard)';

    let gridRows = '';
    for (let r = 0; r < 3; r++) {
      let row = '';
      for (let c = 0; c < 3; c++) {
        row += getCellEmoji(`r${r}c${c}`);
      }
      gridRows += `<div class="share-grid-row">${row}</div>`;
    }

    return `
      <div class="share-title">ATP Grid #${gridNum}${modeLabel}</div>
      <div class="share-score">Score: ${getGuessedCount()}/${totalCells} | Strikes: ${getShareStrikesStr()}</div>
      <div style="height:8px"></div>
      ${gridRows}
      <div style="height:8px"></div>
      <div class="share-url">atpgrid.com</div>
    `;
  }

  function shareResults() {
    const text = buildShareText();
    const modal = document.getElementById('share-text-modal');
    const textarea = document.getElementById('share-text-area');
    const previewCard = document.getElementById('share-preview-card');
    const copyBtn = document.getElementById('share-copy-btn');

    if (modal) {
      if (textarea) textarea.value = text;
      if (previewCard) previewCard.innerHTML = buildSharePreviewHTML();
      modal.classList.add('active');
    }
  }

  function copyShareText() {
    const text = buildShareText();
    const copyBtn = document.getElementById('share-copy-btn');
    const textarea = document.getElementById('share-text-area');

    function showCopied() {
      if (!copyBtn) return;
      copyBtn.classList.add('copied');
      copyBtn.querySelector('.share-copy-label').textContent = 'Copied!';
      copyBtn.querySelector('.share-copy-icon').innerHTML = '<polyline points="20 6 9 17 4 12"/>';
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.querySelector('.share-copy-label').textContent = 'Copy to Clipboard';
        copyBtn.querySelector('.share-copy-icon').innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>';
      }, 2000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showCopied).catch(() => {
        if (textarea) {
          textarea.style.display = 'block';
          textarea.focus();
          textarea.select();
          try { document.execCommand('copy'); showCopied(); } catch(e) {}
          textarea.style.display = 'none';
        }
      });
    } else if (textarea) {
      textarea.style.display = 'block';
      textarea.focus();
      textarea.select();
      try { document.execCommand('copy'); showCopied(); } catch(e) {}
      textarea.style.display = 'none';
    }
  }

  // ===== ARCHIVE =====
  function getArchiveDates() {
    // Generate all dates from Grid #1 (March 3, 2026) to today
    const dates = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const launch = new Date('2026-03-03T12:00:00');
    const d = new Date(today);
    while (d >= launch) {
      dates.push(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() - 1);
    }
    return dates;
  }

  function renderArchiveList() {
    const list = document.getElementById('archive-list');
    if (!list) return;

    const dates = getArchiveDates();
    const todayStr = dates[0];

    const modeLabel = document.getElementById('archive-mode-label');
    if (modeLabel) {
      modeLabel.textContent = `Showing ${gameMode === 'easy' ? 'Easy' : 'Hard'} mode progress`;
    }

    list.innerHTML = '';
    dates.forEach((dateStr, idx) => {
      const item = document.createElement('div');
      item.className = 'archive-item';
      if (idx === 0) item.classList.add('today');

      // Check if this grid was completed (check current mode)
      const saved = getSavedStateForDate(dateStr, gameMode);
      const completed = saved && saved.gameOver;
      const answeredCount = saved ? Object.keys(saved.answers || {}).length : 0;

      const dateObj = new Date(dateStr + 'T12:00:00');
      const dayName = idx === 0 ? 'Today' : idx === 1 ? 'Yesterday' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const gridNum = getGridNumber(dateStr);

      let statusIcon = '';
      if (completed && answeredCount === 9) statusIcon = '<span class="archive-status complete">9/9</span>';
      else if (completed) statusIcon = `<span class="archive-status partial">${answeredCount}/9</span>`;
      else if (answeredCount > 0) statusIcon = `<span class="archive-status in-progress">${answeredCount}/9</span>`;

      item.innerHTML = `
        <div class="archive-date-info">
          <span class="archive-day">${dayName}</span>
          <span class="archive-date">${dateLabel}</span>
          <span class="archive-grid-num">#${gridNum}</span>
        </div>
        ${statusIcon}
      `;

      item.addEventListener('click', () => loadArchiveGrid(dateStr));
      list.appendChild(item);
    });
  }

  function loadArchiveGrid(dateStr) {
    // Save current state first
    if (grid) saveState();

    const todayStr = new Date().toISOString().split('T')[0];
    currentView = dateStr === todayStr ? 'today' : 'archive';
    archiveDate = dateStr;

    // Generate grid for this date
    grid = generateDailyGrid(dateStr);
    RarityService.setGridContext(grid);

    // Reset state
    answers = {};
    usedPlayers = new Set();
    strikes = 0;
    gameOver = false;
    rarityScores = {};
    revealedCells = new Set();
    sampleAnswers = {};
    hintCache = {};

    // Load saved state for this date and current mode
    const saved = getSavedStateForDate(dateStr, gameMode);
    if (saved) {
      answers = saved.answers || {};
      usedPlayers = new Set(saved.usedPlayers || []);
      strikes = saved.strikes ?? 0;
      gameOver = saved.gameOver || false;
      rarityScores = saved.rarityScores || {};
      revealedCells = new Set(saved.revealedCells || []);
      sampleAnswers = saved.sampleAnswers || {};
    }

    renderGrid();
    updateStrikesDisplay();
    updateCornerRarity();
    updateDateDisplay(dateStr);

    // Close archive panel
    document.getElementById('archive-panel')?.classList.remove('open');
    document.getElementById('archive-backdrop')?.classList.remove('visible');

    // Preload rarity for this date and listen for updates
    if (unsubscribeRarity) unsubscribeRarity();
    RarityService.preloadDate(dateStr).then(() => refreshRarityDisplay());
    unsubscribeRarity = RarityService.listenForUpdates(dateStr, () => refreshRarityDisplay());

    if (gameOver) {
      endGame(Object.keys(answers).length >= 9);
    }
  }

  // Grid number: days since launch (March 3, 2026 = Grid #1)
  function getGridNumber(dateStr) {
    const launch = new Date('2026-03-03T00:00:00');
    const current = new Date(dateStr + 'T00:00:00');
    const diff = Math.floor((current - launch) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  }

  function updateDateDisplay(dateStr) {
    const el = document.getElementById('current-date-display');
    if (!el) return;
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr === todayStr) {
      el.textContent = "Today's Grid";
    } else {
      const d = new Date(dateStr + 'T12:00:00');
      el.textContent = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    // Grid number
    const numEl = document.getElementById('grid-number');
    if (numEl) {
      numEl.textContent = `ATP Grid #${getGridNumber(dateStr)}`;
    }

    // Countdown timer (only show when game is complete)
    updateCountdown();
  }

  let countdownInterval = null;
  function updateCountdown() {
    const timerEl = document.getElementById('countdown-timer');
    if (!timerEl) return;

    if (gameOver) {
      timerEl.classList.add('visible');
      if (countdownInterval) clearInterval(countdownInterval);
      countdownInterval = setInterval(() => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const diff = tomorrow - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        timerEl.textContent = `Next grid in ${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      }, 1000);
    } else {
      timerEl.classList.remove('visible');
      if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
    }
  }

  function getStateKey(dateStr, mode) {
    mode = mode || gameMode;
    return `atpgrid_${dateStr}_${mode}`;
  }

  function getSavedStateForDate(dateStr, mode) {
    mode = mode || gameMode;
    try {
      // Try mode-specific key first
      const modeState = JSON.parse(localStorage.getItem(getStateKey(dateStr, mode)));
      if (modeState) return modeState;
      // Fallback: migrate old format (no mode suffix) as hard mode
      if (mode === 'hard') {
        const oldState = JSON.parse(localStorage.getItem(`atpgrid_${dateStr}`));
        if (oldState) {
          // Migrate to new key
          localStorage.setItem(getStateKey(dateStr, 'hard'), JSON.stringify(oldState));
          localStorage.removeItem(`atpgrid_${dateStr}`);
          return oldState;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // ===== PERSISTENCE =====
  function saveState() {
    const dateStr = grid.date;
    const state = {
      date: dateStr,
      mode: gameMode,
      answers,
      usedPlayers: Array.from(usedPlayers),
      strikes,
      gameOver,
      rarityScores,
      revealedCells: Array.from(revealedCells),
      sampleAnswers
    };
    localStorage.setItem(getStateKey(dateStr, gameMode), JSON.stringify(state));
    // Also update archive list status
    renderArchiveList();
  }

  function loadSavedState() {
    const dateStr = grid.date;
    const saved = getSavedStateForDate(dateStr);
    if (saved && saved.date === dateStr) {
      answers = saved.answers || {};
      usedPlayers = new Set(saved.usedPlayers || []);
      strikes = saved.strikes ?? 0;
      gameOver = saved.gameOver || false;
      rarityScores = saved.rarityScores || {};
      revealedCells = new Set(saved.revealedCells || []);
      sampleAnswers = saved.sampleAnswers || {};

      renderGrid();
      updateStrikesDisplay();
      updateCornerRarity();

      if (gameOver) {
        endGame(Object.keys(answers).length >= 9);
      }
    }
    updateDateDisplay(dateStr);
  }

  // ===== EVENT LISTENERS =====
  function setupEventListeners() {
    // Mode toggle
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => setGameMode(btn.dataset.mode));
    });

    document.getElementById('search-input').addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });

    document.getElementById('search-modal').addEventListener('click', (e) => {
      if (e.target.id === 'search-modal') closeSearchModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSearchModal();
        document.getElementById('game-over-modal').classList.remove('active');
        document.getElementById('how-to-play-modal').classList.remove('active');
        document.getElementById('player-bio-modal').classList.remove('active');
      }
    });

    document.getElementById('close-search').addEventListener('click', closeSearchModal);
    document.getElementById('hint-btn')?.addEventListener('click', showHint);
    document.getElementById('share-btn').addEventListener('click', shareResults);
    document.getElementById('share-btn-footer')?.addEventListener('click', shareResults);
    document.getElementById('share-copy-btn')?.addEventListener('click', copyShareText);

    // Share text modal close
    document.getElementById('share-text-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'share-text-modal') {
        document.getElementById('share-text-modal').classList.remove('active');
      }
    });
    document.getElementById('close-share-text')?.addEventListener('click', () => {
      document.getElementById('share-text-modal').classList.remove('active');
    });

    document.getElementById('close-game-over').addEventListener('click', () => {
      document.getElementById('game-over-modal').classList.remove('active');
    });

    // Player bio modal
    document.getElementById('close-player-bio').addEventListener('click', () => {
      document.getElementById('player-bio-modal').classList.remove('active');
    });
    document.getElementById('player-bio-modal').addEventListener('click', (e) => {
      if (e.target.id === 'player-bio-modal') {
        document.getElementById('player-bio-modal').classList.remove('active');
      }
    });

    // How to play
    document.getElementById('how-to-play-btn').addEventListener('click', () => {
      document.getElementById('how-to-play-modal').classList.add('active');
    });
    document.getElementById('close-how-to-play').addEventListener('click', () => {
      document.getElementById('how-to-play-modal').classList.remove('active');
    });
    document.getElementById('htp-play-btn').addEventListener('click', () => {
      document.getElementById('how-to-play-modal').classList.remove('active');
    });
    document.getElementById('how-to-play-modal').addEventListener('click', (e) => {
      if (e.target.id === 'how-to-play-modal') {
        document.getElementById('how-to-play-modal').classList.remove('active');
      }
    });

    // Archive toggle with backdrop
    function openArchive() {
      document.getElementById('archive-panel').classList.add('open');
      document.getElementById('archive-backdrop').classList.add('visible');
    }
    function closeArchive() {
      document.getElementById('archive-panel').classList.remove('open');
      document.getElementById('archive-backdrop').classList.remove('visible');
    }
    document.getElementById('archive-btn')?.addEventListener('click', () => {
      const panel = document.getElementById('archive-panel');
      if (panel.classList.contains('open')) closeArchive();
      else openArchive();
    });
    document.getElementById('close-archive')?.addEventListener('click', closeArchive);
    document.getElementById('archive-backdrop')?.addEventListener('click', closeArchive);
  }

  // ===== BOOT =====
  document.addEventListener('DOMContentLoaded', init);
})();
