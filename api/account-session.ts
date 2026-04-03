import { clearSessionCookie, getSessionUserFromRequest } from '../lib/authSession';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const user = getSessionUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: 'No active session' });
    }

    return res.status(200).json({ user });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearSessionCookie());
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
