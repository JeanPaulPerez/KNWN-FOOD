import { canCancelOrder, getOrderPaymentIntent, getOrderServiceDate, orderBelongsToUser, readMetaValue } from '../lib/orderLifecycle';
import { getSessionUserFromRequest } from '../lib/authSession';

async function addOrderNote(wcUrl: string, authHeader: string, orderId: number, note: string) {
  await fetch(`${wcUrl}/wp-json/wc/v3/orders/${orderId}/notes`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ note }),
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionUser = getSessionUserFromRequest(req);
  if (!sessionUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const orderId = Number(req.body?.orderId);
  if (!Number.isFinite(orderId) || orderId <= 0) {
    return res.status(400).json({ error: 'A valid orderId is required' });
  }

  const wcUrl = process.env.WC_URL?.trim();
  const wcCk = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs = process.env.WC_CONSUMER_SECRET?.trim();
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

    if (!orderBelongsToUser(order, sessionUser)) {
      return res.status(403).json({ error: 'You do not have permission to cancel this order' });
    }

    if (!canCancelOrder(order)) {
      return res.status(409).json({
        error: 'This order is no longer eligible for cancellation',
        serviceDate: getOrderServiceDate(order),
      });
    }

    const paymentIntentId = getOrderPaymentIntent(order);
    let refundId = '';
    let nextStatus = 'cancelled';
    const allocatedTotal = readMetaValue(order.meta_data, 'knwn_order_total');
    const refundAmountInCents = Math.round(Number(allocatedTotal || order.total || 0) * 100);

    if (paymentIntentId && paymentIntentId !== 'N/A (free order)') {
      if (!stripeSecret) {
        return res.status(500).json({ error: 'Refund system not configured' });
      }

      const params = new URLSearchParams({
        payment_intent: paymentIntentId,
        reason: 'requested_by_customer',
        amount: String(refundAmountInCents),
        'metadata[wc_order_id]': String(orderId),
        'metadata[customer_email]': sessionUser.email,
      });

      const refundRes = await fetch('https://api.stripe.com/v1/refunds', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeSecret}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const refundData = await refundRes.json();
      if (!refundRes.ok) {
        console.error('[cancel-order] Stripe refund failed:', refundData);
        return res.status(502).json({ error: refundData.error?.message || 'Stripe refund failed' });
      }

      refundId = refundData.id || '';
      nextStatus = 'refunded';
    }

    const cancelledAt = new Date().toISOString();
    const updateRes = await fetch(`${wcUrl}/wp-json/wc/v3/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: nextStatus,
        meta_data: [
          { key: 'customer_cancelled_at', value: cancelledAt },
          { key: 'customer_cancelled_by', value: sessionUser.email },
          { key: 'stripe_refund_id', value: refundId || '' },
          { key: 'refund_status', value: refundId ? 'succeeded' : 'not_required' },
        ],
      }),
    });

    const updatedOrder = await updateRes.json();
    if (!updateRes.ok) {
      console.error('[cancel-order] Woo order update failed:', updatedOrder);
      return res.status(502).json({ error: updatedOrder.message || 'Failed to update order status' });
    }

    await addOrderNote(
      wcUrl,
      authHeader,
      orderId,
      refundId
        ? `Customer cancelled this order from the headless dashboard. Stripe refund ${refundId} was created automatically.`
        : 'Customer cancelled this order from the headless dashboard. No Stripe refund was required.'
    );

    return res.status(200).json({
      success: true,
      orderId,
      status: nextStatus,
      refundId: refundId || null,
      cancelledAt,
    });
  } catch (error: any) {
    console.error('[cancel-order] Exception:', error);
    return res.status(500).json({ error: error?.message || 'Failed to cancel order' });
  }
}
