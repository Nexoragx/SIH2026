import React, { useState, useEffect } from 'react';
import { Mic, Square, Check, X, Sparkles, Activity, Volume2, Shield } from 'lucide-react';
import { translations } from '../../utils/translations';

interface VoiceCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  onSaveVoice: (voiceData: { transcript: string; stressScore: number }) => void;
}

export const VoiceCheckinModal: React.FC<VoiceCheckinModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onSaveVoice,
}) => {
  const t = translations[currentLang] || translations.en;
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(20);
  const [processing, setProcessing] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [stressScore, setStressScore] = useState<number>(0);

  useEffect(() => {
    let timer: any;
    if (isRecording && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isRecording && countdown === 0) {
      stopRecording();
    }
    return () => clearInterval(timer);
  }, [isRecording, countdown]);

  if (!isOpen) return null;

  const startRecording = () => {
    setIsRecording(true);
    setCountdown(20);
    setCompleted(false);
    setTranscript('');
  };

  const stopRecording = () => {
    setIsRecording(false);
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setCompleted(true);
      const simulatedTranscripts: { [key: string]: string } = {
        en: '"I have been having terrible headaches since yesterday and the neighbors keep staring at our home. I just want my family to be safe."',
        hi: '"कल रात से सिर में बहुत दर्द हो रहा है और जब भी कोई बाहर से निकलता है तो बहुत डर लगता है। हम बस शांति और सुरक्षा चाहते हैं।"',
        bn: '"গত রাত থেকে ভীষণ চিন্তা হচ্ছে। বাড়ির বাইরে অপরিচিত লোকজন দেখলে বুক কেঁপে ওঠে। আমরা শুধু একটু শান্তি চাই।"',
        ta: '"நேற்றிரவு முதல் எனக்கு மிகவும் அச்சமாக உள்ளது. எங்கள் குடும்பத்திற்கு தகுந்த பாதுகாப்பு கிடைக்க வேண்டும்."',
        te: '"నిన్నటి నుండి చాలా భయంగా ఉంది. మాకు తగిన రక్షణ మరియు న్యాయం కావాలి."',
        mr: '"काल रात्रीपासून खूप भीती वाटते आहे. आमच्या घराबाहेर सुरक्षा वाढवली पाहिजे."',
      };
      setTranscript(simulatedTranscripts[currentLang] || simulatedTranscripts.en);
      setStressScore(68);
    }, 1600);
  };

  const handleSave = () => {
    onSaveVoice({ transcript, stressScore });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-glow rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Soft Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/80 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Multilingual Voice AI & Emotional Stress Biomarkers</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
          Speak in Your Own Voice
        </h3>
        <p className="text-xs text-slate-600 mb-6 font-medium leading-relaxed">
          Speaking is completely voluntary. Our emotion AI gently observes vocal tremors, pace, and pitch jitter to evaluate stress.
        </p>

        {/* Luminous Neon Visualizer Frame */}
        <div className="bg-slate-950 rounded-3xl p-6 mb-6 flex flex-col items-center justify-center min-h-[170px] relative overflow-hidden border border-slate-800 shadow-inner">
          <div className="ambient-orb w-48 h-48 bg-indigo-500/30 -top-10 -left-10"></div>
          <div className="ambient-orb w-48 h-48 bg-teal-500/30 -bottom-10 -right-10"></div>

          {isRecording ? (
            <div className="flex flex-col items-center gap-4 w-full relative z-10">
              {/* Dynamic Waveform Bars */}
              <div className="flex items-center justify-center gap-1.5 h-16 w-full">
                {[35, 75, 25, 90, 60, 100, 45, 80, 50, 95, 70, 35, 85, 60, 30].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-indigo-500 via-purple-400 to-teal-300 rounded-full animate-pulse"
                    style={{
                      height: `${Math.max(15, Math.round(h * Math.random()))}%`,
                      animationDuration: `${0.35 + (i % 3) * 0.15}s`,
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-extrabold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>Recording... {countdown}s left</span>
              </div>
            </div>
          ) : processing ? (
            <div className="flex flex-col items-center gap-3 text-indigo-300 relative z-10">
              <Activity className="w-8 h-8 animate-spin text-indigo-400" />
              <span className="text-xs font-bold tracking-wide">{t.analyzingVoice}</span>
            </div>
          ) : completed ? (
            <div className="text-left w-full space-y-2.5 relative z-10">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-extrabold">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Whisper Multilingual STT Ready
                </span>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                  Stress Score: {stressScore}/100
                </span>
              </div>
              <p className="text-xs text-slate-200 italic bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 leading-relaxed font-medium">
                {transcript}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 text-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1 shadow-lg shadow-indigo-500/20">
                <Mic className="w-8 h-8" />
              </div>
              <span className="text-xs font-semibold text-slate-300">
                Tap the record button below to begin.
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3">
          {!isRecording && !completed && !processing && (
            <button
              type="button"
              onClick={startRecording}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4" />
              <span>{t.recordVoice}</span>
            </button>
          )}

          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>{t.stopRecord}</span>
            </button>
          )}

          {completed && (
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={startRecording}
                className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-white font-extrabold text-xs transition"
              >
                Re-record
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Voice Sample</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
