
import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body;

  if (!payload.items || payload.items.length === 0) {
    return res.status(400).json({ error: 'Missing required order information.' });
  }

  // 1. CREACIÓN DE LA ORDEN EN WOOCOMMERCE
  let wooOrderId: number | null = null;
  let wooOrderKey: string | null = null;
  const wcUrl = process.env.WC_URL?.trim();
  const wcCk = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs = process.env.WC_CONSUMER_SECRET?.trim();

  if (wcUrl && wcCk && wcCs) {
    try {
      // Mapeo de items del frontend a line_items de WooCommerce con meta_data persistente
      const line_items = payload.items.map((item: any) => {
        const item_meta = [];

        // Agregar customizaciones como meta_data de la linea
        if (item.customizations) {
          if (item.customizations.base) item_meta.push({ key: "Base", value: item.customizations.base });
          if (item.customizations.protein) item_meta.push({ key: "Proteína", value: item.customizations.protein });
          if (item.customizations.sauce) item_meta.push({ key: "Salsa", value: item.customizations.sauce });
          if (item.customizations.avoid) item_meta.push({ key: "Excluir", value: item.customizations.avoid });
          if (item.customizations.isVegetarian) {
            item_meta.push({ key: "Vegetariano", value: "Sí" });
            if (item.customizations.vegInstructions) item_meta.push({ key: "Instrucciones Veg", value: item.customizations.vegInstructions });
          }
          if (item.customizations.swap) item_meta.push({ key: "Swap", value: item.customizations.swap });
        }

        // Fecha de servicio específica para este item
        if (item.serviceDate) {
          item_meta.push({ key: "Fecha de Servicio", value: item.serviceDate });
        }

        return {
          product_id: item._wooProductId || 0, // Debemos asegurar que el frontend envíe el ID real de WC
          quantity: item.quantity,
          meta_data: item_meta
        };
      });

      const wooOrderPayload = {
        payment_method: "stripe",
        payment_method_title: "Credit Card (Stripe)",
        set_paid: false,
        billing: {
          first_name: payload.name ? payload.name.split(' ')[0] : "",
          last_name: payload.name ? payload.name.split(' ').slice(1).join(' ') : "",
          address_1: payload.address?.street || "",
          city: payload.address?.city || "",
          state: "FL",
          postcode: payload.address?.zip || "",
          country: "US",
          email: payload.email || "pending@knwnfood.com",
          phone: payload.phone || ""
        },
        shipping: {
          first_name: payload.name ? payload.name.split(' ')[0] : "",
          last_name: payload.name ? payload.name.split(' ').slice(1).join(' ') : "",
          address_1: payload.address?.street || "",
          city: payload.address?.city || "",
          state: "FL",
          postcode: payload.address?.zip || "",
          country: "US"
        },
        line_items: line_items,
        customer_note: payload.notes || "",
        meta_data: [
          { key: "service_day", value: payload.serviceDay },
          { key: "order_type", value: "Headless React Order" }
        ]
      };

      const response = await fetch(
        `${wcUrl}/wp-json/wc/v3/orders?consumer_key=${wcCk}&consumer_secret=${wcCs}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wooOrderPayload),
        }
      );

      if (response.ok) {
        const wooOrder = await response.json();
        wooOrderId = wooOrder.id;
        wooOrderKey = wooOrder.order_key;
      } else {
        const errLog = await response.json();
        console.error('WooCommerce API Error:', errLog);
      }
    } catch (err) {
      console.error('Failed to create order in WooCommerce:', err);
    }
  }

  const orderId = wooOrderId ? `WC-${wooOrderId}` : `KNWN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  // 2. ENVÍO DE CORREOS (solo si tenemos email del cliente)
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !payload.email) {
    return res.status(200).json({ success: true, orderId, wooOrderId, wooOrderKey });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const itemsHtml = payload.items.map((item: any) => {
    const customizations = item.customizations ? Object.entries(item.customizations)
      .filter(([_, v]) => v)
      .map(([k, v]) => `<li style="font-size: 11px; color: #717171;">${k}: ${v}</li>`)
      .join('') : '';

    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">
          <div style="font-weight: bold; color: #1a1a1a; font-size: 14px;">${item.name}</div>
          <div style="font-size: 11px; color: #717171;">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
          <ul style="margin: 5px 0 0 0; padding-left: 15px;">${customizations}</ul>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; font-family: serif; font-size: 14px;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `;
  }).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; background-color: #f9f7f2; color: #1a1a1a; margin: 0; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e5e1d8; border-radius: 24px; overflow: hidden;">
        <div style="background-color: #1a1a1a; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; font-family: serif; margin: 0; font-size: 32px;">KNWN<span style="font-style: italic; font-weight: 300;">Food</span></h1>
          <p style="color: #C5A059; text-transform: uppercase; letter-spacing: 2px; font-size: 10px; margin-top: 10px; font-weight: bold;">New Headless Order</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="margin: 0 0 20px 0;">Order #${orderId}</h2>
          <p><strong>Customer:</strong> ${payload.name}</p>
          <p><strong>Email:</strong> ${payload.email}</p>
          <p><strong>Address:</strong> ${payload.address.street}, Miami, FL ${payload.address.zip}</p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
          </table>
          <div style="margin-top: 20px; text-align: right;">
            <p style="font-size: 18px; font-weight: bold;">Total: $${payload.total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"KNWN Portal" <${process.env.GMAIL_USER}>`,
      to: process.env.ORDER_RECEIVER_EMAIL,
      subject: `🚨 NEW ORDER: ${orderId} - ${payload.name}`,
      html: emailHtml,
    });

    return res.status(200).json({ success: true, orderId, wooOrderId, wooOrderKey });
  } catch (error: any) {
    console.error('Email error:', error);
    return res.status(200).json({ success: true, orderId, wooOrderId, wooOrderKey, warning: 'Order saved in WC but email failed.' });
  }
}

