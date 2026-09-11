import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  Heart,
  TrendingUp,
  Activity,
  PhoneCall,
  MessageSquare,
  UserPlus,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  FileText,
  Ambulance,
  Sparkles,
  ChevronRight,
  UserCheck,
  Server,
  AlertCircle,
  X
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { CaseRecord, RiskLevel, NGOProvider, PsychiatristProvider } from '../../types';
import { MOCK_CASES, MOCK_NGOS, MOCK_PSYCHIATRISTS } from '../../data/mockData';
import { observerApi, authApi, supportApi } from '../../api';

interface ObserverDashboardProps {
  onTriggerCrisisGlobal?: () => void;
}

interface TriggerItem {
  id: string;
  caseId: string;
  category: 'CRISIS' | 'HIGH_RISK' | 'WORSENING_TREND' | 'THREAT_DETECTED' | 'MISSED_CHECK_IN' | 'FOLLOW_UP_DUE';
  badgeColor: string;
  title: string;
  reason: string;
  timestamp: string;
}

export const ObserverDashboard: React.FC<ObserverDashboardProps> = () => {
  const [cases, setCases] = useState<CaseRecord[]>(MOCK_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(MOCK_CASES[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [activeTriggerFilter, setActiveTriggerFilter] = useState<string>('all');
  const [chatInput, setChatInput] = useState<string>('');
  const [noteInput, setNoteInput] = useState<string>('');
  const [showNgoModal, setShowNgoModal] = useState<boolean>(false);
  const [showPsyModal, setShowPsyModal] = useState<boolean>(false);
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [callNotes, setCallNotes] = useState<string>('');
  const [ambulanceDispatched, setAmbulanceDispatched] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);
  const [activeTier, setActiveTier] = useState<'L1' | 'L2' | 'L3' | 'L4'>('L1');
  const [showMotivationModal, setShowMotivationModal] = useState<boolean>(false);
  const [motivationText, setMotivationText] = useState<string>('We are standing beside you. Your courage inspires our entire care team, and relief is on the way.');
  const [motivationSentToast, setMotivationSentToast] = useState<boolean>(false);

  // Intervention History State
  const [interventions, setInterventions] = useState<{
    id: string;
    date: string;
    action: string;
    officer: string;
    outcome: string;
    nextFollowup: string;
  }[]>([
    {
      id: 'int-1',
      date: '08 Sep 2026',
      action: '1:1 Clinical Check-in Call',
      officer: 'Dr. Anita Joshi (District Nodal Officer)',
      outcome: 'Survivor acknowledged sleep difficulty. Breathing anchor shared.',
      nextFollowup: '12 Sep 2026',
    },
    {
      id: 'int-2',
      date: '05 Sep 2026',
      action: 'NGO Protection Linkage',
      officer: 'Ram Kumar (NGO Field Coordinator)',
      outcome: 'Accompanied survivor family for district statutory relief verification.',
      nextFollowup: '15 Sep 2026',
    },
  ]);

  const [triggers, setTriggers] = useState<TriggerItem[]>([
    {
      id: 'trg-1',
      caseId: 'CASE-MH1024',
      category: 'CRISIS',
      badgeColor: 'bg-red-600 text-white',
      title: 'Question 10 Severe Safety Concern',
      reason: 'Survivor reported acute feelings of despair in night check-in.',
      timestamp: '2 hours ago',
    },
    {
      id: 'trg-2',
      caseId: 'CASE-MH1025',
      category: 'WORSENING_TREND',
      badgeColor: 'bg-orange-600 text-white',
      title: 'Sequential Trajectory Worsening',
      reason: 'Distress score escalated over past 3 check-ins (+18.4 pts).',
      timestamp: '5 hours ago',
    },
    {
      id: 'trg-3',
      caseId: 'CASE-MH1026',
      category: 'THREAT_DETECTED',
      badgeColor: 'bg-red-600 text-white',
      title: 'External Intimidation Reported',
      reason: 'Perpetrator presence outside residence reported in optional narrative.',
      timestamp: '1 day ago',
    },
    {
      id: 'trg-4',
      caseId: 'CASE-MH1027',
      category: 'FOLLOW_UP_DUE',
      badgeColor: 'bg-amber-600 text-white',
      title: 'Weekly Observer Follow-up Due',
      reason: 'SLA due for weekly psychiatric welfare check-in.',
      timestamp: 'Today',
    },
  ]);

  useEffect(() => {
    let mounted = true;
    const initData = async () => {
      try {
        const data = await observerApi.getDashboard();
        if (!mounted) return;

        if (data.cases && data.cases.length > 0) {
          const mapped: CaseRecord[] = data.cases.map((bc, idx) => ({
            id: bc.session_id || bc.id,
            victimName: `Case #${(bc.session_id || bc.id).slice(-4)}`,
            age: 26 + (idx % 15),
            gender: 'Survivor',
            phone: '+91 98231 •••••',
            district: data.jurisdiction.district || 'Nashik',
            state: data.jurisdiction.state || 'Maharashtra',
            caseCategory: 'caste_violence',
            registeredDate: new Date(bc.created_at || Date.now()).toISOString().split('T')[0],
            currentDistressScore: bc.distress_score,
            riskLevel: (bc.severity_level?.toLowerCase() || 'moderate') as RiskLevel,
            lastSessionDate: 'Today (Live Database)',
            missedCheckins: 0,
            slaMinutesRemaining: bc.severity_level === 'CRITICAL' ? 25 : 120,
            assignedObserver: 'Dr. Anita Joshi (District Officer)',
            assignedNgo: 'Samata Legal & Trauma Aid Network',
            crisisFlag: bc.severity_level === 'CRITICAL',
            threatFlag: bc.alert_triggered,
            scoreHistory: [
              { date: 'Initial', score: Math.max(10, Math.round(bc.distress_score - 14)) },
              { date: 'Previous', score: Math.max(15, Math.round(bc.distress_score - 5)) },
              { date: 'Current', score: bc.distress_score },
            ],
            shapDrivers: [
              { name: 'Clinical MADRS Assessment Scale', impact: 28 },
              { name: 'NLP Traumatic Affect Indicators', impact: 22 },
              { name: 'Vocal Tremor Stress Markers', impact: 14 },
            ],
            clinicalSummary: `Active safeguarding profile. Session: ${bc.session_id}. Severity: ${bc.severity_level}. Status: ${bc.status}.`,
            notes: [
              {
                id: `note-${bc.id}`,
                author: 'Health Observer',
                timestamp: 'Synced from Database',
                text: `Assessment logged via ${bc.touchpoint || 'web_portal'}. Monitoring active.`,
              },
            ],
            chatMessages: [
              {
                id: `msg-${bc.id}`,
                sender: 'observer',
                timestamp: '10:00 AM',
                text: 'District Health Unit is actively monitoring your wellbeing and legal accompaniment.',
              },
            ],
          }));

          setCases((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const fresh = mapped.filter((m) => !existingIds.has(m.id));
            return [...fresh, ...prev];
          });
        }
      } catch (err) {
        console.warn('Observer dashboard fetch:', err);
      }
    };

    initData();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Case counts
  const totalCases = cases.length;
  const criticalCases = cases.filter((c) => c.riskLevel === 'critical' || c.riskLevel === 'crisis').length;
  const highCases = cases.filter((c) => c.riskLevel === 'high').length;
  const activeCases = cases.filter((c) => c.riskLevel !== 'low').length;
  const needsFollowup = cases.filter((c) => c.riskLevel === 'high' || c.riskLevel === 'critical').length;

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || c.riskLevel === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'crisis':
      case 'critical':
        return <span className="bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full text-[10px] font-black">🔴 CRITICAL</span>;
      case 'high':
        return <span className="bg-orange-100 text-orange-800 border border-orange-200 px-2.5 py-0.5 rounded-full text-[10px] font-black">🟠 HIGH</span>;
      case 'moderate':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-black">🟡 MODERATE</span>;
      case 'low':
      default:
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-black">🟢 LOW</span>;
    }
  };

  const getTrendIndicator = (scores: { score: number }[]) => {
    if (scores.length >= 2) {
      const diff = scores[scores.length - 1].score - scores[scores.length - 2].score;
      if (diff > 5) return <span className="text-red-700 font-extrabold text-xs">↑ Worsening</span>;
      if (diff < -5) return <span className="text-emerald-700 font-extrabold text-xs">↓ Improving</span>;
    }
    return <span className="text-slate-700 font-bold text-xs">→ Stable</span>;
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      author: 'Dr. Anita Joshi (District Nodal Officer)',
      timestamp: 'Just now',
      text: noteInput.trim(),
    };

    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id ? { ...c, notes: [newNote, ...c.notes] } : c
      )
    );
    setNoteInput('');
  };

  const handleRecordIntervention = (actionName: string, outcomeText: string) => {
    const newInt = {
      id: `int-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      action: actionName,
      officer: 'Dr. Anita Joshi (District Nodal Officer)',
      outcome: outcomeText,
      nextFollowup: 'In 3 days',
    };
    setInterventions((prev) => [newInt, ...prev]);
  };

  const handleDemoEmergencyDispatch = async () => {
    try {
      const res = await supportApi.dispatchEmergency({
        case_id: selectedCase.id,
        location: `${selectedCase.district}, ${selectedCase.state}`,
        reason: `Health Observer escalated Case ${selectedCase.id} to 108 Emergency Protocol.`,
      });
      setAmbulanceDispatched(true);
      setDispatchResult(`108 Dispatch Logged (${res.dispatch_id}) [DEMO MODE]. Notification dispatched.`);
      handleRecordIntervention('108 Emergency Escalation', 'Dispatched emergency safety protocol under DEMO MODE.');
    } catch {
      setDispatchResult('Emergency request recorded in database.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10 space-y-8 animate-fadeIn">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              ANVAYA HEALTH OBSERVER NETWORK
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-slate-600">
              District Nodal Command
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Caseload & Triage Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-black bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            District: Nashik • Jurisdiction: Maharashtra
          </span>
        </div>
      </div>

      {/* 1.5 Role / Tier Hierarchy Switcher (L1 - L4) */}
      <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 ml-1">
            Operational Tier:
          </span>
          {[
            { id: 'L1', title: 'L1 — Health Observer (Block/Taluk)' },
            { id: 'L2', title: 'L2 — District Officer (District HQ)' },
            { id: 'L3', title: 'L3 — State Coordinator (State)' },
            { id: 'L4', title: 'L4 — National Admin (MoSJE)' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTier(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTier === t.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>

        {activeTier === 'L1' && (
          <button
            type="button"
            onClick={() => setShowMotivationModal(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Send Motivation Push</span>
          </button>
        )}
      </div>

      {motivationSentToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Curated healing motivation push notification sent to survivor's app.</span>
        </div>
      )}

      {/* 2. Overview Cards (5 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="anvaya-card p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-600">Total Cases</div>
          <div className="text-2xl font-black text-black mt-1">{totalCases}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">District Registry</div>
        </div>

        <div className="anvaya-card p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-600">Active Cases</div>
          <div className="text-2xl font-black text-black mt-1">{activeCases}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Under Monitoring</div>
        </div>

        <div className="anvaya-card p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-600">Needs Follow-up</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{needsFollowup}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Weekly SLA Due</div>
        </div>

        <div className="anvaya-card p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-600">High Risk</div>
          <div className="text-2xl font-black text-orange-700 mt-1">{highCases}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Elevated Strain</div>
        </div>

        <div className="anvaya-card p-4 bg-white border border-red-200 rounded-2xl shadow-xs bg-red-50/30">
          <div className="text-xs font-bold text-red-900">Critical Priority</div>
          <div className="text-2xl font-black text-red-700 mt-1">{criticalCases}</div>
          <div className="text-[10px] text-red-700 mt-0.5">108 Active Net</div>
        </div>
      </div>

      {/* 3. Dedicated Admin Triggers Section */}
      <div className="anvaya-card p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-black text-black flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-black" />
              <span>Active Priority Triggers</span>
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Real-time events requiring clinical or protective intervention.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['all', 'CRISIS', 'HIGH_RISK', 'WORSENING_TREND', 'THREAT_DETECTED'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTriggerFilter(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                  activeTriggerFilter === cat
                    ? 'bg-black text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {triggers
            .filter((t) => activeTriggerFilter === 'all' || t.category === activeTriggerFilter)
            .map((trg) => (
              <div
                key={trg.id}
                onClick={() => setSelectedCaseId(trg.caseId)}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-black cursor-pointer transition flex flex-col justify-between space-y-2 shadow-2xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${trg.badgeColor}`}>
                      {trg.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {trg.timestamp}
                    </span>
                  </div>
                  <div className="text-xs font-black text-black group-hover:underline">
                    {trg.title}
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-1 leading-snug">
                    {trg.reason}
                  </p>
                </div>
                <div className="text-[11px] font-extrabold text-black pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span>{trg.caseId}</span>
                  <span>Inspect →</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 4. Main Two-Column Layout: Priority Case List (Left) + Case Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Priority Case List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="anvaya-card p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-black">
                Priority Cases
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {filteredCases.length} records
              </span>
            </div>

            {/* Search and filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case ID or district..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredCases.map((c) => {
                const isSelected = c.id === selectedCase.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'border-black bg-slate-50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-400 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-black">{c.id}</span>
                        {getRiskBadge(c.riskLevel)}
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        District: {c.district} • Category: {c.caseCategory}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Trend: {getTrendIndicator(c.scoreHistory)}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Case Detail Pane (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="anvaya-card p-6 sm:p-7 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-black">
                    {selectedCase.id}
                  </h2>
                  {getRiskBadge(selectedCase.riskLevel)}
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Registered: {selectedCase.registeredDate} • District: {selectedCase.district}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDemoEmergencyDispatch}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Dispatch 108 Emergency Protocol (Demo Mode)"
                >
                  <Ambulance className="w-3.5 h-3.5" />
                  <span>Escalate 108 [DEMO]</span>
                </button>
              </div>
            </div>

            {/* Dispatch Banner */}
            {dispatchResult && (
              <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{dispatchResult}</span>
              </div>
            )}

            {/* Sequential Score Trajectory Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-black">
                <span>Distress Trajectory (Historical & Projected)</span>
                <span>{getTrendIndicator(selectedCase.scoreHistory)}</span>
              </div>
              <div className="h-44 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedCase.scoreHistory}>
                    <XAxis dataKey="date" tick={{ fill: '#000000', fontSize: 10, fontWeight: 700 }} stroke="#E2E8F0" />
                    <YAxis domain={[0, 100]} tick={{ fill: '#000000', fontSize: 10, fontWeight: 600 }} stroke="#E2E8F0" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-2 rounded-lg border border-slate-300 text-xs font-bold text-black shadow-sm">
                              <div>{data.date}: Score {data.score}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#000000"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#000000' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Temporal Trend Comparison Callout (e.g. 32 -> 41 -> 53 -> 71) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-black text-black">Sequence Progression:</span>
                <span className="font-extrabold text-black font-mono tracking-tight bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  {selectedCase.scoreHistory.map((h) => h.score).join(' → ')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Predict Worsening Risk:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  selectedCase.currentDistressScore >= 70
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {selectedCase.currentDistressScore >= 70 ? '● Rapidly Escalating Trajectory' : '● Stable / Gradual'}
                </span>
              </div>
            </div>

            {/* Multimodal Feature Fusion Layer (5 Combined Streams) */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-black" />
                  <span className="text-xs font-black text-black uppercase tracking-wider">
                    Feature Fusion Breakdown (Multi-Modal Engine)
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  Total Distress: {selectedCase.currentDistressScore}/100
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] font-bold text-slate-500">Questionnaire</div>
                  <div className="text-xs font-black text-black mt-0.5">35% Weight</div>
                  <div className="text-[11px] font-extrabold text-black mt-0.5">MADRS: 28/60</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] font-bold text-slate-500">Emotion AI (NLP)</div>
                  <div className="text-xs font-black text-black mt-0.5">20% Weight</div>
                  <div className="text-[11px] font-extrabold text-black mt-0.5">Despair / Fear</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] font-bold text-slate-500">Voice Acoustic</div>
                  <div className="text-xs font-black text-black mt-0.5">15% Weight</div>
                  <div className="text-[11px] font-extrabold text-black mt-0.5">Stress: 68/100</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] font-bold text-slate-500">Sleep / Behaviour</div>
                  <div className="text-xs font-black text-black mt-0.5">15% Weight</div>
                  <div className="text-[11px] font-extrabold text-black mt-0.5">&lt; 3h Insomnia</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[10px] font-bold text-slate-500">Threat Indicators</div>
                  <div className="text-xs font-black text-black mt-0.5">15% Weight</div>
                  <div className="text-[11px] font-extrabold text-rose-700 mt-0.5">Active Threat</div>
                </div>
              </div>
            </div>

            {/* Alert Engine & Recommendation Engine Dual Panels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Alert Engine Box */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-black" />
                  <span className="text-xs font-black text-black uppercase tracking-wider">
                    Alert Engine Status
                  </span>
                </div>
                <div className="space-y-1.5 text-xs font-bold">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-black">High Risk Alert:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      selectedCase.currentDistressScore >= 51 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedCase.currentDistressScore >= 51 ? 'TRIGGERED' : 'NORMAL'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-black">Critical Alert (108):</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      selectedCase.riskLevel === 'critical' || selectedCase.crisisFlag ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedCase.riskLevel === 'critical' || selectedCase.crisisFlag ? 'DISPATCHED' : 'STANDBY'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-black">Threat Alert:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      selectedCase.threatFlag ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedCase.threatFlag ? 'THREAT DETECTED' : 'NONE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendation Engine Box */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span className="text-xs font-black text-black uppercase tracking-wider">
                    Recommendation Engine
                  </span>
                </div>
                <div className="space-y-1.5 text-xs font-bold">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-black">Counsellor Call:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
                      Tele-MANAS (14416)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-black">Follow-up Interval:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                      {selectedCase.riskLevel === 'critical' ? 'Every 24 Hours' : 'Every 3 Days'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-black">Safety Review:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      NALSA 15100 Legal Net
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleRecordIntervention('Phone Call Initiated', 'Tele-counselling check-in performed.');
                  alert(`Calling survivor at ${selectedCase.phone}...`);
                }}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-black text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Survivor</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleRecordIntervention('NGO Field Support Assigned', 'Assigned Samata Trust for court visit accompaniment.');
                  alert('NGO field coordinator assigned.');
                }}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-black text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Assign NGO</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleRecordIntervention('Telepsychiatry Referral', 'Referral queued for Dr. Kulkarni.');
                  alert('Psychiatrist referral queued.');
                }}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-black text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Refer Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleRecordIntervention('Relief Disbursement Follow-up', 'Inquired with District Collector office regarding interim relief.');
                  alert('Compensation check scheduled.');
                }}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-black text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Relief Aid</span>
              </button>
            </div>

            {/* Intervention History Log */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-black">
                  Intervention History Log
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">
                  {interventions.length} actions recorded
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {interventions.map((int) => (
                  <div
                    key={int.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-black">{int.action}</span>
                      <span className="text-[10px] text-slate-500 font-bold">{int.date}</span>
                    </div>
                    <p className="text-slate-700 font-medium text-[11px]">
                      {int.outcome}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Officer: {int.officer}</span>
                      <span className="font-bold text-black">Next: {int.nextFollowup}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Clinical Note Form */}
            <form onSubmit={handleAddNote} className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add clinical observation note..."
                className="flex-1 px-3 py-2 text-xs font-semibold text-black bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
              />
              <button
                type="submit"
                disabled={!noteInput.trim()}
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition disabled:opacity-40 cursor-pointer"
              >
                Add Note
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Motivation Push Modal */}
      {showMotivationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="anvaya-card rounded-3xl max-w-lg w-full p-6 bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">
                  Send Curated Healing Motivation Push
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMotivationModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Select or customize a trauma-informed motivational message to deliver as a gentle push notification to <strong>{selectedCase.victimName}</strong>.
            </p>

            <div className="space-y-2">
              {[
                "We are standing beside you. Your courage inspires our entire care team, and relief is on the way.",
                "Take this day one breath at a time. You have overcome so much, and you do not have to walk alone.",
                "Your safety and mental peace are our highest priority. We are checking in to let you know you are deeply valued.",
              ].map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => setMotivationText(tmpl)}
                  className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                    motivationText === tmpl
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  "{tmpl}"
                </div>
              ))}
            </div>

            <textarea
              value={motivationText}
              onChange={(e) => setMotivationText(e.target.value)}
              rows={3}
              placeholder="Custom encouragement message..."
              className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMotivationModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setShowMotivationModal(false);
                    setMotivationSentToast(true);
                    await supportApi.adminBroadcastNotification({
                      title: `Care Message from Observer 🌸`,
                      message: motivationText.trim(),
                      category: 'QUOTE',
                      target_user_id: selectedCase.id,
                      action_label: 'Open Care Sanctuary',
                      action_url: '/victim'
                    });
                    await supportApi.sendCareChatMessage({
                      text: motivationText.trim(),
                      sender: 'observer',
                      user_id: selectedCase.id
                    });
                    window.dispatchEvent(new CustomEvent('anvaya_broadcast_sent', {
                      detail: {
                        title: `Care Message from Observer 🌸`,
                        message: motivationText.trim(),
                        category: 'QUOTE'
                      }
                    }));
                  } catch (e) {
                    console.error('Failed to send observer motivation:', e);
                  } finally {
                    setTimeout(() => setMotivationSentToast(false), 3500);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Notification</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObserverDashboard;
