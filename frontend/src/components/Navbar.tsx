import React, { useState, useEffect } from 'react';
import { Shield, Heart, Activity, Globe, PhoneCall, AlertTriangle, Users, BarChart3, Sparkles, User, LogOut, ChevronDown, Sliders, Radio, Eye } from 'lucide-react';
import { translations } from '../utils/translations';
import { systemApi } from '../api';

export type NavTab = 'victim' | 'observer' | 'analytics' | 'resources' | 'psychiatrist' | 'ngo' | 'admin';

interface NavbarProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onTriggerCrisis: () => void;
  backendOnline?: boolean;
  currentUser?: any;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
  onLogout?: () => void;
  onSwitchPersona?: (role: 'citizen' | 'observer' | 'psychiatrist' | 'ngo' | 'admin') => void;
  onOpenUssdSimulator?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  activeTab,
  onTabChange,
  onTriggerCrisis,
  backendOnline,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onSwitchPersona,
  onOpenUssdSimulator,
}) => {
  const t = translations[currentLang] || translations.en;
  const [isOnline, setIsOnline] = useState<boolean>(backendOnline ?? false);

  useEffect(() => {
    if (backendOnline !== undefined) {
      setIsOnline(backendOnline);
      return;
    }
    let isMounted = true;
    const check = async () => {
      try {
        const res = await systemApi.checkHealth();
        if (isMounted) setIsOnline(res.status === 'healthy');
      } catch {
        if (isMounted) setIsOnline(false);
      }
    };
    check();
    const timer = setInterval(check, 15000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [backendOnline]);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'mr', label: 'मराठी' },
  ];

  // Accessibility Controls
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  const toggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    if (typeof document !== 'undefined') {
      if (next) {
        document.documentElement.classList.add('accessibility-high-contrast');
      } else {
        document.documentElement.classList.remove('accessibility-high-contrast');
      }
    }
  };

  const changeFontScale = (scale: 'normal' | 'large' | 'xlarge') => {
    setFontScale(scale);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('text-scale-normal', 'text-scale-large', 'text-scale-xlarge');
      document.documentElement.classList.add(`text-scale-${scale}`);
    }
  };

  // Role detection
  const userRole = (currentUser?.role || 'victim').toLowerCase();
  const isCitizen = userRole === 'victim' || userRole === 'citizen' || userRole === 'survivor';
  const isObserver = userRole.startsWith('observer');
  const isPsychiatrist = userRole === 'psychiatrist';
  const isNgo = userRole.startsWith('ngo');
  const isAdmin = userRole.startsWith('admin') || userRole.includes('secretary');

  interface NavItem {
    id: NavTab;
    label: string;
    icon: any;
    highlight?: boolean;
    badge?: boolean;
  }

  // Role-specific navigation items
  const getNavItems = (): NavItem[] => {
    if (isAdmin) {
      return [
        { id: 'admin', label: 'MoSJE Admin Panel', icon: Sparkles, highlight: true },
        { id: 'analytics', label: 'National Macro Analytics', icon: BarChart3 },
        { id: 'observer', label: 'District Oversight', icon: Shield },
        { id: 'resources', label: 'Statutory Directory', icon: Globe },
      ];
    }
    if (isPsychiatrist) {
      return [
        { id: 'psychiatrist' as NavTab, label: 'Telepsychiatry Workstation', icon: Activity, highlight: true },
        { id: 'observer' as NavTab, label: 'Clinical Caseload', icon: Shield },
        { id: 'resources' as NavTab, label: 'Helplines', icon: Globe },
      ];
    }
    if (isNgo) {
      return [
        { id: 'ngo' as NavTab, label: 'NGO Field Ops', icon: Users, highlight: true },
        { id: 'resources' as NavTab, label: 'Ground Directory', icon: Globe },
      ];
    }
    if (isObserver) {
      return [
        { id: 'observer' as NavTab, label: 'Caseload & Triage (L1–L4)', icon: Shield, badge: true },
        { id: 'analytics' as NavTab, label: 'District Analytics', icon: BarChart3 },
        { id: 'resources' as NavTab, label: 'Resource Network', icon: Globe },
      ];
    }
    // Default: Citizen / Survivor
    return [
      { id: 'victim' as NavTab, label: 'Care & Wellbeing', icon: Heart },
      { id: 'resources' as NavTab, label: 'Helplines & Legal Aid', icon: Globe },
    ];
  };

  const navItems = getNavItems();

  const getPersonaKey = () => {
    if (isAdmin) return 'admin';
    if (isPsychiatrist) return 'psychiatrist';
    if (isNgo) return 'ngo';
    if (isObserver) return 'observer';
    return 'citizen';
  };

  const getRoleDisplayName = () => {
    if (isAdmin) return 'MoSJE National Admin';
    if (isPsychiatrist) return 'Telepsychiatrist';
    if (isNgo) return 'NGO Field Partner';
    if (isObserver) return 'District Health Observer';
    return 'Citizen / Survivor';
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
      {/* Top Ministry Ribbon (Shown when authenticated) */}
      {currentUser && (
        <div className="bg-slate-950 text-slate-300 text-xs px-3 sm:px-6 py-1 flex flex-wrap justify-between items-center border-b border-slate-800 font-medium gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 text-[10px] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>MoSJE • GOVT OF INDIA</span>
            </div>
            <span className="text-slate-300 font-bold hidden md:inline text-[11px]">
              Department of Social Justice & Empowerment
            </span>
            <span className="hidden xl:inline text-slate-500 text-[11px]">• SC/ST (PoA) Act Mental Health Safety Net</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* SIH Evaluator Persona Switcher */}
            {onSwitchPersona && (
              <div className="flex items-center gap-1 bg-slate-900 border border-indigo-500/40 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-xs">
                <span className="text-indigo-300">Persona:</span>
                <select
                  value={getPersonaKey()}
                  onChange={(e) => onSwitchPersona(e.target.value as any)}
                  className="bg-transparent text-emerald-400 font-black outline-none cursor-pointer text-[10px]"
                  title="Switch persona instantly for SIH evaluation"
                  aria-label="Switch Persona"
                >
                  <option value="citizen" className="bg-slate-900 text-white">👤 Citizen / Survivor</option>
                  <option value="observer" className="bg-slate-900 text-white">🛡️ District Observer</option>
                  <option value="psychiatrist" className="bg-slate-900 text-white">🩺 Telepsychiatrist</option>
                  <option value="ngo" className="bg-slate-900 text-white">🤝 NGO Partner</option>
                  <option value="admin" className="bg-slate-900 text-white">🏛️ MoSJE Executive Admin</option>
                </select>
              </div>
            )}

            {/* Backend status */}
            <div
              className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition ${
                isOnline
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}
              title={isOnline ? 'FastAPI Backend Online & Synced' : 'Local Standalone Mode'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{isOnline ? 'FastAPI' : 'Local'}</span>
            </div>

            {/* 2G USSD Feature-Phone Launcher */}
            {onOpenUssdSimulator && (
              <button
                type="button"
                onClick={onOpenUssdSimulator}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition font-bold text-[10px] sm:text-[11px] bg-slate-900 px-2 sm:px-2.5 py-0.5 rounded-full border border-slate-700 shadow-xs cursor-pointer"
                title="Dial *14566# for rural feature phone access without internet"
              >
                <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
                <span>*14566# USSD</span>
              </button>
            )}

            {/* 24x7 Helpline */}
            <a
              href="tel:14566"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition font-bold text-[10px] sm:text-[11px] bg-emerald-950/80 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-xs"
            >
              <PhoneCall className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>14566 (24x7)</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Navbar Container - Optimized Mobile Ratio (56px h-14 mobile, 64px sm) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 sm:py-2">
        <div className="liquid-glass-panel rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-4 transition-all">
          {/* Brand Logo & Name */}
          <div
            onClick={() => {
              if (currentUser) {
                if (isAdmin) onTabChange('admin');
                else if (isPsychiatrist) onTabChange('psychiatrist');
                else if (isNgo) onTabChange('ngo');
                else if (isObserver) onTabChange('observer');
                else onTabChange('victim');
              }
            }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-all">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900">
                  ANVAYA
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-indigo-200">
                  अन्वय
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 hidden md:block">
                AI Mental Health & Distress Safeguarding • SIH-26094
              </p>
            </div>
          </div>

          {/* Desktop Center Navigation Tabs (Strictly divided by role) */}
          {currentUser && (
            <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 shadow-inner animate-fadeIn">
              {navItems.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                        : 'text-slate-700 hover:text-indigo-900 hover:bg-white/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Action Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {currentUser ? (
              <>
                {/* User Profile Badge */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-indigo-50/90 border border-indigo-200 rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs flex-shrink-0">
                    {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-[11px] font-black text-slate-900 leading-none truncate max-w-[110px]">
                      {currentUser.full_name || currentUser.email}
                    </div>
                    <div className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider mt-0.5">
                      {getRoleDisplayName()}
                    </div>
                  </div>
                </div>

                {/* Dedicated Prominent Logout Button */}
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 font-black text-xs px-2.5 sm:px-3 py-1.5 rounded-xl border border-rose-200 shadow-2xs transition cursor-pointer min-h-[40px]"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                )}

                {/* Accessibility Options Popover */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAccessibilityOpen(!isAccessibilityOpen)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer min-h-[40px] shadow-2xs ${
                      isAccessibilityOpen || highContrast || fontScale !== 'normal'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    title="Accessibility Options (Font Scale, High Contrast)"
                    aria-label="Accessibility Settings"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline text-[11px]">Aa</span>
                  </button>

                  {/* Accessibility Drawer / Popover */}
                  {isAccessibilityOpen && (
                    <div className="absolute right-0 mt-2 w-64 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl z-50 animate-fadeIn space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Accessibility Suite</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAccessibilityOpen(false)}
                          className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Font Size Scaling */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          Text Scaling
                        </span>
                        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => changeFontScale('normal')}
                            className={`py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                              fontScale === 'normal' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                            }`}
                          >
                            100%
                          </button>
                          <button
                            type="button"
                            onClick={() => changeFontScale('large')}
                            className={`py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                              fontScale === 'large' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                            }`}
                          >
                            125%
                          </button>
                          <button
                            type="button"
                            onClick={() => changeFontScale('xlarge')}
                            className={`py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                              fontScale === 'xlarge' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                            }`}
                          >
                            150%
                          </button>
                        </div>
                      </div>

                      {/* High Contrast Mode Toggle */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          Visual Clarity
                        </span>
                        <button
                          type="button"
                          onClick={toggleHighContrast}
                          className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                            highContrast
                              ? 'bg-black text-white border-black shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>High Contrast Mode</span>
                          <span className="font-mono font-bold">{highContrast ? 'ON' : 'OFF'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Language Selector */}
                <div className="flex items-center bg-white rounded-xl px-2 sm:px-2.5 py-1.5 border border-slate-200 shadow-2xs hover:border-indigo-300 transition min-h-[40px]">
                  <Globe className="w-3.5 h-3.5 text-indigo-600 mr-1 flex-shrink-0" />
                  <select
                    value={currentLang}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="bg-transparent text-xs font-black text-slate-800 outline-none cursor-pointer pr-1"
                    aria-label="Language Selector"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-white text-slate-900">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Immediate SOS Button - Mobile touch target >= 44px */}
                <button
                  onClick={onTriggerCrisis}
                  className="group relative flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 active:scale-95 text-white px-3 sm:px-3.5 py-2 rounded-xl text-xs font-black shadow-md shadow-rose-500/25 transition-all border border-rose-400/40 min-h-[44px] cursor-pointer"
                  title="Immediate Crisis Intervention & Emergency Calling"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline font-black">SOS Help</span>
                  <span className="sm:hidden font-black">SOS</span>
                </button>
              </>
            ) : (
              /* Non-registered / Logged out: Sign In and Register buttons */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                  className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-indigo-600 font-extrabold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl border border-slate-200 shadow-2xs transition cursor-pointer min-h-[44px]"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl shadow-xs transition cursor-pointer min-h-[44px]"
                >
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar - Optimized Touch Ratios (min-h-[44px], scrollable pill design) */}
        {currentUser && (
          <div className="flex lg:hidden overflow-x-auto py-1.5 gap-1.5 no-scrollbar mt-1 animate-fadeIn items-center">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition min-h-[44px] cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
