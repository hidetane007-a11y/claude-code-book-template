(function () {
  const _isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  async function _speakNative(text, lang) {
    const TTS = window.Capacitor.Plugins.TextToSpeech;
    if (!TTS) return;
    try { await TTS.stop(); } catch (_) {}
    try {
      await TTS.speak({ text, lang: lang || 'zh-CN', rate: 0.85, pitch: 1.0, volume: 1.0, category: 'ambient' });
    } catch (e) { console.warn('Native TTS:', e); }
  }

  const _synth = _isNative ? null : (window.speechSynthesis || null);
  let _unlocked = false;

  function _unlock() {
    if (_unlocked || !_synth) return;
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    _synth.speak(u);
    _unlocked = true;
  }

  if (_synth) {
    _synth.getVoices();
    _synth.addEventListener('voiceschanged', () => _synth.getVoices());
    document.addEventListener('touchstart', _unlock, { once: true, passive: true });
    document.addEventListener('click', _unlock, { once: true });
  }

  function _doSpeakWeb(text, lang) {
    const voices = _synth.getVoices();
    if (voices.length === 0) {
      const retry = () => { _synth.removeEventListener('voiceschanged', retry); _doSpeakWeb(text, lang); };
      _synth.addEventListener('voiceschanged', retry);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.85;
    u.pitch = 1;
    u.onerror = e => { if (e.error !== 'interrupted') console.warn('speak:', e.error); };
    const zhVoice = voices.find(v => v.lang === lang || v.lang.startsWith('zh'));
    if (zhVoice) u.voice = zhVoice;
    _synth.speak(u);
    if (_isIOS) setTimeout(() => { if (_synth.paused) _synth.resume(); }, 150);
  }

  function speak(text, lang) {
    lang = lang || 'zh-CN';
    if (_isNative) { _speakNative(text, lang); return; }
    if (!_synth) return;
    if (_synth.speaking || _synth.pending) {
      _synth.cancel();
      setTimeout(() => _doSpeakWeb(text, lang), 250);
    } else {
      _doSpeakWeb(text, lang);
    }
  }

  function canAutoplay() { return _isNative || !_isIOS; }

  let _recognition = null;
  let _listening = false;

  function startListening(lang, onResult, onError) {
    lang = lang || 'zh-CN';
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { if (onError) onError('not_supported'); return; }
    if (_listening) stopListening();
    _recognition = new SR();
    _recognition.lang = lang;
    _recognition.interimResults = true;
    _recognition.continuous = false;
    _recognition.maxAlternatives = 1;
    _recognition.onstart  = () => { _listening = true; };
    _recognition.onresult = (e) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (final && onResult) onResult(final, true);
      else if (interim && onResult) onResult(interim, false);
    };
    _recognition.onerror = (e) => { _listening = false; if (onError) onError(e.error); };
    _recognition.onend   = () => { _listening = false; };
    try { _recognition.start(); } catch (e) { _listening = false; if (onError) onError('start_failed'); }
  }

  function stopListening() {
    if (_recognition && _listening) try { _recognition.stop(); } catch {}
    _listening = false;
  }

  function isListening() { return _listening; }

  window.ChineseSpeech = { speak, startListening, stopListening, isListening, canAutoplay };
})();
