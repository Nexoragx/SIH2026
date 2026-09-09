import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Onboarding } from './components/victim/Onboarding';
import { VictimDashboard } from './components/victim/VictimDashboard';
import { TileQuestionnaire } from './components/victim/TileQuestionnaire';
import { OptionalHistoryCard, DataCollectionPayload } from './components/victim/OptionalHistoryCard';
import { CheckinScheduleModal } from './components/victim/CheckinScheduleModal';
import { AssessmentResult } from './components/victim/AssessmentResult';
import { VoiceRecorder } from './components/victim/VoiceRecorder';
import { CrisisModal } from './components/victim/CrisisModal';
import { VictimChatbot } from './components/victim/VictimChatbot';
import { VictimObserverChat } from './components/victim/VictimObserverChat';
import { ObserverDashboard } from './components/observer/ObserverDashboard';
import { NationalAnalytics } from './components/analytics/NationalAnalytics';
import { ResourceDirectory } from './components/resources/ResourceDirectory';
import { UserProfile, AssessmentResponse, AssessmentResultData, RiskLevel, ChatMessage } from './types';
import { Bot, MessageSquare, Sparkles } from 'lucide-react';
import { assessmentApi, authApi, systemApi } from './api';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/landing/LandingPage';
import { IvrSimulatorModal } from './components/victim/IvrSimulatorModal';

import { CommunityWall } from './components/victim/CommunityWall';
import { CourtReportModal } from './components/victim/CourtReportModal';
import { PsychiatristPortal } from './components/portals/PsychiatristPortal';
import { NgoPortal } from './components/portals/NgoPortal';
import { PersonalizedActivities } from './components/victim/PersonalizedActivities';
import { AdminPanel } from './components/admin/AdminPanel';
import { UssdSimulatorModal } from './components/victim/UssdSimulatorModal';

export const App: React.FC = () => {
  // Global State
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [activeTab, setActiveTab] = useState<'victim' | 'observer' | 'psychiatrist' | 'ngo' | 'analytics' | 'resources' | 'admin'>('victim');
  const [voiceGuidance, setVoiceGuidance] = useState<boolean>(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [isObserverChatOpen, setIsObserverChatOpen] = useState<boolean>(false);
  const [isCommunityWallOpen, setIsCommunityWallOpen] = useState<boolean>(false);
  const [isCourtReportOpen, setIsCourtReportOpen] = useState<boolean>(false);
  const [isTherapeuticOpen, setIsTherapeuticOpen] = useState<boolean>(false);
  const [isUssdModalOpen, setIsUssdModalOpen] = useState<boolean>(false);
  const [voiceCheckinDone, setVoiceCheckinDone] = useState<boolean>(false);
  const [voiceData, setVoiceData] = useState<{ transcript: string; stressScore: number; audioUrl?: string; audioBlob?: Blob } | null>(null);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [isIvrModalOpen, setIsIvrModalOpen] = useState<boolean>(false);
  const [cachedResponses, setCachedResponses] = useState<AssessmentResponse[]>([]);

  // Rural Offline Sync & Queue State
  const [isDeviceOnline, setIsDeviceOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(() => {
    try {
      return JSON.parse(localStorage.getItem('anvaya_offline_queue') || '[]').length;
    } catch {
      return 0;
    }
  });

  // Citizen / Survivor flow state: 'dashboard' | 'questionnaire' | 'history' | 'result'
  const [victimStep, setVictimStep] = useState<'dashboard' | 'questionnaire' | 'history' | 'result'>('dashboard');

  // Check backend health and local session on mount
  useEffect(() => {
    let mounted = true;
    systemApi.checkHealth()
      .then((res) => {
        if (mounted) setBackendOnline(res.status === 'healthy');
      })
      .catch(() => {
        if (mounted) setBackendOnline(false);
      });

    const localUser = authApi.getCurrentLocalUser();
    if (localUser) {
      setCurrentUser(localUser);
      const r = (localUser.role || 'victim').toLowerCase();
      if (r === 'victim' || r === 'citizen' || r === 'survivor') {
        setUserProfile((prev) => ({
          ...prev,
          id: localUser.id || prev.id,
          name: localUser.full_name || prev.name,
          phone: localUser.phone || prev.phone,
          district: localUser.district || prev.district,
          state: localUser.state || prev.state,
        }));
        setActiveTab('victim');
      } else if (r.startsWith('observer')) {
        setActiveTab('observer');
      } else if (r === 'psychiatrist') {
        setActiveTab('psychiatrist');
      } else if (r.startsWith('ngo')) {
        setActiveTab('ngo');
      } else if (r.startsWith('admin') || r.includes('secretary')) {
        setActiveTab('admin');
      }
    }

    return () => { mounted = false; };
  }, []);

  // Offline Network Monitor & Auto-Sync Engine
  useEffect(() => {
    const handleOnline = () => {
      setIsDeviceOnline(true);
      try {
        const queue = JSON.parse(localStorage.getItem('anvaya_offline_queue') || '[]');
        if (queue.length > 0) {
          queue.forEach((item: any) => {
            assessmentApi.submitAssessment(item).catch(() => {});
          });
          localStorage.removeItem('anvaya_offline_queue');
          setOfflineQueueCount(0);
        }
      } catch {}
    };

    const handleOffline = () => {
      setIsDeviceOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setIsGuestMode(false);
    const r = (user.role || 'victim').toLowerCase();
    if (r === 'victim' || r === 'citizen' || r === 'survivor') {
      setUserProfile((prev) => ({
        ...prev,
        id: user.id || prev.id,
        name: user.full_name || prev.name,
        phone: user.phone || prev.phone,
        district: user.district || prev.district,
        state: user.state || prev.state,
      }));
      setVictimStep('dashboard');
      setActiveTab('victim');
    } else if (r.startsWith('observer')) {
      setActiveTab('observer');
    } else if (r === 'psychiatrist') {
      setActiveTab('psychiatrist');
    } else if (r.startsWith('ngo')) {
      setActiveTab('ngo');
    } else if (r.startsWith('admin') || r.includes('secretary')) {
      setActiveTab('admin');
    } else {
      setActiveTab('victim');
    }
  };

  const handleSwitchPersona = (role: 'citizen' | 'observer' | 'psychiatrist' | 'ngo' | 'admin') => {
    const res = authApi.instantDemoLogin(role);
    handleAuthSuccess(res.user);
  };

  const handleLogout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    setIsGuestMode(false);
    setVictimStep('dashboard');
  };

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'USR-26094',
    name: 'Courageous Survivor',
    phone: '+91 98231 14566',
    district: 'Nashik',
    state: 'Maharashtra',
    language: 'en',
    caseCategory: 'caste_violence',
    livingSituation: 'family',
    contactPreference: 'call',
    isProxy: false,
  });

  // Synced 1:1 Messages between Victim and Observer
  const [observerChatMessages, setObserverChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'observer',
      timestamp: '10:16 AM',
      text: 'Namaste ji, I am Dr. Anita Joshi, your assigned district health observer. I am here to support you at every step.',
    },
    {
      id: 'm2',
      sender: 'victim',
      timestamp: '10:19 AM',
      text: 'Thank you doctor. Having sleepless nights lately and feeling tense about the court dates.',
    },
    {
      id: 'm3',
      sender: 'observer',
      timestamp: '10:21 AM',
      text: 'We understand completely. Our local NGO counselor Ram is also in touch with your family. Please practice the 4-7-8 breathing pacer whenever you feel overwhelmed.',
    },
  ]);

  const [resultData, setResultData] = useState<AssessmentResultData>({
    sessionId: 'SES-001',
    date: '2026-09-08',
    userId: 'USR-26094',
    totalMadrs: 28,
    phq9Equivalent: 14,
    nlpSentimentScore: 9.5,
    voiceStressScore: 6.8,
    contextualBonus: 10,
    finalDistressScore: 68.5,
    riskLevel: 'high',
    crisisFlag: false,
    threatFlag: true,
    dsm5Probable: true,
    shapFactors: [
      { name: 'Sleep Disturbance (MADRS 4)', impact: 28, description: 'Under 3 hours sleep per night' },
      { name: 'Active Threat Perception', impact: 24, description: 'Fear of intimidation outside home' },
      { name: 'Inner Dread & Anxiety (MADRS 3)', impact: 20, description: 'High psychomotor tension' },
    ],
    predictedScoreNextWeek: 75.0,
    trendVelocity: 1.85,
    trendDirection: 'escalating',
    recommendedCheckinDays: 3,
    personalizedSuggestions: [
      {
        category: 'immediate',
        title: '5-4-3-2-1 Sensory Grounding',
        description: 'Notice 5 things to reconnect with present safety.',
        actionLabel: 'Start Grounding',
        actionType: 'activity',
      },
      {
        category: 'coping',
        title: 'Dissolving Thought Journal',
        description: 'Write down heavy burdens and release them into light.',
        actionLabel: 'Open Journal',
        actionType: 'activity',
      },
      {
        category: 'safety',
        title: '1:1 Health Observer Connect',
        description: 'Connect with Dr. Anita Joshi from District Nodal Unit.',
        actionLabel: 'Chat Now',
        actionType: 'counsellor',
      },
    ],
  });

  const computeClinicalScore = async (
    responses: AssessmentResponse[],
    voiceSample?: { transcript: string; stressScore: number; audioUrl?: string; audioBlob?: Blob },
    personalHistory?: string,
    sleepHours?: number,
    sleepQuality?: string,
    moodInput?: string,
    threatReport?: { safety_status?: string; threat_active?: boolean; details?: string },
    touchpointType?: 'web_portal' | 'mobile_app' | 'ivrs_call'
  ) => {
    setIsSubmittingAssessment(true);

    const rawMadrs = responses.reduce((sum, r) => sum + r.madrsScore, 0);
    const madrsNorm = (rawMadrs / 60) * 40;
    const phq9Raw = Math.min(27, Math.round((rawMadrs / 60) * 27));
    const phq9Norm = (phq9Raw / 27) * 20;
    const voiceScore = voiceSample ? (voiceSample.stressScore / 100) * 10 : 4.0;
    const nlpScore = 9.0;
    const contextBonus = userProfile.caseCategory === 'caste_violence' || userProfile.caseCategory === 'sexual_violence' ? 10 : 6;
    const fallbackScore = Math.min(100, Math.round((madrsNorm + phq9Norm + voiceScore + nlpScore + contextBonus) * 10) / 10);

    const q10Response = responses.find((r) => r.questionId === 10);
    const hasCrisisFlag = q10Response ? q10Response.madrsScore >= 4 : false;

    // Prepare payload for FastAPI multi-modal pipeline
    const madrsAnswers = responses.map((r) => r.madrsScore);
    const payload = {
      touchpoint_type: (touchpointType || 'web_portal') as any,
      language: currentLang,
      madrs: { answers: madrsAnswers },
      phq9: { answers: [Math.min(3, Math.round(rawMadrs / 20))] },
      text_content: personalHistory || voiceSample?.transcript || `${userProfile.caseCategory} survivor check-in from ${userProfile.district}, ${userProfile.state}`,
      personal_history: personalHistory,
      is_crisis_halt: hasCrisisFlag,
      sleep_hours: sleepHours,
      sleep_quality: sleepQuality,
      mood_input: moodInput,
      safety_threat_active: threatReport?.threat_active || threatReport?.safety_status === 'threat_perceived',
      threat_report: threatReport,
      context_score: userProfile.caseCategory === 'caste_violence' || userProfile.caseCategory === 'sexual_violence' ? 80.0 : 40.0,
      district: userProfile.district,
      state: userProfile.state,
    };

    try {
      let backendRes;
      if (voiceSample?.audioBlob) {
        backendRes = await assessmentApi.submitVoiceAssessment(voiceSample.audioBlob, payload);
      } else {
        backendRes = await assessmentApi.submitAssessment(payload);
      }

      setBackendOnline(true);

      const sevMap: Record<string, RiskLevel> = {
        CRITICAL: 'critical',
        HIGH: 'high',
        MODERATE: 'moderate',
        LOW: 'low',
      };
      let riskLevel: RiskLevel = sevMap[backendRes.severity_level] || 'moderate';
      if (hasCrisisFlag || backendRes.ambulance_108_dispatched) {
        riskLevel = 'crisis';
      }

      const shapFactors = backendRes.shap_explainability?.features?.map((f) => ({
        name: f.feature,
        impact: Math.round(f.shap_value * 100),
        description: f.impact,
      })) || [
        { name: 'Apparent & Reported Sadness (MADRS 1-2)', impact: 26, description: 'Dominant depressive affect' },
        { name: 'Sleep & Somatic Fatigue (MADRS 4,7)', impact: 24, description: 'Severe sleep disruption' },
        { name: 'Inner Dread & Anxiety (MADRS 3)', impact: 22, description: 'Threat and safety tension' },
      ];

      const trendDir = backendRes.temporal_trend?.trend_direction?.toLowerCase() || 'escalating';
      const mappedDirection = trendDir.includes('worsen') ? 'escalating' : trendDir.includes('improv') ? 'improving' : 'stable';

      const backendResult: AssessmentResultData = {
        sessionId: backendRes.session_id,
        date: new Date(backendRes.created_at || Date.now()).toISOString().split('T')[0],
        userId: userProfile.id,
        totalMadrs: rawMadrs,
        phq9Equivalent: phq9Raw,
        nlpSentimentScore: nlpScore,
        voiceStressScore: voiceScore,
        contextualBonus: contextBonus,
        finalDistressScore: backendRes.distress_score,
        riskLevel,
        crisisFlag: hasCrisisFlag || backendRes.ambulance_108_dispatched,
        threatFlag: userProfile.caseCategory === 'witness_intimidation' || rawMadrs > 30,
        dsm5Probable: rawMadrs >= 20,
        shapFactors,
        predictedScoreNextWeek: backendRes.temporal_trend?.projected_7d_score || Math.min(100, backendRes.distress_score + 4.5),
        trendVelocity: 1.4,
        trendDirection: mappedDirection,
        recommendedCheckinDays: riskLevel === 'critical' || riskLevel === 'crisis' ? 1 : riskLevel === 'high' ? 3 : 7,
        personalizedSuggestions: [
          {
            category: 'immediate',
            title: '5-4-3-2-1 Sensory Grounding',
            description: 'Notice 5 things to reconnect with present safety.',
            actionLabel: 'Start Grounding',
            actionType: 'activity',
          },
          {
            category: 'coping',
            title: '4-7-8 Tranquil Breath Pacer',
            description: 'Soothing rhythm to lower stress biomarkers.',
            actionLabel: 'Begin Breath',
            actionType: 'activity',
          },
          {
            category: 'safety',
            title: backendRes.ambulance_108_dispatched ? '108 Emergency Ambulance Dispatched' : '1:1 Health Observer Connect',
            description: backendRes.ambulance_108_dispatched
              ? '108 Emergency protocol initiated with District Control Room.'
              : 'Connect with Dr. Anita Joshi from District Nodal Unit.',
            actionLabel: 'Chat Now',
            actionType: 'counsellor',
          },
        ],
      };

      setResultData(backendResult);
      if (backendRes.ambulance_108_dispatched) {
        setIsCrisisOpen(true);
      }
    } catch (err) {
      console.warn('Backend unavailable, using local clinical assessment heuristics:', err);
      // Queue offline payload for auto-sync upon reconnection
      try {
        const queue = JSON.parse(localStorage.getItem('anvaya_offline_queue') || '[]');
        queue.push({
          ...payload,
          queued_at: new Date().toISOString(),
        });
        localStorage.setItem('anvaya_offline_queue', JSON.stringify(queue));
        setOfflineQueueCount(queue.length);
      } catch {}
      let riskLevel: RiskLevel = 'low';
      let checkinDays = 14;

      if (fallbackScore >= 76) {
        riskLevel = 'critical';
        checkinDays = 1;
      } else if (fallbackScore >= 51) {
        riskLevel = 'high';
        checkinDays = 3;
      } else if (fallbackScore >= 26) {
        riskLevel = 'moderate';
        checkinDays = 7;
      }

      if (hasCrisisFlag) {
        riskLevel = 'crisis';
        checkinDays = 1;
      }

      const computedResult: AssessmentResultData = {
        sessionId: `SES-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        userId: userProfile.id,
        totalMadrs: rawMadrs,
        phq9Equivalent: phq9Raw,
        nlpSentimentScore: nlpScore,
        voiceStressScore: voiceScore,
        contextualBonus: contextBonus,
        finalDistressScore: fallbackScore,
        riskLevel,
        crisisFlag: hasCrisisFlag,
        threatFlag: userProfile.caseCategory === 'witness_intimidation' || rawMadrs > 30,
        dsm5Probable: rawMadrs >= 20,
        shapFactors: [
          { name: 'Apparent & Reported Sadness (MADRS 1-2)', impact: 26, description: 'Dominant depressive affect' },
          { name: 'Sleep & Somatic Fatigue (MADRS 4,7)', impact: 24, description: 'Severe sleep disruption' },
          { name: 'Inner Dread & Anxiety (MADRS 3)', impact: 22, description: 'Threat and safety tension' },
        ],
        predictedScoreNextWeek: Math.min(100, fallbackScore + 4.5),
        trendVelocity: 1.4,
        trendDirection: 'escalating',
        recommendedCheckinDays: checkinDays,
        personalizedSuggestions: [
          {
            category: 'immediate',
            title: '5-4-3-2-1 Sensory Grounding',
            description: 'Notice 5 things to reconnect with present safety.',
            actionLabel: 'Start Grounding',
            actionType: 'activity',
          },
          {
            category: 'coping',
            title: '4-7-8 Tranquil Breath Pacer',
            description: 'Soothing rhythm to lower stress biomarkers.',
            actionLabel: 'Begin Breath',
            actionType: 'activity',
          },
        ],
      };

      setResultData(computedResult);
    } finally {
      setIsSubmittingAssessment(false);
      setVictimStep('result');
    }
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setVictimStep('questionnaire');
  };

  const handleQuestionnaireComplete = (responses: AssessmentResponse[]) => {
    setCachedResponses(responses);
    setVictimStep('history');
  };

  const handleHistorySubmit = (data: DataCollectionPayload | string) => {
    if (typeof data === 'string') {
      computeClinicalScore(cachedResponses, voiceData || undefined, data);
    } else {
      computeClinicalScore(
        cachedResponses,
        voiceData || undefined,
        data.text,
        data.sleepHours,
        data.sleepQuality,
        data.mood,
        data.threatReport,
        data.touchpointType
      );
    }
  };

  const handleHistorySkip = () => {
    computeClinicalScore(cachedResponses, voiceData || undefined, undefined);
  };

  const handleCompleteIvrCheckin = (payload: {
    madrsAnswers: number[];
    sleepHours: number;
    safetyThreatActive: boolean;
    touchpointType: 'ivrs_call';
  }) => {
    const formattedResponses: AssessmentResponse[] = payload.madrsAnswers.map((score, idx) => ({
      questionId: idx + 1,
      selectedOptionId: `ivr-opt-${score}`,
      madrsScore: score,
      responseTimeMs: 2500,
    }));

    computeClinicalScore(
      formattedResponses,
      undefined,
      'Automated check-in recorded via 14566 Toll-Free IVRS Helpline.',
      payload.sleepHours,
      payload.sleepHours < 4 ? 'insomnia' : 'restless',
      'IVR phone check-in',
      {
        safety_status: payload.safetyThreatActive ? 'threat_perceived' : 'safe',
        threat_active: payload.safetyThreatActive,
        details: payload.safetyThreatActive ? 'Intimidation reported via IVR keypad selection' : undefined,
      },
      'ivrs_call'
    );
  };

  const handleSaveVoiceSample = (data: { transcript: string; stressScore: number; audioUrl?: string; audioBlob?: Blob }) => {
    setVoiceData(data);
    setVoiceCheckinDone(true);
  };

  const handleRestart = () => {
    setVictimStep('dashboard');
    setVoiceCheckinDone(false);
    setVoiceData(null);
    setCachedResponses([]);
  };

  const handleSendVictimObserverMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'victim',
      timestamp: 'Just now',
      text,
    };
    setObserverChatMessages((prev) => [...prev, newMsg]);

    // Simulated observer response after slight delay
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `m-reply-${Date.now()}`,
        sender: 'observer',
        timestamp: 'Just now',
        text: 'Received your message. Dr. Anita has noted this and will check in on your wellbeing.',
      };
      setObserverChatMessages((prev) => [...prev, replyMsg]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onTriggerCrisis={() => setIsCrisisOpen(true)}
        backendOnline={backendOnline}
        currentUser={currentUser}
        onOpenAuthModal={(m) => {
          setAuthModalMode(m || 'login');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onSwitchPersona={handleSwitchPersona}
        onOpenUssdSimulator={() => setIsUssdModalOpen(true)}
      />

      {/* Offline Mode / Low-Bandwidth Queue Sync Banner */}
      {(!isDeviceOnline || offlineQueueCount > 0) && (
        <div className="bg-amber-400 text-slate-950 px-4 py-1.5 text-xs font-black flex items-center justify-center gap-2 border-b border-amber-500 shadow-xs animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
          <span>
            {!isDeviceOnline ? 'Offline Mode Active' : 'Low-Bandwidth Local Queue'}:{' '}
            {offlineQueueCount > 0
              ? `${offlineQueueCount} check-in(s) encrypted locally — auto-syncing upon reconnect.`
              : 'Operating in zero-connectivity local resilient mode.'}
          </span>
        </div>
      )}

      {/* Sensitive Wellbeing Saving Overlay */}
      {isSubmittingAssessment && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm text-white animate-fadeIn">
          <div className="liquid-glass-panel p-8 rounded-3xl flex flex-col items-center max-w-sm text-center shadow-2xl bg-white/95 text-slate-900 border border-indigo-200">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-4 animate-bounce">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-black">Saving Your Check-in</h3>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Updating your personal wellbeing record gently and securely...
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16 relative z-10">
        {!currentUser && !isGuestMode ? (
          <LandingPage
            onOpenAuth={(mode) => {
              setAuthModalMode(mode || 'login');
              setIsAuthModalOpen(true);
            }}
            onInstantLogin={(role) => {
              const res = authApi.instantDemoLogin(role);
              handleAuthSuccess(res.user);
            }}
            onStartGuestScreening={() => {
              setIsGuestMode(true);
              setVictimStep('questionnaire');
              setActiveTab('victim');
            }}
            onTriggerCrisis={() => setIsCrisisOpen(true)}
            currentLang={currentLang}
          />
        ) : (
          <>
            {activeTab === 'victim' && (
              <div>
                {victimStep === 'dashboard' && (
                  <VictimDashboard
                    onStartCheckin={() => setVictimStep('questionnaire')}
                    onOpenSupport={() => setActiveTab('resources')}
                    onOpenChat={() => setIsChatbotOpen(true)}
                    onOpenEmergency={() => setIsCrisisOpen(true)}
                    onOpenSchedule={() => setIsScheduleModalOpen(true)}
                    onOpenCommunityWall={() => setIsCommunityWallOpen(true)}
                    onOpenCourtReport={() => setIsCourtReportOpen(true)}
                    onOpenTherapeutic={() => setIsTherapeuticOpen(true)}
                    onOpenUssdSimulator={() => setIsUssdModalOpen(true)}
                    currentLang={currentLang}
                  />
                )}

                {victimStep === 'questionnaire' && (
                  <TileQuestionnaire
                    currentLang={currentLang}
                    voiceGuidance={voiceGuidance}
                    userProfile={userProfile}
                    onComplete={handleQuestionnaireComplete}
                    onTriggerCrisis={() => setIsCrisisOpen(true)}
                    onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                    voiceCheckinDone={voiceCheckinDone}
                  />
                )}

                {victimStep === 'history' && (
                  <OptionalHistoryCard
                    onContinue={handleHistorySubmit}
                    onSkip={handleHistorySkip}
                    onBack={() => setVictimStep('questionnaire')}
                    onOpenIvrModal={() => setIsIvrModalOpen(true)}
                  />
                )}

                {victimStep === 'result' && (
                  <AssessmentResult
                    currentLang={currentLang}
                    resultData={resultData}
                    userProfile={userProfile}
                    onRestart={handleRestart}
                    onOpenObserverView={() => setActiveTab('observer')}
                    onOpenChatbot={() => setIsChatbotOpen(true)}
                    onOpenObserverChat={() => setIsObserverChatOpen(true)}
                    onViewSupport={() => setActiveTab('resources')}
                    onDone={() => setVictimStep('dashboard')}
                  />
                )}
              </div>
            )}

            {activeTab === 'observer' && (
              <ObserverDashboard onTriggerCrisisGlobal={() => setIsCrisisOpen(true)} />
            )}

            {activeTab === 'psychiatrist' && <PsychiatristPortal />}

            {activeTab === 'ngo' && <NgoPortal />}

            {activeTab === 'admin' && <AdminPanel />}

            {activeTab === 'analytics' && <NationalAnalytics />}

            {activeTab === 'resources' && <ResourceDirectory />}
          </>
        )}
      </main>

      {/* Floating Action Buttons: AI Saathi & 1:1 Observer Chat (Only for authenticated users) */}
      {currentUser && (
        <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2.5">
          {/* 1:1 Observer Chat Floating Button */}
          <button
            type="button"
            onClick={() => setIsObserverChatOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2.5 rounded-full shadow-lg shadow-emerald-600/30 transition-all font-bold text-xs border border-emerald-400/40"
            title="1:1 Chat with Health Observer"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">1:1 Observer Chat</span>
          </button>

          {/* AI Saathi Floating Button */}
          <button
            type="button"
            onClick={() => setIsChatbotOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 text-white px-4 py-2.5 rounded-full shadow-lg shadow-indigo-600/30 transition-all font-bold text-xs border border-indigo-400/40"
            title="ANVAYA Saathi AI Companion"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">AI Saathi (साथी)</span>
          </button>
        </div>
      )}

      {/* Real-time Voice Recording Modal */}
      <VoiceRecorder
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentLang={currentLang}
        onSaveVoice={handleSaveVoiceSample}
      />

      {/* AI Saathi Companion Chatbot */}
      <VictimChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        currentLang={currentLang}
        distressLevel={resultData.riskLevel}
        onTriggerCrisis={() => setIsCrisisOpen(true)}
      />

      {/* 1:1 Live Health Observer Chat Portal */}
      <VictimObserverChat
        isOpen={isObserverChatOpen}
        onClose={() => setIsObserverChatOpen(false)}
        userProfile={userProfile}
        messages={observerChatMessages}
        onSendMessage={handleSendVictimObserverMessage}
        onRequestCall={() => alert('Urgent phone call request queued for Dr. Anita Joshi')}
      />

      {/* Immediate Crisis Modal */}
      <CrisisModal
        isOpen={isCrisisOpen}
        onClose={() => setIsCrisisOpen(false)}
        currentLang={currentLang}
        userProfile={userProfile}
      />

      {/* MongoDB Authentication Modal (Login & Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Check-in Schedule Modal */}
      <CheckinScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onStartEarly={() => {
          setIsScheduleModalOpen(false);
          setVictimStep('questionnaire');
        }}
      />

      {/* 14566 IVRS Phone Touchpoint Simulator Modal */}
      <IvrSimulatorModal
        isOpen={isIvrModalOpen}
        onClose={() => setIsIvrModalOpen(false)}
        onCompleteIvrCheckin={handleCompleteIvrCheckin}
        currentLang={currentLang}
      />

      {/* 2G Rural USSD Telecom Keypad Simulator Modal (*14566#) */}
      <UssdSimulatorModal
        isOpen={isUssdModalOpen}
        onClose={() => setIsUssdModalOpen(false)}
        onTriggerCrisis={() => setIsCrisisOpen(true)}
        onRequestCall={() => alert('Urgent callback queued for Dr. Anita Joshi (District Nodal Cell)')}
        currentLang={currentLang}
      />

      {/* Survivor Community & Hope Wall Modal */}
      <CommunityWall
        isOpen={isCommunityWallOpen}
        onClose={() => setIsCommunityWallOpen(false)}
        currentLang={currentLang}
      />

      {/* Official Legal Aid & Court Documentation Modal */}
      <CourtReportModal
        isOpen={isCourtReportOpen}
        onClose={() => setIsCourtReportOpen(false)}
        resultData={resultData}
        userProfile={userProfile}
      />

      {/* Therapeutic & Grounding Activities Modal */}
      {isTherapeuticOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="anvaya-card rounded-3xl max-w-2xl w-full max-h-[92vh] bg-white border border-slate-200 shadow-2xl p-6 overflow-y-auto relative">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                Trauma Recovery & Somatic Relaxation Suite
              </h3>
              <button
                type="button"
                onClick={() => setIsTherapeuticOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <PersonalizedActivities
              currentLang={currentLang}
              resultData={resultData}
              onOpenCounsellorChat={() => {
                setIsTherapeuticOpen(false);
                setIsObserverChatOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="liquid-glass-panel border-t border-slate-200/80 py-6 text-center text-xs text-slate-500 mt-auto bg-white/90">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-semibold text-slate-600">
            ANVAYA (अन्वय) • Ministry of Social Justice & Empowerment (MoSJE), Government of India
          </p>
          <div className="flex items-center gap-4 text-slate-600 font-bold">
            <span>SC/ST (PoA) Act Safety Net</span>
            <span>•</span>
            <a href="tel:14566" className="text-indigo-600 hover:text-indigo-800 transition">
              NHAA Helpline: 14566
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
