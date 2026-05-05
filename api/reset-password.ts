/**
 * api/reset-password.ts
 * Consolidates reset-request and reset-verify into one function.
 * Route by body.action: 'request' | 'verify'
 *
 * OTP is stored in a signed HMAC token returned to the client — no WC meta_data
 * needed, which avoids WC REST API unreliability for non-native WC users.
 */
import nodemailer from 'nodemailer';
import crypto from 'node:crypto';

function getSecret(wcCs: string): string {
  return process.env.RESET_JWT_SECRET?.trim() || `${wcCs}:knwn-reset`;
}

function signToken(payload: object, secret: string): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig   = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return `${data}.${sig}`;
}

function verifyToken(token: string, secret: string): any | null {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const data     = token.slice(0, dot);
  const sig      = token.slice(dot + 1);
  const expected = crypto.createHmac('sha256', secret).update(data).digest('hex');
  try {
    if (
      sig.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
    ) return null;
    return JSON.parse(Buffer.from(data, 'base64url').toString());
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, otp, token, newPassword } = req.body ?? {};

  const wcUrl = process.env.WC_URL?.trim();
  const wcCk  = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs  = process.env.WC_CONSUMER_SECRET?.trim();
  if (!wcUrl || !wcCk || !wcCs) return res.status(500).json({ error: 'Store not configured' });

  const auth   = `Basic ${Buffer.from(`${wcCk}:${wcCs}`).toString('base64')}`;
  const secret = getSecret(wcCs);

  // ── Request OTP ───────────────────────────────────────────────────────────
  if (action === 'request') {
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Look up customer — silently succeed on miss to avoid email enumeration
    let customers: any[] = [];
    try {
      const searchRes = await fetch(
        `${wcUrl}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}&per_page=1`,
        { headers: { Authorization: auth } }
      );
      customers = await searchRes.json();
      console.log('[reset-password] customer lookup:', searchRes.status, Array.isArray(customers) ? customers.length : 'not array');
    } catch (err: any) {
      console.error('[reset-password] WC lookup error:', err.message);
      return res.status(500).json({ error: 'Store lookup failed' });
    }

    if (!Array.isArray(customers) || customers.length === 0) {
      console.log('[reset-password] customer not found for email:', email);
      return res.json({ success: true }); // avoid enumeration
    }

    const customer = customers[0];
    console.log('[reset-password] found customer id:', customer.id);

    const otpCode = String(crypto.randomInt(100000, 999999));
    const expiry  = Date.now() + 15 * 60 * 1000;

    // Signed token carries the OTP — no WC meta storage needed
    const resetToken = signToken({ email, otp: otpCode, exp: expiry, id: customer.id }, secret);

    // Send email
    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();
    console.log('[reset-password] gmail configured:', !!gmailUser, !!gmailPass);

    if (!gmailUser || !gmailPass) {
      return res.status(500).json({ error: 'Email not configured' });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
      });

      const info = await transporter.sendMail({
        from: `"KNWN Food" <${gmailUser}>`,
        to: email,
        subject: 'Your KNWN password reset code',
        html: `
          <div style="font-family:Poppins,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#F5F3FF;border-radius:16px;">
            <h2 style="color:#2B1C70;font-size:24px;margin-bottom:8px;">Reset your password</h2>
            <p style="color:#5B5291;font-size:15px;margin-bottom:24px;">Use the code below to reset your KNWN account password. It expires in 15 minutes.</p>
            <div style="background:#2B1C70;color:#D4F84A;font-size:36px;font-weight:700;letter-spacing:0.4em;text-align:center;padding:20px;border-radius:12px;">${otpCode}</div>
            <p style="color:#9990BB;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
      console.log('[reset-password] email sent, messageId:', info.messageId);
    } catch (err: any) {
      console.error('[reset-password] sendMail error:', err.message);
      return res.status(500).json({ error: 'Failed to send email: ' + err.message });
    }

    return res.json({ success: true, token: resetToken });
  }

  // ── Verify OTP + set new password ─────────────────────────────────────────
  if (action === 'verify') {
    if (!token || !otp || !newPassword) return res.status(400).json({ error: 'Missing fields' });

    const payload = verifyToken(token, secret);
    if (!payload) {
      console.log('[reset-password] verify — token signature invalid');
      return res.status(400).json({ error: 'Invalid code' });
    }
    if (Date.now() > payload.exp) {
      return res.status(400).json({ error: 'Code expired — request a new one' });
    }
    if (String(otp).trim() !== String(payload.otp)) {
      console.log('[reset-password] verify — OTP mismatch');
      return res.status(400).json({ error: 'Invalid code' });
    }

    const updateRes = await fetch(`${wcUrl}/wp-json/wc/v3/customers/${payload.id}`, {
      method: 'PUT',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });

    console.log('[reset-password] password updated, WC status:', updateRes.status);
    if (!updateRes.ok) return res.status(500).json({ error: 'Failed to update password' });
    return res.json({ success: true });
  }

  return res.status(400).json({ error: 'action must be "request" or "verify"' });
}
