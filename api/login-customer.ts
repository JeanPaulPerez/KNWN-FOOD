/**
 * api/login-customer.ts
 *
 * Authenticates a customer against WordPress using Basic Auth,
 * then fetches their WooCommerce profile (name, email, phone, address).
 *
 * WordPress 5.6+ supports Application Passwords for REST API auth.
 * Alternatively install the "JSON Basic Authentication" plugin for WP.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const wcUrl = process.env.WC_URL?.trim();
  const wcCk  = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs  = process.env.WC_CONSUMER_SECRET?.trim();

  if (!wcUrl || !wcCk || !wcCs) {
    return res.status(500).json({ error: 'Store not configured' });
  }

  // Step 1 — verify credentials against WordPress REST API
  const userAuth = Buffer.from(`${email}:${password}`).toString('base64');
  try {
    const meRes = await fetch(`${wcUrl}/wp-json/wp/v2/users/me`, {
      headers: { Authorization: `Basic ${userAuth}` },
    });
    if (!meRes.ok) {
      return res.status(401).json({ error: 'Email or password incorrect' });
    }
  } catch {
    return res.status(500).json({ error: 'Could not reach the store' });
  }

  // Step 2 — fetch WooCommerce customer profile (using admin credentials)
  const adminAuth = Buffer.from(`${wcCk}:${wcCs}`).toString('base64');
  try {
    const searchRes = await fetch(
      `${wcUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}&per_page=1`,
      { headers: { Authorization: `Basic ${adminAuth}` } }
    );
    const customers = await searchRes.json() as any[];
    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(404).json({ error: 'No customer account found for this email' });
    }
    const c = customers[0];
    return res.json({
      wcCustomerId: c.id,
      name:  `${c.first_name} ${c.last_name}`.trim(),
      email: c.email,
      phone: c.billing?.phone || '',
      street: c.billing?.address_1 || '',
      city:   c.billing?.city || '',
      zip:    c.billing?.postcode || '',
    });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch customer profile' });
  }
}
