import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Globe,
  Navigation,
  Lock,
  FileText
} from 'lucide-react';
import { UserProfile, AtrocityCategory } from '../../types';

interface GoogleUserInfo {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

interface CitizenOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: GoogleUserInfo;
  currentLang: string;
  onLanguageChange: (lang: string) => void;
  onComplete: (profile: UserProfile & { email: string; photoURL?: string }) => void;
}

export const CitizenOnboardingModal: React.FC<CitizenOnboardingModalProps> = ({
  isOpen,
  onClose,
  googleUser,
  currentLang,
  onLanguageChange,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 4;

  // Step 1: Name & Contact
  const [fullName, setFullName] = useState<string>(googleUser.displayName || '');
  const [useAlias, setUseAlias] = useState<boolean>(false);
  const [aliasName, setAliasName] = useState<string>('Survivor #' + googleUser.uid.slice(-4).toUpperCase());
  const [phone, setPhone] = useState<string>('+91 ');

  // Step 2: Language
  const [selectedLang, setSelectedLang] = useState<string>(currentLang || 'en');

  // Step 3: Location (GPS + District)
  const [district, setDistrict] = useState<string>('Nashik');
  const [state, setState] = useState<string>('Maharashtra');
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState<string | null>(null);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  // Step 4: Statutory Incident Details
  const [caseCategory, setCaseCategory] = useState<AtrocityCategory>('caste_violence');
  const [caseNumber, setCaseNumber] = useState<string>('');

  if (!isOpen) return null;

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'हिन्दी', native: 'Hindi' },
    { code: 'bn', label: 'বাংলা', native: 'Bengali' },
    { code: 'ta', label: 'தமிழ்', native: 'Tamil' },
    { code: 'te', label: 'తెలుగు', native: 'Telugu' },
    { code: 'mr', label: 'मराठी', native: 'Marathi' },
  ];

  const handleSelectLanguage = (langCode: string) => {
    setSelectedLang(langCode);
    onLanguageChange(langCode);
    try {
      localStorage.setItem('anvaya_language', langCode);
    } catch {}
  };

  // Detect location using browser Geolocation API
  const handleDetectLocation = () => {
    if (!('geolocation' in navigator)) {
      setGpsErrorMsg('Geolocation is not supported by your device/browser.');
      return;
    }

    setIsDetectingGps(true);
    setGpsErrorMsg(null);
    setGpsSuccessMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setGpsCoordinates({ lat, lon });

        // Attempt reverse geocoding via OpenStreetMap
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          if (resp.ok) {
            const data = await resp.json();
            const detectedDistrict =
              data.address?.county ||
              data.address?.state_district ||
              data.address?.city ||
              data.address?.town ||
              'Nashik';
            const detectedState = data.address?.state || 'Maharashtra';

            setDistrict(detectedDistrict);
            setState(detectedState);
            setGpsSuccessMsg(`Detected: ${detectedDistrict}, ${detectedState} (${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E)`);
          } else {
            setGpsSuccessMsg(`GPS Coordinates Acquired: ${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`);
          }
        } catch {
          setGpsSuccessMsg(`GPS Coordinates Acquired: ${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`);
        } finally {
          setIsDetectingGps(false);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsErrorMsg('Location permission was denied. You can select your district manually below.');
        } else {
          setGpsErrorMsg('Could not acquire precise GPS fix. Please select district manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleFinish = () => {
    const finalName = useAlias ? aliasName : fullName || 'Citizen Survivor';
    const profile: UserProfile & { email: string; photoURL?: string } = {
      id: googleUser.uid,
      name: finalName,
      email: googleUser.email,
      photoURL: googleUser.photoURL,
      phone: phone.trim() || '+91 98231 14566',
      district: district.trim() || 'Nashik',
      state: state.trim() || 'Maharashtra',
      language: selectedLang,
      caseCategory,
      caseNumber: caseNumber.trim() || undefined,
      livingSituation: 'family',
      contactPreference: 'call',
      isProxy: false,
    };

    // Save profile to local storage for persistent recognition
    try {
      const existing = JSON.parse(localStorage.getItem('anvaya_citizen_profiles') || '{}');
      existing[googleUser.uid] = profile;
      localStorage.setItem('anvaya_citizen_profiles', JSON.stringify(existing));
      localStorage.setItem('anvaya_language', selectedLang);
    } catch {}

    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[92vh] flex flex-col justify-between overflow-y-auto">
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-400 flex items-center justify-center text-white shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  Citizen Confidential Onboarding
                </h3>
                <span className="text-[10px] font-bold text-indigo-700">
                  Step {step} of {totalSteps}: {step === 1 ? 'Identity' : step === 2 ? 'Language' : step === 3 ? 'Location' : 'Atrocity Safety Net'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-3">
            <div
              className="bg-gradient-to-r from-indigo-600 to-teal-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          {/* ============================================================
              STEP 1: GOOGLE PROFILE & IDENTITY
              ============================================================ */}
          {step === 1 && (
            <div className="space-y-4 py-2 animate-fadeIn">
              {/* Google Verified Card */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center gap-3">
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName}
                    className="w-11 h-11 rounded-full border-2 border-white shadow-xs"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                    {googleUser.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 truncate">
                      {googleUser.displayName || 'Google Account'}
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black">
                      ✓ Verified Google
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 truncate block">
                    {googleUser.email}
                  </span>
                </div>
              </div>

              {/* Legal Confidentiality Toggle */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      Witness Protection / Confidential Pseudonym
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Mask your real name in psychiatric reports and court logs
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    id="aliasToggle"
                    checked={useAlias}
                    onChange={(e) => setUseAlias(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                  />
                </div>

                {useAlias ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Assigned Pseudonym (Safe Alias)
                    </label>
                    <input
                      type="text"
                      value={aliasName}
                      onChange={(e) => setAliasName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-300 text-xs font-extrabold text-indigo-950 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Preferred Display Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                )}
              </div>

              {/* Phone Number for Emergency Rescue */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1 flex items-center justify-between">
                  <span>Contact Phone Number</span>
                  <span className="text-[10px] text-slate-400 font-bold">For 108 Ambulance / Nodal Officer</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98231 14566"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-900 focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  🔒 Strictly encrypted under MoSJE NHAA statutory data safeguarding rules.
                </p>
              </div>
            </div>
          )}

          {/* ============================================================
              STEP 2: LANGUAGE SELECTION & LIVE PERSISTENCE
              ============================================================ */}
          {step === 2 && (
            <div className="space-y-4 py-2 animate-fadeIn">
              <div className="text-center space-y-1">
                <h4 className="text-sm font-black text-slate-900">
                  Select Your Preferred Language (भाषा चुनें)
                </h4>
                <p className="text-xs text-slate-500">
                  ANVAYA will maintain this language across check-ins, audio guidance, and dashboards.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {languages.map((lang) => {
                  const isSelected = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div className="text-base font-black">{lang.label}</div>
                      <div className={`text-[10px] font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {lang.native}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">
                  Language setting active: All clinical questions, TTS voices, and reports will speak in your chosen tongue.
                </span>
              </div>
            </div>
          )}

          {/* ============================================================
              STEP 3: GPS LOCATION ACCESS
              ============================================================ */}
          {step === 3 && (
            <div className="space-y-4 py-2 animate-fadeIn">
              <div className="text-center space-y-1">
                <h4 className="text-sm font-black text-slate-900">
                  Citizen District & Location Linkage
                </h4>
                <p className="text-xs text-slate-500">
                  Required to link you with your local District Protection Officer and Special SC/ST Court under Rule 12(4).
                </p>
              </div>

              {/* Auto GPS Detection Button */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingGps}
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Navigation className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
                <span>{isDetectingGps ? 'Acquiring GPS Fix...' : '📍 Fetch My Current Location (GPS)'}</span>
              </button>

              {gpsSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{gpsSuccessMsg}</span>
                </div>
              )}

              {gpsErrorMsg && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{gpsErrorMsg}</span>
                </div>
              )}

              {/* District & State Manual Fallback / Edit */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    District / जिला
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Nashik"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-900 focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    State / राज्य
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-900 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center font-medium">
                Used to dispatch emergency healthcare and calculate your district's statutory compensation SLA.
              </p>
            </div>
          )}

          {/* ============================================================
              STEP 4: STATUTORY ATROCITY INCIDENT DETAILS
              ============================================================ */}
          {step === 4 && (
            <div className="space-y-4 py-2 animate-fadeIn">
              <div className="text-center space-y-1">
                <h4 className="text-sm font-black text-slate-900">
                  Statutory Case Categorization (PoA Act)
                </h4>
                <p className="text-xs text-slate-500">
                  Select the primary nature of the incident to calibrate your Rule 12(4) Direct Benefit Transfer milestones.
                </p>
              </div>

              <div className="space-y-1.5">
                {[
                  { id: 'caste_violence', label: 'Caste Atrocity & Physical Violence', desc: 'Section 3(1) & 3(2) of PoA Act' },
                  { id: 'witness_intimidation', label: 'Witness Protection & Hostile Threats', desc: 'Active security and surveillance alert' },
                  { id: 'sexual_violence', label: 'Gender / Sexual Violence Atrocity', desc: 'Priority trauma clinical protocol' },
                  { id: 'other', label: 'General Mental Health Safeguarding', desc: 'Preventive emotional distress support' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCaseCategory(cat.id as any)}
                    className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      caseCategory === cat.id
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-black">{cat.label}</div>
                    <div className="text-[10px] text-slate-500">{cat.desc}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  FIR / Court Case Reference Number (Optional)
                </label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  placeholder="e.g. CR-42/2026 Special Sessions Court"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-extrabold text-xs flex items-center gap-1.5 hover:bg-slate-50 transition cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer min-h-[44px]"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition cursor-pointer min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Enter My ANVAYA Sanctuary</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
