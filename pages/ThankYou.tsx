
import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Mail, Calendar } from 'lucide-react';

export default function ThankYou() {
  const location = useLocation();
  const { orderId, payload } = location.state || {};

  if (!orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-brand-cream min-h-screen flex items-center justify-center px-6 py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center space-y-10"
      >
        <div className="space-y-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle2 size={40} strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-5xl font-serif">Order Received</h1>
          <p className="text-xl text-brand-muted font-light leading-relaxed">
            Thank you, <span className="text-brand-charcoal font-medium">{payload.name}</span>. Your culinary journey for <span className="text-brand-charcoal font-medium">{payload.serviceDay}</span> is now confirmed.
          </p>
        </div>

        <div className="bg-white border border-brand-clay rounded-3xl p-8 space-y-6 shadow-sm text-left">
          <div className="flex justify-between items-center pb-4 border-b border-brand-clay/30">
            <span className="text-brand-muted uppercase tracking-widest text-[10px] font-bold">Reference ID</span>
            <span className="font-mono text-sm font-semibold">{orderId}</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-brand-clay/20 rounded-full flex items-center justify-center text-brand-accent shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-sm font-medium">Scheduled Date</p>
                <p className="text-xs text-brand-muted">{payload.serviceDay}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-brand-clay/20 rounded-full flex items-center justify-center text-brand-accent shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-sm font-medium">Confirmation Email</p>
                <p className="text-xs text-brand-muted">Sent to {payload.email}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-brand-clay/30">
            <p className="text-[10px] text-brand-muted uppercase tracking-[0.15em] leading-relaxed">
              Orders are typically ready between 11:30 AM and 2:00 PM on the day of service. We will send you another update when your meal is en route.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="px-8 py-4 bg-brand-charcoal text-white rounded-full uppercase tracking-widest text-xs font-bold hover:scale-105 transition-transform"
          >
            Back to Home
          </Link>
          <Link 
            to="/about" 
            className="px-8 py-4 border border-brand-clay rounded-full uppercase tracking-widest text-xs font-bold hover:bg-brand-clay/10 transition-colors"
          >
            Our Story
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
