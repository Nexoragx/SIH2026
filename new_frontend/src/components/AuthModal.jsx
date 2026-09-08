import React, { useState } from 'react';
import { useAuth } from '../context/useAuth.js';
import { validators } from '../utils/validators.js';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, setAuthModalTab, login, register } = useAuth();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('victim');
  const [regDistrict, setRegDistrict] = useState('');
  const [regState, setRegState] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const extractErrorMessage = (err) => {
    if (!err) return 'An error occurred';
    if (typeof err === 'string') return err;
    if (typeof err.message === 'string' && err.message !== '[object Object]' && err.message.trim()) {
      return err.message;
    }
    if (err.data) {
      if (typeof err.data.detail === 'string') return err.data.detail;
      if (Array.isArray(err.data.detail)) {
        return err.data.detail
          .map((d) => (d.msg ? `${d.loc ? d.loc.filter((p) => p !== 'body').join('.') + ': ' : ''}${d.msg}` : JSON.stringify(d)))
          .join('; ');
      }
      if (typeof err.data.error === 'string') return err.data.error;
    }
    return `Request failed (${err.status || 400}). Please check your input and try again.`;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const validation = validators.validateLoginForm({ email: loginEmail, password: loginPassword });
    if (!validation.isValid) {
      setErrorMessage(Object.values(validation.errors)[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
      setErrorMessage(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Generate internal placeholder name to satisfy backend validation without showing Victim Name in UI
    const defaultDisplayName = regRole.includes('observer') ? 'District Observer' : 'Citizen Participant';

    const validation = validators.validateRegistrationForm({
      email: regEmail,
      password: regPassword,
      fullName: defaultDisplayName,
    });
    if (!validation.isValid) {
      setErrorMessage(Object.values(validation.errors)[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        full_name: defaultDisplayName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        district: regDistrict || null,
        state: regState || null,
      });
      setRegEmail('');
      setRegPassword('');
    } catch (err) {
      setErrorMessage(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && closeAuthModal()}>
      <div className="modal-card">
        <button className="modal-close-btn" onClick={closeAuthModal} aria-label="Close modal">
          &times;
        </button>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${authModalTab === 'login' ? 'active' : ''}`}
            onClick={() => { setAuthModalTab('login'); setErrorMessage(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authModalTab === 'register' ? 'active' : ''}`}
            onClick={() => { setAuthModalTab('register'); setErrorMessage(''); }}
          >
            Create Account
          </button>
        </div>

        {errorMessage && <div className="form-error-banner visible">{errorMessage}</div>}

        {authModalTab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>

            <div className="form-footer-hint">
              Need an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setAuthModalTab('register'); setErrorMessage(''); }}>
                Register here
              </a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            {/* Victim Name field completely removed from UI */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password (min 6 characters)</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select className="form-select" value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                <option value="victim">Citizen / Individual Seeking Support</option>
                <option value="observer_district">District Health Observer</option>
                <option value="observer_state">State Health Observer</option>
                <option value="psychiatrist">Telepsychiatrist</option>
                <option value="ngo_partner">NGO Field Partner</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">District (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Central"
                  value={regDistrict}
                  onChange={(e) => setRegDistrict(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Delhi"
                  value={regState}
                  onChange={(e) => setRegState(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
            </button>

            <div className="form-footer-hint">
              Already registered?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setAuthModalTab('login'); setErrorMessage(''); }}>
                Sign In
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
