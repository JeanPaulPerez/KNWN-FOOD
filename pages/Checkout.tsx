/**
 * pages/Checkout.tsx
 *
 * Full checkout flow tailored to KNWN design system:
 * - Customer info, payment method
 * - Order Summary (right column)
 * - Integration with existing wooCart logic and /api/complete-order
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft, Loader2, Send, MapPin, AlertCircle,
  Info, Tag, CheckCircle, X, Lock, Check,
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getActiveOrderInfo } from '../utils/dateLogic';
import { clsx } from 'clsx';
import { useUser } from '../store/useUser';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

const TAX_RATE = 0.063; // E.g., Miami tax

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#1E0B6E',
      fontFamily: '"Poppins", sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#1E0B6E40' },
    },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
};

function CheckoutForm({ cart }: { cart: any }) {
  const navigate = useNavigate();
  const { date } = getActiveOrderInfo();
  const { user } = useUser();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tipRate, setTipRate] = useState<number | 'none'>('none');
  const [repeatOrder, setRepeatOrder] = useState(true);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discountType: string; discountValue: number; isFree: boolean; } | null>(null);

  useEffect(() => {
    if (cart.items.length === 0) navigate('/menu');
  }, [cart.items.length, navigate]);

  const subtotal = cart.total;
  
  // Calculate discount first
  const discountAmount = coupon
    ? coupon.discountType === 'percent'
      ? (subtotal * coupon.discountValue) / 100
      : Math.min(coupon.discountValue, subtotal)
    : 0;

  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = afterDiscount * TAX_RATE;
  const tipAmount = tipRate === 'none' ? 0 : afterDiscount * tipRate;
  const finalTotal = afterDiscount + tax + tipAmount;
  const isFree = finalTotal === 0 && coupon?.isFree;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true); setCouponError(''); setCoupon(null);
    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponInput.trim() }),
      });
      const data = await res.json();
      if (data.valid) { setCoupon(data); } else { setCouponError(data.error); }
    } catch { setCouponError('Error validating coupon. Try again.'); }
    finally { setCouponLoading(false); setCouponInput(''); }
  };

  const handleRemoveCoupon = () => setCoupon(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError('');
    const form = new FormData(e.currentTarget);
    const customerInfo = {
      name:   form.get('firstName') + ' ' + form.get('lastName'),
      email:  form.get('email') as string,
      phone:  form.get('phone') as string,
      street: form.get('street') as string,
      city:   form.get('city') as string,
      state:  form.get('state') as string,
      zip:    form.get('zip') as string,
      notes:  'N/A',
    };

    try {
      let paymentIntentId: string | null = null;
      if (!isFree) {
        if (!stripe || !elements) throw new Error('Payment not loaded.');
        const piRes = await fetch('/api/create-payment-intent', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amountInCents: Math.round(finalTotal * 100), customerEmail: customerInfo.email }),
        });
        if (!piRes.ok) throw new Error((await piRes.json()).error);
        const { clientSecret } = await piRes.json();
        const cardEl = elements.getElement(CardElement);
        if(!cardEl) throw new Error('Missing card info');
        const { error: sErr, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardEl, billing_details: { name: customerInfo.name, email: customerInfo.email } },
        });
        if (sErr) throw new Error(sErr.message);
        paymentIntentId = paymentIntent?.id || null;
      }
      const orderRes = await fetch('/api/complete-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart.items, customerInfo, couponCode: coupon?.code, paymentIntentId, isFree, total: finalTotal }),
      });
      if (!orderRes.ok) throw new Error((await orderRes.json()).error);
      const data = await orderRes.json();
      cart.clearCart();
      navigate('/thank-you', { state: { orders: data.orders, payload: { ...customerInfo, items: cart.items, total: finalTotal } } });
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (cart.items.length === 0) return null;

  return (
    <div className="bg-[#F5F3FF] min-h-screen pt-28 md:pt-40 pb-20 md:pb-32 px-4 md:px-12 font-sans select-none">
      <div className="max-w-6xl mx-auto">
        <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* ── LEFT COLUMN: FORMS ────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Express Checkout */}
            <div className="text-center mb-8">
              <span className="text-brand-primary font-bold text-sm block mb-4">Express Payment</span>
              <div className="flex items-center gap-3 w-full">
                <button type="button" className="flex-1 bg-black text-white rounded-[0.5rem] py-3.5 flex justify-center items-center hover:brightness-110 shadow-sm border border-black transition-all">
                  <span className="font-bold tracking-tight text-lg">Pay</span>
                </button>
                <button type="button" className="flex-1 bg-[#00D632] text-[#00691B] rounded-[0.5rem] py-3.5 flex justify-center items-center hover:brightness-110 shadow-sm transition-all font-bold text-lg">
                  <span className="bg-white/90 px-3 py-0.5 rounded-full inline-flex items-center">
                    <span className="leading-none transform -translate-y-px">link</span>
                  </span>
                </button>
                <button type="button" className="flex-1 bg-[#FFC439] text-[#003087] rounded-[0.5rem] py-3.5 flex justify-center items-center hover:brightness-110 shadow-sm transition-all font-black text-lg italic">
                  PayPal
                </button>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-brand-primary/5">
              <h2 className="text-2xl font-bold text-brand-primary mb-6">Contact</h2>
              <div className="space-y-4">
                <input required type="email" name="email" defaultValue={user?.email} placeholder="Email" className="w-full border border-brand-primary/20 rounded-xl px-5 py-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all text-brand-primary font-medium" />
                <input required type="tel" name="phone" defaultValue={user?.phone} placeholder="Phone Number" className="w-full border border-brand-primary/20 rounded-xl px-5 py-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all text-brand-primary font-medium" />
                <label className="flex items-center gap-3 cursor-pointer pt-2 group">
                  <div className="w-5 h-5 rounded border-2 border-brand-primary/20 bg-white flex items-center justify-center group-hover:border-brand-primary transition-colors"></div>
                  <span className="text-sm font-semibold text-brand-primary/80 select-none">Send me updates and offers by email and SMS</span>
                </label>
              </div>
            </div>

            {/* Delivering To Block (Mocked Delivery details as shown) */}
            <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-brand-primary/5 flex flex-col items-start gap-1">
              <h2 className="text-2xl font-bold text-brand-primary">Delivering to Manantial</h2>
              <p className="text-brand-primary/60 font-medium text-base mb-1 tracking-tight">6778 W FLAGLER ST, MIAMI, FL, 33144-2946, United States</p>
              <button type="button" className="text-brand-orange text-sm font-bold hover:underline underline-offset-4">Edit delivery preferences</button>
            </div>

            {/* Payment Method */}
            <div className="bg-white border-2 border-brand-primary/10 rounded-[1.5rem] overflow-hidden shadow-sm">
              <h2 className="text-2xl font-bold text-brand-primary p-8 pb-4">Payment Method</h2>
              
              <div className="px-8 pb-6">
                <div className="flex flex-col border border-brand-primary/20 rounded-xl overflow-hidden bg-brand-primary/[0.02]">
                  
                  {/* Option 1 */}
                  <div className="flex items-center gap-3 p-4 border-b border-brand-primary/20 cursor-pointer bg-white">
                    <div className="w-5 h-5 rounded-full border-4 border-brand-primary flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-brand-primary rounded-full" />
                    </div>
                    <span className="font-semibold text-brand-primary">Credit/Debit Card</span>
                  </div>

                  {/* Option 2, 3 */}
                  <div className="flex items-center gap-3 p-4 border-b border-brand-primary/20 cursor-pointer hover:bg-white transition-colors">
                    <div className="w-5 h-5 rounded-full border-2 border-brand-primary/20" />
                    <span className="font-semibold text-brand-primary/60">PayPal</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white transition-colors">
                    <div className="w-5 h-5 rounded-full border-2 border-brand-primary/20" />
                    <span className="font-semibold text-brand-primary/60">Apple Pay</span>
                  </div>
                </div>
              </div>

              {/* Card Inputs */}
              {!isFree && (
                <div className="px-8 pb-8 space-y-5">
                  <div>
                    <label className="text-xs font-bold text-brand-primary mb-1.5 block">Card Number</label>
                    <div className="border border-brand-primary/20 rounded-xl px-5 py-4 bg-white shadow-inner">
                      <CardElement options={CARD_ELEMENT_OPTIONS} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="MM/YY" className="border border-brand-primary/20 rounded-xl px-4 py-3.5 focus:border-brand-primary text-brand-primary font-medium" />
                    <input type="text" placeholder="123" className="border border-brand-primary/20 rounded-xl px-4 py-3.5 focus:border-brand-primary text-brand-primary font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-brand-primary mb-1.5 block">Name on Card</label>
                    <input type="text" placeholder="John Doe" className="w-full border border-brand-primary/20 rounded-xl px-4 py-3.5 focus:border-brand-primary text-brand-primary font-medium" />
                  </div>
                </div>
              )}
            </div>

            {/* Billing Address (Dirección de facturación) */}
            <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-brand-primary/5 space-y-4">
              <h2 className="text-xl font-bold text-brand-primary mb-4">Dirección de facturación</h2>
              
              <div className="relative">
                <select className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 appearance-none font-medium text-brand-primary focus:border-brand-primary outline-none cursor-pointer">
                  <option>Estados Unidos</option>
                </select>
                <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">País / Región</label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input required name="firstName" type="text" defaultValue="Maria" className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 font-medium text-brand-primary focus:border-brand-primary outline-none" />
                  <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">Nombre</label>
                </div>
                <div className="relative">
                  <input required name="lastName" type="text" defaultValue="Salas" className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 font-medium text-brand-primary focus:border-brand-primary outline-none" />
                  <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">Apellidos</label>
                </div>
              </div>

              <div className="relative">
                <input required name="street" type="text" defaultValue="6778 West Flagler Street" className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 font-medium text-brand-primary focus:border-brand-primary outline-none" />
                <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">Dirección</label>
              </div>

              <div className="relative">
                <input type="text" placeholder="Casa, apartamento, etc. (opcional)" className="w-full border border-brand-primary/20 rounded-xl px-4 py-4 font-medium text-brand-primary focus:border-brand-primary outline-none placeholder:text-brand-primary/40" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <input required name="city" type="text" defaultValue="Miami" className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 font-medium text-brand-primary focus:border-brand-primary outline-none" />
                  <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">Ciudad</label>
                </div>
                <div className="relative col-span-1">
                  <select name="state" className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 appearance-none font-medium text-brand-primary focus:border-brand-primary outline-none">
                    <option>Florida</option>
                  </select>
                  <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">Estado</label>
                </div>
                <div className="relative">
                  <input required name="zip" type="text" defaultValue="33144" className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 font-medium text-brand-primary focus:border-brand-primary outline-none" />
                  <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">Código postal</label>
                </div>
              </div>
            </div>
            
          </div>

          {/* ── RIGHT COLUMN: SUMMARY ─────────────────────────────────────── */}
          <div className="lg:col-span-5 relative mt-4 md:mt-0">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-brand-primary/5 sticky top-32">
              <h2 className="text-2xl md:text-[1.7rem] font-bold text-brand-primary leading-tight mb-6">Order Summary</h2>
              
              {/* Group items by Service Date */}
              <div className="space-y-6">
                {Object.entries(
                  cart.items.reduce((acc: any, it: any) => {
                    const ds = it.serviceDate.split(',')[0]; // "Wednesday", "Thursday"
                    const dateFull = ds; // Using serviceDate format
                    if(!acc[dateFull]) acc[dateFull] = [];
                    acc[dateFull].push(it);
                    return acc;
                  }, {})
                ).map(([day, items]: any, i) => (
                  <div key={i} className="space-y-4">
                    <h4 className="text-sm font-bold text-brand-primary">{day}</h4>
                    {items.map((item: any) => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <img src={item.image || '/assets/food-bg/thai-beef-salad.jpg'} className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white bg-gray-100" />
                        <div className="flex-1">
                          <h5 className="text-[12px] font-bold text-brand-primary">{item.name}</h5>
                          <div className="flex items-center gap-2 mt-1 -ml-1">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-brand-primary/50 text-xs font-bold bg-transparent">−</span>
                            <span className="text-xs font-bold border border-brand-primary/20 rounded-md px-3 py-0.5">{item.quantity}</span>
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-brand-primary/50 text-xs font-bold">+</span>
                            <span className="text-brand-orange text-xs ml-auto pr-2">🗑</span>
                          </div>
                        </div>
                        <span className="font-bold text-brand-primary text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Repeat Order Alert */}
              <div className="mt-8 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-5 flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => setRepeatOrder(!repeatOrder)}
                  className={clsx("w-6 h-6 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-all shadow-sm", repeatOrder ? "bg-brand-primary" : "bg-white border border-brand-primary/20")}
                >
                  {repeatOrder && <Check size={14} className="text-white" strokeWidth={3} />}
                </button>
                <div className="cursor-pointer" onClick={() => setRepeatOrder(!repeatOrder)}>
                  <p className="font-bold text-brand-primary leading-tight text-sm">Repeat this order next week?</p>
                  <p className="text-xs text-brand-primary/60 font-medium leading-snug mt-1">Edit or pause until 10 PM the day before delivery.</p>
                </div>
              </div>

              {/* Promo code */}
              <div className="mt-6 flex gap-2">
                <input
                  type="text" placeholder="Promo Code" value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 border border-brand-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-brand-primary focus:border-brand-primary outline-none placeholder:text-brand-primary/40"
                />
                <button
                  type="button" onClick={handleApplyCoupon}
                  className="bg-brand-primary text-white rounded-xl px-6 font-bold text-sm tracking-wider hover:brightness-110"
                >
                  Apply
                </button>
              </div>
              {coupon && (
                <div className="mt-2 text-[10px] text-green-600 font-bold uppercase bg-green-50 px-3 py-1.5 rounded-md inline-block">
                  Code applied: {coupon.code} (-${discountAmount.toFixed(2)})
                </div>
              )}

              {/* Tips block (Agregar propina) */}
              <div className="mt-6 border border-brand-primary/10 bg-[#FAFAFC] rounded-2xl p-6">
                <h4 className="font-bold text-brand-primary text-sm mb-1">Agregar propina</h4>
                <p className="text-xs text-brand-primary/60 mb-4 flex gap-2 items-center">
                  <div className="w-3 h-3 rounded bg-[#00A9E0] text-white flex items-center justify-center"><Check size={8} strokeWidth={4} /></div>
                  Da una muestra de apoyo al equipo de Manantial Market
                </p>
                
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[0.10, 0.15, 0.20, 'none'].map((val) => {
                    const isActive = tipRate === val;
                    const amount = typeof val === 'number' ? (afterDiscount * val).toFixed(2) : null;
                    return (
                      <button
                        key={val} type="button" onClick={() => setTipRate(val as number|'none')}
                        className={clsx(
                          "py-3 flex flex-col items-center justify-center rounded-xl border font-bold transition-all shadow-sm bg-white",
                          isActive ? "border-[#00D632] shadow-[#00D632]/20 shadow-md ring-1 ring-[#00D632]" 
                                   : "border-gray-200 text-brand-primary/60 hover:border-gray-300"
                        )}
                      >
                        <span className={clsx("text-sm", isActive && "text-brand-primary")}>{val === 'none' ? 'Ninguno' : `${val}%`}</span>
                        {amount && <span className={clsx("text-[10px] opacity-60", isActive && "text-brand-primary font-medium")}>${amount}</span>}
                      </button>
                    )
                  })}
                </div>
                
                <div className="flex border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                  <div className="px-4 py-3 text-xs text-brand-primary/40 font-semibold flex-1">Propina personalizada</div>
                  <div className="flex items-center gap-1 border-r border-gray-200 px-3 opacity-30"><span className="px-1 text-lg">−</span><span className="px-1 text-lg">+</span></div>
                  <button type="button" className="px-4 py-3 text-[11px] font-bold text-brand-primary/50 bg-gray-50 uppercase hover:bg-gray-100 transition-colors">Agregar propina</button>
                </div>
                <p className="text-[10px] text-brand-primary/60 font-medium italic mt-4 text-center">Muchas gracias.</p>
              </div>

              {/* Order Total */}
              <div className="mt-8 space-y-4 font-semibold text-sm">
                <h3 className="text-2xl font-bold text-brand-primary mb-6">Order Total</h3>
                <div className="flex justify-between text-brand-primary/70">
                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-primary/70">
                  <span>Discounts</span><span>-${discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-primary/70">
                  <span>Shipping</span><span className="uppercase text-brand-primary">FREE</span>
                </div>
                <div className="flex justify-between text-brand-primary/70 pb-4 border-b border-brand-primary/10">
                  <span>Tax</span><span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-brand-primary pt-2">
                  <span>Total</span><span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg border border-red-200 flex gap-2 items-center mt-4">
                  <AlertCircle size={14} />{error}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-brand-primary text-white py-5 rounded-xl font-bold text-lg flex justify-center items-center gap-3 hover:brightness-110 shadow-[0_15px_30px_rgba(23,11,85,0.2)] transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={24} className="animate-spin" /> : <>Place Order <span className="text-[#D4E84F] text-2xl font-light transform translate-y-[-2px]">⟶</span></>}
                </button>
                <button type="button" onClick={() => navigate('/menu')} className="w-full bg-white border border-brand-primary/10 text-brand-primary py-4 rounded-xl font-bold text-sm tracking-wider flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                  <span className="text-xl transform -translate-y-[1px]">←</span> Continue Shopping
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Checkout({ cart }: { cart: any }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm cart={cart} />
    </Elements>
  );
}
