import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, LogOut, Loader2, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../store/useUser';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, register, logout } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setShowPw(false);
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login-customer', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      register(data);
      onClose();
    } catch {
      setError('Connection error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-brand-primary/30 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 16, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-brand-primary/8 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-0 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-serif text-brand-primary">
              {user ? `Hi, ${user.name?.split(' ')[0] || user.email}` : 'Sign In'}
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
          /* Logged-in view */
          <div className="px-8 pb-8 pt-6 space-y-4">
            <div className="space-y-2">
              {user.email && (
                <div className="flex items-center justify-between py-2 border-b border-brand-primary/5">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-brand-primary/30">Email</span>
                  <span className="text-sm font-medium text-brand-primary">{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center justify-between py-2 border-b border-brand-primary/5">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-brand-primary/30">Phone</span>
                  <span className="text-sm font-medium text-brand-primary">{user.phone}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-4 mt-2 bg-brand-primary/5 text-brand-primary/50 rounded-2xl text-[9px] font-black uppercase tracking-[0.25em] hover:bg-red-50 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        ) : (
          /* Login form */
          <form onSubmit={handleLogin} className="px-8 pb-8 pt-6 space-y-3">
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/25 text-sm text-brand-primary font-medium"
            />
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 pr-12 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/25 text-sm text-brand-primary font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary/30 hover:text-brand-primary/60 transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p className="text-[11px] text-red-500 font-medium px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-1 bg-brand-lime text-brand-primary rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:brightness-95 transition-all shadow-lg shadow-brand-lime/30 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <><Loader2 size={13} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>

            <p className="text-[9px] text-brand-primary/30 text-center leading-relaxed pt-1">
              Use your KNWN / WordPress account credentials.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
