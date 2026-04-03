import { DELIVERY_WINDOW_LABEL } from '../lib/orderLifecycle';

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

// ─── Helper: parse "Monday, Apr 6" into a JS Date (current year) ──────────────
function parseServiceDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const year = new Date().getFullYear();
  const withoutDay = dateStr.replace(/^[A-Za-z]+,\s*/, ''); // "Apr 6"
  const d = new Date(`${withoutDay} ${year}`);
  if (isNaN(d.getTime())) return null;

  if (d.getTime() < Date.now() - 1000 * 60 * 60 * 24 * 30) {
    d.setFullYear(d.getFullYear() + 1);
  }

  return d;
}

// "Monday, Apr 6" → "04-06-26"
// REQUIRED FORMAT for the WooCommerce export PHP function parse_delivery_date():
//   explode('-', $date_string) must yield exactly 3 parts [MM, DD, YY]
//   Any other format (slashes, 4-digit year) returns false → item excluded from export.
function formatServiceDateForExport(dateStr: string): string {
  const d = parseServiceDate(dateStr);
  if (!d) return dateStr;
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2); // 2-digit year
  return `${m}-${day}-${yy}`; // "04-06-26"
}

// "Monday, Apr 6" → "04/06/2026"  (MM/DD/YYYY — fallback for order-level meta)
function formatServiceDateForWoo(dateStr: string): string {
  const d = parseServiceDate(dateStr);
  if (!d) return dateStr;
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}/${day}/${d.getFullYear()}`;
}

// "Monday, Apr 6" → "06-04-2026"  (DD-MM-YYYY — Tyche Softwares plugin format for admin column)
function formatServiceDateTyche(dateStr: string): string {
  const d = parseServiceDate(dateStr);
  if (!d) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}-${m}-${d.getFullYear()}`;
}

function formatServiceDateIso(dateStr: string): string {
  const d = parseServiceDate(dateStr);
  if (!d) return '';
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function toCents(amount: number) {
  return Math.round((Number(amount) || 0) * 100);
}

function allocateCents(weights: number[], totalCents: number) {
  if (weights.length === 0) return [];

  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  if (totalWeight <= 0) {
    const evenShare = Math.floor(totalCents / weights.length);
    const result = Array.from({ length: weights.length }, () => evenShare);
    let remainder = totalCents - evenShare * weights.length;
    let index = 0;
    while (remainder > 0) {
      result[index] += 1;
      remainder -= 1;
      index += 1;
    }
    return result;
  }

  const provisional = weights.map((weight) => {
    const exact = (weight / totalWeight) * totalCents;
    return { floor: Math.floor(exact), fraction: exact - Math.floor(exact) };
  });

  const allocated = provisional.map((entry) => entry.floor);
  let remainder = totalCents - allocated.reduce((sum, value) => sum + value, 0);

  provisional
    .map((entry, index) => ({ ...entry, index }))
    .sort((a, b) => b.fraction - a.fraction)
    .forEach((entry) => {
      if (remainder > 0) {
        allocated[entry.index] += 1;
        remainder -= 1;
      }
    });

  return allocated;
}

function roundCurrency(amount: number) {
  return (toCents(amount) / 100).toFixed(2);
}

// ─── Helper: build customization meta_data for a single item ──────────────────
// KEY RULE: The WP Code Snippet export reads 'Fecha de Servicio' from line item meta
// for both the "Delivery Date" admin column AND the delivery date range filter.
// DO NOT change that key — it is hardcoded in the WordPress PHP export snippet.
function buildItemMeta(item: any, customerInfo: any): { key: string; value: string }[] {
  const meta: { key: string; value: string }[] = [];
  const c = item.customizations;

  if (c) {
    if (c.base)             meta.push({ key: 'Choose your base',          value: c.base });
    if (c.sauce)            meta.push({ key: 'Choose your dressing/sauce', value: c.sauce });
    if (c.protein)          meta.push({ key: 'Protein',                   value: c.protein });
    if (c.avoid)            meta.push({ key: 'Anything you don\'t like?', value: c.avoid });
    if (c.isVegetarian)     meta.push({ key: 'Make it vegetarian?',       value: 'TRUE' });
    if (c.vegInstructions)  meta.push({ key: 'Other',                     value: c.vegInstructions });
    if (c.swap)             meta.push({ key: 'Other',                     value: c.swap });
  }
  if (item.serviceDate) {
    // 'Delivery date' → read by the PHP export (parse_delivery_date expects MM-DD-YY with dashes)
    meta.push({ key: 'Delivery date',     value: formatServiceDateForExport(item.serviceDate) });
    // Some WordPress export snippets key off this label directly, so keep it machine-readable.
    meta.push({ key: 'Fecha de Servicio', value: formatServiceDateForExport(item.serviceDate) });
    meta.push({ key: 'Fecha de Servicio Display', value: item.serviceDate });
    meta.push({ key: 'Service Date ISO',  value: formatServiceDateIso(item.serviceDate) });
  }
  if (customerInfo.deliveryTimeWindow || DELIVERY_WINDOW_LABEL) {
    meta.push({ key: 'Delivery time', value: customerInfo.deliveryTimeWindow || DELIVERY_WINDOW_LABEL });
    meta.push({ key: 'Delivery Time', value: customerInfo.deliveryTimeWindow || DELIVERY_WINDOW_LABEL });
    meta.push({ key: 'delivery_time', value: customerInfo.deliveryTimeWindow || DELIVERY_WINDOW_LABEL });
  }
  if (customerInfo.address2) {
    meta.push({ key: 'Address line 2', value: customerInfo.address2 });
  }
  if (customerInfo.deliveryInstructions) {
    meta.push({ key: 'Delivery instructions', value: customerInfo.deliveryInstructions });
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
  pricing: {
    subtotal: string;
    discount: string;
    tax: string;
    tip: string;
    total: string;
  },
  wcUrl: string,
  wcCk: string,
  wcCs: string,
): Promise<{ id: number; order_key: string } | null> {
  const payload: any = {
    status: 'processing',
    set_paid: true,
    ...(customerInfo.wcCustomerId ? { customer_id: customerInfo.wcCustomerId } : {}),
    payment_method: isFree ? 'free_coupon' : 'stripe',
    payment_method_title: isFree ? 'Free (100% Promo)' : 'Credit Card (Stripe)',
    transaction_id: paymentIntentId || '',
    billing: {
      first_name: customerInfo.name?.split(' ')[0] || '',
      last_name:  customerInfo.name?.split(' ').slice(1).join(' ') || '',
      address_1:  customerInfo.street || '',
      address_2:  customerInfo.address2 || '',
      city:       customerInfo.city || 'Miami',
      state:      customerInfo.state || 'FL',
      postcode:   customerInfo.zip || '',
      country:    'US',
      email:      customerInfo.email || '',
      phone:      customerInfo.phone || '',
    },
    shipping: {
      first_name: customerInfo.name?.split(' ')[0] || '',
      last_name:  customerInfo.name?.split(' ').slice(1).join(' ') || '',
      address_1:  customerInfo.street || '',
      address_2:  customerInfo.address2 || '',
      city:       customerInfo.city || 'Miami',
      state:      customerInfo.state || 'FL',
      postcode:   customerInfo.zip || '',
      country:    'US',
    },
    // One line item per order
    line_items: [{
      product_id: item._wooProductId || 0,
      quantity:   item.quantity,
      meta_data:  buildItemMeta(item, customerInfo),
    }],
    // Coupon applied to each order so WooCommerce shows the correct discounted total
    coupon_lines: couponCode ? [{ code: couponCode }] : [],
    customer_note: customerInfo.deliveryInstructions || customerInfo.notes || '',
    // ORDER-level meta.
    // e_deliverydate = Tyche Softwares "Order Delivery Date" plugin key (DD-MM-YYYY).
    // The WooCommerce "Delivery Date" admin column and the custom export filter
    // both read THIS key — it must match for orders to appear in the export.
    meta_data: [
      { key: 'order_source',          value: 'headless-react' },
      { key: 'stripe_payment_intent', value: paymentIntentId || 'N/A (free order)' },
      { key: 'e_deliverydate',        value: formatServiceDateTyche(item.serviceDate || '') },
      { key: 'delivery_date',         value: formatServiceDateForWoo(item.serviceDate || '') },
      { key: 'service_date_export',   value: formatServiceDateForExport(item.serviceDate || '') },
      { key: 'service_date_iso',      value: formatServiceDateIso(item.serviceDate || '') },
      { key: 'service_date_display',  value: item.serviceDate || '' },
      { key: 'Fecha de Servicio',     value: formatServiceDateForExport(item.serviceDate || '') },
      { key: 'Delivery date',         value: formatServiceDateForExport(item.serviceDate || '') },
      { key: 'service_day',           value: item.serviceDate || '' },
      { key: 'service_date_label',    value: item.serviceDate || '' },
      { key: 'delivery_time_window',  value: customerInfo.deliveryTimeWindow || DELIVERY_WINDOW_LABEL },
      { key: 'delivery_time',         value: customerInfo.deliveryTimeWindow || DELIVERY_WINDOW_LABEL },
      { key: 'Delivery Time',         value: customerInfo.deliveryTimeWindow || DELIVERY_WINDOW_LABEL },
      { key: 'customer_name',         value: customerInfo.name || '' },
      { key: 'customer_email',        value: customerInfo.email || '' },
      { key: 'customer_phone',        value: customerInfo.phone || '' },
      { key: 'address_line_2',        value: customerInfo.address2 || '' },
      { key: 'delivery_instructions', value: customerInfo.deliveryInstructions || '' },
      { key: 'knwn_order_subtotal',   value: pricing.subtotal },
      { key: 'knwn_order_discount',   value: pricing.discount },
      { key: 'knwn_order_tax',        value: pricing.tax },
      { key: 'knwn_order_tip',        value: pricing.tip },
      { key: 'knwn_order_total',      value: pricing.total },
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
    const order = await response.json();
    return order;
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

  const { items, customerInfo, couponCode, paymentIntentId, isFree, pricing } = req.body;

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

  const itemSubtotals = items.map((item: any) => Number(item.price || 0) * Number(item.quantity || 0));
  const subtotalWeights = itemSubtotals.map((value) => toCents(value));
  const subtotalAllocations = allocateCents(subtotalWeights, toCents(pricing?.subtotal ?? itemSubtotals.reduce((sum: number, value: number) => sum + value, 0)));
  const discountAllocations = allocateCents(subtotalWeights, toCents(pricing?.discount ?? 0));
  const taxAllocations = allocateCents(subtotalWeights, toCents(pricing?.tax ?? 0));
  const tipAllocations = allocateCents(subtotalWeights, toCents(pricing?.tip ?? 0));
  const totalAllocations = allocateCents(subtotalWeights, toCents(pricing?.total ?? 0));

  // ── SPLIT: Create one WooCommerce order per item ───────────────────────────
  // Orders are created in parallel for speed.
  const orderResults = await Promise.all(
    items.map(async (item: any, index: number) => {
      let wooOrderId: number | null = null;
      let wooOrderKey: string | null = null;

      if (wcReady) {
        const wooOrder = await createWooOrder(
          item,
          customerInfo,
          couponCode,
          paymentIntentId,
          isFree,
          {
            subtotal: roundCurrency(subtotalAllocations[index] / 100),
            discount: roundCurrency(discountAllocations[index] / 100),
            tax: roundCurrency(taxAllocations[index] / 100),
            tip: roundCurrency(tipAllocations[index] / 100),
            total: roundCurrency(totalAllocations[index] / 100),
          },
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

  // If WooCommerce was reachable but every single order failed, surface it as an error
  // rather than silently returning fallback IDs that look like success.
  if (wcReady && orderResults.every(o => !o.wooOrderId)) {
    console.error('[complete-order] All WooCommerce order creations failed. Check WC_URL and credentials.');
    return res.status(502).json({ error: 'Orders could not be created in WooCommerce. Payment was captured — contact support with your email.' });
  }

  return res.json({ success: true, orders: orderResults });
}
