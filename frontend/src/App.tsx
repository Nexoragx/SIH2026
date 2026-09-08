import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Onboarding } from './components/victim/Onboarding';
import { TileQuestionnaire } from './components/victim/TileQuestionnaire';
import { AssessmentResult } from './components/victim/AssessmentResult';
import { VoiceRecorder } from './components/victim/VoiceRecorder';
import { CrisisModal } from './components/victim/CrisisModal';
import { VictimChatbot } from './components/victim/VictimChatbot';
import { VictimObserverChat } from './components/victim/VictimObserverChat';
import { ObserverDashboard } from './components/observer/ObserverDashboard';
import { NationalAnalytics } from './components/analytics/NationalAnalytics';
import { ResourceDirectory } from './components/resources/ResourceDirectory';
import { UserProfile, AssessmentResponse, AssessmentResultData, RiskLevel, ChatMessage } from './types';
import { Bot, MessageSquare } from 'lucide-react';

export const App: React.FC = () => {
  // Global State
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [activeTab, setActiveTab] = useState<'victim' | 'observer' | 'analytics' | 'resources'>('victim');
  const [voiceGuidance, setVoiceGuidance] = useState<boolean>(false);
  const [isCrisisOpen, setIsCrisisOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [isObserverChatOpen, setIsObserverChatOpen] = useState<boolean>(false);
  const [voiceCheckinDone, setVoiceCheckinDone] = useState<boolean>(false);
  const [voiceData, setVoiceData] = useState<{ transcript: string; stressScore: number; audioUrl?: string } | null>(null);

  // Victim flow state: 'onboarding' | 'questionnaire' | 'result'
  const [victimStep, setVictimStep] = useState<'onboarding' | 'questionnaire' | 'result'>('onboarding');

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

  const computeClinicalScore = (
    responses: AssessmentResponse[],
    voiceSample?: { transcript: string; stressScore: number; audioUrl?: string }
  ) => {
    const rawMadrs = responses.reduce((sum, r) => sum + r.madrsScore, 0);
    const madrsNorm = (rawMadrs / 60) * 40;
    const phq9Raw = Math.min(27, Math.round((rawMadrs / 60) * 27));
    const phq9Norm = (phq9Raw / 27) * 20;
    const voiceScore = voiceSample ? (voiceSample.stressScore / 100) * 10 : 4.0;
    const nlpScore = 9.0;
    const contextBonus = userProfile.caseCategory === 'caste_violence' || userProfile.caseCategory === 'sexual_violence' ? 10 : 6;
    const totalScore = Math.min(100, Math.round((madrsNorm + phq9Norm + voiceScore + nlpScore + contextBonus) * 10) / 10);

    let riskLevel: RiskLevel = 'low';
    let checkinDays = 14;

    if (totalScore >= 76) {
      riskLevel = 'critical';
      checkinDays = 1;
    } else if (totalScore >= 51) {
      riskLevel = 'high';
      checkinDays = 3;
    } else if (totalScore >= 26) {
      riskLevel = 'moderate';
      checkinDays = 7;
    } else {
      riskLevel = 'low';
      checkinDays = 14;
    }

    const q10Response = responses.find((r) => r.questionId === 10);
    const hasCrisisFlag = q10Response ? q10Response.madrsScore >= 4 : false;

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
      finalDistressScore: totalScore,
      riskLevel,
      crisisFlag: hasCrisisFlag,
      threatFlag: userProfile.caseCategory === 'witness_intimidation' || rawMadrs > 30,
      dsm5Probable: rawMadrs >= 20,
      shapFactors: [
        { name: 'Apparent & Reported Sadness (MADRS 1-2)', impact: 26, description: 'Dominant depressive affect' },
        { name: 'Sleep & Somatic Fatigue (MADRS 4,7)', impact: 24, description: 'Severe sleep disruption' },
        { name: 'Inner Dread & Anxiety (MADRS 3)', impact: 22, description: 'Threat and safety tension' },
        { name: 'Vocal Biomarker Tension', impact: 14, description: 'Micro-tremor and speaking rate latency' },
        { name: 'Legal & Case Hardship Context', impact: 14, description: 'Court anxiety and social ostracism' },
      ],
      predictedScoreNextWeek: Math.min(100, totalScore + 4.5),
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
    setVictimStep('result');
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setVictimStep('questionnaire');
  };

  const handleQuestionnaireComplete = (responses: AssessmentResponse[]) => {
    computeClinicalScore(responses, voiceData || undefined);
  };

  const handleSaveVoiceSample = (data: { transcript: string; stressScore: number; audioUrl?: string }) => {
    setVoiceData(data);
    setVoiceCheckinDone(true);
  };

  const handleRestart = () => {
    setVictimStep('onboarding');
    setVoiceCheckinDone(false);
    setVoiceData(null);
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
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 relative z-10">
        {activeTab === 'victim' && (
          <div>
            {victimStep === 'onboarding' && (
              <Onboarding
                currentLang={currentLang}
                onLanguageChange={setCurrentLang}
                voiceGuidance={voiceGuidance}
                onToggleVoiceGuidance={() => setVoiceGuidance(!voiceGuidance)}
                onComplete={handleOnboardingComplete}
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

            {victimStep === 'result' && (
              <AssessmentResult
                currentLang={currentLang}
                resultData={resultData}
                userProfile={userProfile}
                onRestart={handleRestart}
                onOpenObserverView={() => setActiveTab('observer')}
                onOpenChatbot={() => setIsChatbotOpen(true)}
                onOpenObserverChat={() => setIsObserverChatOpen(true)}
              />
            )}
          </div>
        )}

        {activeTab === 'observer' && (
          <ObserverDashboard onTriggerCrisisGlobal={() => setIsCrisisOpen(true)} />
        )}

        {activeTab === 'analytics' && <NationalAnalytics />}

        {activeTab === 'resources' && <ResourceDirectory />}
      </main>

      {/* Floating Action Buttons: AI Saathi & 1:1 Observer Chat */}
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
