import React, { useState, useEffect } from 'react';
import { Volume2, Mic, ArrowLeft, Check, Sparkles, Heart, Shield, HelpCircle } from 'lucide-react';
import { QuestionItem, AssessmentResponse, UserProfile } from '../../types';
import { MADRS_QUESTIONS } from '../../data/questionnaire';
import { translations } from '../../utils/translations';

interface TileQuestionnaireProps {
  currentLang: string;
  voiceGuidance: boolean;
  userProfile: UserProfile;
  onComplete: (responses: AssessmentResponse[], voiceData?: { transcript: string; stressScore: number }) => void;
  onTriggerCrisis: () => void;
  onOpenVoiceModal: () => void;
  voiceCheckinDone: boolean;
}

export const TileQuestionnaire: React.FC<TileQuestionnaireProps> = ({
  currentLang,
  voiceGuidance,
  userProfile,
  onComplete,
  onTriggerCrisis,
  onOpenVoiceModal,
  voiceCheckinDone,
}) => {
  const t = translations[currentLang] || translations.en;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const currentQuestion: QuestionItem = MADRS_QUESTIONS[currentIndex];
  const progressPercent = ((currentIndex + 1) / MADRS_QUESTIONS.length) * 100;

  // Retrieve translated question and tile options
  const langQ = t.questions?.[currentQuestion.id];
  const questionTitle = langQ?.title || currentQuestion.defaultQuestion;

  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap: { [key: string]: string } = {
        en: 'en-IN',
        hi: 'hi-IN',
        bn: 'bn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        mr: 'mr-IN',
      };
      utterance.lang = langMap[currentLang] || 'en-IN';
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    setStartTime(Date.now());
    if (voiceGuidance) {
      speakQuestion(questionTitle);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIndex, currentLang, voiceGuidance]);

  const handleSelectOption = (optionId: string, madrsScore: number) => {
    const responseTimeMs = Date.now() - startTime;
    const newResponse: AssessmentResponse = {
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      madrsScore,
      responseTimeMs,
    };

    const updatedResponses = [...responses.filter((r) => r.questionId !== currentQuestion.id), newResponse];
    setResponses(updatedResponses);

    if (currentQuestion.id === 10 && (optionId === 'c' || optionId === 'd' || madrsScore >= 4)) {
      onTriggerCrisis();
      return;
    }

    setTimeout(() => {
      if (currentIndex < MADRS_QUESTIONS.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onComplete(updatedResponses);
      }
    }, 260);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    const responseTimeMs = Date.now() - startTime;
    const skipResponse: AssessmentResponse = {
      questionId: currentQuestion.id,
      selectedOptionId: 'skipped',
      madrsScore: 0,
      responseTimeMs,
    };
    const updated = [...responses.filter((r) => r.questionId !== currentQuestion.id), skipResponse];
    setResponses(updated);

    if (currentIndex < MADRS_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete(updated);
    }
  };

  const currentSelection = responses.find((r) => r.questionId === currentQuestion.id)?.selectedOptionId;

  const getEncouragement = (idx: number) => {
    if (idx < 3) return 'You are doing great • Take your time 🌿';
    if (idx < 7) return 'Listening to yourself is an act of courage 🕊️';
    return 'Almost finished • Thank you for checking in 🌸';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8 animate-fadeInScale">
      {/* Top Header & Smooth Progress Track */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-600 mb-2.5">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>Question {currentIndex + 1} of {MADRS_QUESTIONS.length}</span>
          </span>
          <span className="text-xs text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            {getEncouragement(currentIndex)}
          </span>
        </div>

        {/* Liquid Progress Track */}
        <div className="w-full bg-slate-100 h-3 rounded-full p-0.5 border border-slate-200 shadow-inner overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-teal-400 h-full rounded-full transition-all duration-300 ease-out shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Liquid Glass Question Card */}
      <div className="liquid-glass-panel rounded-3xl p-6 sm:p-10 shadow-xl relative transition-all overflow-hidden bg-white/95">
        {/* Top Domain Badge & Audio Read Aloud */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200 shadow-2xs">
            {currentQuestion.domain}
          </span>

          <button
            type="button"
            onClick={() => speakQuestion(questionTitle)}
            className={`p-2.5 rounded-2xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
              isSpeaking
                ? 'bg-indigo-600 text-white border-indigo-600 scale-105 shadow-md shadow-indigo-500/30 animate-pulse'
                : 'bg-white text-indigo-600 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-xs'
            }`}
            title={t.listenQuestion}
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">{isSpeaking ? 'Reading...' : 'Listen'}</span>
          </button>
        </div>

        {/* Question Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-8 leading-snug tracking-tight">
          {questionTitle}
        </h2>

        {/* 4 Large Liquid Glass Emoji Tiles (2x2 Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {currentQuestion.options.map((opt) => {
            const isSelected = currentSelection === opt.id;
            const optionLabel = langQ?.options?.[opt.id] || opt.defaultLabel;
            const isCrisisTile = currentQuestion.id === 10 && (opt.id === 'c' || opt.id === 'd');

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt.id, opt.madrsScore)}
                className={`group text-left p-5 sm:p-6 rounded-3xl transition-all duration-200 flex items-center gap-4 cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? 'liquid-tile-selected scale-[1.02]'
                    : isCrisisTile
                    ? 'liquid-tile border-rose-200 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-400'
                    : 'liquid-tile hover:bg-white'
                }`}
              >
                {/* Emoji Halo */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl sm:text-4xl transition-transform group-hover:scale-110 shadow-xs ${
                  isSelected
                    ? 'bg-indigo-100 border border-indigo-300'
                    : isCrisisTile
                    ? 'bg-rose-100 border border-rose-300'
                    : 'bg-slate-50 border border-slate-200 group-hover:bg-indigo-50'
                }`}>
                  {opt.icon}
                </div>

                {/* Option Text Label */}
                <div className="flex-1">
                  <span className={`block text-sm font-extrabold leading-snug ${
                    isSelected ? 'text-indigo-950' : 'text-slate-800 group-hover:text-slate-950'
                  }`}>
                    {optionLabel}
                  </span>
                </div>

                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/30">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Voice Reflection Bar */}
        <div className="rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
            <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <span>{voiceCheckinDone ? '✓ Voice reflection sample saved' : t.voiceCheckinPrompt}</span>
          </div>
          <button
            type="button"
            onClick={onOpenVoiceModal}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
              voiceCheckinDone
                ? 'bg-emerald-600 text-white shadow-emerald-600/25 hover:bg-emerald-700'
                : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{voiceCheckinDone ? 'Re-record Voice' : 'Record Voice'}</span>
          </button>
        </div>

        {/* Bottom Back and Skip Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 text-xs">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1.5 font-extrabold px-3 py-2 rounded-xl transition ${
              currentIndex === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.back}</span>
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="text-slate-400 hover:text-slate-600 font-bold px-3 py-2 rounded-xl hover:bg-slate-50 transition"
          >
            {t.skip}
          </button>
        </div>
      </div>
    </div>
  );
};
