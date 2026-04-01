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

  // ===== INITIALIZATION =====
  function init() {
    grid = generateDailyGrid();
    renderGrid();
    updateStrikesDisplay();
    setupEventListeners();
    loadSavedState();
    renderArchiveList();
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
    corner.innerHTML = '<div class="corner-logo"><span class="logo-atp">ATP</span><span class="logo-grid">GRID</span></div>';
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

    const rarity = rarityScores[cellKey] || calculateRarity(cellKey, playerId);
    const rarityColor = getRarityColor(rarity);

    cell.className = 'grid-cell data-cell answered';
    cell.innerHTML = `
      <div class="cell-answered" style="background: ${rarityColor}">
        <img class="player-photo" src="${player.photoUrl}" alt="${player.name}" onerror="this.style.display='none'">
        <div class="player-name-cell">${getShortName(player.name)}</div>
        <div class="rarity-badge">${rarity}%</div>
      </div>
    `;
  }

  function getShortName(name) {
    const parts = name.split(' ');
    if (parts.length <= 2) return name;
    return parts[0][0] + '. ' + parts.slice(-1)[0];
  }

  function calculateRarity(cellKey, playerId) {
    const [ri, ci] = cellKey.replace('r', '').split('c').map(Number);
    const validIds = grid.validAnswers[ri]?.[ci];
    if (!validIds || validIds.length === 0) return 100;

    const player = PLAYERS.find(p => p.id === playerId);
    if (!player) return 50;

    const totalSlams = player.grandSlams.ao + player.grandSlams.rg + player.grandSlams.w + player.grandSlams.uso;
    const fame = Math.min(100, totalSlams * 8 + player.titles * 0.5 + (player.yearEndNo1 ? 15 : 0) + (player.careerWins > 500 ? 10 : 0));
    const optionsFactor = Math.max(1, validIds.length);
    const rarity = Math.max(1, Math.min(99, Math.round(fame / optionsFactor * 3)));

    rarityScores[cellKey] = rarity;
    return rarity;
  }

  function getRarityColor(rarity) {
    if (rarity <= 10) return 'rgba(45, 106, 79, 0.95)';
    if (rarity <= 25) return 'rgba(45, 106, 79, 0.75)';
    if (rarity <= 50) return 'rgba(82, 183, 136, 0.7)';
    if (rarity <= 75) return 'rgba(244, 162, 97, 0.7)';
    return 'rgba(231, 111, 81, 0.75)';
  }

  // ===== STRIKES DISPLAY =====
  function updateStrikesDisplay() {
    const strikesEl = document.getElementById('strikes-display');
    if (!strikesEl) return;
    let html = '';
    for (let i = 0; i < MAX_STRIKES; i++) {
      if (i < strikes) {
        html += '<span class="strike-x used">X</span>';
      } else {
        html += '<span class="strike-x">X</span>';
      }
    }
    strikesEl.innerHTML = html;

    const counterEl = document.getElementById('guess-counter');
    if (strikes >= 2) {
      counterEl.classList.add('low');
    } else {
      counterEl.classList.remove('low');
    }
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
    headerInfo.innerHTML = `
      <span class="modal-cat">${getCategoryIcon(rowCat.id)} ${rowCat.shortLabel}</span>
      <span class="modal-x">&times;</span>
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
      item.innerHTML = `
        <img class="search-photo" src="${player.photoUrl}" alt="" onerror="this.style.display='none'">
        <div class="search-info">
          <div class="search-name">${player.name}</div>
          <div class="search-country">${getCountryFlag(player.country)} ${player.country}</div>
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

      closeSearchModal();
      renderGrid();
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
    let shareText = `ATP Grid ${grid.date}\n`;
    shareText += `${Object.keys(answers).length}/${totalCells} | Strikes: ${'X'.repeat(strikes)}${'_'.repeat(MAX_STRIKES - strikes)}\n\n`;

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

  function shareResults() {
    const text = buildShareText();

    // Always show the share modal with the text + try clipboard
    const modal = document.getElementById('share-text-modal');
    const textarea = document.getElementById('share-text-area');
    const status = document.getElementById('share-copy-status');

    if (modal && textarea) {
      textarea.value = text;
      modal.classList.add('active');

      // Try to auto-copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          if (status) {
            status.textContent = 'Copied to clipboard!';
            status.className = 'share-status success';
          }
        }).catch(() => {
          tryExecCopy(textarea, status);
        });
      } else {
        tryExecCopy(textarea, status);
      }
    }
  }

  function tryExecCopy(textarea, status) {
    textarea.focus();
    textarea.select();
    try {
      const ok = document.execCommand('copy');
      if (ok && status) {
        status.textContent = 'Copied to clipboard!';
        status.className = 'share-status success';
      } else if (status) {
        status.textContent = 'Select all and copy manually';
        status.className = 'share-status manual';
      }
    } catch (e) {
      if (status) {
        status.textContent = 'Select all and copy manually';
        status.className = 'share-status manual';
      }
    }
  }

  // ===== ARCHIVE =====
  function getArchiveDates() {
    // Generate dates going back 30 days (today + 29 previous days)
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
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

      let statusIcon = '';
      if (completed && answeredCount === 9) statusIcon = '<span class="archive-status complete">9/9</span>';
      else if (completed) statusIcon = `<span class="archive-status partial">${answeredCount}/9</span>`;
      else if (answeredCount > 0) statusIcon = `<span class="archive-status in-progress">${answeredCount}/9</span>`;

      item.innerHTML = `
        <div class="archive-date-info">
          <span class="archive-day">${dayName}</span>
          <span class="archive-date">${dateLabel}</span>
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
    updateDateDisplay(dateStr);

    // Close archive panel on mobile
    document.getElementById('archive-panel')?.classList.remove('open');

    if (gameOver) {
      endGame(Object.keys(answers).length >= 9);
    }
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

    // Archive toggle
    document.getElementById('archive-btn')?.addEventListener('click', () => {
      const panel = document.getElementById('archive-panel');
      panel.classList.toggle('open');
    });
    document.getElementById('close-archive')?.addEventListener('click', () => {
      document.getElementById('archive-panel').classList.remove('open');
    });
  }

  // ===== BOOT =====
  document.addEventListener('DOMContentLoaded', init);
})();
