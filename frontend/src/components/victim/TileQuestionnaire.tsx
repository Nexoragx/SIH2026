import React, { useState, useEffect } from 'react';
import { Volume2, Mic, ArrowLeft, ArrowRight, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { QuestionItem, AssessmentResponse, UserProfile } from '../../types';
import { MADRS_QUESTIONS } from '../../data/questionnaire';
import { translations } from '../../utils/translations';
import { supportApi } from '../../api';

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

  const q3Score = responses.find((r) => r.questionId === 3)?.madrsScore || 0;
  const q9Score = responses.find((r) => r.questionId === 9)?.madrsScore || 0;
  const hasAdaptiveBranching = q3Score >= 4 && q9Score >= 4;

  // Adaptive questions list: standard 10 questions, plus Q11 and Q12 if high tension + negative cognition detected
  const activeQuestions: QuestionItem[] = hasAdaptiveBranching
    ? MADRS_QUESTIONS
    : MADRS_QUESTIONS.filter((q) => q.id <= 10);

  const currentQuestion: QuestionItem = activeQuestions[currentIndex] || activeQuestions[0];
  const progressPercent = ((currentIndex + 1) / activeQuestions.length) * 100;

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
      utterance.pitch = 1.0;
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
  }, [currentIndex, currentLang, voiceGuidance, questionTitle]);

  const handleSelectOption = (optionId: string, madrsScore: number) => {
    const responseTimeMs = Date.now() - startTime;
    const newResponse: AssessmentResponse = {
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      madrsScore,
      responseTimeMs,
    };

    const updatedResponses = [
      ...responses.filter((r) => r.questionId !== currentQuestion.id),
      newResponse,
    ];
    setResponses(updatedResponses);

    // CRITICAL SAFETY GATE: Question 10 (Safety & Suicidal Thoughts)
    // If the user indicates serious thoughts about ending their life or self-harm (score 4 or 6, option c or d):
    if (currentQuestion.id === 10 && (optionId === 'c' || optionId === 'd' || madrsScore >= 4)) {
      // 1. Immediately record high-priority crisis alert in background
      supportApi.createAlert({
        case_id: userProfile.id || 'ANONYMOUS_VICTIM',
        category: 'CRISIS',
        priority: 'P0_CRITICAL',
        reason: 'Severe thoughts of self-harm or ending life reported in Question 10.',
        location: `${userProfile.district}, ${userProfile.state}`,
      }).catch(() => {});

      // 2. Halt the questionnaire immediately and display supportive crisis screen
      onTriggerCrisis();
      return;
    }

    // Normal progression to next question or completion
    setTimeout(() => {
      if (currentIndex < activeQuestions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onComplete(updatedResponses);
      }
    }, 220);
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
    const updated = [
      ...responses.filter((r) => r.questionId !== currentQuestion.id),
      skipResponse,
    ];
    setResponses(updated);

    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete(updated);
    }
  };

  const currentSelection = responses.find((r) => r.questionId === currentQuestion.id)?.selectedOptionId;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 space-y-6 animate-fadeIn">
      {/* 1. Clinical Screening Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl pastel-indigo flex items-start gap-2.5 text-xs shadow-2xs font-medium border border-indigo-200/70">
        <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-indigo-950">
            Confidential MADRS Screening:
          </span>{' '}
          <span className="text-indigo-900">
            This gentle check-in helps your care team understand your sleep, mood, and stress levels. It is completely confidential.
          </span>
        </div>
      </div>

      {/* 2. Top Progress Tracker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <span className="font-extrabold text-slate-900 text-sm">
              Question {currentIndex + 1} of {activeQuestions.length}
            </span>
          </span>
          <span className="text-xs font-black text-indigo-800 bg-indigo-100/80 px-3.5 py-1 rounded-full border border-indigo-200 shadow-2xs">
            {currentQuestion.domain}
          </span>
        </div>

        {/* Soft Pastel Progress Bar */}
        <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div
            className="bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Main Question Card (Frosted Glass Panel) */}
      <div className="anvaya-card p-6 sm:p-9 relative space-y-7 shadow-xl border-2 border-indigo-100 bg-white/95">
        {/* Top Header: Read Aloud action & Domain number */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-[11px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
            Domain #{currentQuestion.madrsItemNumber}
          </span>

          <button
            type="button"
            onClick={() => speakQuestion(questionTitle)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isSpeaking
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs animate-pulse'
                : 'bg-indigo-50/90 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
            title="Read question aloud"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSpeaking ? 'Reading aloud...' : 'Listen Question'}</span>
          </button>
        </div>

        {/* Question Title */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
          {questionTitle}
        </h2>

        {/* 4 Large Touch Target Pastel Glass Answer Tiles in 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = currentSelection === opt.id;
            const optionLabel = langQ?.options?.[opt.id] || opt.defaultLabel;
            const isSafetyQuestion = currentQuestion.id === 10;
            const isCriticalRiskOption = isSafetyQuestion && (opt.id === 'c' || opt.id === 'd');

            const tileThemes = [
              {
                pastel: 'pastel-mint',
                border: 'border-emerald-200 hover:border-emerald-400',
                selectedBorder: 'border-emerald-600 ring-4 ring-emerald-200/60',
                text: 'text-emerald-950',
                badgeBg: 'bg-emerald-100 text-emerald-800',
                indicator: 'bg-emerald-600 text-white',
              },
              {
                pastel: 'pastel-sky',
                border: 'border-sky-200 hover:border-sky-400',
                selectedBorder: 'border-sky-600 ring-4 ring-sky-200/60',
                text: 'text-sky-950',
                badgeBg: 'bg-sky-100 text-sky-800',
                indicator: 'bg-sky-600 text-white',
              },
              {
                pastel: 'pastel-peach',
                border: 'border-amber-200 hover:border-amber-400',
                selectedBorder: 'border-amber-600 ring-4 ring-amber-200/60',
                text: 'text-amber-950',
                badgeBg: 'bg-amber-100 text-amber-800',
                indicator: 'bg-amber-600 text-white',
              },
              {
                pastel: 'pastel-rose',
                border: 'border-rose-200 hover:border-rose-400',
                selectedBorder: 'border-rose-600 ring-4 ring-rose-200/60',
                text: 'text-rose-950',
                badgeBg: 'bg-rose-100 text-rose-800',
                indicator: 'bg-rose-600 text-white',
              },
            ];

            const theme = tileThemes[idx] || tileThemes[0];

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt.id, opt.madrsScore)}
                className={`p-5 sm:p-6 rounded-3xl border-2 text-left flex flex-col justify-between gap-4 cursor-pointer transition-all duration-200 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] ${theme.pastel} ${
                  isSelected
                    ? `${theme.selectedBorder} shadow-xl scale-[1.02]`
                    : `${theme.border} hover:shadow-md`
                }`}
              >
                <div className="flex items-start justify-between gap-3 w-full">
                  <div className="w-12 h-12 rounded-2xl bg-white/95 shadow-sm border border-white flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {opt.icon}
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all border ${
                      isSelected
                        ? `${theme.indicator} border-transparent shadow-xs scale-110`
                        : 'border-slate-300/80 bg-white/80 group-hover:border-slate-400'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${theme.badgeBg}`}>
                    Option {opt.id.toUpperCase()}
                  </span>
                  <p className={`text-sm sm:text-base font-bold mt-2 leading-snug ${theme.text}`}>
                    {optionLabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Optional Voice Reflection Bar */}
        <div className="rounded-3xl p-4 sm:p-5 pastel-sky flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-sky-200">
          <div className="flex items-center gap-3 text-xs text-sky-950 font-bold">
            <span className="w-9 h-9 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700 shadow-2xs">
              <Mic className="w-4 h-4 text-sky-700" />
            </span>
            <div>
              <span className="font-black text-sky-950 block text-xs">
                {voiceCheckinDone
                  ? '✓ Voice Reflection Saved'
                  : 'Optional Voice Check-in'}
              </span>
              <span className="text-[11px] text-sky-800 font-medium">
                {voiceCheckinDone
                  ? 'Your voice stress biomarkers are analyzed'
                  : 'Speak freely in your own language to add context'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenVoiceModal}
            className="px-4 py-2 rounded-xl text-xs font-black border border-sky-300 bg-white text-sky-900 hover:bg-sky-50 transition whitespace-nowrap cursor-pointer shadow-xs"
          >
            {voiceCheckinDone ? 'Re-record Voice' : 'Record Voice'}
          </button>
        </div>

        {/* Bottom Navigation: Back & Skip */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
              currentIndex === 0
                ? 'opacity-30 cursor-not-allowed text-slate-400'
                : 'hover:text-indigo-700 hover:bg-indigo-50 text-slate-700 font-black'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-2 rounded-xl text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition cursor-pointer font-bold"
          >
            Skip question →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TileQuestionnaire;
