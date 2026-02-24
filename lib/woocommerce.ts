/**
 * lib/woocommerce.ts
 *
 * Cliente headless para WooCommerce Store API.
 *
 * - Store API (cart headless) → todas las llamadas van a través de /api/woo-store
 *   para evitar problemas de CORS. El proxy corre server-side en Vercel.
 * - REST API v3 (órdenes) → sigue en /api/order (server-side).
 * - El cart_token de WooCommerce se persiste en localStorage para mantener
 *   la sesión del carrito entre recargas.
 *
 * Las credenciales (CK/CS) NUNCA se exponen al frontend.
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface WooItemMeta {
    key: string;
    value: string;
}

export interface WooCartItemRequest {
    /** ID del producto en WooCommerce */
    id: number;
    quantity: number;
    /** Metadatos de item — aquí van las customizaciones */
    item_data?: WooItemMeta[];
}

export interface WooCartItem {
    item_key: string;
    id: number;
    name: string;
    quantity: { value: number };
    prices: { price: string; currency_minor_unit: number };
    item_data: WooItemMeta[];
}

export interface WooCart {
    items: WooCartItem[];
    totals: {
        total_price: string;
        currency_minor_unit: number;
    };
}

export interface WooOrderLineItem {
    product_id: number;
    quantity: number;
    /** Meta data visible en el admin y correos */
    meta_data: { key: string; value: string }[];
}

export interface WooOrderPayload {
    payment_method: string;
    payment_method_title: string;
    set_paid: boolean;
    status: string;
    billing: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        address_1: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
    };
    shipping: {
        first_name: string;
        last_name: string;
        address_1: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
    };
    line_items: WooOrderLineItem[];
    meta_data: { key: string; value: string }[];
    customer_note?: string;
}

export interface WooOrder {
    id: number;
    number: string;
    status: string;
    total: string;
}

// ─── Configuración ─────────────────────────────────────────────────────────────

/** Si VITE_WC_STORE_URL está definida, WooCommerce sync está activado */
const WOO_ENABLED = !!import.meta.env.VITE_WC_STORE_URL;

/** Proxy server-side que evita CORS (Vercel serverless function) */
const PROXY_BASE = '/api/woo-store';

/** Clave para persistir el cart_token de WooCommerce en localStorage */
const CART_TOKEN_KEY = 'knwn_cart_token';

// ─── Cart Token ────────────────────────────────────────────────────────────────

function getCartToken(): string | null {
    try {
        return localStorage.getItem(CART_TOKEN_KEY);
    } catch {
        return null;
    }
}

function saveCartToken(token: string | null) {
    try {
        if (token) {
            localStorage.setItem(CART_TOKEN_KEY, token);
        }
    } catch {
        // ignore
    }
}

// ─── Proxy fetch ───────────────────────────────────────────────────────────────

/**
 * Envía una petición al proxy /api/woo-store que reenvía server-side
 * a la Store API de WooCommerce. El proxy devuelve el Cart-Token
 * (sesión headless sin cookies).
 */
async function proxyFetch(
    path: string,
    method: string = 'GET',
    body?: unknown
): Promise<Response> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Incluir cart token para identificar la sesión del carrito
    const token = getCartToken();
    if (token) {
        headers['Cart-Token'] = token;
    }

    const res = await fetch(`${PROXY_BASE}?path=${encodeURIComponent(path)}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Guardar el Cart-Token que devuelve WooCommerce
    const newToken = res.headers.get('Cart-Token');
    if (newToken) {
        saveCartToken(newToken);
    }

    return res;
}

// ─── Store API (carrito headless — client-side via proxy) ─────────────────────

/**
 * Agrega un item al carrito de WooCommerce Store API.
 * Las customizaciones se incluyen como `item_data` → quedan en el
 * carrito de WooCommerce y persisten hasta el checkout / orden final.
 */
export async function wooAddToCart(
    item: WooCartItemRequest
): Promise<WooCartItem | null> {
    if (!WOO_ENABLED) return null;
    try {
        console.log('[WooCart] Intentando añadir:', item);
        const res = await proxyFetch('cart/add-item', 'POST', item);
        console.log('[WooCart] Status:', res.status);

        if (!res.ok) {
            const err = await res.json();
            console.error('[WooCart] Error detallado:', err);
            return null;
        }
        const data = await res.json();
        console.log('[WooCart] ÉXITO: Producto en el carrito de WooCommerce:', data);
        return data;
    } catch (e) {
        console.error('[WooCart] add-item exception:', e);
        return null;
    }
}

/**
 * Obtiene el carrito actual de WooCommerce.
 */
export async function wooGetCart(): Promise<WooCart | null> {
    if (!WOO_ENABLED) return null;
    try {
        const res = await proxyFetch('cart', 'GET');
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

/**
 * Elimina un item del carrito de WooCommerce.
 */
export async function wooRemoveFromCart(itemKey: string): Promise<boolean> {
    if (!WOO_ENABLED) return false;
    try {
        const res = await proxyFetch('cart/remove-item', 'POST', { key: itemKey });
        return res.ok;
    } catch {
        return false;
    }
}

/**
 * Actualiza la cantidad de un item en el carrito de WooCommerce.
 */
export async function wooUpdateCartItem(
    itemKey: string,
    quantity: number
): Promise<boolean> {
    if (!WOO_ENABLED) return false;
    try {
        const res = await proxyFetch('cart/update-item', 'POST', { key: itemKey, quantity });
        return res.ok;
    } catch {
        return false;
    }
}

/**
 * Vacía el carrito de WooCommerce.
 */
export async function wooClearCart(): Promise<boolean> {
    if (!WOO_ENABLED) return false;
    try {
        const res = await proxyFetch('cart/items', 'DELETE');
        return res.ok;
    } catch {
        return false;
    }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convierte las customizaciones del frontend (CartItem.customizations)
 * en un array de WooItemMeta para enviarse a WooCommerce.
 *
 * Cada entrada quedará registrada como metadato del line item en:
 *   - El panel de admin de WooCommerce
 *   - Los correos de confirmación / notificación
 *   - La orden final
 */
export function customizationsToMeta(
    customizations?: Record<string, string | boolean | undefined>,
    serviceDate?: string,
    productName?: string
): WooItemMeta[] {
    const meta: WooItemMeta[] = [];

    if (serviceDate) {
        meta.push({ key: '📅 Fecha de Servicio', value: serviceDate });
    }

    if (!customizations) return meta;

    const labels: Record<string, string> = {
        base: '🍚 Base',
        sauce: '🥫 Salsa',
        protein: '🥩 Proteína',
        isVegetarian: '🌱 Vegetariano',
        vegInstructions: '📋 Instrucciones Vegetarianas',
        avoid: '🚫 Excluir',
        swap: '🔄 Swap',
    };

    for (const [key, value] of Object.entries(customizations)) {
        if (value === undefined || value === null || value === '') continue;
        if (key === 'isVegetarian') {
            if (value === true) {
                meta.push({ key: labels[key] || key, value: 'Sí' });
            }
            continue;
        }
        if (key === 'vegInstructions' && !customizations.isVegetarian) continue;
        const label = labels[key] || key;
        meta.push({ key: label, value: String(value) });
    }

    return meta;
}

/**
 * Convierte las customizaciones en meta_data para órdenes WooCommerce REST API.
 * Mismo formato, diferente key (meta_data en lugar de item_data).
 */
export function customizationsToOrderMeta(
    customizations?: Record<string, string | boolean | undefined>,
    serviceDate?: string
): { key: string; value: string }[] {
    return customizationsToMeta(customizations, serviceDate).map((m) => ({
        key: m.key,
        value: m.value,
    }));
}
