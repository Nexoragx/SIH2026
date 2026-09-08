# SIH26094 Frontend Application (React + Vite)

Production-ready **React + Vite** frontend client for **AI-Powered Dynamic Mental Health Monitoring and Distress Prediction System for Victims of Atrocities (SIH26094)**.

---

## 📁 Standard Architecture & Folder Structure

```
new_frontend/
├── src/
│   ├── config/
│   │   └── api.config.js          # Backend API URLs & endpoints map (http://localhost:8000/api/v1)
│   ├── context/
│   │   └── AuthContext.jsx        # React Auth Context (user state, login, register, logout)
│   ├── services/
│   │   ├── api.service.js         # Generic fetch client with Bearer token injection & 401 handling
│   │   ├── auth.service.js        # Register, login, logout, profile queries
│   │   ├── assessment.service.js  # Multi-modal screening (MADRS, PHQ-9, GAD-7, narrative, voice)
│   │   └── observer.service.js    # Health Observer dashboard & 108 ambulance interventions
│   ├── utils/
│   │   ├── storage.js             # JWT access/refresh token localStorage management
│   │   └── validators.js          # Input validation & sanitization
│   ├── components/
│   │   ├── Navbar.jsx             # Top navigation bar with role badge & session actions
│   │   ├── AuthModal.jsx          # Tabbed Login / Register modal with role selection
│   │   ├── AssessmentForm.jsx     # Clinical psychiatric screening forms & trauma narrative
│   │   ├── ResultModal.jsx        # Distress score meter (0-100), SHAP explainability, 108 alert
│   │   └── ObserverDashboard.jsx  # Health Observer caseload dashboard & intervention assignment
│   ├── styles/
│   │   ├── index.css              # Master stylesheet
│   │   ├── main.css               # Design system variables, buttons, hero banner, glassmorphism
│   │   ├── auth.css               # Authentication form inputs & error states
│   │   └── dashboard.css          # Gauge colors, severity pills, and 108 Emergency banner
│   ├── App.jsx                    # Root application component & view coordinator
│   └── main.jsx                   # React 19 createRoot entrypoint
├── index.html                     # HTML root template
├── vite.config.js                 # Vite development & build configuration
├── package.json                   # Dependencies (react, react-dom, vite, lucide-react)
└── README.md                      # Documentation
```

---

## 🚀 How to Run the Frontend

### 1. Install Dependencies
```bash
cd /Users/rajarshichatterjee/Desktop/Mental/new_frontend
npm install
```

### 2. Start the Vite Dev Server
```bash
npm run dev
```

Open your browser at:
👉 **http://localhost:3000**

---

## 🔗 Backend Connection

The frontend connects directly to the FastAPI backend:
`http://localhost:8000/api/v1`

Make sure your backend is running:
```bash
cd /Users/rajarshichatterjee/Desktop/Mental/backend
python3 server.py
```

---

## 🌟 Key Features

1. **JWT & Role-Based Authentication**:
   - Tabbed Login/Register modal with roles: `Victim`, `District Health Observer`, `State Health Observer`, `Psychiatrist`, `NGO Partner`.
   - Bearer token stored in `localStorage` and automatically attached to requests.
   - Logout revokes tokens on the backend blacklist.
2. **Victim Touch-Point Screening**:
   - Clinical rating scales: **MADRS** (Depression), **PHQ-9** (Depressive symptoms), and **GAD-7** (Anxiety).
   - Natural Language Processing (NLP) trauma narrative input.
   - Multi-Modal Distress Score calculation (0–100) with color-coded severity tags.
   - **SHAP Feature Importance**: Explains to clinicians which signals drove the distress prediction.
   - **Crisis 108 Emergency Ambulance Alert**: High-visibility banner when critical risk is detected.
3. **Health Observer Caseload Dashboard**:
   - District & State caseload metrics: Total cases, Critical flags, Active 108 Emergency Dispatches.
   - Interactive caseload table with clinical notes assignment.
