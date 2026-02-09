
import { useState, useEffect, useCallback } from 'react';
import { MenuItem, CartItem } from '../types';
import { calculateActiveOrderDay, toDateKey } from '../utils/dateLogic';

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

  const addItem = useCallback((item: MenuItem, targetDate: Date) => {
    const activeOrderDay = calculateActiveOrderDay();
    const isActive = toDateKey(targetDate) === toDateKey(activeOrderDay);

    if (!isActive) {
      setError(`Ordering is currently active for: ${activeOrderDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`);
      return;
    }

    const dateStr = targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    setItems(prev => {
      const cartItemId = `${item.id}-${dateStr}`;
      const existing = prev.find(i => `${i.id}-${i.serviceDate}` === cartItemId);
      
      if (existing) {
        return prev.map(i => `${i.id}-${i.serviceDate}` === cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      
      return [...prev, { ...item, quantity: 1, serviceDate: dateStr }];
    });
  }, []);

  const removeItem = useCallback((id: string, serviceDate: string) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.serviceDate === serviceDate)));
  }, []);

  const updateQuantity = useCallback((id: string, serviceDate: string, delta: number) => {
    setItems(prev => prev.map(i => {
      if (i.id === id && i.serviceDate === serviceDate) {
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
