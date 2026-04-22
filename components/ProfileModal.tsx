import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, LogOut, Loader2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../store/useUser';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'reset';

async function parseApiResponse<T = any>(response: Response): Promise<T> {
  const raw = await response.text();

  try {
    return raw ? JSON.parse(raw) : ({} as T);
  } catch {
    const sanitized = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    throw new Error(sanitized || 'Server returned an invalid response');
  }
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const navigate = useNavigate();
  const { user, register, logout } = useUser();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showRegisterPw, setShowRegisterPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetNewPw, setResetNewPw] = useState('');
  const [resetConfirmPw, setResetConfirmPw] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setMode('login');
    setEmail('');
    setPassword('');
    setShowPw(false);
    setShowRegisterPw(false);
    setError('');
    setRegisterData({
      email: '',
      password: '',
      confirmPassword: '',
    });
    setResetStep(1);
    setResetEmail('');
    setResetOtp('');
    setResetToken('');
    setResetNewPw('');
    setResetConfirmPw('');
    setResetSuccess(false);
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login-customer', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseApiResponse<any>(res);

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      register(data);
      onClose();
      navigate('/account');
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register-customer', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await parseApiResponse<any>(res);

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      register(data);
      onClose();
      navigate('/account');
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await parseApiResponse<any>(res);
      if (!res.ok) {
        setError(data.error || 'Failed to send code');
        return;
      }
      setResetToken(data.token || '');
      setResetStep(2);
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetNewPw !== resetConfirmPw) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reset-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp, token: resetToken, newPassword: resetNewPw }),
      });
      const data = await parseApiResponse<any>(res);
      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }
      setResetSuccess(true);
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-brand-primary/30 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 16, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-brand-primary/8 overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-8 pt-8 pb-0 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-serif text-brand-primary">
              {user
                ? `Hi, ${user.name?.split(' ')[0] || user.email}`
                : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </h2>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-primary/30 mt-1">
              {user ? 'Your account' : 'Access your KNWN account'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-primary/5 rounded-full transition-colors text-brand-primary/40 hover:text-brand-primary"
          >
            <X size={18} />
          </button>
        </div>

        {user ? (
          <div className="px-8 pb-8 pt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-brand-primary/5">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-brand-primary/30">Email</span>
                <span className="text-sm font-medium text-brand-primary">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center justify-between py-2 border-b border-brand-primary/5">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-brand-primary/30">Phone</span>
                  <span className="text-sm font-medium text-brand-primary">{user.phone}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/account');
              }}
              className="w-full py-4 bg-brand-lime text-brand-primary rounded-2xl text-[9px] font-black uppercase tracking-[0.3em]"
            >
              Open dashboard
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-4 bg-brand-primary/5 text-brand-primary/50 rounded-2xl text-[9px] font-black uppercase tracking-[0.25em] hover:bg-red-50 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="px-8 pb-8 pt-6">
            <div className="mb-5 flex gap-1 rounded-full bg-brand-primary/5 p-1">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setResetSuccess(false); }}
                className={`flex-1 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] ${mode === 'login' ? 'bg-brand-primary text-white' : 'text-brand-primary/55'}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setResetSuccess(false); }}
                className={`flex-1 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] ${mode === 'register' ? 'bg-brand-primary text-white' : 'text-brand-primary/55'}`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => { setMode('reset'); setError(''); setResetSuccess(false); setResetStep(1); setResetEmail(''); setResetOtp(''); setResetToken(''); setResetNewPw(''); setResetConfirmPw(''); }}
                className={`flex-1 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] ${mode === 'reset' ? 'bg-brand-primary text-white' : 'text-brand-primary/50 hover:text-brand-primary'}`}
              >
                Reset
              </button>
            </div>

            {mode === 'reset' ? (
              resetSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="text-3xl mb-2">✓</div>
                  <p className="text-brand-primary font-semibold text-sm">Password updated!</p>
                  <p className="text-brand-primary/50 text-xs">You can now sign in with your new password.</p>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setResetSuccess(false); }}
                    className="w-full py-4 mt-2 bg-brand-lime text-brand-primary rounded-2xl text-[9px] font-black uppercase tracking-[0.3em]"
                  >
                    Go to Sign In
                  </button>
                </div>
              ) : resetStep === 1 ? (
                <form onSubmit={handleResetRequest} className="space-y-3">
                  <p className="text-[11px] text-brand-primary/50 pb-1">Enter your email and we'll send you a 6-digit code.</p>
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    value={resetEmail}
                    onChange={(event) => { setResetEmail(event.target.value); setError(''); }}
                    className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 text-sm text-brand-primary font-medium focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/25"
                  />
                  {error && <p className="text-[11px] text-red-500 font-medium px-1">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 mt-1 bg-brand-lime text-brand-primary rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? <><Loader2 size={13} className="animate-spin" /> Sending...</> : 'Send Code'}
                  </button>
                </form>
              ) : resetStep === 2 ? (
                <div className="space-y-3">
                  <p className="text-[11px] text-brand-primary/50 pb-1">
                    We sent a 6-digit code to <strong className="text-brand-primary/70">{resetEmail}</strong>. Check your inbox.
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={resetOtp}
                    onChange={(event) => { setResetOtp(event.target.value.replace(/\D/g, '')); setError(''); }}
                    className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 text-center text-xl font-black tracking-[0.4em] text-brand-primary focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/20 placeholder:tracking-normal placeholder:text-sm placeholder:font-medium"
                  />
                  {error && <p className="text-[11px] text-red-500 font-medium px-1">{error}</p>}
                  <button
                    type="button"
                    disabled={resetOtp.length !== 6}
                    onClick={() => { setError(''); setResetStep(3); }}
                    className="w-full py-4 mt-1 bg-brand-lime text-brand-primary rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] disabled:opacity-40"
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    onClick={() => { setResetStep(1); setResetOtp(''); setError(''); }}
                    className="w-full text-[10px] text-brand-primary/40 hover:text-brand-primary/70 transition-colors pt-1"
                  >
                    Resend code
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetVerify} className="space-y-3">
                  <p className="text-[11px] text-brand-primary/50 pb-1">Create your new password.</p>
                  <input
                    required
                    type="password"
                    placeholder="New Password"
                    value={resetNewPw}
                    onChange={(event) => { setResetNewPw(event.target.value); setError(''); }}
                    className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 text-sm text-brand-primary font-medium focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/25"
                  />
                  <input
                    required
                    type="password"
                    placeholder="Confirm New Password"
                    value={resetConfirmPw}
                    onChange={(event) => { setResetConfirmPw(event.target.value); setError(''); }}
                    className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 text-sm text-brand-primary font-medium focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/25"
                  />
                  {error && <p className="text-[11px] text-red-500 font-medium px-1">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 mt-1 bg-brand-lime text-brand-primary rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? <><Loader2 size={13} className="animate-spin" /> Updating...</> : 'Update Password'}
                  </button>
                </form>
              )
            ) : mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError('');
                  }}
                  className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/25 text-sm text-brand-primary font-medium"
                />
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError('');
                    }}
                    className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 pr-12 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/25 text-sm text-brand-primary font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary/30 hover:text-brand-primary/60 transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && <p className="text-[11px] text-red-500 font-medium px-1">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-1 bg-brand-lime text-brand-primary rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <><Loader2 size={13} className="animate-spin" /> Signing in...</> : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={(event) => setRegisterData((current) => ({ ...current, email: event.target.value }))}
                  className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 text-sm text-brand-primary font-medium"
                />
                <div className="relative">
                  <input
                    required
                    type={showRegisterPw ? 'text' : 'password'}
                    placeholder="Password"
                    value={registerData.password}
                    onChange={(event) => setRegisterData((current) => ({ ...current, password: event.target.value }))}
                    className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 pr-12 text-sm text-brand-primary font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPw((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary/30 hover:text-brand-primary/60 transition-colors"
                  >
                    {showRegisterPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <input
                  required
                  type={showRegisterPw ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={registerData.confirmPassword}
                  onChange={(event) => setRegisterData((current) => ({ ...current, confirmPassword: event.target.value }))}
                  className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 text-sm text-brand-primary font-medium"
                />
                <p className="px-1 text-[11px] text-brand-primary/45">
                  You can add your name, address, and phone later from your account or during checkout.
                </p>
                {error && <p className="text-[11px] text-red-500 font-medium px-1">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-1 bg-brand-lime text-brand-primary rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <><Loader2 size={13} className="animate-spin" /> Creating account...</> : 'Create account'}
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
