(function () {
  const SCRIPT_BASE = './data/scripts/';
  const MAX_TURNS = 20;

  class OfflineEngine {
    constructor(script) {
      this.script = script;
      this.beatsMap = {};
      this.currentBeatId = 'start';
      this.turnCount = 0;
      this.history = [];
      script.beats.forEach(b => { this.beatsMap[b.id] = b; });
    }

    getOpener() {
      const beat = this.beatsMap['start'];
      if (!beat) return this._errorResponse();
      this.history.push(beat.id);
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
      this.history.push(nextId);

      const correction = this._checkCorrection(userText, beat);
      return this._format(nextBeat, correction);
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

    _checkCorrection(userText, beat) {
      if (!userText || !beat.corrections) return null;
      for (const c of beat.corrections) {
        if (userText.includes(c.wrong)) {
          return `「${c.wrong}」→「${c.correct}」${c.note ? ': ' + c.note : ''}`;
        }
      }
      return null;
    }

    _format(beat, correction) {
      return {
        reply_kr:     beat.reply_kr,
        reply_jp:     beat.reply_jp,
        romanization: beat.romanization || '',
        correction:   correction || beat.correction || null,
        vocabulary:   beat.vocabulary || [],
        isEnd:        beat.id === 'end'
      };
    }

    _endResponse() {
      return {
        reply_kr: '감사합니다! 또 연습해요!',
        reply_jp: 'ありがとうございます！また練習しましょう！',
        romanization: 'Gamsahamnida! Ddo yeonseupaeyo!',
        correction: null,
        vocabulary: [{ kr: '감사합니다', jp: 'ありがとうございます' }, { kr: '또', jp: 'また' }],
        isEnd: true
      };
    }

    _errorResponse() {
      return {
        reply_kr: '죄송합니다. 다시 시작해 주세요.',
        reply_jp: '申し訳ありません。もう一度始めてください。',
        romanization: 'Joesonghamnida.',
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
