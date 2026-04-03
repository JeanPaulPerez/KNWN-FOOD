/**
 * api/save-customer.ts
 *
 * Creates or updates a WooCommerce customer by email.
 * Called when the user saves their profile in the ProfileModal.
 *
 * Returns: { wcCustomerId: number }
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, street, city, zip } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const wcUrl = process.env.WC_URL?.trim();
  const wcCk  = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs  = process.env.WC_CONSUMER_SECRET?.trim();

  if (!wcUrl || !wcCk || !wcCs) {
    return res.status(500).json({ error: 'WooCommerce not configured' });
  }

  const firstName = name?.split(' ')[0] || '';
  const lastName  = name?.split(' ').slice(1).join(' ') || '';

  const customerPayload = {
    email,
    first_name: firstName,
    last_name:  lastName,
    billing: {
      first_name: firstName,
      last_name:  lastName,
      email,
      phone:      phone || '',
      address_1:  street || '',
      city:       city || 'Miami',
      state:      'FL',
      postcode:   zip || '',
      country:    'US',
    },
    shipping: {
      first_name: firstName,
      last_name:  lastName,
      address_1:  street || '',
      city:       city || 'Miami',
      state:      'FL',
      postcode:   zip || '',
      country:    'US',
    },
  };

  const authHeader = `Basic ${Buffer.from(`${wcCk}:${wcCs}`).toString('base64')}`;

  try {
    // Check if customer already exists by email
    const searchRes = await fetch(
      `${wcUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: authHeader } }
    );
    const existing = await searchRes.json() as any[];

    if (Array.isArray(existing) && existing.length > 0) {
      // Update existing customer
      const customerId = existing[0].id;
      const updateRes = await fetch(
        `${wcUrl}/wp-json/wc/v3/customers/${customerId}`,
        {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: authHeader },
          body:    JSON.stringify(customerPayload),
        }
      );
      if (!updateRes.ok) {
        const err = await updateRes.json();
        console.error('[save-customer] Update failed:', err);
        return res.status(502).json({ error: 'Failed to update customer' });
      }
      return res.json({ wcCustomerId: customerId });
    }

    // Create new customer
    const createRes = await fetch(
      `${wcUrl}/wp-json/wc/v3/customers`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
        body:    JSON.stringify({ ...customerPayload, username: email, password: Math.random().toString(36).slice(-10) }),
      }
    );
    if (!createRes.ok) {
      const err = await createRes.json();
      console.error('[save-customer] Create failed:', err);
      // If email already exists (race condition), just return 0 — not fatal
      return res.json({ wcCustomerId: 0 });
    }
    const created = await createRes.json() as any;
    return res.json({ wcCustomerId: created.id });
  } catch (err) {
    console.error('[save-customer] Exception:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
