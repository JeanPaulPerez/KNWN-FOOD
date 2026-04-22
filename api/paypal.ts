/**
 * api/paypal.ts
 * Consolidates paypal-create-order and paypal-capture-order into one function.
 * Route by body.action: 'create' | 'capture'
 */

async function getPayPalAccessToken(clientId: string, clientSecret: string, baseUrl: string): Promise<string> {
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json() as any;
  if (!res.ok) throw new Error(data.error_description || 'PayPal auth failed');
  return data.access_token as string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, amountInCents, orderID } = req.body ?? {};
  const clientId     = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'PayPal is not configured on this server.' });
  }

  const isLive  = process.env.PAYPAL_ENV === 'live';
  const baseUrl = isLive ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  try {
    const accessToken = await getPayPalAccessToken(clientId, clientSecret, baseUrl);

    // ── Create order ──────────────────────────────────────────────────────────
    if (action === 'create') {
      if (!amountInCents || typeof amountInCents !== 'number' || amountInCents <= 0 || amountInCents > 5000000) {
        return res.status(400).json({ error: 'A valid amount between $0 and $5,000 is required.' });
      }
      const amount   = (amountInCents / 100).toFixed(2);
      const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{ amount: { currency_code: 'USD', value: amount } }],
        }),
      });
      const orderData = await orderRes.json() as any;
      if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create PayPal order');
      return res.json({ id: orderData.id });
    }

    // ── Capture order ─────────────────────────────────────────────────────────
    if (action === 'capture') {
      if (!orderID) return res.status(400).json({ error: 'orderID is required.' });
      const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      });
      const captureData = await captureRes.json() as any;
      if (!captureRes.ok) throw new Error(captureData.message || 'PayPal capture failed');
      const payer   = captureData.payer;
      const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
      return res.json({
        success:       true,
        transactionId: capture?.id || orderID,
        payer: {
          name:  `${payer?.name?.given_name || ''} ${payer?.name?.surname || ''}`.trim(),
          email: payer?.email_address || '',
          phone: payer?.phone?.phone_number?.national_number || '',
        },
      });
    }

    return res.status(400).json({ error: 'action must be "create" or "capture"' });
  } catch (err: any) {
    console.error('[paypal]', err.message);
    return res.status(500).json({ error: err.message || 'PayPal error' });
  }
}
