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
Mental/
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
├── new_frontend/             # Production React 19 + Vite Application (Vercel Deployed)
│   ├── src/
│   │   ├── components/      # UI components (AssessmentForm, ObserverDashboard, etc.)
│   │   ├── context/         # AuthContext & useAuth hook
│   │   ├── services/        # API service layers
│   │   ├── styles/          # Modern CSS styling (100% black text theme, vibrant accents)
│   │   └── utils/           # Local storage & client validators
│   └── vercel.json          # Vercel SPA routing
├── frontend/                 # Prototype React + TypeScript Components (from proto branch)
│   └── src/
│       └── components/      # Victim, observer, and analytics prototype widgets
├── SIH_26094_System_Design.md# Comprehensive System Architecture & Engineering Specs
├── architechtur.md           # High-level architecture documentation
├── server.py                 # Root backend launcher
├── vercel.json               # Root monorepo Vercel configuration
└── .gitignore                # Git exclusion rules
```

---

## Local Setup & Development

### 1. Backend Setup

```bash
# From project root
source .venv/bin/activate
pip install -r backend/requirements.txt   # (or ensure fastapi, uvicorn, pymongo, bcrypt, pyjwt installed)
python3 server.py
```
- API Server: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/api/v1/docs`

### 2. Frontend Setup

```bash
cd new_frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

## Vercel Deployment

The project includes `vercel.json` configured for seamless deployment:
1. Push repository to GitHub.
2. In the Vercel Dashboard, click **Add New Project** and import the repository.
3. Vercel automatically detects Vite:
   - **Build Command**: `npm --prefix new_frontend run build`
   - **Output Directory**: `new_frontend/dist`
   - **Install Command**: `npm --prefix new_frontend install`
4. Click **Deploy**.
