import React, { useState, useEffect, Suspense } from 'react';
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
import { AssessmentResultData, RiskLevel } from '../../types';
import { PageLoader, HopeWallSkeleton, DoctorDirectorySkeleton, CardGridSkeleton } from '../common/Skeleton';

const PersonalizedActivities = React.lazy(() =>
  import('./PersonalizedActivities').then((m) => ({ default: m.PersonalizedActivities }))
);
const CommunityWall = React.lazy(() =>
  import('./CommunityWall').then((m) => ({ default: m.CommunityWall }))
);
const DoctorDirectoryModal = React.lazy(() =>
  import('./DoctorDirectoryModal').then((m) => ({ default: m.DoctorDirectoryModal }))
);

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
  const resolveAssignedObserver = () => {
    try {
      const stored = getStoredUser();
      if (userProfile?.assignedObserver) return userProfile.assignedObserver;
      if (userProfile?.assigned_observer) return userProfile.assigned_observer;
      if (stored?.assignedObserver) return stored.assignedObserver;
      if (stored?.assigned_observer) return stored.assigned_observer;

      const idsToTry = [
        userProfile?.id,
        userProfile?.uid,
        userProfile?.email,
        userProfile?.email?.toLowerCase(),
        stored?.id,
        stored?.uid,
        stored?.email,
        stored?.email?.toLowerCase(),
      ].filter(Boolean);

      for (const id of idsToTry) {
        const fromKey = localStorage.getItem(`anvaya_assigned_observer_${id}`);
        if (fromKey) {
          try {
            const parsed = JSON.parse(fromKey);
            if (parsed && (parsed.name || parsed.id)) return parsed;
          } catch {}
        }
      }

      const citizenProfiles = JSON.parse(localStorage.getItem('anvaya_citizen_profiles') || '{}');
      for (const id of idsToTry) {
        if (citizenProfiles[id]?.assignedObserver) return citizenProfiles[id].assignedObserver;
        if (citizenProfiles[id]?.assigned_observer) return citizenProfiles[id].assigned_observer;
      }

      for (const key of Object.keys(citizenProfiles)) {
        const p = citizenProfiles[key];
        if (!p) continue;
        const match =
          (userProfile?.email && p.email?.toLowerCase() === userProfile.email.toLowerCase()) ||
          (stored?.email && p.email?.toLowerCase() === stored.email.toLowerCase()) ||
          (userProfile?.id && p.id === userProfile.id) ||
          (stored?.id && p.id === stored.id) ||
          (userProfile?.name && (p.name === userProfile.name || p.full_name === userProfile.name)) ||
          (stored?.name && (p.name === stored.name || p.full_name === stored.name));

        if (match && (p.assignedObserver || p.assigned_observer)) {
          return p.assignedObserver || p.assigned_observer;
        }
      }

      const lastAssigned =
        JSON.parse(localStorage.getItem('anvaya_last_assigned_observer') || 'null') ||
        JSON.parse(localStorage.getItem('anvaya_global_assigned_observer') || 'null');
      if (lastAssigned && (lastAssigned.name || lastAssigned.id)) return lastAssigned;

      return null;
    } catch {
      return null;
    }
  };

  const [liveAssignedObserver, setLiveAssignedObserver] = useState<any>(resolveAssignedObserver);

  // Re-sync observer allocation from server, props, and local storage
  useEffect(() => {
    const candidate = resolveAssignedObserver();
    if (candidate) {
      setLiveAssignedObserver(candidate);
    }

    authApi.getMe()
      .then((me: any) => {
        if (me && (me.assigned_observer || me.assignedObserver)) {
          const obs = me.assigned_observer || me.assignedObserver;
          setLiveAssignedObserver(obs);
          const localUser = getStoredUser();
          if (localUser) {
            authApi.saveLocalSession({ ...localUser, assigned_observer: obs, assignedObserver: obs });
          }
        }
      })
      .catch(() => {});
  }, [userProfile]);

  useEffect(() => {
    const handleObserverUpdate = (e: any) => {
      if (e.detail?.observer !== undefined) {
        setLiveAssignedObserver(e.detail.observer);
      } else {
        const candidate = resolveAssignedObserver();
        if (candidate) setLiveAssignedObserver(candidate);
      }
    };

    const handleStorageUpdate = () => {
      const candidate = resolveAssignedObserver();
      if (candidate) {
        setLiveAssignedObserver(candidate);
      }
    };

    window.addEventListener('anvaya_observer_assigned', handleObserverUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('anvaya_observer_assigned', handleObserverUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [userProfile]);

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
    days_remaining: 7,
    completed_sessions: 0,
    next_due_date: 'Upcoming',
  });

  const [historyData, setHistoryData] = useState<any[]>([]);

  const [wellbeingStatus, setWellbeingStatus] = useState<{
    label: string;
    subtext: string;
    dotColor: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
  }>({
    label: 'Ready for Check-in',
    subtext: 'Take your baseline check-in to begin tracking your personal wellbeing trajectory.',
    dotColor: 'bg-indigo-500',
    textColor: 'text-indigo-900',
    bgColor: 'bg-indigo-50/80',
    borderColor: 'border-indigo-200',
  });

  const [latestAssessment, setLatestAssessment] = useState<AssessmentResultData>({
    sessionId: 'SESS-INIT-001',
    date: new Date().toISOString(),
    userId: 'VICTIM-USER',
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
        if (res) {
          setScheduleData((prev) => ({
            days_remaining: res.days_remaining ?? prev.days_remaining,
            completed_sessions: res.completed_sessions ?? prev.completed_sessions,
            next_due_date: res.next_due_date || prev.next_due_date,
          }));
        }
      })
      .catch(() => {});

    // Fetch assessment history from backend
    assessmentApi
      .getVictimHistory()
      .then((res) => {
        if (res && res.history && res.history.length > 0) {
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
          setScheduleData((prev) => ({
            ...prev,
            completed_sessions: res.history.length,
          }));

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

  // Determine friendly user first name for personalized greetings
  const rawName = (userProfile?.name || userProfile?.full_name || getStoredUser()?.full_name || getStoredUser()?.name || '').trim();
  const isGenericName = !rawName || rawName.toLowerCase() === 'citizen survivor' || rawName.toLowerCase() === 'courageous survivor' || rawName.toLowerCase() === 'victim-demo';
  const displayName = isGenericName ? (getStoredUser()?.full_name || 'Friend') : rawName;
  const firstName = displayName.split(' ')[0];

  // Dynamic time-of-day greeting
  const getGreetingInfo = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        salutation: 'Good Morning',
        icon: '🌅',
        hindiSalutation: 'शुभ प्रभात',
        message: 'Wishing you peace, safety, and a gentle start to your day.',
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        salutation: 'Good Afternoon',
        icon: '☀️',
        hindiSalutation: 'शुभ दोपहर',
        message: 'Take a gentle pause to breathe, hydrate, and nurture yourself.',
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        salutation: 'Good Evening',
        icon: '🌆',
        hindiSalutation: 'शुभ संध्या',
        message: 'We hope your day was manageable. Take time to relax and unwind.',
      };
    } else {
      return {
        salutation: 'Restful Night',
        icon: '🌙',
        hindiSalutation: 'शुभ रात्रि',
        message: 'You are in a safe, confidential space. Rest peacefully tonight.',
      };
    }
  };

  const greeting = getGreetingInfo();

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6 animate-fadeIn">
      {/* 1. Header with Personalized Time-Aware Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100/60">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50/90 px-2.5 py-0.5 rounded-full border border-indigo-200/70">
              ANVAYA • {greeting.hindiSalutation}
            </span>
            {userProfile?.district && (
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                📍 {userProfile.district}, {userProfile.state || 'IN'}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{greeting.icon}</span>
            <span>{greeting.salutation}, {firstName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
            Your private space for emotional recovery, daily check-ins, and accredited care.
          </p>
        </div>

        {/* 1-Click Helpline Quick Pill */}
        <a
          href="tel:14566"
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 text-xs font-bold shadow-2xs hover:shadow-xs hover:scale-[1.01] transition flex-shrink-0 self-start sm:self-auto"
        >
          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
          <span>MoSJE Helpline: 14566 (24x7 Free)</span>
        </a>
      </div>

      {/* 2. Sub-Navigation Tabs (Overview, Exercises, Scale, Community) */}
      <div className="liquid-glass-panel p-1.5 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[40px] ${
            activeSubTab === 'overview'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
              : 'text-slate-700 hover:text-indigo-900 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('exercises');
            setCurrentSelectedExercise(undefined);
          }}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[40px] ${
            activeSubTab === 'exercises'
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-teal-900 hover:bg-white/60'
          }`}
        >
          <Wind className="w-4 h-4 flex-shrink-0" />
          <span>Exercises</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('scale')}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[40px] ${
            activeSubTab === 'scale'
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-purple-900 hover:bg-white/60'
          }`}
        >
          <Activity className="w-4 h-4 flex-shrink-0" />
          <span>Distress Scale</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('community')}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[40px] ${
            activeSubTab === 'community'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-rose-900 hover:bg-white/60'
          }`}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          <span>Hope Wall</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: SANCTUARY OVERVIEW
          ======================================================== */}
      {activeSubTab === 'overview' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Daily Affirmation Strip */}
          <div className="p-3.5 sm:p-4 rounded-2xl pastel-amber flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🌱</span>
              <p className="text-xs sm:text-sm font-bold text-amber-950 leading-snug">
                "Every gentle step you take is an act of courage, {firstName}."
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-white/95 border border-amber-200 text-amber-900 shadow-2xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>
                  {scheduleData.completed_sessions === 0
                    ? 'Baseline Ready'
                    : `${scheduleData.completed_sessions} Completed`}
                </span>
              </span>
            </div>
          </div>

          {/* Primary CTA: How are you feeling today? */}
          <div className="anvaya-card p-5 sm:p-7 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-lg">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-800 bg-indigo-50/90 px-2.5 py-0.5 rounded-full border border-indigo-200/70">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>Confidential Check-in</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    ⏱️ 2 Mins • Private
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  How are you feeling today, {firstName}?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Take a quick check-in to reflect on your sleep, mood, and emotional wellbeing.
                </p>
              </div>

              <button
                type="button"
                onClick={onStartCheckin}
                className="w-full sm:w-auto px-6 py-3 btn-primary font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/25 hover:scale-[1.02] active:scale-95 transition"
              >
                <span>Start Check-in</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Direct Feature Launchers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => {
                setActiveSubTab('exercises');
                setCurrentSelectedExercise(undefined);
              }}
              className="p-3.5 rounded-2xl pastel-teal hover:shadow-xs transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition">
                🧘
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-teal-950 truncate">Calming Exercises</h4>
                  <ChevronRight className="w-3.5 h-3.5 text-teal-700 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[11px] text-teal-800 font-medium">4-7-8 Breathing & Soundscapes</p>
              </div>
            </div>

            <div
              onClick={() => setActiveSubTab('scale')}
              className="p-3.5 rounded-2xl pastel-lavender hover:shadow-xs transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition">
                📊
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-violet-950 truncate">Distress Scale</h4>
                  <ChevronRight className="w-3.5 h-3.5 text-violet-700 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[11px] text-violet-800 font-medium">Multimodal Wellbeing Score (0–100)</p>
              </div>
            </div>
          </div>

          {/* Assigned Health Observer Support Card */}
          {liveAssignedObserver ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-white">{liveAssignedObserver.name}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.2 rounded-full font-bold border border-emerald-800">
                      ● {liveAssignedObserver.role || 'Assigned Care Officer'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                    {liveAssignedObserver.hospital || 'District Mental Health Unit'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsDoctorDirectoryOpen(true)}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-indigo-400/30"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Doctors</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-md border border-amber-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-base flex-shrink-0">
                  ⏳
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-amber-300">Observer Allocation in Progress</span>
                    <span className="text-[10px] text-amber-300 bg-amber-900/60 px-2 py-0.2 rounded-full font-bold border border-amber-600">
                      Pending Allocation
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                    District care cell is assigning your dedicated observer.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsDoctorDirectoryOpen(true)}
                  className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-amber-100" />
                  <span>Browse Doctors</span>
                </button>
                <a
                  href="tel:14566"
                  className="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call 14566</span>
                </a>
              </div>
            </div>
          )}

          {/* Wellbeing Status & Next Check-in */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="anvaya-card p-5 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Recent Status
              </span>

              <div className={`p-3.5 rounded-xl border ${wellbeingStatus.borderColor} ${wellbeingStatus.bgColor} flex items-start gap-2.5`}>
                <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${wellbeingStatus.dotColor}`}></span>
                <div>
                  <div className="text-sm font-black text-slate-900">
                    {wellbeingStatus.label}
                  </div>
                  <p className="text-xs font-medium text-slate-700 mt-0.5">
                    {wellbeingStatus.subtext}
                  </p>
                </div>
              </div>
            </div>

            <div className="anvaya-card p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Next Check-in
                  </span>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>

                <div className="mt-2">
                  <div className="text-xl font-black text-slate-900">
                    In {scheduleData.days_remaining} days
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Due: {scheduleData.next_due_date}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">
                  {scheduleData.completed_sessions} completed
                </span>
                <button
                  type="button"
                  onClick={onOpenSchedule}
                  className="font-extrabold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer"
                >
                  View schedule →
                </button>
              </div>
            </div>
          </div>

          {/* Progress / Trend */}
          <div className="anvaya-card p-5 sm:p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Wellbeing Trajectory
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Trend across completed check-ins.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-800 bg-indigo-50/80 px-2.5 py-0.5 rounded-full border border-indigo-200/60 self-start">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>Score Trend</span>
              </div>
            </div>

            {historyData.length > 0 ? (
              <div className="h-44 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} stroke="#E2E8F0" />
                    <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} stroke="#E2E8F0" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="liquid-glass-panel p-2 rounded-xl border border-indigo-200 shadow-md text-xs font-bold text-slate-900">
                              <div>{data.date}</div>
                              <div className="text-indigo-700 text-[11px] font-medium mt-0.5">
                                Status: {data.status} ({data.value}/100)
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
            ) : (
              <div className="py-6 px-4 text-center rounded-xl bg-indigo-50/40 border border-dashed border-indigo-200/80 space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto text-base">
                  🌱
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Baseline Ready
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Complete your check-ins to track your recovery trend here.
                </p>
              </div>
            )}
          </div>

          {/* Immediate Support Channels */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-black text-slate-900">
              Immediate Support Channels
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: Chat with support */}
              <div
                onClick={onOpenChat}
                className="p-4 pastel-indigo rounded-2xl cursor-pointer hover:shadow-xs transition flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/90 text-indigo-700 flex items-center justify-center font-bold text-base shadow-2xs">
                    💬
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-indigo-950 group-hover:underline">
                      AI Companion
                    </h4>
                    <p className="text-[11px] font-medium text-indigo-800">
                      ANVAYA Saathi
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-indigo-900 font-medium">
                  Confidential companion to chat and share thoughts safely.
                </p>
                <div className="text-xs font-extrabold text-indigo-700 flex items-center gap-1 pt-1">
                  <span>Start conversation →</span>
                </div>
              </div>

              {/* Card 2: Helpline */}
              <div
                onClick={onOpenSupport}
                className="p-4 pastel-emerald rounded-2xl cursor-pointer hover:shadow-xs transition flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/90 text-emerald-700 flex items-center justify-center font-bold text-base shadow-2xs">
                    ☎
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-950 group-hover:underline">
                      Helplines
                    </h4>
                    <p className="text-[11px] font-medium text-emerald-800">
                      24x7 Toll-Free
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-900 font-medium">
                  Tele-MANAS (14416) and Atrocity Helpline (14566).
                </p>
                <div className="text-xs font-extrabold text-emerald-700 flex items-center gap-1 pt-1">
                  <span>View helplines →</span>
                </div>
              </div>

              {/* Card 3: Emergency */}
              <div
                onClick={onOpenEmergency}
                className="p-4 pastel-rose rounded-2xl cursor-pointer hover:shadow-xs transition flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-base shadow-2xs">
                    🚑
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-rose-950">
                      Emergency
                    </h4>
                    <p className="text-[11px] font-medium text-rose-800">
                      Immediate Aid
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-rose-900 font-medium">
                  Immediate crisis response and 108 emergency dispatch.
                </p>
                <div className="text-xs font-extrabold text-rose-700 flex items-center gap-1 pt-1">
                  <span>Get emergency aid →</span>
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
          <div className="flex items-center justify-between p-3.5 rounded-2xl pastel-teal">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🧘</span>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-teal-950">
                  Calming Exercises & Recovery
                </h3>
                <p className="text-[11px] text-teal-800 font-medium">
                  4-7-8 Pranayama, Somatic Grounding, Dissolving Journal & Soundscapes.
                </p>
              </div>
            </div>
          </div>

          {/* Embedded Full Component */}
          <Suspense fallback={<CardGridSkeleton count={4} columns={2} />}>
            <PersonalizedActivities
              currentLang={currentLang}
              resultData={latestAssessment}
              onOpenCounsellorChat={onOpenChat}
              initialActivity={currentSelectedExercise}
            />
          </Suspense>
        </div>
      )}

      {/* ========================================================
          TAB 3: PROPER DISTRESS SCALE & CLINICAL DECOMPOSITION (EMBEDDED DIRECTLY)
          ======================================================== */}
      {activeSubTab === 'scale' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between p-3.5 rounded-2xl pastel-lavender">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📊</span>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-violet-950">
                  Clinical Distress Decomposition (0–100)
                </h3>
                <p className="text-[11px] text-violet-800 font-medium">
                  MADRS (40%), PHQ-9 (20%), Voice Biomarkers (10%), Legal Context (30%).
                </p>
              </div>
            </div>
          </div>

          {/* Embedded Distress Meter */}
          <DistressMeter result={latestAssessment} />

          {/* Clinical Severity Bands Reference Card */}
          <div className="anvaya-card p-5 space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Clinical Severity Bands</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl pastel-emerald space-y-0.5">
                <div className="text-xs font-extrabold text-emerald-950">0 – 25 : Stable</div>
                <div className="text-[11px] text-emerald-800 font-medium leading-tight">
                  Normal baseline. Routine check-ins.
                </div>
              </div>

              <div className="p-3 rounded-xl pastel-teal space-y-0.5">
                <div className="text-xs font-extrabold text-teal-950">26 – 50 : Mild Strain</div>
                <div className="text-[11px] text-teal-800 font-medium leading-tight">
                  Gentle stress markers. Calming exercises recommended.
                </div>
              </div>

              <div className="p-3 rounded-xl pastel-amber space-y-0.5">
                <div className="text-xs font-extrabold text-amber-950">51 – 75 : Moderate</div>
                <div className="text-[11px] text-amber-800 font-medium leading-tight">
                  Elevated load. Observer care & regular check-ins.
                </div>
              </div>

              <div className="p-3 rounded-xl pastel-rose space-y-0.5">
                <div className="text-xs font-extrabold text-rose-950">76 – 100 : Critical</div>
                <div className="text-[11px] text-rose-800 font-medium leading-tight">
                  Immediate safety alert & 108 protocol.
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
          <div className="flex items-center justify-between p-3.5 rounded-2xl pastel-rose">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">💬</span>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-rose-950">
                  Survivor Hope & Solidarity Wall
                </h3>
                <p className="text-[11px] text-rose-800 font-medium">
                  Anonymous messages of strength and resilience from fellow survivors.
                </p>
              </div>
            </div>
          </div>

          <Suspense fallback={<HopeWallSkeleton />}>
            <CommunityWall currentLang={currentLang} currentUser={userProfile || getStoredUser()} />
          </Suspense>
        </div>
      )}

      {/* 1:1 Doctor & Observer Directory Modal */}
      {isDoctorDirectoryOpen && (
        <Suspense fallback={<PageLoader message="Loading Doctors..." compact />}>
          <DoctorDirectoryModal
            isOpen={isDoctorDirectoryOpen}
            onClose={() => setIsDoctorDirectoryOpen(false)}
            userProfile={getStoredUser()}
            recentAssessmentScore={latestAssessment?.finalDistressScore}
          />
        </Suspense>
      )}
    </div>
  );
};

export default VictimDashboard;

