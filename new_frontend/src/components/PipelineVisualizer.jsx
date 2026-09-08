import React, { useState } from 'react';

export default function PipelineVisualizer({ onNavigateToIntake, onNavigateToDashboard }) {
  const [activeStep, setActiveStep] = useState('fusion');

  const steps = [
    {
      id: 'collection',
      title: '1. Data Collection',
      icon: '📥',
      badge: 'Multi-Modal Intake',
      desc: 'Ingests clinical questionnaires, narrative text, voice audio, sleep metrics, and threat reports from Mobile, Web, or IVR.',
      metrics: ['MADRS, PHQ-9, GAD-7', 'Audio Microphone Stream', 'Sleep (0-12h) & Threat Reports'],
    },
    {
      id: 'analysis',
      title: '2. Multi-Modal Analysis',
      icon: '🧠',
      badge: 'Parallel AI Models',
      desc: 'Concurrent processing across Text NLP (Emotion AI & Sentiment), Voice Acoustic features (Whisper STT & pitch jitter), and Form validation.',
      metrics: ['NLP Emotion & Threat Classifier', 'Speech-to-Text & Vocal Stress', 'Normalized Clinical Scale Scoring'],
    },
    {
      id: 'fusion',
      title: '3. Feature Fusion Layer',
      icon: '⚙️',
      badge: 'Weighted Ensemble',
      desc: 'Fuses clinical questionnaire scores (40%), NLP indicators (15%), acoustic voice features (10%), sleep/behavior (15%), and context threat (20%).',
      metrics: ['Weighted Linear & Non-Linear Mapping', 'Confidence Calibration', 'Cross-Modal Anomaly Filtering'],
    },
    {
      id: 'engine',
      title: '4. Distress Score Engine',
      icon: '🎯',
      badge: 'XGBoost + SHAP',
      desc: 'Computes unified distress score (0–100) with explainable AI identifying primary drivers and assigning Severity Band: Low, Medium, High, or Critical.',
      metrics: ['Score Calibration (0 - 100)', 'SHAP Explainability Vectors', '4-Tier Severity Thresholding'],
    },
    {
      id: 'trend',
      title: '5. Temporal Trend Model',
      icon: '📈',
      badge: 'LSTM Sequence',
      desc: 'Tracks sequential distress progression across historical check-ins (e.g., 32 → 41 → 53 → 71) to detect acute escalation and predict worsening risk.',
      metrics: ['Check-in Delta Tracking', 'Velocity & Trajectory Modeling', 'Predictive Escalation Risk Alert'],
    },
    {
      id: 'alerts',
      title: '6. Alert & Recommendation Engine',
      icon: '🚨',
      badge: 'Automated Response',
      desc: 'Triggers priority notifications, automated 108 Emergency Ambulance dispatch for critical distress, and personalized counselling/legal relief pathways.',
      metrics: ['108 Crisis Ambulance Protocol', 'Counsellor & Telepsychiatry Assignment', 'Legal Aid & Financial Relief Schemes'],
    },
    {
      id: 'dashboard',
      title: '7. Counsellor / Officer Dashboard',
      icon: '🛡️',
      badge: 'Command & Triage',
      desc: 'Provides district health observers and clinical officers with real-time caseload monitoring, distress progression graphs, and intervention tools.',
      metrics: ['Real-Time Caseload Triage', 'Temporal Trend Visualizations', 'Case History & Observer Notes'],
    },
  ];

  const currentDetail = steps.find((s) => s.id === activeStep) || steps[2];

  return (
    <div>
      {/* Visualizer Hero */}
      <div className="hero-banner">
        <div className="hero-text">
          <h1>End-to-End AI Architecture Pipeline</h1>
          <p>Interactive inspection of multi-modal data collection, feature fusion, distress scoring, and crisis response.</p>
          <div className="hero-badges">
            <span className="hero-pill">⚡ Live System Flow</span>
            <span className="hero-pill">🤖 Parallel Multi-Modal AI</span>
            <span className="hero-pill">🚑 Emergency 108 Integration</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={onNavigateToIntake}>
            Start Intake Assessment
          </button>
          <button type="button" className="btn btn-outline" onClick={onNavigateToDashboard}>
            Open Officer Dashboard
          </button>
        </div>
      </div>

      {/* Pipeline Stepper Grid */}
      <div className="content-card">
        <div className="content-card-title">
          <span>🔄 System Pipeline Architecture Flow</span>
        </div>
        <div className="content-card-subtitle">
          Select any pipeline node below to inspect operational mechanics, algorithms, and data contracts.
        </div>

        <div className="pipeline-flow-container">
          {steps.map((step, index) => {
            const isSelected = activeStep === step.id;
            return (
              <React.Fragment key={step.id}>
                <div
                  className={`pipeline-node-card ${isSelected ? 'active-node' : ''}`}
                  onClick={() => setActiveStep(step.id)}
                >
                  <div className="pipeline-node-icon">{step.icon}</div>
                  <div className="pipeline-node-title">{step.title}</div>
                  <span className="pipeline-node-badge">{step.badge}</span>
                </div>
                {index < steps.length - 1 && <div className="pipeline-connector-arrow">➔</div>}
              </React.Fragment>
            );
          })}
        </div>

        {/* Selected Node Deep Dive */}
        <div className="pipeline-detail-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.75rem' }}>{currentDetail.icon}</span>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#000000' }}>{currentDetail.title}</h3>
                <span className="pipeline-node-badge">{currentDetail.badge}</span>
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000000' }}>
              Node Status: <strong style={{ color: '#000000' }}>ONLINE (Production Ready)</strong>
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#000000', marginBottom: '1.25rem', lineHeight: '1.6' }}>
            {currentDetail.desc}
          </p>

          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#000000', marginBottom: '0.5rem' }}>
              Key Operational Mechanisms & Artifacts:
            </div>
            <ul style={{ paddingLeft: '1.25rem', color: '#000000', fontWeight: 600, fontSize: '0.9rem', lineHeight: '1.8' }}>
              {currentDetail.metrics.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
