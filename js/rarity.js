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
        // Initialize Analytics if measurementId is configured
        if (FIREBASE_CONFIG.measurementId && FIREBASE_CONFIG.measurementId !== 'G-XXXXXXXXXX' && typeof firebase.analytics === 'function') {
          firebase.analytics();
          console.log('[Analytics] Firebase Analytics initialized');
        }
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
      const liveRarity = (playerCount / total) * 100;

      // With few responses, live data is unreliable (1/1 = 100%)
      // Blend toward local estimate until we have enough data
      const MIN_RESPONSES = 20;
      if (total < MIN_RESPONSES) {
        const local = localRarity(dateStr, cellKey, playerId);
        const weight = total / MIN_RESPONSES; // 0 to 1
        const blended = local * (1 - weight) + liveRarity * weight;
        return Math.max(1, Math.min(99, Math.round(blended)));
      }
      return Math.max(1, Math.min(99, Math.round(liveRarity)));
    } catch (e) {
      console.warn('[Rarity] Firebase write failed:', e.message);
      return localRarity(dateStr, cellKey, playerId);
    }
  }

  // Get rarity for a previously answered cell (from cache or Firebase)
  async function getRarity(dateStr, cellKey, playerId) {
    init();

    function blendRarity(data, dateStr, cellKey, playerId) {
      const playerCount = data[playerId] || 0;
      const total = data['_total'] || 1;
      const liveRarity = (playerCount / total) * 100;
      const MIN_RESPONSES = 20;
      if (total < MIN_RESPONSES) {
        const local = localRarity(dateStr, cellKey, playerId);
        const weight = total / MIN_RESPONSES;
        return Math.max(1, Math.min(99, Math.round(local * (1 - weight) + liveRarity * weight)));
      }
      return Math.max(1, Math.min(99, Math.round(liveRarity)));
    }

    // Check cache first
    if (cache[dateStr] && cache[dateStr][cellKey]) {
      return blendRarity(cache[dateStr][cellKey], dateStr, cellKey, playerId);
    }

    if (!db) {
      return localRarity(dateStr, cellKey, playerId);
    }

    try {
      const snapshot = await db.ref(`rarity/${dateStr}/${cellKey}`).once('value');
      const data = snapshot.val() || {};

      if (!cache[dateStr]) cache[dateStr] = {};
      cache[dateStr][cellKey] = data;

      return blendRarity(data, dateStr, cellKey, playerId);
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
  // Higher % = more people would pick this player (common), lower % = more unique (rare)
  function localRarity(dateStr, cellKey, playerId) {
    const player = PLAYERS.find(p => p.id === playerId);
    if (!player) return 50;

    // Fame score 0-100: more famous = more people pick them
    const totalSlams = player.grandSlams.ao + player.grandSlams.rg + player.grandSlams.w + player.grandSlams.uso;
    const fame = Math.min(100,
      totalSlams * 8 +
      player.titles * 0.5 +
      (player.yearEndNo1 ? 15 : 0) +
      (player.careerWins > 500 ? 10 : 0)
    );

    // Pool size: more valid answers = each player is less likely to be picked
    let poolSize = 20;
    if (_gridContext && _gridContext.validAnswers) {
      const [ri, ci] = cellKey.replace('r', '').split('c').map(Number);
      const validIds = _gridContext.validAnswers[ri]?.[ci];
      if (validIds) poolSize = Math.max(1, validIds.length);
    }

    // Estimate: what % of people would pick this player?
    // With a large pool, even famous players have lower rarity
    // Base: 1/poolSize is the "random chance" baseline
    // Famous players get picked more, but scale reasonably
    const baseChance = (1 / poolSize) * 100;
    const fameMultiplier = 1 + (fame / 25); // 1x to 5x for fame
    const rarity = Math.round(baseChance * fameMultiplier);

    return Math.max(1, Math.min(99, rarity));
  }

  // Record a grid completion with penalized avg rarity score
  // Uses a histogram bucket system (0-100 in 1% increments) for efficient percentile calculation
  async function recordCompletion(dateStr, penalizedAvgRarity) {
    init();
    if (!db) return null;

    const bucket = Math.min(100, Math.max(0, Math.round(penalizedAvgRarity)));
    const ref = db.ref(`completions/${dateStr}`);

    try {
      // Increment the bucket count and total
      await ref.child(`buckets/${bucket}`).transaction(current => (current || 0) + 1);
      await ref.child('total').transaction(current => (current || 0) + 1);
      return await getPercentile(dateStr, penalizedAvgRarity);
    } catch (e) {
      console.warn('[Rarity] Completion record failed:', e.message);
      return null;
    }
  }

  // Calculate real percentile: what % of players have a HIGHER (worse) avg rarity than you
  async function getPercentile(dateStr, penalizedAvgRarity) {
    init();
    if (!db) return null;

    const bucket = Math.min(100, Math.max(0, Math.round(penalizedAvgRarity)));

    try {
      const snapshot = await db.ref(`completions/${dateStr}`).once('value');
      const data = snapshot.val();
      if (!data || !data.buckets || !data.total) return null;

      const total = data.total;
      if (total < 10) return null; // Not enough data yet

      // Count players with a HIGHER avg rarity (worse than you)
      let higherCount = 0;
      for (let i = bucket + 1; i <= 100; i++) {
        higherCount += (data.buckets[i] || 0);
      }

      return Math.round((higherCount / total) * 100);
    } catch (e) {
      console.warn('[Rarity] Percentile fetch failed:', e.message);
      return null;
    }
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
    isLive,
    recordCompletion,
    getPercentile
  };
})();
