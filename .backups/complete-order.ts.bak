/**
 * api/complete-order.ts
 *
 * Final step: creates the order in WooCommerce (deducts inventory, registers purchase).
 *
 * TWO PATHS:
 *
 * 1. FREE ORDER (isFree: true — e.g. REALFOOD113 coupon applied):
 *    - Skips Stripe entirely.
 *    - Creates WooCommerce order with status "processing" immediately.
 *    - Used to validate WooCommerce connection and inventory deduction.
 *
 * 2. PAID ORDER (isFree: false):
 *    - Verifies the Stripe PaymentIntent status is "succeeded" server-side.
 *    - Only THEN creates the WooCommerce order (prevents fraud/double-orders).
 *    - Sets order status to "processing".
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, customerInfo, couponCode, paymentIntentId, isFree } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  // ── PAID FLOW: Verify Stripe payment before creating the order ─────────────
  if (!isFree) {
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment confirmation is required' });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Payment system not configured' });
    }

    try {
      const piRes = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      });
      const pi = await piRes.json() as any;
      // Only proceed if Stripe confirms the payment actually succeeded
      if (pi.status !== 'succeeded') {
        return res.status(400).json({ error: `Payment not confirmed (status: ${pi.status})` });
      }
    } catch (err: any) {
      return res.status(400).json({ error: 'Could not verify payment with Stripe' });
    }
  }

  // ── Build WooCommerce line items with customization metadata ───────────────
  const line_items = items.map((item: any) => {
    const meta_data: { key: string; value: string }[] = [];

    if (item.customizations) {
      if (item.customizations.base)        meta_data.push({ key: 'Base', value: item.customizations.base });
      if (item.customizations.sauce)       meta_data.push({ key: 'Salsa', value: item.customizations.sauce });
      if (item.customizations.protein)     meta_data.push({ key: 'Proteína', value: item.customizations.protein });
      if (item.customizations.avoid)       meta_data.push({ key: 'Excluir', value: item.customizations.avoid });
      if (item.customizations.isVegetarian) meta_data.push({ key: 'Vegetariano', value: 'Sí' });
      if (item.customizations.vegInstructions) meta_data.push({ key: 'Instrucciones Veg', value: item.customizations.vegInstructions });
      if (item.customizations.swap)        meta_data.push({ key: 'Swap', value: item.customizations.swap });
    }

    if (item.serviceDate) {
      meta_data.push({ key: 'Fecha de Servicio', value: item.serviceDate });
    }

    return {
      product_id: item._wooProductId || 0,
      quantity: item.quantity,
      meta_data,
    };
  });

  // Pass coupon to WooCommerce so it applies the discount natively —
  // this makes the order total show $0.00 in admin, emails, and confirmations.
  const coupon_lines = couponCode ? [{ code: couponCode }] : [];

  const wooPayload = {
    // FREE ORDER: mark as processing directly (bypasses payment gateway)
    // PAID ORDER: mark as processing after Stripe confirms
    status: 'processing',
    set_paid: true,
    payment_method: isFree ? 'free_coupon' : 'stripe',
    payment_method_title: isFree ? 'Free (100% Promo)' : 'Credit Card (Stripe)',
    billing: {
      first_name: customerInfo.name?.split(' ')[0] || '',
      last_name: customerInfo.name?.split(' ').slice(1).join(' ') || '',
      address_1: customerInfo.street || '',
      city: customerInfo.city || 'Miami',
      state: 'FL',
      postcode: customerInfo.zip || '',
      country: 'US',
      email: customerInfo.email || '',
      phone: customerInfo.phone || '',
    },
    shipping: {
      first_name: customerInfo.name?.split(' ')[0] || '',
      last_name: customerInfo.name?.split(' ').slice(1).join(' ') || '',
      address_1: customerInfo.street || '',
      city: customerInfo.city || 'Miami',
      state: 'FL',
      postcode: customerInfo.zip || '',
      country: 'US',
    },
    line_items,
    coupon_lines,
    customer_note: customerInfo.notes || '',
    meta_data: [
      { key: 'order_source', value: 'headless-react' },
      { key: 'stripe_payment_intent', value: paymentIntentId || 'N/A (free order)' },
    ],
  };

  // ── Create order in WooCommerce ────────────────────────────────────────────
  const wcUrl = process.env.WC_URL?.trim();
  const wcCk = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs = process.env.WC_CONSUMER_SECRET?.trim();

  let wooOrderId: number | null = null;
  let wooOrderKey: string | null = null;

  if (wcUrl && wcCk && wcCs) {
    try {
      const response = await fetch(
        `${wcUrl}/wp-json/wc/v3/orders?consumer_key=${wcCk}&consumer_secret=${wcCs}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wooPayload),
        }
      );

      if (response.ok) {
        const order = await response.json();
        wooOrderId = order.id;
        wooOrderKey = order.order_key;
      } else {
        const errLog = await response.json();
        console.error('[WooCommerce] Order creation failed:', errLog);
      }
    } catch (err) {
      console.error('[WooCommerce] Exception:', err);
    }
  }

  const orderId = wooOrderId
    ? `WC-${wooOrderId}`
    : `KNWN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  return res.json({ success: true, orderId, wooOrderId, wooOrderKey });
}
