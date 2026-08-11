(function () {
  const SCRIPT_BASE = './data/scripts/';
  const MAX_TURNS = 20;

  class OfflineEngine {
    constructor(script) {
      this.script = script;
      this.beatsMap = {};
      this.currentBeatId = 'start';
      this.turnCount = 0;
      script.beats.forEach(b => { this.beatsMap[b.id] = b; });
    }

    getOpener() {
      const beat = this.beatsMap['start'];
      if (!beat) return this._errorResponse();
      return this._format(beat, null);
    }

    processInput(userText) {
      this.turnCount++;
      const beat = this.beatsMap[this.currentBeatId];
      if (!beat) return this._errorResponse();

      const nextId = this._matchTransition(userText, beat.transitions);
      const nextBeat = this.beatsMap[nextId];
      if (!nextBeat) return this._endResponse();

      this.currentBeatId = nextId;
      return this._format(nextBeat, null);
    }

    isComplete() {
      return this.currentBeatId === 'end' || this.turnCount >= MAX_TURNS;
    }

    _matchTransition(input, transitions) {
      if (!transitions || !transitions.length) return 'end';
      const norm = this._normalize(input);
      for (const t of transitions) {
        if (t.default) continue;
        for (const kw of (t.keywords || [])) {
          if (norm.includes(this._normalize(kw))) return t.next;
        }
      }
      const def = transitions.find(t => t.default);
      return def ? def.next : 'end';
    }

    _normalize(s) {
      return String(s).toLowerCase().replace(/[\s　]/g, '');
    }

    _format(beat, correction) {
      return {
        reply_en:   beat.reply_en,
        reply_jp:   beat.reply_jp,
        correction: correction || null,
        vocabulary: beat.vocabulary || [],
        isEnd:      beat.id === 'end'
      };
    }

    _endResponse() {
      return {
        reply_en:   'Thank you! Great conversation practice!',
        reply_jp:   'ありがとうございます！素晴らしい練習でした！',
        correction: null,
        vocabulary: [],
        isEnd: true
      };
    }

    _errorResponse() {
      return {
        reply_en:   "I'm sorry, please start over.",
        reply_jp:   '申し訳ありません。もう一度始めてください。',
        correction: null,
        vocabulary: [],
        isEnd: true
      };
    }
  }

  const _cache = {};

  async function loadScript(scenarioId) {
    if (_cache[scenarioId]) return _cache[scenarioId];
    const url = SCRIPT_BASE + scenarioId + '.json';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Script not found: ' + scenarioId);
    const script = await res.json();
    _cache[scenarioId] = script;
    return script;
  }

  async function createEngine(scenarioId) {
    const script = await loadScript(scenarioId);
    return new OfflineEngine(script);
  }

  window.OfflineConversation = { createEngine };
})();
