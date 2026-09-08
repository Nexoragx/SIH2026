import React, { useState } from 'react';
import {
  Heart,
  PhoneCall,
  ShieldCheck,
  Calendar,
  Sparkles,
  UserCheck,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Bot,
  Activity,
  Wind,
} from 'lucide-react';
import { AssessmentResultData, UserProfile } from '../../types';
import { DistressMeter } from './DistressMeter';
import { PersonalizedActivities } from './PersonalizedActivities';
import { translations } from '../../utils/translations';

interface AssessmentResultProps {
  currentLang: string;
  resultData: AssessmentResultData;
  userProfile: UserProfile;
  onRestart: () => void;
  onOpenObserverView: () => void;
  onOpenChatbot: () => void;
  onOpenObserverChat: () => void;
}

export const AssessmentResult: React.FC<AssessmentResultProps> = ({
  currentLang,
  resultData,
  userProfile,
  onRestart,
  onOpenObserverView,
  onOpenChatbot,
  onOpenObserverChat,
}) => {
  const t = translations[currentLang] || translations.en;
  const [activeMainTab, setActiveMainTab] = useState<'meter' | 'activities' | 'support'>('meter');
  const [callRequested, setCallRequested] = useState<boolean>(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-6 animate-fadeInScale">
      {/* Top Banner Card */}
      <div className="liquid-glass-panel rounded-3xl p-6 sm:p-8 shadow-xl bg-white/95 border border-slate-200/90">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Check-in Logged & Safeguarded
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {t.resultGreeting}
            </h2>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-6">
          {t.resultBody}
        </p>

        {/* Quick Connection Action Strip */}
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {/* 1:1 Observer Chat Button */}
          <button
            type="button"
            onClick={onOpenObserverChat}
            className="p-4 rounded-2xl liquid-tile flex items-center justify-between text-left group hover:border-emerald-500 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition">
                  1:1 Chat with Health Observer
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Direct encrypted channel with Dr. Anita Joshi
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* AI Saathi Companion Button */}
          <button
            type="button"
            onClick={onOpenChatbot}
            className="p-4 rounded-2xl liquid-tile flex items-center justify-between text-left group hover:border-indigo-500 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-700 transition">
                  Talk to ANVAYA Saathi (AI)
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  24x7 gentle companion in your language
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Next Check-in Notice Bar */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900">
                Next Check-in: In {resultData.recommendedCheckinDays} Days
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Confidential update via {userProfile.contactPreference.toUpperCase()}.
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Active Care Cadence
          </span>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveMainTab('meter')}
          className={`pb-3 px-5 text-xs font-extrabold transition border-b-2 flex items-center gap-2 ${
            activeMainTab === 'meter'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Dynamic Distress Meter & Score</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('activities')}
          className={`pb-3 px-5 text-xs font-extrabold transition border-b-2 flex items-center gap-2 ${
            activeMainTab === 'activities'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>Personalized Relaxing Activities</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('support')}
          className={`pb-3 px-5 text-xs font-extrabold transition border-b-2 flex items-center gap-2 ${
            activeMainTab === 'support'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Statutory Relief & Welfare Aid</span>
        </button>
      </div>

      {/* TAB 1: Dynamic Distress Meter */}
      {activeMainTab === 'meter' && (
        <DistressMeter result={resultData} />
      )}

      {/* TAB 2: Personalized Activities */}
      {activeMainTab === 'activities' && (
        <PersonalizedActivities
          currentLang={currentLang}
          resultData={resultData}
          onOpenCounsellorChat={onOpenObserverChat}
        />
      )}

      {/* TAB 3: Welfare & Support Aid */}
      {activeMainTab === 'support' && (
        <div className="space-y-3.5">
          <div className="liquid-tile p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                National SC/ST Atrocity Helpline (14566)
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                24x7 toll-free support for legal assistance, witness protection, and FIR follow-up under SC/ST Act.
              </p>
            </div>
            <a
              href="tel:14566"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition whitespace-nowrap shadow-xs"
            >
              Call 14566
            </a>
          </div>

          <div className="liquid-tile p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Interim Compensation & Relief Cell
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Track disbursement of statutory relief funds under Ministry of Social Justice guidelines.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenObserverView}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition whitespace-nowrap"
            >
              Track Status
            </button>
          </div>
        </div>
      )}

      {/* Bottom Footer Actions */}
      <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
        >
          ← Start New Check-in
        </button>

        <button
          type="button"
          onClick={onOpenObserverView}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition flex items-center justify-center gap-2 shadow-md shadow-slate-900/20"
        >
          <span>Open Health Observer Command Panel</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
