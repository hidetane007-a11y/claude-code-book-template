(function () {
  let recognition = null;
  let listening = false;
  let _unlocked = false;
  const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  function _unlock() {
    if (_unlocked || !('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    window.speechSynthesis.speak(u);
    _unlocked = true;
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      window.speechSynthesis.getVoices();
    });
    document.addEventListener('touchstart', _unlock, { once: true, passive: true });
    document.addEventListener('click', _unlock, { once: true });
  }

  function speak(text, lang) {
    lang = lang || 'ko-KR';
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.85;
    u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find(v => v.lang === lang || v.lang.startsWith('ko'));
    if (koVoice) u.voice = koVoice;
    window.speechSynthesis.speak(u);
    // iOS bug: synthesis can get stuck in paused state after cancel()
    if (_isIOS) {
      setTimeout(() => {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      }, 50);
    }
  }

  // iOS では setTimeout 内での speak() がジェスチャー文脈を失うため false を返す
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
