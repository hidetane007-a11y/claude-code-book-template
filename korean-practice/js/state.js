/**
 * state.js - localStorage を使った状態管理
 */

const STATE_KEY = 'korean-practice-state';

const DEFAULT_STATE = {
  streak: { count: 0, lastDate: null },
  conversation: { completedScenarios: [], totalSessions: 0 },
  hada: { currentStage: 1, completedStages: [], drillResults: {} },
  vowels: { completed: [], inProgress: null },
  wordbook: []
};

function getState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    const saved = JSON.parse(raw);
    // マージ（新しいキーがあれば追加）
    return deepMerge(JSON.parse(JSON.stringify(DEFAULT_STATE)), saved);
  } catch (e) {
    console.warn('[state] Failed to load state:', e);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('[state] Failed to save state:', e);
  }
}

function updateStreak() {
  const state = getState();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const last = state.streak.lastDate;

  if (last === today) {
    // 既に今日更新済み
    return state.streak.count;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (last === yesterday) {
    state.streak.count += 1;
  } else {
    state.streak.count = 1;
  }
  state.streak.lastDate = today;
  saveState(state);
  return state.streak.count;
}

function addWord(word) {
  // word: { kr, jp, source }
  const state = getState();
  // 重複チェック
  const exists = state.wordbook.some(w => w.kr === word.kr);
  if (!exists) {
    state.wordbook.push({
      ...word,
      addedAt: new Date().toISOString()
    });
    saveState(state);
    return true;
  }
  return false;
}

function removeWord(kr) {
  const state = getState();
  state.wordbook = state.wordbook.filter(w => w.kr !== kr);
  saveState(state);
}

function getWords() {
  const state = getState();
  return state.wordbook || [];
}

function markVowelCompleted(char) {
  const state = getState();
  if (!state.vowels.completed.includes(char)) {
    state.vowels.completed.push(char);
  }
  state.vowels.inProgress = null;
  saveState(state);
}

function setVowelInProgress(char) {
  const state = getState();
  state.vowels.inProgress = char;
  saveState(state);
}

function completeDrillStage(stage, score) {
  const state = getState();
  state.hada.drillResults[stage] = score;
  if (!state.hada.completedStages.includes(stage)) {
    state.hada.completedStages.push(stage);
  }
  // 次のステージを解放
  if (stage >= state.hada.currentStage) {
    state.hada.currentStage = stage + 1;
  }
  saveState(state);
}

function completeConversationSession(scenarioId) {
  const state = getState();
  if (!state.conversation.completedScenarios.includes(scenarioId)) {
    state.conversation.completedScenarios.push(scenarioId);
  }
  state.conversation.totalSessions += 1;
  saveState(state);
}

// ユーティリティ
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// グローバルに公開
window.KoreanState = {
  getState,
  saveState,
  updateStreak,
  addWord,
  removeWord,
  getWords,
  markVowelCompleted,
  setVowelInProgress,
  completeDrillStage,
  completeConversationSession
};
