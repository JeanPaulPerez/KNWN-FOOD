import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, LogOut, MapPin, Package2, CreditCard, UserCircle2, LayoutDashboard } from 'lucide-react';
import { useUser } from '../store/useUser';

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

    fetch('/api/account-orders', { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json();
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
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();

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
        body: JSON.stringify(accountForm),
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
            <p className="text-[14px] text-[#2B1C70]/62" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Saved payment methods are not yet exposed in the headless account area. Payments are currently managed at checkout and refund handling is done server-side from WooCommerce and Stripe.
            </p>
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
