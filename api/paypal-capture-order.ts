/**
 * api/paypal-capture-order.ts
 *
 * Captures a PayPal order after the buyer approves in the popup.
 * Returns { success, transactionId, payer: { name, email, phone } }
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

  const { orderID } = req.body;
  const clientId     = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'PayPal is not configured on this server.' });
  }
  if (!orderID) return res.status(400).json({ error: 'orderID is required.' });

  const isLive  = process.env.PAYPAL_ENV === 'live';
  const baseUrl = isLive ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  try {
    const accessToken = await getPayPalAccessToken(clientId, clientSecret, baseUrl);

    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${accessToken}`,
      },
    });
    const captureData = await captureRes.json() as any;
    if (!captureRes.ok) throw new Error(captureData.message || 'PayPal capture failed');

    const payer    = captureData.payer;
    const capture  = captureData.purchase_units?.[0]?.payments?.captures?.[0];

    return res.json({
      success:       true,
      transactionId: capture?.id || orderID,
      payer: {
        name:  `${payer?.name?.given_name || ''} ${payer?.name?.surname || ''}`.trim(),
        email: payer?.email_address || '',
        phone: payer?.phone?.phone_number?.national_number || '',
      },
    });
  } catch (err: any) {
    console.error('[paypal-capture-order]', err.message);
    return res.status(500).json({ error: err.message || 'PayPal capture error' });
  }
}
