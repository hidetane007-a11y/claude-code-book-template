(function () {
  const KEY = 'chinese-study-v1';

  const DEFAULTS = {
    streak: { count: 0, lastDate: null },
    conversation: { completedScenarios: [], totalSessions: 0 },
    tones: { currentStage: 1, completedStages: [], results: {} },
    pinyin: { completed: [] },
    measureWords: { currentSet: 1, completedSets: [], results: {} },
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
    if (s.wordbook.some(w => w.zh === word.zh)) return false;
    s.wordbook.push({ ...word, addedAt: new Date().toISOString() });
    saveState(s);
    return true;
  }

  function removeWord(zh) {
    const s = getState();
    s.wordbook = s.wordbook.filter(w => w.zh !== zh);
    saveState(s);
  }

  function getWords() { return getState().wordbook || []; }

  function completeToneStage(stage, score) {
    const s = getState();
    s.tones.results[stage] = score;
    if (!s.tones.completedStages.includes(stage)) s.tones.completedStages.push(stage);
    if (stage >= s.tones.currentStage) s.tones.currentStage = stage + 1;
    saveState(s);
  }

  function markPinyinDone(char) {
    const s = getState();
    if (!s.pinyin.completed.includes(char)) s.pinyin.completed.push(char);
    saveState(s);
  }

  function completeMeasureSet(setId, score) {
    const s = getState();
    s.measureWords.results[setId] = score;
    if (!s.measureWords.completedSets.includes(setId)) s.measureWords.completedSets.push(setId);
    if (setId >= s.measureWords.currentSet) s.measureWords.currentSet = setId + 1;
    saveState(s);
  }

  function completeConversation(scenarioId) {
    const s = getState();
    if (!s.conversation.completedScenarios.includes(scenarioId)) {
      s.conversation.completedScenarios.push(scenarioId);
    }
    s.conversation.totalSessions++;
    saveState(s);
  }

  window.ChineseState = {
    getState, updateStreak,
    addWord, removeWord, getWords,
    completeToneStage, markPinyinDone,
    completeMeasureSet, completeConversation
  };
})();
