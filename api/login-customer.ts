/**
 * api/login-customer.ts
 *
 * Authenticates a customer against WordPress using the standard wp-login flow,
 * then returns their WooCommerce profile and creates the headless session cookie.
 */
import { buildSessionCookie, createSessionToken, SessionUser } from '../lib/authSession';

function buildWordPressLoginBody(email: string, password: string, wcUrl: string) {
  return new URLSearchParams({
    log: email,
    pwd: password,
    'wp-submit': 'Log In',
    redirect_to: `${wcUrl}/wp-admin/`,
    testcookie: '1',
    rememberme: 'forever',
  }).toString();
}

async function authenticateWithWordPress(wcUrl: string, email: string, password: string) {
  const response = await fetch(`${wcUrl}/wp-login.php`, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: 'wordpress_test_cookie=WP Cookie check',
    },
    body: buildWordPressLoginBody(email, password, wcUrl),
  });

  const setCookie = response.headers.get('set-cookie') || '';
  const location = response.headers.get('location') || '';
  const loggedInCookiePresent = setCookie.includes('wordpress_logged_in_');
  const redirectedToAdmin = response.status >= 300 && response.status < 400 && /wp-admin/i.test(location);

  return loggedInCookiePresent || redirectedToAdmin;
}

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

  try {
    const authenticated = await authenticateWithWordPress(wcUrl, email, password);
    if (!authenticated) {
      return res.status(401).json({ error: 'Email or password incorrect' });
    }
  } catch {
    return res.status(500).json({ error: 'Could not reach the store' });
  }

  // Step 2 — fetch WooCommerce customer profile using admin credentials
  const adminAuth = Buffer.from(`${wcCk}:${wcCs}`).toString('base64');
  try {
    const searchRes = await fetch(
      `${wcUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}&per_page=1`,
      { headers: { Authorization: `Basic ${adminAuth}` } }
    );
    const customers = (await searchRes.json()) as any[];
    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(404).json({ error: 'No customer account found for this email' });
    }
    const c = customers[0];
    const user: SessionUser = {
      wcCustomerId: c.id,
      name: `${c.first_name} ${c.last_name}`.trim(),
      email: c.email,
      phone: c.billing?.phone || '',
      street: c.billing?.address_1 || '',
      city: c.billing?.city || '',
      state: c.billing?.state || 'FL',
      zip:    c.billing?.postcode || '',
    };

    res.setHeader('Set-Cookie', buildSessionCookie(createSessionToken(user)));
    return res.json(user);
  } catch (err) {
    console.error('[login-customer] exception:', err);
    return res.status(500).json({ error: 'Failed to fetch customer profile' });
  }
}
