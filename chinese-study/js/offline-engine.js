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
      return this._format(nextBeat, this._checkCorrection(userText, beat));
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

    _normalize(s) { return String(s).toLowerCase().replace(/[\s　]/g, ''); }

    _checkCorrection(userText, beat) {
      if (!userText || !beat.corrections) return null;
      for (const c of beat.corrections) {
        if (userText.includes(c.wrong)) return `「${c.wrong}」→「${c.correct}」${c.note ? ': ' + c.note : ''}`;
      }
      return null;
    }

    _format(beat, correction) {
      return {
        reply_zh:   beat.reply_zh,
        reply_jp:   beat.reply_jp,
        pinyin:     beat.pinyin || '',
        correction: correction || beat.correction || null,
        vocabulary: beat.vocabulary || [],
        isEnd:      beat.id === 'end'
      };
    }

    _endResponse() {
      return {
        reply_zh: '谢谢！再见！', reply_jp: 'ありがとうございます！またね！',
        pinyin: 'Xièxie! Zàijiàn!', correction: null,
        vocabulary: [{ zh: '谢谢', jp: 'ありがとう', pinyin: 'xièxie' }, { zh: '再见', jp: 'さようなら', pinyin: 'zàijiàn' }],
        isEnd: true
      };
    }

    _errorResponse() {
      return {
        reply_zh: '对不起，请重新开始。', reply_jp: '申し訳ありません。もう一度始めてください。',
        pinyin: 'Duìbuqǐ, qǐng chóngxīn kāishǐ.', correction: null, vocabulary: [], isEnd: true
      };
    }
  }

  const _cache = {};

  async function loadScript(scenarioId) {
    if (_cache[scenarioId]) return _cache[scenarioId];
    const res = await fetch(SCRIPT_BASE + scenarioId + '.json');
    if (!res.ok) throw new Error('Script not found: ' + scenarioId);
    const script = await res.json();
    _cache[scenarioId] = script;
    return script;
  }

  async function createEngine(scenarioId) {
    return new OfflineEngine(await loadScript(scenarioId));
  }

  window.OfflineConversation = { createEngine };
})();
