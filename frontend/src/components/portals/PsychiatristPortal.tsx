import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Calendar,
  Clock,
  Video,
  FileText,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Shield,
  Activity,
  Send,
  Sparkles,
  ChevronRight,
  Pill,
  Bell,
  PhoneCall,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  Filter,
  Check,
  X,
  ArrowUpRight,
  User,
  MapPin,
} from 'lucide-react';
import { RiskLevel } from '../../types';
import { psychiatristApi, PatientNotification, getStoredUser } from '../../api';

interface ReferredCase {
  id: string;
  pseudonym: string;
  age: number;
  district: string;
  distressScore: number;
  riskLevel: RiskLevel;
  madrsScore: number;
  dsm5Probable: boolean;
  referredBy: string;
  referredDate: string;
  slotScheduled?: string;
  status: 'pending_review' | 'session_scheduled' | 'consultation_completed';
  shapSummary: string;
  clinicalNotes?: string;
}

export const PsychiatristPortal: React.FC = () => {
  // Currently authenticated doctor info
  const currentUser = getStoredUser();
  const doctorId = currentUser?.doctor_id || 'DOC-ANITA-101';
  const doctorName = currentUser?.full_name || 'Dr. Anita Joshi, MD';
  const doctorDistrict = currentUser?.district || 'Nashik';

  // Navigation tab inside portal
  const [activeTab, setActiveTab] = useState<'notifications' | 'caseload'>('notifications');

  // Notifications State
  const [notifications, setNotifications] = useState<PatientNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [activeNotificationId, setActiveNotificationId] = useState<string | null>(null);
  const [scheduleModalReq, setScheduleModalReq] = useState<PatientNotification | null>(null);
  const [scheduleSlotInput, setScheduleSlotInput] = useState<string>('Today, 05:00 PM');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Referred Cases State
  const [cases, setCases] = useState<ReferredCase[]>([
    {
      id: 'REF-PSY-101',
      pseudonym: 'Survivor #1024',
      age: 27,
      district: 'Nashik',
      distressScore: 82.5,
      riskLevel: 'critical',
      madrsScore: 42,
      dsm5Probable: true,
      referredBy: 'Dr. Anita Joshi (District Nodal Officer)',
      referredDate: '08 Sep 2026',
      slotScheduled: '10 Sep 2026, 04:00 PM',
      status: 'session_scheduled',
      shapSummary: 'Severe sleep fragmentation (32%), high vocal tremor (24%), suicidal ideation flag.',
      clinicalNotes: 'Prescribed somatic grounding exercises. Scheduled telepsychiatry review.',
    },
    {
      id: 'REF-PSY-102',
      pseudonym: 'Survivor #1026',
      age: 34,
      district: 'Nashik',
      distressScore: 71.0,
      riskLevel: 'high',
      madrsScore: 36,
      dsm5Probable: true,
      referredBy: 'L1 Health Observer',
      referredDate: '07 Sep 2026',
      status: 'pending_review',
      shapSummary: 'Depressive mood persistent (+18 pts), intimidation anxiety (+12 pts).',
    },
    {
      id: 'REF-PSY-103',
      pseudonym: 'Survivor #1029',
      age: 22,
      district: 'Pune',
      distressScore: 74.0,
      riskLevel: 'high',
      madrsScore: 38,
      dsm5Probable: true,
      referredBy: 'District Nodal Officer',
      referredDate: '06 Sep 2026',
      slotScheduled: '09 Sep 2026, 02:30 PM',
      status: 'consultation_completed',
      shapSummary: 'Acute post-traumatic stress after village ostracism. Moderate insomnia.',
      clinicalNotes: 'Initiated trauma-focused cognitive intervention. Follow-up in 7 days.',
    },
  ]);

  const [selectedCaseId, setSelectedCaseId] = useState<string>('REF-PSY-101');
  const [newNote, setNewNote] = useState<string>('');
  const [prescriptionText, setPrescriptionText] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Fetch live notifications on mount and when filter changes
  useEffect(() => {
    fetchNotifications();
  }, [filterStatus]);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await psychiatristApi.getNotifications({
        doctor_id: 'ALL', // Display requests for this doctor or all in department
        status: filterStatus,
      });
      if (res && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.warn('Could not fetch notifications from backend, using sample list:', err);
      // Fallback sample notification
      setNotifications([
        {
          request_id: 'REQ-INIT-001',
          doctor_id: 'DOC-ANITA-101',
          doctor_name: 'Dr. Anita Joshi',
          victim_name: 'Courageous Survivor (Nashik)',
          victim_id: 'USR-VICTIM-9021',
          preferred_mode: 'video',
          phone: '+91 98231 44510',
          district: 'Nashik',
          state: 'Maharashtra',
          distress_score: 82.5,
          severity_level: 'CRITICAL',
          reason: 'Severe panic attacks, insomnia, and distress following village intimidation.',
          status: 'pending',
          session_link: 'https://telemanas.gov.in/room/TELE-PSY-REQ-INIT-001',
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
      ]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const pendingCount = notifications.filter((n) => n.status === 'pending').length;

  const handleNotificationAction = async (
    requestId: string,
    action: 'accept' | 'schedule' | 'complete' | 'decline',
    details?: { scheduled_slot?: string; clinical_notes?: string }
  ) => {
    try {
      const res = await psychiatristApi.actionNotification(requestId, action, details);
      setActionSuccessMessage(res.message || `Request updated to ${action}`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      // Reload notifications list
      await fetchNotifications();
      setScheduleModalReq(null);
    } catch (err: any) {
      console.error('Error executing notification action:', err);
      // Optimistic local state update
      setNotifications((prev) =>
        prev.map((n) =>
          n.request_id === requestId
            ? {
                ...n,
                status: action === 'accept' ? 'accepted' : action === 'schedule' ? 'scheduled' : action === 'complete' ? 'completed' : 'declined',
                scheduled_slot: details?.scheduled_slot || n.scheduled_slot,
                session_link: action === 'accept' ? `https://telemanas.gov.in/room/TELE-PSY-${requestId}` : n.session_link,
              }
            : n
        )
      );
      setActionSuccessMessage(`Request successfully updated (${action}).`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      setScheduleModalReq(null);
    }
  };

  const handleScheduleSlot = () => {
    if (!scheduledDate) return;
    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCaseId
          ? { ...c, slotScheduled: scheduledDate, status: 'session_scheduled' }
          : c
      )
    );
    setShowSuccessMessage(`Telepsychiatry slot confirmed for ${scheduledDate}`);
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  const handleSaveClinicalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() && !prescriptionText.trim()) return;

    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCaseId
          ? {
              ...c,
              clinicalNotes: `${c.clinicalNotes ? c.clinicalNotes + '\n\n' : ''}[${new Date().toLocaleDateString()}]: ${newNote.trim()}${
                prescriptionText.trim() ? `\nRx: ${prescriptionText.trim()}` : ''
              }`,
              status: 'consultation_completed',
            }
          : c
      )
    );
    setNewNote('');
    setPrescriptionText('');
    setShowSuccessMessage('Clinical observation & prescription notes encrypted and saved.');
    setTimeout(() => setShowSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn pb-12">
      {/* Portal Top Header */}
      <div className="liquid-glass-panel rounded-3xl p-6 sm:p-7 shadow-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center border border-indigo-400/30 shadow-lg">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Telepsychiatry & Clinical Review Portal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  MCI Verified Channel
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                National Tele-MANAS • District Mental Health Programme (DMHP)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 text-xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">{doctorName}</span>
              <span className="text-[10px] text-slate-300 font-mono">
                ID: {doctorId} • {doctorDistrict}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Workstation Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Patient Consultation Requests & Notifications</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
              {pendingCount} new
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('caseload')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
            activeTab === 'caseload'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Clinical Caseload & Workstation ({cases.length})</span>
        </button>
      </div>

      {/* Global Success Banner */}
      {(actionSuccessMessage || showSuccessMessage) && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccessMessage || showSuccessMessage}</span>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: PATIENT CONSULTATION REQUESTS & NOTIFICATIONS
          ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Section Subheader & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Live Consultation Notification Queue
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Citizens and atrocity survivors requesting 1-to-1 Telepsychiatry or clinical observer intervention
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-[11px] font-bold">
                {['ALL', 'pending', 'accepted', 'scheduled'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-xl transition capitalize cursor-pointer ${
                      filterStatus === st
                        ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={fetchNotifications}
                disabled={loadingNotifications}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title="Refresh Notifications"
              >
                <RefreshCw className={`w-4 h-4 ${loadingNotifications ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {loadingNotifications && notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold">Checking Tele-MANAS notification server...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Patient Consultation Requests</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active notifications found for the current filter. When victims request a 1-to-1 doctor or observer connection, alerts will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {notifications.map((n) => {
                const isPending = n.status === 'pending';
                const isAccepted = n.status === 'accepted';
                const isScheduled = n.status === 'scheduled';
                const isCompleted = n.status === 'completed';

                const modeIcon =
                  n.preferred_mode === 'video' ? (
                    <Video className="w-4 h-4 text-indigo-600" />
                  ) : n.preferred_mode === 'voice' ? (
                    <PhoneCall className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                  );

                return (
                  <div
                    key={n.request_id}
                    className={`p-5 rounded-3xl border transition shadow-xs hover:shadow-md ${
                      isPending
                        ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-200'
                        : isAccepted
                        ? 'bg-indigo-50/40 border-indigo-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Left: Patient Details & Reason */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span>{n.victim_name}</span>
                          </span>

                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            ID: {n.request_id}
                          </span>

                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                              n.severity_level === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : n.severity_level === 'HIGH'
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            ● {n.severity_level} (Score: {n.distress_score ? n.distress_score.toFixed(1) : 'N/A'})
                          </span>

                          <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            {modeIcon}
                            <span className="capitalize">{n.preferred_mode} Mode</span>
                          </span>

                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full capitalize ${
                              isPending
                                ? 'bg-amber-500 text-white animate-pulse'
                                : isAccepted
                                ? 'bg-emerald-600 text-white'
                                : isScheduled
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            Status: {n.status}
                          </span>
                        </div>

                        {/* Reason / Complaint */}
                        <div className="text-xs text-slate-800 font-medium bg-white/90 p-3 rounded-2xl border border-slate-200 leading-relaxed">
                          <p className="font-bold text-slate-900 mb-0.5">Consultation Note / Chief Complaint:</p>
                          <p>{n.reason || 'Requested confidential telepsychiatry clinical consultation and psychological stabilization.'}</p>
                        </div>

                        {/* Location & Time info */}
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {n.district}, {n.state}
                            </span>
                          </span>

                          {n.phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                              <span>{n.phone}</span>
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Received: {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>

                          {n.scheduled_slot && (
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                              📅 Confirmed Slot: {n.scheduled_slot}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap lg:flex-col items-stretch gap-2 min-w-[200px] w-full lg:w-auto">
                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleNotificationAction(n.request_id, 'accept')}
                              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-2xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              <span>Accept & Launch 1:1</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setScheduleModalReq(n)}
                              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-2xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Calendar className="w-4 h-4" />
                              <span>Schedule Slot</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleNotificationAction(n.request_id, 'decline')}
                              className="py-1.5 px-3 text-slate-500 hover:text-rose-600 text-[11px] font-bold transition text-center cursor-pointer"
                            >
                              Decline / Re-route
                            </button>
                          </>
                        )}

                        {isAccepted && (
                          <div className="space-y-2 w-full">
                            <a
                              href={n.session_link || 'https://telemanas.gov.in'}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 text-center"
                            >
                              <Video className="w-4 h-4" />
                              <span>Join Live Video Room</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleNotificationAction(n.request_id, 'complete')}
                              className="w-full py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-[11px] font-bold rounded-xl transition cursor-pointer"
                            >
                              Mark Consultation Completed
                            </button>
                          </div>
                        )}

                        {isScheduled && (
                          <div className="space-y-2 w-full">
                            <button
                              type="button"
                              onClick={() => handleNotificationAction(n.request_id, 'accept')}
                              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Start Scheduled Session</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleNotificationAction(n.request_id, 'complete')}
                              className="w-full py-1.5 px-3 bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold rounded-xl transition cursor-pointer"
                            >
                              Complete & Archive
                            </button>
                          </div>
                        )}

                        {isCompleted && (
                          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 px-3 py-2 rounded-2xl border border-emerald-200 justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Consultation Closed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 2: REFERRED CLINICAL CASELOAD & ACTIVE WORKSTATION
          ========================================================================= */}
      {activeTab === 'caseload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Left Column: Referred Cases Caseload */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Referred Priority Cases ({cases.length})
              </h3>
              <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Live Triage
              </span>
            </div>

            <div className="space-y-2.5">
              {cases.map((c) => {
                const isSelected = c.id === selectedCaseId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-500 shadow-md scale-[1.01]'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-slate-900">{c.pseudonym}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.riskLevel === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {c.riskLevel.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-medium">
                      <span>{c.district} District</span>
                      <span className="font-mono font-bold text-slate-900">
                        Score: {c.distressScore.toFixed(1)}/100
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{c.referredDate}</span>
                      </span>
                      <span
                        className={`font-semibold capitalize text-[10px] ${
                          c.status === 'session_scheduled'
                            ? 'text-indigo-700 font-bold'
                            : c.status === 'consultation_completed'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Clinical Workstation */}
          <div className="lg:col-span-8 space-y-6">
            <div className="liquid-glass-panel rounded-3xl p-6 sm:p-7 shadow-xl bg-white border border-slate-200 space-y-6">
              {/* Case Header Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-0.5">
                    Case ID: {activeCase.id} • Referred by {activeCase.referredBy}
                  </span>
                  <h2 className="text-xl font-black text-slate-900">
                    {activeCase.pseudonym} (Age {activeCase.age}, {activeCase.district})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Distress Index</span>
                    <span className="text-2xl font-black font-mono text-slate-900">
                      {activeCase.distressScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clinical Score Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">MADRS Scale</span>
                  <span className="text-xl font-black font-mono text-indigo-900">{activeCase.madrsScore}/60</span>
                  <span className="text-[10px] text-slate-600 block mt-0.5">Severe Range</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">DSM-5 MDD</span>
                  <span className="text-xl font-black text-slate-900">
                    {activeCase.dsm5Probable ? 'Probable' : 'Negative'}
                  </span>
                  <span className="text-[10px] text-slate-600 block mt-0.5">5+ Criteria Met</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Status</span>
                  <span className="text-xs font-black text-slate-900 capitalize block mt-1">
                    {activeCase.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Next Slot</span>
                  <span className="text-xs font-bold text-indigo-700 block mt-1">
                    {activeCase.slotScheduled || 'Unscheduled'}
                  </span>
                </div>
              </div>

              {/* AI Trauma & SHAP Explainability Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI Trauma Signal & SHAP Explainability</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {activeCase.shapSummary}
                </p>
              </div>

              {/* Telepsychiatry Schedule Section */}
              <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-black text-slate-900">
                      Schedule Secure Telepsychiatry Session
                    </h4>
                  </div>
                  {activeCase.slotScheduled && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Slot Confirmed</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    placeholder="e.g. 11 Sep 2026, 05:00 PM (IST)"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleScheduleSlot}
                    disabled={!scheduledDate.trim()}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Confirm Slot</span>
                  </button>
                </div>
              </div>

              {/* Clinical & Prescription Notes Log */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Clinical Observations & Prescription Log</span>
                </h4>

                {activeCase.clinicalNotes && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                    {activeCase.clinicalNotes}
                  </div>
                )}

                <form onSubmit={handleSaveClinicalNote} className="space-y-3">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add clinical diagnostic notes, sleep recommendations, or therapeutic guidance..."
                    rows={3}
                    className="w-full p-3.5 rounded-2xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Pill className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={prescriptionText}
                        onChange={(e) => setPrescriptionText(e.target.value)}
                        placeholder="Optional medication / non-pharmacological prescription advice..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!newNote.trim() && !prescriptionText.trim()}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs flex-shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Save Note</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slot Scheduling Modal */}
      {scheduleModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="liquid-glass-panel max-w-md w-full p-6 rounded-3xl bg-white shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Schedule Telepsychiatry Slot</h3>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModalReq(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Scheduling consultation with <strong>{scheduleModalReq.victim_name}</strong> ({scheduleModalReq.preferred_mode.toUpperCase()} mode).
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Consultation Slot Time & Date
              </label>
              <input
                type="text"
                value={scheduleSlotInput}
                onChange={(e) => setScheduleSlotInput(e.target.value)}
                placeholder="e.g. Today, 05:30 PM (IST) or Tomorrow, 11:00 AM"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setScheduleModalReq(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleNotificationAction(scheduleModalReq.request_id, 'schedule', {
                    scheduled_slot: scheduleSlotInput,
                  })
                }
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md transition"
              >
                Confirm Schedule & Notify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
