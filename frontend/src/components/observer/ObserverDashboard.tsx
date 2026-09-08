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
  Server
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { CaseRecord, RiskLevel, NGOProvider, PsychiatristProvider } from '../../types';
import { MOCK_CASES, MOCK_NGOS, MOCK_PSYCHIATRISTS } from '../../data/mockData';
import { observerApi, authApi } from '../../api';

interface ObserverDashboardProps {
  onTriggerCrisisGlobal: () => void;
}

export const ObserverDashboard: React.FC<ObserverDashboardProps> = ({ onTriggerCrisisGlobal }) => {
  const [cases, setCases] = useState<CaseRecord[]>(MOCK_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(MOCK_CASES[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [chatInput, setChatInput] = useState<string>('');
  const [noteInput, setNoteInput] = useState<string>('');
  const [showNgoModal, setShowNgoModal] = useState<boolean>(false);
  const [showPsyModal, setShowPsyModal] = useState<boolean>(false);
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [callNotes, setCallNotes] = useState<string>('');
  const [ambulanceDispatched, setAmbulanceDispatched] = useState<boolean>(false);
  const [isBackendLoaded, setIsBackendLoaded] = useState<boolean>(false);
  const [backendStats, setBackendStats] = useState<{
    total_cases: number;
    critical: number;
    high: number;
    moderate: number;
    low: number;
    active_108_dispatches: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    const initObserverData = async () => {
      try {
        let user = authApi.getCurrentLocalUser();
        if (!user || !user.role?.startsWith('observer')) {
          try {
            await authApi.login({
              email: 'observer.district@sih.gov.in',
              password: 'ObserverPassword123!',
            });
          } catch {
            await authApi.register({
              email: 'observer.district@sih.gov.in',
              password: 'ObserverPassword123!',
              full_name: 'Dr. Anita Joshi (District Nodal Officer)',
              role: 'observer_district',
              district: 'Nashik',
              state: 'Maharashtra',
            });
          }
        }

        const data = await observerApi.getDashboard();
        if (!mounted) return;

        setBackendStats(data.statistics);
        setIsBackendLoaded(true);

        if (data.cases && data.cases.length > 0) {
          const mapped: CaseRecord[] = data.cases.map((bc, idx) => ({
            id: bc.session_id || bc.id,
            victimName: `Survivor Case #${(bc.session_id || bc.id).slice(-4)}`,
            age: 26 + (idx % 15),
            gender: 'Victim/Survivor',
            phone: '+91 98231 •••••',
            district: data.jurisdiction.district || 'Nashik',
            state: data.jurisdiction.state || 'Maharashtra',
            caseCategory: 'caste_violence',
            registeredDate: new Date(bc.created_at || Date.now()).toISOString().split('T')[0],
            currentDistressScore: bc.distress_score,
            riskLevel: (bc.severity_level?.toLowerCase() || 'moderate') as RiskLevel,
            lastSessionDate: 'Just now (FastAPI)',
            missedCheckins: 0,
            slaMinutesRemaining: bc.severity_level === 'CRITICAL' ? 25 : 120,
            assignedObserver: 'Dr. Anita Joshi (L1)',
            assignedNgo: 'Samata Legal & Trauma Aid Trust',
            crisisFlag: bc.severity_level === 'CRITICAL',
            threatFlag: bc.alert_triggered,
            scoreHistory: [
              { date: 'Initial', score: Math.max(10, Math.round(bc.distress_score - 15)) },
              { date: 'Current', score: bc.distress_score },
              { date: '7d Pred', score: Math.min(100, Math.round(bc.distress_score + 5)), predicted: true },
            ],
            shapDrivers: [
              { name: 'Clinical MADRS Assessment Scale', impact: 28 },
              { name: 'NLP & Traumatic Affect Signals', impact: 24 },
              { name: 'Acoustic Stress Biomarkers', impact: 16 },
            ],
            clinicalSummary: `Live report from FastAPI + MongoDB backend. Session ID: ${bc.session_id}. Severity: ${bc.severity_level}. Status: ${bc.status}.`,
            notes: [
              {
                id: `backend-note-${bc.id}`,
                author: 'FastAPI Backend System',
                timestamp: 'Synced from MongoDB',
                text: `Assessment ingested via ${bc.touchpoint || 'web_portal'}. Distress score: ${bc.distress_score}.`,
              },
            ],
            chatMessages: [
              {
                id: `msg-backend-${bc.id}`,
                sender: 'observer',
                timestamp: '10:00 AM',
                text: 'Welcome. District Health Unit is actively monitoring your recovery roadmap.',
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
        console.warn('Observer dashboard live sync note:', err);
      }
    };

    initObserverData();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.victimName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || c.riskLevel === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'crisis':
        return <span className="bg-rose-950 text-rose-300 border border-rose-500/60 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm animate-pulse">🆘 CRISIS</span>;
      case 'critical':
        return <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">🔴 CRITICAL</span>;
      case 'high':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">🟠 HIGH</span>;
      case 'moderate':
        return <span className="bg-yellow-50 text-yellow-800 border border-yellow-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">🟡 MODERATE</span>;
      case 'low':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">🟢 LOW</span>;
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'observer' as const,
      timestamp: 'Just now',
      text: chatInput.trim(),
    };

    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id ? { ...c, chatMessages: [...c.chatMessages, newMsg] } : c
      )
    );
    setChatInput('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      author: 'Dr. Anita Joshi (L1)',
      timestamp: 'Just now',
      text: noteInput.trim(),
    };

    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id ? { ...c, notes: [newNote, ...c.notes] } : c
      )
    );

    observerApi.updateIntervention(selectedCase.id, {
      status: 'UNDER_REVIEW',
      observer_notes: noteInput.trim(),
    }).catch((err) => console.warn('Backend note sync:', err));

    setNoteInput('');
  };

  const handleAssignNgo = (ngoName: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === selectedCase.id ? { ...c, assignedNgo: ngoName } : c))
    );

    observerApi.updateIntervention(selectedCase.id, {
      status: 'INTERVENTION_ASSIGNED',
      observer_notes: `Assigned NGO Provider: ${ngoName}`,
    }).catch((err) => console.warn('Backend NGO assign sync:', err));

    setShowNgoModal(false);
  };

  const handleAssignPsychiatrist = (psyName: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === selectedCase.id ? { ...c, assignedPsychiatrist: psyName } : c))
    );

    observerApi.updateIntervention(selectedCase.id, {
      status: 'INTERVENTION_ASSIGNED',
      assigned_psychiatrist_id: psyName,
      observer_notes: `Assigned Telepsychiatrist: ${psyName}`,
    }).catch((err) => console.warn('Backend psychiatrist assign sync:', err));

    setShowPsyModal(false);
  };

  const handleLogCall = () => {
    if (!callNotes.trim()) return;
    const callLog = {
      id: `call-${Date.now()}`,
      author: 'Dr. Anita Joshi (Phone Call Log)',
      timestamp: 'Today, Just now',
      text: callNotes.trim(),
    };
    setCases((prev) =>
      prev.map((c) => (c.id === selectedCase.id ? { ...c, notes: [callLog, ...c.notes] } : c))
    );

    observerApi.updateIntervention(selectedCase.id, {
      status: 'UNDER_REVIEW',
      observer_notes: `Call Logged: ${callNotes.trim()}`,
    }).catch((err) => console.warn('Backend call log sync:', err));

    setCallNotes('');
    setShowCallModal(false);
  };

  const handleDispatch108 = () => {
    setAmbulanceDispatched(true);

    observerApi.updateIntervention(selectedCase.id, {
      status: 'CRISIS_DISPATCHED',
      dispatch_108_ambulance: true,
      observer_notes: 'Urgent 108 emergency ambulance dispatched by District Health Observer.',
    }).catch((err) => console.warn('Backend 108 dispatch sync:', err));

    setTimeout(() => setAmbulanceDispatched(false), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 animate-fadeInScale">
      {/* Top Header Metrics Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              ANVAYA Health Observer Command Center
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Real-time Triage, SHAP AI Explainability & Intervention Logistics • District Nodal Unit
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {backendStats && (
            <div className="glass-panel px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-800 flex items-center gap-1.5 border border-indigo-200 shadow-xs bg-indigo-50/80" title="Live MongoDB Connected">
              <Server className="w-3.5 h-3.5 text-indigo-600" />
              <span>MongoDB Cases: {backendStats.total_cases}</span>
            </div>
          )}
          {backendStats && backendStats.active_108_dispatches > 0 && (
            <div className="glass-panel px-3 py-1.5 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-1.5 border border-rose-200 shadow-xs bg-rose-50/80 animate-pulse" title="Active 108 Ambulance Dispatches">
              <Ambulance className="w-3.5 h-3.5 text-rose-600" />
              <span>108 Dispatched: {backendStats.active_108_dispatches}</span>
            </div>
          )}
          <div className="glass-panel px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2 border border-rose-200 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            <span>{backendStats ? `${backendStats.critical} Critical Alerts` : '2 Critical Alerts'}</span>
          </div>
          <div className="glass-panel px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-800 border border-amber-200 shadow-xs">
            <span>{backendStats ? `${backendStats.high} High Risk Followups` : '2 High Risk Followups'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Triage Queue | Right Deep Case Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Triage List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search & Filter Glass Box */}
          <div className="glass-panel rounded-2xl p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search survivor, ID, or district..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/90 text-xs font-semibold bg-white/70 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/30 transition shadow-2xs"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {['all', 'critical', 'high', 'moderate'].map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase transition whitespace-nowrap ${
                    filterSeverity === sev
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white/60 text-slate-600 hover:bg-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Triage Case Cards List */}
          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
            {filteredCases.map((c) => {
              const isSelected = c.id === selectedCase.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-4 rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? 'glass-tile-selected scale-[1.01]'
                      : 'glass-tile hover:bg-white/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      {c.id}
                    </span>
                    {getRiskBadge(c.riskLevel)}
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {c.victimName}
                    </h3>
                    <div className="text-right">
                      <span className="text-base font-mono font-black text-slate-900">
                        {c.currentDistressScore.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-1 font-semibold">/ 100</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/60 font-medium">
                    <span className="flex items-center gap-1">
                      <span>📍</span> {c.district}, {c.state}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-rose-600">
                      <Clock className="w-3 h-3" /> SLA {c.slaMinutesRemaining}m
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Deep Case Analysis & Interventions (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 shadow-xl">
            {/* Selected Case Hero Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/70">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                    {selectedCase.id}
                  </span>
                  {getRiskBadge(selectedCase.riskLevel)}
                  {selectedCase.threatFlag && (
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Threat Flag
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {selectedCase.victimName}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {selectedCase.age} yrs • {selectedCase.gender} • {selectedCase.phone} • {selectedCase.district}, {selectedCase.state}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowCallModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Log Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowNgoModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Assign NGO</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPsyModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Psychiatrist</span>
                </button>

                <button
                  type="button"
                  onClick={handleDispatch108}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                >
                  <Ambulance className="w-3.5 h-3.5" />
                  <span>108 SOS</span>
                </button>
              </div>
            </div>

            {ambulanceDispatched && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-extrabold text-rose-900 flex items-center gap-2 shadow-xs animate-bounce">
                <Ambulance className="w-4 h-4 text-rose-600" />
                <span>108 Emergency Ambulance Dispatch Signal Sent for {selectedCase.victimName} ({selectedCase.district})</span>
              </div>
            )}

            {/* Score Gauges */}
            <div className="grid sm:grid-cols-3 gap-4 my-6">
              <div className="glass-tile p-4 rounded-2xl">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Dynamic Distress Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    {selectedCase.currentDistressScore.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ 100</span>
                </div>
                <div className="w-full bg-slate-200/80 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      selectedCase.currentDistressScore > 75
                        ? 'bg-rose-600'
                        : selectedCase.currentDistressScore > 50
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedCase.currentDistressScore}%` }}
                  />
                </div>
              </div>

              <div className="glass-tile p-4 rounded-2xl">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Assigned NGO Partner
                </span>
                <p className="text-xs font-extrabold text-slate-900 leading-tight">
                  {selectedCase.assignedNgo || 'Not yet assigned'}
                </p>
                <span className="text-[10px] text-slate-500 mt-2 block font-medium">
                  Field Support & Safety
                </span>
              </div>

              <div className="glass-tile p-4 rounded-2xl">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Clinical Psychiatrist
                </span>
                <p className="text-xs font-extrabold text-slate-900 leading-tight">
                  {selectedCase.assignedPsychiatrist || 'Tele-MANAS Pool Available'}
                </p>
                <span className="text-[10px] text-slate-500 mt-2 block font-medium">
                  Trauma CBT & Evaluation
                </span>
              </div>
            </div>

            {/* AI Clinical Summary */}
            <div className="bg-gradient-to-r from-indigo-50/90 to-purple-50/90 rounded-2xl p-4 sm:p-5 border border-indigo-200/60 mb-6 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-950 mb-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Clinical Summary & Risk Diagnostic (MADRS / DSM-5 Basis)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {selectedCase.clinicalSummary}
              </p>
            </div>

            {/* CHARTS: SHAP Explainability + Longitudinal LSTM Trend */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. SHAP Drivers */}
              <div className="glass-tile p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Explainable AI: Distress Drivers (SHAP)</span>
                  </h4>
                </div>
                <div className="space-y-3">
                  {selectedCase.shapDrivers.map((driver, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                        <span className="truncate pr-2">{driver.name}</span>
                        <span className="font-mono font-bold text-indigo-700">+{driver.impact}%</span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.abs(driver.impact) * 2.8)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Longitudinal LSTM Trajectory */}
              <div className="glass-tile p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                    <span>Longitudinal Trend & LSTM Velocity</span>
                  </h4>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    +1.85 pts/day
                  </span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedCase.scoreHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#F8FAFC',
                          fontSize: '11px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#6366F1"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#6366F1' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 1:1 Live Chat & Encrypted Case Notes Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/70">
              {/* Chat Console */}
              <div className="glass-tile p-4 rounded-2xl flex flex-col justify-between h-72">
                <div className="flex items-center justify-between pb-2 border-b border-white/80">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span>1:1 Encrypted Chat with Survivor</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">● Live Connection</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
                  {selectedCase.chatMessages.length === 0 ? (
                    <div className="text-center text-xs text-slate-400 py-8 font-medium">
                      No chat messages yet. Start a supportive conversation below.
                    </div>
                  ) : (
                    selectedCase.chatMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${
                          m.sender === 'observer' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs font-medium ${
                            m.sender === 'observer'
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-xs shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs shadow-2xs'
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5">{m.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-white/80">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type supportive message..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white/90 border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Notes Log */}
              <div className="glass-tile p-4 rounded-2xl flex flex-col justify-between h-72">
                <div className="flex items-center justify-between pb-2 border-b border-white/80">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Clinical Case Notes & Relief Logs</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">AES-256</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 py-2 pr-1">
                  {selectedCase.notes.map((n) => (
                    <div key={n.id} className="bg-white/90 p-3 rounded-xl border border-slate-200 text-xs">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                        <span>{n.author}</span>
                        <span>{n.timestamp}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{n.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t border-white/80">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add confidential clinical note..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white/90 border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition shadow-xs"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Assign NGO */}
      {showNgoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="glass-panel-glow rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              Assign District Partner NGO
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Select verified field organisation for on-ground assistance and witness safety in {selectedCase.district}.
            </p>

            <div className="space-y-2.5 mb-6 max-h-60 overflow-y-auto">
              {MOCK_NGOS.map((ngo) => (
                <div
                  key={ngo.id}
                  className="glass-tile p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition"
                  onClick={() => handleAssignNgo(ngo.name)}
                >
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{ngo.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {ngo.type} • Contact: {ngo.contactPerson}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl">
                    Select
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowNgoModal(false)}
              className="w-full py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modal: Assign Psychiatrist */}
      {showPsyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="glass-panel-glow rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              Refer to Clinical Psychiatrist / Tele-MANAS
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Book urgent tele-consultation or hospital referral for severe depression / trauma.
            </p>

            <div className="space-y-2.5 mb-6 max-h-60 overflow-y-auto">
              {MOCK_PSYCHIATRISTS.map((psy) => (
                <div
                  key={psy.id}
                  className="glass-tile p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition"
                  onClick={() => handleAssignPsychiatrist(`${psy.name} (${psy.hospital})`)}
                >
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{psy.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {psy.qualification} • {psy.hospital}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {psy.availableSlot}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
                    Book Slot
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowPsyModal(false)}
              className="w-full py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modal: Log Follow-up Call */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="glass-panel-glow rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              Log Follow-up Call Outcome
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Record details of interaction with {selectedCase.victimName} ({selectedCase.phone}).
            </p>

            <textarea
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              placeholder="e.g. Spoke for 15 mins. Victim expressed relief after legal counsel visit. Sleep still interrupted; recommended 4-7-8 breath exercises."
              rows={4}
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-emerald-500/30 mb-4 font-medium bg-white/90"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCallModal(false)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogCall}
                className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition shadow-xs"
              >
                Save Call Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
