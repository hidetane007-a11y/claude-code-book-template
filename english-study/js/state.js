(function () {
  const KEY = 'english-study-v1';

  const DEFAULTS = {
    streak: { count: 0, lastDate: null },
    conversation: { completedScenarios: [], totalSessions: 0 },
    drill: {
      verbTrack:    { currentStage: 1, completedStages: [], results: {} },
      patternTrack: { currentStage: 1, completedStages: [], results: {} }
    },
    pronunciation: { completed: [] },
    phrasebook: []
  };

  function deepMerge(target, src) {
    const out = Object.assign({}, target);
    for (const k of Object.keys(src)) {
      if (src[k] !== null && typeof src[k] === 'object' && !Array.isArray(src[k])) {
        out[k] = deepMerge(target[k] || {}, src[k]);
      } else {
        out[k] = src[k];
      }
    }
    return out;
  }

  function getState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULTS));
      return deepMerge(JSON.parse(JSON.stringify(DEFAULTS)), JSON.parse(raw));
    } catch {
      return JSON.parse(JSON.stringify(DEFAULTS));
    }
  }

  function saveState(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  }

  function updateStreak() {
    const s = getState();
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (s.streak.lastDate === today) return s.streak.count;
    s.streak.count = s.streak.lastDate === yesterday ? s.streak.count + 1 : 1;
    s.streak.lastDate = today;
    saveState(s);
    return s.streak.count;
  }

  function addPhrase(phrase) {
    const s = getState();
    if (s.phrasebook.some(p => p.en === phrase.en)) return false;
    s.phrasebook.push({ ...phrase, savedAt: new Date().toISOString() });
    saveState(s);
    return true;
  }

  function removePhrase(en) {
    const s = getState();
    s.phrasebook = s.phrasebook.filter(p => p.en !== en);
    saveState(s);
  }

  function getPhrases() { return getState().phrasebook || []; }

  function markPronunciationDone(id) {
    const s = getState();
    if (!s.pronunciation.completed.includes(id)) s.pronunciation.completed.push(id);
    saveState(s);
  }

  function completeDrillStage(track, stage, score) {
    const s = getState();
    const t = s.drill[track];
    t.results[stage] = score;
    if (!t.completedStages.includes(stage)) t.completedStages.push(stage);
    if (stage >= t.currentStage) t.currentStage = stage + 1;
    saveState(s);
  }

  function completeConversation(scenarioId) {
    const s = getState();
    if (!s.conversation.completedScenarios.includes(scenarioId)) {
      s.conversation.completedScenarios.push(scenarioId);
    }
    s.conversation.totalSessions += 1;
    saveState(s);
  }

  window.EnglishState = {
    getState, saveState, updateStreak,
    addPhrase, removePhrase, getPhrases,
    markPronunciationDone, completeDrillStage, completeConversation
  };
})();
