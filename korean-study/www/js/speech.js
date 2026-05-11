(function () {
  const _isNative = !!(
    window.Capacitor &&
    window.Capacitor.isNativePlatform &&
    window.Capacitor.isNativePlatform()
  );
  const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // ── ネイティブ TTS (Android / iOS) ──────────────────────────────
  async function _speakNative(text, lang) {
    const TTS = window.Capacitor.Plugins.TextToSpeech;
    if (!TTS) return;
    try {
      await TTS.stop();
      await TTS.speak({
        text: text,
        lang: lang || 'ko-KR',
        rate: 0.85,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient'
      });
    } catch (e) {
      console.warn('Native TTS:', e);
    }
  }

  // ── Web Speech API (ブラウザフォールバック) ──────────────────────
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
      const retry = () => {
        _synth.removeEventListener('voiceschanged', retry);
        _doSpeakWeb(text, lang);
      };
      _synth.addEventListener('voiceschanged', retry);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.85;
    u.pitch = 1;
    u.onerror = e => { if (e.error !== 'interrupted') console.warn('speak:', e.error); };
    const koVoice = voices.find(v => v.lang === lang || v.lang.startsWith('ko'));
    if (koVoice) u.voice = koVoice;
    _synth.speak(u);
    if (_isIOS) setTimeout(() => { if (_synth.paused) _synth.resume(); }, 150);
  }

  // ── Public: speak ────────────────────────────────────────────────
  function speak(text, lang) {
    lang = lang || 'ko-KR';
    if (_isNative) {
      _speakNative(text, lang);
      return;
    }
    if (!_synth) return;
    if (_synth.speaking || _synth.pending) {
      _synth.cancel();
      setTimeout(() => _doSpeakWeb(text, lang), 250);
    } else {
      _doSpeakWeb(text, lang);
    }
  }

  function canAutoplay() {
    return _isNative || !_isIOS;
  }

  // ── ネイティブ 音声認識 ─────────────────────────────────────────
  let _nativeListener = null;

  async function _startListeningNative(lang, onResult, onError) {
    const SR = window.Capacitor.Plugins.SpeechRecognition;
    if (!SR) { if (onError) onError('not_supported'); return; }
    try {
      const { available } = await SR.available();
      if (!available) { if (onError) onError('not_supported'); return; }

      const perm = await SR.requestPermissions();
      if (perm.speechRecognition !== 'granted') {
        if (onError) onError('permission_denied');
        return;
      }

      if (_nativeListener) { _nativeListener.remove(); _nativeListener = null; }
      _nativeListener = await SR.addListener('partialResults', (data) => {
        if (data.matches && data.matches.length > 0 && onResult) {
          onResult(data.matches[0], false);
        }
      });

      const result = await SR.start({
        language: lang || 'ko-KR',
        maxResults: 1,
        partialResults: true,
        popup: false
      });

      if (_nativeListener) { _nativeListener.remove(); _nativeListener = null; }
      if (result.matches && result.matches.length > 0 && onResult) {
        onResult(result.matches[0], true);
      }
    } catch (e) {
      if (_nativeListener) { _nativeListener.remove(); _nativeListener = null; }
      if (onError) onError(e.message || 'start_failed');
    }
  }

  // ── Web 音声認識 (ブラウザフォールバック) ───────────────────────
  let _recognition = null;
  let _listening = false;

  function _startListeningWeb(lang, onResult, onError) {
    lang = lang || 'ko-KR';
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { if (onError) onError('not_supported'); return; }
    if (_listening) stopListening();

    _recognition = new SR();
    _recognition.lang = lang;
    _recognition.interimResults = true;
    _recognition.continuous = false;
    _recognition.maxAlternatives = 1;

    _recognition.onstart = () => { _listening = true; };
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
    _recognition.onend = () => { _listening = false; };

    try { _recognition.start(); } catch (e) { _listening = false; if (onError) onError('start_failed'); }
  }

  // ── Public: startListening / stopListening ──────────────────────
  function startListening(lang, onResult, onError) {
    if (_isNative) {
      _startListeningNative(lang, onResult, onError);
    } else {
      _startListeningWeb(lang, onResult, onError);
    }
  }

  function stopListening() {
    if (_isNative) {
      const SR = window.Capacitor && window.Capacitor.Plugins.SpeechRecognition;
      if (SR) SR.stop().catch(() => {});
      if (_nativeListener) { _nativeListener.remove(); _nativeListener = null; }
    } else {
      if (_recognition && _listening) try { _recognition.stop(); } catch {}
    }
    _listening = false;
  }

  function isListening() { return _listening; }

  window.KoreanSpeech = { speak, startListening, stopListening, isListening, canAutoplay };
})();
