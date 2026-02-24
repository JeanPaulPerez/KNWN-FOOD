/**
 * pages/Checkout.tsx
 *
 * Full checkout flow with:
 *  - Customer info form
 *  - Promo code input (validates via /api/validate-coupon)
 *  - Stripe CardElement for paid orders
 *  - $0 bypass: if REALFOOD113 (or any 100% coupon), Stripe is skipped
 *    and the order goes directly to WooCommerce as "processing"
 *
 * FLOW SUMMARY:
 *   total > $0  →  Create PaymentIntent → confirmCardPayment → /api/complete-order
 *   total = $0  →  /api/complete-order directly (no Stripe)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft, Loader2, Send, MapPin, AlertCircle,
  Info, Tag, CheckCircle, X, Lock,
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getActiveOrderInfo } from '../utils/dateLogic';
import { clsx } from 'clsx';
import { useUser } from '../store/useUser';

// Load Stripe outside of render to avoid recreating on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

const TAX_RATE = 0.02;
const TIP_OPTIONS = [0, 0.08, 0.10, 0.15];

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#1a1a1a',
      fontFamily: '"Inter", "sans-serif"',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#c4bfdb' },
    },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
};

// ─── Inner form (must be inside <Elements>) ────────────────────────────────────

function CheckoutForm({ cart }: { cart: any }) {
  const navigate = useNavigate();
  const { date } = getActiveOrderInfo();
  const { user } = useUser();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tipRate, setTipRate] = useState<number>(0.10);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [coupon, setCoupon] = useState<{
    code: string;
    discountType: 'percent' | 'fixed_cart';
    discountValue: number;
    isFree: boolean;
  } | null>(null);

  useEffect(() => {
    if (cart.items.length === 0) navigate('/menu');
  }, [cart.items.length, navigate]);

  // ── Totals ─────────────────────────────────────────────────────────────────
  const subtotal = cart.total;
  const tax = subtotal * TAX_RATE;
  const tip = subtotal * tipRate;
  const preDiscountTotal = subtotal + tax + tip;

  const discountAmount = coupon
    ? coupon.discountType === 'percent'
      ? (preDiscountTotal * coupon.discountValue) / 100
      : Math.min(coupon.discountValue, preDiscountTotal)
    : 0;

  const finalTotal = Math.max(0, preDiscountTotal - discountAmount);

  /**
   * isFree: true when a 100% coupon is applied (e.g. REALFOOD113).
   * This flag controls whether Stripe is shown and whether
   * /api/create-payment-intent is called at all.
   */
  const isFree = finalTotal === 0 && coupon !== null;

  // ── Coupon handlers ────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCoupon(null);

    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim() }),
      });
      const data = await res.json();

      if (data.valid) {
        setCoupon({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          isFree: data.isFree,
        });
      } else {
        setCouponError(data.error || 'Invalid coupon code');
      }
    } catch {
      setCouponError('Unable to validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const customerInfo = {
      name:   formData.get('name')   as string,
      email:  formData.get('email')  as string,
      phone:  formData.get('phone')  as string,
      street: formData.get('street') as string,
      city:   'Miami',
      zip:    formData.get('zip')    as string,
      notes:  formData.get('notes')  as string,
    };

    try {
      let paymentIntentId: string | null = null;

      if (!isFree) {
        // ── PAID FLOW ──────────────────────────────────────────────────────
        // Step 1: Create PaymentIntent on the server
        if (!stripe || !elements) throw new Error('Payment system not ready. Please refresh.');

        const piRes = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amountInCents: Math.round(finalTotal * 100),
            customerEmail: customerInfo.email,
          }),
        });

        if (!piRes.ok) {
          const piErr = await piRes.json();
          throw new Error(piErr.error || 'Could not initialize payment');
        }

        const { clientSecret } = await piRes.json();

        // Step 2: Confirm the card payment client-side with Stripe Elements
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error('Card field not found');

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name:  customerInfo.name,
                email: customerInfo.email,
              },
            },
          }
        );

        if (stripeError) throw new Error(stripeError.message || 'Payment failed');
        if (paymentIntent?.status !== 'succeeded') throw new Error('Payment was not completed');

        paymentIntentId = paymentIntent.id;

      }
      // ── FREE FLOW: paymentIntentId stays null, server skips Stripe ─────────

      // Step 3: Create the WooCommerce order (both paid and free paths)
      const orderRes = await fetch('/api/complete-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items:           cart.items,
          customerInfo,
          couponCode:      coupon?.code || null,
          paymentIntentId,
          isFree,
          total:           finalTotal,
        }),
      });

      if (!orderRes.ok) {
        const orderErr = await orderRes.json();
        throw new Error(orderErr.error || 'Failed to place order');
      }

      const orderData = await orderRes.json();
      cart.clearCart();

      navigate('/thank-you', {
        state: {
          orderId: orderData.orderId,
          payload: { ...customerInfo, items: cart.items, total: finalTotal },
        },
      });

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
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

          {/* ── Left column: form ─────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-12 order-2 lg:order-1">
            <div>
              <h1 className="text-5xl md:text-7xl font-serif mb-4 md:mb-6 text-brand-primary leading-tight md:leading-none tracking-tighter">
                Finalize <br /><span className="italic font-light">Details.</span>
              </h1>
              <p className="text-brand-primary/40 font-medium flex items-center gap-3 text-xs md:text-sm">
                <MapPin size={18} className="text-brand-primary" />
                Artisanal service exclusively in{' '}
                <span className="text-brand-primary font-black uppercase tracking-widest text-[9px] md:text-[10px]">
                  Miami Metropolitan Area
                </span>
              </p>
            </div>

            <form id="order-form" onSubmit={handleSubmit} className="space-y-12">

              {/* 1. Identity */}
              <div className="space-y-8">
                <h3 className="uppercase tracking-[0.3em] text-[10px] font-black border-l-2 border-brand-primary pl-6 py-1 text-brand-primary/40">
                  1. Identity
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    required name="name" type="text" placeholder="Full Name"
                    className="w-full bg-white border border-brand-primary/5 rounded-[1.5rem] px-8 py-6 focus:ring-2 focus:ring-brand-primary/10 focus:outline-none placeholder:text-brand-primary/20 text-brand-primary transition-all font-medium"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      required defaultValue={user?.email} name="email" type="email" placeholder="Email Address"
                      className="w-full bg-white border border-brand-primary/5 rounded-[1.5rem] px-8 py-6 focus:ring-2 focus:ring-brand-primary/10 focus:outline-none placeholder:text-brand-primary/20 text-brand-primary transition-all font-medium"
                    />
                    <input
                      required defaultValue={user?.phone} name="phone" type="tel" placeholder="Phone Number"
                      className="w-full bg-white border border-brand-primary/5 rounded-[1.5rem] px-8 py-6 focus:ring-2 focus:ring-brand-primary/10 focus:outline-none placeholder:text-brand-primary/20 text-brand-primary transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Destination */}
              <div className="space-y-8">
                <h3 className="uppercase tracking-[0.3em] text-[10px] font-black border-l-2 border-brand-primary pl-6 py-1 text-brand-primary/40">
                  2. Destination
                </h3>
                <div className="space-y-4">
                  <input
                    required name="street" type="text" placeholder="Street Address"
                    className="w-full bg-white border border-brand-primary/5 rounded-[1.5rem] px-8 py-6 focus:ring-2 focus:ring-brand-primary/10 focus:outline-none placeholder:text-brand-primary/20 text-brand-primary transition-all font-medium"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-brand-primary/5 border border-brand-primary/5 rounded-[1.5rem] px-8 py-5 md:py-6 flex items-center font-black uppercase tracking-widest text-[9px] md:text-[10px] text-brand-primary">
                      Miami, FL
                    </div>
                    <input
                      required defaultValue={user?.zip} name="zip" type="text" placeholder="Zip Code"
                      className="w-full bg-white border border-brand-primary/5 rounded-[1.5rem] px-8 py-5 md:py-6 focus:ring-2 focus:ring-brand-primary/10 focus:outline-none placeholder:text-brand-primary/20 text-brand-primary transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Delivery Instructions */}
              <div className="space-y-8">
                <h3 className="uppercase tracking-[0.3em] text-[10px] font-black border-l-2 border-brand-primary pl-6 py-1 text-brand-primary/40">
                  3. Delivery Instructions
                </h3>
                <div className="relative group">
                  <select
                    required name="notes" defaultValue=""
                    className="w-full bg-white border border-brand-primary/10 rounded-[1.5rem] px-8 py-6 focus:ring-4 focus:ring-brand-primary/5 focus:outline-none appearance-none text-brand-primary transition-all font-medium cursor-pointer hover:border-brand-primary/30 shadow-sm hover:shadow-md"
                  >
                    <option value="" disabled>Choose an option</option>
                    <option value="There is a secure drop off location (e.g. locker, mail room, reception)">
                      There is a secure drop off location
                    </option>
                    <option value="Delivery person is given access to the office">
                      Delivery person is given access to the office
                    </option>
                    <option value="Others">Others</option>
                  </select>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-brand-primary/40">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 4. Gratitude (Tip) */}
              <div className="space-y-8">
                <h3 className="uppercase tracking-[0.3em] text-[10px] font-black border-l-2 border-brand-primary pl-6 py-1 text-brand-primary/40">
                  4. Gratitude
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {TIP_OPTIONS.map((rate) => (
                    <button
                      key={rate} type="button" onClick={() => setTipRate(rate)}
                      className={clsx(
                        'py-6 rounded-[1.5rem] border font-black text-[10px] uppercase tracking-[0.3em] transition-all',
                        tipRate === rate
                          ? 'bg-brand-primary text-white border-brand-primary shadow-xl shadow-brand-primary/20 scale-[1.02]'
                          : 'bg-white text-brand-primary/40 border-brand-primary/5 hover:border-brand-primary/20 hover:text-brand-primary shadow-sm hover:shadow-md'
                      )}
                    >
                      {rate * 100}%
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Promo Code */}
              <div className="space-y-6">
                <h3 className="uppercase tracking-[0.3em] text-[10px] font-black border-l-2 border-brand-primary pl-6 py-1 text-brand-primary/40">
                  5. Promo Code
                </h3>

                {coupon ? (
                  /* Applied coupon badge */
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-green-50 border border-green-200 rounded-[1.5rem] px-8 py-5"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-green-600 shrink-0" />
                      <div>
                        <span className="text-green-700 font-black uppercase tracking-widest text-[11px]">
                          {coupon.code}
                        </span>
                        <p className="text-green-600 text-[10px] mt-0.5">
                          {coupon.discountType === 'percent'
                            ? `${coupon.discountValue}% off`
                            : `$${coupon.discountValue.toFixed(2)} off`}
                          {coupon.isFree && ' — Order is FREE!'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button" onClick={handleRemoveCoupon}
                      className="text-green-400 hover:text-green-700 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </motion.div>
                ) : (
                  /* Coupon input */
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Tag size={15} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary/30" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                        placeholder="PROMO CODE"
                        className="w-full bg-white border border-brand-primary/5 rounded-[1.5rem] pl-12 pr-6 py-5 focus:ring-2 focus:ring-brand-primary/10 focus:outline-none placeholder:text-brand-primary/20 text-brand-primary transition-all font-black uppercase tracking-widest text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-8 py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 whitespace-nowrap"
                    >
                      {couponLoading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                )}

                {couponError && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-red-500 text-[11px] font-medium"
                  >
                    <AlertCircle size={14} />
                    {couponError}
                  </motion.div>
                )}
              </div>

              {/* 6. Payment — shown only when total > $0 */}
              <AnimatePresence>
                {!isFree && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="uppercase tracking-[0.3em] text-[10px] font-black border-l-2 border-brand-primary pl-6 py-1 text-brand-primary/40">
                      6. Payment
                    </h3>
                    <div className="bg-white border border-brand-primary/5 rounded-[1.5rem] px-8 py-7 shadow-sm">
                      <CardElement options={CARD_ELEMENT_OPTIONS} />
                    </div>
                    <p className="text-[10px] text-brand-primary/30 font-medium italic flex items-center gap-2">
                      <Lock size={11} />
                      Payments are encrypted and processed securely by Stripe. We never store your card details.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Free order confirmation */}
              <AnimatePresence>
                {isFree && (
                  <motion.div
                    key="free"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6 bg-green-50 border border-green-200 rounded-[1.5rem] text-center"
                  >
                    <p className="text-green-700 font-black uppercase tracking-widest text-[11px]">
                      Your order is completely free!
                    </p>
                    <p className="text-green-600 text-[11px] mt-1">
                      No payment required — click below to confirm your order.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* ── Right column: order summary ───────────────────────────────── */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white border border-brand-primary/5 rounded-3xl md:rounded-[3.5rem] p-8 md:p-12 lg:sticky lg:top-32 space-y-6 md:space-y-12 shadow-2xl shadow-brand-primary/5">
              <h3 className="uppercase tracking-[0.4em] text-[9px] md:text-[10px] font-black border-b border-brand-primary/5 pb-4 md:pb-8 text-brand-primary/40 text-center">
                Your Selection
              </h3>

              {/* Items */}
              <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {cart.items.map((item: any) => (
                  <div
                    key={`${item.id}-${item.serviceDate}-${JSON.stringify(item.customizations || {})}`}
                    className="flex justify-between items-start gap-6 group"
                  >
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-black text-brand-primary group-hover:italic transition-all">{item.name}</p>
                      <p className="text-[10px] text-brand-primary/30 uppercase tracking-[0.2em] font-black">Qty: {item.quantity}</p>
                      {item.customizations && (
                        <div className="text-[10px] text-brand-primary/60 leading-relaxed italic p-4 bg-brand-subtle/30 rounded-[1.5rem] border border-brand-primary/5 space-y-1">
                          {item.customizations.base   && <div>Base: {item.customizations.base}</div>}
                          {item.customizations.sauce  && <div>Sauce: {item.customizations.sauce}</div>}
                          {item.customizations.isVegetarian && <div className="text-green-600 font-bold">Vegetarian: Yes</div>}
                          {item.customizations.avoid  && <div className="not-italic text-red-500 font-black uppercase text-[8px] tracking-widest">Exclude: {item.customizations.avoid}</div>}
                        </div>
                      )}
                    </div>
                    <span className="text-lg font-serif text-brand-primary">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-4 pt-10 border-t border-brand-primary/5">
                <div className="flex justify-between text-brand-primary/40 text-[10px] font-black uppercase tracking-[0.3em]">
                  <span>Subtotal</span>
                  <span className="text-brand-primary">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-primary/40 text-[10px] font-black uppercase tracking-[0.3em]">
                  <span>Service Tax</span>
                  <span className="text-brand-primary">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-primary/40 text-[10px] font-black uppercase tracking-[0.3em]">
                  <span>Gratitude</span>
                  <span className="text-brand-primary">${tip.toFixed(2)}</span>
                </div>

                {/* Discount line — animated in/out */}
                <AnimatePresence>
                  {coupon && discountAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex justify-between text-green-600 text-[10px] font-black uppercase tracking-[0.3em]"
                    >
                      <span>Discount ({coupon.code})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Final total */}
                <div className={clsx(
                  'flex justify-between text-3xl md:text-5xl font-serif pt-6 md:pt-10 border-t border-brand-primary/5 tracking-tighter transition-colors duration-300',
                  isFree ? 'text-green-600' : 'text-brand-primary'
                )}>
                  <span>Total</span>
                  <span>{isFree ? 'FREE' : `$${finalTotal.toFixed(2)}`}</span>
                </div>
              </div>

              {/* Delivery info */}
              <div className="p-6 bg-brand-primary/5 rounded-[2rem] flex items-start gap-4 text-[11px] text-brand-primary/40 leading-relaxed italic border border-brand-primary/10">
                <Info size={18} className="shrink-0 text-brand-primary" />
                Scheduled for artisanal preparation on {date}. Delivery optimized for peak temperature.
              </div>

              {/* Submit button */}
              <button
                form="order-form"
                type="submit"
                disabled={loading || (!stripe && !isFree)}
                className={clsx(
                  'w-full py-8 text-white rounded-[1.5rem] flex items-center justify-center gap-4 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 group active:scale-[0.98]',
                  isFree
                    ? 'bg-green-600 shadow-[0_20px_50px_rgba(22,163,74,0.3)]'
                    : 'bg-brand-primary shadow-[0_20px_50px_rgba(43,28,112,0.3)]'
                )}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <span className="uppercase tracking-[0.4em] text-[10px] font-black">
                      {isFree ? 'Confirm Free Order' : 'Authorize Payment'}
                    </span>
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

// ─── Outer wrapper that provides the Stripe context ───────────────────────────

export default function Checkout({ cart }: { cart: any }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm cart={cart} />
    </Elements>
  );
}
