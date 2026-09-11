import React, { useState } from 'react';
import {
  Heart,
  Calendar,
  MessageSquare,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  Wind,
  ShieldCheck,
  Bot,
  Sparkles
} from 'lucide-react';
import { AssessmentResultData, UserProfile } from '../../types';
import { translations } from '../../utils/translations';

interface AssessmentResultProps {
  currentLang?: string;
  resultData: AssessmentResultData;
  userProfile: UserProfile;
  onRestart: () => void;
  onOpenObserverView: () => void;
  onOpenChatbot: () => void;
  onOpenObserverChat: () => void;
  onViewSupport?: () => void;
  onDone?: () => void;
  onOpenCalmingReport?: () => void;
}

export const AssessmentResult: React.FC<AssessmentResultProps> = ({
  currentLang = 'en',
  resultData,
  onOpenChatbot,
  onOpenObserverChat,
  onViewSupport,
  onDone,
  onOpenCalmingReport,
}) => {
  const t = translations[currentLang] || translations.en;
  const [activeExercise, setActiveExercise] = useState<boolean>(false);
  const [exerciseCount, setExerciseCount] = useState<number>(4);

  const startBreathing = () => {
    setActiveExercise(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-6 animate-fadeIn">
      {/* 1. Main Supportive Message Card */}
      <div className="anvaya-card p-6 sm:p-10 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-black flex items-center justify-center flex-shrink-0 font-black text-2xl">
            🌿
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Check-in Complete
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight mt-1">
              Thank you for checking in.
            </h1>
          </div>
        </div>

        {/* Empathetic Supportive Body */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <p className="text-base font-extrabold text-black leading-snug">
            We've noticed that you may benefit from some extra support.
          </p>
          <p className="text-sm font-medium text-slate-700 leading-relaxed">
            Taking time to listen to your mind and body is an act of strength. You don't have to handle everything alone, and compassionate assistance is available whenever you are ready.
          </p>
        </div>

        {onOpenCalmingReport && (
          <button
            type="button"
            onClick={onOpenCalmingReport}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 hover:from-emerald-100 hover:to-indigo-100 border border-emerald-200/80 text-emerald-950 font-black text-xs sm:text-sm transition flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>View Personalized Wellbeing Care Reflection</span>
            <ArrowRight className="w-4 h-4 text-emerald-700 ml-1" />
          </button>
        )}

        {/* Action Buttons: Talk to someone, View support, Done */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={onOpenChatbot}
            className="p-3.5 bg-black hover:bg-slate-900 active:scale-95 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Bot className="w-4 h-4 text-white" />
            <span>{t.talkToCounsellor || 'Talk to someone'}</span>
          </button>

          <button
            type="button"
            onClick={onViewSupport || onOpenObserverChat}
            className="p-3.5 bg-white hover:bg-slate-50 active:scale-95 border border-slate-300 text-black font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-black" />
            <span>{t.navDirectory || 'View support'}</span>
          </button>

          <button
            type="button"
            onClick={onDone}
            className="p-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-200 text-black font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-black" />
            <span>{t.submit || 'Done'}</span>
          </button>
        </div>
      </div>

      {/* 2. Gentle Coping Exercise & Schedule Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Next Check-in Summary */}
        <div className="anvaya-card p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Next Check-in
            </span>
            <Calendar className="w-4 h-4 text-slate-600" />
          </div>

          <div>
            <div className="text-xl font-black text-black">
              In {resultData.recommendedCheckinDays || 5} days
            </div>
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              Active care cadence scheduled to check on your comfort.
            </p>
          </div>

          <div className="text-xs font-bold text-slate-700 bg-slate-100 p-2 rounded-lg border border-slate-200">
            ✓ Your session has been safely recorded
          </div>
        </div>

        {/* 4-7-8 Breathing Calmer */}
        <div className="anvaya-card p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Gentle Calming Pacer
            </span>
            <Wind className="w-4 h-4 text-slate-600" />
          </div>

          <div>
            <h4 className="text-sm font-black text-black">
              4-7-8 Breathing Anchor
            </h4>
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              Inhale 4s • Hold 7s • Exhale 8s to calm your nervous system.
            </p>
          </div>

          <button
            type="button"
            onClick={startBreathing}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-black text-xs font-extrabold rounded-xl border border-slate-200 transition cursor-pointer"
          >
            {activeExercise ? 'Practicing 4-7-8 Pacer...' : 'Start 2-Minute Breathing'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResult;
