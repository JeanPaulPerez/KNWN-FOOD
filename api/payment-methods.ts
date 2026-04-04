/**
 * api/payment-methods.ts
 *
 * GET  ?email=... → list saved cards for the Stripe customer
 * DELETE {paymentMethodId} → detach (remove) a saved card
 */

async function getStripeCustomerId(secretKey: string, email: string): Promise<string | null> {
  const res = await fetch(
    `https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=1`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );
  const data = await res.json() as any;
  return data.data?.[0]?.id ?? null;
}

export default async function handler(req: any, res: any) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return res.status(500).json({ error: 'Payment system not configured' });

  // LIST payment methods
  if (req.method === 'GET') {
    const email = req.query?.email as string;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
      const customerId = await getStripeCustomerId(secretKey, email);
      if (!customerId) return res.json({ paymentMethods: [] });

      const pmRes = await fetch(
        `https://api.stripe.com/v1/customers/${customerId}/payment_methods?type=card&limit=20`,
        { headers: { Authorization: `Bearer ${secretKey}` } }
      );
      const pmData = await pmRes.json() as any;

      if (!pmRes.ok) {
        return res.status(500).json({ error: pmData.error?.message || 'Failed to load payment methods' });
      }

      const paymentMethods = (pmData.data || []).map((pm: any) => ({
        id:      pm.id,
        brand:   pm.card.brand,
        last4:   pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear:  pm.card.exp_year,
      }));

      return res.json({ paymentMethods });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to load payment methods' });
    }
  }

  // DELETE (detach) a payment method
  if (req.method === 'DELETE') {
    const { paymentMethodId } = req.body || {};
    if (!paymentMethodId) return res.status(400).json({ error: 'paymentMethodId is required' });

    try {
      const detachRes = await fetch(
        `https://api.stripe.com/v1/payment_methods/${paymentMethodId}/detach`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${secretKey}` },
        }
      );
      const detachData = await detachRes.json() as any;

      if (!detachRes.ok) {
        return res.status(500).json({ error: detachData.error?.message || 'Failed to remove card' });
      }

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to remove card' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
