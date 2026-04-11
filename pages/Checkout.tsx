/**
 * pages/Checkout.tsx
 *
 * Express payments:
 *   - Apple Pay / Google Pay  → Stripe PaymentRequestButtonElement
 *   - Link                    → Stripe PaymentElement (Link auto-detected by email)
 *   - PayPal                  → @paypal/react-paypal-js PayPalButtons
 *
 * Standard payment:
 *   - Card + Link             → Stripe PaymentElement (deferred intent flow)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Loader2, AlertCircle, Check, Lock, Calendar
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { getActiveOrderInfo } from '../utils/dateLogic';
import { clsx } from 'clsx';
import { useUser } from '../store/useUser';

function getFoodBg(name: string): string {
  const key = name.toLowerCase().trim();
  const FOOD_BG_MAP: Record<string, string> = {
    'mediterranean chicken': '/assets/food-bg/mediterranean-chicken.webp',
    'bibi bump rice':        '/assets/food-bg/bibi-bamp-rice.webp',
    'carne asada':           '/assets/food-bg/carne-asada.webp',
    'chicken lime':          '/assets/food-bg/chicken-lime.webp',
    'chicken pesto pasta':   '/assets/food-bg/pesto-pasta.webp',
    'thai beef salad':       '/assets/food-bg/thai-beef-salad.webp',
    'milanesa':              '/assets/food-bg/milanesa.webp',
    'harissa meatballs':     '/assets/food-bg/harissa-meatballs.webp',
    'crispy korean chicken': '/assets/food-bg/korean-crispy-chicken.webp',
    'chicken caesar salad':  '/assets/food-bg/chicken-cesar-salad.webp',
  };
  const match = Object.entries(FOOD_BG_MAP).find(([k]) => key.includes(k) || k.includes(key));
  return match ? match[1] : '/assets/food-bg/carne-asada.webp';
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

const TAX_RATE = 0.063;
const CHECKOUT_ADDRESS_STORAGE_KEY = 'knwn:selected-address';
const DELIVERY_TIME_WINDOW = '10 AM - 12 PM';

type StoredCheckoutAddress = {
  formatted: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

function readStoredCheckoutAddress(): StoredCheckoutAddress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_ADDRESS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const STRIPE_APPEARANCE = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary:     '#2B1C70',
    colorBackground:  '#ffffff',
    colorText:        '#1E0B6E',
    colorDanger:      '#ef4444',
    fontFamily:       'Poppins, sans-serif',
    borderRadius:     '12px',
    spacingUnit:      '4px',
  },
  rules: {
    '.Input': { border: '1px solid rgba(43,28,112,0.20)', padding: '14px 16px' },
    '.Input:focus': { borderColor: '#2B1C70', boxShadow: '0 0 0 2px rgba(43,28,112,0.12)' },
    '.Label': { color: 'rgba(30,11,110,0.60)', fontWeight: '700', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' },
  },
};

// ─── Complete-order params type ───────────────────────────────────────────────
type CompleteOrderParams = {
  name: string;
  email: string;
  phone: string;
  street: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  deliveryInstructions?: string;
  paymentIntentId: string | null;
  paymentProvider?: string;
};

// ─── CheckoutForm ─────────────────────────────────────────────────────────────
function CheckoutForm({ cart }: { cart: any }) {
  const navigate   = useNavigate();
  const { user }   = useUser();
  const stripe     = useStripe();
  const elements   = useElements();

  const [deliveryAddress] = useState<StoredCheckoutAddress | null>(() => readStoredCheckoutAddress());
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState('');
  const [tipRate, setTipRate]   = useState<number | 'none'>('none');
  const [repeatOrder, setRepeatOrder] = useState(true);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);

  // Coupon state
  const [couponInput,   setCouponInput]   = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError,   setCouponError]   = useState('');
  const [coupon, setCoupon] = useState<{
    code: string; discountType: string; discountValue: number; isFree: boolean;
  } | null>(null);

  useEffect(() => {
    if (cart.items.length === 0) navigate('/order');
  }, [cart.items.length, navigate]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal       = cart.total;
  const discountAmount = coupon
    ? coupon.discountType === 'percent'
      ? (subtotal * coupon.discountValue) / 100
      : Math.min(coupon.discountValue, subtotal)
    : 0;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const tax           = afterDiscount * TAX_RATE;
  const tipAmount     = tipRate === 'none' ? 0 : afterDiscount * (tipRate as number);
  const finalTotal    = afterDiscount + tax + tipAmount;
  const isFree        = finalTotal === 0 && !!coupon?.isFree;

  // Refs to avoid stale closures in async event handlers
  const finalTotalRef      = useRef(finalTotal);
  const isFreeRef          = useRef(isFree);
  const subtotalRef        = useRef(subtotal);
  const discountAmountRef  = useRef(discountAmount);
  const taxRef             = useRef(tax);
  const tipAmountRef       = useRef(tipAmount);
  const couponRef          = useRef(coupon);
  const userRef            = useRef(user);
  const deliveryAddressRef = useRef(deliveryAddress);
  finalTotalRef.current     = finalTotal;
  isFreeRef.current         = isFree;
  subtotalRef.current       = subtotal;
  discountAmountRef.current = discountAmount;
  taxRef.current            = tax;
  tipAmountRef.current      = tipAmount;
  couponRef.current         = coupon;
  userRef.current           = user;
  deliveryAddressRef.current = deliveryAddress;

  // ── Keep PaymentElement amount in sync with tip / coupon changes ──────────
  useEffect(() => {
    if (!elements || finalTotal <= 0) return;
    elements.update({ amount: Math.round(finalTotal * 100) });
  }, [elements, finalTotal]);

  // ── Keep PaymentRequest amount in sync ────────────────────────────────────
  useEffect(() => {
    if (!paymentRequest || finalTotal <= 0) return;
    paymentRequest.update({
      total: { label: 'KNWN Food Order', amount: Math.round(finalTotal * 100) },
    });
  }, [paymentRequest, finalTotal]);

  // ── Shared: finish order via /api/complete-order ─────────────────────────
  const completeOrder = useCallback(async (params: CompleteOrderParams) => {
    const total       = finalTotalRef.current;
    const itemsSnap   = [...cart.items];
    const orderRes    = await fetch('/api/complete-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: itemsSnap,
        customerInfo: {
          name:                 params.name,
          email:                params.email,
          phone:                params.phone,
          street:               params.street,
          address2:             params.address2 || '',
          city:                 params.city,
          state:                params.state,
          zip:                  params.zip,
          notes:                params.deliveryInstructions || 'N/A',
          deliveryInstructions: params.deliveryInstructions || '',
          deliveryTimeWindow:   DELIVERY_TIME_WINDOW,
          wcCustomerId:         userRef.current?.wcCustomerId,
        },
        couponCode:        couponRef.current?.code,
        paymentIntentId:   params.paymentIntentId,
        paymentProvider:   params.paymentProvider || 'stripe',
        isFree:            isFreeRef.current,
        total,
        pricing: {
          subtotal: subtotalRef.current,
          discount: discountAmountRef.current,
          tax:      taxRef.current,
          tip:      tipAmountRef.current,
          total,
        },
      }),
    });
    if (!orderRes.ok) throw new Error((await orderRes.json()).error);
    const data       = await orderRes.json();
    const serviceDay = itemsSnap[0]?.serviceDate ?? '';
    cart.clearCart();
    navigate('/thank-you', {
      state: {
        orders:  data.orders,
        payload: { ...params, serviceDay, items: itemsSnap, total },
      },
    });
  }, [cart, navigate]);

  const completeOrderRef = useRef(completeOrder);
  completeOrderRef.current = completeOrder;

  // ── Apple Pay / Google Pay — PaymentRequest setup ────────────────────────
  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country:          'US',
      currency:         'usd',
      total:            { label: 'KNWN Food Order', amount: Math.max(1, Math.round((finalTotalRef.current || 0) * 100)) },
      requestPayerName:  true,
      requestPayerEmail: true,
      requestPayerPhone: true,
    });

    const onPaymentMethod = async (ev: any) => {
      const total = finalTotalRef.current;
      setLoading(true); setError('');
      try {
        const piRes = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amountInCents: Math.round(total * 100), customerEmail: ev.payerEmail }),
        });
        if (!piRes.ok) throw new Error((await piRes.json()).error || 'Payment init failed');
        const { clientSecret } = await piRes.json();

        // Confirm without handling browser redirects (wallet payments are immediate)
        const { error: confirmErr, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false },
        );
        if (confirmErr) { ev.complete('fail'); throw new Error(confirmErr.message); }

        // Handle 3DS if required
        if (paymentIntent?.status === 'requires_action') {
          const { error: actionErr } = await stripe.confirmCardPayment(clientSecret);
          if (actionErr) { ev.complete('fail'); throw new Error(actionErr.message); }
        }

        ev.complete('success');
        const addr = deliveryAddressRef.current;
        await completeOrderRef.current({
          name:            ev.payerName  || '',
          email:           ev.payerEmail || '',
          phone:           ev.payerPhone || '',
          street:          addr?.street  || '',
          city:            addr?.city    || '',
          state:           addr?.state   || '',
          zip:             addr?.zip     || '',
          paymentIntentId: paymentIntent?.id || null,
          paymentProvider: 'stripe',
        });
      } catch (err: any) {
        setError(err.message || 'Express payment failed');
      } finally {
        setLoading(false);
      }
    };

    pr.on('paymentmethod', onPaymentMethod);
    pr.canMakePayment().then(result => { if (result) setPaymentRequest(pr); });
    return () => { pr.off('paymentmethod', onPaymentMethod); };
  }, [stripe]); // runs only when stripe loads

  // ── PayPal — create order ────────────────────────────────────────────────
  const handlePayPalCreateOrder = useCallback(async () => {
    const res = await fetch('/api/paypal-create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountInCents: Math.round(finalTotalRef.current * 100) }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'PayPal order creation failed');
    const data = await res.json();
    return data.id as string;
  }, []);

  // ── PayPal — on approve ──────────────────────────────────────────────────
  const handlePayPalApprove = useCallback(async (data: { orderID: string }) => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/paypal-capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderID: data.orderID }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'PayPal capture failed');
      const capture = await res.json();
      const addr    = deliveryAddressRef.current;
      await completeOrderRef.current({
        name:            capture.payer?.name  || '',
        email:           capture.payer?.email || '',
        phone:           capture.payer?.phone || '',
        street:          addr?.street || '',
        city:            addr?.city   || '',
        state:           addr?.state  || '',
        zip:             addr?.zip    || '',
        paymentIntentId: capture.transactionId || null,
        paymentProvider: 'paypal',
      });
    } catch (err: any) {
      setError(err.message || 'PayPal payment failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Coupon ────────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true); setCouponError(''); setCoupon(null);
    try {
      const res  = await fetch('/api/validate-coupon', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponInput.trim() }),
      });
      const data = await res.json();
      if (data.valid) { setCoupon(data); } else { setCouponError(data.error); }
    } catch { setCouponError('Error validating coupon. Try again.'); }
    finally { setCouponLoading(false); setCouponInput(''); }
  };

  // ── Form submit (Card / Link payments) ───────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError('');
    const form  = new FormData(e.currentTarget);
    const name  = `${form.get('firstName')} ${form.get('lastName')}`.trim();
    const email = form.get('email') as string;
    const phone = form.get('phone') as string;
    const street = form.get('street') as string;
    const address2 = form.get('address2') as string;
    const city  = form.get('city') as string;
    const state = form.get('state') as string;
    const zip   = form.get('zip') as string;
    const deliveryInstructions = (form.get('deliveryInstructions') as string) || '';

    try {
      let paymentIntentId: string | null = null;

      if (!isFree) {
        if (!stripe || !elements) throw new Error('Payment system not loaded.');

        // 1. Validate the PaymentElement (required for deferred intent)
        const { error: submitErr } = await elements.submit();
        if (submitErr) throw new Error(submitErr.message);

        // 2. Create PaymentIntent server-side
        const piRes = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amountInCents: Math.round(finalTotal * 100), customerEmail: email }),
        });
        if (!piRes.ok) throw new Error((await piRes.json()).error);
        const { clientSecret } = await piRes.json();

        // 3. Confirm — redirect: 'if_required' keeps Apple/Google Pay inline
        const { error: confirmErr, paymentIntent } = await stripe.confirmPayment({
          elements,
          clientSecret,
          redirect: 'if_required',
          confirmParams: {
            return_url: window.location.href,
            payment_method_data: {
              billing_details: {
                name, email, phone,
                address: { line1: street, line2: address2, city, state, postal_code: zip, country: 'US' },
              },
            },
          },
        });
        if (confirmErr) throw new Error(confirmErr.message);
        paymentIntentId = paymentIntent?.id || null;
      }

      await completeOrderRef.current({
        name, email, phone, street, address2, city, state, zip,
        deliveryInstructions, paymentIntentId, paymentProvider: 'stripe',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) return null;

  const hasPayPalClientId = !!import.meta.env.VITE_PAYPAL_CLIENT_ID;

  return (
    <div className="bg-[#F5F3FF] min-h-screen pt-8 md:pt-10 pb-20 md:pb-32 px-4 md:px-12 font-sans select-none">
      <div className="max-w-6xl mx-auto">
        <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* ── LEFT COLUMN ───────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-8">

            {/* Express Checkout */}
            <div className="text-center mb-8">
              <span className="text-brand-primary font-bold text-sm block mb-4">Express Payment</span>
              <div className="flex items-stretch gap-3 w-full">

                {/* Apple Pay / Google Pay */}
                <div className="flex-1 min-h-[52px]">
                  {paymentRequest ? (
                    <PaymentRequestButtonElement
                      options={{
                        paymentRequest,
                        style: {
                          paymentRequestButton: { theme: 'dark', height: '52px', type: 'default' },
                        },
                      }}
                    />
                  ) : (
                    <div className="w-full h-[52px] bg-black/5 text-brand-primary/30 rounded-[0.5rem] flex flex-col items-center justify-center gap-0.5 border border-black/5">
                      <span className="text-[11px] font-bold">Apple / Google Pay</span>
                      <span className="text-[9px] font-medium">Not available on this device</span>
                    </div>
                  )}
                </div>

                {/* Stripe Link — integrated in PaymentElement below */}
                <button
                  type="button"
                  className="flex-1 bg-[#00D632] text-[#00691B] rounded-[0.5rem] py-3.5 flex justify-center items-center hover:brightness-110 shadow-sm transition-all font-bold text-lg"
                  onClick={() => document.getElementById('payment-element-wrap')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <span className="bg-white/90 px-3 py-0.5 rounded-full inline-flex items-center">
                    <span className="leading-none transform -translate-y-px">link</span>
                  </span>
                </button>

                {/* PayPal */}
                <div className="flex-1 min-h-[52px]">
                  {hasPayPalClientId ? (
                    <PayPalButtons
                      style={{ layout: 'horizontal', color: 'gold', shape: 'rect', height: 52, tagline: false }}
                      fundingSource="paypal"
                      createOrder={handlePayPalCreateOrder}
                      onApprove={handlePayPalApprove as any}
                      onError={(err: any) => setError('PayPal error: ' + String(err))}
                      disabled={loading}
                    />
                  ) : (
                    <div className="w-full h-[52px] bg-[#FFC439]/30 text-[#003087]/30 rounded-[0.5rem] flex items-center justify-center font-black text-lg italic border border-[#FFC439]/20">
                      PayPal
                    </div>
                  )}
                </div>

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

            {/* Delivering To */}
            <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-brand-primary/5 flex flex-col items-start gap-1">
              <h2 className="text-2xl font-bold text-brand-primary">Delivering to your office</h2>
              <p className="text-brand-primary/60 font-medium text-base mb-1 tracking-tight">
                {deliveryAddress?.formatted || 'Add your delivery address from the menu page to prefill checkout.'}
              </p>
              <button type="button" className="text-brand-orange text-sm font-bold hover:underline underline-offset-4">Edit delivery preferences</button>
            </div>

            {/* Payment Method */}
            <div id="payment-element-wrap" className="bg-white border-2 border-brand-primary/10 rounded-[1.5rem] overflow-hidden shadow-sm">
              <h2 className="text-2xl font-bold text-brand-primary p-8 pb-4">Payment Method</h2>

              {!isFree ? (
                <div className="px-8 pb-8 space-y-5">
                  <PaymentElement
                    options={{
                      layout:   { type: 'accordion', defaultCollapsed: false, radios: true, spacedAccordionItems: false },
                      wallets:  { applePay: 'never', googlePay: 'never' }, // wallets are in express section above
                    }}
                  />
                </div>
              ) : (
                <div className="px-8 pb-8">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm font-bold flex items-center gap-2">
                    <Check size={16} /> 100% discount applied — no payment required
                  </div>
                </div>
              )}
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-brand-primary/5 space-y-4">
              <h2 className="text-xl font-bold text-brand-primary mb-4">Billing Address</h2>

              <div className="relative">
                <select className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 appearance-none font-medium text-brand-primary focus:border-brand-primary outline-none cursor-pointer">
                  <option>United States</option>
                </select>
                <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">Country / Region</label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input required name="firstName" type="text" defaultValue={user?.name?.split(' ')[0] || ''} className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 font-medium text-brand-primary focus:border-brand-primary outline-none" />
                  <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">First Name</label>
                </div>
                <div className="relative">
                  <input required name="lastName" type="text" defaultValue={user?.name?.split(' ').slice(1).join(' ') || ''} className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 font-medium text-brand-primary focus:border-brand-primary outline-none" />
                  <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">Last Name</label>
                </div>
              </div>

              <div className="relative">
                <input required name="street" type="text" defaultValue={deliveryAddress?.street || '6778 West Flagler Street'} className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 font-medium text-brand-primary focus:border-brand-primary outline-none" />
                <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">Address</label>
              </div>

              <div className="relative">
                <input name="address2" type="text" placeholder="Apt, suite, etc. (optional)" className="w-full border border-brand-primary/20 rounded-xl px-4 py-4 font-medium text-brand-primary focus:border-brand-primary outline-none placeholder:text-brand-primary/40" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <input required name="city" type="text" defaultValue={deliveryAddress?.city || 'Miami'} className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 font-medium text-brand-primary focus:border-brand-primary outline-none" />
                  <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">City</label>
                </div>
                <div className="relative col-span-1">
                  <select name="state" className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 appearance-none font-medium text-brand-primary focus:border-brand-primary outline-none">
                    <option>{deliveryAddress?.state || 'Florida'}</option>
                  </select>
                  <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">State</label>
                </div>
                <div className="relative">
                  <input required name="zip" type="text" defaultValue={deliveryAddress?.zip || '33144'} className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 font-medium text-brand-primary focus:border-brand-primary outline-none" />
                  <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">ZIP Code</label>
                </div>
              </div>

              <div className="relative">
                <textarea
                  name="deliveryInstructions"
                  rows={3}
                  placeholder={`Delivery instructions (optional). Default window: ${DELIVERY_TIME_WINDOW}`}
                  className="w-full border border-brand-primary/20 rounded-xl px-4 py-4 font-medium text-brand-primary focus:border-brand-primary outline-none placeholder:text-brand-primary/40 resize-none"
                />
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: ORDER SUMMARY ───────────────────────────────── */}
          <div className="lg:col-span-5 relative mt-4 md:mt-0">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-brand-primary/5 sticky top-32">
              <h2 className="text-2xl md:text-[1.7rem] font-bold text-brand-primary leading-tight mb-6">Order Summary</h2>

              {/* Items grouped by service date */}
              <div className="space-y-6">
                {Object.entries(
                  cart.items.reduce((acc: any, it: any) => {
                    const ds = it.serviceDate.split(',')[0];
                    if (!acc[ds]) acc[ds] = [];
                    acc[ds].push(it);
                    return acc;
                  }, {})
                ).map(([day, items]: any, i) => (
                  <div key={i} className="space-y-4">
                    <h4 className="text-sm font-bold text-brand-primary">{day}</h4>
                    {items.map((item: any, idx: number) => {
                      const c = item.customizations || {};
                      const choices: string[] = [];
                      if (c.base)    choices.push(c.base);
                      if (c.protein) choices.push(c.protein);
                      if (c.sauce)   choices.push(c.sauce);
                      if (c.swap)    choices.push(`Swap: ${c.swap}`);

                      return (
                  <div key={`${item.id}-${item.serviceDate}-${JSON.stringify(c)}`} className="flex gap-4 bg-brand-bg p-4 rounded-3xl border border-gray-100">
                    <img src={getFoodBg(item.name)} className="w-20 h-20 object-cover rounded-2xl flex-shrink-0" alt={item.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-[18px] font-semibold leading-tight text-brand-primary truncate">{item.name}</h3>
                        <span className="text-[15px] font-serif text-brand-primary flex-shrink-0">${(item.price * item.quantity).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-brand-primary/40">
                        <Calendar size={11} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.serviceDate.split(',')[0]}</span>
                      </div>

                      <div className="mt-1.5 space-y-1">
                        {(c.isVegetarian || choices.length > 0) && (
                          <div className="flex flex-wrap items-center gap-1">
                            {c.isVegetarian && (
                              <span className="text-[9px] font-black tracking-wide bg-[#DCFCE7] text-[#16A34A] px-2.5 py-1 rounded-full">🌿 Vegetarian</span>
                            )}
                            {choices.map((ch, i) => (
                              <span key={i} className="text-[9px] font-semibold bg-brand-subtle text-brand-accent px-2.5 py-1 rounded-full">{ch}</span>
                            ))}
                          </div>
                        )}
                        {c.avoid && (
                          <p className="text-[9px] text-brand-primary/40 leading-tight"><span className="text-red-400 font-black">✕ </span>{c.avoid}</p>
                        )}
                        {c.vegInstructions && (
                          <p className="text-[9px] text-brand-primary/40 italic leading-tight">{c.vegInstructions}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3.5">
                        <div className="flex items-center bg-white rounded-full border border-gray-100 p-1">
                          <button type="button" onClick={() => cart.updateQuantity(item.id, item.serviceDate, -1, c)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand-bg transition-colors text-brand-primary text-sm font-bold">−</button>
                          <span className="px-3 text-[13px] text-brand-primary font-black">{item.quantity}</span>
                          <button type="button" onClick={() => cart.updateQuantity(item.id, item.serviceDate, 1, c)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand-bg transition-colors text-brand-primary text-sm font-bold">+</button>
                        </div>
                        <button
                          type="button"
                          onClick={() => cart.removeItem(item.id, item.serviceDate, c)}
                          className="text-[10px] uppercase tracking-[0.15em] text-brand-primary/25 hover:text-red-400 transition-colors font-black"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Repeat Order */}
              <div className="mt-8 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-5 flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => setRepeatOrder(!repeatOrder)}
                  className={clsx('w-6 h-6 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-all shadow-sm', repeatOrder ? 'bg-brand-primary' : 'bg-white border border-brand-primary/20')}
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
              {couponError && (
                <div className="mt-2 text-[10px] text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-md inline-block">
                  {couponError}
                </div>
              )}

              {/* Tips */}
              <div className="mt-6 border border-brand-primary/10 bg-[#FAFAFC] rounded-2xl p-6">
                <h4 className="font-bold text-brand-primary text-sm mb-1">Add a Tip</h4>
                <p className="text-xs text-brand-primary/60 mb-4 flex gap-2 items-center">
                  <div className="w-3 h-3 rounded bg-[#00A9E0] text-white flex items-center justify-center"><Check size={8} strokeWidth={4} /></div>
                  Show your support for the KNWN team
                </p>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[0.10, 0.15, 0.20, 'none'].map((val) => {
                    const isActive = tipRate === val;
                    const amount   = typeof val === 'number' ? (afterDiscount * val).toFixed(2) : null;
                    return (
                      <button
                        key={String(val)} type="button" onClick={() => setTipRate(val as number | 'none')}
                        className={clsx(
                          'py-3 flex flex-col items-center justify-center rounded-xl border font-bold transition-all shadow-sm bg-white',
                          isActive ? 'border-[#00D632] shadow-[#00D632]/20 shadow-md ring-1 ring-[#00D632]' : 'border-gray-200 text-brand-primary/60 hover:border-gray-300',
                        )}
                      >
                        <span className={clsx('text-sm', isActive && 'text-brand-primary')}>{val === 'none' ? 'None' : `${(val as number) * 100}%`}</span>
                        {amount && <span className={clsx('text-[10px] opacity-60', isActive && 'text-brand-primary font-medium')}>${amount}</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="flex border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                  <div className="px-4 py-3 text-xs text-brand-primary/40 font-semibold flex-1">Custom tip</div>
                  <div className="flex items-center gap-1 border-r border-gray-200 px-3 opacity-30"><span className="px-1 text-lg">−</span><span className="px-1 text-lg">+</span></div>
                  <button type="button" className="px-4 py-3 text-[11px] font-bold text-brand-primary/50 bg-gray-50 uppercase hover:bg-gray-100 transition-colors">Add tip</button>
                </div>
                <p className="text-[10px] text-brand-primary/60 font-medium italic mt-4 text-center">Thank you.</p>
              </div>

              {/* Order Total */}
              <div className="mt-8 space-y-4 font-semibold text-sm">
                <h3 className="text-2xl font-bold text-brand-primary mb-6">Order Total</h3>
                <div className="flex justify-between text-brand-primary/70"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-brand-primary/70"><span>Discounts</span><span>-${discountAmount.toFixed(2)}</span></div>
                <div className="flex justify-between text-brand-primary/70"><span>Shipping</span><span className="uppercase text-brand-primary">FREE</span></div>
                <div className="flex justify-between text-brand-primary/70 pb-4 border-b border-brand-primary/10"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-xl font-black text-brand-primary pt-2"><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg border border-red-200 flex gap-2 items-center mt-4">
                  <AlertCircle size={14} />{error}
                </div>
              )}

              {/* CTA */}
              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-brand-primary text-white py-5 rounded-xl font-bold text-lg flex justify-center items-center gap-3 hover:brightness-110 shadow-[0_15px_30px_rgba(23,11,85,0.2)] transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading
                    ? <Loader2 size={24} className="animate-spin" />
                    : <><Lock size={16} className="opacity-60" /> Place Order <span className="text-[#D4E84F] text-2xl font-light transform translate-y-[-2px]">⟶</span></>
                  }
                </button>
                <button
                  type="button" onClick={() => navigate('/order')}
                  className="w-full bg-white border border-brand-primary/10 text-brand-primary py-4 rounded-xl font-bold text-sm tracking-wider flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
                >
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

// ─── Checkout wrapper ─────────────────────────────────────────────────────────
export default function Checkout({ cart }: { cart: any }) {
  // Compute an approximate initial amount for Elements (subtotal + tax, no tip yet)
  const initialAmountCents = Math.max(100, Math.round(cart.total * (1 + TAX_RATE) * 100));

  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId || 'test',
        currency: 'USD',
        intent:   'capture',
        ...(paypalClientId ? {} : { 'data-sdk-integration-source': 'integrationbuilder_sc' }),
      }}
      deferLoading={!paypalClientId}
    >
      <Elements
        stripe={stripePromise}
        options={{
          mode:       'payment',
          amount:     initialAmountCents,
          currency:   'usd',
          appearance: STRIPE_APPEARANCE,
        }}
      >
        <CheckoutForm cart={cart} />
      </Elements>
    </PayPalScriptProvider>
  );
}
