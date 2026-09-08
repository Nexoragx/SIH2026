# SIH26094: AI-Powered Dynamic Mental Health Monitoring and Distress Prediction System for Victims of Atrocities

Production-ready FastAPI backend designed and structured for the Smart India Hackathon (SIH26094).

---

## 🏗️ 9-Tier System Architecture Mapping

This backend implements the entire 9-tier system architecture:

```
[Victim touch-points]
  ├── Mobile app | Web portal | IVRS calls | SMS | Chatbot | Helpline
  ▼
[API Gateway]
  ├── JWT Auth (Access + Refresh + Blacklisting) | OAuth2 (Google) | Rate Limiting | TLS 1.3 | Language Detect
  ▼
[Multi-Modal Analysis]
  ├── Form Analysis (MADRS, PHQ-9, GAD-7 scoring)
  ├── NLP Engine (Sentiment, Emotion AI, Threat detection)
  └── Voice Analysis (Whisper STT, Pitch variability, Stress signals)
  ▼
[Feature Fusion Layer]
  └── Weighted Ensemble: MADRS (40%), NLP (15%), Voice (10%), Context (15%), Baseline (20%)
  ▼
[Distress Score Engine]
  └── Score: 0 - 100 | Severity: 🟢 Low, 🟡 Moderate, 🟠 High, 🔴 Critical | XGBoost + SHAP explainability
  ▼
[Temporal Trend Model (LSTM)]
  └── Progression: 32 -> 41 -> 58 -> 71 | Trajectory forecasting & worsening risk detection
  ▼
[Action Engines]
  ├── Alert Engine: Push notification, SMS, IVR callback, 108 Emergency Ambulance dispatch API
  └── Recommendation Engine: Tele-MANAS Counselling, NGO field support, NALSA Legal aid, Medical, Financial relief
  ▼
[Health Observer Dashboard (District · State · National)]
  └── Caseload overview, score distribution, risk alerts, telepsychiatry assignment, interventions
  ▼
[Ecosystem Integrations]
  ├── Psychiatrist (Telepsychiatry portal)
  ├── NGO Partners (Field support & community resources)
  └── Ambulance (108) (Crisis dispatch webhook / API)
```

---

## 📁 Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── __init__.py
│   │   └── config.py              # Application settings, JWT secrets, OAuth, fusion weights
│   ├── controllers/
│   │   ├── __init__.py
│   │   ├── auth_controller.py      # Registration, login, token refresh, logout, OAuth
│   │   └── interview_controller.py # Assessment ingestion, AI orchestration, observer dashboard
│   ├── db/
│   │   ├── __init__.py
│   │   └── db.py                  # MongoDB Motor client, collection accessors, init_db()
│   ├── middlewares/
│   │   ├── __init__.py
│   │   ├── auth_middleware.py     # JWT Bearer validation, Role-Based Access Control, token blacklist
│   │   └── file_middleware.py     # Audio upload validation (WAV, MP3, M4A, OGG)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── blacklist_model.py     # BlacklistedToken collection schema & serializer
│   │   ├── interview_report_model.py # Multi-modal assessment documents & serializer
│   │   └── user_model.py          # User collection schema & serializer
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth_routes.py         # /api/v1/auth endpoints
│   │   └── interview_routes.py    # /api/v1/interview & observer endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai_service.py          # Multi-modal AI logic with explicit TODOs for ML model integration
│   │   ├── check.json             # Clinical questionnaires (MADRS, PHQ-9, GAD-7) & thresholds
│   │   └── test.py                # Standalone verification test for AI services
│   └── app.py                     # FastAPI application factory, CORS, exception handlers
├── .env                           # Environment variables (MONGO_URI, MONGO_DB_NAME)
├── .env.example                   # Template environment variables
├── .gitignore                     # Git ignore rules
├── package.json                   # Convenience scripts (npm run dev, npm test)
├── README.md                      # Comprehensive documentation & ML connection guide
├── requirements.txt               # Backend dependencies (pymongo, motor, etc.)
├── server.py                      # Uvicorn server launcher
└── test_e2e.py                    # Complete end-to-end integration test suite
```

---

## 🗄️ MongoDB Configuration

Configured directly in [`.env`](.env):

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=mental_health_db
```

Collections and Indexes automatically initialized by `init_db()` in [`src/db/db.py`](src/db/db.py):
- **`users`**: Unique index on `email`, indexed on `district`, `state`.
- **`blacklisted_tokens`**: Unique index on `token` for instant token revocation lookup.
- **`interview_reports`**: Unique index on `session_id`, indexed on `victim_id`, `created_at`, `distress_score`, and `severity_level`.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server
```bash
python3 server.py
# or
uvicorn src.app:app --reload --port 8000
```
- Interactive Swagger UI: **http://localhost:8000/api/v1/docs**
- Redoc Documentation: **http://localhost:8000/api/v1/redoc**
- Health Check: **http://localhost:8000/api/v1/health**

### 3. Run Automated Tests
```bash
# Run AI service simulation test
PYTHONPATH=. python3 src/services/test.py

# Run Full 12-Step Integration Test Suite
python3 test_e2e.py
```

---

## 🧠 ML Integration Guide (Where to plug your ML models)

Open `src/services/ai_service.py` to connect your trained models:

1. **Form Analysis (`analyze_clinical_forms`)**:
   - Plug in custom Item-Response Theory (IRT) weights or severity models.
2. **NLP Engine (`analyze_nlp`)**:
   - Replace baseline keywords with HuggingFace transformers (`IndicBERT`, `RoBERTa`, `BERT-Multilingual`):
     ```python
     # Example:
     from transformers import pipeline
     sentiment_pipe = pipeline("sentiment-analysis", model="path/to/fine_tuned_trauma_model")
     ```
3. **Voice Analysis (`analyze_voice`)**:
   - Plug in `whisper` for speech-to-text:
     ```python
     import whisper
     model = whisper.load_model("base")
     result = model.transcribe(audio_file_path)
     ```
   - Plug in `librosa` or `openSMILE` for pitch and acoustic jitter/shimmer.
4. **Distress Score Engine (`compute_distress_score`)**:
   - Load your `XGBoost` model and calculate `SHAP` values:
     ```python
     import joblib, shap
     model = joblib.load("models/distress_xgboost.pkl")
     explainer = shap.TreeExplainer(model)
     ```
5. **Temporal Trend Model (`predict_temporal_trend`)**:
   - Plug in your sequential `LSTM` / `GRU` model trained on time-series distress trajectories.
6. **Alert Engine (`trigger_alert_engine`)**:
   - Configure real SMS gateways (Twilio / NIC SMS), IVR webhooks, and the government 108 Emergency Ambulance API.
