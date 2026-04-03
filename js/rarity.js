// ATP Grid - Real-Time Rarity Scoring
// Records player selections to Firebase and calculates live rarity percentages.
// Falls back to local estimation when Firebase is not configured.

const RarityService = (function() {
  'use strict';

  let db = null;
  let initialized = false;
  let cache = {}; // { "dateStr": { "cellKey": { playerId: count, _total: count } } }

  function init() {
    if (initialized) return;
    initialized = true;

    if (typeof FIREBASE_ENABLED !== 'undefined' && FIREBASE_ENABLED && typeof firebase !== 'undefined') {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(FIREBASE_CONFIG);
        }
        db = firebase.database();
        console.log('[Rarity] Firebase connected');
      } catch (e) {
        console.warn('[Rarity] Firebase init failed, using local fallback:', e.message);
        db = null;
      }
    } else {
      console.log('[Rarity] Firebase not configured, using local rarity estimation');
    }
  }

  // Record a player selection and return the live rarity %
  async function recordSelection(dateStr, cellKey, playerId) {
    init();

    if (!db) {
      return localRarity(dateStr, cellKey, playerId);
    }

    const cellRef = db.ref(`rarity/${dateStr}/${cellKey}`);

    try {
      // Atomic increment of this player's count and total
      await cellRef.child(playerId).transaction(current => (current || 0) + 1);
      await cellRef.child('_total').transaction(current => (current || 0) + 1);

      // Read the updated data
      const snapshot = await cellRef.once('value');
      const data = snapshot.val() || {};

      // Cache it
      if (!cache[dateStr]) cache[dateStr] = {};
      cache[dateStr][cellKey] = data;

      const playerCount = data[playerId] || 0;
      const total = data['_total'] || 1;
      return Math.max(1, Math.min(99, Math.round((playerCount / total) * 100)));
    } catch (e) {
      console.warn('[Rarity] Firebase write failed:', e.message);
      return localRarity(dateStr, cellKey, playerId);
    }
  }

  // Get rarity for a previously answered cell (from cache or Firebase)
  async function getRarity(dateStr, cellKey, playerId) {
    init();

    // Check cache first
    if (cache[dateStr] && cache[dateStr][cellKey]) {
      const data = cache[dateStr][cellKey];
      const playerCount = data[playerId] || 0;
      const total = data['_total'] || 1;
      return Math.max(1, Math.min(99, Math.round((playerCount / total) * 100)));
    }

    if (!db) {
      return localRarity(dateStr, cellKey, playerId);
    }

    try {
      const snapshot = await db.ref(`rarity/${dateStr}/${cellKey}`).once('value');
      const data = snapshot.val() || {};

      if (!cache[dateStr]) cache[dateStr] = {};
      cache[dateStr][cellKey] = data;

      const playerCount = data[playerId] || 0;
      const total = data['_total'] || 1;
      return Math.max(1, Math.min(99, Math.round((playerCount / total) * 100)));
    } catch (e) {
      return localRarity(dateStr, cellKey, playerId);
    }
  }

  // Preload all rarity data for a grid date
  async function preloadDate(dateStr) {
    init();
    if (!db) return;

    try {
      const snapshot = await db.ref(`rarity/${dateStr}`).once('value');
      const data = snapshot.val();
      if (data) {
        cache[dateStr] = data;
      }
    } catch (e) {
      console.warn('[Rarity] Preload failed:', e.message);
    }
  }

  // Listen for real-time updates on a grid date
  function listenForUpdates(dateStr, onUpdate) {
    init();
    if (!db) return null;

    const ref = db.ref(`rarity/${dateStr}`);
    ref.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        cache[dateStr] = data;
        if (onUpdate) onUpdate(data);
      }
    });

    // Return unsubscribe function
    return () => ref.off('value');
  }

  // Set grid context for local fallback calculations
  let _gridContext = null;
  function setGridContext(grid) {
    _gridContext = grid;
  }

  // Local fallback: estimate rarity based on player fame + pool size
  function localRarity(dateStr, cellKey, playerId) {
    const player = PLAYERS.find(p => p.id === playerId);
    if (!player) return 50;

    // Fame score: more famous = higher rarity % (more people pick them)
    const totalSlams = player.grandSlams.ao + player.grandSlams.rg + player.grandSlams.w + player.grandSlams.uso;
    const fame = Math.min(100,
      totalSlams * 8 +
      player.titles * 0.5 +
      (player.yearEndNo1 ? 15 : 0) +
      (player.careerWins > 500 ? 10 : 0)
    );

    // Try to get valid answers count from grid context
    let optionsFactor = 20; // default
    if (_gridContext && _gridContext.validAnswers) {
      const [ri, ci] = cellKey.replace('r', '').split('c').map(Number);
      const validIds = _gridContext.validAnswers[ri]?.[ci];
      if (validIds) optionsFactor = Math.max(1, validIds.length);
    }

    return Math.max(1, Math.min(99, Math.round(fame / optionsFactor * 3)));
  }

  function isLive() {
    return db !== null;
  }

  return {
    recordSelection,
    getRarity,
    preloadDate,
    listenForUpdates,
    setGridContext,
    isLive
  };
})();
