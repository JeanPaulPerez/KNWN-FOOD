/**
 * api/cancel-order.ts
 *
 * Cancels a WooCommerce order and issues a Stripe refund if applicable.
 * Requires a signed Bearer token matching the requesting user's email.
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

function readMeta(meta: any[] | undefined, ...keys: string[]): string {
  for (const key of keys) {
    const entry = meta?.find((m: any) => m.key === key);
    if (entry?.value) return String(entry.value);
  }
  return '';
}

function parseServiceDateLocal(dateStr: string): Date | null {
  if (!dateStr) return null;
  // YYYY-MM-DD
  const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) { const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])); return isNaN(d.getTime()) ? null : d; }
  // MM/DD/YYYY
  const mdy4 = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy4) { const d = new Date(Number(mdy4[3]), Number(mdy4[1]) - 1, Number(mdy4[2])); return isNaN(d.getTime()) ? null : d; }
  // MM-DD-YY (export format "05-08-26")
  const mdyShort = dateStr.match(/^(\d{2})-(\d{2})-(\d{2})$/);
  if (mdyShort) { const d = new Date(2000 + Number(mdyShort[3]), Number(mdyShort[1]) - 1, Number(mdyShort[2])); return isNaN(d.getTime()) ? null : d; }
  // DD-MM-YYYY (Tyche "08-05-2026")
  const dmyLong = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmyLong) { const d = new Date(Number(dmyLong[3]), Number(dmyLong[2]) - 1, Number(dmyLong[1])); return isNaN(d.getTime()) ? null : d; }
  // Human "Friday, May 8" or "May 8"
  const human = dateStr.match(/(?:[A-Za-z]+,\s*)?([A-Za-z]+)\s+(\d{1,2})(?:,?\s*(\d{4}))?/);
  if (human) {
    const year = human[3] ? Number(human[3]) : new Date().getFullYear();
    const d = new Date(`${human[1]} ${human[2]} ${year}`);
    if (!isNaN(d.getTime())) {
      if (d.getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000) d.setFullYear(d.getFullYear() + 1);
      return d;
    }
  }
  return null;
}

function canCancelOrder(order: any): boolean {
  if (!CANCELLABLE_STATUSES.has(order.status)) return false;
  const candidates = [
    readMeta(order.meta_data, 'service_date_iso'),
    readMeta(order.meta_data, 'delivery_date'),
    readMeta(order.meta_data, 'e_deliverydate'),
    readMeta(order.meta_data, 'service_date_display', 'service_date_label', 'service_day'),
    readMeta(order.line_items?.flatMap((i: any) => i.meta_data || []), 'Delivery date'),
  ];
  let serviceDate: Date | null = null;
  for (const c of candidates) { if (c) { serviceDate = parseServiceDateLocal(c); if (serviceDate) break; } }
  if (!serviceDate) return false;
  const deadline = new Date(serviceDate);
  deadline.setDate(deadline.getDate() - 1);
  deadline.setHours(22, 0, 0, 0);
  return Date.now() <= deadline.getTime();
}

function orderBelongsToUser(order: any, email: string, wcCustomerId?: number | null): boolean {
  if (wcCustomerId && Number(order.customer_id) === wcCustomerId) return true;
  return (order.billing?.email || '').toLowerCase() === email.toLowerCase();
}

async function addOrderNote(wcUrl: string, authHeader: string, orderId: number, note: string) {
  await fetch(`${wcUrl}/wp-json/wc/v3/orders/${orderId}/notes`, {
    method:  'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ note }),
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId: rawOrderId, email: bodyEmail, wcCustomerId: bodyCustomerId } = req.body || {};
  const orderId = parseInt(String(rawOrderId), 10);
  const email = bodyEmail || '';
  const wcCustomerId = bodyCustomerId ? Number(bodyCustomerId) : null;
  const token = (req.headers?.authorization as string | undefined)?.replace('Bearer ', '');

  if (!orderId || isNaN(orderId) || orderId <= 0 || !email || !verifyToken(token, email)) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const wcUrl       = process.env.WC_URL?.trim();
  const wcCk        = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs        = process.env.WC_CONSUMER_SECRET?.trim();
  const stripeSecret = process.env.STRIPE_SECRET_KEY?.trim();

  if (!wcUrl || !wcCk || !wcCs) {
    return res.status(500).json({ error: 'Store not configured' });
  }

  const authHeader = `Basic ${Buffer.from(`${wcCk}:${wcCs}`).toString('base64')}`;

  try {
    const orderRes = await fetch(`${wcUrl}/wp-json/wc/v3/orders/${orderId}`, {
      headers: { Authorization: authHeader },
    });
    const order = await orderRes.json();
    if (!orderRes.ok) {
      return res.status(orderRes.status).json({ error: order.message || 'Order not found' });
    }

    if (!orderBelongsToUser(order, email, wcCustomerId)) {
      return res.status(403).json({ error: 'You do not have permission to cancel this order' });
    }

    if (!canCancelOrder(order)) {
      return res.status(409).json({ error: 'This order is no longer eligible for cancellation' });
    }

    const paymentIntentId = readMeta(order.meta_data, 'stripe_payment_intent');
    const stripeChargeId  = readMeta(order.meta_data, '_stripe_charge_id');
    let refundId = '';
    let refundFailedReason = '';
    let nextStatus = 'cancelled';
    const allocatedTotal = readMeta(order.meta_data, 'knwn_order_total');
    const refundAmountInCents = Math.round(Number(allocatedTotal || order.total || 0) * 100);

    const hasStripePayment =
      stripeSecret &&
      refundAmountInCents > 0 &&
      paymentIntentId &&
      paymentIntentId !== 'N/A (free order)';

    if (hasStripePayment) {
      // Prefer charge ID if available (WC Stripe plugin convention), fall back to PI
      const refundParams = new URLSearchParams({
        reason:                     'requested_by_customer',
        amount:                     String(refundAmountInCents),
        'metadata[wc_order_id]':    String(orderId),
        'metadata[customer_email]': email,
      });
      if (stripeChargeId) {
        refundParams.set('charge', stripeChargeId);
      } else {
        refundParams.set('payment_intent', paymentIntentId);
      }

      const refundRes = await fetch('https://api.stripe.com/v1/refunds', {
        method:  'POST',
        headers: { Authorization: `Bearer ${stripeSecret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    refundParams.toString(),
      });

      const refundData = await refundRes.json();
      if (!refundRes.ok) {
        // Stripe refund failed — log it, but do NOT block the order cancellation.
        // Admin can issue the refund manually from the Stripe or WooCommerce dashboard.
        refundFailedReason = refundData.error?.message || 'Stripe refund failed';
        console.error('[cancel-order] Stripe refund failed (will cancel without refund):', JSON.stringify(refundData));
        nextStatus = 'cancelled';
      } else {
        refundId   = refundData.id || '';
        nextStatus = 'refunded';
      }
    }

    const cancelledAt = new Date().toISOString();
    const updateRes = await fetch(`${wcUrl}/wp-json/wc/v3/orders/${orderId}`, {
      method:  'PUT',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: nextStatus,
        meta_data: [
          { key: 'customer_cancelled_at', value: cancelledAt },
          { key: 'customer_cancelled_by', value: email },
          { key: 'stripe_refund_id',      value: refundId || '' },
          { key: 'refund_status',         value: refundId ? 'succeeded' : refundFailedReason ? 'failed_manual_required' : 'not_required' },
          ...(refundFailedReason ? [{ key: 'stripe_refund_error', value: refundFailedReason }] : []),
        ],
      }),
    });

    const updatedOrder = await updateRes.json();
    if (!updateRes.ok) {
      return res.status(502).json({ error: updatedOrder.message || 'Failed to update order status' });
    }

    let noteText: string;
    if (refundId) {
      noteText = `Customer cancelled from the headless dashboard. Stripe refund ${refundId} created automatically.`;
    } else if (refundFailedReason) {
      noteText = `Customer cancelled from the headless dashboard. Stripe refund failed (${refundFailedReason}) — please issue refund manually.`;
    } else {
      noteText = 'Customer cancelled from the headless dashboard. No Stripe refund required.';
    }
    await addOrderNote(wcUrl, authHeader, orderId, noteText);

    return res.status(200).json({
      success: true,
      orderId,
      status: nextStatus,
      refundId: refundId || null,
      cancelledAt,
      ...(refundFailedReason ? { refundNote: 'Order cancelled. Refund needs to be processed manually.' } : {}),
    });
  } catch (err: any) {
    console.error('[cancel-order] Exception:', err);
    return res.status(500).json({ error: err?.message || 'Failed to cancel order' });
  }
}
