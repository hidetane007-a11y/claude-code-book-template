/**
 * speech.js - Web Speech API 共通処理
 * IIFEで囲み、内部変数がグローバルスコープと衝突しないようにする
 */
(function () {
  let recognition = null;
  let isListening = false;

  function speak(text, lang) {
    lang = lang || 'ko-KR';
    if (!('speechSynthesis' in window)) {
      console.warn('[speech] SpeechSynthesis not supported');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.85;
    utter.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find(function (v) { return v.lang === lang || v.lang.startsWith('ko'); });
    if (koVoice) utter.voice = koVoice;
    window.speechSynthesis.speak(utter);
  }

  function startListening(lang, onResult, onError) {
    lang = lang || 'ko-KR';
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[speech] SpeechRecognition not supported');
      if (onError) onError('not_supported');
      return;
    }
    if (isListening) stopListening();

    recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function () { isListening = true; };

    recognition.onresult = function (event) {
      var interimText = '';
      var finalText = '';
      for (var i = event.resultIndex; i < event.results.length; i++) {
        var result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      if (finalText) { if (onResult) onResult(finalText, true); }
      else if (interimText) { if (onResult) onResult(interimText, false); }
    };

    recognition.onerror = function (event) {
      console.warn('[speech] Recognition error:', event.error);
      isListening = false;
      if (onError) onError(event.error);
    };

    recognition.onend = function () { isListening = false; };

    try {
      recognition.start();
    } catch (e) {
      console.warn('[speech] Failed to start recognition:', e);
      isListening = false;
      if (onError) onError('start_failed');
    }
  }

  function stopListening() {
    if (recognition && isListening) {
      try { recognition.stop(); } catch (e) { console.warn('[speech] stop error:', e); }
    }
    isListening = false;
  }

  function getIsListening() { return isListening; }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener('voiceschanged', function () {
      window.speechSynthesis.getVoices();
    });
  }

  window.KoreanSpeech = { speak: speak, startListening: startListening, stopListening: stopListening, getIsListening: getIsListening };
})();
