import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, LogOut, Check, Loader2, ChevronRight } from 'lucide-react';
import { useUser } from '../store/useUser';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, register, logout } = useUser();
  const [editing, setEditing] = useState(!user);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name:   user?.name   || '',
    email:  user?.email  || '',
    phone:  user?.phone  || '',
    street: user?.street || '',
    city:   user?.city   || '',
    zip:    user?.zip    || '',
  });

  // Sync form when user changes (e.g. on open)
  useEffect(() => {
    if (isOpen) {
      setEditing(!user);
      setSaved(false);
      setError('');
      setForm({
        name:   user?.name   || '',
        email:  user?.email  || '',
        phone:  user?.phone  || '',
        street: user?.street || '',
        city:   user?.city   || '',
        zip:    user?.zip    || '',
      });
    }
  }, [isOpen, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      setError('Name, email, and phone are required.');
      return;
    }
    setSaving(true);
    setError('');

    let wcCustomerId = user?.wcCustomerId;

    try {
      const res = await fetch('/api/save-customer', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        wcCustomerId = data.wcCustomerId || wcCustomerId;
      }
    } catch {
      // Non-fatal — still save locally
    }

    register({ ...form, wcCustomerId });
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    setEditing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-brand-primary/30 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 16, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-brand-primary/8 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="px-8 pt-8 pb-0 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-serif text-brand-primary leading-tight">
              {user && !editing ? `Hi, ${user.name.split(' ')[0]}` : 'Your Profile'}
            </h2>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-primary/30 mt-1">
              {user && !editing ? 'Member account' : 'Save your info for faster checkout'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-primary/5 rounded-full transition-colors text-brand-primary/40 hover:text-brand-primary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile view (logged in, not editing) */}
        {user && !editing ? (
          <div className="px-8 pb-8 pt-6 space-y-5">
            <div className="space-y-3">
              {[
                { label: 'Full Name', value: user.name },
                { label: 'Email', value: user.email },
                { label: 'Phone', value: user.phone },
                ...(user.street ? [{ label: 'Address', value: `${user.street}${user.city ? ', ' + user.city : ''}` }] : []),
                ...(user.zip ? [{ label: 'ZIP', value: user.zip }] : []),
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-brand-primary/5 last:border-0">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-brand-primary/30">{row.label}</span>
                  <span className="text-sm font-medium text-brand-primary">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 py-4 bg-brand-primary text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
              >
                Edit Info
                <ChevronRight size={12} />
              </button>
              <button
                onClick={handleLogout}
                className="py-4 px-5 bg-brand-primary/5 text-brand-primary/50 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-400 transition-colors flex items-center gap-2"
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>

            <AnimatePresence>
              {saved && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-[9px] font-black uppercase tracking-widest text-green-500 flex items-center justify-center gap-1.5"
                >
                  <Check size={11} /> Saved
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Form view (not logged in, or editing) */
          <form onSubmit={handleSave} className="px-8 pb-8 pt-6 space-y-4">
            <div className="space-y-3">
              <input
                name="name"
                type="text"
                required
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/25 text-sm text-brand-primary font-medium"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/25 text-sm text-brand-primary font-medium"
              />
              <input
                name="phone"
                type="tel"
                required
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/25 text-sm text-brand-primary font-medium"
              />

              {/* Optional delivery fields */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="street"
                  type="text"
                  placeholder="Street Address (optional)"
                  value={form.street}
                  onChange={handleChange}
                  className="col-span-2 w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/25 text-sm text-brand-primary font-medium"
                />
                <input
                  name="city"
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/25 text-sm text-brand-primary font-medium"
                />
                <input
                  name="zip"
                  type="text"
                  placeholder="ZIP Code"
                  value={form.zip}
                  onChange={handleChange}
                  className="w-full bg-brand-primary/5 border border-transparent rounded-xl px-5 py-4 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/25 text-sm text-brand-primary font-medium"
                />
              </div>
            </div>

            {error && (
              <p className="text-[10px] text-red-500 font-medium px-1">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-4 bg-brand-lime text-brand-primary rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:brightness-95 transition-all shadow-lg shadow-brand-lime/30 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <><Loader2 size={13} className="animate-spin" /> Saving...</>
                ) : saved ? (
                  <><Check size={13} /> Saved!</>
                ) : (
                  'Save Profile'
                )}
              </button>
              {(user || editing) && (
                <button
                  type="button"
                  onClick={() => { setEditing(false); if (!user) onClose(); }}
                  className="py-4 px-5 bg-brand-primary/5 text-brand-primary/50 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-brand-primary/10 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            <p className="text-[9px] text-brand-primary/30 font-light leading-relaxed text-center px-2">
              Your info is saved locally and used to pre-fill checkout.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
