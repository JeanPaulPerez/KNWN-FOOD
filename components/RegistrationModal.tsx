import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (userData: { email: string, phone: string, zip: string }) => void;
    onSkip: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, onConfirm, onSkip }) => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [zip, setZip] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && phone && zip) {
            onConfirm({ email, phone, zip });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 md:p-6">
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="bg-white max-w-md w-full rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-primary/10"
            >
                <div className="p-8 md:p-10 space-y-8 md:space-y-10 text-center relative">
                    <div className="absolute right-6 top-6">
                        <button onClick={onClose} className="p-2 hover:bg-brand-primary/5 rounded-full transition-colors text-brand-primary">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-3 pt-6 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-serif text-brand-primary">Get Started</h2>
                        <p className="text-[9px] md:text-[10px] text-brand-primary/40 uppercase tracking-[0.3em] font-bold">Chef-prepared meals await</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <input
                                required
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-brand-primary/5 border border-transparent rounded-xl md:rounded-2xl px-6 md:px-8 py-4 md:py-5 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/20 text-xs md:text-sm text-brand-primary"
                            />
                            <input
                                required
                                type="tel"
                                placeholder="Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-brand-primary/5 border border-transparent rounded-xl md:rounded-2xl px-6 md:px-8 py-4 md:py-5 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/20 text-xs md:text-sm text-brand-primary"
                            />
                            <input
                                required
                                type="text"
                                placeholder="ZIP Code"
                                value={zip}
                                onChange={(e) => setZip(e.target.value)}
                                className="w-full bg-brand-primary/5 border border-transparent rounded-xl md:rounded-2xl px-6 md:px-8 py-4 md:py-5 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/20 text-xs md:text-sm text-brand-primary"
                            />
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                            <button
                                type="submit"
                                className="w-full py-5 md:py-6 bg-brand-primary text-white rounded-xl md:rounded-[1.5rem] text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] transition-all active:scale-[0.98]"
                            >
                                Apply
                            </button>
                            <button
                                type="button"
                                onClick={onSkip}
                                className="w-full py-5 md:py-6 bg-white border-2 border-brand-primary/10 text-brand-primary/60 rounded-xl md:rounded-[1.5rem] text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand-primary/5 hover:border-brand-primary/20 transition-all active:scale-[0.98]"
                            >
                                Go to Checkout
                            </button>
                        </div>
                    </form>

                    <p className="text-[9px] md:text-[10px] text-brand-primary/40 font-light leading-relaxed px-4">
                        By continuing, you agree to our terms of service and privacy policy.
                        We use your info for delivery updates only.
                    </p>
                </div>
            </motion.div>
        </div>

    );
};

export default RegistrationModal;
