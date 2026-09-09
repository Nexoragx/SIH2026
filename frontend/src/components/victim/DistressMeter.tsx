import React from 'react';
import { Activity, ShieldCheck, Heart, AlertTriangle, Sparkles, TrendingUp, Info } from 'lucide-react';
import { AssessmentResultData, RiskLevel } from '../../types';

interface DistressMeterProps {
  result: AssessmentResultData;
}

export const DistressMeter: React.FC<DistressMeterProps> = ({ result }) => {
  const score = result.finalDistressScore;

  // Determine meter styling and descriptive message
  const getLevelInfo = (level: RiskLevel) => {
    switch (level) {
      case 'crisis':
        return {
          label: 'Immediate Crisis Alert',
          color: '#8B0000',
          bgColor: 'bg-rose-50',
          textColor: 'text-rose-900',
          borderColor: 'border-rose-300',
          badge: '🆘 Critical Priority',
          desc: 'High emotional distress requiring urgent supportive intervention and direct counsellor callback.',
        };
      case 'critical':
        return {
          label: 'Critical Distress Level',
          color: '#C0392B',
          bgColor: 'bg-rose-50',
          textColor: 'text-rose-800',
          borderColor: 'border-rose-200',
          badge: '🔴 Severe Strain',
          desc: 'Significant emotional burden and sleep disruption. Immediate priority counselling scheduled.',
        };
      case 'high':
        return {
          label: 'Elevated Distress Level',
          color: '#E67E22',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-200',
          badge: '🟠 High Strain',
          desc: 'Noticeable stress markers identified. Weekly supportive follow-ups and calming exercises recommended.',
        };
      case 'moderate':
        return {
          label: 'Moderate Stress Level',
          color: '#F39C12',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          badge: '🟡 Moderate Strain',
          desc: 'Mild-to-moderate emotional weight detected. Regular self-care and bi-weekly check-ins advised.',
        };
      case 'low':
      default:
        return {
          label: 'Stable Well-Being Level',
          color: '#27AE60',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-800',
          borderColor: 'border-emerald-200',
          badge: '🟢 Balanced Mind',
          desc: 'Emotional indicators are stable and steady. Continue your routine wellness check-ins.',
        };
    }
  };

  const info = getLevelInfo(result.riskLevel);
  const strokeDashoffset = 440 - (440 * score) / 100;

  return (
    <div className="liquid-glass-panel rounded-3xl p-6 sm:p-8 shadow-md border border-white/80">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-indigo-100/60">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Dynamic Distress & Wellness Meter
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Multi-modal AI score based on MADRS, DSM-5 criteria, voice biomarkers & case context.
            </p>
          </div>
        </div>

        <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold border shadow-2xs ${info.bgColor} ${info.textColor} ${info.borderColor}`}>
          {info.badge}
        </span>
      </div>

      {/* Center Gauge & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Circular Gauge (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Circular Meter */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background Ring */}
              <circle
                cx="80"
                cy="80"
                r="70"
                className="stroke-slate-100/90"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Animated Value Ring */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={info.color}
                strokeWidth="12"
                strokeDasharray={440}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Score Center Label */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                {score.toFixed(1)}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                out of 100
              </span>
            </div>
          </div>

          <div className="text-center mt-3">
            <span className="text-xs font-extrabold text-slate-900">
              {info.label}
            </span>
            <p className="text-[11px] text-slate-500 font-medium max-w-xs mt-0.5 leading-relaxed">
              {info.desc}
            </p>
          </div>
        </div>

        {/* Right: Multi-Modal Feature Contribution (7 cols) */}
        <div className="md:col-span-7 space-y-3.5">
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Multi-Modal Feature Decomposition</span>
          </h4>

          <div className="space-y-3">
            {/* 1. MADRS Score (40%) */}
            <div className="p-3 rounded-2xl pastel-indigo space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-indigo-950">
                <span>MADRS Depressive Symptoms (40% Weight)</span>
                <span className="font-mono font-extrabold text-indigo-800">{result.totalMadrs}/60 pts</span>
              </div>
              <div className="w-full bg-indigo-200/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(result.totalMadrs / 60) * 100}%` }}
                />
              </div>
            </div>

            {/* 2. Estimated PHQ-9 Equivalent (20%) */}
            <div className="p-3 rounded-2xl pastel-teal space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-teal-950">
                <span>DSM-5 / PHQ-9 Mood Velocity (20% Weight)</span>
                <span className="font-mono font-extrabold text-teal-800">{result.phq9Equivalent}/27 pts</span>
              </div>
              <div className="w-full bg-teal-200/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(result.phq9Equivalent / 27) * 100}%` }}
                />
              </div>
            </div>

            {/* 3. Voice Biomarkers (10%) */}
            <div className="p-3 rounded-2xl pastel-lavender space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-violet-950">
                <span>Voice Biomarkers & Acoustic Jitter (10% Weight)</span>
                <span className="font-mono font-extrabold text-violet-800">{result.voiceStressScore.toFixed(1)}/10 pts</span>
              </div>
              <div className="w-full bg-violet-200/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-500 to-purple-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(result.voiceStressScore / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* 4. NLP & Case Context Bonus (30%) */}
            <div className="p-3 rounded-2xl pastel-amber space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-amber-950">
                <span>Atrocity Severity & Legal History (30% Weight)</span>
                <span className="font-mono font-extrabold text-amber-800">
                  {(result.nlpSentimentScore + result.contextualBonus).toFixed(1)}/30 pts
                </span>
              </div>
              <div className="w-full bg-amber-200/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${((result.nlpSentimentScore + result.contextualBonus) / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
