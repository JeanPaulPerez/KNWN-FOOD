/**
 * api/create-payment-intent.ts
 *
 * Creates a Stripe PaymentIntent for the given amount.
 * Called ONLY when the order total is > $0.
 * Returns a clientSecret that the frontend uses with Stripe Elements
 * to confirm the card payment client-side.
 *
 * NOTE: This endpoint is intentionally NOT called when a 100% discount
 * coupon (e.g. REALFOOD113) is applied — that flow bypasses Stripe entirely.
 */

/**
 * Uses direct fetch to Stripe's REST API instead of the SDK
 * to avoid serverless compatibility issues with stripe-node v20+.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amountInCents, customerEmail } = req.body;

  if (!amountInCents || typeof amountInCents !== 'number' || amountInCents <= 0) {
    return res.status(400).json({ error: 'A valid amount greater than $0 is required' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Payment system not configured' });
  }

  try {
    const params = new URLSearchParams({
      amount: String(Math.round(amountInCents)),
      currency: 'usd',
      'automatic_payment_methods[enabled]': 'true',
      'metadata[source]': 'knwn-food-headless',
    });
    if (customerEmail) params.set('receipt_email', customerEmail);

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json() as any;
    if (!response.ok) {
      console.error('[Stripe] Error:', data);
      return res.status(500).json({ error: data.error?.message || 'Failed to initialize payment' });
    }

    return res.json({ clientSecret: data.client_secret });
  } catch (err: any) {
    console.error('[Stripe] Fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to connect to payment system' });
  }
}
