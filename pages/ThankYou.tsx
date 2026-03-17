import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Mail, Calendar, Hash } from 'lucide-react';

interface OrderResult {
  itemName:   string;
  itemId:     string;
  orderId:    string;
  wooOrderId: number | null;
}

export default function ThankYou() {
  const location = useLocation();
  const { orders, payload } = location.state || {};

  if (!orders?.length || !payload) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-brand-subtle min-h-screen flex items-center justify-center px-4 md:px-6 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl w-full text-center space-y-10 md:space-y-16"
      >
        {/* Header */}
        <div className="space-y-6 md:space-y-8">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 md:w-32 md:h-32 bg-brand-primary text-white rounded-2xl md:rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-brand-primary/40 rotate-12"
          >
            <CheckCircle2 size={56} strokeWidth={1} />
          </motion.div>
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-5xl md:text-7xl font-serif text-brand-primary tracking-tighter leading-none">
              Order <br /><span className="italic font-light">Confirmed.</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-primary/40 font-medium leading-relaxed max-w-lg mx-auto italic border-l-2 border-brand-primary/20 pl-4 py-1">
              Thank you, <span className="text-brand-primary font-black not-italic">{payload.name}</span>.{' '}
              {orders.length > 1
                ? `Your ${orders.length} meals are being orchestrated.`
                : 'Your culinary experience is being orchestrated.'}
            </p>
          </div>
        </div>

        {/* Order card */}
        <div className="bg-white border border-brand-primary/5 rounded-3xl md:rounded-[3.5rem] p-8 md:p-12 space-y-8 md:space-y-10 shadow-2xl shadow-brand-primary/5 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full -mr-24 -mt-24 blur-3xl" />

          {/* Customer details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 pb-8 border-b border-brand-primary/5">
            <div className="flex gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-subtle text-brand-primary rounded-xl md:rounded-[1.25rem] flex items-center justify-center shrink-0">
                <Calendar size={24} strokeWidth={1.5} />
              </div>
              <div className="space-y-0.5 md:space-y-1">
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-brand-primary/30">Service Date</p>
                <p className="text-sm md:text-base font-serif text-brand-primary leading-tight">{payload.serviceDay}</p>
              </div>
            </div>
            <div className="flex gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-subtle text-brand-primary rounded-xl md:rounded-[1.25rem] flex items-center justify-center shrink-0">
                <Mail size={24} strokeWidth={1.5} />
              </div>
              <div className="space-y-0.5 md:space-y-1">
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-brand-primary/30">Confirmation</p>
                <p className="text-sm md:text-base font-serif text-brand-primary leading-tight overflow-hidden text-ellipsis">{payload.email}</p>
              </div>
            </div>
          </div>

          {/* One row per order */}
          <div className="space-y-4">
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black text-brand-primary/30 flex items-center gap-2">
              <Hash size={12} />
              {orders.length === 1 ? 'Order ID' : `${orders.length} Individual Orders`}
            </p>

            <div className="space-y-3">
              {orders.map((order: OrderResult, i: number) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-between bg-brand-subtle/60 border border-brand-primary/5 rounded-2xl px-6 py-4"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-xs font-black text-brand-primary truncate">{order.itemName}</p>
                  </div>
                  <span className="font-serif text-base md:text-lg text-brand-primary tracking-tight italic shrink-0">
                    {order.orderId}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="pt-6 md:pt-8 border-t border-brand-primary/5">
            <p className="text-[10px] md:text-[11px] text-brand-primary/40 font-medium leading-relaxed italic">
              Our culinary core initiates preparation between 04:00 and 11:30. A digital update will manifest as your meal transits.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
          <Link
            to="/"
            className="px-8 md:px-12 py-5 md:py-6 bg-brand-primary text-white rounded-xl md:rounded-[1.5rem] uppercase tracking-[0.4em] text-[9px] md:text-[10px] font-black hover:scale-[1.05] transition-all shadow-2xl shadow-brand-primary/30 active:scale-[0.98] text-center"
          >
            Return Home
          </Link>
          <Link
            to="/"
            className="px-8 md:px-12 py-5 md:py-6 border border-brand-primary/10 text-brand-primary rounded-xl md:rounded-[1.5rem] uppercase tracking-[0.4em] text-[9px] md:text-[10px] font-black hover:bg-white transition-all active:scale-[0.98] text-center"
          >
            The Narrative
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
