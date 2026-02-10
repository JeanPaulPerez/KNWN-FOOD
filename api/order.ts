
import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body;

  if (!payload.email || !payload.items || payload.items.length === 0) {
    return res.status(400).json({ error: 'Missing required order information.' });
  }

  const orderId = `KNWN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('⚠️ GMAIL_USER or GMAIL_APP_PASSWORD not set. Emails will not be sent.');
    return res.status(200).json({
      success: true,
      orderId,
      warning: 'Order processed but emails not sent (system unconfigured).'
    });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const itemsHtml = payload.items.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">
        <div style="font-weight: bold; color: #1a1a1a; font-size: 14px;">${item.name}</div>
        <div style="font-size: 11px; color: #717171;">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; font-family: serif; font-size: 14px;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; background-color: #f9f7f2; color: #1a1a1a; margin: 0; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e5e1d8; border-radius: 24px; overflow: hidden;">
        <div style="background-color: #1a1a1a; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; font-family: serif; margin: 0; font-size: 32px;">KNWN<span style="font-style: italic; font-weight: 300;">Food</span></h1>
          <p style="color: #C5A059; text-transform: uppercase; letter-spacing: 2px; font-size: 10px; margin-top: 10px; font-weight: bold;">New Miami Order</p>
        </div>
        
        <div style="padding: 40px;">
          <div style="margin-bottom: 30px; border-bottom: 1px solid #eeeeee; padding-bottom: 20px;">
            <p style="margin: 0; font-size: 12px; color: #717171; text-transform: uppercase;">Order Reference</p>
            <h2 style="margin: 5px 0 0 0; font-family: monospace; color: #1a1a1a; font-size: 24px;">${orderId}</h2>
          </div>

          <div style="margin-bottom: 30px;">
            <p style="margin: 0; font-size: 12px; color: #717171; text-transform: uppercase;">Miami Delivery Address</p>
            <p style="margin: 5px 0 0 0; font-weight: bold;">${payload.name}</p>
            <p style="margin: 0;">${payload.address.street}</p>
            <p style="margin: 0;">Miami, FL ${payload.address.zip}</p>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #717171;">Phone: ${payload.phone}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="text-align: left; font-size: 10px; text-transform: uppercase; border-bottom: 2px solid #1a1a1a;">
                <th style="padding: 12px;">Item</th>
                <th style="padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px; border-top: 2px solid #1a1a1a; padding-top: 20px;">
             <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-size: 13px; color: #717171;">Subtotal</span>
                <span style="font-size: 13px; font-weight: bold;">$${payload.subtotal.toFixed(2)}</span>
             </div>
             <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-size: 13px; color: #717171;">Tax (2%)</span>
                <span style="font-size: 13px; font-weight: bold;">$${payload.tax.toFixed(2)}</span>
             </div>
             <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <span style="font-size: 13px; color: #717171;">Tip</span>
                <span style="font-size: 13px; font-weight: bold;">$${payload.tip.toFixed(2)}</span>
             </div>
             <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 1px solid #eeeeee;">
                <span style="font-size: 18px; font-family: serif; font-weight: bold;">Final Total</span>
                <span style="font-size: 24px; font-family: serif; font-weight: bold; color: #C5A059;">$${payload.total.toFixed(2)}</span>
             </div>
          </div>

          ${payload.notes ? `
            <div style="margin-top: 40px; padding: 20px; background-color: #f9f7f2; border-radius: 12px;">
              <p style="margin: 0 0 5px 0; font-size: 10px; text-transform: uppercase; font-weight: bold; color: #717171;">Notes</p>
              <p style="margin: 0; font-style: italic; color: #1a1a1a;">"${payload.notes}"</p>
            </div>
          ` : ''}

          <div style="margin-top: 40px; text-align: center; border-top: 1px solid #eeeeee; padding-top: 30px;">
            <p style="font-size: 11px; color: #717171; text-transform: uppercase;">Received via KNWN Portal • ${timestamp} ET</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const customerEmailHtml = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; background-color: #f9f7f2; color: #1a1a1a; margin: 0; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e5e1d8; border-radius: 24px; overflow: hidden;">
        <div style="background-color: #1a1a1a; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; font-family: serif; margin: 0; font-size: 32px;">KNWN<span style="font-style: italic; font-weight: 300;">Food</span></h1>
          <p style="color: #C5A059; text-transform: uppercase; letter-spacing: 2px; font-size: 10px; margin-top: 10px; font-weight: bold;">Order Confirmed</p>
        </div>
        
        <div style="padding: 40px;">
          <div style="margin-bottom: 30px;">
            <h2 style="font-family: serif; font-size: 24px; margin-top: 0;">Thank you, ${payload.name.split(' ')[0]}.</h2>
            <p style="color: #717171; font-size: 14px; line-height: 1.6;">Your order has been received and is being prepared by our chef. Below are your order details for ${payload.serviceDay}.</p>
          </div>

          <div style="margin-bottom: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
            <p style="margin: 0; font-size: 10px; color: #717171; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
            <p style="margin: 5px 0 0 0; font-family: monospace; font-weight: bold; font-size: 18px;">${orderId}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead style="border-bottom: 2px solid #1a1a1a;">
              <tr>
                <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase;">Item</th>
                <th style="padding: 12px; text-align: right; font-size: 10px; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="border-top: 2px solid #1a1a1a; padding-top: 20px;">
             <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #eeeeee; padding-bottom: 15px;">
                <span style="font-size: 16px; font-family: serif; font-weight: bold;">Total Paid</span>
                <span style="font-size: 18px; font-family: serif; font-weight: bold; color: #C5A059;">$${payload.total.toFixed(2)}</span>
             </div>
          </div>

          <div style="margin-top: 40px; padding: 20px; background-color: #f9f7f2; border-radius: 12px; text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #1a1a1a;">Our team will contact you at <strong>${payload.phone}</strong> when your delivery is near.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // 1. Send Order Notification to Merchant
    await transporter.sendMail({
      from: `"KNWN Portal" <${process.env.GMAIL_USER}>`,
      to: "jeanpaul232004@gmail.com",
      subject: `🚨 NEW ORDER: ${orderId} - ${payload.name}`,
      html: emailHtml,
    });

    // 2. Send Confirmation to Customer
    await transporter.sendMail({
      from: `"KNWN Food" <${process.env.GMAIL_USER}>`,
      to: payload.email,
      subject: `Your KNWN Food Order Confirmation [${orderId}]`,
      html: customerEmailHtml,
    });

    return res.status(200).json({ success: true, orderId });
  } catch (error: any) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Order failed to process due to mailing service issues.' });
  }
}
