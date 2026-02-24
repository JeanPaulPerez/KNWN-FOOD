/**
 * api/validate-coupon.ts
 *
 * Validates a coupon code and returns the discount details.
 *
 * SPECIAL TEST COUPON — REALFOOD113:
 *   - Always valid, 100% off, bypasses Stripe entirely (isFree: true).
 *
 * REAL COUPONS:
 *   - Looked up against the WooCommerce REST API.
 *   - Checks expiry and usage limits.
 */

const FREE_COUPON_CODE = 'REALFOOD113';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false, error: 'Coupon code is required' });
  }

  const upperCode = code.trim().toUpperCase();

  // ── Special test coupon: 100% discount, skips Stripe ──────────────────────
  if (upperCode === FREE_COUPON_CODE) {
    return res.json({
      valid: true,
      code: upperCode,
      discountType: 'percent',
      discountValue: 100,
      isFree: true,
    });
  }

  // ── Real coupons: validate against WooCommerce ─────────────────────────────
  const wcUrl = process.env.WC_URL?.trim();
  const wcCk = process.env.WC_CONSUMER_KEY?.trim();
  const wcCs = process.env.WC_CONSUMER_SECRET?.trim();

  if (!wcUrl || !wcCk || !wcCs) {
    return res.json({ valid: false, error: 'Coupon not found' });
  }

  try {
    const response = await fetch(
      `${wcUrl}/wp-json/wc/v3/coupons?code=${encodeURIComponent(upperCode)}&consumer_key=${wcCk}&consumer_secret=${wcCs}`
    );

    if (!response.ok) {
      return res.json({ valid: false, error: 'Could not validate coupon' });
    }

    const coupons = await response.json();

    if (!Array.isArray(coupons) || coupons.length === 0) {
      return res.json({ valid: false, error: 'Coupon not found' });
    }

    const coupon = coupons[0];

    // Check expiry date
    if (coupon.date_expires && new Date(coupon.date_expires) < new Date()) {
      return res.json({ valid: false, error: 'This coupon has expired' });
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return res.json({ valid: false, error: 'This coupon has reached its usage limit' });
    }

    const discountValue = parseFloat(coupon.amount) || 0;

    return res.json({
      valid: true,
      code: upperCode,
      discountType: coupon.discount_type as 'percent' | 'fixed_cart',
      discountValue,
      isFree: false,
    });
  } catch {
    return res.json({ valid: false, error: 'Unable to validate coupon. Please try again.' });
  }
}
