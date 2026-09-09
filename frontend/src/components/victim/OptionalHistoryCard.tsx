import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Moon,
  ShieldCheck,
  AlertTriangle,
  FileText,
  PhoneCall,
  Smartphone,
  Globe,
  Smile,
  Check
} from 'lucide-react';

export interface DataCollectionPayload {
  text: string;
  sleepHours?: number;
  sleepQuality?: string;
  mood?: string;
  threatReport?: {
    safety_status: string;
    threat_active: boolean;
    details?: string;
  };
  touchpointType?: 'web_portal' | 'mobile_app' | 'ivrs_call';
}

interface OptionalHistoryCardProps {
  onContinue: (data: DataCollectionPayload) => void;
  onSkip: () => void;
  onBack?: () => void;
  onOpenIvrModal?: () => void;
}

export const OptionalHistoryCard: React.FC<OptionalHistoryCardProps> = ({
  onContinue,
  onSkip,
  onBack,
  onOpenIvrModal,
}) => {
  const [text, setText] = useState<string>('');
  const [sleepHours, setSleepHours] = useState<number | undefined>(undefined);
  const [sleepQuality, setSleepQuality] = useState<string>('fair');
  const [mood, setMood] = useState<string>('steady');
  const [safetyStatus, setSafetyStatus] = useState<string>('safe');
  const [touchpoint, setTouchpoint] = useState<'web_portal' | 'mobile_app' | 'ivrs_call'>('web_portal');
  const maxLength = 1000;

  const handleContinue = () => {
    onContinue({
      text: text.trim(),
      sleepHours,
      sleepQuality,
      mood,
      threatReport: {
        safety_status: safetyStatus,
        threat_active: safetyStatus === 'threat_perceived',
        details: text.trim() || undefined,
      },
      touchpointType: touchpoint,
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 animate-fadeInScale space-y-6">
      <div className="anvaya-card p-6 sm:p-9 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-7">
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <span className="text-xs font-black uppercase tracking-wider text-black bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Data Collection • Step 2 of 2
          </span>

          {/* Touchpoint Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold text-black">
            <button
              type="button"
              onClick={() => setTouchpoint('web_portal')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                touchpoint === 'web_portal' ? 'bg-black text-white shadow-xs' : 'text-slate-700 hover:text-black'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Web</span>
            </button>
            <button
              type="button"
              onClick={() => setTouchpoint('mobile_app')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                touchpoint === 'mobile_app' ? 'bg-black text-white shadow-xs' : 'text-slate-700 hover:text-black'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTouchpoint('ivrs_call');
                if (onOpenIvrModal) onOpenIvrModal();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                touchpoint === 'ivrs_call' ? 'bg-black text-white shadow-xs' : 'text-slate-700 hover:text-black'
              }`}
            >
              <PhoneCall className="w-3 h-3" />
              <span>IVRS</span>
            </button>
          </div>
        </div>

        {/* IVRS Callout Banner */}
        {touchpoint === 'ivrs_call' && (
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="space-y-0.5">
              <div className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
                <span>IVRS Telephone Touchpoint Active</span>
              </div>
              <p className="text-[11px] text-indigo-800 font-medium">
                You can simulate an automated phone check-in call with DTMF keypad prompts.
              </p>
            </div>
            {onOpenIvrModal && (
              <button
                type="button"
                onClick={onOpenIvrModal}
                className="px-3 py-1.5 bg-black hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex-shrink-0 cursor-pointer"
              >
                Launch 14566 Simulator
              </button>
            )}
          </div>
        )}

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
            Sleep, Mood & Safety Check
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
            These gentle inputs combine with your check-in to provide tailored, trauma-informed support. All fields are optional.
          </p>
        </div>

        {/* 1. Sleep Input */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-black">
              <Moon className="w-4 h-4 text-slate-700" />
              <span>Hours of sleep last night:</span>
            </div>
            <span className="text-xs font-bold text-black">
              {sleepHours !== undefined ? `${sleepHours} hrs` : 'Not specified'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { val: 3, label: '< 4 hrs' },
              { val: 5, label: '4–6 hrs' },
              { val: 7, label: '6–8 hrs' },
              { val: 9, label: '> 8 hrs' },
            ].map((s) => (
              <button
                key={s.val}
                type="button"
                onClick={() => setSleepHours(s.val)}
                className={`py-2 text-xs font-extrabold rounded-xl border transition cursor-pointer text-center ${
                  sleepHours === s.val
                    ? 'bg-black text-white border-black shadow-xs'
                    : 'bg-white text-black border-slate-200 hover:border-black'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-700">Sleep quality:</span>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { id: 'very_poor', label: 'Restless' },
                { id: 'poor', label: 'Broken' },
                { id: 'fair', label: 'Fair' },
                { id: 'good', label: 'Restful' },
              ].map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSleepQuality(q.id)}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border transition cursor-pointer ${
                    sleepQuality === q.id
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-slate-200 hover:border-black'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Mood Input */}
        <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-black text-black">
            <Smile className="w-4 h-4 text-slate-700" />
            <span>How has your mood felt today?</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'very_low', label: 'Heavy / Low' },
              { id: 'anxious', label: 'Tense / Anxious' },
              { id: 'steady', label: 'Steady / Okay' },
              { id: 'hopeful', label: 'Calm / Hopeful' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.id)}
                className={`py-2 text-xs font-extrabold rounded-xl border transition cursor-pointer text-center ${
                  mood === m.id
                    ? 'bg-black text-white border-black shadow-xs'
                    : 'bg-white text-black border-slate-200 hover:border-black'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Safety & Threat Report */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-black text-black">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <span>Do you feel safe from external threats or intimidation?</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'safe', label: '● I feel safe right now', badge: 'text-emerald-700' },
              { id: 'threat_perceived', label: '⚠️ Feeling threatened', badge: 'text-rose-700' },
              { id: 'unsure', label: '❓ Unsure / Private', badge: 'text-slate-700' },
            ].map((sf) => (
              <button
                key={sf.id}
                type="button"
                onClick={() => setSafetyStatus(sf.id)}
                className={`p-2.5 text-xs font-black rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  safetyStatus === sf.id
                    ? 'bg-black text-white border-black shadow-xs'
                    : 'bg-white text-black border-slate-200 hover:border-black'
                }`}
              >
                <span>{sf.label}</span>
                {safetyStatus === sf.id && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            ))}
          </div>
          {safetyStatus === 'threat_perceived' && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                Your health observer will be notified to review safety protection and legal aid (NALSA 15100).
              </span>
            </div>
          )}
        </div>

        {/* 4. Optional Written Narrative / Text Responses */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-black">
              Written thoughts or recent experiences (Optional):
            </label>
            <span className="text-xs font-semibold text-slate-500">
              {text.length} / {maxLength}
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxLength))}
            placeholder="You can tell us what has been happening in your own words... Take your time."
            rows={4}
            className="w-full p-4 rounded-2xl border border-slate-200 bg-white text-sm text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black transition resize-none font-medium leading-relaxed"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-bold text-slate-700 hover:text-black transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2.5 text-xs font-black text-slate-700 hover:text-black hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="px-6 py-2.5 bg-black hover:bg-slate-900 active:scale-95 text-white text-xs font-black rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <span>Continue & Submit</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionalHistoryCard;
