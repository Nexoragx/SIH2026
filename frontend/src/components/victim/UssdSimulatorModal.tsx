import React, { useState } from 'react';
import { X, Phone, PhoneOff, Delete, Signal, Battery, Radio, Shield } from 'lucide-react';

interface UssdSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerCrisis?: () => void;
  onRequestCall?: () => void;
  currentLang?: string;
}

type ScreenState = 'idle' | 'calling' | 'main_menu' | 'mood_menu' | 'mood_success' | 'sos_confirm' | 'sos_done' | 'call_queued' | 'compensation_status';

export const UssdSimulatorModal: React.FC<UssdSimulatorModalProps> = ({
  isOpen,
  onClose,
  onTriggerCrisis,
  onRequestCall,
}) => {
  const [dialNumber, setDialNumber] = useState<string>('*14566#');
  const [screen, setScreen] = useState<ScreenState>('idle');
  const [inputVal, setInputVal] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKeyPress = (char: string) => {
    if (screen === 'idle') {
      setDialNumber((prev) => prev + char);
    } else {
      setInputVal((prev) => prev + char);
    }
  };

  const handleDelete = () => {
    if (screen === 'idle') {
      setDialNumber((prev) => prev.slice(0, -1));
    } else {
      setInputVal((prev) => prev.slice(0, -1));
    }
  };

  const handleCall = () => {
    if (dialNumber.trim() === '*14566#' || dialNumber.trim().includes('14566')) {
      setScreen('calling');
      setTimeout(() => {
        setScreen('main_menu');
        setInputVal('');
      }, 900);
    } else {
      setFeedbackMsg('Unknown USSD code. Please dial *14566#');
      setTimeout(() => setFeedbackMsg(null), 2500);
    }
  };

  const handleEndCall = () => {
    setScreen('idle');
    setDialNumber('*14566#');
    setInputVal('');
  };

  const handleSendInput = () => {
    const choice = inputVal.trim();
    setInputVal('');

    if (screen === 'main_menu') {
      if (choice === '1') {
        setScreen('mood_menu');
      } else if (choice === '2') {
        setScreen('sos_confirm');
      } else if (choice === '3') {
        setScreen('call_queued');
        if (onRequestCall) onRequestCall();
      } else if (choice === '4') {
        setScreen('compensation_status');
      } else if (choice === '5' || choice === '0') {
        handleEndCall();
      } else {
        setFeedbackMsg('Invalid choice. Reply 1, 2, 3, 4, or 5.');
        setTimeout(() => setFeedbackMsg(null), 2000);
      }
    } else if (screen === 'mood_menu') {
      if (['1', '2', '3', '4'].includes(choice)) {
        setScreen('mood_success');
      } else {
        setFeedbackMsg('Reply 1 (Calm), 2 (Tense), 3 (Dread), 4 (Sleep).');
        setTimeout(() => setFeedbackMsg(null), 2000);
      }
    } else if (screen === 'sos_confirm') {
      if (choice === '1') {
        setScreen('sos_done');
        if (onTriggerCrisis) onTriggerCrisis();
      } else {
        setScreen('main_menu');
      }
    } else if (['mood_success', 'sos_done', 'call_queued', 'compensation_status'].includes(screen)) {
      handleEndCall();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative border border-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Rural 2G USSD Telecom Simulator
              </h3>
              <p className="text-[10px] font-bold text-emerald-600">
                *14566# • Works on ₹500 Keypad Phones without Internet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Subtext */}
        <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
          <Shield className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Universal Rural Coverage:</strong> Telecom protocol authorized under MoSJE NHAA for citizens with basic feature phones in remote rural panchayats with zero 4G connectivity.
          </span>
        </div>

        {/* Feature Phone Bezel */}
        <div className="mt-4 mx-auto max-w-xs bg-slate-900 rounded-[2.5rem] p-4 shadow-xl border-4 border-slate-800 text-white">
          {/* Status Bar */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 pb-2">
            <div className="flex items-center gap-1 font-mono">
              <Signal className="w-3 h-3 text-emerald-400" />
              <span>BSNL 2G</span>
            </div>
            <div className="flex items-center gap-1 font-mono">
              <span>100%</span>
              <Battery className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Monochrome LCD Screen */}
          <div className="bg-[#A4C2A5] text-[#1B3022] rounded-xl p-3 min-h-[145px] max-h-[160px] font-mono text-xs flex flex-col justify-between shadow-inner border-2 border-[#8EAA8F] overflow-y-auto">
            {screen === 'idle' && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-4">
                <span className="text-[10px] tracking-widest uppercase opacity-75">Telecom Ready</span>
                <div className="text-base font-black tracking-wider bg-[#8EAA8F]/40 px-3 py-1 rounded">
                  {dialNumber || 'Enter code'}
                </div>
                <span className="text-[9px] opacity-80">Press [CALL] to dial NHAA</span>
              </div>
            )}

            {screen === 'calling' && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-1.5 py-4 animate-pulse">
                <span className="font-bold text-xs">Connecting to MoSJE...</span>
                <span className="text-[10px]">{dialNumber}</span>
                <span className="text-[9px] opacity-75">Session handshake via GSM</span>
              </div>
            )}

            {screen === 'main_menu' && (
              <div className="space-y-1 text-[11px] leading-tight font-bold">
                <div className="border-b border-[#1B3022]/20 pb-0.5 text-[10px] uppercase">ANVAYA MoSJE Care</div>
                <div>1. Quick Mood Check-in</div>
                <div>2. Emergency SOS 108</div>
                <div>3. Request Observer Call</div>
                <div>4. Statutory Relief Status</div>
                <div>5. Exit</div>
              </div>
            )}

            {screen === 'mood_menu' && (
              <div className="space-y-1 text-[11px] leading-tight font-bold">
                <div className="border-b border-[#1B3022]/20 pb-0.5 text-[10px]">How are you feeling?</div>
                <div>1. Peaceful / Safe</div>
                <div>2. Tense / Anxious</div>
                <div>3. Deep Fear / Intimidated</div>
                <div>4. Severe Sleep Distress</div>
              </div>
            )}

            {screen === 'mood_success' && (
              <div className="text-center space-y-1 py-2 font-bold text-[11px]">
                <div className="text-xs">✓ Logged to Nodal Cell</div>
                <p className="text-[10px] leading-tight opacity-90">
                  Health observer notified. Practice slow breathing. Dial 14566 anytime.
                </p>
                <div className="text-[9px] pt-1 opacity-75">[Press Send to Exit]</div>
              </div>
            )}

            {screen === 'sos_confirm' && (
              <div className="space-y-1 text-[11px] leading-tight font-bold text-center">
                <div className="text-xs uppercase text-red-950 font-black">CONFIRM SOS DISPATCH?</div>
                <p className="text-[10px]">108 Ambulance + Local Police Nodal will be alerted.</p>
                <div>1. CONFIRM SOS NOW</div>
                <div>2. Cancel</div>
              </div>
            )}

            {screen === 'sos_done' && (
              <div className="text-center space-y-1 py-2 font-bold text-[11px]">
                <div className="text-xs uppercase text-red-950">🚨 SOS ALERT ACTIVE</div>
                <p className="text-[10px] leading-tight">
                  108 Ambulance dispatched to your registered village coordinates.
                </p>
                <div className="text-[9px] pt-1 opacity-75">[Press Send to Exit]</div>
              </div>
            )}

            {screen === 'call_queued' && (
              <div className="text-center space-y-1 py-2 font-bold text-[11px]">
                <div className="text-xs">📞 Callback Scheduled</div>
                <p className="text-[10px] leading-tight">
                  Dr. Anita Joshi (District Nodal Cell) will call your mobile within 15 mins.
                </p>
                <div className="text-[9px] pt-1 opacity-75">[Press Send to Exit]</div>
              </div>
            )}

            {screen === 'compensation_status' && (
              <div className="space-y-1 text-[10px] leading-tight font-bold">
                <div className="border-b border-[#1B3022]/20 pb-0.5 font-black uppercase">SC/ST Relief Status</div>
                <div>• FIR Stage 1 (25%): ₹1,25,000 DISBURSED (DBT)</div>
                <div>• Stage 2 (50%): Chargesheet submitted in Special Court</div>
                <div className="text-[9px] opacity-75 pt-1">[Press Send to Exit]</div>
              </div>
            )}

            {/* Response Input Bar inside Screen */}
            {screen !== 'idle' && screen !== 'calling' && (
              <div className="pt-1 mt-1 border-t border-[#1B3022]/20 flex items-center justify-between text-[11px] font-bold">
                <span>Reply: [{inputVal || '_'}]</span>
                <span className="text-[9px] opacity-75">Send ↵</span>
              </div>
            )}
          </div>

          {/* Feedback error alert if any */}
          {feedbackMsg && (
            <div className="mt-2 text-center text-[10px] font-bold text-amber-300 animate-pulse">
              {feedbackMsg}
            </div>
          )}

          {/* Call & Navigation Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3 mb-2">
            {screen === 'idle' ? (
              <button
                type="button"
                onClick={handleCall}
                className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-md"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call USSD</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendInput}
                className="py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-md"
              >
                <span>Send ↵</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleEndCall}
              className="py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-md"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End</span>
            </button>
          </div>

          {/* Physical Style Number Keypad */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { k: '1', sub: '.,-' },
              { k: '2', sub: 'ABC' },
              { k: '3', sub: 'DEF' },
              { k: '4', sub: 'GHI' },
              { k: '5', sub: 'JKL' },
              { k: '6', sub: 'MNO' },
              { k: '7', sub: 'PQRS' },
              { k: '8', sub: 'TUV' },
              { k: '9', sub: 'WXYZ' },
              { k: '*', sub: '⇄' },
              { k: '0', sub: '+' },
              { k: '#', sub: '⇧' },
            ].map((btn) => (
              <button
                key={btn.k}
                type="button"
                onClick={() => handleKeyPress(btn.k)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 py-2 rounded-xl flex flex-col items-center justify-center text-xs font-bold text-slate-100 transition cursor-pointer border border-slate-700 shadow-inner"
              >
                <span className="text-sm leading-none">{btn.k}</span>
                <span className="text-[8px] text-slate-400 uppercase leading-none mt-0.5">{btn.sub}</span>
              </button>
            ))}
          </div>

          {/* Keypad Bottom Row Delete Button */}
          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Delete className="w-3 h-3" />
              <span>Clear Digit</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Integrates with MoSJE National Helpline Against Atrocities (14566) Gateway Infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UssdSimulatorModal;
