/**
 * lib/woocommerce.ts
 *
 * Cliente para la WooCommerce REST API y la Store API (cart + checkout).
 *
 * - REST API v3  → productos, órdenes (server-side via proxy)
 * - Store API    → carrito headless con nonce/session cookie (client-side)
 *
 * IMPORTANTE: Las credenciales (CK/CS) NUNCA se exponen al frontend.
 * Todas las llamadas a la REST API pasan por /api/woo-proxy.
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

// ─── Store API (carrito headless — client-side) ────────────────────────────────

const WOO_STORE_URL = import.meta.env.VITE_WC_STORE_URL as string; // e.g. https://knwnfood.com/wp-json/wc/store/v1

/**
 * Obtiene o crea una sesión de carrito WooCommerce.
 * WooCommerce Store API requiere un nonce (X-WC-Store-API-Nonce) para mutaciones.
 * Para sitios headless, usamos un endpoint personalizado o el endpoint de nonce.
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
        h['Nonce'] = nonce;
    }
    return h;
}

/**
 * Agrega un item al carrito de WooCommerce Store API.
 * Las customizaciones se incluyen como `item_data` → quedan en el
 * carrito de WooCommerce y persisten hasta el checkout / orden final.
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
