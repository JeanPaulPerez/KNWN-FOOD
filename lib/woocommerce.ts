/**
 * lib/woocommerce.ts
 *
 * Cliente headless para WooCommerce Store API y REST API.
 *
 * ARQUITECTURA:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Browser (React App)                                        │
 * │                                                             │
 * │  Store API (carrito) ──── fetch con credentials:'include' ─►│
 * │                                    knwnfood.com/wp-json/    │
 * │                                    wc/store/v1              │
 * │                                    └─ WooCommerce setea     │
 * │                                       cookies de sesión     │
 * │                                       en el browser         │
 * │                                                             │
 * │  Redirect a knwnfood.com/cart/ ──── el browser envía las   │
 * │                                     cookies → carrito lleno │
 * └─────────────────────────────────────────────────────────────┘
 *
 * IMPORTANTE:
 * - credentials:'include' es esencial → las session cookies de WooCommerce
 *   se guardan en el browser y se envían al navegar a knwnfood.com/cart/
 * - La nonce se obtiene del endpoint custom knwn/v1/nonce (plugin WordPress)
 * - Las credenciales REST API (CK/CS) NUNCA se exponen al frontend
 * - WordPress necesita CORS configurado para el dominio del frontend
 *   → ver wordpress/knwn-headless.php
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

// ─── Store API (carrito headless — llamadas directas con cookies) ──────────────

const WOO_STORE_URL = import.meta.env.VITE_WC_STORE_URL as string;

/**
 * Obtiene el nonce de la Store API desde el endpoint custom de WordPress.
 * El nonce autentica las mutaciones del carrito (add/remove/update).
 * El endpoint knwn/v1/nonce debe estar instalado en WordPress.
 * → ver wordpress/knwn-headless.php
 */
async function getStoreNonce(): Promise<string> {
    const nonceUrl = import.meta.env.VITE_WC_NONCE_URL as string;
    if (!nonceUrl) return '';
    try {
        const res = await fetch(nonceUrl, { credentials: 'include' });
        if (!res.ok) return '';
        const data = await res.json();
        return data.nonce || '';
    } catch {
        return '';
    }
}

function storeHeaders(nonce?: string): HeadersInit {
    const h: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (nonce) {
        // Correcto: WooCommerce Store API requiere este header exacto
        h['X-WC-Store-API-Nonce'] = nonce;
    }
    return h;
}

/**
 * Agrega un item al carrito de WooCommerce Store API.
 *
 * credentials:'include' → WooCommerce setea una session cookie en el browser.
 * Esa cookie persiste hasta que el usuario navega a knwnfood.com/cart/,
 * donde WooCommerce la lee y muestra el carrito con todos los items.
 *
 * item_data → las customizaciones se guardan en el carrito de WooCommerce
 * y aparecen en el admin, correos de confirmación y la orden final.
 */
export async function wooAddToCart(
    item: WooCartItemRequest
): Promise<WooCartItem | null> {
    if (!WOO_STORE_URL) return null;
    try {
        const nonce = await getStoreNonce();
        const res = await fetch(`${WOO_STORE_URL}/cart/add-item`, {
            method: 'POST',
            credentials: 'include',
            headers: storeHeaders(nonce),
            body: JSON.stringify(item),
        });

        console.log('[WooCart] Intentando añadir:', item);
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
    if (!WOO_STORE_URL) return null;
    try {
        const res = await fetch(`${WOO_STORE_URL}/cart`, {
            credentials: 'include',
            headers: storeHeaders(),
        });
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
    if (!WOO_STORE_URL) return false;
    try {
        const nonce = await getStoreNonce();
        const res = await fetch(`${WOO_STORE_URL}/cart/remove-item`, {
            method: 'POST',
            credentials: 'include',
            headers: storeHeaders(nonce),
            body: JSON.stringify({ key: itemKey }),
        });
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
    if (!WOO_STORE_URL) return false;
    try {
        const nonce = await getStoreNonce();
        const res = await fetch(`${WOO_STORE_URL}/cart/update-item`, {
            method: 'POST',
            credentials: 'include',
            headers: storeHeaders(nonce),
            body: JSON.stringify({ key: itemKey, quantity }),
        });
        return res.ok;
    } catch {
        return false;
    }
}

/**
 * Vacía el carrito de WooCommerce.
 */
export async function wooClearCart(): Promise<boolean> {
    if (!WOO_STORE_URL) return false;
    try {
        const nonce = await getStoreNonce();
        const res = await fetch(`${WOO_STORE_URL}/cart/items`, {
            method: 'DELETE',
            credentials: 'include',
            headers: storeHeaders(nonce),
        });
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
