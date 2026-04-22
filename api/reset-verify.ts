export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, otp, newPassword } = req.body || {};
  if (!email || !otp || !newPassword) return res.status(400).json({ error: 'Missing fields' });

  const wcUrl = process.env.WC_URL?.trim();
  const wcCk  = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs  = process.env.WC_CONSUMER_SECRET?.trim();
  if (!wcUrl || !wcCk || !wcCs) return res.status(500).json({ error: 'Store not configured' });

  const auth = `Basic ${Buffer.from(`${wcCk}:${wcCs}`).toString('base64')}`;

  // Look up customer by email
  const searchRes = await fetch(
    `${wcUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}&per_page=1`,
    { headers: { Authorization: auth } }
  );
  const customers = await searchRes.json() as any[];
  if (!Array.isArray(customers) || customers.length === 0) {
    return res.status(400).json({ error: 'Invalid code' });
  }

  const customer = customers[0];
  const meta: any[] = customer.meta_data || [];
  const storedOtp    = meta.find((m: any) => m.key === 'knwn_reset_otp')?.value;
  const storedExpiry = meta.find((m: any) => m.key === 'knwn_reset_expiry')?.value;

  if (!storedOtp || storedOtp !== String(otp)) {
    return res.status(400).json({ error: 'Invalid code' });
  }
  if (!storedExpiry || Date.now() > Number(storedExpiry)) {
    return res.status(400).json({ error: 'Code expired — request a new one' });
  }

  // Update password and clear OTP
  const updateRes = await fetch(`${wcUrl}/wp-json/wc/v3/customers/${customer.id}`, {
    method: 'PUT',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password: newPassword,
      meta_data: [
        { key: 'knwn_reset_otp',    value: '' },
        { key: 'knwn_reset_expiry', value: '' },
      ],
    }),
  });

  if (!updateRes.ok) return res.status(500).json({ error: 'Failed to update password' });

  return res.json({ success: true });
}
