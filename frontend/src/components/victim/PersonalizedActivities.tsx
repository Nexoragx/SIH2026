import React, { useState, useEffect } from 'react';
import {
  Wind,
  Sparkles,
  Heart,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Flame,
  Feather,
  Music,
  Smile,
  Shield,
  ArrowRight,
  Sun,
  Activity,
} from 'lucide-react';
import { AssessmentResultData } from '../../types';

interface PersonalizedActivitiesProps {
  currentLang: string;
  resultData: AssessmentResultData;
  onOpenCounsellorChat?: () => void;
}

export const PersonalizedActivities: React.FC<PersonalizedActivitiesProps> = ({
  currentLang,
  resultData,
  onOpenCounsellorChat,
}) => {
  const [activeActivity, setActiveActivity] = useState<'breathing' | 'grounding' | 'journal' | 'muscle' | 'sounds' | 'emdr'>('breathing');

  // 1. 4-7-8 Breathing State
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState<number>(4);
  const [breathCycles, setBreathCycles] = useState<number>(0);

  const playPhaseChime = (phase: 'Inhale' | 'Hold' | 'Exhale') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const f = phase === 'Inhale' ? 528 : phase === 'Hold' ? 639 : 396;
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(35); } catch (e) {}
    }
  };

  useEffect(() => {
    let interval: any;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev > 1) return prev - 1;
          if (breathPhase === 'Inhale') {
            setBreathPhase('Hold');
            playPhaseChime('Hold');
            return 7;
          } else if (breathPhase === 'Hold') {
            setBreathPhase('Exhale');
            playPhaseChime('Exhale');
            return 8;
          } else {
            setBreathPhase('Inhale');
            playPhaseChime('Inhale');
            setBreathCycles((c) => c + 1);
            return 4;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase]);

  // Bilateral EMDR Eye Movement Calmer State
  const [emdrActive, setEmdrActive] = useState<boolean>(false);
  const [emdrSpeed, setEmdrSpeed] = useState<'slow' | 'medium'>('slow');

  // 2. 5-4-3-2-1 Grounding State
  const [groundingChecks, setGroundingChecks] = useState<{ [key: string]: boolean }>({});

  const toggleGroundingCheck = (key: string) => {
    setGroundingChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 3. Dissolving Thought Release State
  const [heavyThought, setHeavyThought] = useState<string>('');
  const [isDissolving, setIsDissolving] = useState<boolean>(false);
  const [dissolved, setDissolved] = useState<boolean>(false);

  const handleReleaseThought = () => {
    if (!heavyThought.trim()) return;
    setIsDissolving(true);
    setTimeout(() => {
      setIsDissolving(false);
      setDissolved(true);
      setHeavyThought('');
    }, 2000);
  };

  // 4. Progressive Muscle Relaxation State
  const [muscleStep, setMuscleStep] = useState<number>(0);
  const muscleSteps = [
    { title: '1. Forehead & Brow', instruction: 'Gently raise your eyebrows, hold for 5s, then release and soften your forehead.' },
    { title: '2. Jaw & Cheeks', instruction: 'Clench your teeth softly, notice the tightness, then let your mouth relax slightly open.' },
    { title: '3. Shoulders & Neck', instruction: 'Draw your shoulders up towards your ears, hold tension, then let them drop completely.' },
    { title: '4. Hands & Arms', instruction: 'Make tight fists with both hands, feel the warmth, and unclench your fingers wide.' },
    { title: '5. Chest & Breath', instruction: 'Take a full deep breath into your ribcage, pause, and exhale any residual heaviness.' },
    { title: '6. Legs & Feet', instruction: 'Point your toes forward, stretch your calves, then let your entire lower body sink into rest.' },
  ];

  // 5. Ambient Soothing Soundscape State & Web Audio Synthesizer
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const audioNodesRef = React.useRef<{ ctx: AudioContext; osc?: OscillatorNode; gain: GainNode } | null>(null);

  const soundscapes = [
    { id: 'temple', title: 'Himalayan Singing Bowls', desc: '432Hz deep meditative resonance', icon: '🔔', freq: 432 },
    { id: 'rain', title: 'Gentle Monsoon on Leaves', desc: 'Soothing natural pink noise', icon: '🌧️', freq: 220 },
    { id: 'ocean', title: 'Calm Ocean Shore Waves', desc: 'Rhythmic tidal relaxation', icon: '🌊', freq: 174 },
    { id: 'forest', title: 'Dawn Birdsong & Flute', desc: 'Uplifting morning peace', icon: '🕊️', freq: 528 },
  ];

  const stopSoundscape = () => {
    if (audioNodesRef.current) {
      try {
        if (audioNodesRef.current.osc) {
          audioNodesRef.current.osc.stop();
        }
        audioNodesRef.current.ctx.close();
      } catch (e) {}
      audioNodesRef.current = null;
    }
  };

  const toggleSoundscape = (soundId: string) => {
    if (playingSound === soundId) {
      stopSoundscape();
      setPlayingSound(null);
      return;
    }

    stopSoundscape();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.connect(ctx.destination);

      const target = soundscapes.find((s) => s.id === soundId);
      const freq = target ? target.freq : 432;

      const osc = ctx.createOscillator();
      osc.type = soundId === 'temple' ? 'sine' : soundId === 'ocean' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(gainNode);
      osc.start();

      audioNodesRef.current = { ctx, osc, gain: gainNode };
      setPlayingSound(soundId);
    } catch (e) {
      console.warn('Sound synthesis error:', e);
      setPlayingSound(soundId);
    }
  };

  useEffect(() => {
    return () => {
      stopSoundscape();
    };
  }, []);

  // Personalized Advice Box based on Score
  const getPersonalizedRecommendations = () => {
    if (resultData.finalDistressScore >= 75 || resultData.crisisFlag) {
      return {
        tag: 'High Relief Priority',
        badge: '🚨 Critical Care Suggested',
        title: 'Priority Grounding & Direct Human Support',
        advice: 'Your check-in indicates significant acute distress and sleep strain. We strongly suggest connecting with our district observer or trying rapid 5-4-3-2-1 sensory grounding.',
        recommendedTab: 'grounding' as const,
      };
    } else if (resultData.finalDistressScore >= 50) {
      return {
        tag: 'Restorative Care',
        badge: '🟠 De-escalation Plan',
        title: 'Thought Release & 4-7-8 Breathing Pacer',
        advice: 'Elevated emotional tension detected. Releasing stressful thoughts in the Thought Journal and practicing 4-7-8 breath cycles will help lower your heart rate and ease anxiety.',
        recommendedTab: 'journal' as const,
      };
    } else {
      return {
        tag: 'Wellness Maintenance',
        badge: '🟢 Mindful Balance',
        title: 'Progressive Body Relaxation & Soundscapes',
        advice: 'Your baseline indicators are steady. Try a 5-minute progressive muscle scan or ambient soundscape to maintain calmness.',
        recommendedTab: 'sounds' as const,
      };
    }
  };

  const recommendation = getPersonalizedRecommendations();

  return (
    <div className="space-y-6 animate-fadeInScale">
      {/* Dynamic AI Prescription / Recommendation Banner */}
      <div className="liquid-glass-panel rounded-3xl p-6 sm:p-7 shadow-lg border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/90">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700">
                {recommendation.tag} • Dynamic Score: {resultData.finalDistressScore.toFixed(1)}/100
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                {recommendation.title}
              </h3>
            </div>
          </div>
          <span className="text-xs font-extrabold text-indigo-900 bg-white px-3 py-1 rounded-full border border-indigo-200 shadow-2xs">
            {recommendation.badge}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          {recommendation.advice}
        </p>
      </div>

      {/* Activity Switcher Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'breathing', label: '4-7-8 Breathing', icon: <Wind className="w-3.5 h-3.5" /> },
          { id: 'grounding', label: '5-4-3-2-1 Grounding', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'emdr', label: 'Bilateral EMDR', icon: <Activity className="w-3.5 h-3.5" /> },
          { id: 'journal', label: 'Thought Release', icon: <Feather className="w-3.5 h-3.5" /> },
          { id: 'muscle', label: 'Body Scan', icon: <Smile className="w-3.5 h-3.5" /> },
          { id: 'sounds', label: 'Ambient Sounds', icon: <Music className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveActivity(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeActivity === tab.id
                ? 'liquid-tile-selected scale-[1.02] text-indigo-950'
                : 'liquid-tile text-slate-700 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ACTIVITY 1: 4-7-8 Breathing Pacer */}
      {activeActivity === 'breathing' && (
        <div className="liquid-glass-panel rounded-3xl p-6 sm:p-10 shadow-xl text-center bg-white/95">
          <h3 className="text-lg font-extrabold text-slate-900 mb-1">
            4-7-8 Deep Tranquility Breath Pacer
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-6">
            Inhale for 4 seconds • Hold gently for 7 seconds • Exhale slowly for 8 seconds
          </p>

          <div className="flex flex-col items-center justify-center py-6">
            <div
              className={`w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-1000 shadow-2xl ${
                !isBreathingActive
                  ? 'bg-slate-50 border-4 border-slate-200'
                  : breathPhase === 'Inhale'
                  ? 'bg-teal-50 border-8 border-teal-400 scale-110 shadow-teal-400/30'
                  : breathPhase === 'Hold'
                  ? 'bg-indigo-50 border-8 border-indigo-400 scale-110 shadow-indigo-400/30'
                  : 'bg-purple-50 border-4 border-purple-300 scale-95'
              }`}
            >
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500 mb-1">
                {!isBreathingActive ? 'Ready' : breathPhase}
              </span>
              <span className="text-4xl font-black text-slate-900 font-mono">
                {!isBreathingActive ? '4-7-8' : `${breathTimer}s`}
              </span>
              <span className="text-[11px] text-slate-600 mt-1 font-semibold px-2">
                {!isBreathingActive
                  ? 'Press start below'
                  : breathPhase === 'Inhale'
                  ? 'Breathe in through nose'
                  : breathPhase === 'Hold'
                  ? 'Hold gently'
                  : 'Exhale through mouth'}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                type="button"
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                className={`px-6 py-3 rounded-2xl text-xs font-extrabold text-white shadow-lg transition flex items-center gap-2 ${
                  isBreathingActive
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                }`}
              >
                {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isBreathingActive ? 'Pause Exercise' : 'Start 4-7-8 Pacer'}</span>
              </button>
              {isBreathingActive && (
                <button
                  type="button"
                  onClick={() => {
                    setIsBreathingActive(false);
                    setBreathTimer(4);
                    setBreathPhase('Inhale');
                  }}
                  className="p-3 rounded-2xl liquid-tile text-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY 2: 5-4-3-2-1 Interactive Grounding Checklist */}
      {activeActivity === 'grounding' && (
        <div className="liquid-glass-panel rounded-3xl p-6 sm:p-8 shadow-xl bg-white/95">
          <h3 className="text-lg font-extrabold text-slate-900 mb-1">
            5-4-3-2-1 Interactive Sensory Grounding Checklist
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-6">
            Tap each box as you notice items in your immediate physical surroundings to reconnect with the present moment.
          </p>

          <div className="space-y-3">
            {[
              { id: 's5', num: '5', label: 'Look around and notice 5 things you can SEE (e.g. wall, sky, clock, door, shoes)', icon: '👁️' },
              { id: 's4', num: '4', label: 'Feel and touch 4 physical textures (e.g. your clothes, chair, wooden table, cool water)', icon: '✋' },
              { id: 's3', num: '3', label: 'Listen carefully for 3 sounds (e.g. fan hum, distant birds, your own steady breath)', icon: '👂' },
              { id: 's2', num: '2', label: 'Acknowledge 2 scents or aromas you can SMELL in the room', icon: '👃' },
              { id: 's1', num: '1', label: 'Notice 1 positive feeling or TASTE in your mouth (e.g. sip of water)', icon: '👅' },
            ].map((item) => {
              const isDone = groundingChecks[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleGroundingCheck(item.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isDone
                      ? 'liquid-tile-selected bg-emerald-50/80 border-emerald-500 text-emerald-950'
                      : 'liquid-tile hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <span className="text-xs font-black text-indigo-700 mr-2">STEP {item.num}</span>
                      <p className={`text-xs font-bold ${isDone ? 'text-emerald-900 line-through' : 'text-slate-800'}`}>
                        {item.label}
                      </p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border ${
                    isDone ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300 bg-white'
                  }`}>
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTIVITY 3: Dissolving Thought Release Journal */}
      {activeActivity === 'journal' && (
        <div className="liquid-glass-panel rounded-3xl p-6 sm:p-8 shadow-xl bg-white/95">
          <div className="flex items-center gap-2 mb-1">
            <Feather className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-extrabold text-slate-900">
              Dissolving Thought Release Journal
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mb-6">
            Write down whatever heavy memory, fear, or frustration is burdening your mind right now. When ready, press "Release into Light" and watch it fade away. Nothing is stored.
          </p>

          <div className="relative">
            <textarea
              value={heavyThought}
              onChange={(e) => setHeavyThought(e.target.value)}
              placeholder="Write whatever is hurting or troubling you freely here..."
              rows={4}
              disabled={isDissolving}
              className={`w-full p-4 rounded-2xl border border-slate-200 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-1000 bg-white ${
                isDissolving ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'
              }`}
            />

            {dissolved && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2 mb-4 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Your thought has been gently released. You do not have to carry it all alone.</span>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setHeavyThought('')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleReleaseThought}
                disabled={!heavyThought.trim() || isDissolving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-extrabold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isDissolving ? 'Dissolving into Light...' : 'Release & Let Go'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY 4: Progressive Muscle Relaxation */}
      {activeActivity === 'muscle' && (
        <div className="liquid-glass-panel rounded-3xl p-6 sm:p-8 shadow-xl bg-white/95">
          <h3 className="text-lg font-extrabold text-slate-900 mb-1">
            Progressive Head-to-Toe Muscle Relaxation
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-6">
            Systematically releases somatic tension stored in muscle groups after traumatic experiences.
          </p>

          <div className="p-6 rounded-3xl bg-indigo-50/70 border border-indigo-200 text-center mb-6">
            <span className="text-xs font-black text-indigo-700 uppercase tracking-widest block mb-1">
              {muscleSteps[muscleStep].title}
            </span>
            <p className="text-sm font-bold text-slate-900 leading-relaxed max-w-md mx-auto">
              {muscleSteps[muscleStep].instruction}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setMuscleStep((prev) => Math.max(0, prev - 1))}
              disabled={muscleStep === 0}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40"
            >
              Previous Step
            </button>
            <span className="text-xs font-bold text-slate-500 font-mono">
              Step {muscleStep + 1} of {muscleSteps.length}
            </span>
            <button
              type="button"
              onClick={() => setMuscleStep((prev) => Math.min(muscleSteps.length - 1, prev + 1))}
              disabled={muscleStep === muscleSteps.length - 1}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* ACTIVITY 5: Soothing Soundscapes */}
      {activeActivity === 'sounds' && (
        <div className="liquid-glass-panel rounded-3xl p-6 sm:p-8 shadow-xl bg-white/95">
          <h3 className="text-lg font-extrabold text-slate-900 mb-1">
            Therapeutic Ambient Soundscapes
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-6">
            Calming audio loops created to assist restorative sleep and reduce physiological arousal.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {soundscapes.map((snd) => {
              const isPlaying = playingSound === snd.id;
              return (
                <div
                  key={snd.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    isPlaying ? 'liquid-tile-selected' : 'liquid-tile'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{snd.icon}</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{snd.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{snd.desc}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSoundscape(snd.id)}
                    className={`p-2.5 rounded-xl transition shadow-xs ${
                      isPlaying
                        ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTIVITY 6: Bilateral EMDR Eye Movement Calmer */}
      {activeActivity === 'emdr' && (
        <div className="liquid-glass-panel rounded-3xl p-6 sm:p-8 shadow-xl bg-white/95 text-center space-y-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Clinical Trauma Desensitization Protocol
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2">
              Bilateral Visual Calmer (EMDR Protocol)
            </h3>
            <p className="text-xs text-slate-600 font-medium max-w-lg mx-auto mt-1">
              Follow the soothing light horizontally with your eyes while keeping your head still. Bilateral brain activation gently down-regulates amygdala fear alarms.
            </p>
          </div>

          {/* EMDR Moving Track */}
          <div className="relative h-24 sm:h-28 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center px-4 shadow-inner">
            <div className="w-full relative">
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 via-indigo-400 to-purple-400 shadow-lg shadow-teal-400/50 flex items-center justify-center transition-all ${
                  emdrActive
                    ? emdrSpeed === 'slow'
                      ? 'animate-emdr-slow'
                      : 'animate-emdr-medium'
                    : 'mx-auto'
                }`}
              >
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEmdrActive(!emdrActive)}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-md ${
                emdrActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {emdrActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{emdrActive ? 'Pause EMDR' : 'Start Bilateral Pacer'}</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setEmdrSpeed('slow')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  emdrSpeed === 'slow' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Gentle (0.5 Hz)
              </button>
              <button
                type="button"
                onClick={() => setEmdrSpeed('medium')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  emdrSpeed === 'medium' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Medium (0.8 Hz)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
