import { buildSessionCookie, createSessionToken, SessionUser } from '../lib/authSession';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const wcUrl = process.env.WC_URL?.trim();
  const wcCk = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs = process.env.WC_CONSUMER_SECRET?.trim();

  if (!wcUrl || !wcCk || !wcCs) {
    return res.status(500).json({ error: 'Store not configured' });
  }

  const emailPrefix = String(email).split('@')[0] || 'Customer';
  const firstName = emailPrefix.slice(0, 1).toUpperCase() + emailPrefix.slice(1);
  const lastName = '';

  const authHeader = `Basic ${Buffer.from(`${wcCk}:${wcCs}`).toString('base64')}`;

  try {
    const existingRes = await fetch(`${wcUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}&per_page=1`, {
      headers: { Authorization: authHeader },
    });
    const existing = (await existingRes.json()) as any[];
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({ error: 'An account already exists for this email' });
    }

    const payload = {
      email,
      username: email,
      password,
      first_name: firstName,
      last_name: lastName,
      billing: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: '',
        address_1: '',
        city: '',
        state: 'FL',
        postcode: '',
        country: 'US',
      },
      shipping: {
        first_name: firstName,
        last_name: lastName,
        address_1: '',
        city: '',
        state: 'FL',
        postcode: '',
        country: 'US',
      },
    };

    const createRes = await fetch(`${wcUrl}/wp-json/wc/v3/customers`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await createRes.json();
    if (!createRes.ok) {
      console.error('[register-customer] failed:', data);
      return res.status(502).json({ error: data.message || 'Failed to create customer' });
    }

    const user: SessionUser = {
      wcCustomerId: data.id,
      name: `${data.first_name || firstName} ${data.last_name || lastName}`.trim(),
      email: data.email || email,
      phone: data.billing?.phone || '',
      street: data.billing?.address_1 || '',
      city: data.billing?.city || '',
      state: data.billing?.state || 'FL',
      zip: data.billing?.postcode || '',
    };

    res.setHeader('Set-Cookie', buildSessionCookie(createSessionToken(user)));
    return res.json(user);
  } catch (error) {
    console.error('[register-customer] exception:', error);
    return res.status(500).json({ error: 'Failed to create account' });
  }
}
