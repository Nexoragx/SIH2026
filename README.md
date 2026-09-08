# SIH26094: AI-Powered Dynamic Mental Health Monitoring & Distress Prediction System

An AI-driven psychological monitoring and crisis response platform designed to detect trauma, predict distress escalation, and automate emergency interventions.

---

## System Overview

- **FastAPI Backend**:
  - Multi-modal ingestion & feature fusion (Clinical scales, NLP Sentiment, Voice stress indicators).
  - Distress scoring engine (0 - 100) with XGBoost & SHAP explainability hooks.
  - Emergency 108 Ambulance Dispatch protocol automation for critical distress tiers.
  - Role-based access control (JWT Access/Refresh, Token Blacklisting, OAuth2).
  - MongoDB integration (persistent storage in `Mental.user` and `Mental.interview_reports`).
- **React + Vite Frontend**:
  - Modern, minimal healthcare dashboard UI with 100% black typography.
  - Clinical assessment questionnaire (MADRS, PHQ-9, GAD-7, and NLP narrative analysis).
  - Interactive, prominent Crisis Triggers and Emergency 108 Dispatch buttons.
  - Real-time Health Observer Caseload dashboard with triage actions.
  - Zero victim name exposure for participant confidentiality and privacy safeguards.

---

## Directory Structure

```
Nexora/
├── backend/                  # FastAPI Application
│   ├── src/
│   │   ├── config/          # Environment & settings
│   │   ├── controllers/     # Auth & Interview controllers
│   │   ├── db/              # PyMongo connection & multi-db sync
│   │   ├── middlewares/     # JWT Auth, RBAC, file validation
│   │   ├── models/          # User & InterviewReport schemas
│   │   ├── routes/          # API endpoints
│   │   └── services/        # AI & Emergency dispatch services
│   ├── server.py            # Local backend server runner
│   └── test_e2e.py          # End-to-end integration test suite
├── frontend/                 # React 19 + TypeScript + Vite Application (Vercel Deployed)
│   ├── src/
│   │   ├── components/      # UI components (LandingPage, AuthModal, ObserverDashboard, etc.)
│   │   ├── api/             # Typed API client layer (auth, interview, observer, system)
│   │   └── utils/           # Helper utilities & translations
│   ├── vercel.json          # Vercel SPA routing
│   ├── package.json         # Dependencies & build scripts
│   └── vite.config.ts       # Vite config & API reverse proxy
├── SIH_26094_System_Design.md# Comprehensive System Architecture & Engineering Specs
├── architechtur.md           # High-level architecture documentation
├── server.py                 # Root backend launcher
├── vercel.json               # Monorepo Vercel configuration
└── .gitignore                # Git exclusion rules
```

---

## Local Setup & Development

### 1. Backend Setup

```bash
# From project root
python3 server.py
```
- API Server: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/api/v1/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

## Vercel Deployment

1. Push repository to GitHub.
2. In the Vercel Dashboard, click **Add New Project** and import the repository.
3. In **Project Settings**:
   - Set **Root Directory**: `frontend`
   - Leave **Framework Preset**: `Vite` (default)
   - Do **NOT** enable any command overrides (Vercel automatically uses standard `npm install` and `npm run build`).
4. Click **Deploy**.
