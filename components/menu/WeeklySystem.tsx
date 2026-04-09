import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { MENUS } from '../../data/menus';
import { MenuItem, Weekday } from '../../types';
import { getEtNow } from '../../utils/dateLogic';
import s from './WeeklySystem.module.css';

// ─── COPY — edit labels & images here ────────────────────────────────────────
const COPY = {
  heading:    'The Weekly System',
  subtitle:   'Choose between two fresh options every day.',
  vegBadge:   'Vegetarian Options Available',
  tryNowCta:  'TRY NOW',
  defaultDay: 1, // 0 = Monday … 4 = Friday
} as const;

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const DAY_KEYS: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

// ─── PLATE IMAGES — edit each day independently ───────────────────────────────
// Format: [left card image path, right card image path]

// ── Monday ───────────────────────────────────────────────────────────────────
const MONDAY: [string, string] = [
  '/assets/menu/Menu_Platos/Monday/4.png',   // left plate
  '/assets/menu/Menu_Platos/Monday/3.png',   // right plate
];

// ── Tuesday ──────────────────────────────────────────────────────────────────
const TUESDAY: [string, string] = [
  '/assets/menu/Menu_Platos/Tuesday/2.png',  // left plate
  '/assets/menu/Menu_Platos/Tuesday/1.png',  // right plate
];

// ── Wednesday ────────────────────────────────────────────────────────────────
const WEDNESDAY: [string, string] = [
  '/assets/menu/Menu_Platos/Wednesday/5.png', // left plate
  '/assets/menu/Menu_Platos/Wednesday/7.png', // right plate
];

// ── Thursday ─────────────────────────────────────────────────────────────────
const THURSDAY: [string, string] = [
  '/assets/menu/Menu_Platos/Thursday/6.png',  // left plate
  '/assets/menu/Menu_Platos/Thursday/8.png',  // right plate
];

// ── Friday ───────────────────────────────────────────────────────────────────
const FRIDAY: [string, string] = [
  '/assets/menu/Menu_Platos/Friday/9.png',    // left plate
  '/assets/menu/Menu_Platos/Friday/10.png',   // right plate
];

// ─── Do not edit below — maps constants to day keys ──────────────────────────
const DAY_IMAGES: Record<Weekday, [string, string]> = {
  monday:    MONDAY,
  tuesday:   TUESDAY,
  wednesday: WEDNESDAY,
  thursday:  THURSDAY,
  friday:    FRIDAY,
};

// ─── Utility ──────────────────────────────────────────────────────────────────
function getDateForDayIndex(dayIndex: number): Date {
  const now = getEtNow();
  const dow = now.getDay();
  const todayMondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + todayMondayOffset);
  monday.setHours(12, 0, 0, 0);
  const d = new Date(monday);
  d.setDate(monday.getDate() + dayIndex);
  return d;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
interface Props {
  onItemSelect: (payload: { item: MenuItem; date: Date }) => void;
}

export default function WeeklySystem({ onItemSelect }: Props) {
  const [activeDay, setActiveDay] = useState<number>(COPY.defaultDay);

  const dayKey = DAY_KEYS[activeDay];
  const items = MENUS[dayKey].categories[0].items;
  const images = DAY_IMAGES[dayKey];

  const handleTryNow = (item?: MenuItem) => {
    const target = item ?? items[0];
    if (!target) return;
    onItemSelect({ item: target, date: getDateForDayIndex(activeDay) });
  };

  return (
    <section className={s.section}>
      <div className={s.inner}>

      {/* Title */}
      <h1 className={s.title}>{COPY.heading}</h1>
      <p className={s.subtitle}>{COPY.subtitle}</p>

      {/* Day selector */}
      <div className={s.daySelectorWrap}>
        <div className={s.daySelector}>
          {DAY_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveDay(i)}
              className={s.dayBtn}
              style={{
                color:      activeDay === i ? 'white'        : '#C64D29',
                fontWeight: activeDay === i ? 700            : 400,
                background: activeDay === i ? '#C64D29'      : 'transparent',
                letterSpacing: activeDay === i ? '0.01em'   : '0',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Meal cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.25 }}
          className={s.cardsGrid}
        >
          {items.map((item, idx) => (
            <div key={item.id} className={s.card}>
              {item.customizationOptions?.hasVegetarianOption && (
                <div className={s.vegIcon}>
                  <Leaf size={16} color="white" strokeWidth={2} />
                </div>
              )}
              <img
                src={images[idx]}
                alt={item.name}
                className={s.cardImage}
              />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Bottom row — veg badge + TRY NOW */}
      <div className={s.bottomRow}>
        <div className={s.vegBadge}>
          <div className={s.vegBadgeIcon}>
            <Leaf size={18} color="white" strokeWidth={2} />
          </div>
          <span className={s.vegBadgeText}>{COPY.vegBadge}</span>
        </div>

        <button className={s.tryNowBtn} onClick={() => handleTryNow()}>
          {COPY.tryNowCta}
        </button>
      </div>

      </div>{/* end .inner */}
    </section>
  );
}
