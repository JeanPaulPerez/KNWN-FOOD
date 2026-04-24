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
  Loader2, AlertCircle, Check, Lock, Calendar, ChevronDown, CreditCard
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { getActiveOrderInfo } from '../utils/dateLogic';
import { clsx } from 'clsx';
import { useUser } from '../store/useUser';

function getFoodBg(name: string): string {
  const key = name.toLowerCase().trim();
  const FOOD_BG_MAP: Record<string, string> = {
    'mediterranean chicken': '/assets/food-bg/mediterranean-chicken.webp',
    'bibi bamp rice':        '/assets/food-bg/bibi-bamp-rice.webp',
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

const DELIVERY_ZIPS = new Set(['33130','33131','33132','33133','33134','33126','33137','33127','33128']);

type StoredCheckoutAddress = {
  formatted: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type SavedCard = { id: string; brand: string; last4: string; expMonth: number; expYear: number; };

function brandLabel(brand: string) {
  const map: Record<string, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex', discover: 'Discover', jcb: 'JCB', unionpay: 'UnionPay', diners: 'Diners' };
  return map[brand] || brand.charAt(0).toUpperCase() + brand.slice(1);
}

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
  marketingOptIn?: boolean;
  repeatOrder?: boolean;
  stripeCustomerId?: string | null;
};

// ─── CheckoutForm ─────────────────────────────────────────────────────────────
function CheckoutForm({ cart }: { cart: any }) {
  const navigate   = useNavigate();
  const { user }   = useUser();
  const stripe     = useStripe();
  const elements   = useElements();

  const [deliveryAddress, setDeliveryAddress] = useState<StoredCheckoutAddress | null>(() => readStoredCheckoutAddress());
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState<StoredCheckoutAddress>({ formatted: '', street: '', city: '', state: '', zip: '', country: 'US' });
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [loadingCards, setLoadingCards] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState('');
  const [tipRate, setTipRate]   = useState<number | 'none' | 'custom'>(0.08);
  const [customTipInput, setCustomTipInput] = useState('');
  const [customTipFixed, setCustomTipFixed] = useState(0);
  const [repeatOrder, setRepeatOrder] = useState(false);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
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

  // Pre-fill delivery address from user profile if sessionStorage is empty
  useEffect(() => {
    if (!deliveryAddress && user && (user.street || user.zip)) {
      const addr: StoredCheckoutAddress = {
        street: user.street || '',
        city:   user.city  || '',
        state:  user.state || '',
        zip:    user.zip   || '',
        country: 'US',
        formatted: [user.street, user.city, user.state, user.zip].filter(Boolean).join(', '),
      };
      setDeliveryAddress(addr);
    }
  }, [user]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch saved Stripe cards for logged-in user
  useEffect(() => {
    if (!user?.email) return;
    setLoadingCards(true);
    fetch(`/api/payment-methods?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => { setSavedCards(data.paymentMethods || []); })
      .catch(() => {})
      .finally(() => setLoadingCards(false));
  }, [user?.email]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal       = cart.total;
  const discountAmount = coupon
    ? coupon.discountType === 'percent'
      ? (subtotal * coupon.discountValue) / 100
      : Math.min(coupon.discountValue, subtotal)
    : 0;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const tax           = afterDiscount * TAX_RATE;
  const tipAmount     = tipRate === 'none' ? 0 : tipRate === 'custom' ? customTipFixed : subtotal * (tipRate as number);
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
  const deliveryAddressRef  = useRef(deliveryAddress);
  const repeatOrderRef      = useRef(repeatOrder);
  const stripeCustomerIdRef = useRef(stripeCustomerId);
  const marketingOptInRef   = useRef(marketingOptIn);
  finalTotalRef.current      = finalTotal;
  isFreeRef.current          = isFree;
  subtotalRef.current        = subtotal;
  discountAmountRef.current  = discountAmount;
  taxRef.current             = tax;
  tipAmountRef.current       = tipAmount;
  couponRef.current          = coupon;
  userRef.current            = user;
  deliveryAddressRef.current  = deliveryAddress;
  repeatOrderRef.current      = repeatOrder;
  stripeCustomerIdRef.current = stripeCustomerId;
  marketingOptInRef.current   = marketingOptIn;

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
        marketingOptIn:    params.marketingOptIn ?? false,
        repeatOrder:       params.repeatOrder ?? false,
        stripeCustomerId:  params.stripeCustomerId ?? null,
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
    const serviceDays = [...new Set(itemsSnap.map((i: any) => i.serviceDate as string))].filter(Boolean);

    if (repeatOrderRef.current) {
      try {
        localStorage.setItem('knwn_repeat_order', JSON.stringify({ savedAt: Date.now(), items: itemsSnap }));
      } catch {}
    } else {
      try { localStorage.removeItem('knwn_repeat_order'); } catch {}
    }

    cart.clearCart();
    navigate('/thank-you', {
      state: {
        orders:  data.orders,
        payload: { ...params, serviceDays, serviceDay: serviceDays[0] ?? '', items: itemsSnap, total },
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
          marketingOptIn:  marketingOptInRef.current,
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

    if (!deliveryInstructions) {
      setError('Please select a delivery instruction.');
      setLoading(false);
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 10) {
      setError('Please enter a valid 10-digit US phone number.');
      setLoading(false);
      return;
    }

    if (!DELIVERY_ZIPS.has(zip.trim())) {
      setError(`We only deliver to select Miami, FL zip codes: 33126, 33127, 33128, 33130, 33131, 33132, 33133, 33134, 33137. Please update your ZIP code.`);
      setLoading(false);
      return;
    }

    try {
      let paymentIntentId: string | null = null;

      if (!isFree) {
        if (!stripe) throw new Error('Payment system not loaded.');

        // Create PaymentIntent server-side
        const piRes = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amountInCents: Math.round(finalTotal * 100), customerEmail: email, repeatOrder: repeatOrderRef.current }),
        });
        if (!piRes.ok) throw new Error((await piRes.json()).error);
        const { clientSecret, stripeCustomerId: newCustId } = await piRes.json();
        if (newCustId) setStripeCustomerId(newCustId);

        if (selectedCardId) {
          // Saved card flow
          const { error: confirmErr, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: selectedCardId,
          });
          if (confirmErr) throw new Error(confirmErr.message);
          paymentIntentId = paymentIntent?.id || null;
        } else {
          // New card / PaymentElement flow
          if (!elements) throw new Error('Payment system not loaded.');
          const { error: submitErr } = await elements.submit();
          if (submitErr) throw new Error(submitErr.message);

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
      }

      await completeOrderRef.current({
        name, email, phone, street, address2, city, state, zip,
        deliveryInstructions, paymentIntentId, paymentProvider: 'stripe',
        marketingOptIn, repeatOrder: repeatOrderRef.current, stripeCustomerId: stripeCustomerIdRef.current,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) return null;


  return (
    <div className="bg-[#F5F3FF] min-h-screen pt-8 md:pt-10 pb-20 md:pb-32 px-4 md:px-12 font-sans select-none">
      <div className="max-w-6xl mx-auto">
        <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* ── LEFT COLUMN ───────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">

            {/* Express Checkout */}
            <div className="text-center mb-8">
              <span className="text-brand-primary font-bold text-sm block mb-4">Express Payment</span>
              <div className="w-full">

                {/* Apple Pay / Google Pay */}
                <div className="w-full min-h-[52px]">
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

              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-brand-primary/5">
              <h2 className="text-2xl font-bold text-brand-primary mb-6">Contact</h2>
              <div className="space-y-4">
                <input required type="email" name="email" defaultValue={user?.email} placeholder="Email" className="w-full border border-brand-primary/20 rounded-xl px-5 py-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all text-brand-primary font-medium" />
                <div className="flex items-center border border-brand-primary/20 rounded-xl focus-within:ring-2 focus-within:ring-brand-primary focus-within:border-brand-primary transition-all overflow-hidden">
                  <span className="flex items-center gap-1.5 px-4 py-4 bg-brand-primary/5 border-r border-brand-primary/20 text-brand-primary font-semibold text-sm shrink-0 select-none">🇺🇸 +1</span>
                  <input required type="tel" name="phone" defaultValue={user?.phone} placeholder="(305) 555-0123" inputMode="numeric" pattern="[0-9\s\-\(\)\.]{10,}" maxLength={14} className="flex-1 px-4 py-4 text-brand-primary font-medium bg-transparent outline-none" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={e => setMarketingOptIn(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-brand-primary/20 accent-brand-primary cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-brand-primary/80 select-none">Send me updates and offers by email and SMS</span>
                </label>
              </div>
            </div>

            {/* Delivering To */}
            <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-brand-primary/5 flex flex-col items-start gap-3">
              <h2 className="text-2xl font-bold text-brand-primary">Delivering to your office</h2>
              {!editingAddress ? (
                <>
                  <p className="text-brand-primary/60 font-medium text-base tracking-tight">
                    {deliveryAddress?.formatted || 'Add your delivery address below.'}
                  </p>
                  <button
                    type="button"
                    className="text-brand-orange text-sm font-bold hover:underline underline-offset-4"
                    onClick={() => {
                      setAddressDraft(deliveryAddress ?? { formatted: '', street: '', city: '', state: '', zip: '', country: 'US' });
                      setEditingAddress(true);
                    }}
                  >
                    Edit delivery preferences
                  </button>
                </>
              ) : (
                <div className="w-full space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      placeholder="Street address"
                      value={addressDraft.street}
                      onChange={e => setAddressDraft(d => ({ ...d, street: e.target.value }))}
                      className="w-full border border-brand-primary/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all text-brand-primary font-medium text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="City"
                        value={addressDraft.city}
                        onChange={e => setAddressDraft(d => ({ ...d, city: e.target.value }))}
                        className="w-full border border-brand-primary/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all text-brand-primary font-medium text-sm"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={addressDraft.state}
                        onChange={e => setAddressDraft(d => ({ ...d, state: e.target.value }))}
                        className="w-full border border-brand-primary/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all text-brand-primary font-medium text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="ZIP code"
                        value={addressDraft.zip}
                        onChange={e => setAddressDraft(d => ({ ...d, zip: e.target.value }))}
                        className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary transition-all text-brand-primary font-medium text-sm ${addressDraft.zip && !DELIVERY_ZIPS.has(addressDraft.zip.trim()) ? 'border-red-400 focus:border-red-400' : 'border-brand-primary/20 focus:border-brand-primary'}`}
                      />
                      {addressDraft.zip && !DELIVERY_ZIPS.has(addressDraft.zip.trim()) && (
                        <p className="mt-1.5 text-xs text-red-500 font-semibold flex items-center gap-1">
                          <AlertCircle size={12} /> We don't deliver to this ZIP code yet.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      disabled={!!addressDraft.zip && !DELIVERY_ZIPS.has(addressDraft.zip.trim())}
                      className="bg-brand-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => {
                        const formatted = [addressDraft.street, addressDraft.city, addressDraft.state, addressDraft.zip].filter(Boolean).join(', ');
                        const updated = { ...addressDraft, formatted };
                        window.sessionStorage.setItem(CHECKOUT_ADDRESS_STORAGE_KEY, JSON.stringify(updated));
                        setDeliveryAddress(updated);
                        setEditingAddress(false);
                      }}
                    >
                      Save address
                    </button>
                    <button
                      type="button"
                      className="text-brand-primary/50 text-sm font-bold px-4 py-2.5 rounded-xl hover:text-brand-primary transition-colors"
                      onClick={() => setEditingAddress(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div id="payment-element-wrap" className="bg-white border-2 border-brand-primary/10 rounded-[1.5rem] overflow-hidden shadow-sm">
              <h2 className="text-2xl font-bold text-brand-primary p-8 pb-4">Payment Method</h2>

              {!isFree ? (
                <div className="px-8 pb-8 space-y-5">
                  {/* Saved cards */}
                  {loadingCards && (
                    <div className="flex items-center gap-2 text-brand-primary/50 text-sm"><Loader2 size={14} className="animate-spin" /> Loading saved cards…</div>
                  )}
                  {savedCards.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-brand-primary/60 uppercase tracking-wider">Saved cards</p>
                      {savedCards.map(card => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => setSelectedCardId(selectedCardId === card.id ? null : card.id)}
                          className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${selectedCardId === card.id ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-brand-primary/15 text-brand-primary/70 hover:border-brand-primary/30'}`}
                        >
                          <CreditCard size={18} className="shrink-0 opacity-60" />
                          <span className="flex-1 text-left">{brandLabel(card.brand)} •••• {card.last4}</span>
                          <span className="text-xs text-brand-primary/50 font-medium">{card.expMonth.toString().padStart(2,'0')}/{card.expYear}</span>
                          {selectedCardId === card.id && <Check size={16} className="text-brand-primary shrink-0" />}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSelectedCardId(null)}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${!selectedCardId ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-brand-primary/15 text-brand-primary/70 hover:border-brand-primary/30'}`}
                      >
                        <CreditCard size={18} className="shrink-0 opacity-60" />
                        <span className="flex-1 text-left">Use a new card</span>
                        {!selectedCardId && <Check size={16} className="text-brand-primary shrink-0" />}
                      </button>
                    </div>
                  )}
                  {/* PaymentElement: only show when no saved card is selected */}
                  {!selectedCardId && (
                    <PaymentElement
                      options={{
                        layout:   { type: 'accordion', defaultCollapsed: false, radios: true, spacedAccordionItems: false },
                        wallets:  { applePay: 'never', googlePay: 'never' },
                      }}
                    />
                  )}
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
                <input required name="street" type="text" defaultValue={deliveryAddress?.street || user?.street || ''} className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 font-medium text-brand-primary focus:border-brand-primary outline-none" />
                <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">Address</label>
              </div>

              <div className="relative">
                <input name="address2" type="text" placeholder="Apt, suite, etc. (optional)" className="w-full border border-brand-primary/20 rounded-xl px-4 py-4 font-medium text-brand-primary focus:border-brand-primary outline-none placeholder:text-brand-primary/40" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <input required name="city" type="text" defaultValue={deliveryAddress?.city || user?.city || ''} className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 font-medium text-brand-primary focus:border-brand-primary outline-none" />
                  <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">City</label>
                </div>
                <div className="relative col-span-1">
                  <select name="state" className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 appearance-none font-medium text-brand-primary focus:border-brand-primary outline-none">
                    <option>{deliveryAddress?.state || user?.state || 'Florida'}</option>
                  </select>
                  <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">State</label>
                </div>
                <div className="relative">
                  <input required name="zip" type="text" defaultValue={deliveryAddress?.zip || user?.zip || ''} className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 font-medium text-brand-primary focus:border-brand-primary outline-none" />
                  <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase">ZIP Code</label>
                </div>
              </div>

              <div className="relative">
                <select
                  name="deliveryInstructions"
                  required
                  defaultValue=""
                  className="w-full border border-brand-primary/20 rounded-xl px-4 pt-6 pb-2 appearance-none font-medium text-brand-primary focus:border-brand-primary outline-none cursor-pointer bg-white"
                >
                  <option value="" disabled>Select an option</option>
                  <option value="There is a secure drop off location">There is a secure drop off location</option>
                  <option value="Delivery person is given access to the office">Delivery person is given access to the office</option>
                  <option value="I must be called to reception to receive in person">I must be called to reception to receive in person</option>
                </select>
                <label className="absolute left-4 top-2 text-[10px] text-brand-primary/60 font-bold uppercase pointer-events-none">
                  Delivery instructions (Default window: {DELIVERY_TIME_WINDOW})
                </label>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary/40 pointer-events-none" size={18} />
              </div>
            </div>

          </div>

          {/* ── MOBILE ONLY: Order Summary top (items + repeat) ─────────────── */}
          <div className="lg:hidden order-1 bg-white rounded-[2rem] p-8 shadow-sm border border-brand-primary/5">
            <h2 className="text-2xl font-bold text-brand-primary leading-tight mb-6">Order Summary</h2>
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
                  {items.map((item: any) => {
                    const c = item.customizations || {};
                    const choices: string[] = [];
                    if (c.base)    choices.push(c.base);
                    if (c.protein) choices.push(c.protein);
                    if (c.sauce)   choices.push(c.sauce);
                    if (c.swap)    choices.push(`Swap: ${c.swap}`);
                    return (
                      <div key={`m-${item.id}-${item.serviceDate}-${JSON.stringify(c)}`} className="flex gap-4 bg-brand-bg p-4 rounded-3xl border border-gray-100">
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
                                {c.isVegetarian && <span className="text-[9px] font-black tracking-wide bg-[#DCFCE7] text-[#16A34A] px-2.5 py-1 rounded-full">🌿 Vegetarian</span>}
                                {choices.map((ch, ci) => <span key={ci} className="text-[9px] font-semibold bg-brand-subtle text-brand-accent px-2.5 py-1 rounded-full">{ch}</span>)}
                              </div>
                            )}
                            {c.avoid && <p className="text-[9px] text-brand-primary/40 leading-tight"><span className="text-red-400 font-black">✕ </span>{c.avoid}</p>}
                            {c.vegInstructions && <p className="text-[9px] text-brand-primary/40 italic leading-tight">{c.vegInstructions}</p>}
                          </div>
                          <div className="flex items-center justify-between mt-3.5">
                            <div className="flex items-center bg-white rounded-full border border-gray-100 p-1">
                              <button type="button" onClick={() => cart.updateQuantity(item.id, item.serviceDate, -1, c)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand-bg transition-colors text-brand-primary text-sm font-bold">−</button>
                              <span className="px-3 text-[13px] text-brand-primary font-black">{item.quantity}</span>
                              <button type="button" onClick={() => cart.updateQuantity(item.id, item.serviceDate, 1, c)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand-bg transition-colors text-brand-primary text-sm font-bold">+</button>
                            </div>
                            <button type="button" onClick={() => cart.removeItem(item.id, item.serviceDate, c)} className="text-[10px] uppercase tracking-[0.15em] text-brand-primary/25 hover:text-red-400 transition-colors font-black">Remove</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-8 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-5 flex items-start gap-4">
              <button type="button" onClick={() => setRepeatOrder(!repeatOrder)} className={clsx('w-6 h-6 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-all shadow-sm', repeatOrder ? 'bg-brand-primary' : 'bg-white border border-brand-primary/20')}>
                {repeatOrder && <Check size={14} className="text-white" strokeWidth={3} />}
              </button>
              <div className="cursor-pointer" onClick={() => setRepeatOrder(!repeatOrder)}>
                <p className="font-bold text-brand-primary leading-tight text-sm">Repeat this order next week?</p>
                <p className="text-xs text-brand-primary/60 font-medium leading-snug mt-1">Edit or pause until 10 PM the day before delivery.</p>
              </div>
            </div>
          </div>

          {/* ── MOBILE ONLY: Totals + CTA (bottom) ───────────────────────────── */}
          <div className="lg:hidden order-3 bg-white rounded-[2rem] p-5 md:p-8 shadow-sm border border-brand-primary/5">
            <div className="flex gap-2">
              <input type="text" placeholder="Promo Code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} className="min-w-0 flex-1 border border-brand-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-brand-primary focus:border-brand-primary outline-none placeholder:text-brand-primary/40" />
              <button type="button" onClick={handleApplyCoupon} className="whitespace-nowrap bg-brand-primary text-white rounded-xl px-6 font-bold text-sm tracking-wider hover:brightness-110">Apply</button>
            </div>
            {coupon && <div className="mt-2 text-[10px] text-green-600 font-bold uppercase bg-green-50 px-3 py-1.5 rounded-md inline-block">Code applied: {coupon.code} (-${discountAmount.toFixed(2)})</div>}
            {couponError && <div className="mt-2 text-[10px] text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-md inline-block">{couponError}</div>}
            <div className="mt-6 border border-brand-primary/10 bg-[#FAFAFC] rounded-2xl p-6">
              <h4 className="font-bold text-brand-primary text-sm mb-1">Add a Tip</h4>
              <p className="text-xs text-brand-primary/60 mb-4 flex gap-2 items-center">
                <span className="w-3 h-3 rounded bg-[#00A9E0] text-white flex items-center justify-center"><Check size={8} strokeWidth={4} /></span>
                Show your support for the KNWN Delivery Team
              </p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[0.08, 0.10, 0.12, 'none'].map((val) => {
                  const isActive = tipRate === val;
                  const amount = typeof val === 'number' ? (subtotal * val).toFixed(2) : null;
                  return (
                    <button key={String(val)} type="button" onClick={() => setTipRate(val as number | 'none')} className={clsx('py-3 flex flex-col items-center justify-center rounded-xl border font-bold transition-all shadow-sm bg-white', isActive ? 'border-[#00D632] shadow-[#00D632]/20 shadow-md ring-1 ring-[#00D632]' : 'border-gray-200 text-brand-primary/60 hover:border-gray-300')}>
                      <span className={clsx('text-sm', isActive && 'text-brand-primary')}>{val === 'none' ? 'None' : `${(val as number) * 100}%`}</span>
                      {amount && <span className={clsx('text-[10px] opacity-60', isActive && 'text-brand-primary font-medium')}>${amount}</span>}
                    </button>
                  );
                })}
              </div>
              <div className="flex border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                <span className="px-3 py-3 text-xs text-brand-primary/50 font-bold self-center">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  placeholder="Custom tip"
                  value={customTipInput}
                  onChange={e => setCustomTipInput(e.target.value)}
                  className="flex-1 py-3 text-xs font-semibold text-brand-primary outline-none bg-transparent placeholder:text-brand-primary/30 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="flex items-center border-r border-gray-200 px-2 gap-1">
                  <button type="button" onClick={() => { const v = Math.max(0, parseFloat(customTipInput || '0') - 0.5); setCustomTipInput(v.toFixed(2)); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-brand-primary font-bold text-lg leading-none">−</button>
                  <button type="button" onClick={() => { const v = parseFloat(customTipInput || '0') + 0.5; setCustomTipInput(v.toFixed(2)); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-brand-primary font-bold text-lg leading-none">+</button>
                </div>
                <button
                  type="button"
                  onClick={() => { const v = parseFloat(customTipInput); if (!isNaN(v) && v > 0) { setCustomTipFixed(v); setTipRate('custom'); } }}
                  className="px-4 py-3 text-[11px] font-bold text-brand-primary bg-gray-50 uppercase hover:bg-gray-100 transition-colors"
                >
                  Add tip
                </button>
              </div>
              <p className="text-[10px] text-brand-primary/60 font-medium italic mt-4 text-center">Thank you.</p>
            </div>
            <div className="mt-8 space-y-4 font-semibold text-sm">
              <h3 className="text-2xl font-bold text-brand-primary mb-6">Order Total</h3>
              <div className="flex justify-between text-brand-primary/70"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-brand-primary/70"><span>Discounts</span><span>-${discountAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-brand-primary/70"><span>Delivery</span><span className="uppercase text-brand-primary">FREE</span></div>
              <div className="flex justify-between text-brand-primary/70"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
              {tipAmount > 0 && (
                <div className="flex justify-between text-brand-primary/70 pb-4 border-b border-brand-primary/10"><span>Tip</span><span>${tipAmount.toFixed(2)}</span></div>
              )}
              {tipAmount === 0 && (
                <div className="flex justify-between text-brand-primary/70 pb-4 border-b border-brand-primary/10"><span>Tip</span><span>—</span></div>
              )}
              <div className="flex justify-between text-xl font-black text-brand-primary pt-2"><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>
            </div>
            {error && <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg border border-red-200 flex gap-2 items-center mt-4"><AlertCircle size={14} />{error}</div>}
            <div className="mt-8 flex flex-col gap-3">
              <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white py-5 rounded-xl font-bold text-lg flex justify-center items-center gap-3 hover:brightness-110 shadow-[0_15px_30px_rgba(23,11,85,0.2)] transition-all active:scale-95 disabled:opacity-50">
                {loading ? <Loader2 size={24} className="animate-spin" /> : <><Lock size={16} className="opacity-60" /> Place Order <span className="text-[#D4E84F] text-2xl font-light transform translate-y-[-2px]">⟶</span></>}
              </button>
              <button type="button" onClick={() => navigate('/account')} className="w-full bg-white border border-brand-primary/10 text-brand-primary py-4 rounded-xl font-bold text-sm tracking-wider flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                My Account
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: ORDER SUMMARY (desktop only) ───────────────────── */}
          <div className="hidden lg:block lg:col-span-5 lg:order-2 relative mt-4">
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
                  Show your support for the KNWN Delivery Team
                </p>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[0.08, 0.10, 0.12, 'none'].map((val) => {
                    const isActive = tipRate === val;
                    const amount   = typeof val === 'number' ? (subtotal * val).toFixed(2) : null;
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
                  <span className="px-3 py-3 text-xs text-brand-primary/50 font-bold self-center">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.50"
                    placeholder="Custom tip"
                    value={customTipInput}
                    onChange={e => setCustomTipInput(e.target.value)}
                    className="flex-1 py-3 text-xs font-semibold text-brand-primary outline-none bg-transparent placeholder:text-brand-primary/30 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="flex items-center border-r border-gray-200 px-2 gap-1">
                    <button type="button" onClick={() => { const v = Math.max(0, parseFloat(customTipInput || '0') - 0.5); setCustomTipInput(v.toFixed(2)); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-brand-primary font-bold text-lg leading-none">−</button>
                    <button type="button" onClick={() => { const v = parseFloat(customTipInput || '0') + 0.5; setCustomTipInput(v.toFixed(2)); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-brand-primary font-bold text-lg leading-none">+</button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { const v = parseFloat(customTipInput); if (!isNaN(v) && v > 0) { setCustomTipFixed(v); setTipRate('custom'); } }}
                    className="px-4 py-3 text-[11px] font-bold text-brand-primary bg-gray-50 uppercase hover:bg-gray-100 transition-colors"
                  >
                    Add tip
                  </button>
                </div>
                <p className="text-[10px] text-brand-primary/60 font-medium italic mt-4 text-center">Thank you.</p>
              </div>

              {/* Order Total */}
              <div className="mt-8 space-y-4 font-semibold text-sm">
                <h3 className="text-2xl font-bold text-brand-primary mb-6">Order Total</h3>
                <div className="flex justify-between text-brand-primary/70"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-brand-primary/70"><span>Discounts</span><span>-${discountAmount.toFixed(2)}</span></div>
                <div className="flex justify-between text-brand-primary/70"><span>Delivery</span><span className="uppercase text-brand-primary">FREE</span></div>
                <div className="flex justify-between text-brand-primary/70"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                {tipAmount > 0 && (
                  <div className="flex justify-between text-brand-primary/70 pb-4 border-b border-brand-primary/10"><span>Tip</span><span>${tipAmount.toFixed(2)}</span></div>
                )}
                {tipAmount === 0 && (
                  <div className="flex justify-between text-brand-primary/70 pb-4 border-b border-brand-primary/10"><span>Tip</span><span>—</span></div>
                )}
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
                  type="button" onClick={() => navigate('/account')}
                  className="w-full bg-white border border-brand-primary/10 text-brand-primary py-4 rounded-xl font-bold text-sm tracking-wider flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  My Account
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

  return (
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
  );
}
