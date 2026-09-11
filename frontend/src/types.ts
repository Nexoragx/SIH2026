export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical' | 'crisis';

export type AtrocityCategory = 
  | 'caste_violence'
  | 'grievous_hurt'
  | 'arson'
  | 'sexual_violence'
  | 'witness_intimidation'
  | 'compensation_delay'
  | 'other';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  district: string;
  state: string;
  language: string;
  caseCategory: AtrocityCategory;
  caseNumber?: string;
  livingSituation: 'family' | 'alone' | 'shelter' | 'undisclosed';
  contactPreference: 'call' | 'whatsapp' | 'sms' | 'app';
  isProxy: boolean;
  proxyRelation?: string;
  assignedObserver?: {
    id: string;
    name: string;
    role: string;
    phone?: string;
    hospital?: string;
    assignedAt?: string;
  } | null;
}

export interface QuestionnaireTileOption {
  id: string;
  icon: string;
  labelKey: string;
  defaultLabel: string;
  madrsScore: number;
}

export interface QuestionItem {
  id: number;
  madrsItemNumber: number;
  domain: string;
  questionKey: string;
  defaultQuestion: string;
  options: QuestionnaireTileOption[];
}

export interface AssessmentResponse {
  questionId: number;
  selectedOptionId: string;
  madrsScore: number;
  responseTimeMs: number;
}

export interface AssessmentResultData {
  sessionId: string;
  date: string;
  userId: string;
  totalMadrs: number;
  phq9Equivalent: number;
  nlpSentimentScore: number;
  voiceStressScore: number;
  contextualBonus: number;
  finalDistressScore: number;
  riskLevel: RiskLevel;
  crisisFlag: boolean;
  threatFlag: boolean;
  dsm5Probable: boolean;
  shapFactors: { name: string; impact: number; description: string }[];
  predictedScoreNextWeek: number;
  trendVelocity: number;
  trendDirection: 'improving' | 'stable' | 'escalating';
  recommendedCheckinDays: number;
  personalizedSuggestions: {
    category: 'immediate' | 'coping' | 'medical' | 'legal' | 'safety';
    title: string;
    description: string;
    actionLabel: string;
    actionType: 'activity' | 'counsellor' | 'helpline' | 'ngo';
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'victim' | 'observer' | 'bot';
  timestamp: string;
  text: string;
  isAudio?: boolean;
  exerciseSuggestion?: {
    type: 'breathing' | 'grounding' | 'journal' | 'sounds' | 'muscle' | 'emdr';
    title: string;
    description: string;
    buttonLabel: string;
  };
}

export interface CaseRecord {
  id: string;
  victimName: string;
  age: number;
  gender: string;
  phone: string;
  district: string;
  state: string;
  caseCategory: AtrocityCategory;
  registeredDate: string;
  currentDistressScore: number;
  riskLevel: RiskLevel;
  lastSessionDate: string;
  missedCheckins: number;
  slaMinutesRemaining: number;
  assignedObserver: string;
  assignedNgo?: string;
  assignedPsychiatrist?: string;
  crisisFlag: boolean;
  threatFlag: boolean;
  scoreHistory: { date: string; score: number; predicted?: boolean }[];
  shapDrivers: { name: string; impact: number }[];
  clinicalSummary: string;
  notes: { id: string; author: string; timestamp: string; text: string }[];
  chatMessages: ChatMessage[];
}

export interface NGOProvider {
  id: string;
  name: string;
  type: 'Trauma Counseling' | 'Legal Aid' | 'Shelter & Relocation' | 'Relief Assistance';
  district: string;
  state: string;
  contactPerson: string;
  phone: string;
  activeCasesCount: number;
  verified: boolean;
}

export interface PsychiatristProvider {
  id: string;
  name: string;
  qualification: string;
  hospital: string;
  district: string;
  availableSlot: string;
  phone: string;
  mciNumber: string;
}
