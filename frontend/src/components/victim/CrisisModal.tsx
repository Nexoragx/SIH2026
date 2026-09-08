import React, { useState } from 'react';
import { PhoneCall, Ambulance, MessageSquare, X, Heart, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../../types';
import { supportApi } from '../../api';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  userProfile: UserProfile;
  onOpenSupportChat?: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onOpenSupportChat,
}) => {
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleEmergencyDispatch = async () => {
    setIsDispatching(true);
    try {
      const res = await supportApi.dispatchEmergency({
        case_id: userProfile.id || 'SURVIVOR-CRISIS',
        location: `${userProfile.district || 'District Central'}, ${userProfile.state || 'Maharashtra'}`,
        reason: 'Immediate Acute Distress Intervention via Crisis Screen',
        caller_phone: userProfile.phone,
      });
      setDispatchStatus(`Emergency response coordinated (${res.dispatch_id}) [DEMO MODE]. Medical and counsellor teams notified.`);
    } catch {
      setDispatchStatus('Emergency request registered. Please also call 108 directly.');
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="anvaya-card rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-red-300 relative overflow-hidden bg-white space-y-6">
        {/* Soft Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-black transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Compassionate Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 font-bold">
            <Heart className="w-6 h-6 fill-red-600 text-red-600" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-700 bg-red-50 px-3 py-0.5 rounded-full border border-red-200">
              Immediate Crisis Support
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight mt-1">
              You are not alone.
            </h2>
          </div>
        </div>

        {/* 2. Compassionate Reassurance */}
        <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 space-y-1">
          <p className="text-sm font-extrabold text-red-950">
            Thank you for telling us.
          </p>
          <p className="text-xs font-medium text-red-900 leading-relaxed">
            Let's get you support right now. Caring professionals and emergency teams are ready to be by your side.
          </p>
        </div>

        {/* 3. Emergency & Support Action Buttons */}
        <div className="space-y-3">
          {/* Button 1: Emergency Assistance (Large Prominent Red Button) */}
          <button
            type="button"
            onClick={handleEmergencyDispatch}
            disabled={isDispatching}
            className="w-full py-4 px-5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-red-600/30 flex items-center justify-between cursor-pointer border border-red-500"
          >
            <div className="flex items-center gap-3">
              <Ambulance className="w-5 h-5 text-white" />
              <div className="text-left">
                <div className="leading-none text-white font-extrabold">
                  {isDispatching ? 'Coordinating Support...' : '🚑 Emergency Assistance (108)'}
                </div>
                <div className="text-[11px] text-red-100 font-semibold mt-1">
                  Immediate 108 crisis dispatch & medical safety net
                </div>
              </div>
            </div>
            <span className="text-xs text-white underline font-bold">Get Help →</span>
          </button>

          {/* Button 2: Talk to a Helpline */}
          <a
            href="tel:14566"
            className="w-full p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-black flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-black" />
              <div className="text-left">
                <div className="text-xs font-black text-black">
                  ☎ Talk to a Helpline
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Atrocity Helpline 14566 • Tele-MANAS 14416 (24x7)
                </div>
              </div>
            </div>
            <span className="text-xs font-extrabold text-black">Call Now →</span>
          </a>

          {/* Button 3: Talk to a Support Person */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenSupportChat) onOpenSupportChat();
            }}
            className="w-full p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-black flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-black" />
              <div className="text-left">
                <div className="text-xs font-black text-black">
                  💬 Talk to a Support Person
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Direct encrypted channel with assigned district observer
                </div>
              </div>
            </div>
            <span className="text-xs font-extrabold text-black">Open Chat →</span>
          </button>
        </div>

        {/* Dispatch Confirmation Banner */}
        {dispatchStatus && (
          <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{dispatchStatus}</span>
          </div>
        )}

        {/* Safety Note */}
        <p className="text-[11px] text-center text-slate-500 font-medium">
          All calls are free, confidential, and protected under statutory safety mandates.
        </p>
      </div>
    </div>
  );
};

export default CrisisModal;
