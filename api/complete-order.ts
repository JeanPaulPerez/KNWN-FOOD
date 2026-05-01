import crypto from 'node:crypto';

const DELIVERY_WINDOW_LABEL = '10:00 AM - 12:00 PM';

// ─── Upstash Redis helper (REST API, no SDK needed) ───────────────────────────
async function upstash(command: any[]): Promise<any> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(url, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(command),
    });
    return res.json();
  } catch (err) {
    console.error('[upstash] error:', err);
    return null;
  }
}

async function saveRepeatSubscription(
  stripeCustomerId: string,
  paymentMethodId: string,
  customerInfo: any,
  items: any[],
  pricing: any,
): Promise<void> {
  const id  = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const key = `subscription:${id}`;
  const data = {
    id,
    active: true,
    createdAt: new Date().toISOString(),
    stripeCustomerId,
    paymentMethodId,
    customerInfo: {
      name:                customerInfo.name || '',
      email:               customerInfo.email || '',
      phone:               customerInfo.phone || '',
      street:              customerInfo.street || '',
      address2:            customerInfo.address2 || '',
      city:                customerInfo.city || '',
      state:               customerInfo.state || '',
      zip:                 customerInfo.zip || '',
      deliveryInstructions: customerInfo.deliveryInstructions || '',
      wcCustomerId:        customerInfo.wcCustomerId,
    },
    // Store serviceDay (e.g. "monday") so the cron can compute next week's dates
    items: items.map((item: any) => ({
      _wooProductId:  item._wooProductId || item.product_id || 0,
      name:           item.name || '',
      quantity:       item.quantity || 1,
      price:          item.price || 0,
      serviceDay:     (item.serviceDate || '').split(',')[0].trim().toLowerCase(),
      customizations: item.customizations || null,
    })),
    pricing: {
      subtotal: pricing?.subtotal ?? 0,
      tax:      pricing?.tax      ?? 0,
      tip:      pricing?.tip      ?? 0,
      total:    pricing?.total    ?? 0,
    },
  };
  await upstash(['SET', key, JSON.stringify(data)]);
  await upstash(['SADD', 'subscriptions:active', id]);
  console.log('[repeat-order] Subscription saved:', id);
}

async function subscribeToMailchimp(email: string, phone?: string, name?: string): Promise<void> {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim();
  const listId = process.env.MAILCHIMP_LIST_ID?.trim();
  if (!apiKey || !listId) return;
  const dc = apiKey.split('-').pop();
  const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  const authHeader = `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`;
  const memberUrl = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${hash}`;

  // Normalize to E.164 — only valid if exactly 10 US digits
  const digits = phone ? phone.replace(/\D/g, '').replace(/^1/, '') : '';
  const smsPhone = digits.length === 10 ? `+1${digits}` : undefined;

  try {
    const [firstName, ...rest] = (name || '').split(' ');

    // ── Step 1: PUT — upsert email subscription ───────────────────────────────
    const putRes = await fetch(memberUrl, {
      method: 'PUT',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_address: email,
        status_if_new: 'subscribed',
        status: 'subscribed',
        merge_fields: {
          ...(firstName ? { FNAME: firstName } : {}),
          ...(rest.length ? { LNAME: rest.join(' ') } : {}),
          ...(phone ? { PHONE: phone } : {}),
        },
      }),
    });
    const putData = await putRes.json();
    if (!putRes.ok) {
      console.error('[mailchimp] PUT error:', JSON.stringify(putData));
    } else {
      console.log('[mailchimp] PUT success — email:', email, '| status:', putData.status, '| email_marketing_status:', putData.email_marketing_status);
    }

    // ── Step 2: PATCH — set SMS phone + opt-in (pending triggers confirmation text) ─
    if (smsPhone) {
      const patchRes = await fetch(memberUrl, {
        method: 'PATCH',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sms_phone_number: smsPhone,
          sms_marketing_status: 'pending',
        }),
      });
      const patchData = await patchRes.json();
      if (!patchRes.ok) {
        console.error('[mailchimp] PATCH SMS error:', JSON.stringify(patchData));
      } else {
        console.log('[mailchimp] SMS pending — phone:', smsPhone, '| sms_marketing_status:', patchData.sms_marketing_status, '| sms_phone_number:', patchData.sms_phone_number);
      }
    }

    // ── Step 3: POST — add tags via the tags endpoint (PUT body ignores tags) ──
    await fetch(`${memberUrl}/tags`, {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tags: [
          { name: 'knwn-customer', status: 'active' },
          { name: 'placed-order', status: 'active' },
          { name: 'marketing-optin', status: 'active' },
        ],
      }),
    });
  } catch (err) {
    console.error('[mailchimp] subscribe failed:', err);
  }
}

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
// Only keys shown here appear in WooCommerce order emails (line item meta).
// 'Fecha de Servicio' is stored in order-level meta_data (not here) so the
// PHP export snippet can still read it without it appearing in the email.
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
    // 'Delivery date' is the only date field shown in the email
    meta.push({ key: 'Delivery date', value: formatServiceDateForExport(item.serviceDate) });
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
  paymentProvider: string,
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
    payment_method: isFree ? 'free_coupon' : paymentProvider === 'paypal' ? 'paypal' : 'stripe',
    payment_method_title: isFree ? 'Free (100% Promo)' : paymentProvider === 'paypal' ? 'PayPal' : 'Credit Card (Stripe)',
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
    // Coupon applied to each order so WooCommerce shows the correct discounted total.
    // Skip for isFree orders — the free coupon code only exists in our API, not in WooCommerce.
    coupon_lines: (couponCode && !isFree) ? [{ code: couponCode }] : [],
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
      `${wcUrl}/wp-json/wc/v3/orders`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${Buffer.from(`${wcCk}:${wcCs}`).toString('base64')}` },
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

// ─── Repeat-order cron helpers ───────────────────────────────────────────────

const DAY_OFFSETS: Record<string, number> = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4 };

function getNextWeekDate(serviceDay: string): string {
  const offset = DAY_OFFSETS[serviceDay.toLowerCase()] ?? 0;
  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + 1); // Sunday → Monday
  nextMonday.setHours(12, 0, 0, 0);
  const target = new Date(nextMonday);
  target.setDate(nextMonday.getDate() + offset);
  return target.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function toExportDate(dateStr: string): string {
  const cleaned = dateStr.replace(/^[A-Za-z]+,\s*/, '');
  const d = new Date(`${cleaned} ${new Date().getFullYear()}`);
  if (isNaN(d.getTime())) return dateStr;
  return `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}-${String(d.getFullYear()).slice(-2)}`;
}

function toTycheDate(dateStr: string): string {
  const cleaned = dateStr.replace(/^[A-Za-z]+,\s*/, '');
  const d = new Date(`${cleaned} ${new Date().getFullYear()}`);
  if (isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

async function sendRepeatConfirmationEmail(to: string, name: string, items: any[], pricing: any, serviceDates: string[]): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'orders@knwnfood.com';
  if (!resendKey) return;
  const firstName = name.split(' ')[0];
  const itemsHtml = items.map(i => `<li style="margin-bottom:4px;">${i.name} × ${i.quantity} — <strong>$${Number(i.price).toFixed(2)}</strong></li>`).join('');
  const datesText = [...new Set(serviceDates)].join(', ');
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `KNWN Food <${fromEmail}>`,
      to,
      subject: 'Your weekly KNWN order is confirmed! 🎉',
      html: `<div style="font-family:Poppins,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f5f3ff;border-radius:16px;"><h2 style="color:#2B1C70;margin:0 0 8px;">Hey ${firstName}! 👋</h2><p style="color:#444;line-height:1.6;margin:0 0 20px;">Your weekly repeat order has been charged and confirmed. Here's what's on its way:</p><ul style="color:#2B1C70;line-height:2;padding-left:20px;">${itemsHtml}</ul><p style="color:#444;margin:16px 0 4px;">📅 Delivery dates: <strong>${datesText}</strong></p><p style="color:#444;margin:0 0 24px;">💳 Total charged: <strong>$${Number(pricing.total).toFixed(2)}</strong></p><hr style="border:none;border-top:1px solid #ddd9ed;margin:0 0 20px;" /><p style="color:#888;font-size:13px;margin:0;">Deliveries arrive 10 AM – 12 PM. To pause or cancel, email <a href="mailto:hello@knwnfood.com" style="color:#2B1C70;">hello@knwnfood.com</a>.</p></div>`,
    }),
  });
}

async function runRepeatOrderCron(req: any, res: any): Promise<any> {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const wcUrl = process.env.WC_URL?.trim();
  const wcCk  = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs  = process.env.WC_CONSUMER_SECRET?.trim();
  if (!secretKey || !wcUrl || !wcCk || !wcCs) return res.status(500).json({ error: 'Missing env vars' });
  const wcAuth = Buffer.from(`${wcCk}:${wcCs}`).toString('base64');

  const smResult = await upstash(['SMEMBERS', 'subscriptions:active']);
  const subIds: string[] = smResult?.result || [];
  console.log(`[repeat-cron] Processing ${subIds.length} subscription(s)`);
  const results = { processed: subIds.length, success: 0, failed: 0, errors: [] as string[] };

  for (const id of subIds) {
    try {
      const getResult = await upstash(['GET', `subscription:${id}`]);
      if (!getResult?.result) continue;
      const sub = JSON.parse(getResult.result);
      if (!sub.active) continue;
      const { stripeCustomerId, paymentMethodId, customerInfo, items, pricing } = sub;

      const itemsWithDates = items.map((item: any) => ({ ...item, serviceDate: getNextWeekDate(item.serviceDay) }));

      const chargeParams = new URLSearchParams({
        amount: String(Math.round((Number(pricing.total) || 0) * 100)),
        currency: 'usd', customer: stripeCustomerId, payment_method: paymentMethodId,
        confirm: 'true', off_session: 'true',
        'metadata[source]': 'knwn-repeat-order', 'metadata[subscription_id]': id,
      });
      const chargeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: chargeParams.toString(),
      });
      const charge = await chargeRes.json() as any;
      if (!chargeRes.ok || charge.status !== 'succeeded') {
        const errMsg = charge.error?.message || `status=${charge.status}`;
        console.error(`[repeat-cron] Charge failed for ${id}:`, errMsg);
        results.failed++; results.errors.push(`${id}: ${errMsg}`); continue;
      }

      const serviceDates: string[] = [];
      for (const item of itemsWithDates) {
        serviceDates.push(item.serviceDate);
        const itemMeta: any[] = [];
        if (item.customizations?.base)         itemMeta.push({ key: 'Choose your base',           value: item.customizations.base });
        if (item.customizations?.sauce)        itemMeta.push({ key: 'Choose your dressing/sauce', value: item.customizations.sauce });
        if (item.customizations?.protein)      itemMeta.push({ key: 'Protein',                    value: item.customizations.protein });
        if (item.customizations?.avoid)        itemMeta.push({ key: "Anything you don't like?",   value: item.customizations.avoid });
        if (item.customizations?.isVegetarian) itemMeta.push({ key: 'Make it vegetarian?',        value: 'TRUE' });
        itemMeta.push({ key: 'Delivery date', value: toExportDate(item.serviceDate) });
        await fetch(`${wcUrl}/wp-json/wc/v3/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Basic ${wcAuth}` },
          body: JSON.stringify({
            status: 'processing', set_paid: true,
            ...(customerInfo.wcCustomerId ? { customer_id: customerInfo.wcCustomerId } : {}),
            payment_method: 'stripe', payment_method_title: 'Credit Card (Stripe) — Repeat Order',
            transaction_id: charge.id,
            billing:  { first_name: customerInfo.name?.split(' ')[0]||'', last_name: customerInfo.name?.split(' ').slice(1).join(' ')||'', address_1: customerInfo.street||'', address_2: customerInfo.address2||'', city: customerInfo.city||'Miami', state: customerInfo.state||'FL', postcode: customerInfo.zip||'', country: 'US', email: customerInfo.email||'', phone: customerInfo.phone||'' },
            shipping: { first_name: customerInfo.name?.split(' ')[0]||'', last_name: customerInfo.name?.split(' ').slice(1).join(' ')||'', address_1: customerInfo.street||'', address_2: customerInfo.address2||'', city: customerInfo.city||'Miami', state: customerInfo.state||'FL', postcode: customerInfo.zip||'', country: 'US' },
            line_items: [{ product_id: item._wooProductId || 0, quantity: item.quantity, meta_data: itemMeta }],
            customer_note: customerInfo.deliveryInstructions || '',
            meta_data: [
              { key: 'order_source',          value: 'knwn-repeat-order' },
              { key: 'stripe_payment_intent', value: charge.id },
              { key: 'subscription_id',       value: id },
              { key: 'e_deliverydate',        value: toTycheDate(item.serviceDate) },
              { key: 'delivery_date',         value: item.serviceDate },
              { key: 'service_date_display',  value: item.serviceDate },
              { key: 'service_date_export',   value: toExportDate(item.serviceDate) },
              { key: 'Delivery date',         value: toExportDate(item.serviceDate) },
              { key: 'delivery_time_window',  value: DELIVERY_WINDOW_LABEL },
              { key: 'Delivery Time',         value: DELIVERY_WINDOW_LABEL },
            ],
          }),
        });
      }
      await sendRepeatConfirmationEmail(customerInfo.email, customerInfo.name, items, pricing, serviceDates);
      await upstash(['SET', `subscription:${id}`, JSON.stringify({ ...sub, lastCharged: new Date().toISOString() })]);
      results.success++;
    } catch (err: any) {
      results.failed++; results.errors.push(`${id}: ${err.message}`);
      console.error(`[repeat-cron] Error for ${id}:`, err.message);
    }
  }
  return res.json(results);
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req: any, res: any) {
  // Vercel Cron entry point — runs every Sunday 17:00 UTC (12 PM EST)
  if (req.query?.cron === '1' || req.url?.includes('cron=1')) {
    return runRepeatOrderCron(req, res);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, customerInfo, couponCode, paymentIntentId, paymentProvider = 'stripe', isFree, pricing, marketingOptIn, repeatOrder, stripeCustomerId } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  // ── PAID FLOW: Verify payment ONCE before creating any orders ───────────────
  if (!isFree) {
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment confirmation is required' });
    }

    if (paymentProvider === 'paypal') {
      // PayPal was already captured server-side via /api/paypal-capture-order.
      // The capture is atomic — if it succeeded, the transaction is final.
      // No additional server-side verification needed here.
    } else {
      // Stripe: verify the PaymentIntent reached "succeeded"
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
          paymentProvider,
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

  // Subscribe to Mailchimp only if customer opted in
  if (marketingOptIn && customerInfo?.email) {
    await subscribeToMailchimp(customerInfo.email, customerInfo.phone, customerInfo.name);
  }

  // Save repeat subscription to Redis if customer opted in and payment was charged
  if (repeatOrder && !isFree && stripeCustomerId && paymentIntentId) {
    try {
      // Retrieve PaymentIntent to get the attached payment_method ID
      const piRes = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      });
      const pi = await piRes.json() as any;
      const paymentMethodId = typeof pi.payment_method === 'string' ? pi.payment_method : pi.payment_method?.id;
      if (paymentMethodId) {
        await saveRepeatSubscription(stripeCustomerId, paymentMethodId, customerInfo, items, pricing);
      } else {
        console.warn('[repeat-order] No payment_method on PI:', paymentIntentId);
      }
    } catch (err) {
      console.error('[repeat-order] Failed to save subscription:', err);
    }
  }

  // If WooCommerce was reachable but every single order failed, surface it as an error
  // rather than silently returning fallback IDs that look like success.
  if (wcReady && orderResults.every(o => !o.wooOrderId)) {
    console.error('[complete-order] All WooCommerce order creations failed. Check WC_URL and credentials.');
    return res.status(502).json({ error: 'Orders could not be created in WooCommerce. Payment was captured — contact support with your email.' });
  }

  return res.json({ success: true, orders: orderResults });
}
