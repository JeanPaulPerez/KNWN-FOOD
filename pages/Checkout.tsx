
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, Send, MapPin, AlertCircle, Info } from 'lucide-react';
import { getActiveOrderInfo } from '../utils/dateLogic';
import { OrderPayload } from '../types';
import { clsx } from 'clsx';
import { useUser } from '../store/useUser';

const TAX_RATE = 0.02; // 2%
const TIP_OPTIONS = [0, 0.08, 0.10, 0.15];

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
    <div className="bg-brand-subtle min-h-screen pt-28 md:pt-40 pb-20 md:pb-32 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-brand-primary/40 hover:text-brand-primary transition-all mb-16 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="uppercase tracking-[0.3em] text-[10px] font-black italic">Return to Selection</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 space-y-8 md:space-y-12 order-2 lg:order-1">
            <div>
              <h1 className="text-5xl md:text-7xl font-serif mb-4 md:mb-6 text-brand-primary leading-tight md:leading-none tracking-tighter">Finalize <br /><span className="italic font-light">Details.</span></h1>
              <p className="text-brand-primary/40 font-medium flex items-center gap-3 text-xs md:text-sm">
                <MapPin size={18} className="text-brand-primary" />
                Artisanal service exclusively in <span className="text-brand-primary font-black uppercase tracking-widest text-[9px] md:text-[10px]">Miami Metropolitan Area</span>
              </p>
            </div>


            <form id="order-form" onSubmit={handleSubmit} className="space-y-12">
              <div className="space-y-8">
                <h3 className="uppercase tracking-[0.3em] text-[10px] font-black border-l-2 border-brand-primary pl-6 py-1 text-brand-primary/40">1. Identity</h3>
                <div className="grid grid-cols-1 gap-4">
                  <input required name="name" type="text" placeholder="Full Name" className="w-full bg-white border border-brand-primary/5 rounded-[1.5rem] px-8 py-6 focus:ring-2 focus:ring-brand-primary/10 focus:outline-none placeholder:text-brand-primary/20 text-brand-primary transition-all font-medium" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required defaultValue={user?.email} name="email" type="email" placeholder="Email Address" className="w-full bg-white border border-brand-primary/5 rounded-[1.5rem] px-8 py-6 focus:ring-2 focus:ring-brand-primary/10 focus:outline-none placeholder:text-brand-primary/20 text-brand-primary transition-all font-medium" />
                    <input required defaultValue={user?.phone} name="phone" type="tel" placeholder="Phone Number" className="w-full bg-white border border-brand-primary/5 rounded-[1.5rem] px-8 py-6 focus:ring-2 focus:ring-brand-primary/10 focus:outline-none placeholder:text-brand-primary/20 text-brand-primary transition-all font-medium" />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="uppercase tracking-[0.3em] text-[10px] font-black border-l-2 border-brand-primary pl-6 py-1 text-brand-primary/40">2. Destination</h3>
                <div className="space-y-4">
                  <input required name="street" type="text" placeholder="Street Address" className="w-full bg-white border border-brand-primary/5 rounded-[1.5rem] px-8 py-6 focus:ring-2 focus:ring-brand-primary/10 focus:outline-none placeholder:text-brand-primary/20 text-brand-primary transition-all font-medium" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-brand-primary/5 border border-brand-primary/5 rounded-[1.5rem] px-8 py-5 md:py-6 text-brand-primary text-sm flex items-center font-black uppercase tracking-widest text-[9px] md:text-[10px]">
                      Miami, FL
                    </div>
                    <input required defaultValue={user?.zip} name="zip" type="text" placeholder="Zip Code" className="w-full bg-white border border-brand-primary/5 rounded-[1.5rem] px-8 py-5 md:py-6 focus:ring-2 focus:ring-brand-primary/10 focus:outline-none placeholder:text-brand-primary/20 text-brand-primary transition-all font-medium" />
                  </div>

                </div>
              </div>

              <div className="space-y-8">
                <h3 className="uppercase tracking-[0.3em] text-[10px] font-black border-l-2 border-brand-primary pl-6 py-1 text-brand-primary/40">3. Delivery Instructions</h3>
                <div className="relative group">
                  <select
                    required
                    name="notes"
                    className="w-full bg-white border border-brand-primary/10 rounded-[1.5rem] px-8 py-6 focus:ring-4 focus:ring-brand-primary/5 focus:outline-none appearance-none text-brand-primary transition-all font-medium cursor-pointer hover:border-brand-primary/30 shadow-sm hover:shadow-md"
                    defaultValue=""
                  >
                    <option value="" disabled>Choose an option</option>
                    <option value="There is a secure drop off location (e.g. locker, mail room, reception)">There is a secure drop off location (e.g. locker, mail room, reception)</option>
                    <option value="Delivery person is given access to the office">Delivery person is given access to the office</option>
                    <option value="Others">Others</option>
                  </select>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-brand-primary/40 group-hover:text-brand-primary group-hover:scale-110 transition-all">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="uppercase tracking-[0.3em] text-[10px] font-black border-l-2 border-brand-primary pl-6 py-1 text-brand-primary/40">4. Gratitude</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {TIP_OPTIONS.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setTipRate(rate)}
                      className={clsx(
                        "py-6 rounded-[1.5rem] border font-black text-[10px] uppercase tracking-[0.3em] transition-all",
                        tipRate === rate
                          ? "bg-brand-primary text-white border-brand-primary shadow-xl shadow-brand-primary/20 scale-[1.02]"
                          : "bg-white text-brand-primary/40 border-brand-primary/5 hover:border-brand-primary/20 hover:text-brand-primary shadow-sm hover:shadow-md"
                      )}
                    >
                      {rate * 100}%
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
            </form>
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white border border-brand-primary/5 rounded-3xl md:rounded-[3.5rem] p-8 md:p-12 lg:sticky lg:top-32 space-y-6 md:space-y-12 shadow-2xl shadow-brand-primary/5">
              <h3 className="uppercase tracking-[0.4em] text-[9px] md:text-[10px] font-black border-b border-brand-primary/5 pb-4 md:pb-8 text-brand-primary/40 text-center">Your Selection</h3>


              <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {cart.items.map((item: any) => (
                  <div key={`${item.id}-${item.serviceDate}-${JSON.stringify(item.customizations || {})} `} className="flex justify-between items-start gap-6 group">
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-black text-brand-primary group-hover:italic transition-all">{item.name}</p>
                      <p className="text-[10px] text-brand-primary/30 uppercase tracking-[0.2em] font-black">Quantity: {item.quantity}</p>
                      {item.customizations && (
                        <div className="text-[10px] text-brand-primary/60 leading-relaxed italic p-4 bg-brand-subtle/30 rounded-[1.5rem] border border-brand-primary/5 space-y-1">
                          {item.customizations.base && <div>Base: {item.customizations.base}</div>}
                          {item.customizations.sauce && <div>Sauce: {item.customizations.sauce}</div>}
                          {item.customizations.isVegetarian && (
                            <div className="text-green-600 font-bold">
                              Vegetariano: Yes
                              {item.customizations.vegInstructions && (
                                <span className="block text-[8px] opacity-70">({item.customizations.vegInstructions})</span>
                              )}
                            </div>
                          )}
                          {item.customizations.swap && <div>Swap: {item.customizations.swap}</div>}
                          {item.customizations.avoid && <div className="not-italic mt-2 text-red-500 font-black uppercase text-[8px] tracking-widest">Exclude: {item.customizations.avoid}</div>}
                        </div>
                      )}
                    </div>
                    <span className="text-lg font-serif text-brand-primary">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-10 border-t border-brand-primary/5">
                <div className="flex justify-between text-brand-primary/40 text-[10px] font-black uppercase tracking-[0.3em]">
                  <span>Logistics</span>
                  <span className="text-brand-primary">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-primary/40 text-[10px] font-black uppercase tracking-[0.3em]">
                  <span>Service Tax</span>
                  <span className="text-brand-primary">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-primary/40 text-[10px] font-black uppercase tracking-[0.3em]">
                  <span>Gratitude</span>
                  <span className="text-brand-primary font-black">${tip.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-3xl md:text-5xl font-serif pt-6 md:pt-10 border-t border-brand-primary/5 text-brand-primary tracking-tighter">
                  <span>Investment</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>

              </div>

              <div className="p-6 bg-brand-primary/5 rounded-[2rem] flex items-start gap-4 text-[11px] text-brand-primary/40 leading-relaxed italic border border-brand-primary/10">
                <Info size={18} className="shrink-0 text-brand-primary" />
                Scheduled for artisanal preparation on {date}. Delivery optimized for peak temperature.
              </div>

              <button
                form="order-form"
                type="submit"
                disabled={loading}
                className="w-full py-8 bg-brand-primary text-white rounded-[1.5rem] flex items-center justify-center gap-4 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_20px_50px_rgba(43,28,112,0.3)] active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <span className="uppercase tracking-[0.4em] text-[10px] font-black">Authorize Order</span>
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
