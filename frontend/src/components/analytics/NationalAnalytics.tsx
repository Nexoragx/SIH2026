import React from 'react';
import { BarChart3, TrendingDown, ShieldCheck, Clock, Download, FileSpreadsheet, MapPin, AlertCircle, Sparkles } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export const NationalAnalytics: React.FC = () => {
  const atrocityData = [
    { name: 'Caste Violence', count: 420, color: '#6366F1' },
    { name: 'Grievous Hurt', count: 310, color: '#14B8A6' },
    { name: 'Witness Threats', count: 280, color: '#F43F5E' },
    { name: 'Relief / Comp. Delay', count: 210, color: '#F59E0B' },
    { name: 'Arson / Loss', count: 160, color: '#A855F7' },
    { name: 'Sexual Violence', count: 140, color: '#EC4899' },
  ];

  const stateData = [
    { state: 'Maharashtra', activeCases: 320, criticalCount: 24, avgScore: 54.2, slaCompliance: '96%' },
    { state: 'Uttar Pradesh', activeCases: 480, criticalCount: 42, avgScore: 58.6, slaCompliance: '91%' },
    { state: 'Rajasthan', activeCases: 290, criticalCount: 19, avgScore: 52.1, slaCompliance: '94%' },
    { state: 'Madhya Pradesh', activeCases: 260, criticalCount: 18, avgScore: 51.0, slaCompliance: '93%' },
    { state: 'Tamil Nadu', activeCases: 190, criticalCount: 11, avgScore: 46.4, slaCompliance: '98%' },
    { state: 'West Bengal', activeCases: 210, criticalCount: 15, avgScore: 49.8, slaCompliance: '95%' },
  ];

  const monthlyInterventions = [
    { month: 'Apr', crisesPrevented: 84, counsellingsGiven: 310 },
    { month: 'May', crisesPrevented: 98, counsellingsGiven: 380 },
    { month: 'Jun', crisesPrevented: 112, counsellingsGiven: 420 },
    { month: 'Jul', crisesPrevented: 140, counsellingsGiven: 490 },
    { month: 'Aug', crisesPrevented: 165, counsellingsGiven: 560 },
    { month: 'Sep', crisesPrevented: 194, counsellingsGiven: 640 },
  ];

  const handleExport = () => {
    alert('Exporting ANVAYA MoSJE National Compliance & Mental Health Longitudinal Data (CSV / Encrypted PDF)...');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 animate-fadeInScale">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              ANVAYA MoSJE Macro Analytics & Atrocity Distress Monitor
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              National Longitudinal Health Metrics, Early Escalation Indicators & Intervention Audits
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="px-5 py-2.5 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white text-xs font-extrabold rounded-2xl flex items-center gap-2 shadow-lg shadow-slate-900/20 transition"
        >
          <Download className="w-4 h-4" />
          <span>Export MoSJE Compliance Report</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-tile p-5 rounded-3xl">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
            Active Monitored Survivors
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            14,890
          </div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <span>↑ 12%</span> monthly check-in adherence
          </span>
        </div>

        <div className="glass-tile p-5 rounded-3xl">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
            Pre-Crisis Early Interventions
          </span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono">
            91.4%
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            De-escalated prior to severe emergency
          </span>
        </div>

        <div className="glass-tile p-5 rounded-3xl">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
            Avg District SLA Response
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
            14.2 min
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            From critical flag to counsellor callback
          </span>
        </div>

        <div className="glass-tile p-5 rounded-3xl">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
            Partner NGOs & Psychiatrists
          </span>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">
            412 Nodes
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Active in 28 states & UTs
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atrocity Category Breakdown */}
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-1">
            High Distress Cases by Atrocity Incident Category
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-4">
            Under SC-ST (Prevention of Atrocities) Act, 1989 provisions.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={atrocityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#334155' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#F8FAFC',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {atrocityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Early Crisis Prevention Trajectory */}
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-1">
            Longitudinal Crisis Prevention & Counselling Growth
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-4">
            Early AI detection prevents acute decompensation and suicide risks.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyInterventions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
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
                  dataKey="counsellingsGiven"
                  name="Counselling Interventions"
                  stroke="#6366F1"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="crisesPrevented"
                  name="Crises Prevented"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* State-wise Matrix Table */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              State-wise Vulnerability & SLA Compliance Matrix
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Live district observer coordination across high-burden jurisdictions.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/80 text-slate-500 font-extrabold uppercase text-[10px]">
                <th className="pb-3">State / Jurisdiction</th>
                <th className="pb-3">Active Monitored Cases</th>
                <th className="pb-3">Critical Risk Cases</th>
                <th className="pb-3">Avg Distress Score</th>
                <th className="pb-3">SLA Follow-up Rate</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60 font-semibold text-slate-700">
              {stateData.map((s, idx) => (
                <tr key={idx} className="hover:bg-white/60 transition">
                  <td className="py-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{s.state}</span>
                  </td>
                  <td className="py-3.5 font-mono">{s.activeCases}</td>
                  <td className="py-3.5">
                    <span className="bg-rose-50 text-rose-700 font-extrabold px-2.5 py-0.5 rounded-full border border-rose-200">
                      {s.criticalCount} Critical
                    </span>
                  </td>
                  <td className="py-3.5 font-mono font-bold text-slate-900">{s.avgScore}</td>
                  <td className="py-3.5">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {s.slaCompliance}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-800 font-bold"
                    >
                      Audit District →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
