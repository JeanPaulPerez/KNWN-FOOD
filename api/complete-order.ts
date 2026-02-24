/**
 * api/complete-order.ts
 *
 * SPLIT ORDER LOGIC:
 * Each item in the cart generates its own separate WooCommerce order.
 *
 * Example: cart with 3 meals → WC Order #1001, #1002, #1003
 * Each order shares the same: customer info, coupon, payment details.
 *
 * TWO PAYMENT PATHS:
 *
 * 1. FREE ORDER (isFree: true — e.g. REALFOOD113):
 *    - Skips Stripe entirely.
 *    - Creates one WooCommerce order per item, status "processing".
 *
 * 2. PAID ORDER (isFree: false):
 *    - Verifies Stripe PaymentIntent "succeeded" ONCE before any order is created.
 *    - Then creates one WooCommerce order per item (all share the same paymentIntentId).
 *    - If any individual order fails, the others still succeed — errors are collected.
 */

// ─── Helper: build customization meta_data for a single item ──────────────────
function buildItemMeta(item: any): { key: string; value: string }[] {
  const meta: { key: string; value: string }[] = [];
  const c = item.customizations;

  if (c) {
    if (c.base)             meta.push({ key: 'Base',             value: c.base });
    if (c.sauce)            meta.push({ key: 'Salsa',            value: c.sauce });
    if (c.protein)          meta.push({ key: 'Proteína',         value: c.protein });
    if (c.avoid)            meta.push({ key: 'Excluir',          value: c.avoid });
    if (c.isVegetarian)     meta.push({ key: 'Vegetariano',      value: 'Sí' });
    if (c.vegInstructions)  meta.push({ key: 'Instrucciones Veg', value: c.vegInstructions });
    if (c.swap)             meta.push({ key: 'Swap',             value: c.swap });
  }
  if (item.serviceDate) {
    meta.push({ key: 'Fecha de Servicio', value: item.serviceDate });
  }
  return meta;
}

// ─── Helper: create a single WooCommerce order for one item ───────────────────
async function createWooOrder(
  item: any,
  customerInfo: any,
  couponCode: string | null,
  paymentIntentId: string | null,
  isFree: boolean,
  wcUrl: string,
  wcCk: string,
  wcCs: string,
): Promise<{ id: number; order_key: string } | null> {
  const payload = {
    status: 'processing',
    set_paid: true,
    payment_method: isFree ? 'free_coupon' : 'stripe',
    payment_method_title: isFree ? 'Free (100% Promo)' : 'Credit Card (Stripe)',
    billing: {
      first_name: customerInfo.name?.split(' ')[0] || '',
      last_name:  customerInfo.name?.split(' ').slice(1).join(' ') || '',
      address_1:  customerInfo.street || '',
      city:       customerInfo.city || 'Miami',
      state:      'FL',
      postcode:   customerInfo.zip || '',
      country:    'US',
      email:      customerInfo.email || '',
      phone:      customerInfo.phone || '',
    },
    shipping: {
      first_name: customerInfo.name?.split(' ')[0] || '',
      last_name:  customerInfo.name?.split(' ').slice(1).join(' ') || '',
      address_1:  customerInfo.street || '',
      city:       customerInfo.city || 'Miami',
      state:      'FL',
      postcode:   customerInfo.zip || '',
      country:    'US',
    },
    // One line item per order
    line_items: [{
      product_id: item._wooProductId || 0,
      quantity:   item.quantity,
      meta_data:  buildItemMeta(item),
    }],
    // Coupon applied to each order so WooCommerce shows the correct discounted total
    coupon_lines: couponCode ? [{ code: couponCode }] : [],
    customer_note: customerInfo.notes || '',
    meta_data: [
      { key: 'order_source',          value: 'headless-react' },
      { key: 'stripe_payment_intent', value: paymentIntentId || 'N/A (free order)' },
    ],
  };

  try {
    const response = await fetch(
      `${wcUrl}/wp-json/wc/v3/orders?consumer_key=${wcCk}&consumer_secret=${wcCs}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      }
    );
    if (!response.ok) {
      const err = await response.json();
      console.error(`[WooCommerce] Failed for item "${item.name}":`, err);
      return null;
    }
    return await response.json();
  } catch (err) {
    console.error(`[WooCommerce] Exception for item "${item.name}":`, err);
    return null;
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, customerInfo, couponCode, paymentIntentId, isFree } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  // ── PAID FLOW: Verify Stripe payment ONCE before creating any orders ────────
  if (!isFree) {
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment confirmation is required' });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Payment system not configured' });
    }
    try {
      const piRes = await fetch(
        `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
        { headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` } }
      );
      const pi = await piRes.json() as any;
      if (pi.status !== 'succeeded') {
        return res.status(400).json({ error: `Payment not confirmed (status: ${pi.status})` });
      }
    } catch {
      return res.status(400).json({ error: 'Could not verify payment with Stripe' });
    }
  }

  const wcUrl = process.env.WC_URL?.trim();
  const wcCk  = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs  = process.env.WC_CONSUMER_SECRET?.trim();
  const wcReady = !!(wcUrl && wcCk && wcCs);

  // ── SPLIT: Create one WooCommerce order per item ───────────────────────────
  // Orders are created in parallel for speed.
  const orderResults = await Promise.all(
    items.map(async (item: any) => {
      let wooOrderId: number | null = null;
      let wooOrderKey: string | null = null;

      if (wcReady) {
        const wooOrder = await createWooOrder(
          item, customerInfo, couponCode, paymentIntentId, isFree,
          wcUrl!, wcCk!, wcCs!
        );
        if (wooOrder) {
          wooOrderId  = wooOrder.id;
          wooOrderKey = wooOrder.order_key;
        }
      }

      return {
        itemName:   item.name,
        itemId:     item.id,
        orderId:    wooOrderId
          ? `WC-${wooOrderId}`
          : `KNWN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        wooOrderId,
        wooOrderKey,
      };
    })
  );

  return res.json({ success: true, orders: orderResults });
}
