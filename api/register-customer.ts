/**
 * api/register-customer.ts
 *
 * Creates a new WordPress / WooCommerce customer account.
 * Returns the customer profile + signed session token on success.
 */
import crypto from 'node:crypto';

const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

async function subscribeToMailchimp(email: string, firstName?: string): Promise<void> {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim();
  const listId = process.env.MAILCHIMP_LIST_ID?.trim();
  if (!apiKey || !listId) return;
  const dc = apiKey.split('-').pop();
  const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  try {
    await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${hash}`, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status_if_new: 'subscribed',
        merge_fields: firstName ? { FNAME: firstName } : {},
        tags: ['knwn-customer'],
      }),
    });
  } catch (err) {
    console.error('[mailchimp] subscribe failed:', err);
  }
}

function signToken(email: string, secret: string): string {
  const ts = Date.now();
  const sig = crypto.createHmac('sha256', secret).update(`${email}:${ts}`).digest('hex');
  return `${ts}.${sig}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const wcUrl = process.env.WC_URL?.trim();
  const wcCk  = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs  = process.env.WC_CONSUMER_SECRET?.trim();

  if (!wcUrl || !wcCk || !wcCs) {
    return res.status(500).json({ error: 'Store not configured' });
  }

  const emailPrefix = String(email).split('@')[0] || 'Customer';
  const firstName = emailPrefix.slice(0, 1).toUpperCase() + emailPrefix.slice(1);

  const authHeader = `Basic ${Buffer.from(`${wcCk}:${wcCs}`).toString('base64')}`;

  try {
    // Check if email already exists
    const existingRes = await fetch(
      `${wcUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}&per_page=1`,
      { headers: { Authorization: authHeader } }
    );
    const existingRaw = await existingRes.text();
    let existing: any[];
    try {
      existing = JSON.parse(existingRaw);
    } catch {
      console.error('[register-customer] check-existing non-JSON response (status', existingRes.status, '):', existingRaw.slice(0, 500));
      return res.status(502).json({ error: 'Store API is unreachable. Please try again later.' });
    }
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({ error: 'An account already exists for this email' });
    }

    // Create the WooCommerce customer (also creates the WordPress user)
    const createRes = await fetch(`${wcUrl}/wp-json/wc/v3/customers`, {
      method:  'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        username: email,
        password,
        first_name: firstName,
        last_name:  '',
        billing: {
          first_name: firstName,
          last_name:  '',
          email,
          phone:      '',
          address_1:  '',
          city:       '',
          state:      'FL',
          postcode:   '',
          country:    'US',
        },
        shipping: {
          first_name: firstName,
          last_name:  '',
          address_1:  '',
          city:       '',
          state:      'FL',
          postcode:   '',
          country:    'US',
        },
      }),
    });

    const createRaw = await createRes.text();
    let data: any;
    try {
      data = JSON.parse(createRaw);
    } catch {
      console.error('[register-customer] create non-JSON response (status', createRes.status, '):', createRaw.slice(0, 500));
      return res.status(502).json({ error: 'Store API is unreachable. Please try again later.' });
    }
    if (!createRes.ok) {
      console.error('[register-customer] failed:', data);
      return res.status(502).json({ error: data.message || 'Failed to create account' });
    }

    const secret = process.env.AUTH_SESSION_SECRET || process.env.STRIPE_SECRET_KEY || wcCs!;

    // Fire-and-forget — don't block the response
    subscribeToMailchimp(data.email || email, data.first_name || firstName);

    return res.json({
      wcCustomerId: data.id,
      name:   `${data.first_name || firstName}`.trim(),
      email:  data.email || email,
      phone:  data.billing?.phone   || '',
      street: data.billing?.address_1 || '',
      city:   data.billing?.city    || '',
      state:  data.billing?.state   || 'FL',
      zip:    data.billing?.postcode || '',
      _token: signToken(data.email || email, secret),
    });
  } catch (err) {
    console.error('[register-customer] exception:', err);
    return res.status(500).json({ error: 'Failed to create account' });
  }
}
