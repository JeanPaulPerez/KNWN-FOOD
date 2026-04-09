import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ZipCode from '../components/ZipCode';
import WeeklySystem from '../components/menu/WeeklySystem';
import FAQ from '../components/menu/FAQ';
import ComparisonTable from '../components/menu/ComparisonTable';
import { CustomizationModal } from '../components/menu/CustomizationModal';
import { MenuItem } from '../types';

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
