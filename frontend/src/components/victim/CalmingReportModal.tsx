import React, { useState, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  Sun,
  Moon,
  Wind,
  ShieldCheck,
  Bot,
  PhoneCall,
  X,
  CheckCircle2,
  Calendar,
  Smile,
  ArrowRight
} from 'lucide-react';
import { RiskLevel } from '../../types';

interface CalmingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  riskLevel: RiskLevel;
  recommendedCheckinDays?: number;
  onOpenChatbot?: () => void;
  onOpenSupport?: () => void;
}

export const CalmingReportModal: React.FC<CalmingReportModalProps> = ({
  isOpen,
  onClose,
  riskLevel,
  recommendedCheckinDays = 7,
  onOpenChatbot,
  onOpenSupport,
}) => {
  // Breathing exercise state inside the modal
  const [isBreathing, setIsBreathing] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>('Inhale (4s)');
  const [breathTimer, setBreathTimer] = useState<number>(4);

  useEffect(() => {
    if (!isBreathing) return;

    const interval = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev > 1) return prev - 1;

        // Transition breath phases
        if (breathPhase === 'Inhale (4s)') {
          setBreathPhase('Hold (7s)');
          return 7;
        } else if (breathPhase === 'Hold (7s)') {
          setBreathPhase('Exhale (8s)');
          return 8;
        } else {
          setBreathPhase('Inhale (4s)');
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathing, breathPhase]);

  if (!isOpen) return null;

  const isLow = riskLevel === 'low';
  const isModerate = riskLevel === 'moderate';
  const isHighOrCritical = riskLevel === 'high' || riskLevel === 'critical' || riskLevel === 'crisis';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Colorful Calming Top Header Banner */}
        <div className={`p-6 sm:p-8 text-slate-900 relative overflow-hidden flex-shrink-0 ${
          isLow
            ? 'bg-gradient-to-br from-emerald-100/90 via-teal-50/80 to-sky-100/70 border-b border-emerald-200/60'
            : isModerate
            ? 'bg-gradient-to-br from-amber-100/90 via-sky-50/80 to-indigo-100/70 border-b border-amber-200/60'
            : 'bg-gradient-to-br from-rose-100/90 via-purple-50/80 to-indigo-100/70 border-b border-rose-200/60'
        }`}>
          {/* Subtle Ambient Decorative Glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 rounded-full bg-white/40 blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 transition shadow-xs cursor-pointer"
            aria-label="Close reflection modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/90 text-slate-800 shadow-xs border border-white/60">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Personal Care Reflection</span>
            </span>
            <span className="text-xs font-bold text-slate-600 hidden sm:inline">
              • Strictly Confidential
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {isLow && '🌿 You Are Doing Wonderfully — Today’s Gentle Reflection'}
            {isModerate && '🌤️ Gentle Wellbeing Summary — Take a Soft Breath'}
            {isHighOrCritical && '🌸 We Are Right Here With You — A Soothing Care Note'}
          </h2>

          <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1.5 leading-relaxed max-w-xl">
            {isLow && 'Thank you for taking time for yourself. Your check-in reflects steady balance and inner strength.'}
            {isModerate && 'Thank you for listening to yourself today. It is completely normal to carry everyday stress, and small moments of rest can recharge your spirit.'}
            {isHighOrCritical && 'Thank you for sharing your thoughts honestly. You have been carrying a heavy weight, but you are safe now, and caring support is ready to walk with you.'}
          </p>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
          {/* Section: 4 Colorful Wellbeing Pillars (NO SCORES, ONLY UPLIFTING OBSERVATIONS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Pillar 1: Mind & Emotional Harmony (Warm Peach / Rose) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/80 border border-rose-200/70 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs uppercase tracking-wide">
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-rose-600 shadow-2xs">
                  <Sun className="w-4 h-4" />
                </div>
                <span>Mind & Clarity</span>
              </div>
              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                {isLow && 'Your thoughts indicate a calm, clear rhythm today. Allow yourself to acknowledge and enjoy these peaceful moments.'}
                {isModerate && 'You may be noticing thoughts circling or mild mental fatigue. Remember that thoughts are like passing clouds; they don’t define you.'}
                {isHighOrCritical && 'Your mind is working hard through intense feelings. Give yourself loving kindness today; you don’t have to solve everything all at once.'}
              </p>
            </div>

            {/* Pillar 2: Rest & Body Vitality (Soft Lavender / Violet) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/80 border border-purple-200/70 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs uppercase tracking-wide">
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-2xs">
                  <Moon className="w-4 h-4" />
                </div>
                <span>Rest & Sleep Sanctuary</span>
              </div>
              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                {isLow && 'Your body is maintaining good restful anchors. Regular hydration and quiet sleep routines will keep you revitalized.'}
                {isModerate && 'Try gifting yourself 20 minutes of screen-free relaxation or a warm comforting beverage before bedtime to deepen sleep.'}
                {isHighOrCritical && 'Your nervous system is asking for extra gentleness and quiet rest. Allow your body to pause without any self-judgment.'}
              </p>
            </div>

            {/* Pillar 3: Inner Courage & Resilience (Mint / Emerald) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs uppercase tracking-wide">
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-2xs">
                  <Heart className="w-4 h-4" />
                </div>
                <span>Inner Resilience</span>
              </div>
              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                {isLow && 'Taking this check-in is an act of self-care. Cherishing daily gratitude and simple joys helps strengthen your emotional baseline.'}
                {isModerate && 'You possess natural resilience. Even taking a single deep breath when things feel rushed is a powerful way to reset.'}
                {isHighOrCritical && 'Reaching out and completing this reflection took tremendous bravery. Recognizing how you feel is the very first step toward healing.'}
              </p>
            </div>

            {/* Pillar 4: Supportive Compassion & Safety (Sky / Indigo) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/80 border border-sky-200/70 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-sky-900 font-extrabold text-xs uppercase tracking-wide">
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-sky-600 shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Safe Haven & Connection</span>
              </div>
              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                {isLow && 'Our AI companion Saathi and wellness check-ins are available 24/7 whenever you feel like checking in or reflecting.'}
                {isModerate && 'Whenever you would like an empathetic listener, our confidential chatbot and certified health observers are just a click away.'}
                {isHighOrCritical && 'You never have to navigate difficult moments in isolation. Tele-MANAS (14416) and your assigned district observer are ready to listen with open hearts.'}
              </p>
            </div>
          </div>

          {/* Interactive Calming Breathing Anchor (In-Modal) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  4-7-8 Breathing Calmer Anchor
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsBreathing(!isBreathing);
                  setBreathPhase('Inhale (4s)');
                  setBreathTimer(4);
                }}
                className={`px-3 py-1 text-xs font-extrabold rounded-xl transition cursor-pointer ${
                  isBreathing
                    ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                }`}
              >
                {isBreathing ? 'Pause Breathing' : 'Start 1-Minute Calmer'}
              </button>
            </div>

            {isBreathing ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-2 animate-fadeIn">
                <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 shadow-lg transition-all duration-1000 ${
                  breathPhase.startsWith('Inhale')
                    ? 'scale-110 bg-indigo-100 border-indigo-400 text-indigo-900'
                    : breathPhase.startsWith('Hold')
                    ? 'scale-105 bg-purple-100 border-purple-400 text-purple-900'
                    : 'scale-90 bg-emerald-100 border-emerald-400 text-emerald-900'
                }`}>
                  <span className="text-2xl font-black font-mono">{breathTimer}s</span>
                  <span className="text-[10px] font-extrabold uppercase">{breathPhase.split(' ')[0]}</span>
                </div>
                <p className="text-xs font-bold text-slate-600">
                  {breathPhase.startsWith('Inhale') && 'Gently breathe in peace and relaxation through your nose...'}
                  {breathPhase.startsWith('Hold') && 'Gently hold your breath, feeling calm still your body...'}
                  {breathPhase.startsWith('Exhale') && 'Slowly release all tension through your mouth...'}
                </p>
              </div>
            ) : (
              <p className="text-xs font-medium text-slate-600">
                A simple 3-cycle breath relaxes your heart rate, settles nervous butterflies, and brings peaceful grounding to your body right now.
              </p>
            )}
          </div>

          {/* Gentle Care Cadence Notification */}
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>
              Next gentle check-in suggested in <span className="text-indigo-900 font-extrabold">{recommendedCheckinDays} days</span>. You can also check in earlier whenever you feel like it.
            </span>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenChatbot && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChatbot();
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 active:scale-95 border border-slate-300 text-slate-800 text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Bot className="w-4 h-4 text-indigo-600" />
                <span>Talk with AI Companion</span>
              </button>
            )}

            {onOpenSupport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSupport();
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 active:scale-95 border border-slate-300 text-slate-800 text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>View Free Helplines</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black active:scale-95 text-white text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>I Feel Calmer • Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalmingReportModal;
