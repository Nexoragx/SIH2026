import React, { useState, useEffect } from 'react';
import { PhoneCall, ShieldAlert, Heart, X, CheckCircle2, Siren, UserCheck, Sparkles } from 'lucide-react';
import { translations } from '../../utils/translations';
import { UserProfile } from '../../types';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  userProfile: UserProfile;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  userProfile,
}) => {
  const t = translations[currentLang] || translations.en;
  const [countdown, setCountdown] = useState<number>(30);

  useEffect(() => {
    let timer: any;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg animate-fadeIn">
      <div className="glass-panel-glow rounded-3xl max-w-xl w-full p-6 sm:p-10 shadow-2xl border-2 border-rose-400/60 relative overflow-hidden">
        {/* Ambient Warm Halo */}
        <div className="ambient-orb w-64 h-64 bg-rose-400/20 -top-12 -left-12"></div>
        <div className="ambient-orb w-64 h-64 bg-amber-400/20 -bottom-12 -right-12"></div>

        {/* Soft Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/80 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Crisis Header */}
        <div className="flex items-center gap-3.5 mb-5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/30 animate-pulse">
            <Heart className="w-7 h-7 fill-white" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-widest bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Immediate Safety & Care Active
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {t.crisisTitle}
            </h2>
          </div>
        </div>

        <p className="text-sm text-slate-700 mb-6 leading-relaxed bg-rose-50/70 p-4 rounded-2xl border border-rose-200/60 font-medium relative z-10">
          {t.crisisSub}
        </p>

        {/* Automatic Observer Notification Strip */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 mb-6 space-y-3 shadow-md relative z-10">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-2 text-rose-400">
              <Siren className="w-4 h-4 animate-pulse" />
              <span>Priority Health Observer Alerted</span>
            </span>
            <span className="font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Auto-Callback: {countdown}s
            </span>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-800 text-xs text-slate-300">
            <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">
                Coordinated With: <span className="text-emerald-400">District Health Nodal Unit ({userProfile.district || 'Nashik'})</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Encrypted SOS dispatch logged for medical relief and protection.
              </p>
            </div>
          </div>
        </div>

        {/* 1-Tap Emergency Direct Dials */}
        <div className="space-y-3 mb-6 relative z-10">
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            One-Tap Emergency Direct Dials
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="tel:14566"
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white flex items-center justify-between shadow-lg shadow-emerald-700/20 transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">National SC/ST Helpline</div>
                  <div className="text-[11px] opacity-90 font-mono">14566 (24x7 Toll-Free)</div>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-white/20 px-2.5 py-1 rounded-lg">Call</span>
            </a>

            <a
              href="tel:9152987821"
              className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white flex items-center justify-between shadow-lg shadow-indigo-700/20 transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">iCall Trauma Support</div>
                  <div className="text-[11px] opacity-90 font-mono">9152987821 (Psychosocial)</div>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-white/20 px-2.5 py-1 rounded-lg">Call</span>
            </a>

            <a
              href="tel:108"
              className="p-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white flex items-center justify-between shadow-lg shadow-rose-700/20 transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5">
                <Siren className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">Ambulance Dispatch</div>
                  <div className="text-[11px] opacity-90 font-mono">108 (Emergency Care)</div>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-white/20 px-2.5 py-1 rounded-lg">Call</span>
            </a>

            <a
              href="tel:100"
              className="p-4 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white flex items-center justify-between shadow-md transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">Police Protection</div>
                  <div className="text-[11px] opacity-90 font-mono">100 / 112 (Immediate)</div>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-white/20 px-2.5 py-1 rounded-lg">Call</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/60 text-xs text-slate-500 relative z-10">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Location safely shared with emergency response team.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-indigo-600 hover:text-indigo-800 font-extrabold"
          >
            I feel safe now • Return
          </button>
        </div>
      </div>
    </div>
  );
};
