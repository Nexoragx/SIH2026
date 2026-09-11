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
  CheckCircle2,
  Trash2,
  Settings
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
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
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
        setIsLangOpen(false);
        setIsProfileMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (accessibilityRef.current && !accessibilityRef.current.contains(e.target as Node)) {
        setIsAccessibilityOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Catch PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Fetch and Filter Notifications
  const loadNotifications = async () => {
    try {
      const clearedSet = new Set<string>(
        JSON.parse(localStorage.getItem('anvaya_cleared_notifications') || '[]')
      );
      const readSet = new Set<string>(
        JSON.parse(localStorage.getItem('anvaya_read_notifications') || '[]')
      );

      const res = await supportApi.getNotifications();
      let rawNotifs: NotificationItem[] = res?.notifications || [];

      // Check for locally broadcast notifications
      try {
        const latestLocal = localStorage.getItem('anvaya_latest_broadcast');
        if (latestLocal) {
          const parsed = JSON.parse(latestLocal);
          if (parsed && parsed.id && !rawNotifs.some((n) => n.id === parsed.id)) {
            rawNotifs.unshift(parsed);
          }
        }
      } catch {}

      // Filter out cleared notifications and apply local read overrides
      const filtered = rawNotifs
        .filter((n) => !clearedSet.has(n.id))
        .map((n) => (readSet.has(n.id) ? { ...n, is_read: true } : n));

      setNotifications(filtered);
      setUnreadCount(filtered.filter((n) => !n.is_read).length);
    } catch {
      // ignore silently if offline
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);

    const handleBroadcastReceived = (e: any) => {
      const newNotif = e?.detail;
      if (newNotif && newNotif.title) {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
        setUnreadCount((prev) => prev + 1);
      }
    };

    window.addEventListener('anvaya_broadcast_sent', handleBroadcastReceived);
    window.addEventListener('storage', loadNotifications);

    return () => {
      clearInterval(interval);
      window.removeEventListener('anvaya_broadcast_sent', handleBroadcastReceived);
      window.removeEventListener('storage', loadNotifications);
    };
  }, [currentUser]);

  const handleMarkAsRead = async (notifId: string) => {
    try {
      const readSet = new Set<string>(
        JSON.parse(localStorage.getItem('anvaya_read_notifications') || '[]')
      );
      readSet.add(notifId);
      localStorage.setItem('anvaya_read_notifications', JSON.stringify(Array.from(readSet)));

      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await supportApi.markNotificationRead(notifId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const readSet = new Set<string>(
        JSON.parse(localStorage.getItem('anvaya_read_notifications') || '[]')
      );
      notifications.forEach((n) => readSet.add(n.id));
      localStorage.setItem('anvaya_read_notifications', JSON.stringify(Array.from(readSet)));

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      await supportApi.markAllNotificationsRead();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearSingle = async (notifId: string) => {
    try {
      const clearedSet = new Set<string>(
        JSON.parse(localStorage.getItem('anvaya_cleared_notifications') || '[]')
      );
      clearedSet.add(notifId);
      localStorage.setItem('anvaya_cleared_notifications', JSON.stringify(Array.from(clearedSet)));

      setNotifications((prev) => {
        const next = prev.filter((n) => n.id !== notifId);
        setUnreadCount(next.filter((x) => !x.is_read).length);
        return next;
      });
      await supportApi.clearNotification(notifId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = async () => {
    try {
      const clearedSet = new Set<string>(
        JSON.parse(localStorage.getItem('anvaya_cleared_notifications') || '[]')
      );
      notifications.forEach((n) => clearedSet.add(n.id));
      localStorage.setItem('anvaya_cleared_notifications', JSON.stringify(Array.from(clearedSet)));

      setNotifications([]);
      setUnreadCount(0);
      await supportApi.clearAllNotifications();
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
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिन्दी', short: 'HI' },
    { code: 'bn', label: 'বাংলা', short: 'BN' },
    { code: 'ta', label: 'தமிழ்', short: 'TA' },
    { code: 'te', label: 'తెలుగు', short: 'TE' },
    { code: 'mr', label: 'मराठी', short: 'MR' },
  ];

  const currentLangObj = languages.find((l) => l.code === currentLang) || languages[0];

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

  // Strictly role-based navigation items with concise labels
  const getNavItems = (): NavItem[] => {
    if (isAdmin) {
      return [
        { id: 'admin', label: t.navExecutive || 'Executive', icon: Sparkles, highlight: true },
        { id: 'analytics', label: t.navAnalytics || 'Analytics', icon: BarChart3 },
        { id: 'observer', label: t.navOversight || 'Oversight', icon: Shield },
        { id: 'resources', label: t.navDirectory || 'Directory', icon: Globe },
      ];
    }
    if (isPsychiatrist) {
      return [
        { id: 'psychiatrist' as NavTab, label: t.navTelepsychiatry || 'Telepsychiatry', icon: Activity, highlight: true },
        { id: 'resources' as NavTab, label: t.navDirectory || 'Directory', icon: Globe },
      ];
    }
    if (isNgo) {
      return [
        { id: 'ngo' as NavTab, label: t.navNgo || 'Field Ops', icon: Users, highlight: true },
        { id: 'resources' as NavTab, label: t.navDirectory || 'Directory', icon: Globe },
      ];
    }
    if (isObserver) {
      return [
        { id: 'observer' as NavTab, label: 'Triage & Cases', icon: Shield, badge: true },
        { id: 'analytics' as NavTab, label: t.navAnalytics || 'Analytics', icon: BarChart3 },
        { id: 'resources' as NavTab, label: t.navDirectory || 'Directory', icon: Globe },
      ];
    }
    // Default: Citizen / Survivor
    return [
      { id: 'victim' as NavTab, label: t.navCare || 'Care & Wellbeing', icon: Heart },
      { id: 'resources' as NavTab, label: t.navDirectory || 'Helplines', icon: Globe },
    ];
  };

  const navItems = getNavItems();

  const getRoleDisplayName = () => {
    if (isAdmin) return 'Admin';
    if (isPsychiatrist) return 'Psychiatrist';
    if (isNgo) return 'NGO';
    if (isObserver) return 'Observer';
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
      {/* Sleek, Modern, Minimal Navbar Header */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/70 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 sm:h-16 gap-2 sm:gap-4">
            
            {/* 1. Left: Brand Logo & Title */}
            <div
              onClick={handleBrandClick}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none flex-shrink-0"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleBrandClick()}
            >
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Heart className="w-4.5 h-4.5 fill-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    ANVAYA
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                    अन्वय
                  </span>
                </div>
                <span className="text-[9px] font-medium text-slate-400 hidden xl:block leading-none">
                  MoSJE Mental Health Safety Net
                </span>
              </div>
            </div>

            {/* 2. Center: Sleek Role-Based Navigation Tabs (Desktop) */}
            {currentUser && (
              <nav className="hidden lg:flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shadow-2xs">
                {navItems.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white text-indigo-700 shadow-xs font-black'
                          : 'text-slate-600 hover:text-indigo-600 hover:bg-white/50'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse ml-0.5"></span>
                      )}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* 3. Right: Action Cluster */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Language Selector Dropdown (Desktop) */}
              <div className="relative hidden md:block" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
                  title="Change Language"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span>{currentLangObj.label}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLangOpen && (
                  <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white border border-slate-200 shadow-xl z-50 py-1 animate-fadeIn">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between font-bold hover:bg-indigo-50 cursor-pointer ${
                          currentLang === lang.code ? 'text-indigo-700 bg-indigo-50/50' : 'text-slate-700'
                        }`}
                      >
                        <span>{lang.label}</span>
                        {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Download / Install App Icon Button (Desktop) */}
              <button
                type="button"
                onClick={handleInstallApp}
                className="hidden sm:flex items-center justify-center w-8.5 h-8.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 text-xs font-bold transition shadow-2xs cursor-pointer group"
                title="Install Anvaya Chrome/Android App"
                aria-label="Install App"
              >
                <Download className="w-4 h-4 text-indigo-600 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              {/* Notification Bell with Badge & Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`relative flex items-center justify-center w-8.5 h-8.5 rounded-xl border text-xs font-bold transition cursor-pointer shadow-2xs ${
                    isNotificationsOpen
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Notifications & Resilience Quotes"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 text-slate-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center px-1 shadow-xs border-2 border-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Mobile Backdrop Overlay */}
                {isNotificationsOpen && (
                  <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[9998] sm:hidden"
                    onClick={() => setIsNotificationsOpen(false)}
                    aria-hidden="true"
                  />
                )}

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="fixed inset-x-3 top-16 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:inset-x-auto sm:mt-2 sm:w-92 p-0 rounded-2xl bg-white border border-slate-200 shadow-2xl z-[9999] animate-fadeIn overflow-hidden flex flex-col max-h-[82vh] sm:max-h-[480px]">
                    <div className="p-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-indigo-100/60 flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 leading-tight">Notifications</h4>
                          <p className="text-[10px] text-slate-500 font-semibold">{unreadCount} unread • {notifications.length} total</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-white/90 hover:bg-white px-2 py-0.5 rounded-md border border-indigo-200 transition cursor-pointer shadow-2xs"
                          >
                            Mark read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAll}
                            className="text-[10px] font-bold text-rose-700 hover:text-rose-900 bg-white/90 hover:bg-white px-1.5 py-0.5 rounded-md border border-rose-200 transition cursor-pointer shadow-2xs flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsNotificationsOpen(false)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-white/80 hover:bg-white text-slate-500 text-xs font-bold border border-slate-200 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-0 overscroll-contain">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs font-medium space-y-1">
                          <p className="text-lg">🌸</p>
                          <p className="font-bold text-slate-600">No new notifications</p>
                          <p className="text-[11px]">You're up to date with your resilience feed.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const isQuote = notif.category === 'QUOTE';
                          const isCheckin = notif.category === 'CHECKIN';
                          const isAlert = notif.category === 'ALERT';

                          return (
                            <div
                              key={notif.id}
                              className={`p-3 transition flex flex-col gap-1.5 group relative ${
                                notif.is_read ? 'bg-white' : 'bg-indigo-50/40 hover:bg-indigo-50/60'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded tracking-wider">
                                  {isQuote && <span className="text-pink-700 bg-pink-100 px-1.5 py-0.5 rounded">Quote 🌸</span>}
                                  {isCheckin && <span className="text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">Check-in 📋</span>}
                                  {isAlert && <span className="text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">Alert ⚠️</span>}
                                  {!isQuote && !isCheckin && !isAlert && (
                                    <span className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">Update 📢</span>
                                  )}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {!notif.is_read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block"></span>}
                                  <button
                                    type="button"
                                    onClick={() => handleClearSingle(notif.id)}
                                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded hover:bg-slate-100 transition cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <h5 className="text-xs font-bold text-slate-900 leading-snug">{notif.title}</h5>
                              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                                {notif.message}
                              </p>

                              <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 gap-2">
                                {notif.action_label && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleMarkAsRead(notif.id);
                                      setIsNotificationsOpen(false);
                                      onTabChange('victim');
                                    }}
                                    className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-0.5 cursor-pointer bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200"
                                  >
                                    <span>{notif.action_label}</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}

                                <div className="flex items-center gap-1.5 ml-auto">
                                  {!notif.is_read && (
                                    <button
                                      type="button"
                                      onClick={() => handleMarkAsRead(notif.id)}
                                      className="text-[10px] text-slate-400 hover:text-slate-700 font-bold cursor-pointer py-0.5 px-1.5 rounded hover:bg-slate-100"
                                    >
                                      Read
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleClearSingle(notif.id)}
                                    className="text-[10px] text-rose-500 hover:text-rose-700 font-bold cursor-pointer py-0.5 px-1.5 rounded hover:bg-rose-50"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Accessibility Aa Quick Toggle (Desktop) */}
              <div className="relative hidden sm:block" ref={accessibilityRef}>
                <button
                  type="button"
                  onClick={() => setIsAccessibilityOpen(!isAccessibilityOpen)}
                  className={`flex items-center justify-center w-8.5 h-8.5 rounded-xl border text-xs font-bold transition cursor-pointer shadow-2xs ${
                    isAccessibilityOpen || highContrast || fontScale !== 'normal'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Accessibility (Font Size, Contrast)"
                  aria-label="Accessibility Settings"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                </button>

                {isAccessibilityOpen && (
                  <div className="absolute right-0 mt-2 w-60 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 animate-fadeIn space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Accessibility</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAccessibilityOpen(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Text Size
                      </span>
                      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg">
                        {(['normal', 'large', 'xlarge'] as const).map((scale) => (
                          <button
                            key={scale}
                            type="button"
                            onClick={() => changeFontScale(scale)}
                            className={`py-1 text-[11px] font-bold rounded transition cursor-pointer ${
                              fontScale === scale ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                            }`}
                          >
                            {scale === 'normal' ? '100%' : scale === 'large' ? '125%' : '150%'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={toggleHighContrast}
                        className={`w-full py-1.5 px-2.5 rounded-lg border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                          highContrast
                            ? 'bg-black text-white border-black shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>High Contrast</span>
                        <span className="font-mono text-[10px] font-bold">{highContrast ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Streamlined User Profile Dropdown (Desktop) */}
              {currentUser ? (
                <div className="relative hidden lg:block" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 shadow-2xs transition cursor-pointer group"
                    aria-label="User profile menu"
                  >
                    <div className="w-6.5 h-6.5 rounded-lg bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center text-[11px] font-black shadow-xs flex-shrink-0">
                      {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-left flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 max-w-[90px] truncate">
                        {currentUser.full_name?.split(' ')[0] || currentUser.email?.split('@')[0] || 'User'}
                      </span>
                      <span className="text-[9px] font-bold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.2 rounded uppercase">
                        {getRoleDisplayName()}
                      </span>
                    </div>
                    <ChevronDown className={`w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Polished Floating User Menu Dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 p-2 animate-fadeIn space-y-1">
                      {/* User Info Header */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {currentUser.full_name || currentUser.email}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {currentUser.email || 'Citizen User'}
                        </div>
                        <div className="inline-flex items-center gap-1 bg-white border border-indigo-100 px-2 py-0.5 rounded text-[9px] font-extrabold text-indigo-700 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Role: {getRoleDisplayName()}</span>
                        </div>
                      </div>

                      {/* Quick Links inside Dropdown */}
                      <div className="pt-1 space-y-0.5">
                        {onOpenUssdSimulator && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              onOpenUssdSimulator();
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-between transition cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Radio className="w-3.5 h-3.5 text-emerald-600" />
                              <span>USSD Mode (*14566#)</span>
                            </span>
                            <span className="text-[9px] text-slate-400 font-semibold">2G</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            handleInstallApp();
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-between transition cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Download className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Install Chrome App</span>
                          </span>
                        </button>
                      </div>

                      {/* Sign Out Button in Dropdown */}
                      {onLogout && (
                        <div className="pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              onLogout();
                            }}
                            className="w-full px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5 text-rose-600" />
                            <span>{t.navLogout || 'Sign Out'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Unauthenticated Guest Actions (Desktop) */
                <div className="hidden lg:flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                    className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                  >
                    {t.navSignIn || 'Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    {t.navRegister || 'Register'}
                  </button>
                  {onOpenAdminLogin && (
                    <button
                      type="button"
                      onClick={onOpenAdminLogin}
                      className="text-slate-400 hover:text-amber-700 p-1.5 rounded-xl hover:bg-amber-50 transition cursor-pointer"
                      title="Staff Portal Login"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* 5. Emergency SOS Button (Compact & Crisp) */}
              {!isPsychiatrist && !isAdmin && (
                <button
                  type="button"
                  onClick={onTriggerCrisis}
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 active:scale-95 text-white px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-black shadow-xs shadow-rose-500/20 transition-all cursor-pointer"
                  title="Emergency Distress Support"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-black tracking-wide">{t.sosButton || 'SOS'}</span>
                </button>
              )}

              {/* Mobile / Tablet Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex lg:hidden w-8.5 h-8.5 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 border border-slate-200 shadow-2xs transition cursor-pointer"
                aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-4.5 h-4.5 text-rose-600" />
                ) : (
                  <Menu className="w-4.5 h-4.5 text-slate-900" />
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
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
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
                  className="w-8.5 h-8.5 flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer shadow-2xs"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4 text-slate-700" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* 1. User Profile or Auth CTA */}
                {currentUser ? (
                  <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs flex-shrink-0">
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
                    <div className="inline-flex items-center gap-1.5 bg-white border border-indigo-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-indigo-700 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Role: {getRoleDisplayName()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-950">Welcome to ANVAYA</span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                        Guest
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          if (onOpenAuthModal) onOpenAuthModal('login');
                        }}
                        className="py-2 px-3 rounded-xl bg-white text-indigo-700 font-bold text-xs border border-indigo-300 shadow-2xs text-center cursor-pointer flex items-center justify-center gap-1"
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
                        className="py-2 px-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs text-center cursor-pointer"
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
                        <span>Staff Login</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 2. Role-Based Navigation Items */}
                {currentUser && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
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
                            className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition cursor-pointer min-h-[40px] ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                                : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200/60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-600'}`} />
                              <span>{tab.label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {tab.badge && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                              )}
                              <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Emergency Support (24x7 MoSJE & USSD) */}
                {!isPsychiatrist && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                      Emergency Support
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href="tel:14566"
                        className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 flex flex-col justify-center text-xs font-bold transition"
                      >
                        <div className="flex items-center gap-1.5 text-emerald-700">
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>14566</span>
                        </div>
                        <span className="text-[9px] text-emerald-600 font-semibold">Toll-Free Helpline</span>
                      </a>

                      {onOpenUssdSimulator && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onOpenUssdSimulator();
                          }}
                          className="p-2.5 rounded-xl bg-slate-900 hover:bg-black text-white flex flex-col justify-center text-xs font-bold transition cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <Radio className="w-3.5 h-3.5" />
                            <span>*14566#</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-semibold">2G USSD Offline</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Language Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    <Globe className="w-3 h-3 text-indigo-600" />
                    <span>Language / भाषा</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {languages.map((lang) => {
                      const isCur = currentLang === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => onLanguageChange(lang.code)}
                          className={`py-1.5 px-1 rounded-lg text-xs font-bold transition text-center cursor-pointer border ${
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

                {/* 5. Accessibility Controls */}
                <div className="space-y-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Accessibility
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-600">Text Size</span>
                    <div className="flex gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                      {(['normal', 'large', 'xlarge'] as const).map((scale) => (
                        <button
                          key={scale}
                          type="button"
                          onClick={() => changeFontScale(scale)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded transition cursor-pointer ${
                            fontScale === scale ? 'bg-indigo-600 text-white' : 'text-slate-600'
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
                    className={`w-full py-1.5 px-2.5 rounded-lg border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      highContrast
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-slate-800 border-slate-200'
                    }`}
                  >
                    <span>High Contrast Mode</span>
                    <span className="font-mono text-[10px] font-bold">{highContrast ? 'ON' : 'OFF'}</span>
                  </button>
                </div>

                {/* 6. Install App CTA */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleInstallApp();
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-between text-xs font-bold transition cursor-pointer border border-slate-200/80"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-indigo-600" />
                    <span>Install Anvaya App</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Chrome/PWA</span>
                </button>
              </div>

              {/* Drawer Footer */}
              <div className="p-3 border-t border-slate-100 bg-slate-50/90 space-y-1.5 sticky bottom-0 z-10 backdrop-blur-md">
                {currentUser && onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                )}

                <div className="text-center text-[9px] text-slate-400 font-medium">
                  ANVAYA Platform • MoSJE Safety Net
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
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Heart className="w-8 h-8 fill-white text-white" />
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

