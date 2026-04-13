import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MENUS } from '../../data/menus';
import { MenuItem, Weekday } from '../../types';
import { getEtNow } from '../../utils/dateLogic';
import s from './WeeklySystem.module.css';

// ─── COPY — edit labels & images here ────────────────────────────────────────
const COPY = {
  heading: 'The Weekly System',
  subtitle: 'Choose between two fresh options every day.',
  vegBadge: 'Vegetarian Options Available',
  tryNowCta: 'TRY NOW',
  defaultDay: 0, // 0 = Monday … 4 = Friday
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
  monday: MONDAY,
  tuesday: TUESDAY,
  wednesday: WEDNESDAY,
  thursday: THURSDAY,
  friday: FRIDAY,
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
                  color: '#DB5A29',
                  fontWeight: activeDay === i ? 700 : 400,
                  background: 'transparent',
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
                <div className={s.plateWrapper}>
                  <img src="/assets/icons/plate-shadow.png" alt="" loading="lazy" className={s.plateShadow} />
                  {item.customizationOptions?.hasVegetarianOption && (
                    <img src="/assets/icons/hoja.png" alt="" loading="lazy" className={s.vegIcon} />
                  )}
                  <img
                    src={images[idx]}
                    alt={item.name}
                    loading="lazy"
                    className={s.cardImage}
                    style={{
                      transform: 
                        item.name === 'Chicken Pesto Pasta' ? 'scale(1.24)' :
                        item.name === 'Chicken Lime' ? 'scale(1.14)' :
                        item.name === 'Milanesa' ? 'scale(1.16)' :
                        item.name === 'Carne Asada' ? 'scale(1.14)' :
                        item.name === 'Mediterranean Chicken' ? 'scale(1.14)' :
                        'scale(1.1)'
                    }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom row — veg badge + TRY NOW */}
        <div className={s.bottomRow}>
          <div className={s.vegBadge}>
            <img src="/assets/icons/hoja.png" alt="" loading="lazy" className={s.vegBadgeIcon} />
            <span className={s.vegBadgeText}>{COPY.vegBadge}</span>
          </div>

          <Link to="/order" className={s.tryNowBtn} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-block' }}>
            <img src="/assets/icons/try-now.png" alt="TRY NOW" loading="lazy" className={s.tryNowImg} />
          </Link>
        </div>

      </div>{/* end .inner */}
    </section>
  );
}
