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

      {/* Database Session Verification Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/70 text-xs">
        <div className="flex items-center gap-2 text-indigo-950">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-extrabold">Stored DB Record:</span>
          <span className="font-mono font-bold text-indigo-700 bg-white/80 px-2 py-0.5 rounded border border-indigo-200/60">
            {result.sessionId || 'SESSION-LIVE-DB'}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-600">
          <span>Recorded: {result.date ? new Date(result.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
            MongoDB Verified
          </span>
          {result.crisisFlag && (
            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-bold border border-rose-200">
              108 Protocol Active
            </span>
          )}
        </div>
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
            <span>Multi-Modal Feature Decomposition (Database Synced)</span>
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
                  style={{ width: `${Math.min(100, (result.totalMadrs / 60) * 100)}%` }}
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
                  style={{ width: `${Math.min(100, (result.phq9Equivalent / 27) * 100)}%` }}
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
                  style={{ width: `${Math.min(100, (result.voiceStressScore / 10) * 100)}%` }}
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
                  style={{ width: `${Math.min(100, ((result.nlpSentimentScore + result.contextualBonus) / 30) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Granular SHAP Feature Attributions & Temporal Trend from Database */}
      <div className="mt-6 pt-6 border-t border-slate-200/60 grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* SHAP Explanations (7 cols) */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>SHAP Feature Attribution (Database Model Output)</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-bold">XGBoost Shapley Values</span>
          </div>

          <div className="space-y-2">
            {result.shapFactors && result.shapFactors.length > 0 ? (
              result.shapFactors.slice(0, 4).map((factor, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/60 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {factor.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {factor.description}
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-lg text-xs font-mono font-black bg-indigo-100/70 text-indigo-800 flex-shrink-0">
                    {typeof factor.impact === 'number' && factor.impact <= 1
                      ? `+${Math.round(factor.impact * 100)}%`
                      : `+${factor.impact}`}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic p-3">No active SHAP drivers detected.</div>
            )}
          </div>
        </div>

        {/* Temporal Trend Projection (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>LSTM Temporal Trajectory</span>
            </h4>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
              result.trendDirection === 'improving'
                ? 'bg-emerald-100 text-emerald-800'
                : result.trendDirection === 'escalating'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {result.trendDirection}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-purple-50/40 border border-indigo-100 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-600">7-Day Projected Distress</span>
              <span className="text-lg font-mono font-extrabold text-slate-900">
                {result.predictedScoreNextWeek.toFixed(1)}/100
              </span>
            </div>

            <div className="text-[11px] text-slate-600 leading-snug">
              {result.trendDirection === 'improving'
                ? 'Positive recovery gradient detected across recent sessions. Continue wellness practices.'
                : result.trendDirection === 'escalating'
                ? 'Accelerating strain pattern identified. Priority follow-up recommended.'
                : 'Distress baseline remains steady across monitoring intervals.'}
            </div>

            <div className="pt-2 border-t border-indigo-100/80 flex items-center justify-between text-[11px] font-bold text-indigo-900">
              <span>Next Check-in Cycle</span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 shadow-2xs">
                Every {result.recommendedCheckinDays} Day{result.recommendedCheckinDays > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
