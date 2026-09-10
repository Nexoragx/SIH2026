import React, { useState } from 'react';
import { AlertCircle, Lock, Shield, User, X } from 'lucide-react';
import { apiRequest, setStoredToken, setStoredUser } from '../../api/client';
import { AuthResponse } from '../../api/authApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthResponse['user']) => void;
}

export const AdminLoginModal: React.FC<Props> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await apiRequest<AuthResponse>('/auth/admin/login', {
        method: 'POST', body: JSON.stringify({ username, password }),
      });
      if (result.user.role !== 'admin') throw new Error('Administrator access was not granted.');
      setStoredToken(result.access_token, result.refresh_token);
      setStoredUser(result.user);
      onAuthSuccess(result.user);
      onClose();
    } catch (err: any) {
      setError(err.detail || err.message || 'Administrator sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
    <form onSubmit={submit} className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-amber-200 space-y-4">
      <button type="button" onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700" aria-label="Close"><X className="w-5 h-5" /></button>
      <div className="flex items-center gap-2 text-amber-800 font-black text-xs uppercase tracking-wider"><Shield className="w-4 h-4" /> Restricted portal</div>
      <div><h2 className="text-xl font-black text-slate-900">Administrator Sign In</h2><p className="mt-1 text-xs text-slate-600">Use your administrator ID to access the admin pages.</p></div>
      {error && <div className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      <label className="block text-xs font-bold text-slate-700">Admin ID<div className="relative mt-1"><User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><input required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm" autoComplete="username" /></div></label>
      <label className="block text-xs font-bold text-slate-700">Password<div className="relative mt-1"><Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm" autoComplete="current-password" /></div></label>
      <button disabled={loading} className="w-full rounded-xl bg-amber-600 py-3 text-sm font-black text-white hover:bg-amber-700 disabled:opacity-60">{loading ? 'Signing in…' : 'Sign In to Admin Portal'}</button>
    </form>
  </div>;
};
