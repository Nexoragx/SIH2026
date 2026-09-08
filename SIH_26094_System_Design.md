# SIH 2026 — Problem Statement 26094
## AI-Powered Dynamic Mental Health Monitoring & Distress Prediction System
### For Victims of Atrocities under MoSJE / SC-ST (Prevention of Atrocities) Act, 1989
### Complete System Design & Implementation Blueprint — v1.0

---

> **Ministry:** Ministry of Social Justice and Empowerment (MoSJE)  
> **Department:** Department of Social Justice and Empowerment  
> **Scale:** District → State → National  
> **Population:** Victims, complainants, witnesses registered under NHAA (14566), Integrated Portal, chatbot, mobile app, IVRS  
> **Clinical Basis:** MADRS (Montgomery–Åsberg Depression Rating Scale) + DSM-5 MDD Criteria + PHQ-9

---

## TABLE OF CONTENTS

1. Mission & Core Philosophy
2. Design Principles (Non-Negotiables)
3. System Architecture Overview
4. User Types & Role Hierarchy
5. Complete User Journey & Flow
6. Tile-Based Questionnaire Design
7. Psychological Assessment Framework
8. AI/ML Stack & Model Design
9. Distress Scoring Engine
10. Temporal Trend & Predictive Model
11. Alert & Escalation System
12. Admin / Health Observer Panel
13. Collaboration Integration Layer (NGOs, Psychiatrists, Ambulance)
14. Backend API Design
15. Database Schema
16. Security, Privacy & Compliance
17. Multilingual & Accessibility Support
18. AI Prompt Templates
19. Technology Stack
20. Implementation Roadmap (MVP → Production)

---

## 1. MISSION & CORE PHILOSOPHY

**Mission:** Ensure no victim of atrocity falls through the psychological safety net — detect distress early, intervene before crisis, and connect to the right help at the right time.

**Core Promise:**
- Zero clinical jargon in user-facing screens
- Every interaction must feel like a check-in from someone who cares
- System works even on 2G / feature phone (IVRS fallback)
- Privacy is architecture, not afterthought

---

## 2. DESIGN PRINCIPLES (NON-NEGOTIABLES)

### UX Principles
| Principle | Implementation |
|-----------|---------------|
| **Minimal Text** | Max 8 words per question, icons + tile answers |
| **Less Clicks** | 3-tap max to complete a check-in |
| **Emotionally Safe** | Warm tones (not clinical white), no alarming language |
| **No Shame Language** | Never use "disorder", "mental illness" in UI copy |
| **Offline-First** | Queue responses locally, sync on connectivity |
| **Accessible** | WCAG AA, screen-reader ready, dyslexia font option |
| **Multilingual** | 22 scheduled languages + auto-detect |

### Color Psychology (UI Color System)
```
Primary Background : #F0F4F8  (soft slate — calm, non-clinical)
Card Surface       : #FFFFFF  with 8px radius
Accent / CTA       : #2D7DD2  (trustworthy blue — not cold, not aggressive)
Success / Low Risk : #27AE60  (gentle green)
Caution / Medium   : #F39C12  (amber — not alarming)
High Risk          : #E67E22  (deep orange)
Critical           : #C0392B  (red — reserved ONLY for crisis, never decor)
Text Primary       : #1A1A2E  (near-black, not pure black)
Text Secondary     : #6B7280
Emotion Tile Hover : #E8F4FD
```

### Typography
```
Display / Headings  : Noto Sans (supports all Indian scripts)
Body                : Noto Sans Regular 16px / 24px line-height
Question Text       : Noto Sans Medium 18px
Tile Labels         : Noto Sans SemiBold 13px
Numbers / Scores    : Noto Sans Mono (for score displays)
```

---

## 3. SYSTEM ARCHITECTURE OVERVIEW

```
┌──────────────────────────────────────────────────────────────────────┐
│                        VICTIM TOUCH-POINTS                           │
│  Mobile App │ Web Portal │ IVRS (Voice) │ SMS │ Chatbot │ Helpline   │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Kong)                              │
│         Auth │ Rate Limiting │ TLS │ Language Detection              │
└──────┬───────────┬──────────────────────┬────────────────────────────┘
       │           │                      │
       ▼           ▼                      ▼
┌────────────┐ ┌──────────────┐ ┌─────────────────────┐
│  USER SVC  │ │  CHECK-IN    │ │   CASE MANAGEMENT   │
│  FastAPI   │ │  SCHEDULER   │ │   SERVICE (Node.js) │
│            │ │  (Celery)    │ │                     │
└────────────┘ └──────────────┘ └─────────────────────┘
       │                │                      │
       └────────────────┼──────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      AI PROCESSING PIPELINE                          │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐ │
│  │  NLP ENGINE  │  │ VOICE ENGINE │  │     FORM SCORE ENGINE      │ │
│  │              │  │              │  │                            │ │
│  │ - Sentiment  │  │ - Whisper    │  │ MADRS Calculator           │ │
│  │ - Emotion AI │  │   (STT)      │  │ PHQ-9 Calculator           │ │
│  │ - Threat det.│  │ - Tone Anal. │  │ Contextual Weights         │ │
│  │ - HuggingFace│  │ - Stress sig.│  │                            │ │
│  └──────┬───────┘  └──────┬───────┘  └─────────────┬──────────────┘ │
│         └─────────────────┼──────────────────────────┘              │
│                           ▼                                          │
│              ┌────────────────────────┐                             │
│              │   FEATURE FUSION LAYER │                             │
│              │   (Weighted Ensemble)  │                             │
│              └────────────┬───────────┘                             │
│                           ▼                                          │
│              ┌────────────────────────┐                             │
│              │  DISTRESS SCORE ENGINE │  Score: 0–100               │
│              │  XGBoost + LLM Explain │  Level: Low/Mid/High/Crit.  │
│              └────────────┬───────────┘                             │
│                           ▼                                          │
│              ┌────────────────────────┐                             │
│              │  TEMPORAL TREND MODEL  │                             │
│              │  LSTM / Time-Series    │                             │
│              │  Worsening Prediction  │                             │
│              └────────────┬───────────┘                             │
└───────────────────────────┼──────────────────────────────────────────┘
                            │
               ┌────────────┴──────────┐
               ▼                       ▼
  ┌────────────────────┐   ┌──────────────────────────┐
  │   ALERT ENGINE     │   │  RECOMMENDATION ENGINE   │
  │                    │   │                          │
  │ - Push notif.      │   │ - Counselling ref.       │
  │ - SMS alert        │   │ - NGO assignment         │
  │ - IVR callback     │   │ - Medical referral       │
  │ - Email to officer │   │ - Legal aid suggestion   │
  └────────┬───────────┘   └──────────────┬───────────┘
           └──────────────────────────────┘
                           │
                           ▼
          ┌──────────────────────────────────────┐
          │      HEALTH OBSERVER DASHBOARD       │
          │  (District / State / National Tiers) │
          │                                      │
          │  Risk Cases │ Score Graphs │ Alerts   │
          │  Case Assign │ 1:1 Chat │ Followup    │
          └──────────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
     ┌──────────┐  ┌──────────────┐  ┌────────────┐
     │ Psychiatr│  │  NGO Portal  │  │  Ambulance │
     │  Portal  │  │              │  │  API (108) │
     └──────────┘  └──────────────┘  └────────────┘
```

---

## 4. USER TYPES & ROLE HIERARCHY

### User-Side Roles
| Role | Description | Access Level |
|------|-------------|--------------|
| **Victim (Self)** | Primary registered victim | Personal dashboard, check-in |
| **Proxy Reporter** | Family member reporting on behalf | Reports for linked victim |
| **Anonymous Reporter** | No login, emergency report only | Minimal form → alert |

### Admin-Side Roles
| Role | Description | Jurisdiction |
|------|-------------|-------------|
| **Health Observer (L1)** | Frontline counsellor | Block / Taluk level |
| **District Officer (L2)** | Manages L1 team, high-risk cases | District |
| **State Coordinator (L3)** | Analytics, state-level patterns | State |
| **National Admin (L4)** | Policy dashboard, model monitoring | National |
| **NGO Partner** | Assigned by officer for field support | Case-specific |
| **Psychiatrist** | Clinical review of critical cases | Case-specific |

---

## 5. COMPLETE USER JOURNEY & FLOW

### 5.1 Onboarding Flow (3 screens max)

```
SCREEN 1: Landing / Language Select
  [Hindi] [English] [Tamil] [Telugu] [Bengali] [+ 17 more]
  — Single tap, no typing needed

SCREEN 2: Entry Point
  [I need help for myself]    [I'm reporting for someone]
  Big tiles, large icons, warm illustration

SCREEN 3: Login / Register
  → OTP-based (mobile number) — no passwords
  → If no smartphone: IVRS code provided
  → Aadhaar optional (for benefit linkage, never mandatory)
```

### 5.2 Profile Setup (One-time, 4 tiles max per screen)

```
SCREEN A: Basic Identity
  Name (voice input option)
  District → State (auto-detect from SIM / GPS)
  Preferred language (auto-selected from S1)

SCREEN B: Case Context (Tile Select)
  [Complaint Filed]  [Awaiting Trial]
  [Rehabilitation]   [Witness in Case]

SCREEN C: Living Situation (Tile Select)
  [With Family]   [Alone]   [Shelter]   [Unknown / Prefer not to say]

SCREEN D: Contact Preference
  [Call me]   [WhatsApp]   [SMS only]   [App only]
```

### 5.3 Check-in Flow (Triggered every 3/7/14 days based on risk level)

```
START: Warm greeting screen
  "Hello [Name], how are you today?"
  Estimated time shown: "This takes about 3 minutes"

  → QUESTIONNAIRE MODULE (see Section 6)
  → VOICE CAPTURE MODULE (optional, 30s prompt)
  → SUBMIT → PROCESSING (animated, not clinical)
  → RESULT CARD (see Section 9.3)
  → RESOURCE / RECOMMENDATION TILE
  → CLOSE / CALL COUNSELLOR (one tap)
```

---

## 6. TILE-BASED QUESTIONNAIRE DESIGN

### Design Rules
- Max **1 question per screen**
- Max **4 tile options** per question
- Each tile: **Icon + 2-4 word label**
- Progress bar at top (e.g., "3 of 10")
- Back button always visible
- Skip option available (flagged but not penalized)
- Optional voice-read of question (for low literacy)

### Complete MADRS-Mapped Tile Question Bank

---

**Q1 — Apparent Sadness (MADRS Item 1)**
> "How do you look and feel today?"

| Tile | Icon | Label | MADRS Score |
|------|------|-------|-------------|
| A | 😊 | I feel okay | 0 |
| B | 😕 | A little down | 2 |
| C | 😟 | Sad most of the time | 4 |
| D | 😢 | Very sad, can't shake it | 6 |

---

**Q2 — Reported Sadness (MADRS Item 2)**
> "How has your mood been lately?"

| Tile | Icon | Label | MADRS Score |
|------|------|-------|-------------|
| A | 🌤️ | Normal ups and downs | 0 |
| B | 🌧️ | Low but gets better | 2 |
| C | ⛈️ | Heavy sadness, stays | 4 |
| D | 🌑 | Constant sadness, no relief | 6 |

---

**Q3 — Inner Tension (MADRS Item 3)**
> "How restless or anxious do you feel inside?"

| Tile | Icon | Label | MADRS Score |
|------|------|-------|-------------|
| A | 🧘 | Calm, mostly at peace | 0 |
| B | 😬 | A little on edge | 2 |
| C | 😰 | Tense or panicky often | 4 |
| D | 🆘 | Constant dread, overwhelming | 6 |

---

**Q4 — Sleep Quality (MADRS Item 4)**
> "How have you been sleeping?"

| Tile | Icon | Label | MADRS Score |
|------|------|-------|-------------|
| A | 🌙 | Sleeping well | 0 |
| B | 🛌 | Bit hard to fall asleep | 2 |
| C | ⏰ | Wake up 2+ times a night | 4 |
| D | 👁️ | Barely 2–3 hours sleep | 6 |

---

**Q5 — Appetite (MADRS Item 5)**
> "How is your appetite?"

| Tile | Icon | Label | MADRS Score |
|------|------|-------|-------------|
| A | 🍽️ | Eating as usual | 0 |
| B | 🥄 | Eating a little less | 2 |
| C | 🚫 | No real appetite | 4 |
| D | ❌ | Need to force myself to eat | 6 |

---

**Q6 — Concentration (MADRS Item 6)**
> "Can you focus on things?"

| Tile | Icon | Label | MADRS Score |
|------|------|-------|-------------|
| A | 🎯 | Concentrating fine | 0 |
| B | 📖 | Sometimes lose focus | 2 |
| C | 😵 | Hard to read or follow talk | 4 |
| D | 🌀 | Cannot focus at all | 6 |

---

**Q7 — Energy / Lassitude (MADRS Item 7)**
> "How much energy do you have?"

| Tile | Icon | Label | MADRS Score |
|------|------|-------|-------------|
| A | ⚡ | Normal energy | 0 |
| B | 🔋 | Takes effort to start things | 2 |
| C | 🪫 | Very hard to do basic tasks | 4 |
| D | 🛑 | Cannot do anything alone | 6 |

---

**Q8 — Emotional Numbness (MADRS Item 8)**
> "Do you feel connected to people around you?"

| Tile | Icon | Label | MADRS Score |
|------|------|-------|-------------|
| A | 🤝 | Yes, I care and feel | 0 |
| B | 😐 | Less interested than before | 2 |
| C | 🫥 | Feel distant from everyone | 4 |
| D | ❄️ | Feel nothing at all | 6 |

---

**Q9 — Pessimistic Thoughts (MADRS Item 9)**
> "What kind of thoughts come often?"

| Tile | Icon | Label | MADRS Score |
|------|------|-------|-------------|
| A | 🌟 | Mostly hopeful | 0 |
| B | 💭 | Sometimes feel I've failed | 2 |
| C | ⚫ | Often blame myself | 4 |
| D | 🌀 | Feel worthless, no hope | 6 |

---

**Q10 — Safety / Suicidal Ideation (MADRS Item 10)**
> ⚠️ *Gentle, non-alarming phrasing:* "How do you feel about the future?"

| Tile | Icon | Label | MADRS Score |
|------|------|-------|-------------|
| A | 🌅 | I look forward to things | 0 |
| B | 😔 | Life feels very tiring | 2 |
| C | 💔 | Sometimes wish it would end | 4 |
| D | 🆘 | I have thoughts of ending life | 6 |

> **CRITICAL RULE:** If user selects C or D on Q10 → Immediate Crisis Protocol activates (see Section 11.3)

---

### 6.1 Adaptive Branching Logic

```
IF Q10 → C or D:
  → PAUSE questionnaire
  → Show crisis resource tile + "Talk to someone now" CTA
  → Alert L1 Health Observer immediately
  → Do NOT show score to user in this session

IF Q3 ≥ 4 AND Q9 ≥ 4:
  → Flag as "inner turmoil + negative cognition" combo
  → Add 2 contextual questions:
    Q11: "Have you felt threatened recently?"
         [No] [Yes, by someone] [Yes, in my thoughts]
    Q12: "Do you feel safe where you live?"
         [Yes] [Sometimes unsafe] [Often unsafe] [No]

IF score trend shows 3+ sessions of worsening:
  → Activate TEMPORAL ESCALATION (see Section 10)
```

---

## 7. PSYCHOLOGICAL ASSESSMENT FRAMEWORK

### 7.1 Clinical Scales Used

| Scale | Items | Score Range | Use Case |
|-------|-------|-------------|----------|
| **MADRS** | 10 | 0–60 | Primary depression severity |
| **PHQ-9** | 9 | 0–27 | DSM-5 MDD screening |
| **PCL-5** | 20 | 0–80 | PTSD screening (atrocity victims) |
| **GAD-7** | 7 | 0–21 | Anxiety screening |
| **ISI** | 7 | 0–28 | Insomnia / sleep severity |

> **Note:** Full clinical scales are administered in staggered sessions across multiple check-ins — not all at once, to prevent user fatigue.

### 7.2 MADRS Severity Classification (Clinical Standard)

| MADRS Score | Level | System Classification |
|-------------|-------|----------------------|
| 0 – 6 | Normal | **GREEN — Low** |
| 7 – 19 | Mild Depression | **YELLOW — Moderate** |
| 20 – 34 | Moderate Depression | **ORANGE — High** |
| 35 – 60 | Severe Depression | **RED — Critical** |

### 7.3 DSM-5 MDD Criteria Mapping

The system checks for DSM-5 Criterion A: **5 or more of the following in a 2-week window:**

| DSM-5 Symptom | System Question | Threshold Flag |
|---------------|-----------------|----------------|
| Depressed mood | Q2 (Reported Sadness) | ≥ 4 |
| Loss of interest/pleasure | Q8 (Inability to Feel) | ≥ 4 |
| Weight/appetite change | Q5 (Appetite) | ≥ 4 |
| Sleep disturbance | Q4 (Sleep) | ≥ 4 |
| Psychomotor changes | Detected via voice pace | Flag |
| Fatigue / energy loss | Q7 (Lassitude) | ≥ 4 |
| Worthlessness / guilt | Q9 (Pessimistic Thoughts) | ≥ 4 |
| Concentration difficulty | Q6 (Concentration) | ≥ 4 |
| Suicidal ideation | Q10 (Safety) | ANY ≥ 2 |

**If 5+ symptoms flagged → System notes "DSM-5 MDD Probable" in clinical report (never shown to user).**

### 7.4 PTSD / Atrocity-Specific Context Layer

Additional contextual factors weighted into the distress score:

| Factor | Data Source | Weight |
|--------|-------------|--------|
| Recent threat report | User Q11 + NGO report | +10 pts |
| Upcoming court date | Case management integration | +5 pts |
| Social ostracism indicator | User Q11, counsellor notes | +8 pts |
| Compensation delay flag | Integrated portal data | +3 pts |
| Recent relocation / displacement | Profile data | +7 pts |

---

## 8. AI/ML STACK & MODEL DESIGN

### 8.1 NLP / Text Analysis Module

**Model:** Fine-tuned multilingual BERT (MuRIL for Indian languages)  
**Tasks:**
- Sentiment classification (positive / neutral / negative / distressed)
- Emotion detection: joy, sadness, fear, anger, disgust, surprise, neutral
- Threat detection: identifies intimidation language in free-text responses
- Keyword extraction for clinical summary

**Input Sources:**
- Open-ended text field ("Anything you'd like to share?")
- Chatbot conversation logs
- SMS response text

**Output:** JSON `{sentiment_score, emotion_labels[], threat_flag, key_phrases[]}`

---

### 8.2 Voice Analysis Module

**STT Model:** OpenAI Whisper (multilingual, fine-tuned on Indian accents)  
**Voice Feature Extraction:**

| Feature | Library | Clinical Relevance |
|---------|---------|-------------------|
| Pitch mean / std | pyAudioAnalysis | Low pitch → depression |
| Speaking rate (syllables/sec) | Praat / parselmouth | Slow rate → psychomotor retardation |
| Pause frequency | librosa | High pauses → lassitude |
| Voice energy / loudness | librosa | Low energy → low mood |
| Jitter / shimmer | Praat | Vocal stress indicators |
| Mel-frequency cepstral coefficients | librosa | Overall voice health |

**Model:** CNN-LSTM trained on DAIC-WOZ dataset (depression audio dataset)  
**Output:** `{voice_depression_score: 0.0–1.0, stress_level: low/medium/high}`

---

### 8.3 Emotion AI (Facial + Behavioral — Optional)

> For users who consent to camera access (mobile only):

**Face Analysis:** MediaPipe Face Mesh + custom emotion classifier  
**Behavioral Signals:**
- Session duration vs. historical average
- Response time per question (long pause = high latency → distress flag)
- Scroll depth and tap hesitation patterns
- Return rate (missed check-ins = escalation flag)

---

### 8.4 Feature Fusion Layer

All signals merged using a **weighted ensemble:**

```python
def compute_feature_vector(session):
    features = {
        "madrs_raw"          : session.madrs_total / 60,      # normalized 0–1
        "phq9_raw"           : session.phq9_total / 27,
        "nlp_sentiment"      : session.nlp_score,              # 0–1
        "emotion_fear"       : session.emotion['fear'],
        "emotion_sadness"    : session.emotion['sadness'],
        "voice_depression"   : session.voice_score,
        "voice_stress"       : session.voice_stress,
        "threat_flag"        : 1 if session.threat_detected else 0,
        "suicidal_flag"      : 1 if session.q10 >= 4 else 0,
        "missed_sessions"    : session.missed_count,
        "days_since_start"   : session.days_in_system,
        "contextual_bonus"   : session.context_weight,         # threat/court/etc
    }
    return features
```

**Fusion Model:** XGBoost Classifier (trained on labeled clinical data)  
**Training Data:** DAIC-WOZ + AVEC + anonymized partner NGO data  
**Explainability:** SHAP values computed per session for Health Observer explanation

---

## 9. DISTRESS SCORE ENGINE

### 9.1 Scoring Formula

```
MADRS_norm  = (MADRS_raw / 60) × 40          [Weight: 40%]
PHQ9_norm   = (PHQ9_raw / 27) × 20           [Weight: 20%]
NLP_score   = nlp_sentiment × 15             [Weight: 15%]
Voice_score = voice_depression × 10          [Weight: 10%]
Context_add = contextual_weight              [Bonus: up to 15]

DISTRESS_SCORE = MADRS_norm + PHQ9_norm + NLP_score + Voice_score + Context_add
               = 0 to 100
```

### 9.2 Distress Level Classification

| Score Range | Level | Color | Response |
|-------------|-------|-------|----------|
| 0 – 25 | 🟢 Low | Green | Routine check-in (14 days) |
| 26 – 50 | 🟡 Moderate | Amber | Weekly check-in + resource tile |
| 51 – 75 | 🟠 High | Orange | 3-day check-in + L1 alert + counsellor assign |
| 76 – 100 | 🔴 Critical | Red | Immediate L1+L2 alert + crisis protocol |
| Q10 ≥ 4 | 🆘 Crisis | Dark Red | Immediate human intervention regardless of total score |

### 9.3 User-Facing Result Card

> **Design:** Never show numeric score to user. Show supportive language only.

```
┌──────────────────────────────────────────────────┐
│   [Warm illustration — person being held]        │
│                                                  │
│   "You showed a lot of courage today."           │
│                                                  │
│   Based on how you're feeling, we've             │
│   arranged some support for you.                 │
│                                                  │
│   [📞 Talk to a counsellor]  [📚 Read more]      │
│                                                  │
│   Someone from our team will reach out           │
│   within [X hours].                              │
└──────────────────────────────────────────────────┘
```

---

## 10. TEMPORAL TREND & PREDICTIVE MODEL

### 10.1 Trend Tracking

Every session score is stored in a time-series database.  
The system computes:

- **Rolling 3-session trend:** Rising / Stable / Falling
- **Velocity:** Rate of score change per week
- **Acceleration:** Whether worsening is speeding up

```
Session History Example:
  Day 1  → Score: 32 (Moderate)
  Day 8  → Score: 41 (Moderate+)
  Day 15 → Score: 58 (High)      ← TREND ALERT fires here
  Day 22 → Score: 71 (Critical)  ← ESCALATION

Trend Velocity = (71 - 32) / 21 days = +1.85 pts/day → ESCALATING
```

### 10.2 Predictive Risk Model

**Architecture:** LSTM (Long Short-Term Memory) sequence model  
**Input:** Last 5 session feature vectors  
**Output:** Predicted score at next session (7/14 days out)  
**Threshold:** If predicted score crosses tier boundary → pre-emptive alert

```python
# Pseudo-code for temporal risk assessment
def assess_longitudinal_risk(user_sessions):
    if len(sessions) < 2:
        return "insufficient_data"
    
    trend = compute_rolling_trend(sessions[-3:])
    velocity = compute_velocity(sessions)
    predicted_next = lstm_model.predict(sessions[-5:])
    
    if velocity > 2.0:               # worsening > 2pts/day
        trigger_alert("ESCALATING")
    if predicted_next > 75:           # will hit critical
        trigger_alert("PREDICTIVE_CRITICAL")
    if trend == "RISING" and consecutive_miss > 1:
        trigger_alert("DISENGAGEMENT_RISK")
```

---

## 11. ALERT & ESCALATION SYSTEM

### 11.1 Alert Types

| Alert Type | Trigger | Recipients | SLA |
|-----------|---------|-----------|-----|
| **Routine Flag** | Score 26–50 | L1 Health Observer | Notify within 24h |
| **High Risk** | Score 51–75 | L1 + SMS to user | Contact within 12h |
| **Critical** | Score 76–100 | L1 + L2 + Phone call | Contact within 4h |
| **Crisis / SI** | Q10 ≥ 4 | L1 + L2 + Emergency | Immediate (< 30 min) |
| **Threat Detected** | Threat flag | L2 + Legal/Police | Within 2h |
| **Disengagement** | 2+ missed sessions | L1 | Within 48h |
| **Predictive** | LSTM flags next session | L1 | Preventive contact 7 days prior |

### 11.2 Escalation Matrix

```
Crisis/SI Alert fires →
  Step 1 (0–5 min)  : Push notification to L1 app
  Step 2 (5–15 min) : Auto-IVR call to L1 mobile
  Step 3 (15–20 min): If no L1 ack → escalate to L2 + SMS
  Step 4 (20–30 min): If no L2 ack → auto-dial 108 (ambulance)
                        + alert District Officer
  Step 5 (30+ min)  : National alert log + State Coordinator notified
```

### 11.3 Crisis Protocol (Immediate SI Response)

When Q10 tile D selected or crisis flag raised:

1. **Questionnaire pauses immediately**
2. User sees: *"You are not alone. Someone will call you right now."*
3. One-tap: **[Call helpline: iCall / Vandrevala Foundation]** (auto-dial)
4. System creates **CRISIS CASE** in admin panel (Red badge, cannot be dismissed without acknowledgment)
5. L1 Health Observer gets phone call from system with user name + contact
6. If no answer from L1 within 15 min → 108 ambulance dispatch API triggered
7. SMS to registered family contact (if consented)

---

## 12. ADMIN / HEALTH OBSERVER DASHBOARD

### 12.1 Dashboard Architecture (3 Tiers)

**L1 — Health Observer View (Block/Taluk)**
```
┌────────────────────────────────────────────────────┐
│  MY CASES     Today: 12    Pending: 3    Crisis: 1  │
├────────────────┬───────────────────────────────────┤
│ PRIORITY LIST  │  ACTIVE CASE PANEL                │
│                │                                   │
│ 🔴 Razia B.    │  Razia B. — Case ID: MH20240043   │
│    Score: 82   │  Distress Score: 82 → Critical    │
│    3 sessions  │  SHAP Explain: Sleep(28%), Sad(22%)│
│                │  Trend: ↑ +19 pts in 3 weeks      │
│ 🟠 Sunita K.   │                                   │
│    Score: 64   │  [📞 Call Now] [💬 Chat] [📋 Note] │
│    2 sessions  │  [Assign NGO] [Refer Psychiatrist] │
│                │  [Escalate to L2]                 │
│ 🟡 Meena T.    │                                   │
│    Score: 44   │  Timeline Graph ──────────────▶   │
│    5 sessions  │  32 → 41 → 58 → 82               │
└────────────────┴───────────────────────────────────┘
```

**L2 — District Officer View**
- Aggregate risk map (district choropleth)
- NGO + psychiatrist resource allocation view
- SLA breach tracker (who didn't follow up on time)
- Court date calendar (cross-referenced with case distress spikes)

**L3 — State Coordinator View**
- State-wide distress heatmap
- Month-over-month trend by category (rape, arson, caste violence, etc.)
- Model performance metrics (accuracy, false negatives)
- Policy recommendation engine outputs

**L4 — National Admin**
- All-India dashboard
- Model drift monitoring
- Comparative state analytics
- Export to MoSJE reporting format

### 12.2 Admin Features

| Feature | Description |
|---------|-------------|
| **1:1 Chat** | Encrypted in-app messaging between observer and victim |
| **Follow-up Call Log** | Log outcome of every contact attempt |
| **Case Note** | Observer adds clinical notes (visible to L2+ only) |
| **Assign NGO** | Select from partner NGO directory by district |
| **Refer Psychiatrist** | Book telepsychiatry slot or in-person referral |
| **Motivation Push** | Send curated motivational message to victim (reviewed by observer) |
| **Check-in Override** | Trigger immediate check-in for high-risk user |
| **Score History Graph** | Interactive sparkline of all sessions |
| **SHAP Explanation Panel** | Human-readable explanation of why score is high |
| **Intervention Log** | Track what was done — counselling, NGO, legal, financial |
| **SLA Timer** | Countdown showing time left to respond to alert |

### 12.3 Motivation & Engagement Features (Victim-Side)

These appear in the victim app, not as therapy but as positive reinforcement:

- **Daily Affirmation Tile** — Single sentence, culturally appropriate
- **Progress Badge** — "You've completed 5 check-ins — you're taking care of yourself"
- **Breathing Exercise** (30-second guided, with animation)
- **"You Are Supported" Card** — Shows name of assigned counsellor and next scheduled contact
- **Community Wall** — Anonymous messages of hope from other survivors (moderated)
- **Coping Tip** — One practical suggestion matched to current distress level

---

## 13. COLLABORATION INTEGRATION LAYER

### 13.1 Psychiatrist Portal

```
Access: Web portal (separate subdomain)
Login: MCI registration number verified

Features:
  - View referred cases (anonymized until accepted)
  - Telepsychiatry slot calendar (integrated with Jitsi/DOXY.me)
  - Clinical report: MADRS score history + SHAP explanation
  - Prescription notes (stored encrypted, not in AI pipeline)
  - Referral back to Health Observer with clinical summary
```

### 13.2 NGO Partner Integration

```
API Endpoint: POST /api/v1/ngo/assign-case

Payload:
{
  "case_id": "MH20240043",
  "victim_district": "Nashik",
  "services_needed": ["food", "legal", "shelter", "counselling"],
  "urgency": "high"
}

NGO Portal Features:
  - Accept / Decline case
  - Field visit log
  - Resource provision log (what was delivered)
  - Feedback to L1 observer
  - GPS check-in for field visits
```

### 13.3 Ambulance / Emergency (108 Integration)

```
Trigger: Crisis Protocol Step 4
API: POST /api/v1/emergency/dispatch

Payload:
{
  "victim_id": "xxxx-xxxx",
  "last_known_location": {lat, lng},
  "type": "mental_health_crisis",
  "priority": "immediate"
}

Masked data: Name not sent to dispatch, only location + case type
De-identify: Remove PII before 108 API call
```

### 13.4 Legal Aid Integration

```
Cross-reference: Case ID from Integrated Portal / NHAA 14566
Data shared: Distress score level (not raw score) for bail /
             compensation hearing documentation
Format: PDF export signed by system (for court use, approved format)
```

---

## 14. BACKEND API DESIGN

### 14.1 API Routes

```
AUTH
  POST /api/v1/auth/request-otp
  POST /api/v1/auth/verify-otp
  POST /api/v1/auth/logout

USER
  POST /api/v1/user/profile
  GET  /api/v1/user/profile/:id
  PUT  /api/v1/user/profile/:id

CHECK-IN
  POST /api/v1/checkin/start          ← Returns session_id + questions
  POST /api/v1/checkin/submit         ← Submit all responses
  POST /api/v1/checkin/voice-upload   ← Upload voice file for analysis
  GET  /api/v1/checkin/history/:uid   ← Session history

SCORING
  GET  /api/v1/score/latest/:uid
  GET  /api/v1/score/history/:uid
  GET  /api/v1/score/predict/:uid     ← LSTM predicted score

ALERTS
  GET  /api/v1/alerts/active
  PUT  /api/v1/alerts/:id/acknowledge
  POST /api/v1/alerts/escalate

ADMIN
  GET  /api/v1/admin/cases?level=high&district=XX
  POST /api/v1/admin/assign/ngo
  POST /api/v1/admin/assign/psychiatrist
  POST /api/v1/admin/followup/log
  POST /api/v1/admin/message/send

DASHBOARD
  GET  /api/v1/dashboard/district/:code
  GET  /api/v1/dashboard/state/:code
  GET  /api/v1/dashboard/national

EMERGENCY
  POST /api/v1/emergency/crisis-flag
  POST /api/v1/emergency/dispatch-108
```

### 14.2 Microservice Breakdown

| Service | Language | Responsibility |
|---------|---------|----------------|
| `auth-service` | Node.js | OTP, JWT, session management |
| `user-service` | FastAPI | Profile, case linking |
| `checkin-service` | FastAPI | Session management, response storage |
| `ai-nlp-service` | Python (FastAPI) | NLP, emotion, threat detection |
| `ai-voice-service` | Python (FastAPI) | Whisper STT + voice feature extraction |
| `scoring-service` | Python (FastAPI) | MADRS calc, fusion, distress score |
| `temporal-service` | Python (FastAPI) | LSTM trend + prediction |
| `alert-service` | Node.js | Notification dispatch, escalation |
| `admin-service` | Node.js | Dashboard data, case management |
| `integration-service` | Node.js | NGO, 108, psychiatrist APIs |
| `scheduler` | Python (Celery) | Timed check-ins, reminder scheduling |

---

## 15. DATABASE SCHEMA

### Core Tables (PostgreSQL)

```sql
-- Users (encrypted PII)
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_hash      VARCHAR(64) UNIQUE,   -- hashed, never plain
  name_encrypted  BYTEA,                -- AES-256 encrypted
  district_code   VARCHAR(10),
  state_code      VARCHAR(10),
  case_type       VARCHAR(50),          -- rape/murder/arson/caste/witness
  living_status   VARCHAR(30),
  language_pref   VARCHAR(10),
  created_at      TIMESTAMP DEFAULT NOW(),
  last_active     TIMESTAMP,
  is_active       BOOLEAN DEFAULT TRUE
);

-- Check-in Sessions
CREATE TABLE sessions (
  id              UUID PRIMARY KEY,
  user_id         UUID REFERENCES users(id),
  started_at      TIMESTAMP,
  completed_at    TIMESTAMP,
  response_data   JSONB,                -- encrypted tile responses
  voice_file_ref  VARCHAR(255),         -- S3 key, not URL
  madrs_score     INTEGER,
  phq9_score      INTEGER,
  distress_score  DECIMAL(5,2),
  distress_level  VARCHAR(20),          -- low/moderate/high/critical
  nlp_features    JSONB,
  voice_features  JSONB,
  shap_values     JSONB,
  crisis_flag     BOOLEAN DEFAULT FALSE,
  threat_flag     BOOLEAN DEFAULT FALSE
);

-- Distress Score History (Time-Series)
CREATE TABLE score_history (
  id              SERIAL PRIMARY KEY,
  user_id         UUID REFERENCES users(id),
  session_id      UUID REFERENCES sessions(id),
  score           DECIMAL(5,2),
  level           VARCHAR(20),
  recorded_at     TIMESTAMP DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
  id              UUID PRIMARY KEY,
  user_id         UUID REFERENCES users(id),
  session_id      UUID REFERENCES sessions(id),
  alert_type      VARCHAR(50),
  severity        VARCHAR(20),
  assigned_to     UUID,                 -- observer ID
  status          VARCHAR(20) DEFAULT 'open',
  created_at      TIMESTAMP,
  acknowledged_at TIMESTAMP,
  resolved_at     TIMESTAMP
);

-- Interventions
CREATE TABLE interventions (
  id              UUID PRIMARY KEY,
  case_id         UUID REFERENCES users(id),
  type            VARCHAR(50),          -- counselling/ngo/psychiatric/legal/financial
  provider        VARCHAR(100),
  notes_encrypted BYTEA,
  performed_by    UUID,
  performed_at    TIMESTAMP,
  outcome         VARCHAR(100)
);

-- Health Observers / Admins
CREATE TABLE observers (
  id              UUID PRIMARY KEY,
  name            VARCHAR(100),
  role            VARCHAR(20),          -- L1/L2/L3/L4
  district_code   VARCHAR(10),
  state_code      VARCHAR(10),
  phone           VARCHAR(15),
  max_caseload    INTEGER DEFAULT 30,
  current_cases   INTEGER DEFAULT 0
);
```

### Cache (Redis)
```
sessions:active:{session_id}       ← Current session state (TTL: 30 min)
alerts:pending:{observer_id}       ← Unacknowledged alert list
scores:latest:{user_id}            ← Latest score (TTL: 24h)
checkin:schedule:{user_id}         ← Next scheduled check-in
```

### Time-Series (TimescaleDB / InfluxDB)
```
distress_scores_tsdb
  - user_id, score, level, timestamp (hypertable on timestamp)

For: trend queries, rolling averages, prediction input
```

---

## 16. SECURITY, PRIVACY & COMPLIANCE

### 16.1 Encryption Standards

| Data | Encryption |
|------|-----------|
| PII (name, phone) | AES-256-GCM (field-level encryption) |
| Voice files | AES-256 on S3, presigned URLs only |
| Clinical scores | Encrypted at rest (PostgreSQL TDE) |
| API communication | TLS 1.3 minimum |
| Admin passwords | Argon2id |
| JWT tokens | RS256, 15-min expiry |
| Refresh tokens | Stored as httpOnly, SameSite=Strict |

### 16.2 Data Minimization

- Victim is identified by system-generated UUID internally
- Phone number stored only as salted hash (SHA-256 + bcrypt)
- Aadhaar: NOT stored — only used for one-time verification, then discarded
- Voice files deleted from server after feature extraction (within 24h)
- Raw questionnaire responses anonymized before entering AI pipeline

### 16.3 Compliance Checklist

- ✅ **DPDP Act 2023** — Explicit consent recorded at onboarding, withdraw anytime
- ✅ **SC-ST Act 1989 guidelines** — Victim identity protection
- ✅ **CERT-IN norms** — Incident response protocol defined
- ✅ **MeitY cloud policy** — Hosted on NIC/government-approved cloud
- ✅ **Explainable AI** — SHAP output available to observer, never algorithmic black-box decisions
- ✅ **Human-in-the-loop** — No automated action without human confirmation (except 108 in step 4)
- ✅ **Audit trail** — Every data access, alert action, and intervention logged immutably
- ✅ **Right to Erasure** — User can delete all personal data, scores become anonymized aggregate

### 16.4 Privacy Architecture

```
PII Layer      [Encrypted, human-accessible with audit]
     ↕  (key access logged)
Score Layer    [Pseudonymized with UUID]
     ↕  (no PII)
AI Layer       [Anonymized feature vectors only]
     ↕  (no re-identification possible)
Analytics Layer[Aggregate only — district/state/national]
```

---

## 17. MULTILINGUAL & ACCESSIBILITY

### Languages (Phase 1)
Hindi, English, Bengali, Tamil, Telugu, Marathi, Kannada, Odia, Gujarati, Punjabi

### Languages (Phase 2 — all 22 scheduled)
All 22 scheduled languages of India + Gondi (tribal community relevance)

### Implementation
- **UI:** React-i18next + custom locale files
- **NLP:** MuRIL (Multilingual Representations for Indian Languages) base model
- **STT:** Whisper large-v3 (supports all Indian languages)
- **TTS (for IVRS/audio questions):** Google Cloud TTS + Microsoft Azure Cognitive (fallback)

### Accessibility
- Voice input for every text field
- Audio playback for every question
- High contrast mode toggle
- Font size slider (3 presets)
- Screen reader support (ARIA labels, Android TalkBack / iOS VoiceOver tested)
- Offline mode: Questions cached, responses queued until sync

---

## 18. AI PROMPT TEMPLATES

### 18.1 Distress Assessment Summarization Prompt

```
SYSTEM:
You are a clinical mental health support assistant for a government welfare system 
that monitors victims of atrocities. Your role is to generate a compassionate, 
evidence-based clinical summary for a health observer (not for the victim). 
Use MADRS and DSM-5 terminology appropriately. Be precise, non-judgmental, and 
clinically grounded. Never speculate beyond the data provided.

USER:
Generate a clinical summary for the following assessment data:

Patient ID: {anonymized_id}
Session Date: {date}
MADRS Score: {score} / 60
DSM-5 Flags: {flagged_symptoms}
Distress Level: {level}
Key SHAP drivers: {top_3_shap_features}
Trend: {previous_3_scores}
Threat flag: {yes/no}
Suicidal ideation flag: {yes/no}
Voice stress level: {low/medium/high}
Missed sessions: {count}

Provide:
1. A 3-sentence clinical summary
2. Primary risk factors (bullet list, max 5)
3. Recommended immediate intervention (one of: monitor / counselling / psychiatry / emergency)
4. Suggested intervention type (counselling / medical / legal / NGO / financial)
5. Suggested next check-in interval (3/7/14 days)
```

### 18.2 Victim Chatbot Interaction Prompt

```
SYSTEM:
You are a gentle, compassionate, and non-clinical conversational assistant 
supporting victims of atrocities in India through a government mental health 
monitoring system. You speak in the user's language ({language}).

Rules:
- NEVER use clinical terms like "disorder", "depressed", "mental illness"
- Always validate feelings without reinforcing distress
- If user mentions wanting to die or harm themselves, IMMEDIATELY say:
  "I'm so glad you told me. Please stay with me — someone will call you 
   right now. You are not alone." Then set crisis_flag = true.
- Keep responses SHORT (max 2 sentences)
- Offer one coping suggestion per response at most
- Never promise outcomes you cannot control
- If unsure, say: "I want to make sure you get the best support. 
   Let me connect you with someone."

Current distress level from last session: {level}
User's preferred language: {language}
User's name (use sparingly, max once): {first_name}
```

### 18.3 Recommendation Engine Prompt

```
SYSTEM:
You are a resource recommendation engine for a mental health support system.
Based on the distress assessment, recommend exactly 2–3 interventions from 
the following categories: {available_resources_by_district}

Respond ONLY in this JSON format:
{
  "recommendations": [
    {
      "type": "counselling|ngo|psychiatric|legal|financial|protection",
      "priority": "immediate|this_week|this_month",
      "reason": "one sentence clinical reason",
      "provider_category": "government|ngo|private"
    }
  ],
  "next_checkin_days": 3|7|14,
  "escalate_to_human": true|false
}

Assessment data:
MADRS: {score}, Level: {level}, Trend: {trend},
Flags: {flags}, Case type: {victim_case_type},
District: {district}, Available resources: {resources}
```

---

## 19. TECHNOLOGY STACK

### Frontend
| Component | Technology |
|-----------|-----------|
| Mobile App | React Native 0.74 (iOS + Android) |
| Web Portal | Next.js 15 (App Router) |
| UI Component Library | Custom design system (Tailwind CSS base) |
| State Management | Zustand |
| Offline Support | React Query + AsyncStorage |
| Animation | Lottie (React Native) |
| Charts (Admin) | Recharts + D3.js |
| Localization | i18next + react-i18next |

### Backend
| Component | Technology |
|-----------|-----------|
| API Gateway | Kong Gateway |
| Auth Service | Node.js + Express + JWT |
| Core API | FastAPI (Python 3.12) |
| Task Queue | Celery + Redis |
| Message Broker | RabbitMQ |
| Real-time Alerts | WebSockets (Socket.IO) |
| IVRS | Twilio Programmable Voice |
| SMS | Twilio / AWS SNS |
| Push Notifications | Firebase FCM |
| Email | AWS SES |

### AI / ML
| Component | Technology |
|-----------|-----------|
| NLP Model | MuRIL (HuggingFace), custom fine-tune |
| STT | OpenAI Whisper large-v3 |
| Voice Features | librosa, parselmouth (Praat) |
| Distress Model | XGBoost + scikit-learn |
| Temporal Model | LSTM (PyTorch) |
| Explainability | SHAP (shap library) |
| Model Serving | FastAPI + ONNX Runtime |
| Experiment Tracking | MLflow |

### Database & Storage
| Component | Technology |
|-----------|-----------|
| Primary DB | PostgreSQL 16 (with pgcrypto) |
| Time-Series | TimescaleDB extension |
| Cache | Redis 7 |
| Document Store | MongoDB (case notes, audit logs) |
| Object Storage | NIC S3-compatible / AWS S3 |
| Search | Elasticsearch (case search for admin) |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Container | Docker + Kubernetes (K8s) |
| CI/CD | GitHub Actions |
| Cloud | NIC Cloud (MeghRaj) / AWS India Region |
| Monitoring | Prometheus + Grafana |
| Logging | ELK Stack (Elasticsearch, Logstash, Kibana) |
| CDN | CloudFront / Cloudflare |
| VPN | WireGuard (admin access) |

---

## 20. IMPLEMENTATION ROADMAP

### Phase 0: SIH Demo (Week 1–2) — MVP for Judging

**Deliverables:**
- [ ] React Native app: Onboarding + Tile questionnaire (all 10 Q MADRS)
- [ ] FastAPI backend: Auth (OTP mock) + Score calculator
- [ ] MADRS score → Distress level classifier
- [ ] Basic admin dashboard (React web)
- [ ] Demo data: Simulated 5-user distress trend graph
- [ ] Crisis alert simulation (Q10 → crisis screen)
- [ ] Claude API integration for clinical summary generation

**Tech for Demo:**
- Frontend: React Native (Expo) + Next.js admin
- Backend: FastAPI + SQLite (demo) → PostgreSQL ready
- AI: Rule-based MADRS scoring + Claude Sonnet 4.6 for summaries

---

### Phase 1: MVP Production (Weeks 3–8)

- [ ] PostgreSQL + full DB schema
- [ ] OTP auth (Twilio)
- [ ] NLP sentiment analysis (MuRIL fine-tune)
- [ ] Voice upload + Whisper STT
- [ ] Voice stress feature extraction
- [ ] Full distress score engine (fusion model)
- [ ] Alert engine (push + SMS)
- [ ] L1 Health Observer dashboard
- [ ] NGO assignment workflow
- [ ] 5-language support (Hindi, English, Bengali, Tamil, Telugu)
- [ ] Security: Field-level encryption, audit logs

---

### Phase 2: Full System (Weeks 9–16)

- [ ] LSTM temporal model (train on collected data)
- [ ] Predictive alerts
- [ ] Psychiatrist portal + telepsychiatry integration
- [ ] 108 ambulance API integration
- [ ] L2/L3/L4 dashboard tiers
- [ ] IVRS call flow (Twilio + TTS)
- [ ] All 22 languages
- [ ] Model explainability (SHAP) in admin panel
- [ ] DPDP compliance audit
- [ ] Performance: load test (10,000 concurrent users)
- [ ] Field pilot: 2 districts (1 state partner)

---

### Phase 3: Scale & Optimize (Weeks 17–24)

- [ ] National rollout pipeline
- [ ] Federated learning for model updates (privacy-preserving)
- [ ] API integration with NHAA 14566 portal
- [ ] Court date calendar sync
- [ ] MoSJE reporting format export
- [ ] Annual model retrain pipeline
- [ ] Red Team security audit
- [ ] CERT-IN compliance certification

---

## APPENDIX A: MADRS Scoring Reference

| Item | Domain | Max Score |
|------|--------|-----------|
| 1. Apparent Sadness | Observed affect | 6 |
| 2. Reported Sadness | Subjective mood | 6 |
| 3. Inner Tension | Anxiety/dread | 6 |
| 4. Reduced Sleep | Sleep quality | 6 |
| 5. Reduced Appetite | Eating behaviour | 6 |
| 6. Concentration Difficulties | Cognitive function | 6 |
| 7. Lassitude | Energy/motivation | 6 |
| 8. Inability to Feel | Emotional numbness | 6 |
| 9. Pessimistic Thoughts | Cognitive distortion | 6 |
| 10. Suicidal Thoughts | Safety risk | 6 |
| **Total** | | **60** |

**Severity:** 0–6 Normal | 7–19 Mild | 20–34 Moderate | 35–60 Severe

---

## APPENDIX B: Emergency Resources (To be embedded in app)

| Helpline | Number | Specialization |
|---------|--------|----------------|
| iCall | 9152987821 | Mental health, trauma |
| Vandrevala Foundation | 1860-2662-345 | 24/7 crisis |
| National Helpline for SC/ST | 14566 (NHAA) | Atrocity victims |
| Women Helpline | 181 | Gender-based violence |
| Ambulance | 108 | Medical emergency |
| Police | 100 | Immediate threat |
| Child Helpline | 1098 | Minor victims |

---

*Document Version: 1.0 | SIH 2026 | Team: [Your Team Name] | Problem: 26094*  
*Clinical Reference: MADRS (Montgomery & Åsberg, 1979) | DSM-5 (APA, 2013)*  
*This system is designed for monitoring and early intervention — not for autonomous clinical diagnosis.*
