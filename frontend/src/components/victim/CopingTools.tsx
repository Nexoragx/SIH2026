import React, { useState, useEffect } from 'react';
import { Wind, Sparkles, Heart, MessageSquare, Play, Pause, RotateCcw, ShieldCheck } from 'lucide-react';
import { COMMUNITY_HOPE_MESSAGES } from '../../data/mockData';
import { translations } from '../../utils/translations';

interface CopingToolsProps {
  currentLang: string;
}

export const CopingTools: React.FC<CopingToolsProps> = ({ currentLang }) => {
  const t = translations[currentLang] || translations.en;

  // 4-7-8 Breathing Pacer State
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [timerCount, setTimerCount] = useState<number>(4);
  const [cycleCount, setCycleCount] = useState<number>(0);

  useEffect(() => {
    let interval: any;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setTimerCount((prev) => {
          if (prev > 1) return prev - 1;

          if (phase === 'Inhale') {
            setPhase('Hold');
            return 7;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 8;
          } else {
            setPhase('Inhale');
            setCycleCount((c) => c + 1);
            return 4;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, phase]);

  const toggleBreathing = () => {
    if (!isBreathingActive) {
      setPhase('Inhale');
      setTimerCount(4);
      setCycleCount(0);
      setIsBreathingActive(true);
    } else {
      setIsBreathingActive(false);
    }
  };

  const resetBreathing = () => {
    setIsBreathingActive(false);
    setPhase('Inhale');
    setTimerCount(4);
    setCycleCount(0);
  };

  return (
    <div className="space-y-6 animate-fadeInScale">
      {/* 4-7-8 Breathing Circle with Blooming Glowing Rings */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="ambient-orb w-60 h-60 bg-teal-300/30 -top-10 -left-10"></div>
        <div className="ambient-orb w-60 h-60 bg-indigo-300/30 -bottom-10 -right-10"></div>

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-500/30">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                4-7-8 Deep Tranquility Breathing
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Activates your parasympathetic nervous system to release emotional tension and anxiety.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-indigo-700 bg-indigo-50/90 px-3 py-1 rounded-full font-bold border border-indigo-200/60">
            Cycle {cycleCount}/4
          </div>
        </div>

        {/* Luminous Animated Breathing Circle */}
        <div className="flex flex-col items-center justify-center py-8 relative z-10">
          <div
            className={`w-52 h-52 rounded-full flex flex-col items-center justify-center relative transition-all duration-1000 shadow-2xl ${
              !isBreathingActive
                ? 'bg-white/70 border-4 border-indigo-100 shadow-indigo-500/10'
                : phase === 'Inhale'
                ? 'bg-gradient-to-br from-teal-50 to-emerald-100/90 border-8 border-teal-400 scale-110 shadow-teal-400/40 ring-8 ring-teal-200/40'
                : phase === 'Hold'
                ? 'bg-gradient-to-br from-indigo-50 to-purple-100/90 border-8 border-indigo-400 scale-110 shadow-indigo-400/40 ring-8 ring-indigo-200/40'
                : 'bg-gradient-to-br from-purple-50 to-rose-100/80 border-4 border-purple-300 scale-95 shadow-purple-300/30'
            }`}
          >
            <span className="text-[11px] uppercase font-extrabold tracking-widest text-slate-500 mb-1">
              {!isBreathingActive ? 'Relax' : phase}
            </span>
            <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
              {!isBreathingActive ? '4-7-8' : `${timerCount}s`}
            </span>
            <span className="text-[11px] text-slate-600 mt-1 font-semibold text-center px-4">
              {!isBreathingActive
                ? 'Tap Start Below'
                : phase === 'Inhale'
                ? 'Gently breathe in through nose'
                : phase === 'Hold'
                ? 'Gently hold your breath'
                : 'Slowly release through mouth'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-8">
            <button
              type="button"
              onClick={toggleBreathing}
              className={`px-6 py-3 rounded-2xl text-xs font-extrabold text-white shadow-lg transition flex items-center gap-2 ${
                isBreathingActive
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                  : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-teal-600/30'
              }`}
            >
              {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isBreathingActive ? 'Pause Exercise' : 'Begin 4-7-8 Breathing'}</span>
            </button>

            {isBreathingActive && (
              <button
                type="button"
                onClick={resetBreathing}
                className="p-3 rounded-2xl glass-panel text-slate-700 hover:bg-white transition"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5-4-3-2-1 Sensory Grounding Palette */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h3 className="text-base font-extrabold text-slate-900">
            5-4-3-2-1 Rapid Sensory Grounding
          </h3>
        </div>
        <p className="text-xs text-slate-600 mb-5 font-medium leading-relaxed">
          If you feel overwhelmed by flashbacks or anxious thoughts, gently observe your immediate space:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { num: '5', label: 'Things You See', icon: '👁️', color: 'from-blue-500/10 to-indigo-500/10' },
            { num: '4', label: 'Things You Touch', icon: '✋', color: 'from-teal-500/10 to-emerald-500/10' },
            { num: '3', label: 'Things You Hear', icon: '👂', color: 'from-amber-500/10 to-yellow-500/10' },
            { num: '2', label: 'Things You Smell', icon: '👃', color: 'from-purple-500/10 to-pink-500/10' },
            { num: '1', label: 'Thing You Taste', icon: '👅', color: 'from-rose-500/10 to-red-500/10' },
          ].map((g) => (
            <div
              key={g.num}
              className={`glass-tile p-4 rounded-2xl flex flex-col items-center text-center shadow-xs bg-gradient-to-br ${g.color}`}
            >
              <span className="text-2xl mb-1.5">{g.icon}</span>
              <span className="text-base font-black text-indigo-700">{g.num}</span>
              <span className="text-[11px] font-bold text-slate-800 leading-tight">
                {g.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Community Survivor Hope Wall */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Community Survivor Hope Wall
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real reflections and messages of resilience from survivors across the country.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {COMMUNITY_HOPE_MESSAGES.map((msg) => (
            <div
              key={msg.id}
              className="glass-tile p-5 rounded-2xl flex flex-col justify-between"
            >
              <p className="text-xs text-slate-700 italic leading-relaxed mb-4 font-medium">
                {msg.text}
              </p>
              <div className="pt-3 border-t border-white/70 flex flex-col">
                <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider">
                  {msg.badge}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {msg.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
