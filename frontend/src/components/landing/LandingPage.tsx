import React from 'react';
import {
  Shield,
  Heart,
  Activity,
  PhoneCall,
  Lock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  Mic,
  Ambulance,
  Users,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Scale
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onInstantLogin?: (role: 'citizen' | 'observer') => void;
  onStartGuestScreening?: () => void;
  onTriggerCrisis: () => void;
  currentLang: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onInstantLogin,
  onStartGuestScreening,
  onTriggerCrisis,
  currentLang,
}) => {
  return (
    <div className="space-y-16 py-6 sm:py-12 animate-fadeIn">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* Ministry Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 px-4 py-1.5 rounded-full text-indigo-700 text-xs font-extrabold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>ANVAYA (अन्वय) • MoSJE Government of India Safety Net</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          AI-Powered Dynamic <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">Mental Health Monitoring</span> & Distress Prediction
        </h1>

        {/* Hero Subtitle */}
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
          A confidential, multi-modal psychological safeguarding platform for victims of atrocities under the SC/ST (PoA) Act. Fusing clinical MADRS questionnaires, NLP trauma detection, and real-time voice acoustic biomarkers.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
          <button
            type="button"
            onClick={() => onOpenAuth('register')}
            className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
          >
            <span>Create Account (Register)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onOpenAuth('login')}
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 active:scale-95 text-slate-800 font-extrabold text-sm border border-slate-200 shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <span>Sign In to Portal</span>
          </button>

          {onStartGuestScreening && (
            <button
              type="button"
              onClick={onStartGuestScreening}
              className="px-5 py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 font-extrabold text-xs sm:text-sm border border-emerald-300 transition flex items-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>Try Anonymous Check-in</span>
            </button>
          )}
        </div>

        {/* Evaluator 1-Click Instant Demo Access Strip */}
        {onInstantLogin && (
          <div className="max-w-xl mx-auto p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-black flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>SIH Evaluation 1-Click Instant Portals (No Typing Required)</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => onInstantLogin('citizen')}
                className="px-4 py-2 rounded-xl bg-white hover:bg-indigo-50 active:scale-95 border border-indigo-200 text-black font-extrabold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>👤 Instant Citizen Demo</span>
              </button>
              <button
                type="button"
                onClick={() => onInstantLogin('observer')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black active:scale-95 text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>🛡️ Instant Observer Portal</span>
              </button>
            </div>
          </div>
        )}

        {/* Key Trust Signals */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-500 font-bold">
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>MongoDB Encrypted Storage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>100% Confidentiality & Zero Name Exposure</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ambulance className="w-4 h-4 text-rose-600" />
            <span>Integrated 108 Emergency Ambulance Protocol</span>
          </div>
        </div>
      </section>

      {/* 2. Three Pillars Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Intelligent Protection Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Multi-Modal AI Built for Rapid Crisis Mitigation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="liquid-glass-panel p-6 sm:p-8 rounded-3xl space-y-4 hover:shadow-2xl transition border border-slate-200/80">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Multi-Modal Sensory Fusion
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Combines MADRS clinical depression scales (40%), NLP traumatic narrative affect (15%), and voice acoustic stress tremor (10%) with socio-environmental context into a single normalized 0–100 index.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-indigo-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>MADRS · PHQ-9 · Whisper STT · Jitter AI</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="liquid-glass-panel p-6 sm:p-8 rounded-3xl space-y-4 hover:shadow-2xl transition border border-slate-200/80">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-purple-700 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              XGBoost + SHAP Explainability
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Every computed score provides full clinician-grade explainability with SHAP impact factors and LSTM sequential temporal progression, forecasting deterioration trajectories before acute crises.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-purple-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Clinical Explainability & LSTM Trend</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="liquid-glass-panel p-6 sm:p-8 rounded-3xl space-y-4 hover:shadow-2xl transition border border-slate-200/80">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Ambulance className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Automated 108 Crisis Dispatch
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              When critical risk triggers (MADRS Q10 crisis or severe self-harm language) are identified, the system immediately initiates emergency dispatch alerts to 108 Emergency Ambulance networks and District Nodal units.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-rose-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Emergency 108 Hook & IVR Callback</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Role-Based Stakeholders Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="liquid-glass-panel rounded-3xl p-8 sm:p-12 border border-indigo-100 shadow-xl bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-100/80 px-3 py-1 rounded-full border border-indigo-200">
                Connected Healthcare Ecosystem
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                One System for Survivors, Observers, Psychiatrists & Legal Aid
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                ANVAYA bridges all key stakeholders under statutory guidelines:
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Victim & Survivor Touchpoints</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Gentle tile-based questionnaire, AI voice check-in, 1:1 encrypted counselor chat, and AI Saathi well-being companion.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Health Observer Command Center</h4>
                    <p className="text-[11px] text-slate-500 font-medium">District, State & National triage queues, SLA countdowns, direct telepsychiatrist assignment, and case note encryption.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Statutory Relief & NALSA Legal Aid</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Automated linkage with Central Victim Compensation Fund, Tele-MANAS, and district legal defense units.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Actions Box */}
            <div className="liquid-glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white/95 space-y-4 shadow-lg">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Ready to Access the System?</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                New user accounts are saved directly into the MongoDB <code className="text-indigo-600 font-bold">user</code> collection with JWT authentication.
              </p>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Register as Citizen or Official</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="w-full py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs border border-slate-200 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Sign In with Existing Account</span>
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={onTriggerCrisis}
                    className="text-xs font-extrabold text-rose-600 hover:text-rose-800 inline-flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>In immediate danger? Trigger Emergency SOS (108 / 14566)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Emergency Contacts Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase">National Helpline</span>
              <a href="tel:14566" className="block text-sm font-black text-emerald-900 hover:underline">
                NHAA: 14566 (24x7)
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase">Mental Health Tele-MANAS</span>
              <a href="tel:14416" className="block text-sm font-black text-indigo-900 hover:underline">
                Tele-MANAS: 14416
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
              <Ambulance className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-rose-700 uppercase">Medical Emergency</span>
              <a href="tel:108" className="block text-sm font-black text-rose-900 hover:underline">
                Emergency Ambulance: 108
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
