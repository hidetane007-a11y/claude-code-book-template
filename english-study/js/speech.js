(function () {
  const _synth = window.speechSynthesis || null;
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

  function _doSpeak(text) {
    const voices = _synth.getVoices();
    if (voices.length === 0) {
      const retry = () => {
        _synth.removeEventListener('voiceschanged', retry);
        _doSpeak(text);
      };
      _synth.addEventListener('voiceschanged', retry);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.85;
    u.pitch = 1;
    u.onerror = e => { if (e.error !== 'interrupted') console.warn('speak:', e.error); };
    const enVoice = voices.find(v => v.lang === 'en-US') ||
                    voices.find(v => v.lang.startsWith('en'));
    if (enVoice) u.voice = enVoice;
    _synth.speak(u);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) setTimeout(() => { if (_synth.paused) _synth.resume(); }, 150);
  }

  function speak(text) {
    if (!_synth) return;
    if (_synth.speaking || _synth.pending) {
      _synth.cancel();
      setTimeout(() => _doSpeak(text), 250);
    } else {
      _doSpeak(text);
    }
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  function canAutoplay() { return !isIOS; }

  let _recognition = null;
  let _listening = false;

  function startListening(onResult, onError) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { if (onError) onError('not_supported'); return; }
    if (_listening) stopListening();

    _recognition = new SR();
    _recognition.lang = 'en-US';
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

    try { _recognition.start(); } catch { _listening = false; if (onError) onError('start_failed'); }
  }

  function stopListening() {
    if (_recognition && _listening) try { _recognition.stop(); } catch {}
    _listening = false;
  }

  function isListening() { return _listening; }

  window.EnglishSpeech = { speak, startListening, stopListening, isListening, canAutoplay };
})();
