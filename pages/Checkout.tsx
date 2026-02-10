
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, Send, MapPin, AlertCircle, Info } from 'lucide-react';
import { getActiveOrderInfo } from '../utils/dateLogic';
import { OrderPayload } from '../types';
import { clsx } from 'clsx';
import { useUser } from '../store/useUser';

const TAX_RATE = 0.02; // 2%
const TIP_OPTIONS = [0.08, 0.10, 0.15];

export default function Checkout({ cart }: { cart: any }) {
  const navigate = useNavigate();
  const { date } = getActiveOrderInfo();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tipRate, setTipRate] = useState<number>(0.10); // Default 10%

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/menu');
    }
  }, [cart.items.length, navigate]);

  const subtotal = cart.total;
  const tax = subtotal * TAX_RATE;
  const tip = subtotal * tipRate;
  const finalTotal = subtotal + tax + tip;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const payload: OrderPayload = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      type: 'delivery',
      address: {
        street: formData.get('street') as string,
        city: 'Miami',
        zip: formData.get('zip') as string,
      },
      notes: formData.get('notes') as string,
      items: cart.items,
      subtotal: subtotal,
      tax: tax,
      tip: tip,
      total: finalTotal,
      serviceDay: date,
    };

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Special handling for local development where /api/order might not exist
      if (!res.ok && window.location.hostname === 'localhost') {
        console.warn('Backend API not found. Simulating success for local testing.');
        const mockOrderId = `KNWN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        setTimeout(() => {
          cart.clearCart();
          navigate('/thank-you', { state: { orderId: mockOrderId, payload } });
        }, 1200);
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Order submission failed.');
      }

      const data = await res.json();
      cart.clearCart();
      navigate('/thank-you', { state: { orderId: data.orderId, payload } });
    } catch (err: any) {
      if (window.location.hostname === 'localhost') {
        // Fallback for fatal local errors (like network refused)
        console.warn('Network error. Simulating success for local testing.', err);
        const mockOrderId = `KNWN-LOCAL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        cart.clearCart();
        navigate('/thank-you', { state: { orderId: mockOrderId, payload } });
      } else {
        setError(err.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) return null;

  return (
    <div className="bg-brand-cream min-h-screen pt-24 pb-32 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-muted hover:text-brand-charcoal transition-colors mb-8 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="uppercase tracking-widest text-[10px] font-bold">Back to Menu</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 space-y-12">
            <div>
              <h1 className="text-4xl font-serif mb-2 text-brand-charcoal">Delivery Details</h1>
              <p className="text-brand-muted font-light flex items-center gap-2">
                <MapPin size={14} className="text-brand-accent" />
                Service exclusively available in the <span className="text-brand-charcoal font-medium">Miami area</span>
              </p>
            </div>

            <form id="order-form" onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-6">
                <h3 className="uppercase tracking-widest text-xs font-bold border-b border-brand-clay/50 pb-2">1. Customer Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <input required name="name" type="text" placeholder="Full Name" className="w-full bg-white border border-brand-clay/50 rounded-xl px-5 py-4 focus:ring-1 focus:ring-brand-accent focus:outline-none placeholder:text-brand-muted/40" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required defaultValue={user?.email} name="email" type="email" placeholder="Email Address" className="w-full bg-white border border-brand-clay/50 rounded-xl px-5 py-4 focus:ring-1 focus:ring-brand-accent focus:outline-none placeholder:text-brand-muted/40" />
                    <input required defaultValue={user?.phone} name="phone" type="tel" placeholder="Phone Number" className="w-full bg-white border border-brand-clay/50 rounded-xl px-5 py-4 focus:ring-1 focus:ring-brand-accent focus:outline-none placeholder:text-brand-muted/40" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="uppercase tracking-widest text-xs font-bold border-b border-brand-clay/50 pb-2">2. Miami Delivery Address</h3>
                <div className="space-y-4">
                  <input required name="street" type="text" placeholder="Street Address" className="w-full bg-white border border-brand-clay/50 rounded-xl px-5 py-4 focus:ring-1 focus:ring-brand-accent focus:outline-none placeholder:text-brand-muted/40" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-brand-clay/20 border border-brand-clay/50 rounded-xl px-5 py-4 text-brand-muted text-sm flex items-center font-medium">
                      Miami, FL
                    </div>
                    <input required defaultValue={user?.zip} name="zip" type="text" placeholder="Zip Code" className="w-full bg-white border border-brand-clay/50 rounded-xl px-5 py-4 focus:ring-1 focus:ring-brand-accent focus:outline-none placeholder:text-brand-muted/40" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="uppercase tracking-widest text-xs font-bold border-b border-brand-clay/50 pb-2">3. Add a Tip</h3>
                <div className="grid grid-cols-3 gap-3">
                  {TIP_OPTIONS.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setTipRate(rate)}
                      className={clsx(
                        "py-4 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all",
                        tipRate === rate
                          ? "bg-brand-charcoal text-white border-brand-charcoal"
                          : "bg-white text-brand-muted border-brand-clay/50 hover:border-brand-accent"
                      )}
                    >
                      {rate * 100}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="uppercase tracking-widest text-xs font-bold border-b border-brand-clay/50 pb-2">4. Final Notes</h3>
                <textarea name="notes" placeholder="Special instructions for the chef or delivery team..." rows={3} className="w-full bg-white border border-brand-clay/50 rounded-xl px-5 py-4 focus:ring-1 focus:ring-brand-accent focus:outline-none resize-none placeholder:text-brand-muted/40"></textarea>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-brand-clay/30 rounded-3xl p-8 sticky top-24 space-y-8 shadow-sm">
              <h3 className="uppercase tracking-widest text-xs font-bold border-b border-brand-clay/50 pb-4">Order Review</h3>

              <div className="space-y-4 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                {cart.items.map((item: any) => (
                  <div key={`${item.id}-${item.serviceDate}-${JSON.stringify(item.customizations || {})}`} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-medium">{item.name}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] text-brand-muted uppercase tracking-widest">Qty: {item.quantity}</p>
                      </div>
                      {item.customizations && (
                        <p className="text-[9px] text-brand-muted/80 leading-tight mt-1">
                          {item.customizations.base} • {item.customizations.protein} • {item.customizations.sauce}
                          {item.customizations.avoid && <span className="block italic mt-0.5">Avoid: {item.customizations.avoid}</span>}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-serif">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-brand-clay/30">
                <div className="flex justify-between text-brand-muted text-[10px] uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-muted text-[10px] uppercase tracking-widest flex items-center gap-1">
                  <span className="flex items-center gap-1">Tax <span className="text-[8px] opacity-60">(2%)</span></span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-muted text-[10px] uppercase tracking-widest">
                  <span>Tip</span>
                  <span>${tip.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-serif pt-4 border-t border-brand-clay/30 text-brand-charcoal">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-4 bg-brand-cream/50 rounded-xl flex items-start gap-3 text-[10px] text-brand-muted leading-relaxed italic border border-brand-clay/20">
                <Info size={14} className="shrink-0 text-brand-accent" />
                Miami Delivery only. Scheduled for {date}.
              </div>

              <button
                form="order-form"
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-brand-charcoal text-white rounded-full flex items-center justify-center gap-3 hover:bg-brand-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span className="uppercase tracking-[0.2em] text-[10px] font-black">Complete Order</span>
                    <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
