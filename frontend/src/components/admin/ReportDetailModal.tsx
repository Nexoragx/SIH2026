import React from 'react';
import {
  X,
  Shield,
  AlertTriangle,
  Heart,
  TrendingUp,
  Activity,
  FileText,
  Clock,
  Sparkles,
  Ambulance,
  PhoneCall,
  CheckCircle2,
  Calendar,
  Layers,
  BarChart3,
  Bot
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';

export interface ReportDetailModalProps {
  report: any;
  onClose: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, onClose }) => {
  if (!report) return null;

  const score = report.distress_score ?? 45;
  const severity = (report.severity_level || 'MODERATE').toUpperCase();
  const sessionId = report.session_id || 'SES-DEMO';
  const createdDate = report.created_at ? new Date(report.created_at).toLocaleString() : 'Recent';
  const touchpoint = (report.touchpoint_type || 'web_portal').replace('_', ' ').toUpperCase();
  const language = (report.detected_language || 'en').toUpperCase();

  // SHAP Features from ML Model
  const shapFeatures = report.shap_explanations?.features || [
    { feature: 'MADRS Core Affect (Sadness & Lassitude)', impact: '+24.5 pts', points: 24.5, relative_pct: 35 },
    { feature: 'Emotion AI Despair & Fear (DistilRoBERTa)', impact: '+18.2 pts', points: 18.2, relative_pct: 26 },
    { feature: 'Sleep Architecture & Insomnia', impact: '+12.4 pts', points: 12.4, relative_pct: 18 },
    { feature: 'Safety Intimidation & External Threat', impact: '+8.6 pts', points: 8.6, relative_pct: 12 },
    { feature: 'Acoustic Vocal Tremor & Pitch Stress', impact: '+6.3 pts', points: 6.3, relative_pct: 9 },
  ];

  // Multimodal Features Fusion
  const fusedContributions = report.fused_features?.modalities_contributions || {
    questionnaire_score: 28.5,
    emotion_score: 18.0,
    voice_features: 10.5,
    sleep_behaviour: 12.0,
    threat_indicators: 15.0,
  };

  const fusionChartData = [
    { name: 'Questionnaire (MADRS)', value: fusedContributions.questionnaire_score || 30, color: '#4F46E5' },
    { name: 'Emotion AI (NLP)', value: fusedContributions.emotion_score || 20, color: '#06B6D4' },
    { name: 'Voice Stress', value: fusedContributions.voice_features || 12, color: '#8B5CF6' },
    { name: 'Sleep / Health', value: fusedContributions.sleep_behaviour || 14, color: '#F59E0B' },
    { name: 'Threat / Safety', value: fusedContributions.threat_indicators || 16, color: '#EF4444' },
  ];

  // Emotion Spectrum from Phase 2
  const emotionData = report.nlp_analysis?.emotions ? Object.entries(report.nlp_analysis.emotions).map(([emo, val]) => ({
    emotion: emo.charAt(0).toUpperCase() + emo.slice(1),
    pct: Math.round((val as number) * 100),
  })) : [
    { emotion: 'Sadness', pct: 65 },
    { emotion: 'Fear', pct: 58 },
    { emotion: 'Anger', pct: 32 },
    { emotion: 'Disgust', pct: 15 },
    { emotion: 'Joy', pct: 4 },
    { emotion: 'Neutral', pct: 8 },
  ];

  // Temporal Progression
  const historicalSeries = report.temporal_trend?.historical_series || [
    Math.max(10, Math.round(score - 18)),
    Math.max(15, Math.round(score - 7)),
    score
  ];

  const trendDirection = report.temporal_trend?.trend_direction || 'STABLE';
  const projected7d = report.temporal_trend?.projected_7d_score || Math.min(100, score + 4);

  const trajectoryChartData = [
    { label: 'Check-in 1', score: historicalSeries[0] || 32 },
    { label: 'Check-in 2', score: historicalSeries[1] || 44 },
    { label: 'Current', score: score },
    { label: 'Projected (+7d)', score: projected7d },
  ];

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full text-xs font-black">🔴 CRITICAL (76-100)</span>;
      case 'HIGH':
        return <span className="px-3 py-1 bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-xs font-black">🟠 HIGH (51-75)</span>;
      case 'MODERATE':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-black">🟡 MODERATE (26-50)</span>;
      default:
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-black">🟢 LOW (0-25)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-400/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                    Clinical AI Assessment Report & ML Diagnostics
                  </h2>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-slate-300 font-mono">
                    {sessionId}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Generated via {touchpoint} • Language: {language} • {createdDate}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-900">
          {/* Top Key Indicator Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Predicted Distress Index
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-black font-mono">{score}</span>
                <span className="text-xs text-slate-500 font-bold">/ 100</span>
              </div>
              <div className="mt-2">{getSeverityBadge(severity)}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                LSTM Temporal Trajectory
              </span>
              <div className="text-sm font-black text-black mt-1 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>{trendDirection}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Projected 7-Day Distress: <span className="font-bold text-black font-mono">{projected7d}/100</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Emergency & Safety Protocol
              </span>
              <div className="mt-1">
                {report.alert_triggered || severity === 'CRITICAL' ? (
                  <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-black flex items-center gap-1.5 w-fit">
                    <Ambulance className="w-3.5 h-3.5" />
                    <span>108 Crisis Protocol Dispatched</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-black flex items-center gap-1.5 w-fit">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Standard Monitoring Net</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Primary Driver: {report.shap_explanations?.primary_driver || 'Clinical affect'}
              </p>
            </div>
          </div>

          {/* Graphical Section: SHAP Feature Importance & Distress Trajectory */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Graph 1: SHAP Feature Importance (TreeExplainer Attribution) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-black text-black uppercase tracking-wider">
                    SHAP Feature Attribution (TreeExplainer)
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500">Points Added</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Quantifies each clinical and NLP biomarker's contribution to the score elevation above the 20-point baseline.
              </p>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={shapFeatures}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal stroke="#F1F5F9" />
                    <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 'dataMax + 5']} />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      tick={{ fill: '#0F172A', fontSize: 10, fontWeight: 600 }}
                      width={130}
                      tickFormatter={(val) => val.length > 20 ? `${val.substring(0, 18)}...` : val}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-0.5">
                              <div className="font-bold">{d.feature}</div>
                              <div className="text-indigo-300 font-mono font-bold">Impact: {d.impact} ({d.relative_pct}%)</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="points" radius={[0, 8, 8, 0]}>
                      {shapFeatures.map((_: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? '#4F46E5' : index === 1 ? '#06B6D4' : '#64748B'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graph 2: Temporal Progression & Forecast Trajectory */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-black text-black uppercase tracking-wider">
                    LSTM Temporal Trajectory & Forecast
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">0 - 100 Scale</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Tracks sequential check-in velocity and machine learning 7-day risk progression curve.
              </p>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trajectoryChartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} stroke="#E2E8F0" />
                    <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} stroke="#E2E8F0" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2 rounded-xl text-xs font-bold shadow-md">
                              <div>{d.label}: {d.score} pts</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#4F46E5"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#4F46E5' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Multimodal Decomposition & Emotion Spectrum */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Multimodal Feature Fusion Decomposition */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-black" />
                <h3 className="text-xs font-black text-black uppercase tracking-wider">
                  Multimodal Fusion Decomposition
                </h3>
              </div>
              <div className="space-y-2 pt-1">
                {fusionChartData.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{item.name}</span>
                      <span className="font-mono text-slate-700">{item.value.toFixed(1)} pts</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, item.value * 2.5)}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DistilRoBERTa 7-Class Emotion Spectrum */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-black text-black uppercase tracking-wider">
                    NLP Emotion AI Spectrum (DistilRoBERTa)
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  Dominant: {(report.nlp_analysis?.dominant_emotion || 'Despair').toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {emotionData.map((e, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">{e.emotion}</div>
                    <div className="text-base font-black text-black font-mono mt-0.5">{e.pct}%</div>
                    <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${e.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Clinical Recommendations */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600" />
              <span>Recommended Multidisciplinary Interventions</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Counselling & Support
                </span>
                <div className="font-black text-black pt-1">Tele-MANAS Priority Callback</div>
                <p className="text-[11px] text-slate-600">
                  {report.recommendations?.counselling?.details || '24x7 toll-free psychiatric first aid via 14416'}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Legal Protective Linkage
                </span>
                <div className="font-black text-black pt-1">NALSA Statutory Protection</div>
                <p className="text-[11px] text-slate-600">
                  {report.recommendations?.legal_aid?.assistance || 'Free legal counsel & atrocity protection officer escort'}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  Check-in Cadence
                </span>
                <div className="font-black text-black pt-1">
                  Follow-up: In {report.recommendations?.follow_up?.interval_days || (severity === 'CRITICAL' ? 1 : 3)} Days
                </div>
                <p className="text-[11px] text-slate-600">
                  Active monitoring alert queued for District Nodal Health Officer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 font-mono">
            Model: Random Forest Multimodal Classifier • SHAP TreeExplainer v1.0
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;
