import { canCancelOrder, getCustomerFacingStatus, getOrderDeliveryWindow, getOrderServiceDate, orderBelongsToUser, readMetaValue } from '../lib/orderLifecycle';
import { getSessionUserFromRequest } from '../lib/authSession';

async function fetchOrders(url: string, authHeader: string) {
  const response = await fetch(url, {
    headers: { Authorization: authHeader },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load customer orders');
  }

  return Array.isArray(data) ? data : [];
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionUser = getSessionUserFromRequest(req);
  if (!sessionUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const wcUrl = process.env.WC_URL?.trim();
  const wcCk = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs = process.env.WC_CONSUMER_SECRET?.trim();

  if (!wcUrl || !wcCk || !wcCs) {
    return res.status(500).json({ error: 'Store not configured' });
  }

  const authHeader = `Basic ${Buffer.from(`${wcCk}:${wcCs}`).toString('base64')}`;
  const uniqueOrders = new Map<number, any>();

  try {
    if (sessionUser.wcCustomerId) {
      const customerOrders = await fetchOrders(
        `${wcUrl}/wp-json/wc/v3/orders?customer=${sessionUser.wcCustomerId}&per_page=100&orderby=date&order=desc`,
        authHeader
      );

      for (const order of customerOrders) {
        uniqueOrders.set(order.id, order);
      }
    }

    // Backfill historical guest orders that may share the same billing email.
    const searchOrders = await fetchOrders(
      `${wcUrl}/wp-json/wc/v3/orders?search=${encodeURIComponent(sessionUser.email)}&per_page=100&orderby=date&order=desc`,
      authHeader
    );

    for (const order of searchOrders) {
      if (orderBelongsToUser(order, sessionUser)) {
        uniqueOrders.set(order.id, order);
      }
    }

    const orders = [...uniqueOrders.values()]
      .sort((left, right) => new Date(right.date_created || 0).getTime() - new Date(left.date_created || 0).getTime())
      .map((order) => ({
        id: order.id,
        number: order.number || String(order.id),
        status: order.status,
        statusLabel: getCustomerFacingStatus(order.status),
        total: Number(order.total || 0),
        currency: order.currency || 'USD',
        currencySymbol: order.currency_symbol || '$',
        itemCount: (order.line_items || []).reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0),
        createdAt: order.date_created,
        paidAt: order.date_paid,
        serviceDate: getOrderServiceDate(order),
        deliveryWindow: getOrderDeliveryWindow(order),
        canCancel: canCancelOrder(order),
        refundId: readMetaValue(order.meta_data, 'stripe_refund_id'),
        cancelledAt: readMetaValue(order.meta_data, 'customer_cancelled_at', 'knwn_cancelled_at'),
        items: (order.line_items || []).map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          name: item.name,
          quantity: item.quantity,
          total: Number(item.total || 0),
          meta: item.meta_data || [],
        })),
      }));

    return res.status(200).json({ orders });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to load customer orders' });
  }
}
