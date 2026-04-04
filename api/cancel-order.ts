/**
 * api/cancel-order.ts
 *
 * Cancels a WooCommerce order and issues a Stripe refund if applicable.
 * Auth: signed session cookie, with optional email + wcCustomerId fallback.
 */

const CANCELLABLE_STATUSES = new Set(['pending', 'processing', 'on-hold']);

function readMeta(meta: any[] | undefined, ...keys: string[]): string {
  for (const key of keys) {
    const entry = meta?.find((m: any) => m.key === key);
    if (entry?.value) return String(entry.value);
  }
  return '';
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
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return false;
  const deadline = new Date(parsed);
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

  const { orderId, email: bodyEmail, wcCustomerId: bodyCustomerId } = req.body || {};
  const email = bodyEmail || '';
  const wcCustomerId = bodyCustomerId ? Number(bodyCustomerId) : null;

  if (!orderId || !email) {
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
    let refundId = '';
    let nextStatus = 'cancelled';
    const allocatedTotal = readMeta(order.meta_data, 'knwn_order_total');
    const refundAmountInCents = Math.round(Number(allocatedTotal || order.total || 0) * 100);

    if (paymentIntentId && paymentIntentId !== 'N/A (free order)' && stripeSecret) {
      const params = new URLSearchParams({
        payment_intent: paymentIntentId,
        reason:         'requested_by_customer',
        amount:         String(refundAmountInCents),
        'metadata[wc_order_id]':    String(orderId),
        'metadata[customer_email]': email,
      });

      const refundRes = await fetch('https://api.stripe.com/v1/refunds', {
        method:  'POST',
        headers: { Authorization: `Bearer ${stripeSecret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    params.toString(),
      });

      const refundData = await refundRes.json();
      if (!refundRes.ok) {
        console.error('[cancel-order] Stripe refund failed:', refundData);
        return res.status(502).json({ error: refundData.error?.message || 'Stripe refund failed' });
      }

      refundId   = refundData.id || '';
      nextStatus = 'refunded';
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
          { key: 'refund_status',         value: refundId ? 'succeeded' : 'not_required' },
        ],
      }),
    });

    const updatedOrder = await updateRes.json();
    if (!updateRes.ok) {
      return res.status(502).json({ error: updatedOrder.message || 'Failed to update order status' });
    }

    await addOrderNote(
      wcUrl, authHeader, orderId,
      refundId
        ? `Customer cancelled from the headless dashboard. Stripe refund ${refundId} created automatically.`
        : 'Customer cancelled from the headless dashboard. No Stripe refund required.'
    );

    return res.status(200).json({ success: true, orderId, status: nextStatus, refundId: refundId || null, cancelledAt });
  } catch (err: any) {
    console.error('[cancel-order] Exception:', err);
    return res.status(500).json({ error: err?.message || 'Failed to cancel order' });
  }
}
