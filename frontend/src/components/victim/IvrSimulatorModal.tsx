import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  PhoneCall,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';

interface IvrSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteIvrCheckin: (payload: {
    madrsAnswers: number[];
    sleepHours: number;
    safetyThreatActive: boolean;
    touchpointType: 'ivrs_call';
  }) => void;
  currentLang?: string;
}

// DTMF Frequencies for telephone keypad sounds
const DTMF_FREQS: Record<string, [number, number]> = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
};

export const IvrSimulatorModal: React.FC<IvrSimulatorModalProps> = ({
  isOpen,
  onClose,
  onCompleteIvrCheckin,
  currentLang = 'en',
}) => {
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'completed'>('idle');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [keypadLog, setKeypadLog] = useState<string[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [step: number]: number }>({});
  
  const timerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Steps in the IVR Call Flow
  const ivrPrompts = [
    {
      title: 'Welcome to ANVAYA IVRS',
      spoken: 'Namaste. You have reached the ANVAYA National Psychological Support Line 14566 under MoSJE. All conversations are confidential and free. Press 1 to begin your automated wellbeing check-in.',
      validKeys: ['1'],
      description: 'Press 1 to start check-in',
    },
    {
      title: 'Question 1: Mood & Sorrow',
      spoken: 'How would you describe your emotional state over the past few days? Press 1 for generally calm. Press 2 for mild sadness. Press 3 for severe distress or weeping.',
      validKeys: ['1', '2', '3'],
      description: 'Press 1 (Calm), 2 (Sadness), or 3 (Severe distress)',
      mapKey: (key: string) => (key === '1' ? 1 : key === '2' ? 3 : 5),
    },
    {
      title: 'Question 2: Sleep Patterns',
      spoken: 'How have your sleep hours been? Press 1 for good sleep over 7 hours. Press 2 for restless sleep between 4 and 6 hours. Press 3 for severe insomnia under 3 hours.',
      validKeys: ['1', '2', '3'],
      description: 'Press 1 (>7 hrs), 2 (4-6 hrs), or 3 (<3 hrs)',
      mapKey: (key: string) => (key === '1' ? 8 : key === '2' ? 5 : 2),
    },
    {
      title: 'Question 3: Safety & Protection',
      spoken: 'Do you feel safe from external threats, intimidation, or harassment at this moment? Press 1 if you feel completely safe. Press 2 if you perceive active intimidation or fear outside your home.',
      validKeys: ['1', '2'],
      description: 'Press 1 (Safe) or Press 2 (Active Threat/Intimidation)',
      mapKey: (key: string) => (key === '2' ? 1 : 0),
    },
    {
      title: 'Check-in Verified',
      spoken: 'Thank you. Your responses have been securely recorded into the district health observer queue. A district nodal officer has been alerted. Press 9 to finish call and view results.',
      validKeys: ['9'],
      description: 'Press 9 to complete and submit check-in',
    },
  ];

  // Play DTMF Tone
  const playDtmfTone = (digit: string) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const freqs = DTMF_FREQS[digit];
      if (!freqs) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.2);
      osc2.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  // Speak voice prompt
  const speakPrompt = (text: string) => {
    if (audioMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis issues
    }
  };

  // Start Call
  const handleStartCall = () => {
    setCallState('calling');
    setKeypadLog([]);
    setCurrentStep(0);
    setCallDuration(0);

    setTimeout(() => {
      setCallState('connected');
      speakPrompt(ivrPrompts[0].spoken);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }, 1500);
  };

  // End Call
  const handleEndCall = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState('idle');
    setCurrentStep(0);
  };

  // Handle Keypad Press
  const handleKeyPress = (digit: string) => {
    playDtmfTone(digit);
    setKeypadLog((prev) => [...prev, digit]);

    if (callState !== 'connected') return;

    const activePrompt = ivrPrompts[currentStep];
    if (activePrompt && activePrompt.validKeys.includes(digit)) {
      // Save answer
      setSelectedAnswers((prev) => ({ ...prev, [currentStep]: parseInt(digit, 10) }));

      if (currentStep < ivrPrompts.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setTimeout(() => {
          speakPrompt(ivrPrompts[nextStep].spoken);
        }, 400);
      } else {
        // Complete call
        setCallState('completed');
        if (timerRef.current) clearInterval(timerRef.current);
        if (window.speechSynthesis) window.speechSynthesis.cancel();

        // Map responses into Assessment submission
        const moodScore = selectedAnswers[1] === 1 ? 1 : selectedAnswers[1] === 2 ? 3 : 5;
        const sleepHours = selectedAnswers[2] === 1 ? 8 : selectedAnswers[2] === 2 ? 5 : 2;
        const threatActive = selectedAnswers[3] === 2;

        const defaultMadrs = [moodScore, 2, 3, sleepHours < 4 ? 4 : 2, 2, 2, 2, 2, 1, 0];

        setTimeout(() => {
          onCompleteIvrCheckin({
            madrsAnswers: defaultMadrs,
            sleepHours,
            safetyThreatActive: threatActive,
            touchpointType: 'ivrs_call',
          });
          onClose();
        }, 1200);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="liquid-glass-panel rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden bg-white border border-slate-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            handleEndCall();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-black hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="text-center space-y-1 mb-4">
          <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-black border border-slate-200">
            <PhoneCall className="w-3 h-3 text-black" />
            <span>Interactive Voice Response (IVRS)</span>
          </div>
          <h3 className="text-xl font-black text-black tracking-tight">
            14566 ANVAYA Helpline
          </h3>
          <p className="text-[11px] font-semibold text-slate-600">
            Automated Phone Touchpoint Simulator
          </p>
        </div>

        {/* Call Screen Status */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 mb-4">
          {callState === 'idle' && (
            <div className="space-y-3 py-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-200 flex items-center justify-center text-black">
                <Phone className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                Simulate dialing the 24/7 toll-free helpline from any basic keypad mobile or landline.
              </p>
              <button
                type="button"
                onClick={handleStartCall}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 fill-white" />
                <span>Dial 14566 (Call Now)</span>
              </button>
            </div>
          )}

          {callState === 'calling' && (
            <div className="py-4 space-y-2 animate-pulse">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div className="text-xs font-black text-black">Connecting to 14566...</div>
              <div className="text-[10px] text-slate-500 font-bold">Connecting IVRS Gateway</div>
            </div>
          )}

          {callState === 'connected' && (
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-black text-black">Call Active ({formatDuration(callDuration)})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAudioMuted(!audioMuted)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 text-xs"
                >
                  {audioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5 text-black" />}
                </button>
              </div>

              {/* Current IVR Prompt */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                <div className="text-[10px] font-black uppercase text-indigo-700">
                  Step {currentStep + 1} of {ivrPrompts.length}: {ivrPrompts[currentStep].title}
                </div>
                <p className="text-xs font-semibold text-black leading-snug">
                  "{ivrPrompts[currentStep].spoken}"
                </p>
                <div className="text-[10px] font-bold text-slate-500 pt-1">
                  💡 {ivrPrompts[currentStep].description}
                </div>
              </div>

              {/* Keypad Feed */}
              {keypadLog.length > 0 && (
                <div className="text-[10px] font-mono font-bold text-slate-600">
                  Keypad Entered: {keypadLog.join(' ')}
                </div>
              )}
            </div>
          )}

          {callState === 'completed' && (
            <div className="py-3 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600" />
              <div className="text-xs font-black text-black">IVRS Check-in Completed!</div>
              <p className="text-[11px] text-slate-600 font-medium">
                Piping data into ANVAYA Multimodal Feature Fusion Engine...
              </p>
            </div>
          )}
        </div>

        {/* Telephone Dialpad */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-black active:text-white border border-slate-200 text-black font-black text-sm transition flex flex-col items-center justify-center cursor-pointer shadow-2xs"
              >
                <span>{digit}</span>
              </button>
            ))}
          </div>

          {callState === 'connected' && (
            <button
              type="button"
              onClick={handleEndCall}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IvrSimulatorModal;
