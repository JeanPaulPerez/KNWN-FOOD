import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ArrowRight, ArrowLeft, Trash2, Search, MapPin, Clock3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MENUS } from '../data/menus';
import { MenuItem, Weekday } from '../types';
import { getEtNow, calculateActiveOrderDay, isWeekend, CUTOFF_HOUR } from '../utils/dateLogic';
import { clsx } from 'clsx';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_MEALS = 5;
const DOW_TO_KEY: Record<number, Weekday> = {
  1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday',
};

/**
 * Returns the next N orderable weekdays starting from the first available
 * delivery date (respects 10 AM ET cutoff and skips weekends).
 */
function getAvailableDates(count = 10): Date[] {
  const first = calculateActiveOrderDay();
  const dates: Date[] = [];
  const cursor = new Date(first);
  cursor.setHours(12, 0, 0, 0);
  while (dates.length < count) {
    if (!isWeekend(cursor)) dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

const WINDOW_SIZE = 5;

function getWeekdayKey(date: Date): Weekday {
  return DOW_TO_KEY[date.getDay()] ?? 'monday';
}

/** Maps meal names to real food-bg photos (with background, great for cards) */
const FOOD_BG: Record<string, string> = {
  'mediterranean chicken': '/assets/food-bg/mediterranean-chicken.webp',
  'bibi bump rice':        '/assets/food-bg/bibi-bamp-rice.webp',
  'carne asada':           '/assets/food-bg/carne-asada.webp',
  'chicken lime':          '/assets/food-bg/chicken-lime.webp',
  'chicken pesto pasta':   '/assets/food-bg/pesto-pasta.webp',
  'thai beef salad':       '/assets/food-bg/thai-beef-salad.webp',
  'milanesa':              '/assets/food-bg/milanesa.webp',
  'harissa meatballs':     '/assets/food-bg/harissa-meatballs.webp',
  'crispy korean chicken': '/assets/food-bg/korean-crispy-chicken.webp',
  'chicken caesar salad':  '/assets/food-bg/chicken-cesar-salad.webp',
};

function getFoodBgImage(name: string): string {
  const key = name.toLowerCase().trim();
  const match = Object.entries(FOOD_BG).find(([k]) => key.includes(k) || k.includes(key));
  return match ? match[1] : '/assets/food-bg/carne-asada.webp';
}

function getCountdownLabel(): string {
  const now = getEtNow();
  const cutoff = new Date(now);
  cutoff.setHours(22, 0, 0, 0);

  if (now > cutoff) {
    cutoff.setDate(cutoff.getDate() + 1);
  }

  const diffMs = Math.max(0, cutoff.getTime() - now.getTime());
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} hrs ${String(minutes).padStart(2, '0')} mins`;
}

// ─── Customization Modal ──────────────────────────────────────────────────────
const CustomizationModal: React.FC<{
  item: MenuItem;
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customs: any) => void;
}> = ({ item, date, isOpen, onClose, onConfirm }) => {
  const opts = item?.customizationOptions;
  const [base, setBase] = useState(opts?.bases?.[0] || '');
  const [sauce, setSauce] = useState(opts?.sauces?.[0] || '');
  const [isVeg, setIsVeg] = useState(false);
  const [avoidList, setAvoidList] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  React.useEffect(() => {
    if (isOpen) {
      setBase(opts?.bases?.[0] || '');
      setSauce(opts?.sauces?.[0] || '');
      setIsVeg(false);
      setAvoidList([]);
      setQty(1);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const toggleAvoid = (opt: string) =>
    setAvoidList(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);

  return (
    <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative bg-white w-full md:max-w-[480px] rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[92dvh] md:max-h-[85vh]"
      >
        <div className="overflow-y-auto flex-1 no-scrollbar pb-24">
          {/* Image header */}
          <div className="relative h-64 bg-[#EEEAF8] flex items-center justify-center overflow-hidden">
            <button
              onClick={onClose}
              className="absolute top-5 left-5 z-10 p-2.5 bg-[#2D1B69]/10 text-[#2D1B69] hover:bg-[#2D1B69]/20 rounded-full transition-colors"
            >
              <X size={20} className="stroke-[3]" />
            </button>
            <img src={item.image} className="w-full h-full object-cover mix-blend-multiply" alt={item.name} />
          </div>

          <div className="px-6 py-8 space-y-8">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4F53C] text-[#2D1B69] rounded-md text-[10px] font-black uppercase tracking-widest">
                • Scheduled Delivery • {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: '2-digit' })}
              </span>
              <h2 className="text-[2rem] font-serif text-[#2D1B69] leading-tight">{item.name}</h2>
              <p className="text-[13px] text-[#2D1B69]/50 font-medium leading-relaxed">{item.description}</p>
            </div>

            {opts?.bases && opts.bases.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-[#2D1B69]">Choose your base</h4>
                  <span className="text-[9px] bg-[#FEF0C7] text-[#93370D] px-2 py-1 rounded-sm font-bold tracking-widest uppercase">Required • 1</span>
                </div>
                {opts.bases.map(b => (
                  <label key={b} className="flex items-center gap-4 cursor-pointer group">
                    <div className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all', base === b ? 'border-[#2D1B69]' : 'border-[#2D1B69]/20 group-hover:border-[#2D1B69]/50')}>
                      {base === b && <div className="w-2.5 h-2.5 bg-[#2D1B69] rounded-full" />}
                    </div>
                    <span className={clsx('text-[13px] font-semibold', base === b ? 'text-[#2D1B69]' : 'text-[#2D1B69]/70')} onClick={() => setBase(b)}>{b}</span>
                  </label>
                ))}
              </div>
            )}

            {opts?.sauces && opts.sauces.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-[#2D1B69]">Choose your sauce</h4>
                  <span className="text-[9px] bg-[#FEF0C7] text-[#93370D] px-2 py-1 rounded-sm font-bold tracking-widest uppercase">Required • 1</span>
                </div>
                {opts.sauces.map(s => (
                  <label key={s} className="flex items-center gap-4 cursor-pointer group">
                    <div className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all', sauce === s ? 'border-[#2D1B69]' : 'border-[#2D1B69]/20 group-hover:border-[#2D1B69]/50')}>
                      {sauce === s && <div className="w-2.5 h-2.5 bg-[#2D1B69] rounded-full" />}
                    </div>
                    <span className={clsx('text-[13px] font-semibold', sauce === s ? 'text-[#2D1B69]' : 'text-[#2D1B69]/70')} onClick={() => setSauce(s)}>{s}</span>
                  </label>
                ))}
              </div>
            )}

            {opts?.hasVegetarianOption && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-[#2D1B69]">Make it vegetarian?</h4>
                  <span className="text-[9px] text-[#2D1B69]/40 font-bold tracking-widest uppercase">Optional</span>
                </div>
                <label className="flex items-center gap-4 cursor-pointer group" onClick={() => setIsVeg(v => !v)}>
                  <div className={clsx('w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-all', isVeg ? 'border-[#2D1B69] bg-[#2D1B69]' : 'border-[#2D1B69]/20 bg-white group-hover:border-[#2D1B69]/50')}>
                    {isVeg && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white stroke-current stroke-[3]"><path d="M2.5 7L5.5 10L11.5 4" /></svg>}
                  </div>
                  <span className={clsx('text-[13px] font-semibold', isVeg ? 'text-[#2D1B69]' : 'text-[#2D1B69]/70')}>Replace protein with mushrooms</span>
                </label>
              </div>
            )}

            {opts?.dislikes && opts.dislikes.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-[#2D1B69]">Remove ingredients</h4>
                  <span className="text-[9px] text-[#2D1B69]/40 font-bold tracking-widest uppercase">Optional</span>
                </div>
                {opts.dislikes.map(opt => (
                  <label key={opt} className="flex items-center gap-4 cursor-pointer group" onClick={() => toggleAvoid(opt)}>
                    <div className={clsx('w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-all', avoidList.includes(opt) ? 'border-[#2D1B69] bg-[#2D1B69]' : 'border-[#2D1B69]/20 bg-white group-hover:border-[#2D1B69]/50')}>
                      {avoidList.includes(opt) && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white stroke-current stroke-[3]"><path d="M2.5 7L5.5 10L11.5 4" /></svg>}
                    </div>
                    <span className={clsx('text-[13px] font-semibold', avoidList.includes(opt) ? 'text-[#2D1B69]' : 'text-[#2D1B69]/70')}>{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky action bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t border-gray-100 flex items-center gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-20">
          <div className="flex items-center justify-between bg-gray-100 rounded-full px-4 py-3 w-28">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-[#2D1B69]/60 hover:text-[#2D1B69] transition-colors font-bold text-lg leading-none">−</button>
            <span className="text-sm font-bold text-[#2D1B69]">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="text-[#2D1B69]/60 hover:text-[#2D1B69] transition-colors font-bold text-lg leading-none">+</button>
          </div>
          <button
            onClick={() => onConfirm({ base, sauce, isVegetarian: isVeg, avoid: avoidList.join(', '), quantity: qty })}
            className="flex-1 bg-[#2D1B69] text-white py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Add to My Week · ${(item.price * qty).toFixed(2)}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main OrderPage ───────────────────────────────────────────────────────────
export default function OrderPage({ cart }: { cart: any }) {
  const navigate = useNavigate();
  // Compute once per render — stable within a session
  const availableDates = React.useMemo(() => getAvailableDates(10), []);
  const [activeIdx, setActiveIdx] = useState(0);   // index into availableDates
  const [windowStart, setWindowStart] = useState(0); // first visible pill index
  const [customizingItem, setCustomizingItem] = useState<{ item: MenuItem; date: Date } | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress] = useState('');

  const activeDate = availableDates[activeIdx];
  const visibleDates = availableDates.slice(windowStart, windowStart + WINDOW_SIZE);
  const canAdvance = windowStart + WINDOW_SIZE < availableDates.length;

  const canGoBack = windowStart > 0;

  const handleArrow = () => {
    if (!canAdvance) return;
    const newWindow = windowStart + 1;
    setWindowStart(newWindow);
    if (activeIdx < newWindow) setActiveIdx(newWindow);
  };

  const handleBack = () => {
    if (!canGoBack) return;
    const newWindow = windowStart - 1;
    setWindowStart(newWindow);
    if (activeIdx >= newWindow + WINDOW_SIZE) setActiveIdx(newWindow + WINDOW_SIZE - 1);
  };
  const dayKey = getWeekdayKey(activeDate);
  const items = MENUS[dayKey]?.categories[0]?.items ?? [];
  const countdownLabel = getCountdownLabel();

  const remaining = Math.max(0, MAX_MEALS - cart.itemCount);
  const progress = Math.min((cart.itemCount / MAX_MEALS) * 100, 100);
  const discount = cart.itemCount >= MAX_MEALS ? cart.total * 0.1 : 0;
  const displayTotal = cart.total - discount;

  // Group cart items by serviceDate
  const groupedItems: { date: string; items: any[] }[] = [];
  for (const item of cart.items) {
    const group = groupedItems.find(g => g.date === item.serviceDate);
    if (group) group.items.push(item);
    else groupedItems.push({ date: item.serviceDate, items: [item] });
  }

  const handleAddToWeek = (item: MenuItem) => {
    setCustomizingItem({ item, date: activeDate });
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
    <div className="min-h-screen bg-[#F5F3FF]">
      <div className="border-y border-[#DCD5ED] bg-[#E7E1F0]">
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 text-[#2B1C70] md:grid-cols-[1fr_360px]">
          <div className="flex items-center gap-3 px-6 py-3 text-[13px] font-medium md:px-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <Clock3 size={14} className="shrink-0 text-[#2B1C70]/76" />
            <span className="text-[#2B1C70]/88">
              Place your order within <strong className="font-bold text-[#DB5A29]">{countdownLabel}</strong> for next-day lunch delivery
            </span>
          </div>
          <button
            onClick={() => { setAddress(''); setShowAddressModal(true); }}
            className="flex items-center gap-3 border-t border-[#DCD5ED] px-6 py-3 text-left text-[13px] font-medium text-[#2B1C70]/88 md:border-l md:border-t-0 md:px-8"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <MapPin size={14} className="shrink-0 text-[#2B1C70]/76" />
            <span>{address || 'Enter the delivery address'}</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1360px] px-6 py-10 md:px-8 md:py-11">

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="mb-9">
          <h1
            className="text-[#2B1C70] leading-[0.92]"
            style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(60px, 6.5vw, 92px)' }}
          >
            This Week's Picks
          </h1>
          <p className="mt-4 max-w-[650px] text-[16px] leading-[1.55] text-[#2B1C70]/80 md:text-[17px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            All orders require at least 1-day advance notice. You're viewing meals available for tomorrow and beyond. We'll cook and deliver Monday through Friday.
          </p>
        </div>

        {/* ── Day selector ─────────────────────────────────────────────────── */}
        <div className="mb-10 flex items-center gap-5 overflow-x-auto pb-1">
          {/* Back arrow */}
          {canGoBack ? (
            <button
              onClick={handleBack}
              className="mr-1 hidden h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-[#D4F84A] transition-all hover:brightness-95 md:flex"
            >
              <ArrowLeft size={20} className="text-[#2B1C70]" />
            </button>
          ) : (
            <div className="hidden w-12 shrink-0 md:block" />
          )}

          {visibleDates.map((date, visibleI) => {
            const absIdx = windowStart + visibleI;
            const dayShort = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return (
              <button
                key={absIdx}
                onClick={() => setActiveIdx(absIdx)}
                className={clsx(
                  'flex min-h-[72px] min-w-[130px] shrink-0 flex-col items-center justify-center rounded-2xl border transition-all duration-200',
                  activeIdx === absIdx
                    ? 'border-transparent bg-[#2B1C70] text-white shadow-[0_10px_24px_rgba(43,28,112,0.22)]'
                    : 'border-[#CFC7E8] bg-white text-[#2B1C70]/72 hover:border-[#2B1C70]/28'
                )}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <span className="text-[17px] font-bold leading-none">{dayShort}</span>
                <span className={clsx('mt-1.5 text-[13px] leading-none', activeIdx === absIdx ? 'text-white/70' : 'text-[#2B1C70]/40')}>
                  {dateStr}
                </span>
              </button>
            );
          })}
          <button
            onClick={handleArrow}
            disabled={!canAdvance}
            className={clsx(
              'ml-2 flex h-[72px] w-[82px] shrink-0 items-center justify-center rounded-2xl transition-all',
              canAdvance
                ? 'bg-[#D4F84A] hover:brightness-95 cursor-pointer'
                : 'bg-gray-100 cursor-not-allowed opacity-40'
            )}
          >
            <ArrowRight size={20} className="text-[#2B1C70]" />
          </button>
        </div>

        {/* ── Date header ──────────────────────────────────────────────────── */}
        <div className="mb-7 max-w-[1120px] md:mb-8">
          <h2
            className="text-[31px] font-semibold leading-[1] text-[#2B1C70] md:text-[36px]"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {activeDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <p className="mt-1 text-[13px] font-medium text-[#2B1C70]/78 md:text-[14px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Delivered by 10 am - 12 pm to your office.
          </p>
        </div>

        {/* ── Main grid: 2 meal cards + sidebar ────────────────────────────── */}
        <div className="relative max-w-[1120px]">
          {/* Gradient block behind the cards */}
          <img
            src="/assets/order/rectangle.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute left-[42%] top-[14px] w-[62%] max-w-[760px] opacity-64 md:left-[40%] md:top-[8px] md:w-[50%] xl:left-[40%] xl:top-[6px] xl:w-[41%]"
            style={{ zIndex: 0, transform: 'translateX(-56%)' }}
          />
          <div className="relative grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-[360px_360px_280px] xl:gap-7" style={{ zIndex: 1 }}>

          {/* Meal cards */}
          <AnimatePresence mode="wait">
            {items.map((item) => (
              <motion.div
                key={`${activeIdx}-${item.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="group relative z-10 flex cursor-pointer flex-col overflow-hidden rounded-[26px] border border-[#E8E1F5] bg-white shadow-[0_12px_28px_rgba(43,28,112,0.07)]"
                onClick={() => handleAddToWeek(item)}
              >
                <div className="relative h-[238px] flex-shrink-0 overflow-hidden bg-[#F7F1FB] md:h-[244px]">
                  <img
                    src={getFoodBgImage(item.name)}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                  />
                </div>
                <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                  <h3
                    className="mb-2 text-[17px] font-bold leading-[1.08] text-[#2B1C70] md:text-[18px]"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {item.name}
                  </h3>
                  <p
                    className="mb-4 min-h-[46px] line-clamp-2 text-[12px] leading-[1.28] text-[#2B1C70]/68 md:text-[13px]"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {item.description}
                  </p>
                  {(item.calories || item.protein) && (
                    <div className="mb-5 border-y border-[#ECE7F4] py-3.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="flex gap-9 text-[12px] font-medium text-[#8A7FB0]">
                        {item.calories && (
                          <span>{item.calories} cal</span>
                        )}
                        {item.protein && (
                          <span>{item.protein}g protein</span>
                        )}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => handleAddToWeek(item)}
                    className="mt-auto w-full rounded-[999px] bg-[#2B1C70] py-3 text-[12px] font-semibold tracking-[0.01em] text-white transition-colors hover:bg-[#1E1549]"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Add to My Week &nbsp;•&nbsp; ${item.price.toFixed(2)}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ── Sidebar ──────────────────────────────────────────────────────── */}
          <div
            className="relative z-10 rounded-[24px] border border-[#2B1C70]/10 bg-white p-0 shadow-[0_16px_34px_rgba(43,28,112,0.08)] md:col-span-2 xl:col-span-1 xl:sticky xl:top-28"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#DDD6EF] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={16} className="text-[#2B1C70]" strokeWidth={1.8} />
                <span className="text-[14px] font-semibold text-[#2B1C70]">My Week Lunch</span>
              </div>
              <span className="min-w-[28px] rounded-full bg-[#D4F84A] px-2.5 py-0.5 text-center text-[11px] font-black text-[#2B1C70]">
                {cart.itemCount}
              </span>
            </div>

            {/* Progress */}
            <div className="px-5 pt-4">
              {remaining > 0 && (
                <p className="mb-2.5 text-[11px] font-medium text-[#2B1C70]/58">
                  Add {remaining} more meal{remaining !== 1 ? 's' : ''} to save 10%
                </p>
              )}
              <div className="mb-5 h-[10px] w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-[#db5a29] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Cart items */}
            {cart.items.length === 0 ? (
              <div className="space-y-2 py-10 text-center">
                <ShoppingBag size={32} className="text-[#2B1C70]/15 mx-auto" strokeWidth={1.5} />
                <p className="text-xs font-medium text-[#2B1C70]/35">Your week is empty.<br/>Add a meal to get started!</p>
              </div>
            ) : (
              <div className="max-h-[332px] space-y-4 overflow-y-auto px-5 pb-3 pr-4">
                {groupedItems.map(group => (
                  <div key={group.date}>
                    <p className="mb-2.5 text-[12px] font-semibold text-[#2B1C70]/78">{group.date}</p>
                    {group.items.map((item: any) => (
                      <div
                        key={`${item.id}-${item.serviceDate}-${JSON.stringify(item.customizations)}`}
                        className="mb-2.5 flex items-start gap-3 rounded-[16px] border border-[#DCD5ED] bg-[#FBFAFE] p-3"
                      >
                        <img
                          src={getFoodBgImage(item.name)}
                          alt={item.name}
                          className="h-14 w-14 flex-shrink-0 rounded-[14px] object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[13px] font-semibold leading-[1.1] text-[#2B1C70]">{item.name}</p>
                          <p className="mt-0.5 text-[11px] font-medium text-[#2B1C70]/46">${item.price.toFixed(2)}</p>
                          {item.customizations && (() => {
                            const c = item.customizations;
                            const choices: string[] = [];
                            if (c.base)    choices.push(c.base);
                            if (c.protein) choices.push(c.protein);
                            if (c.sauce)   choices.push(c.sauce);
                            if (c.swap)    choices.push(`Swap: ${c.swap}`);
                            const hasAny = c.isVegetarian || choices.length > 0 || c.avoid;
                            if (!hasAny) return null;
                            return (
                              <div className="mt-0.5 space-y-0.5">
                                {(c.isVegetarian || choices.length > 0) && (
                                  <div className="flex flex-wrap items-center gap-1">
                                    {c.isVegetarian && (
                                      <span className="text-[7px] font-bold bg-[#DCFCE7] text-[#16A34A] px-1.5 py-0.5 rounded-full">🌿 Veg</span>
                                    )}
                                    {choices.map((ch, i) => (
                                      <span key={i} className="text-[7px] font-semibold bg-[#EDE9F7] text-[#5B5291] px-1.5 py-0.5 rounded-full">{ch}</span>
                                    ))}
                                  </div>
                                )}
                                {c.avoid && (
                                  <p className="text-[7px] text-gray-400 leading-tight"><span className="text-red-400 font-bold">✕ </span>{c.avoid}</p>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-1 pt-1 text-[#2B1C70]">
                          <button
                            onClick={() => cart.updateQuantity(item.id, item.serviceDate, -1, item.customizations)}
                            className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[#CFC7E8] text-xs font-bold transition-colors hover:bg-[#F5F3FF]"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => cart.updateQuantity(item.id, item.serviceDate, 1, item.customizations)}
                            className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[#CFC7E8] text-xs font-bold transition-colors hover:bg-[#F5F3FF]"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => cart.removeItem(item.id, item.serviceDate, item.customizations)}
                          className="text-red-400 hover:text-red-600 transition-colors ml-1 flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            {cart.items.length > 0 && (
              <div className="mt-2 border-t border-[#DDD6EF] px-5 pb-4 pt-3.5">
                {discount > 0 && (
                  <p className="mb-2.5 text-right text-[10px] font-medium text-[#2B1C70]/42">You're saving 10%</p>
                )}
                <button
                  onClick={() => { setAddress(''); setShowAddressModal(true); }}
                  className="flex w-full items-center justify-between rounded-[999px] bg-[#D4F84A] px-5 py-3.5 text-[14px] font-black text-[#2B1C70] transition-all hover:brightness-95"
                >
                  <span>Checkout</span>
                  <span>${displayTotal.toFixed(2)}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* ── Address Modal ────────────────────────────────────────────────────── */}
      {showAddressModal && (
        <div
          onClick={() => setShowAddressModal(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: '440px', padding: '28px', fontFamily: 'Poppins, sans-serif' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#2B1C70' }}>Enter the delivery address</h2>
              <button onClick={() => setShowAddressModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(43,28,112,0.35)', pointerEvents: 'none' }} />
              <input
                autoFocus
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && address.trim()) {
                    setShowAddressModal(false);
                    navigate('/checkout');
                  }
                  if (e.key === 'Escape') setShowAddressModal(false);
                }}
                placeholder="Search for an address"
                style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '42px', paddingRight: '16px', paddingTop: '13px', paddingBottom: '13px', borderRadius: '12px', border: '1.5px solid rgba(43,28,112,0.14)', background: '#F5F3FF', fontSize: '14px', color: '#2B1C70', outline: 'none', fontFamily: 'Poppins, sans-serif' }}
              />
            </div>

            {address.trim() && (
              <button
                onClick={() => { setShowAddressModal(false); navigate('/checkout'); }}
                style={{ marginTop: '10px', width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '12px', background: '#F5F3FF', border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
              >
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(43,28,112,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={14} color="#2B1C70" />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#2B1C70', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{address}</span>
              </button>
            )}

            <button
              onClick={() => { if (address.trim()) { setShowAddressModal(false); navigate('/checkout'); } }}
              style={{ marginTop: '14px', width: '100%', background: address.trim() ? '#D4F84A' : '#e5e7eb', color: '#2B1C70', padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', border: 'none', cursor: address.trim() ? 'pointer' : 'default', opacity: address.trim() ? 1 : 0.45, fontFamily: 'Poppins, sans-serif' }}
            >
              Continue to checkout
            </button>
          </div>
        </div>
      )}

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
