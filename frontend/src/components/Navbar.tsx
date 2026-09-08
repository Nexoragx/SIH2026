import React from 'react';
import { Shield, Heart, Activity, Globe, PhoneCall, AlertTriangle, Users, BarChart3, Sparkles } from 'lucide-react';
import { translations } from '../utils/translations';

interface NavbarProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  activeTab: 'victim' | 'observer' | 'analytics' | 'resources';
  onTabChange: (tab: 'victim' | 'observer' | 'analytics' | 'resources') => void;
  onTriggerCrisis: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  activeTab,
  onTabChange,
  onTriggerCrisis,
}) => {
  const t = translations[currentLang] || translations.en;

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'mr', label: 'मराठी' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all bg-white">
      {/* Top Ministry Ribbon */}
      <div className="bg-slate-950 text-slate-300 text-xs px-4 sm:px-8 py-1.5 flex flex-wrap justify-between items-center border-b border-slate-800 font-medium">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 text-[10px] font-extrabold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>MoSJE • GOVT OF INDIA</span>
          </div>
          <span className="text-slate-300 font-semibold hidden md:inline">
            Department of Social Justice & Empowerment
          </span>
          <span className="hidden lg:inline text-slate-500">• SC/ST (PoA) Act Mental Health Safety Net</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="tel:14566"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition font-bold text-[11px] bg-emerald-950/80 px-3 py-0.5 rounded-full border border-emerald-500/40 shadow-xs"
          >
            <PhoneCall className="w-3 h-3" />
            <span>NHAA Helpline: 14566 (24x7)</span>
          </a>
        </div>
      </div>

      {/* Main Liquid Glass Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="liquid-glass-panel rounded-2xl px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4 transition-all">
          {/* Brand Logo & Name */}
          <div
            onClick={() => onTabChange('victim')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 group-hover:scale-105 group-hover:rotate-2 transition-all">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  ANVAYA
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 font-sans">
                  अन्वय
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 hidden sm:block">
                AI Dynamic Mental Health & Distress Monitoring • SIH-26094
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Liquid Glass Pills) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
            <button
              onClick={() => onTabChange('victim')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'victim'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-700 hover:text-indigo-900 hover:bg-white/80'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Victim Portal</span>
            </button>

            <button
              onClick={() => onTabChange('observer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all relative ${
                activeTab === 'observer'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-700 hover:text-indigo-900 hover:bg-white/80'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Observer Panel</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </button>

            <button
              onClick={() => onTabChange('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-700 hover:text-indigo-900 hover:bg-white/80'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>MoSJE Analytics</span>
            </button>

            <button
              onClick={() => onTabChange('resources')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'resources'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-700 hover:text-indigo-900 hover:bg-white/80'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>NGO Network</span>
            </button>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="flex items-center bg-white rounded-xl px-3 py-1.5 border border-slate-200 shadow-xs hover:border-indigo-300 transition">
              <Globe className="w-3.5 h-3.5 text-indigo-600 mr-1.5 flex-shrink-0" />
              <select
                value={currentLang}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-slate-800 outline-none cursor-pointer pr-1"
                aria-label="Language Selector"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-white text-slate-900">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Glowing Immediate SOS Button */}
            <button
              onClick={onTriggerCrisis}
              className="group relative flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-lg shadow-rose-500/30 transition-all border border-rose-400/40"
              title="Immediate Crisis Intervention & Emergency Calling"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SOS Help</span>
              <span className="sm:hidden">SOS</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 no-scrollbar mt-1">
          <button
            onClick={() => onTabChange('victim')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'victim'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 shadow-xs'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Victim Portal
          </button>
          <button
            onClick={() => onTabChange('observer')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'observer'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 shadow-xs'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Observer
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 shadow-xs'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
          <button
            onClick={() => onTabChange('resources')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
              activeTab === 'resources'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 shadow-xs'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            NGOs
          </button>
        </div>
      </div>
    </header>
  );
};
