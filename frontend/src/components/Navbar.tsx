import React, { useState, useEffect } from 'react';
import {
  Shield,
  Heart,
  Activity,
  Globe,
  PhoneCall,
  AlertTriangle,
  Users,
  BarChart3,
  Sparkles,
  User,
  LogOut,
  Sliders,
  Radio,
  Eye,
  Menu,
  X,
  ChevronRight,
  Check
} from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

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

  const handleTabSelect = (tabId: NavTab) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  const handlePersonaSwitch = (role: 'citizen' | 'observer' | 'psychiatrist' | 'ngo' | 'admin') => {
    if (onSwitchPersona) {
      onSwitchPersona(role);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
      {/* Top Ministry Ribbon (Clean, compact on mobile, full on desktop) */}
      {currentUser && (
        <div className="bg-slate-950 text-slate-300 text-xs px-3 sm:px-6 py-1 border-b border-slate-800 font-medium">
          {/* Mobile view: ultra-compact single line */}
          <div className="flex sm:hidden items-center justify-between w-full">
            <div className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 text-[10px] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>MoSJE • GOVT OF INDIA</span>
            </div>
            <a
              href="tel:14566"
              className="flex items-center gap-1 text-emerald-400 font-black text-[10px] bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40"
            >
              <PhoneCall className="w-2.5 h-2.5 text-emerald-400" />
              <span>14566 (24x7)</span>
            </a>
          </div>

          {/* Desktop & Tablet view: rich metadata bar */}
          <div className="hidden sm:flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 text-[10px] font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>MoSJE • GOVT OF INDIA</span>
              </div>
              <span className="text-slate-300 font-bold hidden md:inline text-[11px]">
                Department of Social Justice & Empowerment
              </span>
              <span className="hidden xl:inline text-slate-500 text-[11px]">
                • SC/ST (PoA) Act Mental Health Safety Net
              </span>
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
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition ${
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
        </div>
      )}

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
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
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-all">
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
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Desktop Action Set (hidden on mobile, inside hamburger instead) */}
            {currentUser ? (
              <div className="hidden lg:flex items-center gap-2 sm:gap-2.5">
                {/* User Profile Badge */}
                <div className="flex items-center gap-2 bg-indigo-50/90 border border-indigo-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs flex-shrink-0">
                    {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
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
                    className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 font-black text-xs px-3 py-1.5 rounded-xl border border-rose-200 shadow-2xs transition cursor-pointer min-h-[40px]"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Logout</span>
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
                    <span className="text-[11px]">Aa</span>
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
                <div className="flex items-center bg-white rounded-xl px-2.5 py-1.5 border border-slate-200 shadow-2xs hover:border-indigo-300 transition min-h-[40px]">
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
              </div>
            ) : (
              /* Non-registered Desktop Actions */
              <div className="hidden lg:flex items-center gap-2">
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

            {/* Glowing SOS Button (Always visible on all screens: mobile, tablet, desktop) */}
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

            {/* Mobile/Tablet Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex lg:hidden min-w-[44px] min-h-[44px] items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 border border-slate-200 shadow-2xs transition cursor-pointer p-2.5"
              aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-rose-600" />
              ) : (
                <Menu className="w-5 h-5 text-slate-900" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          MOBILE SLIDE-OVER DRAWER (HAMBURGER MENU)
          ============================================================ */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-over Drawer Panel */}
          <div
            className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto border-l border-slate-200 animate-slideInRight"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-400 flex items-center justify-center text-white shadow-sm">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base text-slate-900">ANVAYA</span>
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                      अन्वय
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    MoSJE Mental Health Safety Net
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition cursor-pointer shadow-2xs"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="p-4 space-y-5 flex-1 overflow-y-auto">
              {/* User Profile Card */}
              {currentUser ? (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-slate-50 border border-indigo-100 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-black shadow-sm flex-shrink-0">
                      {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-slate-900 truncate">
                        {currentUser.full_name || currentUser.email}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 truncate">
                        {currentUser.email || 'Citizen User'}
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg text-[10px] font-black text-indigo-700 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{getRoleDisplayName()}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
                  <div className="text-xs font-black text-indigo-950">
                    Welcome to ANVAYA
                  </div>
                  <p className="text-[11px] text-indigo-900/80 font-medium">
                    Sign in to access personalized trauma tracking, statutory compensation milestones, and tele-counselling.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onOpenAuthModal) onOpenAuthModal('login');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-white text-indigo-700 font-extrabold text-xs border border-indigo-200 shadow-2xs text-center cursor-pointer min-h-[44px]"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onOpenAuthModal) onOpenAuthModal('register');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-xs text-center cursor-pointer min-h-[44px]"
                    >
                      Register
                    </button>
                  </div>
                </div>
              )}

              {/* SIH Evaluator Persona Switcher (Prominent for easy live evaluation) */}
              {onSwitchPersona && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>SIH Persona Fast-Switch</span>
                    </span>
                    <span className="text-indigo-600 font-bold">1-Click</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { id: 'citizen', label: '👤 Citizen / Survivor', desc: 'MADRS check-in & DBT milestones' },
                      { id: 'observer', label: '🛡️ District Observer', desc: 'L1–L4 caseload triage' },
                      { id: 'psychiatrist', label: '🩺 Telepsychiatrist', desc: 'Clinical review & telehealth' },
                      { id: 'ngo', label: '🤝 NGO Partner', desc: 'Field ground support' },
                      { id: 'admin', label: '🏛️ MoSJE Executive Admin', desc: 'National macro analytics' },
                    ].map((p) => {
                      const isCur = getPersonaKey() === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handlePersonaSwitch(p.id as any)}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer min-h-[44px] ${
                            isCur
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs font-extrabold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-black">{p.label}</div>
                            <div className="text-[10px] text-slate-500">{p.desc}</div>
                          </div>
                          {isCur && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Primary Role Navigation Tabs */}
              {currentUser && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Portal Navigation
                  </div>
                  <div className="space-y-1">
                    {navItems.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleTabSelect(tab.id)}
                          className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-black transition cursor-pointer min-h-[48px] ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                              : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200/70'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-600'}`} />
                            <span>{tab.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {tab.badge && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                            )}
                            <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white/80' : 'text-slate-400'}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rural & Emergency Safety Net Links */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Rural & Emergency Access
                </div>
                <div className="space-y-1.5">
                  {onOpenUssdSimulator && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenUssdSimulator();
                      }}
                      className="w-full p-3 rounded-xl bg-slate-900 hover:bg-black text-white flex items-center justify-between text-xs font-extrabold shadow-sm transition cursor-pointer min-h-[48px]"
                    >
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-emerald-400" />
                        <span>*14566# Rural 2G USSD Simulator</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                        Zero Internet
                      </span>
                    </button>
                  )}

                  <a
                    href="tel:14566"
                    className="w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 flex items-center justify-between text-xs font-extrabold shadow-2xs transition min-h-[48px]"
                  >
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-emerald-600" />
                      <span>24x7 MoSJE Helpline: 14566</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-black">
                      Toll-Free
                    </span>
                  </a>
                </div>
              </div>

              {/* Accessibility Settings */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Accessibility Suite</span>
                  </span>
                </div>

                {/* Text Scaling */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">Text Scale</span>
                  <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => changeFontScale('normal')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer min-h-[36px] ${
                        fontScale === 'normal' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700'
                      }`}
                    >
                      100%
                    </button>
                    <button
                      type="button"
                      onClick={() => changeFontScale('large')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer min-h-[36px] ${
                        fontScale === 'large' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700'
                      }`}
                    >
                      125%
                    </button>
                    <button
                      type="button"
                      onClick={() => changeFontScale('xlarge')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer min-h-[36px] ${
                        fontScale === 'xlarge' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700'
                      }`}
                    >
                      150%
                    </button>
                  </div>
                </div>

                {/* High Contrast Toggle */}
                <button
                  type="button"
                  onClick={toggleHighContrast}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer min-h-[40px] ${
                    highContrast
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>High Contrast Mode</span>
                  </span>
                  <span className="font-mono font-bold text-[11px]">{highContrast ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              {/* Language Selection Grid */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <Globe className="w-3 h-3 text-indigo-600" />
                  <span>Language / भाषा</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {languages.map((lang) => {
                    const isCur = currentLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => onLanguageChange(lang.code)}
                        className={`py-2 px-2 rounded-xl text-xs font-black transition text-center cursor-pointer min-h-[40px] border ${
                          isCur
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-2">
              {currentUser && onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer min-h-[48px]"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out of ANVAYA</span>
                </button>
              )}

              <div className="text-center text-[10px] text-slate-400 font-bold">
                MoSJE SC/ST (PoA) Act Safety Net • v1.0 Production
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
