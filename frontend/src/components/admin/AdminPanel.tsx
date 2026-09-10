import React, { useEffect, useState } from 'react';
import {
  Shield,
  BarChart3,
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  Download,
  Building2,
  CheckCircle2,
  TrendingUp,
  Scale,
  Sparkles,
  Server,
  FileSpreadsheet,
  Activity,
  Layers
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
} from 'recharts';
import { adminReportsApi, AdminReportSummary, AssessmentBackendResponse } from '../../api';

export const AdminPanel: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<'L1' | 'L2' | 'L3' | 'L4'>('L4');
  const [activeTab, setActiveTab] = useState<'overview' | 'assessments' | 'sla' | 'court' | 'model'>('overview');
  const [savedReports, setSavedReports] = useState<AdminReportSummary[]>([]);
  const [selectedReport, setSelectedReport] = useState<(AssessmentBackendResponse & Record<string, any>) | null>(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');

  const loadReports = async () => {
    setReportsLoading(true);
    setReportsError('');
    try {
      const registry = await adminReportsApi.getReports();
      setSavedReports(registry.reports);
    } catch {
      setReportsError('Saved assessment reports could not be loaded. Please try again.');
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const openReport = async (reportId: string) => {
    setReportsLoading(true);
    setReportsError('');
    try {
      setSelectedReport(await adminReportsApi.getReport(reportId));
    } catch {
      setReportsError('The detailed report could not be loaded.');
    } finally {
      setReportsLoading(false);
    }
  };

  const stateData = [
    { state: 'Maharashtra', activeCases: 320, criticalCount: 24, avgScore: 54.2, slaCompliance: '96%' },
    { state: 'Uttar Pradesh', activeCases: 480, criticalCount: 42, avgScore: 58.6, slaCompliance: '91%' },
    { state: 'Rajasthan', activeCases: 290, criticalCount: 19, avgScore: 52.1, slaCompliance: '94%' },
    { state: 'Madhya Pradesh', activeCases: 260, criticalCount: 18, avgScore: 51.0, slaCompliance: '93%' },
    { state: 'Tamil Nadu', activeCases: 190, criticalCount: 11, avgScore: 46.4, slaCompliance: '98%' },
    { state: 'West Bengal', activeCases: 210, criticalCount: 15, avgScore: 49.8, slaCompliance: '95%' },
  ];

  const slaTrackerData = [
    { caseId: 'CASE-MH1024', district: 'Nashik', observer: 'Dr. Anita Joshi', priority: 'Critical', timeRemaining: '22 mins', status: 'Compliant' },
    { caseId: 'CASE-UP2088', district: 'Hathras', observer: 'Suresh Verma', priority: 'Critical', timeRemaining: '45 mins', status: 'Compliant' },
    { caseId: 'CASE-RJ3012', district: 'Jaipur', observer: 'Priya Meena', priority: 'High', timeRemaining: '1h 40m', status: 'Pending' },
    { caseId: 'CASE-MP4055', district: 'Gwalior', observer: 'Rajesh Tiwari', priority: 'High', timeRemaining: '3h 15m', status: 'Pending' },
    { caseId: 'CASE-TN5090', district: 'Madurai', observer: 'K. Selvam', priority: 'Moderate', timeRemaining: '14h', status: 'Compliant' },
  ];

  const courtCalendar = [
    { date: '11 Sep 2026', caseId: 'CASE-MH1024', court: 'District Sessions Court, Nashik', type: 'Bail Hearing', survivorPseudonym: 'Survivor #1024', status: 'Escort Assigned' },
    { date: '15 Sep 2026', caseId: 'CASE-MH1026', court: 'Special SC/ST Court, Pune', type: 'Evidence Recording', survivorPseudonym: 'Survivor #1026', status: 'Legal Aid Linkage' },
    { date: '18 Sep 2026', caseId: 'CASE-UP2088', court: 'High Court Bench, Lucknow', type: 'Compensation Appeal', survivorPseudonym: 'Survivor #2088', status: 'Protection Officer Alert' },
    { date: '22 Sep 2026', caseId: 'CASE-RJ3012', court: 'Special Atrocity Court, Jaipur', type: 'Witness Deposition', survivorPseudonym: 'Survivor #3012', status: 'Security Escort Queued' },
  ];

  const modelMetrics = {
    accuracy: '94.2%',
    falseNegativeRate: '0.8%',
    aucRoc: '0.968',
    fairnessParity: '99.1%',
    driftStatus: 'Normal (Zero Drift Detected)',
    lastRetrainDate: '01 Sep 2026',
  };

  const handleExportMoSJEReport = () => {
    alert('Generating Official MoSJE Statutory Compliance Report (Format Annexure IV-B) in PDF/CSV format...');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="rounded-3xl p-5 sm:p-7 shadow-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-400/30 shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Executive Command & Administration
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  MoSJE Apex Tier
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Multi-tier oversight (L1–L4), SLA adherence audits, court calendar linkages & policy intelligence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportMoSJEReport}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export MoSJE Report</span>
          </button>
        </div>
      </div>

      {/* Tier Switcher Bar (L1 Block, L2 District, L3 State, L4 National) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {[
            { id: 'L1', label: 'L1: Block / Taluk Unit' },
            { id: 'L2', label: 'L2: District Command' },
            { id: 'L3', label: 'L3: State Directorate' },
            { id: 'L4', label: 'L4: National MoSJE Apex' },
          ].map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => setSelectedTier(tier.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex-shrink-0 ${
                selectedTier === tier.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-black hover:bg-slate-100'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100 hidden md:inline">
          Active Jurisdiction: {selectedTier === 'L4' ? 'All India (National Registry)' : selectedTier === 'L3' ? 'Maharashtra State' : 'Nashik District'}
        </span>
      </div>

      {/* Macro Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Monitored Cases
          </span>
          <div className="text-2xl sm:text-3xl font-black text-black mt-1">14,890</div>
          <span className="text-[11px] text-emerald-700 font-bold mt-0.5 block">
            ↑ 12% Check-in Adherence
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Pre-Crisis Interventions
          </span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">91.4%</div>
          <span className="text-[11px] text-slate-600 font-medium mt-0.5 block">
            De-escalated via Tele-MANAS
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            National SLA Compliance
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">94.8%</div>
          <span className="text-[11px] text-slate-600 font-medium mt-0.5 block">
            &lt; 4h for Critical Cases
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Atrocity Compensation Link
          </span>
          <div className="text-2xl sm:text-3xl font-black text-black mt-1">₹18.4 Cr</div>
          <span className="text-[11px] text-slate-600 font-medium mt-0.5 block">
            Disbursed via Direct Benefit
          </span>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-black">
        {[
          { id: 'overview', label: 'State Overview & Heatmap' },
          { id: 'assessments', label: 'Saved Assessment Reports' },
          { id: 'sla', label: 'SLA Adherence & Escalations' },
          { id: 'court', label: 'Court Date & Protection Calendar' },
          { id: 'model', label: 'AI Model Drift & Fairness Audit' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 transition cursor-pointer border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-black'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: State Overview & Heatmap */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-black">
              State-wise Case Distribution & SLA Compliance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <th className="py-2.5 font-bold">State</th>
                    <th className="py-2.5 font-bold">Active Cases</th>
                    <th className="py-2.5 font-bold">Critical Priority</th>
                    <th className="py-2.5 font-bold">Avg Distress Score</th>
                    <th className="py-2.5 font-bold">SLA Adherence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-900">
                  {stateData.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 font-bold">{s.state}</td>
                      <td className="py-3">{s.activeCases}</td>
                      <td className="py-3 text-rose-700 font-bold">{s.criticalCount}</td>
                      <td className="py-3 font-mono">{s.avgScore} / 100</td>
                      <td className="py-3 text-emerald-700 font-bold">{s.slaCompliance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: saved reports. This view is mounted only in the administrator
          portal and calls administrator-only API routes. */}
      {activeTab === 'assessments' && (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          <section className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-black">Saved assessment reports</h3>
                <p className="text-xs text-slate-500 mt-1">Clinical details and graphs are restricted to administrators.</p>
              </div>
              <button type="button" onClick={loadReports} className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-black cursor-pointer">Refresh</button>
            </div>
            {reportsError && <p className="m-4 p-3 text-xs font-bold rounded-xl bg-rose-50 text-rose-800 border border-rose-100">{reportsError}</p>}
            {reportsLoading && !savedReports.length ? <p className="p-5 text-xs font-semibold text-slate-500">Loading reports…</p> : (
              <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
                {savedReports.length === 0 && <p className="p-5 text-xs font-semibold text-slate-500">No assessment reports have been saved yet.</p>}
                {savedReports.map((report) => (
                  <button key={report.id} type="button" onClick={() => openReport(report.id)} className={`w-full p-4 text-left hover:bg-slate-50 transition cursor-pointer ${selectedReport?.id === report.id ? 'bg-indigo-50/70' : ''}`}>
                    <div className="flex justify-between gap-3">
                      <span className="font-mono text-[11px] font-black text-slate-900">{report.session_id}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${report.severity_level === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : report.severity_level === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-indigo-100 text-indigo-800'}`}>{report.severity_level}</span>
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-bold text-slate-600">
                      <span>MADRS: {report.clinical_assessment?.total_score ?? '—'}/60</span>
                      <span>Distress: {report.distress_score}/100</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{report.created_at ? new Date(report.created_at).toLocaleString() : 'Saved assessment'}</p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="xl:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6">
            {!selectedReport ? (
              <div className="h-full min-h-80 flex items-center justify-center text-center text-sm font-semibold text-slate-500">Select a saved assessment to view its protected clinical report.</div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div><h3 className="text-base font-black text-black">Clinical assessment report</h3><p className="text-xs text-slate-500 font-mono mt-1">{selectedReport.session_id}</p></div>
                  <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-black">{selectedReport.severity_level} · {selectedReport.distress_score}/100</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100"><span className="block text-[10px] uppercase font-bold text-indigo-700">MADRS total</span><span className="text-xl font-black text-indigo-950">{selectedReport.clinical_assessment?.total_score ?? '—'}/60</span></div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase font-bold text-slate-500">MADRS band</span><span className="text-sm font-black text-black">{selectedReport.clinical_assessment?.severity_category ?? '—'}</span></div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase font-bold text-slate-500">Alert</span><span className="text-sm font-black text-black">{selectedReport.alert_triggered ? 'Triggered' : 'None'}</span></div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200"><span className="block text-[10px] uppercase font-bold text-slate-500">Follow-up</span><span className="text-sm font-black text-black">{selectedReport.recommendations?.follow_up?.interval_days ?? '—'} days</span></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="h-60"><h4 className="text-xs font-black text-black mb-3">Signal contribution breakdown</h4><ResponsiveContainer width="100%" height="90%"><BarChart data={selectedReport.shap_explainability?.features || []} layout="vertical" margin={{ left: 12 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" domain={[0, 1]} hide /><YAxis type="category" dataKey="feature" width={130} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="shap_value" fill="#4f46e5" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>
                  <div className="h-60"><h4 className="text-xs font-black text-black mb-3">Assessment trend and seven-day projection</h4><ResponsiveContainer width="100%" height="90%"><LineChart data={(selectedReport.temporal_trend?.historical_series || []).map((score: number, index: number) => ({ checkin: String(index + 1), score })).concat([{ checkin: 'Projected', score: selectedReport.temporal_trend?.projected_7d_score }])}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="checkin" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 10 }} /><Tooltip /><Line type="monotone" dataKey="score" stroke="#0f172a" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200"><h4 className="text-xs font-black text-black mb-2">Leading questionnaire domains</h4><div className="flex flex-wrap gap-2">{selectedReport.clinical_assessment?.leading_domains?.map((domain) => <span key={domain.domain} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700">{domain.domain}: {domain.score}/6</span>) || <span className="text-xs text-slate-500">No questionnaire domains recorded.</span>}</div></div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Tab 2: SLA Adherence & Escalations */}
      {activeTab === 'sla' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-black">
              Real-Time Case SLA Timers & Response Countdown
            </h3>
            <span className="text-xs text-slate-500 font-semibold">Active Monitoring</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <th className="py-2.5 font-bold">Case Reference</th>
                  <th className="py-2.5 font-bold">District</th>
                  <th className="py-2.5 font-bold">Assigned Health Observer</th>
                  <th className="py-2.5 font-bold">Priority</th>
                  <th className="py-2.5 font-bold">SLA Remaining</th>
                  <th className="py-2.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-900">
                {slaTrackerData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 font-bold font-mono">{row.caseId}</td>
                    <td className="py-3">{row.district}</td>
                    <td className="py-3">{row.observer}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.priority === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {row.priority}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-indigo-700">{row.timeRemaining}</td>
                    <td className="py-3">
                      <span className="text-emerald-700 font-bold">{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Court Date & Protection Calendar */}
      {activeTab === 'court' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-black">
              Upcoming Special SC/ST Court Proceedings & Escort Roster
            </h3>
            <span className="text-xs text-slate-500 font-semibold">Trauma-Informed Legal Escorts</span>
          </div>
          <div className="space-y-3">
            {courtCalendar.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black text-sm">{item.date}</span>
                    <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {item.type}
                    </span>
                  </div>
                  <div className="text-slate-600 font-medium">
                    {item.survivorPseudonym} ({item.caseId}) • {item.court}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                    ✓ {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: AI Model Drift & Fairness Audit */}
      {activeTab === 'model' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-sm font-black text-black">
            AI Distress Model Diagnostic & Fairness Audit (DPDP Act & MeitY Standards)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Overall Sensitivity</span>
              <span className="text-xl font-black text-slate-900 font-mono mt-1 block">{modelMetrics.accuracy}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">False Negative Rate</span>
              <span className="text-xl font-black text-emerald-700 font-mono mt-1 block">{modelMetrics.falseNegativeRate}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">AUC-ROC Index</span>
              <span className="text-xl font-black text-indigo-700 font-mono mt-1 block">{modelMetrics.aucRoc}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Demographic Fairness</span>
              <span className="text-xl font-black text-slate-900 font-mono mt-1 block">{modelMetrics.fairnessParity}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Model Drift Status</span>
              <span className="text-xs font-bold text-emerald-800 mt-1 block">{modelMetrics.driftStatus}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Last Retraining</span>
              <span className="text-xs font-bold text-slate-700 mt-1 block">{modelMetrics.lastRetrainDate}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
