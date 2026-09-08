import React, { useState, useEffect } from 'react';
import { observerService } from '../services/observer.service.js';
import { useAuth } from '../context/useAuth.js';

export default function ObserverDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_cases: 0, critical: 0, high: 0, active_108_dispatches: 0 });
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter tabs
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'triggers' | 'critical' | 'high'

  // Intervention modal
  const [selectedCaseForIntervention, setSelectedCaseForIntervention] = useState(null);
  const [interventionAction, setInterventionAction] = useState('counsellor_call');
  const [interventionNotes, setInterventionNotes] = useState('');
  const [isSavingIntervention, setIsSavingIntervention] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await observerService.getDashboard({ limit: 50 });
      setStats(data.statistics || {});
      setCases(data.cases || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const openInterventionModal = (caseItem) => {
    setSelectedCaseForIntervention(caseItem);
    setInterventionNotes(`Clinical intervention assigned for Case ${caseItem.session_id}. Scheduled priority review.`);
  };

  const handleSaveIntervention = async (e) => {
    e.preventDefault();
    if (!selectedCaseForIntervention) return;

    setIsSavingIntervention(true);
    try {
      await observerService.updateIntervention(selectedCaseForIntervention.id, {
        status: 'INTERVENTION_ASSIGNED',
        observer_notes: `[Action: ${interventionAction.toUpperCase()}] ${interventionNotes}`,
        dispatch_108_ambulance: interventionAction === 'dispatch_108',
      });
      alert('Intervention protocol successfully saved and dispatched.');
      setSelectedCaseForIntervention(null);
      fetchDashboard();
    } catch (err) {
      alert(`Failed to save intervention: ${err.message}`);
    } finally {
      setIsSavingIntervention(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    if (activeFilter === 'triggers') return c.alert_triggered || c.severity_level === 'CRITICAL';
    if (activeFilter === 'critical') return c.severity_level === 'CRITICAL';
    if (activeFilter === 'high') return c.severity_level === 'HIGH';
    return true;
  });

  return (
    <div>
      {/* Officer Header Banner */}
      <div className="hero-banner">
        <div className="hero-text">
          <h1>Counsellor & Clinical Officer Triage Dashboard</h1>
          <p>
            Jurisdiction: {user?.district || 'All Districts'}, {user?.state || 'All States'} | Active Monitoring Session
          </p>
          <div className="hero-badges">
            <span className="hero-pill">📊 Real-Time Distress Triage</span>
            <span className="hero-pill">🚑 108 Emergency Dispatch Engine</span>
            <span className="hero-pill">👨‍⚕️ Telepsychiatry Assignment</span>
            <span className="hero-pill">📈 Temporal Trend Modeling</span>
          </div>
        </div>

        {/* Prominent Quick Triggers Filter */}
        <button
          type="button"
          className={`btn-trigger ${activeFilter === 'triggers' ? 'active-trigger' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'triggers' ? 'all' : 'triggers')}
          title="Toggle and prioritize active crisis triggers"
        >
          <span className="trigger-icon">🚨</span>
          <span>{activeFilter === 'triggers' ? 'Showing Active Triggers' : 'Filter Crisis Triggers'}</span>
        </button>
      </div>

      {/* Caseload Metric Cards */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Caseload</span>
            <span>📁</span>
          </div>
          <div className="metric-number">{stats.total_cases || 0}</div>
        </div>

        <div className="metric-card critical">
          <div className="metric-header">
            <span className="metric-label">Critical Severity</span>
            <span>🔴</span>
          </div>
          <div className="metric-number">{stats.critical || 0}</div>
        </div>

        <div className="metric-card high">
          <div className="metric-header">
            <span className="metric-label">High Severity</span>
            <span>🟠</span>
          </div>
          <div className="metric-number">{stats.high || 0}</div>
        </div>

        <div className="metric-card critical">
          <div className="metric-header">
            <span className="metric-label">108 Dispatches Active</span>
            <span>🚑</span>
          </div>
          <div className="metric-number">{stats.active_108_dispatches || 0}</div>
        </div>
      </div>

      {/* Temporal Trend Chart Card */}
      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div className="content-card-title">
              <span>📈 Temporal Distress Trajectory Sequence (LSTM Model)</span>
            </div>
            <div className="content-card-subtitle" style={{ marginBottom: 0 }}>
              Longitudinal tracking across successive check-ins (e.g. 32 ➔ 41 ➔ 53 ➔ 71) detecting escalating psychological distress.
            </div>
          </div>
          <span className="role-pill" style={{ background: '#fee2e2' }}>
            Escalation Velocity Alert
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', height: '110px', padding: '0.75rem 0' }}>
          {[
            { label: 'Baseline', score: 32, date: 'T-21 Days' },
            { label: 'Check-in 2', score: 41, date: 'T-14 Days' },
            { label: 'Check-in 3', score: 53, date: 'T-7 Days' },
            { label: 'Current Peak', score: 71, date: 'Current Evaluation', peak: true },
          ].map((point, idx) => (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.25rem', color: '#000000' }}>
                {point.score} / 100
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: '56px',
                  height: `${(point.score / 100) * 80}px`,
                  background: point.score <= 35 
                    ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)' 
                    : point.score <= 45 
                    ? 'linear-gradient(180deg, #eab308 0%, #ca8a04 100%)' 
                    : point.score <= 55 
                    ? 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)' 
                    : 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '8px 8px 0 0',
                  boxShadow: point.peak ? '0 0 16px rgba(239, 68, 68, 0.45)' : '0 2px 6px rgba(0, 0, 0, 0.1)',
                }}
              ></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#000000', marginTop: '0.4rem', textAlign: 'center' }}>
                {point.label} ({point.date})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cases Registry Table with Filter Toolbar */}
      <div className="content-card">
        <div className="observer-toolbar">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Cases' },
              { id: 'triggers', label: '🚨 Crisis Triggers Only' },
              { id: 'critical', label: '🔴 Critical Risk' },
              { id: 'high', label: '🟠 High Risk' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`btn ${activeFilter === f.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveFilter(f.id)}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            className="btn btn-outline"
            onClick={fetchDashboard}
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
          >
            🔄 Refresh Feed
          </button>
        </div>

        <div className="data-table-wrapper" style={{ marginTop: '1rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Case Session ID</th>
                <th>Distress Score</th>
                <th>Severity Band</th>
                <th>Ingestion Channel</th>
                <th>Alert Status</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', fontWeight: 700 }}>
                    Ingesting real-time caseload registry...
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', fontWeight: 700 }}>
                    {activeFilter === 'triggers' ? 'No active crisis triggers at this moment.' : 'No monitored assessments recorded yet.'}
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const sev = String(c.severity_level || 'low').toLowerCase();
                  return (
                    <tr key={c.id}>
                      <td><strong><code>{c.session_id}</code></strong></td>
                      <td><strong>{Number(c.distress_score || 0).toFixed(1)} / 100</strong></td>
                      <td>
                        <span className={`status-tag ${sev}`}>
                          {c.severity_level || 'LOW'}
                        </span>
                      </td>
                      <td>{c.touchpoint || 'web_portal'}</td>
                      <td>
                        {c.alert_triggered ? (
                          <span className="status-tag critical">🚨 Alert Sent</span>
                        ) : (
                          <span className="status-tag low">Normal</span>
                        )}
                      </td>
                      <td>
                        <span className="role-pill">{c.status || 'PENDING'}</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline"
                          onClick={() => openInterventionModal(c)}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 800 }}
                        >
                          Intervene
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinical Intervention Modal Drawer */}
      {selectedCaseForIntervention && (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setSelectedCaseForIntervention(null)}>
          <div className="modal-card">
            <button className="modal-close-btn" onClick={() => setSelectedCaseForIntervention(null)} aria-label="Close modal">
              &times;
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#000000' }}>
              Assign Clinical Intervention
            </h3>
            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#000000', marginBottom: '1.25rem' }}>
              Target Session: <strong>{selectedCaseForIntervention.session_id}</strong> | Distress Score: <strong>{selectedCaseForIntervention.distress_score}/100</strong>
            </p>

            <form onSubmit={handleSaveIntervention}>
              <div className="form-group">
                <label className="form-label">Intervention Action Protocol</label>
                <select
                  className="form-select"
                  value={interventionAction}
                  onChange={(e) => setInterventionAction(e.target.value)}
                >
                  <option value="counsellor_call">Schedule Immediate Counsellor Call</option>
                  <option value="safety_review">Initiate Field Safety & Threat Review</option>
                  <option value="telepsychiatrist">Assign Licensed Telepsychiatrist</option>
                  <option value="dispatch_108">Trigger 108 Emergency Ambulance Protocol</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Observer Notes</label>
                <textarea
                  className="narrative-textarea"
                  value={interventionNotes}
                  onChange={(e) => setInterventionNotes(e.target.value)}
                  placeholder="Record intervention rationale, urgent requirements, or dispatch directives..."
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.85rem' }}
                  disabled={isSavingIntervention}
                >
                  {isSavingIntervention ? 'Dispatching Intervention...' : 'Save & Dispatch Protocol'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSelectedCaseForIntervention(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
