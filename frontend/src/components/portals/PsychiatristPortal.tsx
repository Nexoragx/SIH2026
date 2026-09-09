import React, { useState } from 'react';
import {
  Stethoscope,
  Calendar,
  Clock,
  Video,
  FileText,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Shield,
  Activity,
  Send,
  Sparkles,
  ChevronRight,
  Pill,
} from 'lucide-react';
import { RiskLevel } from '../../types';

interface ReferredCase {
  id: string;
  pseudonym: string;
  age: number;
  district: string;
  distressScore: number;
  riskLevel: RiskLevel;
  madrsScore: number;
  dsm5Probable: boolean;
  referredBy: string;
  referredDate: string;
  slotScheduled?: string;
  status: 'pending_review' | 'session_scheduled' | 'consultation_completed';
  shapSummary: string;
  clinicalNotes?: string;
}

export const PsychiatristPortal: React.FC = () => {
  const [cases, setCases] = useState<ReferredCase[]>([
    {
      id: 'REF-PSY-101',
      pseudonym: 'Survivor #1024',
      age: 27,
      district: 'Nashik',
      distressScore: 82.5,
      riskLevel: 'critical',
      madrsScore: 42,
      dsm5Probable: true,
      referredBy: 'Dr. Anita Joshi (District Nodal Officer)',
      referredDate: '08 Sep 2026',
      slotScheduled: '10 Sep 2026, 04:00 PM',
      status: 'session_scheduled',
      shapSummary: 'Severe sleep fragmentation (32%), high vocal tremor (24%), suicidal ideation flag.',
      clinicalNotes: 'Prescribed somatic grounding exercises. Scheduled telepsychiatry review.',
    },
    {
      id: 'REF-PSY-102',
      pseudonym: 'Survivor #1026',
      age: 34,
      district: 'Nashik',
      distressScore: 71.0,
      riskLevel: 'high',
      madrsScore: 36,
      dsm5Probable: true,
      referredBy: 'L1 Health Observer',
      referredDate: '07 Sep 2026',
      status: 'pending_review',
      shapSummary: 'Depressive mood persistent (+18 pts), intimidation anxiety (+12 pts).',
    },
    {
      id: 'REF-PSY-103',
      pseudonym: 'Survivor #1029',
      age: 22,
      district: 'Pune',
      distressScore: 74.0,
      riskLevel: 'high',
      madrsScore: 38,
      dsm5Probable: true,
      referredBy: 'District Nodal Officer',
      referredDate: '06 Sep 2026',
      slotScheduled: '09 Sep 2026, 02:30 PM',
      status: 'consultation_completed',
      shapSummary: 'Acute post-traumatic stress after village ostracism. Moderate insomnia.',
      clinicalNotes: 'Initiated trauma-focused cognitive intervention. Follow-up in 7 days.',
    },
  ]);

  const [selectedCaseId, setSelectedCaseId] = useState<string>('REF-PSY-101');
  const [newNote, setNewNote] = useState<string>('');
  const [prescriptionText, setPrescriptionText] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const handleScheduleSlot = () => {
    if (!scheduledDate) return;
    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCaseId
          ? { ...c, slotScheduled: scheduledDate, status: 'session_scheduled' }
          : c
      )
    );
    setShowSuccessMessage(`Telepsychiatry slot confirmed for ${scheduledDate}`);
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  const handleSaveClinicalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() && !prescriptionText.trim()) return;

    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCaseId
          ? {
              ...c,
              clinicalNotes: `${c.clinicalNotes ? c.clinicalNotes + '\n\n' : ''}[${new Date().toLocaleDateString()}]: ${newNote.trim()}${
                prescriptionText.trim() ? `\nRx: ${prescriptionText.trim()}` : ''
              }`,
              status: 'consultation_completed',
            }
          : c
      )
    );
    setNewNote('');
    setPrescriptionText('');
    setShowSuccessMessage('Clinical observation & prescription notes encrypted and saved.');
    setTimeout(() => setShowSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Portal Top Header */}
      <div className="liquid-glass-panel rounded-3xl p-6 sm:p-7 shadow-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center border border-indigo-400/30 shadow-lg">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Telepsychiatry & Clinical Review Portal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  MCI Verified Channel
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Specialist psychiatric evaluations for high and critical distress atrocity survivor cases
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 text-xs">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-bold text-white block">Dr. Anita Joshi, MD</span>
              <span className="text-[10px] text-slate-300">Reg: MCI-2012-44021-MH</span>
            </div>
          </div>
        </div>
      </div>

      {showSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{showSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: Cases List (4 cols) & Detail Workstation (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Referred Cases Caseload */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Referred Priority Cases ({cases.length})
            </h3>
            <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Live Triage
            </span>
          </div>

          <div className="space-y-2.5">
            {cases.map((c) => {
              const isSelected = c.id === selectedCaseId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-500 shadow-md scale-[1.01]'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-slate-900">{c.pseudonym}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.riskLevel === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {c.riskLevel.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-medium">
                    <span>{c.district} District</span>
                    <span className="font-mono font-bold text-slate-900">
                      Score: {c.distressScore.toFixed(1)}/100
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{c.referredDate}</span>
                    </span>
                    <span
                      className={`font-semibold capitalize text-[10px] ${
                        c.status === 'session_scheduled'
                          ? 'text-indigo-700 font-bold'
                          : c.status === 'consultation_completed'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Clinical Workstation */}
        <div className="lg:col-span-8 space-y-6">
          <div className="liquid-glass-panel rounded-3xl p-6 sm:p-7 shadow-xl bg-white border border-slate-200 space-y-6">
            {/* Case Header Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-0.5">
                  Case ID: {activeCase.id} • Referred by {activeCase.referredBy}
                </span>
                <h2 className="text-xl font-black text-slate-900">
                  {activeCase.pseudonym} (Age {activeCase.age}, {activeCase.district})
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Distress Index</span>
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {activeCase.distressScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Clinical Score Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">MADRS Scale</span>
                <span className="text-xl font-black font-mono text-indigo-900">{activeCase.madrsScore}/60</span>
                <span className="text-[10px] text-slate-600 block mt-0.5">Severe Range</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">DSM-5 MDD</span>
                <span className="text-xl font-black text-slate-900">
                  {activeCase.dsm5Probable ? 'Probable' : 'Negative'}
                </span>
                <span className="text-[10px] text-slate-600 block mt-0.5">5+ Criteria Met</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Status</span>
                <span className="text-xs font-black text-slate-900 capitalize block mt-1">
                  {activeCase.status.replace('_', ' ')}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Next Slot</span>
                <span className="text-xs font-bold text-indigo-700 block mt-1">
                  {activeCase.slotScheduled || 'Unscheduled'}
                </span>
              </div>
            </div>

            {/* AI Trauma & SHAP Explainability Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Trauma Signal & SHAP Explainability</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {activeCase.shapSummary}
              </p>
            </div>

            {/* Telepsychiatry Schedule Section */}
            <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-black text-slate-900">
                    Schedule Secure Telepsychiatry Session
                  </h4>
                </div>
                {activeCase.slotScheduled && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Slot Confirmed</span>
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  placeholder="e.g. 11 Sep 2026, 05:00 PM (IST)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleScheduleSlot}
                  disabled={!scheduledDate.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Confirm Slot</span>
                </button>
              </div>
            </div>

            {/* Clinical & Prescription Notes Log */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Clinical Observations & Prescription Log</span>
              </h4>

              {activeCase.clinicalNotes && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                  {activeCase.clinicalNotes}
                </div>
              )}

              <form onSubmit={handleSaveClinicalNote} className="space-y-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add clinical diagnostic notes, sleep recommendations, or therapeutic guidance..."
                  rows={3}
                  className="w-full p-3.5 rounded-2xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Pill className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                      placeholder="Optional medication / non-pharmacological prescription advice..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newNote.trim() && !prescriptionText.trim()}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
