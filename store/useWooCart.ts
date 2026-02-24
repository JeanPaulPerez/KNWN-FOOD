/**
 * store/useWooCart.ts
 *
 * Carrito headless que sincroniza el estado de React con WooCommerce.
 *
 * ESTRATEGIA:
 * 1. El estado local (localStorage) es la fuente de verdad para la UI → respuesta instantánea.
 * 2. Cada mutación (add/remove/update) también se envía a WooCommerce asíncronamente.
 * 3. Las customizaciones se convierten en `item_data` → persisten en WooCommerce
 *    hasta el checkout final, aparecen en el admin y en los correos.
 * 4. Guardamos el `item_key` de WooCommerce junto al CartItem para poder
 *    hacer remove/update directamente.
 *
 * FALLBACK: Si WooCommerce no está configurado (VITE_WC_STORE_URL vacío),
 * el carrito funciona 100% en local igual que antes (sin romper nada).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MenuItem, CartItem } from '../types';
import { calculateActiveOrderDay, getEtNow } from '../utils/dateLogic';
import {
    wooAddToCart,
    wooRemoveFromCart,
    wooUpdateCartItem,
    wooClearCart,
    customizationsToMeta,
} from '../lib/woocommerce';

// Extiende CartItem para guardar el item_key de WooCommerce
export interface WooCartItem extends CartItem {
    /** Key asignada por WooCommerce en el carrito de sesión */
    _wooItemKey?: string;
    /** ID de producto en WooCommerce (mapeado por el admin) */
    _wooProductId?: number;
}

const STORAGE_KEY = 'knwn_cart_v2';
const WOO_ENABLED = !!import.meta.env.VITE_WC_STORE_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCartHash(id: string, serviceDate: string, customizations?: CartItem['customizations']): string {
    const customHash = customizations ? btoa(JSON.stringify(customizations)) : 'default';
    return `${id}-${serviceDate}-${customHash}`;
}

function loadCart(): WooCartItem[] {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        // Migración desde versión anterior (knwn_cart)
        if (!saved) {
            const legacy = localStorage.getItem('knwn_cart');
            if (legacy) {
                const items = JSON.parse(legacy) as WooCartItem[];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
                localStorage.removeItem('knwn_cart');
                return items;
            }
            return [];
        }
        return JSON.parse(saved);
    } catch {
        return [];
    }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWooCart() {
    const [items, setItems] = useState<WooCartItem[]>(loadCart);
    const [error, setError] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);

    // Sincronización a localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    // Auto-clear error
    useEffect(() => {
        if (!error) return;
        const t = setTimeout(() => setError(null), 3500);
        return () => clearTimeout(t);
    }, [error]);

    // ── addItem ────────────────────────────────────────────────────────────────
    const addItem = useCallback(
        async (
            item: MenuItem,
            targetDate: Date,
            customizations?: CartItem['customizations'],
            wooProductId?: number
        ) => {
            const now = getEtNow();
            const t = new Date(targetDate); t.setHours(0, 0, 0, 0);
            const n = new Date(now); n.setHours(0, 0, 0, 0);

            if (t < n) {
                setError('Selection is not available for past dates.');
                return;
            }

            const dateStr = targetDate.toLocaleDateString('en-US', {
                weekday: 'long', month: 'short', day: 'numeric',
            });

            // 1️⃣ Actualización local inmediata (UI no espera a WooCommerce)
            let existingWooKey: string | undefined;
            let newQuantity = 1;

            setItems(prev => {
                const hash = buildCartHash(item.id, dateStr, customizations);
                const existing = prev.find(i => buildCartHash(i.id, i.serviceDate, i.customizations) === hash);

                if (existing) {
                    existingWooKey = existing._wooItemKey;
                    newQuantity = existing.quantity + 1;
                    return prev.map(i =>
                        buildCartHash(i.id, i.serviceDate, i.customizations) === hash
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    );
                }

                return [
                    ...prev,
                    {
                        ...item,
                        quantity: 1,
                        serviceDate: dateStr,
                        customizations,
                        _wooProductId: wooProductId,
                    },
                ];
            });

            // 2️⃣ Sincronización con WooCommerce (en background)
            if (WOO_ENABLED && wooProductId) {
                setSyncing(true);
                try {
                    const itemData = customizationsToMeta(
                        customizations as Record<string, string | boolean | undefined>,
                        dateStr,
                        item.name
                    );

                    if (existingWooKey) {
                        // Ya existe: actualizar cantidad
                        await wooUpdateCartItem(existingWooKey, newQuantity);
                    } else {
                        // Item nuevo: agregar con customizaciones como item_data
                        const wooItem = await wooAddToCart({
                            id: wooProductId,
                            quantity: 1,
                            item_data: itemData,
                        });

                        if (wooItem?.item_key) {
                            // Guardar el item_key de WooCommerce en el item local
                            setItems(prev => {
                                const hash = buildCartHash(item.id, dateStr, customizations);
                                return prev.map(i =>
                                    buildCartHash(i.id, i.serviceDate, i.customizations) === hash
                                        ? { ...i, _wooItemKey: wooItem.item_key, _wooProductId: wooProductId }
                                        : i
                                );
                            });
                        }
                    }
                } catch (e) {
                    console.error('[useWooCart] sync error:', e);
                    // No bloqueamos al usuario si WooCommerce falla
                } finally {
                    setSyncing(false);
                }
            }
        },
        []
    );

    // ── removeItem ─────────────────────────────────────────────────────────────
    const removeItem = useCallback(
        async (id: string, serviceDate: string, customizations?: CartItem['customizations']) => {
            const targetHash = buildCartHash(id, serviceDate, customizations);

            let wooKey: string | undefined;
            setItems(prev => {
                const found = prev.find(i => buildCartHash(i.id, i.serviceDate, i.customizations) === targetHash);
                wooKey = found?._wooItemKey;
                return prev.filter(i => buildCartHash(i.id, i.serviceDate, i.customizations) !== targetHash);
            });

            if (WOO_ENABLED && wooKey) {
                wooRemoveFromCart(wooKey).catch(console.error);
            }
        },
        []
    );

    // ── updateQuantity ─────────────────────────────────────────────────────────
    const updateQuantity = useCallback(
        async (id: string, serviceDate: string, delta: number, customizations?: CartItem['customizations']) => {
            const targetHash = buildCartHash(id, serviceDate, customizations);
            let wooKey: string | undefined;
            let newQty = 0;

            setItems(prev =>
                prev
                    .map(i => {
                        if (buildCartHash(i.id, i.serviceDate, i.customizations) === targetHash) {
                            newQty = Math.max(0, i.quantity + delta);
                            wooKey = i._wooItemKey;
                            return { ...i, quantity: newQty };
                        }
                        return i;
                    })
                    .filter(i => i.quantity > 0)
            );

            if (WOO_ENABLED && wooKey) {
                if (newQty === 0) {
                    wooRemoveFromCart(wooKey).catch(console.error);
                } else {
                    wooUpdateCartItem(wooKey, newQty).catch(console.error);
                }
            }
        },
        []
    );

    // ── clearCart ──────────────────────────────────────────────────────────────
    const clearCart = useCallback(async () => {
        setItems([]);
        if (WOO_ENABLED) {
            wooClearCart().catch(console.error);
        }
    }, []);

    // ── syncAllToWoo ───────────────────────────────────────────────────────────
    /**
     * Sincronización completa garantizada con WooCommerce.
     *
     * Llamar antes de redirigir a knwnfood.com/cart/ para asegurar que
     * TODOS los items con sus customizaciones estén en el carrito de WooCommerce.
     *
     * 1. Vacía el carrito de WooCommerce (elimina estado inconsistente)
     * 2. Re-agrega todos los items locales con sus customizaciones como item_data
     *    → aparecen en knwnfood.com/cart/, admin, y correos de confirmación
     */
    const syncAllToWoo = useCallback(async (): Promise<boolean> => {
        if (!WOO_ENABLED || items.length === 0) return true;
        setSyncing(true);
        try {
            await wooClearCart();

            const updatedItems = [...items];
            for (let i = 0; i < updatedItems.length; i++) {
                const item = updatedItems[i];
                if (!item._wooProductId) continue;

                const itemData = customizationsToMeta(
                    item.customizations as Record<string, string | boolean | undefined>,
                    item.serviceDate,
                    item.name
                );

                const wooItem = await wooAddToCart({
                    id: item._wooProductId,
                    quantity: item.quantity,
                    item_data: itemData,
                });

                if (wooItem?.item_key) {
                    updatedItems[i] = { ...item, _wooItemKey: wooItem.item_key };
                }
            }

            setItems(updatedItems);
            return true;
        } catch (e) {
            console.error('[useWooCart] syncAllToWoo error:', e);
            return false;
        } finally {
            setSyncing(false);
        }
    }, [items]);

    // ── Totals ─────────────────────────────────────────────────────────────────
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    return {
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        syncAllToWoo,
        total,
        itemCount,
        error,
        syncing,
        wooEnabled: WOO_ENABLED,
    };
}
