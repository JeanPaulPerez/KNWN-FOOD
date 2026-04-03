/**
 * api/save-customer.ts
 *
 * Updates the authenticated WooCommerce customer profile and keeps the
 * headless account session in sync.
 */
import { buildSessionCookie, createSessionToken, getSessionUserFromRequest, SessionUser } from '../lib/authSession';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionUser = getSessionUserFromRequest(req);
  if (!sessionUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { name, email, phone, street, city, state, zip } = req.body || {};
  const targetEmail = email || sessionUser.email;

  if (!targetEmail) {
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
    email: targetEmail,
    first_name: firstName,
    last_name:  lastName,
    billing: {
      first_name: firstName,
      last_name:  lastName,
      email: targetEmail,
      phone:      phone || '',
      address_1:  street || '',
      city:       city || 'Miami',
      state:      state || sessionUser.state || 'FL',
      postcode:   zip || '',
      country:    'US',
    },
    shipping: {
      first_name: firstName,
      last_name:  lastName,
      address_1:  street || '',
      city:       city || 'Miami',
      state:      state || sessionUser.state || 'FL',
      postcode:   zip || '',
      country:    'US',
    },
  };

  const authHeader = `Basic ${Buffer.from(`${wcCk}:${wcCs}`).toString('base64')}`;

  try {
    let customerId = sessionUser.wcCustomerId || 0;

    if (!customerId) {
      const searchRes = await fetch(
        `${wcUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(sessionUser.email)}&per_page=1`,
        { headers: { Authorization: authHeader } }
      );
      const existing = await searchRes.json() as any[];
      if (Array.isArray(existing) && existing.length > 0) {
        customerId = existing[0].id;
      }
    }

    if (customerId) {
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
      const updated = await updateRes.json() as any;
      const user: SessionUser = {
        wcCustomerId: customerId,
        name: `${updated.first_name || firstName} ${updated.last_name || lastName}`.trim(),
        email: updated.email || targetEmail,
        phone: updated.billing?.phone || phone || '',
        street: updated.billing?.address_1 || street || '',
        city: updated.billing?.city || city || '',
        state: updated.billing?.state || state || sessionUser.state || 'FL',
        zip: updated.billing?.postcode || zip || '',
      };
      res.setHeader('Set-Cookie', buildSessionCookie(createSessionToken(user)));
      return res.json(user);
    }

    return res.status(404).json({ error: 'Customer account not found' });
  } catch (err) {
    console.error('[save-customer] Exception:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
