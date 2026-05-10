(function () {
  let recognition = null;
  let listening = false;
  let _unlocked = false;
  const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const _synth = window.speechSynthesis || null;

  function _unlock() {
    if (_unlocked || !_synth) return;
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    _synth.speak(u);
    _unlocked = true;
  }

  if (_synth) {
    _synth.getVoices();
    _synth.addEventListener('voiceschanged', () => { _synth.getVoices(); });
    document.addEventListener('touchstart', _unlock, { once: true, passive: true });
    document.addEventListener('click', _unlock, { once: true });
  }

  function _doSpeak(text, lang) {
    const voices = _synth.getVoices();

    // voices がまだ読み込まれていない場合、voiceschanged を待って再試行
    if (voices.length === 0) {
      const retry = () => {
        _synth.removeEventListener('voiceschanged', retry);
        _doSpeak(text, lang);
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
    // iOS: resume if stuck in paused state
    if (_isIOS) setTimeout(() => { if (_synth.paused) _synth.resume(); }, 150);
  }

  function speak(text, lang) {
    lang = lang || 'ko-KR';
    if (!_synth) return;

    if (_synth.speaking || _synth.pending) {
      // Android Chrome: cancel() + 即 speak() でレース条件が起きるため遅延する
      _synth.cancel();
      setTimeout(() => _doSpeak(text, lang), 250);
    } else {
      _doSpeak(text, lang);
    }
  }

  // iOS は setTimeout 内の speak() がジェスチャー文脈を失うため false
  function canAutoplay() {
    return !_isIOS;
  }

  function startListening(lang, onResult, onError) {
    lang = lang || 'ko-KR';
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { if (onError) onError('not_supported'); return; }
    if (listening) stopListening();

    recognition = new SR();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { listening = true; };

    recognition.onresult = (e) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (final && onResult) onResult(final, true);
      else if (interim && onResult) onResult(interim, false);
    };

    recognition.onerror = (e) => {
      listening = false;
      if (onError) onError(e.error);
    };

    recognition.onend = () => { listening = false; };

    try {
      recognition.start();
    } catch (e) {
      listening = false;
      if (onError) onError('start_failed');
    }
  }

  function stopListening() {
    if (recognition && listening) {
      try { recognition.stop(); } catch {}
    }
    listening = false;
  }

  function isListening() { return listening; }

  window.KoreanSpeech = { speak, startListening, stopListening, isListening, canAutoplay };
})();
