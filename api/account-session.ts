/**
 * api/account-session.ts
 *
 * Lightweight session endpoint.
 * Session state is managed client-side via useUser (localStorage).
 * GET  → 401 (no server-side session cookie)
 * DELETE → 200 (client handles state cleanup)
 */
export default async function handler(req: any, res: any) {
  if (req.method === 'DELETE') {
    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    return res.status(401).json({ error: 'No active session' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
