import React, { useState } from 'react';
import { User, Users, ShieldCheck, MapPin, Volume2, ArrowRight, CheckCircle2, Sparkles, HeartHandshake } from 'lucide-react';
import { UserProfile, AtrocityCategory } from '../../types';
import { translations } from '../../utils/translations';
import { STATES_AND_DISTRICTS } from '../../data/questionnaire';

interface OnboardingProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  voiceGuidance: boolean;
  onToggleVoiceGuidance: () => void;
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({
  currentLang,
  onLanguageChange,
  voiceGuidance,
  onToggleVoiceGuidance,
  onComplete,
}) => {
  const t = translations[currentLang] || translations.en;

  const [step, setStep] = useState<number>(1);
  const [isProxy, setIsProxy] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Nashik');
  const [caseCategory, setCaseCategory] = useState<AtrocityCategory>('caste_violence');
  const [livingSituation, setLivingSituation] = useState<'family' | 'alone' | 'shelter' | 'undisclosed'>('family');
  const [contactPref, setContactPref] = useState<'call' | 'whatsapp' | 'sms' | 'app'>('call');

  const availableDistricts = STATES_AND_DISTRICTS[selectedState] || ['District Central'];

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setOtpSent(true);
      setOtp('4566');
    }
  };

  const handleVerifyOtp = () => {
    setOtpVerified(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: UserProfile = {
      id: `USR-${Date.now().toString().slice(-5)}`,
      name: name.trim() || (isProxy ? 'Family Caregiver' : 'Courageous Survivor'),
      phone: phone || '+91 98200 14566',
      district: selectedDistrict,
      state: selectedState,
      language: currentLang,
      caseCategory,
      livingSituation,
      contactPreference: contactPref,
      isProxy,
    };
    onComplete(profile);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 animate-fadeInScale">
      {/* Main Liquid Glass Card */}
      <div className="liquid-glass-panel rounded-3xl p-6 sm:p-10 relative z-10 overflow-hidden bg-white/95">
        {/* Step Indicator & Voice Guide */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-extrabold border border-indigo-200/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Step {step} of 3 • ANVAYA Welcome</span>
          </div>

          <button
            type="button"
            onClick={onToggleVoiceGuidance}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-xs ${
              voiceGuidance
                ? 'bg-indigo-600 text-white shadow-indigo-500/25 ring-2 ring-indigo-400/30'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{voiceGuidance ? 'Audio Guide ON' : 'Audio Guide OFF'}</span>
          </button>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {step === 1 && t.whoIsThisFor}
            {step === 2 && t.basicDetails}
            {step === 3 && 'Living & Support Preferences'}
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed font-medium">
            {step === 1 && 'Every interaction is treated with deep respect, complete confidentiality, and immediate access to care.'}
            {step === 2 && 'Connecting you with certified trauma counsellors, medical relief, and legal protection in your local district.'}
            {step === 3 && 'Tailor how you would like our support observers to connect with you gently.'}
          </p>
        </div>

        {/* STEP 1: Self vs Proxy Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              {/* For Myself Tile */}
              <button
                type="button"
                onClick={() => {
                  setIsProxy(false);
                  setStep(2);
                }}
                className="liquid-tile group text-left p-6 sm:p-7 rounded-3xl cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/25 group-hover:scale-110 group-hover:rotate-2 transition-all">
                    <User className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                    {t.forMyself}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {t.forMyselfSub}
                  </p>
                </div>

                <div className="mt-8 flex items-center text-xs font-extrabold text-indigo-600 group-hover:translate-x-1.5 transition-transform">
                  <span>Continue with Check-in</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </div>
              </button>

              {/* For Someone Else Tile */}
              <button
                type="button"
                onClick={() => {
                  setIsProxy(true);
                  setStep(2);
                }}
                className="liquid-tile group text-left p-6 sm:p-7 rounded-3xl cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-teal-500/25 group-hover:scale-110 group-hover:-2 transition-all">
                    <HeartHandshake className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1.5 group-hover:text-teal-700 transition-colors">
                    {t.forSomeoneElse}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {t.forSomeoneElseSub}
                  </p>
                </div>

                <div className="mt-8 flex items-center text-xs font-extrabold text-teal-700 group-hover:translate-x-1.5 transition-transform">
                  <span>Continue with Report</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </div>
              </button>
            </div>

            {/* Bottom Guarantee Banner */}
            <div className="liquid-glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium border border-slate-200/80">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Protected under DPDP Act 2023 & SC/ST Protection Guidelines</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsProxy(false);
                  setStep(2);
                }}
                className="text-indigo-600 hover:text-indigo-800 font-bold underline underline-offset-2 whitespace-nowrap"
              >
                Quick Start Demo →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Basic Details & Case Context */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                {t.enterName}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar or leave blank for anonymity"
                className="w-full px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition shadow-xs"
              />
            </div>

            {/* Mobile Phone & OTP */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                {t.enterPhone}
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="flex-1 px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition shadow-xs"
                />
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-5 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/25 transition whitespace-nowrap"
                  >
                    Send OTP
                  </button>
                ) : !otpVerified ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="OTP"
                      className="w-20 px-3 py-3.5 rounded-2xl border-2 border-emerald-400 bg-emerald-50 text-emerald-900 text-sm font-extrabold text-center outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition"
                    >
                      Verify
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-extrabold px-4 py-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* State and District */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t.selectState}</span>
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    const dists = STATES_AND_DISTRICTS[e.target.value] || [];
                    if (dists.length > 0) setSelectedDistrict(dists[0]);
                  }}
                  className="w-full px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-900 border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer shadow-xs"
                >
                  {Object.keys(STATES_AND_DISTRICTS).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  {t.selectDistrict}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-900 border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer shadow-xs"
                >
                  {availableDistricts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Case Context Grid */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2.5">
                {t.caseType}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(t.caseOptions) as AtrocityCategory[]).map((catKey) => {
                  const isSelected = caseCategory === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setCaseCategory(catKey)}
                      className={`text-left p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'liquid-tile-selected text-indigo-950 scale-[1.01]'
                          : 'liquid-tile text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      {t.caseOptions[catKey]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-5 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-2xl border border-slate-200 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition"
              >
                {t.back}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/25 transition flex items-center gap-2"
              >
                <span>{t.next}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Living Situation & Support Mode */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">
                Current Living Situation
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'family', label: 'With Family', icon: '🏡', desc: 'In home with relatives' },
                  { id: 'alone', label: 'Living Alone', icon: '👤', desc: 'Independently' },
                  { id: 'shelter', label: 'In Safe Shelter', icon: '🛡️', desc: 'Safe shelter / NGO' },
                  { id: 'undisclosed', label: 'Confidential', icon: '🔒', desc: 'Private location' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLivingSituation(item.id as any)}
                    className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      livingSituation === item.id
                        ? 'liquid-tile-selected text-indigo-950 scale-[1.02]'
                        : 'liquid-tile text-slate-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{item.icon}</span>
                    <span className="text-xs font-extrabold text-slate-900">{item.label}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">
                Preferred Mode for Health Observer Outreach
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'call', label: 'Phone Call', icon: '📞', desc: 'Direct voice' },
                  { id: 'whatsapp', label: 'WhatsApp Msg', icon: '💬', desc: 'Text & voice note' },
                  { id: 'sms', label: 'SMS Alert', icon: '✉️', desc: 'Discrete text' },
                  { id: 'app', label: 'In-App Portal', icon: '📱', desc: 'Check app only' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setContactPref(item.id as any)}
                    className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      contactPref === item.id
                        ? 'liquid-tile-selected text-indigo-950 scale-[1.02]'
                        : 'liquid-tile text-slate-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{item.icon}</span>
                    <span className="text-xs font-extrabold text-slate-900">{item.label}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-teal-50 rounded-2xl p-4 border border-teal-200 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-teal-950 leading-relaxed font-medium">
                Everything is set! You will now experience 10 gentle tile questions designed to assess your well-being, sleep, and emotional peace without any rush.
              </p>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-2xl border border-slate-200 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition"
              >
                {t.back}
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 transition flex items-center gap-2"
              >
                <span>{t.startCheckin}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
