/**
 * api/account-orders.ts
 *
 * Fetches WooCommerce orders for the logged-in user.
 * Auth: signed session cookie, with optional email + wcCustomerId fallback.
 */

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
  return (
    readMeta(order.meta_data, 'delivery_date', 'e_deliverydate', 'Fecha de Servicio', 'service_date_iso') ||
    readMeta(order.line_items?.flatMap((i: any) => i.meta_data || []), 'Fecha de Servicio Display', 'Fecha de Servicio', 'Delivery date')
  );
}

function canCancelOrder(order: any): boolean {
  if (!CANCELLABLE_STATUSES.has(order.status)) return false;
  const dateStr = getOrderServiceDate(order);
  if (!dateStr) return false;
  // Try to parse service date and check if it's at least tomorrow
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return false;
  const deadline = new Date(parsed);
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

  if (!email) {
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
