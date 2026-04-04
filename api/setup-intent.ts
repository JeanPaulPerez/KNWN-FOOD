/**
 * api/setup-intent.ts
 *
 * Creates a Stripe SetupIntent so the frontend can securely save a card
 * without charging it. Finds or creates a Stripe Customer by email.
 */

async function findOrCreateStripeCustomer(secretKey: string, email: string, name: string): Promise<string> {
  // Search existing customer by email
  const searchRes = await fetch(
    `https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=1`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );
  const searchData = await searchRes.json() as any;

  if (searchData.data?.length > 0) {
    return searchData.data[0].id as string;
  }

  // Create new Stripe customer
  const params = new URLSearchParams({ email });
  if (name) params.set('name', name);

  const createRes = await fetch('https://api.stripe.com/v1/customers', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  const created = await createRes.json() as any;
  if (!createRes.ok) throw new Error(created.error?.message || 'Failed to create Stripe customer');
  return created.id as string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return res.status(500).json({ error: 'Payment system not configured' });

  try {
    const customerId = await findOrCreateStripeCustomer(secretKey, email, name || '');

    const params = new URLSearchParams({
      customer: customerId,
      'payment_method_types[]': 'card',
      'metadata[source]': 'knwn-food-account',
    });

    const siRes = await fetch('https://api.stripe.com/v1/setup_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const siData = await siRes.json() as any;

    if (!siRes.ok) {
      return res.status(500).json({ error: siData.error?.message || 'Failed to create setup intent' });
    }

    return res.json({ clientSecret: siData.client_secret, customerId });
  } catch (err: any) {
    console.error('[setup-intent]', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
