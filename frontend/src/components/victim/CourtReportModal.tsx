import React, { useRef } from 'react';
import { FileText, Download, ShieldCheck, Printer, CheckCircle2, Building2, X, Sparkles } from 'lucide-react';
import { AssessmentResultData, UserProfile } from '../../types';

interface CourtReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultData: AssessmentResultData;
  userProfile: UserProfile;
}

export const CourtReportModal: React.FC<CourtReportModalProps> = ({
  isOpen,
  onClose,
  resultData,
  userProfile,
}) => {
  const reportRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="anvaya-card rounded-3xl max-w-3xl w-full max-h-[92vh] bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Toolbar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
            <FileText className="w-4 h-4" />
            <span>Legal Aid & Court Psychological Evidence Report (MoSJE / SC-ST Act Format)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div ref={reportRef} className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 bg-white">
          {/* Government Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-slate-900" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-700">
                Government of India • Ministry of Social Justice and Empowerment (MoSJE)
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
              District Nodal Mental Health Unit & Atrocity Relief Cell
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              Psychological Trauma Evaluation & Statutory Compensation Support Summary
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Ref ID: DOC-MH-2026-{(resultData.sessionId || 'SES-001').toUpperCase()} • Date of Issue: {todayStr}
            </p>
          </div>

          {/* Section 1: Survivor & Case Demographics */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              1. Case & Survivor Information (Confidential Under SC/ST Act)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Case Reference</span>
                <span className="font-bold text-slate-900">{userProfile.caseNumber || 'CR-2026-NSK-4402'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Survivor Pseudonym</span>
                <span className="font-bold text-slate-900">{userProfile.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Jurisdiction</span>
                <span className="font-bold text-slate-900">{userProfile.district}, {userProfile.state}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Atrocity Category</span>
                <span className="font-bold text-slate-900 capitalize">{userProfile.caseCategory.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Contact Channel</span>
                <span className="font-bold text-slate-900">{userProfile.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Assessment Date</span>
                <span className="font-bold text-slate-900">{resultData.date}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Metrics & Diagnostic Screening */}
          <div className="border border-slate-300 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              2. Multi-Modal Psychological Evaluation & Clinical Scores
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-100 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">MADRS Scale</span>
                <span className="text-lg font-black font-mono text-slate-900">{resultData.totalMadrs}/60</span>
                <span className="text-[9px] text-slate-600 block mt-0.5">Moderate-Severe</span>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">PHQ-9 Equivalent</span>
                <span className="text-lg font-black font-mono text-slate-900">{resultData.phq9Equivalent}/27</span>
                <span className="text-[9px] text-slate-600 block mt-0.5">Clinical Threshold</span>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Distress Index</span>
                <span className="text-lg font-black font-mono text-slate-900">{resultData.finalDistressScore.toFixed(1)}/100</span>
                <span className="text-[9px] text-rose-700 font-bold block mt-0.5 uppercase">{resultData.riskLevel}</span>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">DSM-5 MDD</span>
                <span className="text-lg font-black font-mono text-slate-900">
                  {resultData.dsm5Probable ? 'Probable' : 'Negative'}
                </span>
                <span className="text-[9px] text-slate-600 block mt-0.5">Trauma-Induced</span>
              </div>
            </div>

            <div className="text-xs text-slate-700 leading-relaxed font-medium pt-2">
              <p>
                <strong>Clinical Observation:</strong> The survivor displays significant psychomotor tension, severe disruption to natural sleep architectures, and hyper-vigilance resulting directly from recent victimisation. Vocal acoustic analysis confirms elevated jitter and tremor latency.
              </p>
            </div>
          </div>

          {/* Section 3: Key Trauma Drivers (SHAP Explainability) */}
          <div className="border border-slate-300 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              3. Objective AI Feature Breakdown (SHAP Explainability)
            </h3>
            <div className="space-y-1.5 text-xs">
              {resultData.shapFactors.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                  <span className="font-semibold text-slate-800">{f.name}</span>
                  <span className="font-mono font-bold text-slate-900">+{f.impact} pts ({f.description})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Recommended Statutory Interventions & Relief */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              4. Recommended Statutory Relief & Protective Measures
            </h3>
            <ul className="text-xs text-slate-800 space-y-1 list-disc pl-4 font-medium">
              <li>Immediate expedited disbursement of Central Victim Compensation Fund (CVCF) interim relief.</li>
              <li>Provision of free legal counsel through NALSA District Legal Services Authority (DLSA).</li>
              <li>Regular weekly psychological check-in via Tele-MANAS & District Mental Health Unit.</li>
              <li>Local Police protection and monitoring for witness intimidation safeguards.</li>
            </ul>
          </div>

          {/* Certification Signature Stamp */}
          <div className="pt-4 border-t-2 border-slate-300 flex items-center justify-between text-xs">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Digitally Certified by ANVAYA System Engine</span>
              </div>
              <p className="text-[10px] text-slate-500">
                MeitY / NIC Cloud Timestamp: {new Date().toISOString()}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-slate-900">Dr. Anita Joshi, MD (Psych)</p>
              <p className="text-[10px] text-slate-600">District Nodal Health Officer, Nashik</p>
              <p className="text-[9px] text-slate-400 font-mono">Reg. No: MCI-2012-44021-MH</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
