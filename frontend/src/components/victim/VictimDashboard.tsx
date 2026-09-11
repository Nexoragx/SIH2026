import React, { useState, useEffect } from 'react';
import {
  Heart,
  Calendar,
  PhoneCall,
  Ambulance,
  MessageSquare,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Wind,
  Activity,
  FileText,
  Users,
  ShieldCheck,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { assessmentApi, supportApi, authApi, getStoredUser } from '../../api';
import { DistressMeter } from './DistressMeter';
import { PersonalizedActivities } from './PersonalizedActivities';
import { CommunityWall } from './CommunityWall';
import { DoctorDirectoryModal } from './DoctorDirectoryModal';
import { AssessmentResultData, RiskLevel } from '../../types';

interface VictimDashboardProps {
  onStartCheckin: () => void;
  onOpenSupport: () => void;
  onOpenChat: () => void;
  onOpenEmergency: () => void;
  onOpenSchedule: () => void;
  onOpenCommunityWall?: () => void;
  onOpenTherapeutic?: () => void;
  onOpenUssdSimulator?: () => void;
  currentLang?: string;
  initialSubTab?: 'overview' | 'exercises' | 'scale' | 'community';
  targetExercise?: 'breathing' | 'grounding' | 'journal' | 'muscle' | 'sounds' | 'emdr';
  userProfile?: any;
}

export const VictimDashboard: React.FC<VictimDashboardProps> = ({
  onStartCheckin,
  onOpenSupport,
  onOpenChat,
  onOpenEmergency,
  onOpenSchedule,
  onOpenCommunityWall,
  onOpenTherapeutic,
  onOpenUssdSimulator,
  currentLang = 'en',
  initialSubTab = 'overview',
  targetExercise,
  userProfile,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'exercises' | 'scale' | 'community'>(initialSubTab);
  const [currentSelectedExercise, setCurrentSelectedExercise] = useState<string | undefined>(targetExercise);
  const [liveAssignedObserver, setLiveAssignedObserver] = useState<any>(() => {
    return userProfile?.assignedObserver || getStoredUser()?.assigned_observer || getStoredUser()?.assignedObserver || null;
  });

  useEffect(() => {
    if (userProfile?.assignedObserver) {
      setLiveAssignedObserver(userProfile.assignedObserver);
    }
  }, [userProfile]);

  useEffect(() => {
    const handleObserverUpdate = (e: any) => {
      if (e.detail?.observer !== undefined) {
        setLiveAssignedObserver(e.detail.observer);
      }
    };
    window.addEventListener('anvaya_observer_assigned', handleObserverUpdate);
    return () => window.removeEventListener('anvaya_observer_assigned', handleObserverUpdate);
  }, []);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    setCurrentSelectedExercise(targetExercise);
  }, [targetExercise]);
  const [isDoctorDirectoryOpen, setIsDoctorDirectoryOpen] = useState<boolean>(false);

  const [scheduleData, setScheduleData] = useState<{
    days_remaining: number;
    completed_sessions: number;
    next_due_date: string;
  }>({
    days_remaining: 5,
    completed_sessions: 3,
    next_due_date: 'Saturday, 12 Sep 2026',
  });

  const [historyData, setHistoryData] = useState<any[]>([
    { date: '25 Aug', status: 'Stable', value: 80 },
    { date: '30 Aug', status: 'Needs attention', value: 65 },
    { date: '04 Sep', status: 'Needs attention', value: 60 },
    { date: '08 Sep', status: 'Stable', value: 75 },
  ]);

  const [wellbeingStatus, setWellbeingStatus] = useState<{
    label: string;
    subtext: string;
    dotColor: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
  }>({
    label: 'Stable',
    subtext: 'Your recent check-in indicates positive emotional balance.',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-900',
    bgColor: 'bg-emerald-50/80',
    borderColor: 'border-emerald-200',
  });

  const [latestAssessment, setLatestAssessment] = useState<AssessmentResultData>({
    sessionId: 'SESS-INIT-001',
    date: new Date().toISOString(),
    userId: 'VICTIM-DEMO',
    finalDistressScore: 28.5,
    riskLevel: 'low',
    totalMadrs: 12,
    phq9Equivalent: 5,
    voiceStressScore: 2.1,
    nlpSentimentScore: 3.4,
    contextualBonus: 4.2,
    crisisFlag: false,
    threatFlag: false,
    dsm5Probable: false,
    shapFactors: [
      { name: 'Normal Mood Architecture', impact: 0.12, description: 'Stable affect & sleep' },
      { name: 'Occasional Fatigue', impact: 0.08, description: 'Mild sleep latency' },
    ],
    predictedScoreNextWeek: 25.0,
    trendVelocity: -1.2,
    trendDirection: 'improving',
    recommendedCheckinDays: 7,
    personalizedSuggestions: [
      {
        category: 'immediate',
        title: '4-7-8 Pranayama Breathwork',
        description: 'Practice slow breathing to maintain parasympathetic balance.',
        actionLabel: 'Start Breathing',
        actionType: 'activity',
      },
    ],
  });

  useEffect(() => {
    // Fetch schedule from backend
    supportApi
      .getCheckinSchedule()
      .then((res) => {
        setScheduleData({
          days_remaining: res.days_remaining || 5,
          completed_sessions: res.completed_sessions || 3,
          next_due_date: res.next_due_date || 'Upcoming',
        });
      })
      .catch(() => {});

    // Fetch assessment history from backend
    assessmentApi
      .getVictimHistory()
      .then((res) => {
        if (res.history && res.history.length > 0) {
          const points = res.history
            .slice(0, 5)
            .reverse()
            .map((item, idx) => {
              const rawScore = item.distress_score || 30;
              const wellbeingVal = Math.max(10, Math.min(100, 100 - rawScore));
              const statusLabel =
                wellbeingVal >= 70
                  ? 'Stable'
                  : wellbeingVal >= 45
                  ? 'Needs attention'
                  : 'Extra support recommended';
              const dateStr = item.created_at
                ? new Date(item.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })
                : `Session ${idx + 1}`;
              return {
                date: dateStr,
                status: statusLabel,
                value: wellbeingVal,
                rawDistress: rawScore,
              };
            });
          setHistoryData(points);

          const latest = points[points.length - 1];
          if (latest.status === 'Stable') {
            setWellbeingStatus({
              label: 'Stable',
              subtext: 'Your recent check-in indicates positive emotional balance.',
              dotColor: 'bg-emerald-500',
              textColor: 'text-emerald-900',
              bgColor: 'bg-emerald-50/80',
              borderColor: 'border-emerald-200',
            });
          } else if (latest.status === 'Needs attention') {
            setWellbeingStatus({
              label: 'Needs attention',
              subtext: 'Gentle stress signs noticed. Take things one step at a time.',
              dotColor: 'bg-amber-500',
              textColor: 'text-amber-900',
              bgColor: 'bg-amber-50/80',
              borderColor: 'border-amber-200',
            });
          } else {
            setWellbeingStatus({
              label: 'Extra support recommended',
              subtext: 'Caring support is ready to listen whenever you want to talk.',
              dotColor: 'bg-rose-500',
              textColor: 'text-rose-900',
              bgColor: 'bg-rose-50/80',
              borderColor: 'border-rose-200',
            });
          }

          // Map backend history item to latestAssessment using actual database values
          const latestDoc = res.latest_report || res.history[0];
          const rawLatestScore = Number(latestDoc.distress_score ?? 28.5);

          const rawSev = (latestDoc.severity_level || '').toUpperCase();
          const rLevel: RiskLevel =
            rawSev === 'CRITICAL'
              ? (latestDoc.ambulance_108_dispatched || latestDoc.alert_triggered ? 'crisis' : 'critical')
              : rawSev === 'HIGH'
              ? 'high'
              : rawSev === 'MODERATE'
              ? 'moderate'
              : 'low';

          // Extract clinical assessment from DB
          const clin = latestDoc.clinical_assessment || {};
          const dbMadrs: number =
            latestDoc.total_madrs ??
            clin.total_score ??
            clin.madrs_total ??
            (Array.isArray(clin.answers) ? clin.answers.reduce((a: number, b: number) => a + b, 0) : null) ??
            Math.round((rawLatestScore / 100) * 60);

          const dbPhq9: number =
            clin.phq9_score ??
            Math.min(27, Math.round(dbMadrs * (27 / 60)));

          // Extract fused multimodal contributions from DB
          const fused = latestDoc.fused_features || {};
          const contribs = fused.modalities_contributions || {};

          let voiceScore = 0;
          if (contribs.voice_features !== undefined) {
            voiceScore = Math.min(10, Number(((contribs.voice_features / 15) * 10).toFixed(1)));
          } else if (latestDoc.voice_analysis?.voice_distress_score !== undefined) {
            voiceScore = Math.min(10, Number((latestDoc.voice_analysis.voice_distress_score / 10).toFixed(1)));
          } else {
            voiceScore = Number(((rawLatestScore / 100) * 10).toFixed(1));
          }

          let nlpScore = 0;
          let contextScore = 0;
          if (contribs.emotion_score !== undefined) {
            nlpScore = Number(contribs.emotion_score.toFixed(1));
          } else if (latestDoc.nlp_analysis?.nlp_distress_score !== undefined) {
            nlpScore = Number(((latestDoc.nlp_analysis.nlp_distress_score / 100) * 15).toFixed(1));
          } else {
            nlpScore = Number(((rawLatestScore / 100) * 15).toFixed(1));
          }

          if (contribs.threat_indicators !== undefined || contribs.context !== undefined) {
            contextScore = Number(((contribs.threat_indicators || contribs.context || 0)).toFixed(1));
          } else {
            contextScore = Number(((rawLatestScore / 100) * 15).toFixed(1));
          }

          // SHAP Explainability factors directly from database
          const dbShapList = latestDoc.shap_explanations?.features;
          const mappedShapFactors =
            Array.isArray(dbShapList) && dbShapList.length > 0
              ? dbShapList.map((f: any) => ({
                  name: f.feature || 'Affective Burden',
                  impact: typeof f.shap_value === 'number' ? f.shap_value : (f.points ? f.points / 100 : 0.2),
                  description: f.impact || `Relative influence: ${f.relative_pct || Math.round((f.shap_value || 0.1) * 100)}%`,
                }))
              : [
                  { name: 'Depressive Affect & Sadness', impact: 0.35, description: 'Clinical depression symptom burden' },
                  { name: 'Circadian Sleep Latency', impact: 0.25, description: 'Sleep disruption biomarker' },
                  { name: 'Acoustic Voice Stress & Jitter', impact: 0.15, description: 'Vocal acoustic biomarker' },
                ];

          // Temporal trend directly from database
          const trend = latestDoc.temporal_trend || {};
          const rawTrendDir = (trend.trend_direction || '').toLowerCase();
          const trendDir: 'improving' | 'stable' | 'escalating' =
            rawTrendDir.includes('escalat') || rawTrendDir.includes('worsen')
              ? 'escalating'
              : rawTrendDir.includes('improv')
              ? 'improving'
              : 'stable';

          const predScore = Number(
            trend.projected_7d_score ??
            (trendDir === 'improving' ? Math.max(5, rawLatestScore - 4.5) : Math.min(100, rawLatestScore + 5.5))
          );

          // Recommendations from database
          const recs = latestDoc.recommendations || {};
          const recDays =
            recs.checkin_interval_days ??
            (rawLatestScore > 75 ? 1 : rawLatestScore > 50 ? 3 : 7);

          setLatestAssessment({
            sessionId: latestDoc.session_id || 'SESSION-LIVE-DB',
            date: latestDoc.created_at || new Date().toISOString(),
            userId: latestDoc.victim_id || 'REGISTERED-VICTIM',
            finalDistressScore: rawLatestScore,
            riskLevel: rLevel,
            totalMadrs: dbMadrs,
            phq9Equivalent: dbPhq9,
            voiceStressScore: voiceScore,
            nlpSentimentScore: nlpScore,
            contextualBonus: contextScore,
            crisisFlag: Boolean(latestDoc.ambulance_108_dispatched || latestDoc.alert_triggered || rawLatestScore > 75),
            threatFlag: Boolean(latestDoc.nlp_analysis?.threat_detected || (contribs.threat_indicators ?? 0) > 10 || rawLatestScore > 65),
            dsm5Probable: Boolean(clin.dsm5_probable_depression ?? (dbMadrs >= 20)),
            shapFactors: mappedShapFactors,
            predictedScoreNextWeek: predScore,
            trendVelocity: trend.trend_velocity ?? (trendDir === 'escalating' ? 2.1 : -1.8),
            trendDirection: trendDir,
            recommendedCheckinDays: recDays,
            personalizedSuggestions: [
              {
                category: rawLatestScore > 75 ? 'immediate' : 'coping',
                title: recs.clinical_action ? 'Clinical Care Action' : '4-7-8 Pranayama Breathwork',
                description: recs.clinical_action || 'Slow, deep breath cycles to relax the vagal nerve and restore parasympathetic tone.',
                actionLabel: rawLatestScore > 75 ? 'Emergency Support' : 'Start Breathing',
                actionType: rawLatestScore > 75 ? 'helpline' : 'activity',
              },
            ],
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-7 animate-fadeIn">
      {/* 1. Header with Soft Pastel Frosted Styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-100/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50/90 px-2.5 py-0.5 rounded-full border border-indigo-200/70">
              ANVAYA • अन्वय
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">
              Confidential Wellbeing Sanctuary
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your healing journey matters.
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-0.5">
            Safe, confidential space with personalized exercises and clinical support.
          </p>
        </div>

        {/* 1-Click Helpline Quick Pill */}
        <a
          href="tel:14566"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold shadow-xs hover:shadow-sm hover:scale-[1.02] transition"
        >
          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
          <span>NHAA Helpline: 14566 (24x7 Free)</span>
        </a>
      </div>

      {/* 2. Frosted Glass Sub-Navigation Tabs (Overview, Exercises, Scale, Community) */}
      <div className="liquid-glass-panel p-1.5 rounded-2xl grid grid-cols-2 sm:flex sm:flex-nowrap gap-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
            activeSubTab === 'overview'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-700 hover:text-indigo-900 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Sanctuary Overview</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('exercises');
            setCurrentSelectedExercise(undefined);
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
            activeSubTab === 'exercises'
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/20'
              : 'text-slate-700 hover:text-teal-900 hover:bg-white/60'
          }`}
        >
          <Wind className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Exercises</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('scale')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
            activeSubTab === 'scale'
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/20'
              : 'text-slate-700 hover:text-purple-900 hover:bg-white/60'
          }`}
        >
          <Activity className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Distress Scale</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('community')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
            activeSubTab === 'community'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-700 hover:text-rose-900 hover:bg-white/60'
          }`}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Hope Wall</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: SANCTUARY OVERVIEW
          ======================================================== */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Daily Affirmation Strip with Soft Pastel Gradient */}
          <div className="p-4 sm:p-5 rounded-2xl pastel-amber flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌱</span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                  Daily Affirmation & Healing Anchor
                </span>
                <p className="text-xs sm:text-sm font-bold text-amber-950 leading-snug">
                  "Every gentle step you take towards your healing is an act of courage. You are stronger than what happened."
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-white/90 border border-amber-200 text-amber-900 shadow-2xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{scheduleData.completed_sessions} Check-ins Completed</span>
              </span>
            </div>
          </div>

          {/* Primary CTA: How are you feeling today? (Frosted Glass) */}
          <div className="anvaya-card p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-lg">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-indigo-800 bg-indigo-50/80 px-3 py-1 rounded-full border border-indigo-200/70">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Confidential MADRS Check-in</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  How are you feeling today?
                </h2>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Take a short, gentle check-in to reflect on your sleep, mood, energy, and peace of mind.
                </p>
              </div>

              <button
                type="button"
                onClick={onStartCheckin}
                className="w-full sm:w-auto px-7 py-3.5 btn-primary font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>Start Check-in</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Direct Feature Launchers (Frosted Glass Pastel Tiles) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => {
                setActiveSubTab('exercises');
                setCurrentSelectedExercise(undefined);
              }}
              className="p-4 rounded-2xl pastel-teal hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition">
                🧘
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-teal-950 truncate">Therapeutic Suite</h4>
                  <ChevronRight className="w-3.5 h-3.5 text-teal-700 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[11px] text-teal-800 font-medium">4-7-8 Breathing & Soundscapes</p>
              </div>
            </div>

            <div
              onClick={() => setActiveSubTab('scale')}
              className="p-4 rounded-2xl pastel-lavender hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-800 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition">
                📊
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-violet-950 truncate">Distress Scale</h4>
                  <ChevronRight className="w-3.5 h-3.5 text-violet-700 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[11px] text-violet-800 font-medium">Multimodal 0-100 Decomposition</p>
              </div>
            </div>
          </div>

          {/* Dynamic Assigned Health Observer / Counsellor Support Card */}
          {liveAssignedObserver ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-xs">
                  {liveAssignedObserver.name
                    ? liveAssignedObserver.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'OB'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{liveAssignedObserver.name}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full font-bold border border-emerald-800">
                      ● {liveAssignedObserver.role || 'Assigned Observer'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                    {liveAssignedObserver.hospital || 'District Nodal Mental Health Unit'} • Direct encrypted 1:1 care channel
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsDoctorDirectoryOpen(true)}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5 border border-indigo-400/30"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Doctors Directory</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message Observer</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md border border-amber-500/30">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-xs">
                  ⏳
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-300">Observer Allocation in Progress</span>
                    <span className="text-[10px] text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded-full font-bold border border-amber-600">
                      Pending Admin Allocation
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                    The District Mental Health Cell is allocating a dedicated health observer to your profile.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsDoctorDirectoryOpen(true)}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-amber-100" />
                  <span>Browse Observers</span>
                </button>
                <a
                  href="tel:14566"
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call 14566 Toll-Free</span>
                </a>
              </div>
            </div>
          )}

          {/* Wellbeing Status & Next Check-in (2-Column Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Wellbeing Status Card */}
            <div className="anvaya-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Your recent wellbeing
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Last check-in
                </span>
              </div>

              <div className={`p-4 rounded-2xl border ${wellbeingStatus.borderColor} ${wellbeingStatus.bgColor} flex items-start gap-3`}>
                <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${wellbeingStatus.dotColor}`}></span>
                <div>
                  <div className="text-base font-black text-slate-900">
                    {wellbeingStatus.label}
                  </div>
                  <p className="text-xs font-medium text-slate-700 mt-0.5">
                    {wellbeingStatus.subtext}
                  </p>
                </div>
              </div>
            </div>

            {/* Next Check-in Card */}
            <div className="anvaya-card p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Next check-in
                  </span>
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>

                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-900">
                    In {scheduleData.days_remaining} days
                  </div>
                  <p className="text-xs font-medium text-slate-600 mt-1">
                    Due: {scheduleData.next_due_date}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  {scheduleData.completed_sessions} check-ins completed
                </span>
                <button
                  type="button"
                  onClick={onOpenSchedule}
                  className="text-xs font-extrabold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer"
                >
                  View schedule →
                </button>
              </div>
            </div>
          </div>

          {/* Progress / Trend: Your wellbeing over time */}
          <div className="anvaya-card p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Your wellbeing over time
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Simple trajectory based on your completed check-ins.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-800 bg-indigo-50/80 px-3 py-1 rounded-full border border-indigo-200/60 self-start">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>Reflective Trend</span>
              </div>
            </div>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} stroke="#E2E8F0" />
                  <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} stroke="#E2E8F0" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="liquid-glass-panel p-2.5 rounded-xl border border-indigo-200 shadow-md text-xs font-bold text-slate-900">
                            <div>{data.date}</div>
                            <div className="text-indigo-700 text-[11px] font-medium mt-0.5">
                              Status: {data.status} (Wellbeing: {data.value}/100)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#FFFFFF' }}
                    activeDot={{ r: 6, fill: '#4338CA' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>



          {/* Immediate Support Channels (Frosted Glass Pastel Cards) */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-slate-900">
              Immediate Support Channels
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Chat with support */}
              <div
                onClick={onOpenChat}
                className="p-5 pastel-indigo rounded-2xl cursor-pointer hover:shadow-md transition flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/90 text-indigo-700 flex items-center justify-center font-bold text-lg shadow-2xs">
                    💬
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-indigo-950 group-hover:underline">
                      Talk to someone
                    </h4>
                    <p className="text-xs font-medium text-indigo-800">
                      Chat with ANVAYA Saathi
                    </p>
                  </div>
                </div>
                <p className="text-xs text-indigo-900 font-medium">
                  Confidential, gentle companion to share your thoughts in a safe space.
                </p>
                <div className="text-xs font-extrabold text-indigo-700 flex items-center gap-1">
                  <span>Start conversation</span>
                  <span>→</span>
                </div>
              </div>

              {/* Card 2: Helpline */}
              <div
                onClick={onOpenSupport}
                className="p-5 pastel-emerald rounded-2xl cursor-pointer hover:shadow-md transition flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/90 text-emerald-700 flex items-center justify-center font-bold text-lg shadow-2xs">
                    ☎
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-950 group-hover:underline">
                      Helpline
                    </h4>
                    <p className="text-xs font-medium text-emerald-800">
                      Get immediate support
                    </p>
                  </div>
                </div>
                <p className="text-xs text-emerald-900 font-medium">
                  Toll-free 24x7 support: Tele-MANAS (14416) and Atrocity Helpline (14566).
                </p>
                <div className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                  <span>View helplines</span>
                  <span>→</span>
                </div>
              </div>

              {/* Card 3: Emergency */}
              <div
                onClick={onOpenEmergency}
                className="p-5 pastel-rose rounded-2xl cursor-pointer hover:shadow-md transition flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg shadow-2xs">
                    🚑
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-rose-950">
                      Emergency
                    </h4>
                    <p className="text-xs font-medium text-rose-800">
                      Get emergency assistance
                    </p>
                  </div>
                </div>
                <p className="text-xs text-rose-900 font-medium">
                  Immediate crisis response and 108 medical / psychological safety net.
                </p>
                <div className="text-xs font-extrabold text-rose-700 flex items-center gap-1">
                  <span>Request emergency aid</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: THERAPEUTIC EXERCISES (EMBEDDED DIRECTLY)
          ======================================================== */}
      {activeSubTab === 'exercises' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between p-4 rounded-2xl pastel-teal">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧘</span>
              <div>
                <h3 className="text-sm font-extrabold text-teal-950">
                  Trauma-Informed Therapeutic Suite
                </h3>
                <p className="text-xs text-teal-800 font-medium">
                  Score-adapted calming exercises: 4-7-8 Pranayama, Somatic Grounding, Dissolving Journal & Soundscapes.
                </p>
              </div>
            </div>
          </div>

          {/* Embedded Full Component */}
          <PersonalizedActivities
            currentLang={currentLang}
            resultData={latestAssessment}
            onOpenCounsellorChat={onOpenChat}
            initialActivity={currentSelectedExercise}
          />
        </div>
      )}

      {/* ========================================================
          TAB 3: PROPER DISTRESS SCALE & CLINICAL DECOMPOSITION (EMBEDDED DIRECTLY)
          ======================================================== */}
      {activeSubTab === 'scale' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between p-4 rounded-2xl pastel-lavender">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="text-sm font-extrabold text-violet-950">
                  Multimodal Clinical Distress Scale (0–100)
                </h3>
                <p className="text-xs text-violet-800 font-medium">
                  Transparent score decomposition: MADRS (40%), PHQ-9 Mood Velocity (20%), Voice Biomarkers (10%), Legal Context (30%).
                </p>
              </div>
            </div>
          </div>

          {/* Embedded Distress Meter */}
          <DistressMeter result={latestAssessment} />

          {/* Clinical Severity Bands Reference Card */}
          <div className="anvaya-card p-6 space-y-4">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>MoSJE Clinical Severity Bands & Care Thresholds</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl pastel-emerald space-y-1">
                <div className="text-xs font-extrabold text-emerald-950">0 – 25 : Stable</div>
                <div className="text-[11px] text-emerald-800 font-medium leading-tight">
                  Normal affective baseline. Routine bi-weekly check-ins.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl pastel-teal space-y-1">
                <div className="text-xs font-extrabold text-teal-950">26 – 50 : Mild Strain</div>
                <div className="text-[11px] text-teal-800 font-medium leading-tight">
                  Gentle stress markers. Breathwork & soundscapes recommended.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl pastel-amber space-y-1">
                <div className="text-xs font-extrabold text-amber-950">51 – 75 : Moderate</div>
                <div className="text-[11px] text-amber-800 font-medium leading-tight">
                  High emotional load. Counselor callback & weekly monitoring.
                </div>
              </div>

              <div className="p-3.5 rounded-2xl pastel-rose space-y-1">
                <div className="text-xs font-extrabold text-rose-950">76 – 100 : Critical</div>
                <div className="text-[11px] text-rose-800 font-medium leading-tight">
                  Immediate safety alert. 108 protocol & priority psychiatric care.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: SURVIVOR HOPE WALL (EMBEDDED DIRECTLY)
          ======================================================== */}
      {activeSubTab === 'community' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between p-4 rounded-2xl pastel-rose">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <h3 className="text-sm font-extrabold text-rose-950">
                  Survivor Hope & Solidarity Wall
                </h3>
                <p className="text-xs text-rose-800 font-medium">
                  Safe, anonymous messages of hope, strength, and resilience from fellow survivors.
                </p>
              </div>
            </div>
          </div>

          <CommunityWall currentLang={currentLang} />
        </div>
      )}

      {/* 1:1 Doctor & Observer Directory Modal */}
      <DoctorDirectoryModal
        isOpen={isDoctorDirectoryOpen}
        onClose={() => setIsDoctorDirectoryOpen(false)}
        userProfile={getStoredUser()}
        recentAssessmentScore={latestAssessment?.finalDistressScore}
      />
    </div>
  );
};

export default VictimDashboard;

