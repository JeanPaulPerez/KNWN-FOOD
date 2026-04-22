import nodemailer from 'nodemailer';
import crypto from 'node:crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required' });

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
    // Return success to avoid email enumeration
    return res.json({ success: true });
  }

  const customer = customers[0];

  // Generate 6-digit OTP
  const otp = String(crypto.randomInt(100000, 999999));
  const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

  // Store OTP in WC customer meta
  await fetch(`${wcUrl}/wp-json/wc/v3/customers/${customer.id}`, {
    method: 'PUT',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      meta_data: [
        { key: 'knwn_reset_otp',    value: otp },
        { key: 'knwn_reset_expiry', value: String(expiry) },
      ],
    }),
  });

  // Send OTP email via Gmail
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();
  if (!gmailUser || !gmailPass) return res.status(500).json({ error: 'Email not configured' });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  await transporter.sendMail({
    from: `"KNWN Food" <${gmailUser}>`,
    to: email,
    subject: 'Your KNWN password reset code',
    html: `
      <div style="font-family:Poppins,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#F5F3FF;border-radius:16px;">
        <h2 style="color:#2B1C70;font-size:24px;margin-bottom:8px;">Reset your password</h2>
        <p style="color:#5B5291;font-size:15px;margin-bottom:24px;">Use the code below to reset your KNWN account password. It expires in 15 minutes.</p>
        <div style="background:#2B1C70;color:#D4F84A;font-size:36px;font-weight:700;letter-spacing:0.4em;text-align:center;padding:20px;border-radius:12px;">${otp}</div>
        <p style="color:#9990BB;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return res.json({ success: true });
}
