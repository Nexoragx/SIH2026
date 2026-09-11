import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Stethoscope,
  BadgeCheck,
  Building2,
  KeyRound,
} from 'lucide-react';
import { authApi, RegisterPayload, LoginPayload, psychiatristApi } from '../../api';
import { auth, googleProvider, signInWithPopup } from '../../firebase';
import { CitizenOnboardingModal } from './CitizenOnboardingModal';
import { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  initialMode?: 'login' | 'register';
  currentLang?: string;
  onLanguageChange?: (lang: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
  currentLang = 'en',
  onLanguageChange = () => {},
}) => {
  const [tab, setTab] = useState<'citizen' | 'psychiatrist' | 'register'>(
    initialMode === 'register' ? 'register' : 'citizen'
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [showDoctorPassword, setShowDoctorPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Citizen Form State
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [district, setDistrict] = useState<string>('Nashik');
  const [state, setState] = useState<string>('Maharashtra');

  // Psychiatrist Form State
  const [doctorId, setDoctorId] = useState<string>('DOC-ANITA-101');
  const [doctorPassword, setDoctorPassword] = useState<string>('PsyPassword123!');

  // Firebase Google Onboarding Wizard State
  const [onboardingGoogleUser, setOnboardingGoogleUser] = useState<{
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
  } | null>(null);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState<boolean>(false);

  if (!isOpen) return null;

  // Firebase Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      setErrorMsg(null);
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        // 1. Check if citizen profile already exists in persistent storage
        try {
          const storedProfiles = JSON.parse(localStorage.getItem('anvaya_citizen_profiles') || '{}');
          if (storedProfiles[user.uid]) {
            const profile = storedProfiles[user.uid];
            const userObj = {
              id: profile.id || `CITIZEN-${user.uid.slice(-6).toUpperCase()}`,
              full_name: profile.name || user.displayName || 'Citizen Survivor',
              email: user.email || 'citizen@anvaya.gov.in',
              role: 'victim',
              phone: profile.phone || '',
              district: profile.district || 'Nashik',
              state: profile.state || 'Maharashtra',
              photoURL: user.photoURL || undefined,
              language: profile.language || currentLang || 'en',
              caseCategory: profile.caseCategory || 'caste_violence',
              caseNumber: profile.caseNumber || '',
            };
            const idToken = await user.getIdToken().catch(() => undefined);
            authApi.saveLocalSession(userObj, idToken);
            setSuccessMsg(`Welcome back to ANVAYA, ${userObj.full_name}!`);
            setTimeout(() => {
              onAuthSuccess(userObj);
              onClose();
            }, 500);
            return;
          }
        } catch (e) {
          console.warn('Error reading stored profile:', e);
        }

        // 2. Open step-by-step onboarding wizard for first-time Google sign-in
        setOnboardingGoogleUser({
          uid: user.uid,
          displayName: user.displayName || 'Citizen Survivor',
          email: user.email || 'citizen@anvaya.gov.in',
          photoURL: user.photoURL || undefined,
        });
        setShowOnboardingWizard(true);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google Sign-In window was closed. Please try again or sign in with email.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Popup was blocked by your browser. Please allow popups for this site.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Another sign-in window was opened.');
      } else {
        setErrorMsg(err.message || 'Google Sign-In failed. You can also sign in with email/password.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Complete onboarding from Google Wizard
  const handleOnboardingComplete = (profile: UserProfile & { email: string; photoURL?: string }) => {
    setShowOnboardingWizard(false);
    setOnboardingGoogleUser(null);

    const userObj = {
      id: profile.id,
      full_name: profile.name,
      email: profile.email,
      role: 'victim',
      phone: profile.phone,
      district: profile.district,
      state: profile.state,
      photoURL: profile.photoURL,
      language: profile.language,
      caseCategory: profile.caseCategory,
      caseNumber: profile.caseNumber,
    };

    authApi.saveLocalSession(userObj);

    setSuccessMsg(`Onboarding complete! Welcome to ANVAYA, ${profile.name}.`);
    setTimeout(() => {
      onAuthSuccess(userObj);
      onClose();
    }, 600);
  };

  // Citizen Submit (Login or Register)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === 'register') {
        const payload: RegisterPayload = {
          email: email.trim().toLowerCase(),
          password,
          full_name: fullName.trim(),
          confirm_password: confirmPassword,
          role: 'victim', // Strictly citizen/victim; doctor signup is disallowed
          phone: phone.trim() || undefined,
          district: district.trim() || undefined,
          state: state.trim() || undefined,
        };

        const res = await authApi.register(payload);
        setSuccessMsg('Account created successfully. Your care session is ready.');
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 800);
      } else {
        const payload: LoginPayload = {
          email: email.trim().toLowerCase(),
          password,
        };

        const res = await authApi.login(payload);
        setSuccessMsg('Logged in successfully!');
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 600);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const detail = err.detail || err.error || 'Authentication failed. Please check your credentials.';
      setErrorMsg(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  };

  // Psychiatrist Doctor ID Login Submit
  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (!doctorId.trim()) {
        setErrorMsg('Please enter your assigned Doctor ID (e.g. DOC-ANITA-101).');
        setLoading(false);
        return;
      }

      const res = await psychiatristApi.doctorLogin(doctorId.trim(), doctorPassword);
      authApi.saveLocalSession(res.user, res.access_token, res.refresh_token);
      setSuccessMsg(`Verified: ${res.user.full_name} (${res.user.doctor_id || doctorId}). Opening Telepsychiatry Workstation...`);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Doctor Auth error:', err);
      const detail = err.detail || err.error || 'Doctor authentication failed. Please check your Doctor ID and password.';
      setErrorMsg(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  };

  const handleInstantLogin = async (demoType: 'citizen' | 'observer' | 'psychiatrist' | 'ngo' | 'admin') => {
    setErrorMsg(null);
    setLoading(true);
    fillDemoAccount(demoType);
    const credentials = demoCredentials[demoType];
    try {
      const res = await authApi.login(credentials);
      setSuccessMsg(`Logged in as ${res.user.full_name}.`);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.detail || 'Demo account could not be authenticated.');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials: Record<'citizen' | 'observer' | 'psychiatrist' | 'ngo' | 'admin', LoginPayload> = {
    citizen: { email: 'survivor.demo@sih.gov.in', password: 'Password123!' },
    observer: { email: 'observer.district@sih.gov.in', password: 'ObserverPassword123!' },
    psychiatrist: { email: 'psychiatrist@sih.gov.in', password: 'PsyPassword123!' },
    ngo: { email: 'ngo.partner@sih.gov.in', password: 'NgoPassword123!' },
    admin: { email: 'admin.mosje@sih.gov.in', password: 'AdminPassword123!' },
  };

  const fillDemoAccount = (demoType: 'citizen' | 'observer' | 'psychiatrist' | 'ngo' | 'admin') => {
    setErrorMsg(null);
    if (demoType === 'citizen') {
      setEmail('survivor.demo@sih.gov.in');
      setPassword('Password123!');
      setFullName('Courageous Survivor');
      setDistrict('Nashik');
      setState('Maharashtra');
    } else if (demoType === 'observer') {
      setEmail('observer.district@sih.gov.in');
      setPassword('ObserverPassword123!');
      setFullName('Dr. Anita Joshi (District Nodal Officer)');
      setDistrict('Nashik');
      setState('Maharashtra');
    } else if (demoType === 'psychiatrist') {
      setEmail('psychiatrist@sih.gov.in');
      setPassword('PsyPassword123!');
      setDoctorId('DOC-ANITA-101');
      setDoctorPassword('PsyPassword123!');
    } else if (demoType === 'ngo') {
      setEmail('ngo.partner@sih.gov.in');
      setPassword('NgoPassword123!');
      setFullName('Ram Kumar (NGO Field Coordinator)');
      setDistrict('Nashik');
      setState('Maharashtra');
    } else if (demoType === 'admin') {
      setEmail('admin.mosje@sih.gov.in');
      setPassword('AdminPassword123!');
      setFullName('Shri Rajesh Meena (Joint Secretary, MoSJE)');
      setDistrict('New Delhi');
      setState('Delhi');
    }
  };

  const fillDoctorDemo = (id: string, pwd: string = 'PsyPassword123!') => {
    setDoctorId(id);
    setDoctorPassword(pwd);
    setErrorMsg(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
        <div className="liquid-glass-panel rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl relative overflow-hidden bg-white/95 border border-slate-200 max-h-[92vh] overflow-y-auto">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Header Badge */}
          <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-xs uppercase tracking-wider mb-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Secure ANVAYA Tele-MANAS Portal</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">
            {tab === 'citizen' && 'Citizen & Official Sign In'}
            {tab === 'psychiatrist' && 'Psychiatrist Workstation'}
            {tab === 'register' && 'Create Citizen Account'}
          </h3>
          <p className="text-xs text-slate-600 mb-4 font-medium leading-relaxed">
            {tab === 'citizen' && 'Sign in to access your confidential care records and personalized support.'}
            {tab === 'psychiatrist' && 'Registered Tele-MANAS psychiatrists: Enter your Doctor ID and password to access clinical notifications.'}
            {tab === 'register' && 'Register securely for confidential mental health support and trauma monitoring.'}
          </p>

          {/* 3-Tab Section Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 border border-slate-200 gap-1">
            <button
              type="button"
              onClick={() => {
                setTab('citizen');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer text-center ${
                tab === 'citizen'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Citizen Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('psychiatrist');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                tab === 'psychiatrist'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-700 hover:text-indigo-900 bg-indigo-50/50'
              }`}
            >
              <Stethoscope className="w-3 h-3" />
              <span>Psychiatrist</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer text-center ${
                tab === 'register'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Alert Notifications */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
              <span className="font-semibold leading-snug">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          {/* TAB 1 & 3: CITIZEN LOGIN & REGISTER */}
          {(tab === 'citizen' || tab === 'register') && (
            <>
              {/* Primary OAuth Action: Firebase Google Sign-In */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 active:scale-[0.98] border-2 border-slate-200 hover:border-indigo-400 text-slate-800 font-extrabold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{tab === 'citizen' ? 'Sign in with Google' : 'Sign up with Google'}</span>
                </button>

                <div className="relative flex items-center justify-center my-3.5">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="bg-white px-3 text-[10px] uppercase font-black text-slate-400 absolute">
                    or continue with email
                  </span>
                </div>
              </div>

              {tab === 'citizen' && (
                /* 1-Click Instant Demo Login Buttons for Evaluators */
                <div className="mb-4 p-3 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-100 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>SIH Evaluator 1-Click Quick Access</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleInstantLogin('citizen')}
                      className="py-2 px-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-200 text-slate-900 font-black text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <span>👤 Instant Citizen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInstantLogin('observer')}
                      className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <span>🛡️ Instant Observer</span>
                    </button>
                  </div>
                </div>
              )}

              {tab === 'register' && (
                /* Statutory Regulation Notice: No Doctor Signups Allowed */
                <div className="mb-4 p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2.5 shadow-xs">
                  <Shield className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-amber-950">Statutory Notice: Doctor Registration Disabled</span>
                    <span className="text-amber-800">
                      Under Ministry of Health & Family Welfare regulations, medical doctors and telepsychiatrists cannot self-register online. All official psychiatrists must log in via the <strong>Psychiatrist</strong> tab using their assigned Doctor ID.
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {tab === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {tab === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter your password"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          aria-label="Show or hide confirmation password"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Account Role
                      </label>
                      <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 flex items-center justify-between">
                        <span>👤 Citizen / Atrocity Survivor</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 font-extrabold px-2 py-0.5 rounded-full">
                          Public Enrollment
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          District
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            placeholder="e.g. Nashik"
                            className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="e.g. Maharashtra"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 min-h-[44px]"
                >
                  {loading ? (
                    <span className="inline-block animate-spin">⏳</span>
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span>
                    {loading
                      ? 'Processing Authentication...'
                      : tab === 'citizen'
                      ? 'Sign In with Email'
                      : 'Create Account with Email'}
                  </span>
                </button>
              </form>
            </>
          )}

          {/* TAB 2: PSYCHIATRIST LOGIN (DOCTOR ID & PASSWORD) */}
          {tab === 'psychiatrist' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50/90 border border-indigo-200 text-indigo-950 flex items-start gap-3 shadow-xs">
                <Stethoscope className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-indigo-950">Tele-MANAS Doctor Authentication</h4>
                  <p className="text-[11px] text-indigo-800/90 leading-relaxed mt-0.5">
                    Sign in with your state health department issued <strong>Doctor ID</strong> (e.g. DOC-ANITA-101) to review victim triage alerts and consultation notifications.
                  </p>
                </div>
              </div>

              <form onSubmit={handleDoctorSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Doctor ID / Registration ID
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value.toUpperCase())}
                      placeholder="e.g. DOC-ANITA-101"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-indigo-200 text-xs font-bold font-mono tracking-wider text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Issued by Tele-MANAS Cell / Ministry of Health
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showDoctorPassword ? 'text' : 'password'}
                      required
                      value={doctorPassword}
                      onChange={(e) => setDoctorPassword(e.target.value)}
                      placeholder="Enter doctor workstation password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDoctorPassword(!showDoctorPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showDoctorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 active:scale-[0.98] text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3 min-h-[44px]"
                >
                  {loading ? (
                    <span className="inline-block animate-spin">⏳</span>
                  ) : (
                    <Stethoscope className="w-4 h-4" />
                  )}
                  <span>
                    {loading ? 'Verifying Doctor Credentials...' : 'Sign In with Doctor ID'}
                  </span>
                </button>
              </form>

              {/* Pre-Registered Doctor Quick Fill for Evaluators */}
              <div className="pt-3 border-t border-slate-200">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2 text-center">
                  Select Pre-Registered Tele-MANAS Psychiatrist
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDoctorDemo('DOC-ANITA-101')}
                    className={`p-2 rounded-xl border text-left transition text-xs cursor-pointer ${
                      doctorId === 'DOC-ANITA-101'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="font-bold text-[11px]">Dr. Anita Joshi, MD</div>
                    <div className="text-[10px] text-slate-500 font-mono">DOC-ANITA-101 (Nashik)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDoctorDemo('DOC-DESHMUKH-202')}
                    className={`p-2 rounded-xl border text-left transition text-xs cursor-pointer ${
                      doctorId === 'DOC-DESHMUKH-202'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="font-bold text-[11px]">Dr. Vivek Deshmukh</div>
                    <div className="text-[10px] text-slate-500 font-mono">DOC-DESHMUKH-202 (NIMHANS)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDoctorDemo('DOC-MEENAKSHI-303')}
                    className={`p-2 rounded-xl border text-left transition text-xs cursor-pointer ${
                      doctorId === 'DOC-MEENAKSHI-303'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="font-bold text-[11px]">Dr. M. Sundaram, MD</div>
                    <div className="text-[10px] text-slate-500 font-mono">DOC-MEENAKSHI-303 (AIIMS)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDoctorDemo('DOC-ROY-404')}
                    className={`p-2 rounded-xl border text-left transition text-xs cursor-pointer ${
                      doctorId === 'DOC-ROY-404'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="font-bold text-[11px]">Dr. Debabrata Roy</div>
                    <div className="text-[10px] text-slate-500 font-mono">DOC-ROY-404 (Burdwan)</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Demo Credentials Autofill Footer */}
          {tab === 'citizen' && (
            <div className="mt-5 pt-4 border-t border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                Quick Fill Demo Accounts (Click to Fill & Test)
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('citizen')}
                  className="flex-1 min-w-[100px] py-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-800 transition text-center cursor-pointer"
                >
                  👤 Citizen
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('observer')}
                  className="flex-1 min-w-[100px] py-1.5 px-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-[10px] font-bold text-indigo-700 transition text-center cursor-pointer"
                >
                  🛡️ Observer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('psychiatrist');
                    fillDoctorDemo('DOC-ANITA-101');
                  }}
                  className="flex-1 min-w-[100px] py-1.5 px-2 rounded-xl border border-purple-200 hover:bg-purple-50 text-[10px] font-bold text-purple-700 transition text-center cursor-pointer"
                >
                  🩺 Psychiatrist ID
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('ngo')}
                  className="flex-1 min-w-[100px] py-1.5 px-2 rounded-xl border border-teal-200 hover:bg-teal-50 text-[10px] font-bold text-teal-700 transition text-center cursor-pointer"
                >
                  🤝 NGO Partner
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin')}
                  className="flex-1 min-w-[100px] py-1.5 px-2 rounded-xl border border-amber-200 hover:bg-amber-50 text-[10px] font-bold text-amber-700 transition text-center cursor-pointer"
                >
                  🏛️ MoSJE Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Citizen Step-by-Step Onboarding Modal triggered after Google Sign-In */}
      {showOnboardingWizard && onboardingGoogleUser && (
        <CitizenOnboardingModal
          isOpen={showOnboardingWizard}
          onClose={() => setShowOnboardingWizard(false)}
          googleUser={onboardingGoogleUser}
          currentLang={currentLang}
          onLanguageChange={onLanguageChange}
          onComplete={handleOnboardingComplete}
        />
      )}
    </>
  );
};
