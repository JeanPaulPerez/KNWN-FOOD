/**
 * api/woo-store.ts
 *
 * Proxy serverless para WooCommerce Store API.
 *
 * PROPÓSITO:
 * El frontend React corre en un dominio diferente al WordPress (knwnfood.com).
 * Llamar a la Store API directamente desde el navegador genera errores CORS.
 * Este proxy corre server-side (Vercel) y reenvía las peticiones a WooCommerce
 * sin restricciones CORS.
 *
 * SESIÓN HEADLESS:
 * WooCommerce Store API soporta Cart-Token como alternativa a session cookies.
 * El proxy reenvía el Cart-Token del cliente a WooCommerce y devuelve el
 * Cart-Token actualizado al cliente, que lo guarda en localStorage.
 *
 * ENDPOINT: GET/POST/DELETE /api/woo-store?path=<store-api-path>
 * Ejemplo: POST /api/woo-store?path=cart/add-item
 *          → POST https://knwnfood.com/wp-json/wc/store/v1/cart/add-item
 */

export default async function handler(req: any, res: any) {
    const WC_STORE_URL = process.env.VITE_WC_STORE_URL;

    if (!WC_STORE_URL) {
        return res.status(503).json({ error: 'WooCommerce Store API not configured' });
    }

    // Ruta dentro de la Store API (e.g. "cart/add-item")
    const path = (req.query.path as string) || '';
    const targetUrl = `${WC_STORE_URL}/${path}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    // Reenviar Cart-Token si el cliente lo provee (sesión headless sin cookies)
    const cartToken = req.headers['cart-token'];
    if (cartToken) {
        headers['Cart-Token'] = cartToken as string;
    }

    const method = (req.method || 'GET').toUpperCase();
    const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && req.body;

    try {
        const response = await fetch(targetUrl, {
            method,
            headers,
            body: hasBody ? JSON.stringify(req.body) : undefined,
        });

        const data = await response.json();

        // Reenviar Cart-Token al cliente para que lo persista
        const newCartToken = response.headers.get('Cart-Token');
        if (newCartToken) {
            res.setHeader('Cart-Token', newCartToken);
        }

        return res.status(response.status).json(data);
    } catch (error: any) {
        console.error('[woo-store proxy] Error:', error.message);
        return res.status(502).json({
            error: 'Failed to reach WooCommerce Store API',
            details: error.message,
        });
    }
}
