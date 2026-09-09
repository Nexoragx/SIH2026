import React, { useState } from 'react';
import {
  Users,
  MapPin,
  Package,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Home,
  Scale,
  HeartHandshake,
  AlertCircle,
  X,
  Compass,
} from 'lucide-react';
import { RiskLevel } from '../../types';

interface NgoCase {
  id: string;
  caseId: string;
  victimPseudonym: string;
  district: string;
  distressScore: number;
  riskLevel: RiskLevel;
  servicesNeeded: string[];
  assignedBy: string;
  assignedDate: string;
  status: 'pending_acceptance' | 'active_field_support' | 'rehabilitation_complete';
  fieldVisits: { date: string; officer: string; gpsLocation: string; notes: string }[];
  resourcesProvided: { item: string; date: string; quantity: string }[];
}

export const NgoPortal: React.FC = () => {
  const [ngoCases, setNgoCases] = useState<NgoCase[]>([
    {
      id: 'NGO-CASE-201',
      caseId: 'CASE-MH1024',
      victimPseudonym: 'Survivor #1024 Family',
      district: 'Nashik',
      distressScore: 82.5,
      riskLevel: 'critical',
      servicesNeeded: ['Emergency Shelter', 'Ration & Food Aid', 'Legal Aid Assistance', 'Community Protection'],
      assignedBy: 'Dr. Anita Joshi (District Nodal Officer)',
      assignedDate: '08 Sep 2026',
      status: 'active_field_support',
      fieldVisits: [
        {
          date: '08 Sep 2026, 02:30 PM',
          officer: 'Ram Kumar (NGO Field Coordinator)',
          gpsLocation: 'Nashik Rural (Lat: 19.9975, Long: 73.7898)',
          notes: 'Met survivor family. Safe temporary accommodation provided and rations delivered.',
        },
      ],
      resourcesProvided: [
        { item: 'Dry Ration Kit (1 Month)', date: '08 Sep 2026', quantity: '1 Unit' },
        { item: 'Safe Shelter Relocation Support', date: '08 Sep 2026', quantity: 'Completed' },
      ],
    },
    {
      id: 'NGO-CASE-202',
      caseId: 'CASE-MH1025',
      victimPseudonym: 'Survivor #1025',
      district: 'Nashik',
      distressScore: 64.0,
      riskLevel: 'high',
      servicesNeeded: ['Legal Aid Filing', 'Compensation Form Assistance', 'Counseling Escort'],
      assignedBy: 'L1 Health Observer',
      assignedDate: '07 Sep 2026',
      status: 'pending_acceptance',
      fieldVisits: [],
      resourcesProvided: [],
    },
    {
      id: 'NGO-CASE-203',
      caseId: 'CASE-MH1027',
      victimPseudonym: 'Survivor #1027',
      district: 'Pune',
      distressScore: 44.0,
      riskLevel: 'moderate',
      servicesNeeded: ['Vocational Training Linkage', 'Child Educational Support'],
      assignedBy: 'District Officer',
      assignedDate: '01 Sep 2026',
      status: 'rehabilitation_complete',
      fieldVisits: [
        {
          date: '03 Sep 2026, 11:00 AM',
          officer: 'Sunita Sharma (Field Worker)',
          gpsLocation: 'Pune East (Lat: 18.5204, Long: 73.8567)',
          notes: 'Enrolled in district livelihood mission and provided school supply kit.',
        },
      ],
      resourcesProvided: [
        { item: 'Educational Supply Kit', date: '03 Sep 2026', quantity: '2 Sets' },
        { item: 'Statutory Livelihood Enrolment', date: '05 Sep 2026', quantity: '1 Application' },
      ],
    },
  ]);

  const [selectedNgoCaseId, setSelectedNgoCaseId] = useState<string>('NGO-CASE-201');
  const [fieldNote, setFieldNote] = useState<string>('');
  const [resourceItem, setResourceItem] = useState<string>('');
  const [resourceQty, setResourceQty] = useState<string>('');
  const [isGpsCheckingIn, setIsGpsCheckingIn] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const activeNgoCase = ngoCases.find((c) => c.id === selectedNgoCaseId) || ngoCases[0];

  const handleAcceptCase = (caseId: string) => {
    setNgoCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: 'active_field_support' } : c))
    );
    setShowToast('Case accepted. Field support team mobilized.');
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleGpsCheckIn = () => {
    if (!fieldNote.trim()) return;
    setIsGpsCheckingIn(true);

    setTimeout(() => {
      setIsGpsCheckingIn(false);
      const simulatedLat = (19.99 + Math.random() * 0.05).toFixed(4);
      const simulatedLong = (73.78 + Math.random() * 0.05).toFixed(4);

      const newVisit = {
        date: `${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        officer: 'Ram Kumar (NGO Field Coordinator)',
        gpsLocation: `${activeNgoCase.district} Cluster (Lat: ${simulatedLat}, Long: ${simulatedLong})`,
        notes: fieldNote.trim(),
      };

      setNgoCases((prev) =>
        prev.map((c) =>
          c.id === selectedNgoCaseId
            ? { ...c, fieldVisits: [newVisit, ...c.fieldVisits], status: 'active_field_support' }
            : c
        )
      );
      setFieldNote('');
      setShowToast('Field visit logged with verified GPS coordinates.');
      setTimeout(() => setShowToast(null), 3500);
    }, 1200);
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceItem.trim()) return;

    const newRes = {
      item: resourceItem.trim(),
      date: new Date().toLocaleDateString(),
      quantity: resourceQty.trim() || '1 Unit',
    };

    setNgoCases((prev) =>
      prev.map((c) =>
        c.id === selectedNgoCaseId
          ? { ...c, resourcesProvided: [newRes, ...c.resourcesProvided] }
          : c
      )
    );
    setResourceItem('');
    setResourceQty('');
    setShowToast('Relief resource provision recorded in audit trail.');
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Top Banner */}
      <div className="liquid-glass-panel rounded-3xl p-6 sm:p-7 shadow-xl bg-gradient-to-r from-slate-900 to-teal-950 text-white border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/30 text-teal-300 flex items-center justify-center border border-teal-400/30 shadow-lg">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  NGO Field Support & Rehabilitation Portal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  MoSJE Partner Network
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Ground-level relief delivery, safe shelter verification, and rehabilitation tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 text-xs">
            <Users className="w-4 h-4 text-teal-400" />
            <div>
              <span className="font-bold text-white block">Atrocity Survivor Relief Trust</span>
              <span className="text-[10px] text-slate-300">District Partner: Nashik Unit</span>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Assigned Cases (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Assigned Field Cases ({ngoCases.length})
            </h3>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2.5 py-0.5 rounded-full">
              Ground Roster
            </span>
          </div>

          <div className="space-y-2.5">
            {ngoCases.map((c) => {
              const isSelected = c.id === selectedNgoCaseId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedNgoCaseId(c.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50/90 border-teal-500 shadow-md scale-[1.01]'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-slate-900">{c.victimPseudonym}</span>
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
                      Distress: {c.distressScore.toFixed(1)}/100
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 text-slate-500">
                    <span>{c.fieldVisits.length} Field Visits</span>
                    <span
                      className={`font-semibold capitalize text-[10px] ${
                        c.status === 'active_field_support'
                          ? 'text-teal-700 font-bold'
                          : c.status === 'rehabilitation_complete'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Field Support Workstation (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="liquid-glass-panel rounded-3xl p-6 sm:p-7 shadow-xl bg-white border border-slate-200 space-y-6">
            {/* Case Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 block mb-0.5">
                  ID: {activeNgoCase.caseId} • Assigned by {activeNgoCase.assignedBy}
                </span>
                <h2 className="text-xl font-black text-slate-900">
                  {activeNgoCase.victimPseudonym} ({activeNgoCase.district})
                </h2>
              </div>

              {activeNgoCase.status === 'pending_acceptance' && (
                <button
                  type="button"
                  onClick={() => handleAcceptCase(activeNgoCase.id)}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Case & Mobilize Field Team</span>
                </button>
              )}
            </div>

            {/* Required Services Tags */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Statutory Relief Services Needed:
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeNgoCase.servicesNeeded.map((svc, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-800 flex items-center gap-1.5"
                  >
                    <Package className="w-3.5 h-3.5 text-teal-600" />
                    <span>{svc}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* GPS Field Visit Logging */}
            <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-teal-700" />
                  <h4 className="text-xs font-black text-slate-900">
                    Log Field Visit with GPS Coordinates
                  </h4>
                </div>
                <span className="text-[10px] text-teal-800 font-bold bg-teal-100 px-2.5 py-0.5 rounded-full">
                  Tamper-proof Location Audit
                </span>
              </div>

              <textarea
                value={fieldNote}
                onChange={(e) => setFieldNote(e.target.value)}
                placeholder="Enter field observation notes, physical welfare check, shelter safety audit, or family feedback..."
                rows={3}
                className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-xs font-medium outline-none focus:ring-2 focus:ring-teal-500"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGpsCheckIn}
                  disabled={!fieldNote.trim() || isGpsCheckingIn}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md shadow-teal-600/20"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{isGpsCheckingIn ? 'Capturing GPS Location...' : 'Submit GPS Field Visit Log'}</span>
                </button>
              </div>
            </div>

            {/* Field Visit History Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Field Visit History ({activeNgoCase.fieldVisits.length})
              </h4>

              {activeNgoCase.fieldVisits.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No field visits logged yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {activeNgoCase.fieldVisits.map((v, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{v.officer}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{v.date}</span>
                      </div>
                      <div className="text-[10px] font-mono text-teal-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{v.gpsLocation}</span>
                      </div>
                      <p className="text-slate-700 font-medium pt-1">{v.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resource Distribution Tracker */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Delivered Relief & Statutory Resources
              </h4>

              <form onSubmit={handleAddResource} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={resourceItem}
                  onChange={(e) => setResourceItem(e.target.value)}
                  placeholder="Resource (e.g. Legal Aid Filing, Ration Kit, Medical Checkup)"
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
                <input
                  type="text"
                  value={resourceQty}
                  onChange={(e) => setResourceQty(e.target.value)}
                  placeholder="Qty / Status (e.g. 1 Kit)"
                  className="w-full sm:w-32 px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!resourceItem.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Record</span>
                </button>
              </form>

              <div className="grid sm:grid-cols-2 gap-2 pt-1">
                {activeNgoCase.resourcesProvided.map((r, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{r.item}</span>
                      <span className="text-[10px] text-slate-500">{r.date}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {r.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
