/**
 * api/login-customer.ts
 *
 * Authenticates a customer against WordPress using the standard wp-login flow,
 * then returns their WooCommerce profile as plain JSON.
 * Session is persisted client-side via useUser (localStorage).
 */

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
  // Step 1: GET wp-login.php to receive the real test cookie WordPress sets
  let testCookieHeader = 'wordpress_test_cookie=WP%20Cookie%20check';
  try {
    const getRes = await fetch(`${wcUrl}/wp-login.php`, {
      method: 'GET',
      redirect: 'manual',
    });
    const getCookies: string =
      typeof (getRes.headers as any).getSetCookie === 'function'
        ? (getRes.headers as any).getSetCookie().join('; ')
        : (getRes.headers.get('set-cookie') ?? '');
    const match = getCookies.match(/wordpress_test_cookie=([^;,\s]+)/);
    if (match) testCookieHeader = `wordpress_test_cookie=${match[1]}`;
  } catch {
    // non-fatal — proceed with the default value
  }

  // Step 2: POST login form
  const response = await fetch(`${wcUrl}/wp-login.php`, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: testCookieHeader,
    },
    body: buildWordPressLoginBody(email, password, wcUrl),
  });

  // Node 18+ exposes getSetCookie() for multiple Set-Cookie headers; fall back to get()
  const allCookies: string =
    typeof (response.headers as any).getSetCookie === 'function'
      ? (response.headers as any).getSetCookie().join('; ')
      : (response.headers.get('set-cookie') ?? '');

  const location = response.headers.get('location') ?? '';

  console.log('[login] wp-login status:', response.status);
  console.log('[login] location:', location);
  console.log('[login] set-cookie snippet:', allCookies.slice(0, 300));

  // Successful login always sets the wordpress_logged_in_* cookie
  if (allCookies.includes('wordpress_logged_in_')) return true;

  // Successful login redirects AWAY from wp-login.php.
  // Subscriber-level customers go to the front page or /my-account/, NOT /wp-admin/,
  // so we only require that WordPress didn't bounce us back to the login page.
  if (response.status >= 300 && response.status < 400 && !location.includes('wp-login.php')) {
    return true;
  }

  console.log('[login] authentication failed — neither logged_in cookie nor clean redirect');
  return false;
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
    return res.json({
      wcCustomerId: c.id,
      name:   `${c.first_name} ${c.last_name}`.trim(),
      email:  c.email,
      phone:  c.billing?.phone   || '',
      street: c.billing?.address_1 || '',
      city:   c.billing?.city    || '',
      state:  c.billing?.state   || 'FL',
      zip:    c.billing?.postcode || '',
    });
  } catch (err) {
    console.error('[login-customer] exception:', err);
    return res.status(500).json({ error: 'Failed to fetch customer profile' });
  }
}
