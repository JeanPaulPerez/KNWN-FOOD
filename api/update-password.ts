/**
 * api/update-password.ts
 *
 * Updates a customer's password directly via WooCommerce REST API.
 * No email verification — looks up customer by email and sets new password.
 */

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, newPassword } = req.body || {};

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const wcUrl = process.env.WC_URL?.trim();
  const wcCk  = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs  = process.env.WC_CONSUMER_SECRET?.trim();

  if (!wcUrl || !wcCk || !wcCs) {
    return res.status(500).json({ error: 'Store not configured' });
  }

  const authHeader = `Basic ${Buffer.from(`${wcCk}:${wcCs}`).toString('base64')}`;

  try {
    // Find customer by email
    const searchRes = await fetch(
      `${wcUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}&per_page=1`,
      { headers: { Authorization: authHeader } }
    );
    const customers = (await searchRes.json()) as any[];

    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(404).json({ error: 'No account found for this email' });
    }

    const customerId = customers[0].id;

    // Update password via WooCommerce REST API
    const updateRes = await fetch(`${wcUrl}/wp-json/wc/v3/customers/${customerId}`, {
      method: 'PUT',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}));
      console.error('[update-password] failed:', errData);
      return res.status(502).json({ error: 'Failed to update password' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('[update-password] exception:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
