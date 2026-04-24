/**
 * api/create-payment-intent.ts
 *
 * Creates a Stripe PaymentIntent for the given amount.
 * When repeatOrder=true, also creates/retrieves a Stripe Customer and sets
 * setup_future_usage=off_session so the payment method is saved for weekly charges.
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amountInCents, customerEmail, repeatOrder } = req.body;

  if (!amountInCents || typeof amountInCents !== 'number' || amountInCents <= 0 || amountInCents > 50000_00) {
    return res.status(400).json({ error: 'A valid amount between $0 and $5,000 is required' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Payment system not configured' });
  }

  let stripeCustomerId: string | null = null;

  // For repeat orders: find or create a Stripe Customer so we can charge off-session later
  if (repeatOrder && customerEmail) {
    try {
      // Search for existing customer by email
      const searchRes = await fetch(
        `https://api.stripe.com/v1/customers/search?query=email:'${encodeURIComponent(customerEmail)}'&limit=1`,
        { headers: { Authorization: `Bearer ${secretKey}` } }
      );
      const searchData = await searchRes.json() as any;

      if (searchData.data?.length > 0) {
        stripeCustomerId = searchData.data[0].id;
      } else {
        const custParams = new URLSearchParams({
          email: customerEmail,
          'metadata[source]': 'knwn-repeat-order',
        });
        const custRes = await fetch('https://api.stripe.com/v1/customers', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: custParams.toString(),
        });
        const custData = await custRes.json() as any;
        stripeCustomerId = custData.id || null;
      }
    } catch (err: any) {
      console.error('[Stripe] Customer find/create error:', err.message);
      // Non-fatal: continue without saving payment method
    }
  }

  try {
    const params = new URLSearchParams({
      amount: String(Math.round(amountInCents)),
      currency: 'usd',
      'automatic_payment_methods[enabled]': 'true',
      'metadata[source]': 'knwn-food-headless',
    });
    if (customerEmail) params.set('receipt_email', customerEmail);
    if (stripeCustomerId) {
      params.set('customer', stripeCustomerId);
      params.set('setup_future_usage', 'off_session');
    }

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

    return res.json({
      clientSecret: data.client_secret,
      ...(stripeCustomerId ? { stripeCustomerId } : {}),
    });
  } catch (err: any) {
    console.error('[Stripe] Fetch error:', err.message);
    return res.status(500).json({ error: 'Failed to connect to payment system' });
  }
}
