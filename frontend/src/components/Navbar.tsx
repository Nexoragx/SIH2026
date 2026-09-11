import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  ChevronDown,
  Check,
  Bell,
  Download,
  Smartphone,
  Laptop,
  CheckCircle2,
  Calendar,
  Quote
} from 'lucide-react';
import { translations } from '../utils/translations';
import { systemApi } from '../api';
import { supportApi, NotificationItem } from '../api/supportApi';

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
  onOpenAdminLogin?: () => void;
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
  onOpenAdminLogin,
  onLogout,
  onSwitchPersona,
  onOpenUssdSimulator,
}) => {
  const t = translations[currentLang] || translations.en;
  const [isOnline, setIsOnline] = useState<boolean>(backendOnline ?? false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const accessibilityRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

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

  // Close menus on Escape key & outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsAccessibilityOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (accessibilityRef.current && !accessibilityRef.current.contains(e.target as Node)) {
        setIsAccessibilityOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // PWA BeforeInstallPrompt listener
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Fetch Notifications
  const loadNotifications = async () => {
    try {
      const res = await supportApi.getNotifications();
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unread_count);
      }
    } catch {
      // ignore silently if offline
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 20000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleMarkAsRead = async (notifId: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await supportApi.markNotificationRead(notifId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInstallApp = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredInstallPrompt(null);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Backend status check
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

  // Strictly role-based navigation items
  const getNavItems = (): NavItem[] => {
    if (isAdmin) {
      return [
        { id: 'admin', label: 'Executive Panel', icon: Sparkles, highlight: true },
        { id: 'analytics', label: 'National Analytics', icon: BarChart3 },
        { id: 'observer', label: 'District Oversight', icon: Shield },
        { id: 'resources', label: 'Statutory Directory', icon: Globe },
      ];
    }
    if (isPsychiatrist) {
      return [
        { id: 'psychiatrist' as NavTab, label: 'Telepsychiatry Station', icon: Activity, highlight: true },
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
        { id: 'observer' as NavTab, label: 'Caseload & Triage', icon: Shield, badge: true },
        { id: 'analytics' as NavTab, label: 'District Analytics', icon: BarChart3 },
        { id: 'resources' as NavTab, label: 'Resource Network', icon: Globe },
      ];
    }
    // Default: Citizen / Survivor
    return [
      { id: 'victim' as NavTab, label: 'Care & Wellbeing', icon: Heart },
      { id: 'resources' as NavTab, label: 'Helplines & Directory', icon: Globe },
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
    if (isAdmin) return 'MoSJE Admin';
    if (isPsychiatrist) return 'Telepsychiatrist';
    if (isNgo) return 'NGO Partner';
    if (isObserver) return 'District Observer';
    return 'Citizen';
  };

  const handleTabSelect = (tabId: NavTab) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  const handleBrandClick = () => {
    if (currentUser) {
      if (isAdmin) onTabChange('admin');
      else if (isPsychiatrist) onTabChange('psychiatrist');
      else if (isNgo) onTabChange('ngo');
      else if (isObserver) onTabChange('observer');
      else onTabChange('victim');
    }
  };

  return (
    <>
      {/* Single Unified Modern Header */}
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
            
            {/* 1. Left: Brand Logo & Title */}
            <div
              onClick={handleBrandClick}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none flex-shrink-0"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleBrandClick()}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    ANVAYA
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-200/70">
                    अन्वय
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 hidden sm:block">
                  MoSJE Mental Health Safety Net
                </span>
              </div>
            </div>

            {/* 2. Center: Role-Based Navigation Tabs (Desktop only) */}
            {currentUser && (
              <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                {navItems.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 font-extrabold'
                          : 'text-slate-600 hover:text-indigo-600 hover:bg-white/80'
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

            {/* 3. Right: Action Cluster */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Language Selector (Desktop) */}
              <div className="hidden sm:flex items-center bg-slate-50 hover:bg-slate-100 rounded-xl px-2.5 py-1.5 border border-slate-200 text-xs font-bold text-slate-700 transition">
                <Globe className="w-3.5 h-3.5 text-indigo-600 mr-1.5 flex-shrink-0" />
                <select
                  value={currentLang}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
                  aria-label="Language Selector"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-white text-slate-900">
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Download / Install App Button (Desktop) */}
              <button
                type="button"
                onClick={handleInstallApp}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 hover:from-indigo-100 hover:to-purple-100 text-indigo-800 text-xs font-bold transition shadow-2xs cursor-pointer group"
                title="Download / Install Anvaya Chrome App"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600 group-hover:-translate-y-0.5 transition-transform" />
                <span>Download App</span>
              </button>

              {/* Notification Bell with Badge & Popover (Desktop) */}
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`relative flex items-center justify-center min-w-[38px] h-9 px-2 rounded-xl border text-xs font-bold transition cursor-pointer shadow-2xs ${
                    isNotificationsOpen
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Notifications & Resilience Quotes"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 text-slate-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center px-1 shadow-xs border-2 border-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 p-0 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 animate-fadeIn overflow-hidden">
                    <div className="p-3.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-rose-50 border-b border-indigo-100/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">Notifications & Daily Quotes</h4>
                          <p className="text-[10px] text-slate-500 font-semibold">{unreadCount} unread updates</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 rounded-md"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs font-medium">
                          No notifications right now.
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const isQuote = notif.category === 'QUOTE';
                          const isCheckin = notif.category === 'CHECKIN';
                          const isAlert = notif.category === 'ALERT';

                          return (
                            <div
                              key={notif.id}
                              className={`p-3.5 transition flex flex-col gap-1.5 ${
                                notif.is_read ? 'bg-white' : 'bg-indigo-50/40 hover:bg-indigo-50/60'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider">
                                  {isQuote && <span className="text-pink-700 bg-pink-100 px-1.5 py-0.5 rounded">Resilience Quote 🌸</span>}
                                  {isCheckin && <span className="text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">Health Check-in 📋</span>}
                                  {isAlert && <span className="text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">Safety Alert ⚠️</span>}
                                  {!isQuote && !isCheckin && !isAlert && (
                                    <span className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">Support Update 📢</span>
                                  )}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {!notif.is_read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block mr-1"></span>}
                                </span>
                              </div>

                              <h5 className="text-xs font-bold text-slate-900 leading-snug">{notif.title}</h5>
                              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                                {notif.message}
                              </p>

                              <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-100/80">
                                {notif.action_label && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleMarkAsRead(notif.id);
                                      setIsNotificationsOpen(false);
                                      if (notif.action_url?.includes('tab=exercises')) {
                                        onTabChange('victim');
                                      } else if (notif.action_url?.includes('tab=assessment')) {
                                        onTabChange('victim');
                                      } else if (notif.action_url?.includes('tab=helplines')) {
                                        onTabChange('victim');
                                      } else {
                                        onTabChange('victim');
                                      }
                                    }}
                                    className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-indigo-50 px-2 py-1 rounded-md"
                                  >
                                    <span>{notif.action_label}</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}

                                {!notif.is_read && (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAsRead(notif.id)}
                                    className="text-[10px] text-slate-400 hover:text-slate-700 font-bold ml-auto cursor-pointer"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Accessibility Menu Toggle (Desktop) */}
              <div className="relative hidden sm:block" ref={accessibilityRef}>
                <button
                  type="button"
                  onClick={() => setIsAccessibilityOpen(!isAccessibilityOpen)}
                  className={`flex items-center justify-center min-w-[38px] h-9 px-2 rounded-xl border text-xs font-bold transition cursor-pointer shadow-2xs ${
                    isAccessibilityOpen || highContrast || fontScale !== 'normal'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Accessibility Settings (Font Size, Contrast)"
                  aria-label="Accessibility Settings"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="ml-1 text-[11px]">Aa</span>
                </button>

                {/* Accessibility Dropdown Popover */}
                {isAccessibilityOpen && (
                  <div className="absolute right-0 mt-2 w-64 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl z-50 animate-fadeIn space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Accessibility Options</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAccessibilityOpen(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Text Scaling */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Text Size
                      </span>
                      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                        {(['normal', 'large', 'xlarge'] as const).map((scale) => (
                          <button
                            key={scale}
                            type="button"
                            onClick={() => changeFontScale(scale)}
                            className={`py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                              fontScale === scale ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                            }`}
                          >
                            {scale === 'normal' ? '100%' : scale === 'large' ? '125%' : '150%'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* High Contrast */}
                    <div>
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
                        <span className="font-mono text-[11px] font-bold">{highContrast ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Authenticated User Status & Logout (Desktop) */}
              {currentUser ? (
                <div className="hidden lg:flex items-center gap-2">
                  {/* User Profile Pill */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center text-[10px] font-black shadow-xs flex-shrink-0">
                      {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] font-bold text-slate-900 leading-tight truncate max-w-[100px]">
                        {currentUser.full_name || currentUser.email}
                      </div>
                      <div className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">
                        {getRoleDisplayName()}
                      </div>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-2 rounded-xl border border-rose-200 shadow-2xs transition cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Logout</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Unauthenticated Actions (Desktop) */
                <div className="hidden lg:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                    className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-indigo-600 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition cursor-pointer"
                  >
                    <span>Register</span>
                  </button>
                  {onOpenAdminLogin && (
                    <button
                      type="button"
                      onClick={onOpenAdminLogin}
                      className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs px-3 py-2 rounded-xl border border-amber-200 transition cursor-pointer"
                      title="Administrative Staff Portal"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-700" />
                      <span>Admin</span>
                    </button>
                  )}
                </div>
              )}

              {/* Emergency SOS Button (Compact, visible for citizens and guests) */}
              {!isPsychiatrist && !isAdmin && (
                <button
                  type="button"
                  onClick={onTriggerCrisis}
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 active:scale-95 text-white px-3 sm:px-3.5 py-2 rounded-xl text-xs font-black shadow-sm shadow-rose-500/25 transition-all border border-rose-400/30 cursor-pointer"
                  title="Immediate Crisis Intervention & Helplines"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline font-black">SOS</span>
                  <span className="sm:hidden font-black">SOS</span>
                </button>
              )}

              {/* Mobile / Tablet Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex lg:hidden w-10 h-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 border border-slate-200 shadow-2xs transition cursor-pointer"
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
      </header>

      {/* ============================================================
          MOBILE SLIDE-OVER DRAWER (HAMBURGER MENU)
          Portaled to document.body for optimal mobile layering
          ============================================================ */}
      {isMobileMenuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9999] lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-over Panel */}
            <aside
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white shadow-2xl z-[10000] flex flex-col justify-between overflow-y-auto border-l border-slate-200 animate-slideInRight"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-400 flex items-center justify-center text-white shadow-xs">
                    <Heart className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-base text-slate-900">ANVAYA</span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                        अन्वय
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500">
                      Mental Health Safety Net
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer shadow-2xs"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4 text-slate-700" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* 1. User Profile or Auth CTA */}
                {currentUser ? (
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-black shadow-xs flex-shrink-0">
                        {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {currentUser.full_name || currentUser.email}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {currentUser.email || 'Citizen User'}
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg text-[10px] font-bold text-indigo-700 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Role: {getRoleDisplayName()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-950">Welcome to ANVAYA</span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                        Guest
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Confidential psychological monitoring, distress safeguarding, and 24x7 crisis support.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          if (onOpenAuthModal) onOpenAuthModal('login');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-white text-indigo-700 font-bold text-xs border border-indigo-300 shadow-2xs text-center cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Sign In</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          if (onOpenAuthModal) onOpenAuthModal('register');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs text-center cursor-pointer"
                      >
                        Register
                      </button>
                    </div>
                    {onOpenAdminLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenAdminLogin();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold text-center cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-700" />
                        <span>Administrative Staff Login</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 2. Role-Based Navigation Items */}
                {currentUser && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                      Navigation
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
                            className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-bold transition cursor-pointer min-h-[44px] ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
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

                {/* 3. Download App / PWA Button in Mobile */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleInstallApp();
                    }}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-between text-xs font-black shadow-md shadow-indigo-500/20 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                        <Download className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-black">Download Anvaya App</div>
                        <div className="text-[10px] text-white/80 font-medium">Install Chrome / Android App</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black bg-white text-indigo-900 px-2 py-0.5 rounded-full">
                      Install
                    </span>
                  </button>
                </div>

                {/* 4. Helplines & Emergency (for victims/guests) */}
                {!isPsychiatrist && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                      Emergency Support
                    </div>
                    <div className="space-y-1.5">
                      <a
                        href="tel:14566"
                        className="w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 flex items-center justify-between text-xs font-bold transition min-h-[44px]"
                      >
                        <div className="flex items-center gap-2">
                          <PhoneCall className="w-4 h-4 text-emerald-600" />
                          <span>24x7 MoSJE Helpline: 14566</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-black">
                          Toll-Free
                        </span>
                      </a>

                      {onOpenUssdSimulator && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onOpenUssdSimulator();
                          }}
                          className="w-full p-3 rounded-xl bg-slate-900 hover:bg-black text-white flex items-center justify-between text-xs font-bold shadow-2xs transition cursor-pointer min-h-[44px]"
                        >
                          <div className="flex items-center gap-2">
                            <Radio className="w-4 h-4 text-emerald-400" />
                            <span>*14566# USSD Mode</span>
                          </div>
                          <span className="text-[10px] text-emerald-300 bg-slate-800 px-2 py-0.5 rounded">
                            2G Offline
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. Language Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
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
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition text-center cursor-pointer min-h-[38px] border ${
                            isCur
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {lang.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Accessibility Controls */}
                <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Accessibility Controls
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Text Scale</span>
                    <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200">
                      {(['normal', 'large', 'xlarge'] as const).map((scale) => (
                        <button
                          key={scale}
                          type="button"
                          onClick={() => changeFontScale(scale)}
                          className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                            fontScale === scale ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-700'
                          }`}
                        >
                          {scale === 'normal' ? '100%' : scale === 'large' ? '125%' : '150%'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleHighContrast}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      highContrast
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>High Contrast Mode</span>
                    </span>
                    <span className="font-mono text-[11px] font-bold">{highContrast ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/90 space-y-2 sticky bottom-0 z-10 backdrop-blur-md">
                {currentUser && onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                )}

                <div className="text-center text-[10px] text-slate-400 font-medium">
                  ANVAYA Platform • MoSJE SC/ST Safety Net
                </div>
              </div>
            </aside>
          </div>,
          document.body
        )}

      {/* PWA Install Modal */}
      {isInstallModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden animate-scaleUp">
              <button
                type="button"
                onClick={() => setIsInstallModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Heart className="w-9 h-9 fill-white text-white" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900">Install Anvaya Chrome App</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Get 1-click home screen access, fast offline crisis safeguarding, and private check-ins.
                  </p>
                </div>

                <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-3">
                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Chrome Desktop / Mac:</span>
                      <p className="text-slate-600 font-medium text-[11px]">
                        Click the <span className="font-bold text-indigo-700">Install icon (⊕ or ⬇)</span> in your Chrome address bar or Menu (⋮) → <span className="font-bold text-slate-800">"Save and share" → "Install Anvaya"</span>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Android / Mobile Chrome:</span>
                      <p className="text-slate-600 font-medium text-[11px]">
                        Tap Chrome Menu (⋮) → <span className="font-bold text-slate-800">"Add to Home screen"</span> or <span className="font-bold text-slate-800">"Install app"</span>.
                      </p>
                    </div>
                  </div>
                </div>

                {deferredInstallPrompt && (
                  <button
                    type="button"
                    onClick={async () => {
                      deferredInstallPrompt.prompt();
                      const res = await deferredInstallPrompt.userChoice;
                      if (res.outcome === 'accepted') {
                        setIsInstallModalOpen(false);
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-black text-xs shadow-md shadow-indigo-500/20 hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install "Anvaya" Directly Now</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsInstallModalOpen(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer pt-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

