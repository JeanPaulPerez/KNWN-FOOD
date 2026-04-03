import { getEtNow } from '../utils/dateLogic';

export const DELIVERY_WINDOW_LABEL = '10:00 AM - 12:00 PM';
const CANCELLABLE_STATUSES = new Set(['pending', 'processing', 'on-hold']);

export type DashboardOrder = {
  id: number;
  number: string;
  status: string;
  total: string;
  currencySymbol?: string;
  dateCreated?: string;
  customerId?: number;
  billing?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  meta_data?: Array<{ key: string; value: any }>;
  line_items?: Array<{
    id: number;
    name: string;
    quantity: number;
    meta_data?: Array<{ key: string; value: any }>;
  }>;
};

function parseShortYear(shortYear: string) {
  const numericYear = Number(shortYear);
  return numericYear >= 70 ? 1900 + numericYear : 2000 + numericYear;
}

export function parseServiceDate(value?: string | null): Date | null {
  if (!value) return null;

  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parsed = new Date(`${trimmed}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const dashedShort = trimmed.match(/^(\d{2})-(\d{2})-(\d{2})$/);
  if (dashedShort) {
    const [, month, day, shortYear] = dashedShort;
    const parsed = new Date(parseShortYear(shortYear), Number(month) - 1, Number(day), 12, 0, 0);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const dashedLong = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dashedLong) {
    const [, day, month, year] = dashedLong;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const slashedLong = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashedLong) {
    const [, month, day, year] = slashedLong;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const withoutWeekday = trimmed.replace(/^[A-Za-z]+,\s*/, '');
  const currentYear = new Date().getFullYear();
  const parsed = new Date(`${withoutWeekday} ${currentYear} 12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  if (parsed.getTime() < Date.now() - 1000 * 60 * 60 * 24 * 30) {
    parsed.setFullYear(parsed.getFullYear() + 1);
  }

  return parsed;
}

export function formatServiceDateIso(value?: string | null) {
  const parsed = parseServiceDate(value);
  if (!parsed) return '';

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatServiceDateForExport(value?: string | null) {
  const parsed = parseServiceDate(value);
  if (!parsed) return value || '';

  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  const year = String(parsed.getFullYear()).slice(-2);
  return `${month}-${day}-${year}`;
}

export function formatServiceDateForWoo(value?: string | null) {
  const parsed = parseServiceDate(value);
  if (!parsed) return value || '';

  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${month}/${day}/${parsed.getFullYear()}`;
}

export function formatServiceDateTyche(value?: string | null) {
  const parsed = parseServiceDate(value);
  if (!parsed) return value || '';

  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${day}-${month}-${parsed.getFullYear()}`;
}

export function getMetaValue(meta: Array<{ key: string; value: any }> | undefined, ...keys: string[]) {
  for (const key of keys) {
    const entry = meta?.find((item) => item.key === key);
    if (entry?.value !== undefined && entry?.value !== null && entry.value !== '') {
      return String(entry.value);
    }
  }
  return '';
}

export function getOrderServiceDate(order: DashboardOrder) {
  const orderMeta = order.meta_data ?? [];
  const itemMeta = order.line_items?.flatMap((item) => item.meta_data ?? []) ?? [];

  return (
    getMetaValue(orderMeta, 'service_date_display', 'service_date_label', 'delivery_date_human', 'service_date_export', 'delivery_date', 'e_deliverydate', 'Fecha de Servicio') ||
    getMetaValue(itemMeta, 'Fecha de Servicio Display', 'service_date_display', 'service_date_label', 'Fecha de Servicio', 'Delivery date')
  );
}

export function getOrderDeliveryWindow(order: DashboardOrder) {
  const orderMeta = order.meta_data ?? [];
  const itemMeta = order.line_items?.flatMap((item) => item.meta_data ?? []) ?? [];

  return getMetaValue(orderMeta, 'delivery_time_window', 'delivery_time', 'Delivery Time') ||
    getMetaValue(itemMeta, 'delivery_time_window', 'delivery_time', 'Delivery Time') ||
    DELIVERY_WINDOW_LABEL;
}

export function getOrderPaymentIntent(order: DashboardOrder) {
  return getMetaValue(order.meta_data, 'stripe_payment_intent');
}

export function getCustomerFacingStatus(status: string) {
  switch (status) {
    case 'pending':
    case 'processing':
      return 'In Process';
    case 'on-hold':
      return 'Awaiting Payment';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'refunded':
      return 'Refunded';
    case 'out-for-delivery':
      return 'On the Way';
    default:
      return status
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
  }
}

export function canCancelOrder(order: DashboardOrder) {
  if (!CANCELLABLE_STATUSES.has(order.status)) return false;

  const serviceDate = getOrderServiceDate(order);
  const parsedServiceDate = parseServiceDate(serviceDate);

  if (!parsedServiceDate) return false;

  const deadline = new Date(parsedServiceDate);
  deadline.setDate(deadline.getDate() - 1);
  deadline.setHours(22, 0, 0, 0);

  return getEtNow() <= deadline;
}

export function orderBelongsToUser(order: DashboardOrder, user: { wcCustomerId?: number; email: string }) {
  const orderCustomerId = Number((order as any).customerId ?? (order as any).customer_id ?? 0);

  if (user.wcCustomerId && orderCustomerId === Number(user.wcCustomerId)) {
    return true;
  }

  return (order.billing?.email || '').toLowerCase() === user.email.toLowerCase();
}

export const readMetaValue = getMetaValue;
export const extractServiceDate = getOrderServiceDate;
export const extractDeliveryWindow = getOrderDeliveryWindow;
export const extractDeliveryLabel = getOrderDeliveryWindow;
export const extractPaymentIntentId = getOrderPaymentIntent;
export const getCustomerFacingOrderStatus = getCustomerFacingStatus;
export const isOrderCancellationEligible = canCancelOrder;
export const isOrderCancelable = canCancelOrder;

export function mapOrderStatus(status: string) {
  const label = getCustomerFacingStatus(status);

  if (label === 'Completed') return { label, tone: 'success' };
  if (label === 'On the Way') return { label, tone: 'accent' };
  if (label === 'Cancelled' || label === 'Refunded') return { label, tone: 'muted' };

  return { label, tone: 'default' };
}
