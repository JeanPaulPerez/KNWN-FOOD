/**
 * api/account-orders.ts
 *
 * Fetches WooCommerce orders for the authenticated user.
 * Requires a signed token (Authorization: Bearer <token>) issued at login.
 */
import crypto from 'node:crypto';

const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

function verifyToken(token: string | undefined, email: string): boolean {
  const secret = process.env.AUTH_SESSION_SECRET || process.env.STRIPE_SECRET_KEY || process.env.WC_CONSUMER_SECRET || '';
  if (!token || !secret) return false;
  const [ts, sig] = token.split('.');
  if (!ts || !sig) return false;
  if (Date.now() - Number(ts) > TOKEN_TTL) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${email}:${ts}`).digest('hex');
  return sig === expected;
}


const CANCELLABLE_STATUSES = new Set(['pending', 'processing', 'on-hold']);
const DELIVERY_WINDOW_LABEL = '10:00 AM - 12:00 PM';

function readMeta(meta: any[] | undefined, ...keys: string[]): string {
  for (const key of keys) {
    const entry = meta?.find((m: any) => m.key === key);
    if (entry?.value) return String(entry.value);
  }
  return '';
}

function getCustomerFacingStatus(status: string) {
  switch (status) {
    case 'pending':
    case 'processing':   return 'In Process';
    case 'on-hold':      return 'Awaiting Payment';
    case 'completed':    return 'Completed';
    case 'cancelled':    return 'Cancelled';
    case 'refunded':     return 'Refunded';
    case 'out-for-delivery': return 'On the Way';
    default: return status.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }
}

function getOrderServiceDate(order: any): string {
  // Prioritize human-readable display string, then ISO (reliable parsing), then other formats
  return (
    readMeta(order.meta_data, 'service_date_display', 'service_date_label', 'service_day',
             'service_date_iso', 'delivery_date', 'e_deliverydate', 'Fecha de Servicio') ||
    readMeta(order.line_items?.flatMap((i: any) => i.meta_data || []), 'Fecha de Servicio Display', 'Fecha de Servicio', 'Delivery date')
  );
}

// Parses all date formats we store, always returning a LOCAL midnight Date to avoid UTC-offset bugs.
function parseServiceDateLocal(dateStr: string): Date | null {
  if (!dateStr) return null;

  // YYYY-MM-DD (ISO, stored in service_date_iso)
  const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return isNaN(d.getTime()) ? null : d;
  }

  // MM/DD/YYYY (stored in delivery_date)
  const mdy4 = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy4) {
    const d = new Date(Number(mdy4[3]), Number(mdy4[1]) - 1, Number(mdy4[2]));
    return isNaN(d.getTime()) ? null : d;
  }

  // MM-DD-YY (stored in service_date_export, e.g. "05-08-26")
  const mdyShort = dateStr.match(/^(\d{2})-(\d{2})-(\d{2})$/);
  if (mdyShort) {
    const d = new Date(2000 + Number(mdyShort[3]), Number(mdyShort[1]) - 1, Number(mdyShort[2]));
    return isNaN(d.getTime()) ? null : d;
  }

  // DD-MM-YYYY (Tyche format, stored in e_deliverydate, e.g. "08-05-2026")
  const dmyLong = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmyLong) {
    const d = new Date(Number(dmyLong[3]), Number(dmyLong[2]) - 1, Number(dmyLong[1]));
    return isNaN(d.getTime()) ? null : d;
  }

  // Human-readable: "Friday, May 8" or "May 8" (stored in service_date_display)
  const humanMatch = dateStr.match(/(?:[A-Za-z]+,\s*)?([A-Za-z]+)\s+(\d{1,2})(?:,?\s*(\d{4}))?/);
  if (humanMatch) {
    const year = humanMatch[3] ? Number(humanMatch[3]) : new Date().getFullYear();
    const d = new Date(`${humanMatch[1]} ${humanMatch[2]} ${year}`);
    if (!isNaN(d.getTime())) {
      // If date appears to be in the past (>30 days), assume next year
      if (d.getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000) d.setFullYear(d.getFullYear() + 1);
      return d;
    }
  }

  return null;
}

function getCanonicalServiceDate(order: any): Date | null {
  // Try ISO first (most reliable), then all other stored formats
  const candidates = [
    readMeta(order.meta_data, 'service_date_iso'),
    readMeta(order.meta_data, 'delivery_date'),
    readMeta(order.meta_data, 'e_deliverydate'),
    readMeta(order.meta_data, 'service_date_display', 'service_date_label', 'service_day'),
    readMeta(order.line_items?.flatMap((i: any) => i.meta_data || []), 'Delivery date'),
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const parsed = parseServiceDateLocal(candidate);
    if (parsed) return parsed;
  }
  return null;
}

function canCancelOrder(order: any): boolean {
  if (!CANCELLABLE_STATUSES.has(order.status)) return false;
  const serviceDate = getCanonicalServiceDate(order);
  if (!serviceDate) return false;
  const deadline = new Date(serviceDate);
  deadline.setDate(deadline.getDate() - 1);
  deadline.setHours(22, 0, 0, 0);
  return Date.now() <= deadline.getTime();
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = (req.query?.email as string) || '';
  const wcCustomerId = req.query?.wcCustomerId ? Number(req.query.wcCustomerId) : null;
  const token = (req.headers?.authorization as string | undefined)?.replace('Bearer ', '');

  if (!email || !verifyToken(token, email)) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const wcUrl = process.env.WC_URL?.trim();
  const wcCk  = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs  = process.env.WC_CONSUMER_SECRET?.trim();

  if (!wcUrl || !wcCk || !wcCs) {
    return res.status(500).json({ error: 'Store not configured' });
  }

  const authHeader = `Basic ${Buffer.from(`${wcCk}:${wcCs}`).toString('base64')}`;
  const uniqueOrders = new Map<number, any>();

  try {
    // Fetch by customer ID if available
    if (wcCustomerId) {
      const res1 = await fetch(
        `${wcUrl}/wp-json/wc/v3/orders?customer=${wcCustomerId}&per_page=100&orderby=date&order=desc`,
        { headers: { Authorization: authHeader } }
      );
      const data1 = await res1.json();
      if (Array.isArray(data1)) {
        for (const order of data1) uniqueOrders.set(order.id, order);
      }
    }

    // Also search by email to catch guest orders
    const res2 = await fetch(
      `${wcUrl}/wp-json/wc/v3/orders?search=${encodeURIComponent(email)}&per_page=100&orderby=date&order=desc`,
      { headers: { Authorization: authHeader } }
    );
    const data2 = await res2.json();
    if (Array.isArray(data2)) {
      for (const order of data2) {
        const billingEmail = (order.billing?.email || '').toLowerCase();
        if (billingEmail === email.toLowerCase()) {
          uniqueOrders.set(order.id, order);
        }
      }
    }

    const orders = [...uniqueOrders.values()]
      .sort((a, b) => new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime())
      .map((order) => ({
        id:             order.id,
        number:         order.number || String(order.id),
        status:         order.status,
        statusLabel:    getCustomerFacingStatus(order.status),
        total:          Number(order.total || 0),
        currencySymbol: order.currency_symbol || '$',
        orderDate:      order.date_created,
        serviceDate:    getOrderServiceDate(order),
        deliveryWindow: readMeta(order.meta_data, 'delivery_time', 'Delivery Time') || DELIVERY_WINDOW_LABEL,
        canCancel:      canCancelOrder(order),
        refundId:       readMeta(order.meta_data, 'stripe_refund_id'),
        cancelledAt:    readMeta(order.meta_data, 'customer_cancelled_at', 'knwn_cancelled_at'),
        paymentIntentId: readMeta(order.meta_data, 'stripe_payment_intent'),
        billing: {
          street: order.billing?.address_1 || '',
          city:   order.billing?.city || '',
          state:  order.billing?.state || '',
          zip:    order.billing?.postcode || '',
          phone:  order.billing?.phone || '',
        },
        items: (order.line_items || []).map((item: any) => ({
          id:        item.id,
          productId: item.product_id,
          name:      item.name,
          quantity:  item.quantity,
          total:     Number(item.total || 0),
          meta:      item.meta_data || [],
        })),
      }));

    return res.status(200).json({ orders });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to load orders' });
  }
}
