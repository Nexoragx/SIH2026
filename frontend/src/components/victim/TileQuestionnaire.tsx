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
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8 space-y-6 animate-fadeIn">
      {/* 1. Clinical Non-Diagnosis Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl pastel-indigo flex items-start gap-2.5 text-xs shadow-2xs font-medium">
        <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-indigo-950">
            MADRS-based wellbeing screening:
          </span>{' '}
          <span className="text-indigo-900">
            This check-in helps identify when extra support may be useful. It is not a medical diagnosis.
          </span>
        </div>
      </div>

      {/* 2. Top Progress Tracker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span className="font-extrabold text-slate-900">Question {currentIndex + 1} of {activeQuestions.length}</span>
          </span>
          <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/80">
            {currentQuestion.domain}
          </span>
        </div>

        {/* Soft Pastel Progress Bar */}
        <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 h-full rounded-full transition-all duration-300 ease-out shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Main Question Card (Frosted Glass) */}
      <div className="anvaya-card p-6 sm:p-10 relative space-y-6 shadow-md">
        {/* Top Header: Read Aloud action */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
            Domain #{currentQuestion.madrsItemNumber}
          </span>

          <button
            type="button"
            onClick={() => speakQuestion(questionTitle)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isSpeaking
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-indigo-50/80 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100'
            }`}
            title="Read question aloud"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSpeaking ? 'Reading...' : 'Listen'}</span>
          </button>
        </div>

        {/* Question Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug tracking-tight">
          {questionTitle}
        </h2>

        {/* 4 Large Touch Target Answer Tiles (0, 2, 4, 6 score mapping) */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = currentSelection === opt.id;
            const optionLabel = langQ?.options?.[opt.id] || opt.defaultLabel;
            const isSafetyQuestion = currentQuestion.id === 10;
            const isCriticalRiskOption = isSafetyQuestion && (opt.id === 'c' || opt.id === 'd');

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt.id, opt.madrsScore)}
                className={`w-full p-4 sm:p-5 rounded-2xl border text-left flex items-center justify-between gap-4 cursor-pointer transition active:scale-[0.99] ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-50/95 to-purple-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md text-indigo-950'
                    : isCriticalRiskOption
                    ? 'border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 hover:border-rose-300 text-rose-950'
                    : 'border-slate-200/80 bg-white/80 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl flex-shrink-0" role="img" aria-label={optionLabel}>
                    {opt.icon}
                  </span>
                  <span className="text-sm font-bold text-slate-900 leading-snug">
                    {optionLabel}
                  </span>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Optional Voice Reflection Bar */}
        <div className="rounded-2xl p-4 pastel-sky flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-sky-950 font-bold">
            <Mic className="w-4 h-4 text-sky-700" />
            <span>
              {voiceCheckinDone
                ? '✓ Optional voice sample saved'
                : 'Optional: Share your reflections using voice'}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenVoiceModal}
            className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold border border-sky-300/80 bg-white/90 text-sky-900 hover:bg-white transition whitespace-nowrap cursor-pointer shadow-2xs"
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
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
              currentIndex === 0
                ? 'opacity-30 cursor-not-allowed text-slate-400'
                : 'hover:text-indigo-700 hover:bg-indigo-50/70 text-slate-700'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-indigo-700 hover:bg-indigo-50/70 transition cursor-pointer"
          >
            Skip question
          </button>
        </div>
      </div>
    </div>
  );
};

export default TileQuestionnaire;
