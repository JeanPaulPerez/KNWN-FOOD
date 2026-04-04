import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, LogOut, MapPin, Package2, CreditCard, UserCircle2, LayoutDashboard, Trash2, Plus, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useUser } from '../store/useUser';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

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

type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

function brandLabel(brand: string) {
  const map: Record<string, string> = {
    visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex',
    discover: 'Discover', jcb: 'JCB', unionpay: 'UnionPay',
    diners: 'Diners',
  };
  return map[brand] || brand.charAt(0).toUpperCase() + brand.slice(1);
}

function AddCardForm({ email, name, onSuccess, onCancel }: {
  email: string; name: string;
  onSuccess: () => void; onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    try {
      const siRes = await fetch('/api/setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const siData = await siRes.json();
      if (!siRes.ok) throw new Error(siData.error || 'Failed to initialize card setup');

      const cardEl = elements.getElement(CardElement);
      if (!cardEl) throw new Error('Card element not found');

      const { error: stripeError } = await stripe.confirmCardSetup(siData.clientSecret, {
        payment_method: { card: cardEl, billing_details: { email, name } },
      });

      if (stripeError) throw new Error(stripeError.message);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-[#D8D0EC] p-4 space-y-3">
      <div className="rounded-xl bg-brand-bg border border-[#D8D0EC] px-4 py-3">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      {error && <p className="text-[12px] text-red-500 font-medium">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !stripe}
          className="flex-1 py-3 rounded-xl bg-brand-lime text-brand-primary text-[11px] font-black uppercase tracking-[0.2em] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : 'Save card'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 rounded-xl bg-brand-primary/5 text-brand-primary/50 hover:bg-brand-primary/10 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </form>
  );
}

function PaymentMethodsPanel({ email, name }: { email: string; name: string }) {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/payment-methods?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load cards');
      setCards(data.paymentMethods || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove card');
      }
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <div>
        {loading && (
          <div className="flex items-center gap-2 text-brand-primary/40 text-sm py-4">
            <Loader2 size={15} className="animate-spin" /> Loading cards...
          </div>
        )}
        {!loading && error && (
          <p className="text-[13px] text-red-500 py-2">{error}</p>
        )}
        {!loading && !error && cards.length === 0 && !showAddForm && (
          <p className="text-[14px] text-[#2B1C70]/50 py-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            No saved cards yet.
          </p>
        )}
        {!loading && cards.map((card) => (
          <div
            key={card.id}
            className="flex items-center justify-between py-3 border-b border-[#D8D0EC]/50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded-md bg-brand-primary/8 flex items-center justify-center">
                <CreditCard size={14} className="text-brand-primary/60" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-brand-primary" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {brandLabel(card.brand)} •••• {card.last4}
                </p>
                <p className="text-[11px] text-brand-primary/40" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Expires {String(card.expMonth).padStart(2, '0')}/{card.expYear}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(card.id)}
              disabled={deletingId === card.id}
              className="p-2 rounded-xl hover:bg-red-50 text-brand-primary/30 hover:text-red-400 transition-colors disabled:opacity-40"
            >
              {deletingId === card.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
        ))}

        {!loading && showAddForm && (
          <AddCardForm
            email={email}
            name={name}
            onSuccess={() => { setShowAddForm(false); fetchCards(); }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {!loading && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 flex items-center gap-2 py-3 px-4 rounded-xl border border-dashed border-brand-primary/25 text-brand-primary/50 hover:border-brand-primary/50 hover:text-brand-primary/70 transition-colors text-[12px] font-semibold"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <Plus size={14} />
            Add a new card
          </button>
        )}
      </div>
    </Elements>
  );
}

type AccountTab = 'dashboard' | 'orders' | 'addresses' | 'payments' | 'details';

type DashboardOrder = {
  id: number;
  number: string;
  status: string;
  statusLabel: string;
  total: string;
  currencySymbol: string;
  orderDate: string;
  serviceDate: string;
  deliveryWindow: string;
  paymentIntentId?: string;
  canCancel: boolean;
  refundId?: string;
  cancelledAt?: string;
  items: Array<{
    name: string;
    quantity: number;
    total: string;
  }>;
};

async function parseApiResponse<T = any>(response: Response): Promise<T> {
  const raw = await response.text();

  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    const sanitized = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    throw new Error(sanitized || 'Server returned an invalid response');
  }
}

const TAB_ITEMS: Array<{ id: AccountTab; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'orders', label: 'Orders' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'payments', label: 'Payment methods' },
  { id: 'details', label: 'Account Details' },
];

function getStatusStyles(statusLabel: string) {
  if (statusLabel === 'Completed') return 'bg-[#DCFCE7] text-[#166534]';
  if (statusLabel === 'On the Way') return 'bg-[#DBEAFE] text-[#1D4ED8]';
  if (statusLabel === 'Cancelled' || statusLabel === 'Refunded') return 'bg-[#F3F4F6] text-[#4B5563]';
  return 'bg-[#FEF3C7] text-[#92400E]';
}

export default function Account() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isHydrating, logout, updateUser } = useUser();
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [cancelingOrderId, setCancelingOrderId] = useState<number | null>(null);
  const [accountMessage, setAccountMessage] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  const activeTab = (searchParams.get('tab') as AccountTab) || 'dashboard';

  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.street || '',
    city: user?.city || '',
    zip: user?.zip || '',
  });

  useEffect(() => {
    setAccountForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: user?.street || '',
      city: user?.city || '',
      zip: user?.zip || '',
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoadingOrders(true);
    setOrdersError('');

    const params = new URLSearchParams({ email: user.email });
    if (user.wcCustomerId) {
      params.set('wcCustomerId', String(user.wcCustomerId));
    }

    fetch(`/api/account-orders?${params.toString()}`, { credentials: 'include' })
      .then(async (res) => {
        const data = await parseApiResponse<{ orders?: DashboardOrder[]; error?: string }>(res);
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load orders');
        }
        if (!cancelled) {
          setOrders(data.orders || []);
        }
      })
      .catch((error: any) => {
        if (!cancelled) {
          setOrdersError(error.message || 'Failed to load orders');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingOrders(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const orderedTabs = useMemo(() => TAB_ITEMS, []);

  const handleSelectTab = (tab: AccountTab) => {
    setSearchParams({ tab });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleCancelOrder = async (orderId: number) => {
    setCancelingOrderId(orderId);
    setOrdersError('');

    try {
      const res = await fetch('/api/cancel-order', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          email: user?.email,
          wcCustomerId: user?.wcCustomerId ?? null,
        }),
      });
      const data = await parseApiResponse<{ error?: string; status?: string; refundId?: string; cancelledAt?: string }>(res);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: data.status || 'refunded',
                statusLabel: data.status === 'cancelled' ? 'Cancelled' : 'Refunded',
                canCancel: false,
                refundId: data.refundId || order.refundId,
                cancelledAt: data.cancelledAt || new Date().toISOString(),
              }
            : order
        )
      );
    } catch (error: any) {
      setOrdersError(error.message || 'Failed to cancel order');
    } finally {
      setCancelingOrderId(null);
    }
  };

  const handleSaveAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingAccount(true);
    setAccountMessage('');

    try {
      const res = await fetch('/api/save-customer', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...accountForm, wcCustomerId: user?.wcCustomerId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save account details');
      }

      updateUser(data);
      setAccountMessage('Account details updated.');
    } catch (error: any) {
      setAccountMessage(error.message || 'Failed to save account details');
    } finally {
      setSavingAccount(false);
    }
  };

  if (isHydrating) {
    return (
      <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#2B1C70]" size={28} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center px-6">
        <div className="max-w-xl w-full rounded-[32px] border border-[#D8D0EC] bg-white p-10 text-center shadow-[0_18px_45px_rgba(43,28,112,0.08)]">
          <h1 className="text-[40px] leading-none text-[#2B1C70]" style={{ fontFamily: '"Instrument Serif", serif' }}>
            My Account
          </h1>
          <p className="mt-4 text-[15px] text-[#2B1C70]/65" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Sign in or create an account from the user icon to access your order dashboard.
          </p>
          <button
            type="button"
            onClick={() => navigate('/order')}
            className="mt-8 rounded-full bg-[#2B1C70] px-7 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white"
          >
            Back to menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] px-4 pb-20 pt-28 md:px-8 md:pt-36">
      <div className="mx-auto max-w-[1100px]">
        <h1
          className="text-[#2B1C70] leading-[0.92]"
          style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(50px, 6vw, 74px)' }}
        >
          My Account
        </h1>

        <div className="mt-10 flex flex-wrap items-center gap-3 border-b border-[#D8D0EC] pb-6">
          {orderedTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectTab(tab.id)}
              className={`rounded-full px-5 py-3 text-[13px] font-semibold transition-colors ${
                activeTab === tab.id ? 'bg-[#2B1C70] text-white' : 'text-[#2B1C70]/72 hover:bg-white'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto inline-flex items-center gap-2 text-[13px] font-semibold text-[#2B1C70]/72"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-[28px] border border-[#D8D0EC] bg-white p-6 shadow-[0_18px_45px_rgba(43,28,112,0.05)]">
              <div className="mb-4 flex items-center gap-3">
                <LayoutDashboard size={18} className="text-[#2B1C70]" />
                <h2 className="text-[22px] font-semibold text-[#2B1C70]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Overview
                </h2>
              </div>
              <p className="text-[13px] uppercase tracking-[0.16em] text-[#2B1C70]/45">Orders placed</p>
              <p className="mt-3 text-[42px] font-semibold text-[#2B1C70]">{orders.length}</p>
            </div>

            <div className="rounded-[28px] border border-[#D8D0EC] bg-white p-6 shadow-[0_18px_45px_rgba(43,28,112,0.05)]">
              <p className="text-[13px] uppercase tracking-[0.16em] text-[#2B1C70]/45">Next delivery</p>
              <p className="mt-3 text-[24px] font-semibold text-[#2B1C70]">
                {orders.find((order) => ['pending', 'processing', 'on-hold', 'out-for-delivery'].includes(order.status))?.serviceDate || 'No active orders'}
              </p>
            </div>

            <div className="rounded-[28px] border border-[#D8D0EC] bg-white p-6 shadow-[0_18px_45px_rgba(43,28,112,0.05)]">
              <p className="text-[13px] uppercase tracking-[0.16em] text-[#2B1C70]/45">Account email</p>
              <p className="mt-3 text-[24px] font-semibold text-[#2B1C70] break-all">{user.email}</p>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="mt-8 rounded-[28px] border border-[#D8D0EC] bg-white p-6 shadow-[0_18px_45px_rgba(43,28,112,0.05)]">
            <div className="mb-5 flex items-center gap-3">
              <Package2 size={18} className="text-[#2B1C70]" />
              <h2 className="text-[24px] font-semibold text-[#2B1C70]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Orders
              </h2>
            </div>

            {loadingOrders && (
              <div className="flex items-center gap-3 py-10 text-[#2B1C70]/60">
                <Loader2 size={18} className="animate-spin" />
                <span style={{ fontFamily: 'Poppins, sans-serif' }}>Loading your orders...</span>
              </div>
            )}

            {!loadingOrders && ordersError && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {ordersError}
              </div>
            )}

            {!loadingOrders && !ordersError && orders.length === 0 && (
              <p className="py-10 text-[14px] text-[#2B1C70]/60" style={{ fontFamily: 'Poppins, sans-serif' }}>
                No orders found for this account yet.
              </p>
            )}

            {!loadingOrders && orders.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <thead>
                    <tr className="border-b border-[#E6DFF3] text-[12px] uppercase tracking-[0.15em] text-[#2B1C70]/45">
                      <th className="pb-3 pr-6">Order</th>
                      <th className="pb-3 pr-6">Placed</th>
                      <th className="pb-3 pr-6">Service Date</th>
                      <th className="pb-3 pr-6">Status</th>
                      <th className="pb-3 pr-6">Total</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <React.Fragment key={order.id}>
                        <tr className="border-b border-[#F0EBF8] text-[14px] text-[#2B1C70]">
                          <td className="py-4 pr-6 font-semibold">#{order.number}</td>
                          <td className="py-4 pr-6">{order.orderDate}</td>
                          <td className="py-4 pr-6">
                            <div>{order.serviceDate || 'N/A'}</div>
                            <div className="text-[12px] text-[#2B1C70]/45">{order.deliveryWindow}</div>
                          </td>
                          <td className="py-4 pr-6">
                            <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${getStatusStyles(order.statusLabel)}`}>
                              {order.statusLabel}
                            </span>
                          </td>
                          <td className="py-4 pr-6">{order.currencySymbol}{order.total}</td>
                          <td className="py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveOrderId((current) => (current === order.id ? null : order.id))}
                                className="rounded-full bg-[#2B1C70] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white"
                              >
                                {activeOrderId === order.id ? 'Hide' : 'View'}
                              </button>
                              {order.canCancel && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelOrder(order.id)}
                                  disabled={cancelingOrderId === order.id}
                                  className="rounded-full border border-[#DB5A29] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#DB5A29] disabled:opacity-50"
                                >
                                  {cancelingOrderId === order.id ? 'Cancelling...' : 'Cancel'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {activeOrderId === order.id && (
                          <tr className="border-b border-[#F0EBF8] bg-[#FBFAFE]">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="space-y-3 text-[13px] text-[#2B1C70]/80" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {order.refundId && <p><strong>Refund:</strong> {order.refundId}</p>}
                                {order.cancelledAt && <p><strong>Cancelled:</strong> {new Date(order.cancelledAt).toLocaleString()}</p>}
                                <div className="space-y-2">
                                  {order.items.map((item, index) => (
                                    <div key={`${order.id}-${index}`} className="flex items-center justify-between rounded-2xl border border-[#E6DFF3] bg-white px-4 py-3">
                                      <span>{item.quantity} × {item.name}</span>
                                      <span>{order.currencySymbol}{item.total}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {['Billing address', 'Shipping address'].map((title) => (
              <div key={title} className="rounded-[28px] border border-[#D8D0EC] bg-white p-6 shadow-[0_18px_45px_rgba(43,28,112,0.05)]">
                <div className="mb-5 flex items-center gap-3">
                  <MapPin size={18} className="text-[#2B1C70]" />
                  <h2 className="text-[24px] font-semibold text-[#2B1C70]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {title}
                  </h2>
                </div>
                <div className="space-y-1 text-[15px] text-[#2B1C70]/82" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <p>{user.name || 'No name saved'}</p>
                  <p>{user.street || 'No street saved'}</p>
                  <p>{user.city || 'No city saved'}{user.zip ? `, FL ${user.zip}` : ''}</p>
                  <p>{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="mt-8 rounded-[28px] border border-[#D8D0EC] bg-white p-6 shadow-[0_18px_45px_rgba(43,28,112,0.05)]">
            <div className="mb-5 flex items-center gap-3">
              <CreditCard size={18} className="text-[#2B1C70]" />
              <h2 className="text-[24px] font-semibold text-[#2B1C70]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Payment methods
              </h2>
            </div>
            {user && (
              <PaymentMethodsPanel email={user.email} name={user.name || ''} />
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <form onSubmit={handleSaveAccount} className="mt-8 rounded-[28px] border border-[#D8D0EC] bg-white p-6 shadow-[0_18px_45px_rgba(43,28,112,0.05)]">
            <div className="mb-5 flex items-center gap-3">
              <UserCircle2 size={18} className="text-[#2B1C70]" />
              <h2 className="text-[24px] font-semibold text-[#2B1C70]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Account details
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {[
                { key: 'name', label: 'Full name', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'phone', label: 'Phone', type: 'tel' },
                { key: 'street', label: 'Street', type: 'text' },
                { key: 'city', label: 'City', type: 'text' },
                { key: 'zip', label: 'ZIP', type: 'text' },
              ].map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.12em] text-[#2B1C70]/48">
                    {field.label}
                  </span>
                  <input
                    type={field.type}
                    value={(accountForm as any)[field.key]}
                    onChange={(event) =>
                      setAccountForm((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#D8D0EC] bg-[#FBFAFE] px-4 py-3 text-[14px] text-[#2B1C70] outline-none"
                  />
                </label>
              ))}
            </div>

            {accountMessage && (
              <p className="mt-4 text-[13px] text-[#2B1C70]/68" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {accountMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={savingAccount}
              className="mt-6 rounded-full bg-[#2B1C70] px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white disabled:opacity-60"
            >
              {savingAccount ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
