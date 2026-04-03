import crypto from 'crypto';

export type SessionUser = {
  wcCustomerId?: number;
  email: string;
  name: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
};

type SessionPayload = SessionUser & {
  exp: number;
};

const SESSION_COOKIE_NAME = 'knwn_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString('base64url');
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET || process.env.SESSION_SECRET || process.env.WC_CONSUMER_SECRET || process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error('Missing AUTH_SESSION_SECRET (or fallback server secret) for account sessions.');
  }
  return secret;
}

export function createSessionToken(data: Omit<SessionPayload, 'exp'>) {
  const payload: SessionPayload = {
    ...data,
    exp: Date.now() + SESSION_TTL_MS,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expected = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');

  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (!payload?.email || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getBearerToken(req: any) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice('Bearer '.length).trim();
}

export function buildSessionCookie(token: string) {
  const isSecure = process.env.NODE_ENV === 'production';

  return [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
    isSecure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function clearSessionCookie() {
  const isSecure = process.env.NODE_ENV === 'production';

  return [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    isSecure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export const buildLogoutCookie = clearSessionCookie;

export function getCookieToken(req: any) {
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader || typeof cookieHeader !== 'string') return null;

  const cookies = cookieHeader.split(';').reduce<Record<string, string>>((acc, cookiePart) => {
    const [name, ...valueParts] = cookiePart.trim().split('=');
    acc[name] = decodeURIComponent(valueParts.join('='));
    return acc;
  }, {});

  return cookies[SESSION_COOKIE_NAME] || null;
}

export function getSessionUserFromRequest(req: any): SessionUser | null {
  const cookieSession = verifySessionToken(getCookieToken(req));
  if (cookieSession) {
    const { exp: _exp, ...user } = cookieSession;
    return user;
  }

  const bearerSession = verifySessionToken(getBearerToken(req));
  if (!bearerSession) return null;
  const { exp: _exp, ...user } = bearerSession;
  return user;
}
