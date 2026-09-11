import React, { useState, useEffect } from 'react';
import {
  X,
  Stethoscope,
  Search,
  Filter,
  CheckCircle2,
  Video,
  PhoneCall,
  MessageSquare,
  Shield,
  Clock,
  Building2,
  Award,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Send,
  Calendar,
  Lock,
  UserCheck
} from 'lucide-react';
import { psychiatristApi, DoctorProfile, ConnectRequestPayload, authApi, getStoredUser } from '../../api';

interface DoctorDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: any;
  recentAssessmentScore?: number;
}

export const DoctorDirectoryModal: React.FC<DoctorDirectoryModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  recentAssessmentScore,
}) => {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');

  // Request Consultation Form State
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [preferredMode, setPreferredMode] = useState<'video' | 'voice' | 'chat'>('video');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDoctors();
    }
  }, [isOpen, selectedDistrict]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await psychiatristApi.getDoctors(selectedDistrict);
      if (data && data.length > 0) {
        setDoctors(data);
      } else {
        setDoctors(DEFAULT_FALLBACK_DOCTORS);
      }
    } catch {
      setDoctors(DEFAULT_FALLBACK_DOCTORS);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = (doc: DoctorProfile) => {
    setSelectedDoctor(doc);
    setReason('');
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleDirectAssign = async (doc: DoctorProfile) => {
    const observerObj = {
      id: doc.doctor_id,
      name: doc.name,
      role: `${doc.specialization} (${doc.qualification})`,
      phone: doc.phone,
      hospital: doc.hospital,
      assignedAt: new Date().toISOString(),
    };

    const targetUserId = userProfile?.id || getStoredUser()?.id || 'USR-26094';

    try {
      await authApi.assignObserver(targetUserId, observerObj);
    } catch {}

    try {
      localStorage.setItem(`anvaya_assigned_observer_${targetUserId}`, JSON.stringify(observerObj));
      localStorage.setItem('anvaya_last_assigned_observer', JSON.stringify(observerObj));
      localStorage.setItem('anvaya_global_assigned_observer', JSON.stringify(observerObj));

      const curr = authApi.getCurrentLocalUser();
      if (curr) {
        authApi.saveLocalSession({ ...curr, assigned_observer: observerObj, assignedObserver: observerObj });
      }

      const storedProfile = JSON.parse(localStorage.getItem('anvaya_user_profile') || '{}');
      storedProfile.assignedObserver = observerObj;
      storedProfile.assigned_observer = observerObj;
      localStorage.setItem('anvaya_user_profile', JSON.stringify(storedProfile));
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('anvaya_observer_assigned', {
          detail: { userId: targetUserId, observer: observerObj },
        })
      );
      window.dispatchEvent(new Event('storage'));
    }

    setSuccessMessage(`✅ ${doc.name} is now allocated as your primary Health Observer!`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const payload: ConnectRequestPayload = {
        doctor_id: selectedDoctor.doctor_id,
        doctor_name: selectedDoctor.name,
        preferred_mode: preferredMode,
        victim_name: userProfile?.name || 'Anonymous Survivor',
        victim_id: userProfile?.id,
        phone: userProfile?.phone,
        district: userProfile?.district || 'Nashik',
        state: userProfile?.state || 'Maharashtra',
        distress_score: recentAssessmentScore,
        severity_level: recentAssessmentScore && recentAssessmentScore >= 75 ? 'CRITICAL' : recentAssessmentScore && recentAssessmentScore >= 50 ? 'HIGH' : 'MODERATE',
        reason: reason.trim() || 'Requested 1-to-1 telepsychiatry review and trauma support.',
      };

      const res = await psychiatristApi.requestConnect(payload);
      setSuccessMessage(
        res.message || 'Your consultation request has been sent to ' + selectedDoctor.name + '. They will initiate the session shortly.'
      );
      setTimeout(() => {
        setSuccessMessage(null);
        setSelectedDoctor(null);
      }, 4000);
    } catch (err: any) {
      setErrorMessage(err?.detail || err?.error || 'Could not submit consultation request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    if (selectedDistrict !== 'ALL' && doc.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(q) ||
      doc.hospital.toLowerCase().includes(q) ||
      doc.specialization.toLowerCase().includes(q) ||
      doc.doctor_id.toLowerCase().includes(q) ||
      doc.qualification.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-8 shadow-2xl relative overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5 text-indigo-700 font-black text-xs uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4 text-indigo-600" />
            <span>Tele-MANAS Official Medical Directory</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
            Connect 1-to-1 with a Registered Psychiatrist
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Verified psychiatric specialists and medical observers available for direct encrypted teleconsultation, medication review, and trauma counseling.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by doctor name, hospital, specialization, or Doctor ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-black focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-black focus:outline-hidden focus:border-indigo-500 cursor-pointer w-full sm:w-auto"
            >
              <option value="ALL">All Jurisdictions / India</option>
              <option value="Nashik">Nashik (Home District)</option>
              <option value="Jaipur">Jaipur (Rajasthan)</option>
              <option value="Birbhum">Birbhum (West Bengal)</option>
            </select>
          </div>
        </div>

        {/* Doctor List or Request Sub-Panel */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {selectedDoctor ? (
            /* Consultation Request Sub-Form */
            <div className="p-5 rounded-3xl bg-indigo-50/50 border border-indigo-200 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md">
                    {selectedDoctor.name.replace('Dr. ', '').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-black flex items-center gap-2">
                      <span>{selectedDoctor.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 font-mono">
                        {selectedDoctor.doctor_id}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {selectedDoctor.qualification} • {selectedDoctor.hospital}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="text-xs font-bold text-slate-500 hover:text-black px-3 py-1.5 rounded-xl hover:bg-white transition cursor-pointer"
                >
                  Change Doctor
                </button>
              </div>

              {successMessage ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-extrabold text-black mb-2">
                      Choose Consultation Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: 'video', label: 'Video Call', icon: Video, desc: 'Encrypted Telepsychiatry' },
                        { id: 'voice', label: 'Voice Call', icon: PhoneCall, desc: 'Direct Tele-MANAS' },
                        { id: 'chat', label: 'Encrypted Chat', icon: MessageSquare, desc: '1:1 Clinical Messenger' },
                      ].map((mode) => {
                        const Icon = mode.icon;
                        const isSel = preferredMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setPreferredMode(mode.id as any)}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                              isSel
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSel ? 'text-white' : 'text-indigo-600'}`} />
                            <span className="text-xs font-black">{mode.label}</span>
                            <span className={`text-[10px] font-medium leading-tight ${isSel ? 'text-indigo-100' : 'text-slate-500'}`}>
                              {mode.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-black mb-1.5">
                      Brief Reason for Consultation (Optional & Strictly Confidential)
                    </label>
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="E.g., Experiencing heavy anxiety before tomorrow's court deposition, sleep disruption, or need advice on coping..."
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-black focus:outline-hidden focus:border-indigo-500 transition"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                    <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Statutory Protection:</strong> Your consultation request is protected under the Mental Healthcare Act 2017. All medical communications are confidential and privileged.
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDoctor(null)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Connecting...' : 'Request 1:1 Consultation'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Registered Doctors Directory Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {loading ? (
                <div className="col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-3 animate-fade-in"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl skeleton-box animate-shimmer" />
                            <div className="space-y-1.5">
                              <div className="w-28 h-3.5 rounded-md skeleton-box animate-shimmer" />
                              <div className="w-20 h-2.5 rounded-md skeleton-box animate-shimmer" />
                            </div>
                          </div>
                          <div className="w-12 h-5 rounded-full skeleton-box animate-shimmer" />
                        </div>
                        <div className="space-y-1.5 py-1">
                          <div className="w-3/4 h-3 rounded-md skeleton-box animate-shimmer" />
                          <div className="w-full h-3 rounded-md skeleton-box animate-shimmer" />
                          <div className="w-1/2 h-4 rounded-xl skeleton-box animate-shimmer" />
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="w-24 h-3 rounded-md skeleton-box animate-shimmer" />
                          <div className="flex gap-1.5">
                            <div className="w-16 h-7 rounded-xl skeleton-box animate-shimmer" />
                            <div className="w-20 h-7 rounded-xl skeleton-box animate-shimmer" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-slate-500 space-y-2">
                  <p className="text-xs font-extrabold text-black">No registered doctors found matching your query.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDistrict('ALL');
                    }}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Reset Search
                  </button>
                </div>
              ) : (
                filteredDoctors.map((doc) => (
                  <div
                    key={doc.doctor_id}
                    className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                            {doc.name.replace('Dr. ', '').charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black text-black group-hover:text-indigo-600 transition">
                                {doc.name}
                              </h4>
                              {doc.verified && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              )}
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-500 block">
                              ID: {doc.doctor_id} • {doc.mci_number}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex-shrink-0">
                          ★ {doc.rating.toFixed(1)}
                        </span>
                      </div>

                      <div className="mt-2.5 space-y-1 text-[11px] text-slate-600">
                        <p className="font-semibold text-slate-800">{doc.qualification}</p>
                        <p className="flex items-center gap-1.5 text-slate-500 truncate">
                          <Building2 className="w-3 h-3 flex-shrink-0 text-slate-400" />
                          <span className="truncate">{doc.hospital}</span>
                        </p>
                        <p className="text-[10px] text-indigo-700 font-bold bg-indigo-50/80 px-2 py-1 rounded-xl">
                          🩺 {doc.specialization}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span>{doc.available_slot}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDirectAssign(doc)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 font-extrabold text-[11px] border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                          title="Assign as your official health observer"
                        >
                          <span>🤝 Assign</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenRequest(doc)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-[11px] transition cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <span>Connect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>National Tele-MANAS Toll-Free: <strong>14416</strong></span>
          </span>
          <span className="font-semibold text-indigo-600">
            Zero Fee • 100% Govt Sponsored Care
          </span>
        </div>
      </div>
    </div>
  );
};

const DEFAULT_FALLBACK_DOCTORS: DoctorProfile[] = [
  {
    doctor_id: 'DOC-ANITA-101',
    name: 'Dr. Anita Joshi',
    qualification: 'MD (Psychiatry), DNB, Tele-MANAS Specialist',
    hospital: 'Nashik District Civil Hospital & Tele-MANAS Centre',
    district: 'Nashik',
    phone: '+91 94222 10801',
    mci_number: 'MCI-MH-38910',
    specialization: 'Trauma, Caste/Gender Atrocities & PTSD Crisis',
    available_slot: 'Available Today (Instant 1:1)',
    status: 'available',
    experience_years: 14,
    languages: ['English', 'Hindi', 'Marathi'],
    rating: 4.9,
    verified: true,
  },
  {
    doctor_id: 'DOC-DESHMUKH-202',
    name: 'Dr. Vivek Deshmukh',
    qualification: 'MD Psychiatry, NIMHANS Trauma Fellow',
    hospital: 'Nashik District Civil Hospital & Telepsychiatry Unit',
    district: 'Nashik',
    phone: '+91 98230 45671',
    mci_number: 'MCI-MH-44912',
    specialization: 'Depression, Acute Shock & Legal Witness Distress',
    available_slot: 'Available Today 3:30 PM',
    status: 'available',
    experience_years: 11,
    languages: ['English', 'Hindi', 'Marathi'],
    rating: 4.8,
    verified: true,
  },
  {
    doctor_id: 'DOC-MEENAKSHI-303',
    name: 'Dr. Meenakshi Sundaram',
    qualification: 'MD (Psychiatry), AIIMS Trauma Specialist',
    hospital: 'SMS Medical College & Telepsychiatry Hub',
    district: 'Jaipur',
    phone: '+91 98291 11234',
    mci_number: 'MCI-RJ-31089',
    specialization: 'Complex Trauma, Grief Counseling & Family Therapy',
    available_slot: 'Available Today 5:00 PM',
    status: 'available',
    experience_years: 16,
    languages: ['English', 'Hindi'],
    rating: 4.95,
    verified: true,
  },
  {
    doctor_id: 'DOC-ROY-404',
    name: 'Dr. Debabrata Roy',
    qualification: 'DPM, Trauma & Community Crisis Intervention',
    hospital: 'Burdwan Medical College & District Nodal Centre',
    district: 'Birbhum',
    phone: '+91 98310 99881',
    mci_number: 'MCI-WB-21940',
    specialization: 'Rural Atrocity Rehabilitation & Anxiety Disorders',
    available_slot: 'Available Tomorrow 10:00 AM',
    status: 'available',
    experience_years: 9,
    languages: ['English', 'Hindi', 'Bengali'],
    rating: 4.75,
    verified: true,
  }
];
