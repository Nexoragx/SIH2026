/**
 * ANVAYA Multilingual Voice Guidance & Audio-Readout Utility (TTS)
 * Uses Web Speech API with fallback voice matching for Indian languages.
 */

const langMap: Record<string, string> = {
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  en: 'en-IN',
};

export const speakText = (text: string, lang: string = 'en'): void => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Web Speech API is not supported in this environment.');
    return;
  }

  // Cancel any existing speech utterance
  window.speechSynthesis.cancel();

  // Strip HTML or code markup if present
  const plainText = text.replace(/<[^>]*>?/gm, '').trim();
  if (!plainText) return;

  const utterance = new SpeechSynthesisUtterance(plainText);
  const targetLang = langMap[lang] || 'en-IN';
  utterance.lang = targetLang;
  utterance.rate = 0.92; // Slightly slower, calm and empathetic pacing
  utterance.pitch = 1.0; // Warm natural tone

  // Attempt to select an Indian English or target regional voice if loaded
  const voices = window.speechSynthesis.getVoices();
  const regionalVoice = voices.find((v) => v.lang === targetLang || v.lang.startsWith(targetLang.split('-')[0]));
  if (regionalVoice) {
    utterance.voice = regionalVoice;
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = (): void => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const isSpeaking = (): boolean => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
};
