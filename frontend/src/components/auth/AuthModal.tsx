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
  Database
} from 'lucide-react';
import { authApi, RegisterPayload, LoginPayload } from '../../api';
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
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [role, setRole] = useState<string>('victim');
  const [phone, setPhone] = useState<string>('');
  const [district, setDistrict] = useState<string>('Nashik');
  const [state, setState] = useState<string>('Maharashtra');

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
    // Do not create a client-only session. Google sign-in will be enabled only
    // after the backend verifies Firebase ID tokens and stores the user.
    setErrorMsg('Please sign in with your registered email and password.');
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

    setSuccessMsg(`Onboarding complete! Welcome to ANVAYA, ${profile.name}.`);
    setTimeout(() => {
      onAuthSuccess(userObj);
      onClose();
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const payload: RegisterPayload = {
          email: email.trim().toLowerCase(),
          password,
          full_name: fullName.trim(),
          confirm_password: confirmPassword,
          role: 'victim',
          phone: phone.trim() || undefined,
          district: district.trim() || undefined,
          state: state.trim() || undefined,
        };

        const res = await authApi.register(payload);
        setSuccessMsg('Account created successfully. Your account is saved securely.');
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 1000);
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
        }, 700);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const detail = err.detail || err.error || 'Authentication failed. Please check your credentials.';
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
      setRole('victim');
      setDistrict('Nashik');
      setState('Maharashtra');
    } else if (demoType === 'observer') {
      setEmail('observer.district@sih.gov.in');
      setPassword('ObserverPassword123!');
      setFullName('Dr. Anita Joshi (District Nodal Officer)');
      setRole('observer_district');
      setDistrict('Nashik');
      setState('Maharashtra');
    } else if (demoType === 'psychiatrist') {
      setEmail('psychiatrist@sih.gov.in');
      setPassword('PsyPassword123!');
      setFullName('Dr. Anita Joshi, MD (Telepsychiatrist)');
      setRole('psychiatrist');
      setDistrict('Nashik');
      setState('Maharashtra');
    } else if (demoType === 'ngo') {
      setEmail('ngo.partner@sih.gov.in');
      setPassword('NgoPassword123!');
      setFullName('Ram Kumar (NGO Field Coordinator)');
      setRole('ngo_partner');
      setDistrict('Nashik');
      setState('Maharashtra');
    } else if (demoType === 'admin') {
      setEmail('admin.mosje@sih.gov.in');
      setPassword('AdminPassword123!');
      setFullName('Shri Rajesh Meena (Joint Secretary, MoSJE)');
      setRole('admin');
      setDistrict('New Delhi');
      setState('Delhi');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
        <div className="liquid-glass-panel rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl relative overflow-hidden bg-white/95 border border-slate-200 max-h-[92vh] overflow-y-auto">
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
            <span>Secure MongoDB Authentication</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h3>
          <p className="text-xs text-slate-600 mb-4 font-medium leading-relaxed">
            {mode === 'login'
              ? 'Sign in with your registered credentials to access your confidential care records.'
              : 'Register securely. Your account and password are stored by the backend.'}
          </p>

          {/* 1-Click Instant Demo Login Buttons for Evaluators */}
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-100 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>SIH Evaluator 1-Click Instant Access</span>
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

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Register (Custom)
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

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
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
                  placeholder="At least 6 characters"
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

            {mode === 'register' && (
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
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer" aria-label="Show or hide confirmation password">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Type
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <div className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50">
                      Citizen / Survivor
                    </div>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">Official roles are provisioned by an administrator.</p>
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
                  : mode === 'login'
                  ? 'Sign In with Email'
                  : 'Create Account with Email'}
              </span>
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-5 pt-4 border-t border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              Quick Fill Demo Accounts (Click to Fill & Test)
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => fillDemoAccount('citizen')}
                className="flex-1 min-w-[120px] py-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-800 transition text-center cursor-pointer"
              >
                👤 Citizen
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('observer')}
                className="flex-1 min-w-[120px] py-1.5 px-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-[10px] font-bold text-indigo-700 transition text-center cursor-pointer"
              >
                🛡️ Observer
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('psychiatrist')}
                className="flex-1 min-w-[120px] py-1.5 px-2 rounded-xl border border-purple-200 hover:bg-purple-50 text-[10px] font-bold text-purple-700 transition text-center cursor-pointer"
              >
                🩺 Psychiatrist
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('ngo')}
                className="flex-1 min-w-[120px] py-1.5 px-2 rounded-xl border border-teal-200 hover:bg-teal-50 text-[10px] font-bold text-teal-700 transition text-center cursor-pointer"
              >
                🤝 NGO Partner
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin')}
                className="flex-1 min-w-[120px] py-1.5 px-2 rounded-xl border border-amber-200 hover:bg-amber-50 text-[10px] font-bold text-amber-700 transition text-center cursor-pointer"
              >
                🏛️ MoSJE Admin
              </button>
            </div>
          </div>
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
