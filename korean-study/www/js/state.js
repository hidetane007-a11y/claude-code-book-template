(function () {
  const KEY = 'korean-study-v1';

  const DEFAULTS = {
    streak: { count: 0, lastDate: null },
    conversation: { completedScenarios: [], totalSessions: 0 },
    drill: { currentStage: 1, completedStages: [], results: {} },
    vowels: { completed: [], current: null },
    wordbook: []
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

  function addWord(word) {
    const s = getState();
    if (s.wordbook.some(w => w.kr === word.kr)) return false;
    s.wordbook.push({ ...word, addedAt: new Date().toISOString() });
    saveState(s);
    return true;
  }

  function removeWord(kr) {
    const s = getState();
    s.wordbook = s.wordbook.filter(w => w.kr !== kr);
    saveState(s);
  }

  function getWords() { return getState().wordbook || []; }

  function markVowelDone(char) {
    const s = getState();
    if (!s.vowels.completed.includes(char)) s.vowels.completed.push(char);
    s.vowels.current = null;
    saveState(s);
  }

  function completeDrillStage(stage, score) {
    const s = getState();
    s.drill.results[stage] = score;
    if (!s.drill.completedStages.includes(stage)) s.drill.completedStages.push(stage);
    if (stage >= s.drill.currentStage) s.drill.currentStage = stage + 1;
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

  window.KoreanState = {
    getState, saveState, updateStreak,
    addWord, removeWord, getWords,
    markVowelDone, completeDrillStage, completeConversation
  };
})();
