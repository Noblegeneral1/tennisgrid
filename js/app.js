// ATP Grid - Main Application Logic

(function() {
  'use strict';

  // ===== STATE =====
  let grid = null;
  let selectedCell = null;
  let strikes = 0;
  const MAX_STRIKES = 3;
  let answers = {}; // { "r0c1": playerId }
  let usedPlayers = new Set();
  let gameOver = false;
  let rarityScores = {};
  let currentView = 'today'; // 'today' or 'archive'
  let archiveDate = null;

  let unsubscribeRarity = null;

  // ===== INITIALIZATION =====
  function init() {
    grid = generateDailyGrid();
    RarityService.setGridContext(grid);
    renderGrid();
    updateStrikesDisplay();
    setupEventListeners();
    loadSavedState();
    renderArchiveList();

    // Preload rarity data and listen for live updates
    RarityService.preloadDate(grid.date).then(() => {
      refreshRarityDisplay();
    });
    unsubscribeRarity = RarityService.listenForUpdates(grid.date, () => {
      refreshRarityDisplay();
    });

    // Show rarity mode indicator
    const rarityBadge = document.getElementById('rarity-mode');
    if (rarityBadge) {
      if (RarityService.isLive()) {
        rarityBadge.textContent = 'LIVE RARITY';
        rarityBadge.classList.add('live');
        rarityBadge.style.display = '';
      }
    }
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

    const rarity = rarityScores[cellKey] || 50;
    const rarityColor = getRarityColor(rarity);
    const initials = getInitials(player.name);

    const hasPhoto = typeof PLAYER_PHOTOS !== 'undefined' && PLAYER_PHOTOS[playerId];
    const photoUrl = hasPhoto ? PLAYER_PHOTOS[playerId] : '';

    cell.className = 'grid-cell data-cell answered';
    cell.innerHTML = `
      <div class="cell-answered" style="background: ${rarityColor}">
        ${photoUrl
          ? `<img class="player-photo" src="${photoUrl}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : ''}
        <div class="player-avatar" ${photoUrl ? 'style="display:none"' : ''}>${initials}</div>
        <div class="player-name-cell">${getShortName(player.name)}</div>
        <div class="rarity-badge">${rarity}%</div>
      </div>
    `;
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

  function getRarityColor(rarity) {
    // Muted green palette - darker = rarer
    if (rarity <= 10) return '#2d5e45';
    if (rarity <= 25) return '#3b7156';
    if (rarity <= 50) return '#4a8b6a';
    if (rarity <= 75) return '#6a9e80';
    return '#8ab59a';
  }

  // ===== STRIKES DISPLAY =====
  function updateStrikesDisplay() {
    const strikesEl = document.getElementById('strikes-display');
    if (!strikesEl) return;
    let html = '';
    for (let i = 0; i < MAX_STRIKES; i++) {
      if (i < strikes) {
        html += '<span class="strike-dot used"></span>';
      } else {
        html += '<span class="strike-dot"></span>';
      }
    }
    strikesEl.innerHTML = html;

    // Update strikes count (shows strikes used, not remaining)
    const attemptsEl = document.getElementById('attempts-count');
    if (attemptsEl) {
      attemptsEl.textContent = `${strikes} / ${MAX_STRIKES}`;
    }

    const counterEl = document.getElementById('guess-counter');
    if (strikes >= 2) {
      counterEl.classList.add('low');
    } else {
      counterEl.classList.remove('low');
    }
  }

  function updateCornerRarity() {
    const el = document.getElementById('corner-rarity');
    if (!el) return;
    const count = Object.keys(rarityScores).length;
    if (count === 0) {
      el.innerHTML = '';
      return;
    }
    let total = 0;
    for (const key in rarityScores) {
      total += rarityScores[key];
    }
    const avg = Math.round(total / count);
    el.innerHTML = `<div class="corner-rarity-display"><span class="corner-rarity-value">${avg}%</span><span class="corner-rarity-label">Rarity</span></div>`;
    // Also hide the subheader badge
    const badge = document.getElementById('subheader-rarity');
    if (badge) badge.style.display = 'none';
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

    modal.classList.add('active');
    input.value = '';
    input.focus();
    renderSearchResults('');
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

      if (strikes >= MAX_STRIKES) {
        closeSearchModal();
        endGame(false);
      }
    }
  }

  function showGuessError(player, matchesRow, matchesCol, rowCat, colCat) {
    const errorDiv = document.getElementById('guess-error');
    let msg = `${player.name} doesn't match: `;
    const misses = [];
    if (!matchesRow) misses.push(rowCat.shortLabel);
    if (!matchesCol) misses.push(colCat.shortLabel);
    msg += misses.join(' & ');

    errorDiv.textContent = msg;
    errorDiv.classList.add('show');
    setTimeout(() => errorDiv.classList.remove('show'), 2500);
  }

  // ===== GAME STATE =====
  function endGame(won) {
    gameOver = true;
    document.getElementById('game-over-modal').classList.add('active');
    renderGameOverStats(won);
    saveState();
  }

  function renderGameOverStats(won) {
    const statsEl = document.getElementById('game-over-stats');
    const answeredCount = Object.keys(answers).length;
    const totalCells = 9;

    let totalRarity = 0;
    let count = 0;
    for (const key in rarityScores) {
      totalRarity += rarityScores[key];
      count++;
    }
    const avgRarity = count > 0 ? Math.round(totalRarity / count) : 0;

    const title = document.querySelector('.game-over-title');
    if (won) {
      title.textContent = 'Grid Complete!';
      title.style.color = '#2d6a4f';
    } else {
      title.textContent = '3 Strikes - Game Over!';
      title.style.color = '#e76f51';
    }

    statsEl.innerHTML = `
      <div class="stat-row">
        <span class="stat-label">Cells Filled</span>
        <span class="stat-value">${answeredCount}/${totalCells}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Strikes</span>
        <span class="stat-value">${strikes}/${MAX_STRIKES}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Avg Rarity Score</span>
        <span class="stat-value">${avgRarity}%</span>
      </div>
      <div class="stat-row rarity-explanation">
        <small>Lower rarity = more unique answers!</small>
      </div>
    `;
  }

  // ===== SHARE =====
  function buildShareText() {
    const totalCells = 9;
    const gridNum = getGridNumber(grid.date);
    const strikesStr = '\u274c'.repeat(strikes) + '\u26aa'.repeat(MAX_STRIKES - strikes);
    let shareText = `ATP Grid #${gridNum}\n`;
    shareText += `Score: ${Object.keys(answers).length}/${totalCells} | Strikes: ${strikesStr}\n\n`;

    for (let r = 0; r < 3; r++) {
      let row = '';
      for (let c = 0; c < 3; c++) {
        const key = `r${r}c${c}`;
        if (answers[key]) {
          const rarity = rarityScores[key] || 50;
          if (rarity <= 10) row += '\ud83d\udfe2';
          else if (rarity <= 25) row += '\ud83d\udfe9';
          else if (rarity <= 50) row += '\ud83d\udfe8';
          else if (rarity <= 75) row += '\ud83d\udfe7';
          else row += '\ud83d\udfe5';
        } else {
          row += '\u2b1c';
        }
      }
      shareText += row + '\n';
    }
    shareText += '\natpgrid.com';
    return shareText;
  }

  function buildSharePreviewHTML() {
    const totalCells = 9;
    const gridNum = getGridNumber(grid.date);
    const strikesStr = '\u274c'.repeat(strikes) + '\u26aa'.repeat(MAX_STRIKES - strikes);

    let gridRows = '';
    for (let r = 0; r < 3; r++) {
      let row = '';
      for (let c = 0; c < 3; c++) {
        const key = `r${r}c${c}`;
        if (answers[key]) {
          const rarity = rarityScores[key] || 50;
          if (rarity <= 10) row += '\ud83d\udfe2';
          else if (rarity <= 25) row += '\ud83d\udfe9';
          else if (rarity <= 50) row += '\ud83d\udfe8';
          else if (rarity <= 75) row += '\ud83d\udfe7';
          else row += '\ud83d\udfe5';
        } else {
          row += '\u2b1c';
        }
      }
      gridRows += `<div class="share-grid-row">${row}</div>`;
    }

    return `
      <div class="share-title">ATP Grid #${gridNum}</div>
      <div class="share-score">Score: ${Object.keys(answers).length}/${totalCells} | Strikes: ${strikesStr}</div>
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

    list.innerHTML = '';
    dates.forEach((dateStr, idx) => {
      const item = document.createElement('div');
      item.className = 'archive-item';
      if (idx === 0) item.classList.add('today');

      // Check if this grid was completed
      const saved = getSavedStateForDate(dateStr);
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

    // Load saved state for this date
    const saved = getSavedStateForDate(dateStr);
    if (saved) {
      answers = saved.answers || {};
      usedPlayers = new Set(saved.usedPlayers || []);
      strikes = saved.strikes ?? 0;
      gameOver = saved.gameOver || false;
      rarityScores = saved.rarityScores || {};
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

  function getSavedStateForDate(dateStr) {
    try {
      return JSON.parse(localStorage.getItem(`atpgrid_${dateStr}`));
    } catch (e) {
      return null;
    }
  }

  // ===== PERSISTENCE =====
  function saveState() {
    const dateStr = grid.date;
    const state = {
      date: dateStr,
      answers,
      usedPlayers: Array.from(usedPlayers),
      strikes,
      gameOver,
      rarityScores
    };
    localStorage.setItem(`atpgrid_${dateStr}`, JSON.stringify(state));
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
      }
    });

    document.getElementById('close-search').addEventListener('click', closeSearchModal);
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

    // How to play
    document.getElementById('how-to-play-btn').addEventListener('click', () => {
      document.getElementById('how-to-play-modal').classList.add('active');
    });
    document.getElementById('close-how-to-play').addEventListener('click', () => {
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
