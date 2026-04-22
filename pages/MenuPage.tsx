import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';
import ZipCode from '../components/ZipCode';
import WeeklySystem from '../components/menu/WeeklySystem';
import FAQ from '../components/menu/FAQ';
import ComparisonTable from '../components/menu/ComparisonTable';
import { CustomizationModal } from '../components/menu/CustomizationModal';
import { MenuItem } from '../types';

const REPEAT_KEY = 'knwn_repeat_order';

function shiftServiceDate(serviceDateStr: string): Date | null {
  try {
    const withoutDay = serviceDateStr.replace(/^\w+,\s*/, '');
    const year = new Date().getFullYear();
    const d = new Date(`${withoutDay} ${year}`);
    if (isNaN(d.getTime())) return null;
    if (d < new Date()) d.setFullYear(d.getFullYear() + 1);
    d.setDate(d.getDate() + 7);
    return d;
  } catch { return null; }
}

/* ══════════════════════════════════════════════════════════════════════════════
   MENU PAGE
   Sections:
     1+2  WeeklySystem   — day selector + meal cards
     3    FAQ            — accordion FAQ
     4    ComparisonTable — "Find the real lunch" orange section
     5    ZipCode        — delivery zone banner
══════════════════════════════════════════════════════════════════════════════ */
export default function MenuPage({ cart }: { cart: any }) {
  const [customizingItem, setCustomizingItem] = useState<{ item: MenuItem; date: Date } | null>(null);
  const [repeatBanner, setRepeatBanner] = useState<{ items: any[] } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REPEAT_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const age = Date.now() - (data.savedAt || 0);
      const dayMs = 1000 * 60 * 60 * 24;
      // Show banner between 5 and 14 days after the order was placed
      if (age > dayMs * 5 && age < dayMs * 14 && Array.isArray(data.items) && data.items.length > 0) {
        setRepeatBanner({ items: data.items });
      }
    } catch {}
  }, []);

  const handleLoadRepeatOrder = () => {
    if (!repeatBanner) return;
    let loaded = 0;
    for (const item of repeatBanner.items) {
      const nextDate = shiftServiceDate(item.serviceDate);
      if (!nextDate) continue;
      const menuItem: MenuItem = {
        id:          item.id,
        name:        item.name,
        description: item.description || '',
        price:       item.price,
        tags:        item.tags,
        calories:    item.calories,
        protein:     item.protein,
        image:       item.image || '',
        wooProductId: item._wooProductId || item.wooProductId,
      };
      for (let q = 0; q < (item.quantity || 1); q++) {
        cart.addItem(menuItem, nextDate, item.customizations, menuItem.wooProductId);
      }
      loaded++;
    }
    if (loaded > 0) {
      try { localStorage.removeItem(REPEAT_KEY); } catch {}
      setRepeatBanner(null);
    }
  };

  const handleDismissRepeat = () => {
    try { localStorage.removeItem(REPEAT_KEY); } catch {}
    setRepeatBanner(null);
  };

  const handleConfirm = (customs: any) => {
    if (!customizingItem) return;
    const qty = customs.quantity || 1;
    for (let i = 0; i < qty; i++) {
      cart.addItem(customizingItem.item, customizingItem.date, customs, customizingItem.item.wooProductId);
    }
    setCustomizingItem(null);
  };

  return (
    <div className="font-sans overflow-x-hidden">

      {/* ── Repeat Order Banner ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {repeatBanner && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-[100px] md:top-[116px] left-0 right-0 z-40 flex justify-center px-4 pointer-events-none"
          >
            <div className="pointer-events-auto bg-brand-primary text-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-4 max-w-sm w-full">
              <div className="bg-brand-lime rounded-xl p-2 shrink-0">
                <RotateCcw size={18} className="text-brand-primary" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold leading-tight">Your weekly order is ready</p>
                <p className="text-[11px] text-white/60 mt-0.5 truncate">
                  {repeatBanner.items.map((i: any) => i.name).join(', ')}
                </p>
              </div>
              <button
                onClick={handleLoadRepeatOrder}
                className="bg-brand-lime text-brand-primary text-[11px] font-black uppercase tracking-wide px-3 py-2 rounded-xl shrink-0"
              >
                Load
              </button>
              <button onClick={handleDismissRepeat} className="text-white/40 hover:text-white shrink-0">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1+2 · WEEKLY SYSTEM + MEAL CARDS ────────────────────────────────── */}
      <WeeklySystem onItemSelect={setCustomizingItem} />

      {/* ── 3 · FAQ ──────────────────────────────────────────────────────────── */}
      <FAQ />

      {/* ── 4 · COMPARISON TABLE ─────────────────────────────────────────────── */}
      <ComparisonTable />

      {/* ── 5 · ZIP CODE BANNER ──────────────────────────────────────────────── */}
      <ZipCode />

      {/* ── Customization Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {customizingItem && (
          <CustomizationModal
            item={customizingItem.item}
            date={customizingItem.date}
            isOpen={!!customizingItem}
            onClose={() => setCustomizingItem(null)}
            onConfirm={handleConfirm}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
