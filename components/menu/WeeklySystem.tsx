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
  '/assets/menu/Menu_Platos/Monday/4.webp',   // left plate
  '/assets/menu/Menu_Platos/Monday/3.webp',   // right plate
];

// ── Tuesday ──────────────────────────────────────────────────────────────────
const TUESDAY: [string, string] = [
  '/assets/menu/Menu_Platos/Tuesday/2.webp',  // left plate
  '/assets/menu/Menu_Platos/Tuesday/1.webp',  // right plate
];

// ── Wednesday ────────────────────────────────────────────────────────────────
const WEDNESDAY: [string, string] = [
  '/assets/menu/Menu_Platos/Wednesday/5.webp', // left plate
  '/assets/menu/Menu_Platos/Wednesday/7.webp', // right plate
];

// ── Thursday ─────────────────────────────────────────────────────────────────
const THURSDAY: [string, string] = [
  '/assets/menu/Menu_Platos/Thursday/6.webp',  // left plate
  '/assets/menu/Menu_Platos/Thursday/8.webp',  // right plate
];

// ── Friday ───────────────────────────────────────────────────────────────────
const FRIDAY: [string, string] = [
  '/assets/menu/Menu_Platos/Friday/9.webp',    // left plate
  '/assets/menu/Menu_Platos/Friday/10.webp',   // right plate
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
  const [activeDay, setActiveDay] = React.useState<number>(COPY.defaultDay);
  const [activeItemIndex, setActiveItemIndex] = React.useState(0);

  // Reset active item index when changing day
  React.useEffect(() => {
    setActiveItemIndex(0);
  }, [activeDay]);

  // Preload all day images on mount so carousel switches are instant
  React.useEffect(() => {
    DAY_KEYS.forEach(key => {
      DAY_IMAGES[key].forEach(src => { const img = new window.Image(); img.src = src; });
    });
  }, []);

  const dayKey = DAY_KEYS[activeDay];
  const items = MENUS[dayKey].categories[0].items;
  const images = DAY_IMAGES[dayKey];

  const handleTryNow = (item?: MenuItem) => {
    const target = item ?? items[0];
    if (!target) return;
    onItemSelect({ item: target, date: getDateForDayIndex(activeDay) });
  };

  const nextItem = () => setActiveItemIndex((prev) => (prev + 1) % items.length);
  const prevItem = () => setActiveItemIndex((prev) => (prev - 1 + items.length) % items.length);

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

        {/* Meal cards carousel (mobile only) */}
        <div className={s.carouselContainer}>
          <button className={`${s.navBtn} ${s.prevBtn}`} onClick={prevItem} aria-label="Previous meal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeDay}-${activeItemIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={s.singleCardWrapper}
            >
              {items[activeItemIndex] && (
                <div className={s.card}>
                  <div className={s.plateWrapper}>
                    <img src="/assets/icons/plate-shadow.png" alt="" loading="lazy" className={s.plateShadow} />
                    {items[activeItemIndex].customizationOptions?.hasVegetarianOption && (
                      <img src="/assets/icons/hoja.png" alt="" loading="lazy" className={s.vegIcon} />
                    )}
                    
                    {/* Dish Name Sticker (Top-Left) */}
                    <div className={s.dishSticker}>
                      <img src="/assets/hero-bg/Bloque_amarillo_horizontal.png" alt="" className={s.stickerBg} />
                      <span className={s.stickerText}>{items[activeItemIndex].name}</span>
                    </div>

                    <img
                      src={images[activeItemIndex]}
                      alt={items[activeItemIndex].name}
                      loading="eager"
                      decoding="async"
                      className={s.cardImage}
                    />
                    
                    {/* Description Box (Bottom) */}
                    <div className={s.descriptionBox}>
                      <img src="/assets/hero-bg/Block_amarillo_vertical.png" alt="" className={s.boxBg} />
                      <p className={s.boxText}>{items[activeItemIndex].description}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <button className={`${s.navBtn} ${s.nextBtn}`} onClick={nextItem} aria-label="Next meal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Desktop Grid (hidden on mobile) */}
        <div className={s.desktopGrid}>
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
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      className={s.cardImage}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom row — veg badge + TRY NOW */}
        <div className={s.bottomRow}>
          <div className={s.vegBadge}>
            <img src="/assets/icons/hoja.png" alt="" loading="lazy" className={s.vegBadgeIcon} />
            <span className={s.vegBadgeText}>{COPY.vegBadge}</span>
          </div>

          <Link to="/order" className={s.tryNowBtn}>
            <img src="/assets/icons/try-now.png" alt="TRY NOW" loading="lazy" className={s.tryNowImg} />
          </Link>
        </div>

      </div>{/* end .inner */}
    </section>
  );
}
