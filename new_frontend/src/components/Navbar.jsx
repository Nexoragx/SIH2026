import React from 'react';
import { useAuth } from '../context/useAuth.js';

export default function Navbar({ currentView, onToggleView }) {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const isObserver = user && user.role && user.role.includes('observer');

  return (
    <header className="app-header">
      <div className="nav-container">
        <div className="brand" onClick={() => onToggleView('assessment')}>
          <span className="brand-icon">🧠</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="brand-title">Mental Health Monitoring & Distress Prediction</span>
              <span className="brand-badge">AI Health System</span>
            </div>
            <div className="brand-subtitle">
              Dynamic Psychological Assessment & Crisis Monitoring
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="nav-center-tabs">
          <button
            type="button"
            className={`nav-tab ${currentView === 'assessment' ? 'active' : ''}`}
            onClick={() => onToggleView('assessment')}
          >
            📋 Citizen Assessment
          </button>
          <button
            type="button"
            className={`nav-tab ${currentView === 'observer' ? 'active' : ''}`}
            onClick={() => onToggleView('observer')}
          >
            📊 Officer Dashboard
          </button>
          <button
            type="button"
            className={`nav-tab ${currentView === 'pipeline' ? 'active' : ''}`}
            onClick={() => onToggleView('pipeline')}
          >
            🔄 AI Architecture Flow
          </button>
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className="btn btn-emergency-top"
            onClick={() => {
              if (window.confirm("🚨 INITIATE 108 EMERGENCY DISPATCH?\n\nThis triggers an instant high-priority emergency packet to the nearest 108 ambulance response center and alerts clinical emergency responders.")) {
                alert("✅ EMERGENCY 108 AMBULANCE DISPATCHED\n\n• Unit ID: DL-AMB-108-49\n• ETA: 7-9 minutes\n• Real-time GPS Telemetry: Active\n• National Helpline 112 / Tele-MANAS 14416 alerted.");
              }
            }}
            title="Instant 108 Emergency Ambulance Trigger"
          >
            <span className="emergency-pulse-dot"></span>
            🚨 108 SOS
          </button>

          {isAuthenticated ? (
            <>
              <div className="user-badge">
                <span>👤 {isObserver ? (user.district ? `${user.district} Observer` : 'Health Observer') : 'Client Session'}</span>
                <span className={`role-pill ${isObserver ? 'observer' : 'victim'}`}>
                  {isObserver ? (user.role || 'Observer') : 'Citizen'}
                </span>
              </div>

              <button
                className="btn btn-danger"
                onClick={logout}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => openAuthModal('login')}>
                Sign In
              </button>
              <button className="btn btn-primary" onClick={() => openAuthModal('register')}>
                Register Account
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
