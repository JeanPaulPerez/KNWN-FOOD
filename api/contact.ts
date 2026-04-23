import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, message } = req.body || {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();

  if (!gmailUser || !gmailPass) {
    return res.status(500).json({ error: 'Email not configured.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });

    await transporter.sendMail({
      from: `"KNWN Food" <${gmailUser}>`,
      to: 'hello@knwnfood.com',
      replyTo: email,
      subject: `Contact from ${name} — KNWN Food`,
      html: `
        <div style="font-family:Poppins,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#F5F3FF;border-radius:16px;">
          <h2 style="color:#2B1C70;font-size:22px;margin-bottom:16px;">New contact message</h2>
          <p style="color:#5B5291;font-size:14px;margin:0 0 4px;"><strong>Name:</strong> ${name}</p>
          <p style="color:#5B5291;font-size:14px;margin:0 0 20px;"><strong>Email:</strong> ${email}</p>
          <div style="background:#fff;border-radius:12px;padding:20px;color:#2B1C70;font-size:15px;line-height:1.6;white-space:pre-wrap;">${message}</div>
          <p style="color:#9990BB;font-size:11px;margin-top:24px;">Sent from the KNWN Food contact form.</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('[contact] sendMail error:', err.message);
    return res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
}
