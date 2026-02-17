
import { useState, useEffect, useCallback } from 'react';
import { MenuItem, CartItem } from '../types';
import { calculateActiveOrderDay, toDateKey, getEtNow } from '../utils/dateLogic';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('knwn_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('knwn_cart', JSON.stringify(items));
    if (error) {
      const timer = setTimeout(() => setError(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [items, error]);

  const addItem = useCallback((item: MenuItem, targetDate: Date, customizations?: CartItem['customizations']) => {
    const now = getEtNow();
    const t = new Date(targetDate); t.setHours(0, 0, 0, 0);
    const n = new Date(now); n.setHours(0, 0, 0, 0);

    if (t < n) {
      setError("Selection is not available for past dates.");
      return;
    }

    const dateStr = targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    setItems(prev => {
      const customHash = customizations ? btoa(JSON.stringify(customizations)) : 'default';
      const cartItemId = `${item.id}-${dateStr}-${customHash}`;
      const existing = prev.find(i => {
        const iHash = i.customizations ? btoa(JSON.stringify(i.customizations)) : 'default';
        return `${i.id}-${i.serviceDate}-${iHash}` === cartItemId;
      });

      if (existing) {
        return prev.map(i => {
          const iHash = i.customizations ? btoa(JSON.stringify(i.customizations)) : 'default';
          return `${i.id}-${i.serviceDate}-${iHash}` === cartItemId ? { ...i, quantity: i.quantity + 1 } : i;
        });
      }

      return [...prev, { ...item, quantity: 1, serviceDate: dateStr, customizations }];
    });
  }, []);

  const removeItem = useCallback((id: string, serviceDate: string, customizations?: CartItem['customizations']) => {
    const targetHash = customizations ? btoa(JSON.stringify(customizations)) : 'default';
    setItems(prev => prev.filter(i => {
      const iHash = i.customizations ? btoa(JSON.stringify(i.customizations)) : 'default';
      return !(i.id === id && i.serviceDate === serviceDate && iHash === targetHash);
    }));
  }, []);

  const updateQuantity = useCallback((id: string, serviceDate: string, delta: number, customizations?: CartItem['customizations']) => {
    const targetHash = customizations ? btoa(JSON.stringify(customizations)) : 'default';
    setItems(prev => prev.map(i => {
      const iHash = i.customizations ? btoa(JSON.stringify(i.customizations)) : 'default';
      if (i.id === id && i.serviceDate === serviceDate && iHash === targetHash) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, error };
}
