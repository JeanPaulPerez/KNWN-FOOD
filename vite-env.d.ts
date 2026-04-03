/// <reference types="vite/client" />

/**
 * VITE_ prefix = bundled into the browser.
 * Only declare variables that are SAFE to expose publicly.
 *
 * ⚠️  NEVER add STRIPE_SECRET_KEY, WC_CONSUMER_KEY, WC_CONSUMER_SECRET,
 *     GMAIL_APP_PASSWORD, or any other server-side secret here.
 *     Those belong in process.env (server/api only) — no VITE_ prefix.
 */
interface ImportMetaEnv {
    // WooCommerce Store API — public URLs, safe in browser
    readonly VITE_WC_STORE_URL: string;
    readonly VITE_WC_NONCE_URL: string;

    // Stripe publishable key — intentionally public
    readonly VITE_STRIPE_PUBLISHABLE_KEY: string;

    // Google Maps Places browser key — safe only with proper HTTP referrer restrictions
    readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
