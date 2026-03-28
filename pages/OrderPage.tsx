import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ArrowRight, ArrowLeft, Trash2, Search, MapPin } from 'lucide-react';
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

/** Human-readable delivery context shown below the day pills */
function getDeliveryNote(): string {
  const now = getEtNow();
  if (isWeekend(now)) {
    return "We don't deliver on weekends — showing next week's menu.";
  }
  if (now.getHours() < CUTOFF_HOUR) {
    const remaining = CUTOFF_HOUR - now.getHours();
    return `Order within the next ~${remaining} hour${remaining !== 1 ? 's' : ''} to get today's delivery.`;
  }
  return 'Orders placed now will be delivered the next business day.';
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
  const deliveryNote = getDeliveryNote();

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
    <div className="min-h-screen bg-[#F5F3FF] pt-[100px] md:pt-[116px]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1
            className="text-[#2B1C70] leading-tight"
            style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(40px, 6vw, 64px)' }}
          >
            This Week's Picks
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {deliveryNote}
          </p>
        </div>

        {/* ── Day selector ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {/* Back arrow */}
          <button
            onClick={handleBack}
            disabled={!canGoBack}
            className={clsx(
              'flex-shrink-0 rounded-xl px-4 py-4 mr-1 transition-all',
              canGoBack
                ? 'bg-[#D4F84A] hover:brightness-95 cursor-pointer'
                : 'bg-gray-100 cursor-not-allowed opacity-40'
            )}
          >
            <ArrowLeft size={20} className="text-[#2B1C70]" />
          </button>

          {visibleDates.map((date, visibleI) => {
            const absIdx = windowStart + visibleI;
            const dayShort = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const isToday = date.toDateString() === getEtNow().toDateString();
            return (
              <button
                key={absIdx}
                onClick={() => setActiveIdx(absIdx)}
                className={clsx(
                  'flex-shrink-0 flex flex-col items-center px-5 py-2.5 rounded-xl border transition-all duration-200 min-w-[80px]',
                  activeIdx === absIdx
                    ? 'bg-[#2B1C70] text-white border-transparent shadow-md'
                    : 'bg-white text-[#2B1C70] border-gray-200 hover:border-[#2B1C70]/40'
                )}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <span className="text-sm font-semibold">{isToday ? 'Today' : dayShort}</span>
                <span className={clsx('text-xs mt-0.5', activeIdx === absIdx ? 'text-white/70' : 'text-gray-400')}>
                  {dateStr}
                </span>
              </button>
            );
          })}
          <button
            onClick={handleArrow}
            disabled={!canAdvance}
            className={clsx(
              'flex-shrink-0 rounded-xl px-4 py-4 ml-1 transition-all',
              canAdvance
                ? 'bg-[#D4F84A] hover:brightness-95 cursor-pointer'
                : 'bg-gray-100 cursor-not-allowed opacity-40'
            )}
          >
            <ArrowRight size={20} className="text-[#2B1C70]" />
          </button>
        </div>

        {/* ── Date header ──────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h2
            className="text-2xl md:text-3xl font-bold text-[#2B1C70]"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {activeDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Delivered by 10 am - 12 pm to your office.
          </p>
        </div>

        {/* ── Main grid: 2 meal cards + sidebar ────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_320px] gap-6 items-start">

          {/* Meal cards */}
          <AnimatePresence mode="wait">
            {items.map((item) => (
              <motion.div
                key={`${activeIdx}-${item.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                <div className="relative h-56 overflow-hidden bg-[#EEEAF8]">
                  <img
                    src={getFoodBgImage(item.name)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3
                    className="font-bold text-[#2B1C70] text-lg leading-tight"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {item.name}
                  </h3>
                  <p
                    className="text-sm text-gray-500 mt-1 line-clamp-2"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {item.description}
                  </p>
                  {(item.calories || item.protein) && (
                    <div className="flex gap-4 mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {item.calories && (
                        <span className="text-xs text-gray-400">{item.calories} cal</span>
                      )}
                      {item.protein && (
                        <span className="text-xs text-gray-400">{item.protein}g protein</span>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => handleAddToWeek(item)}
                    className="mt-4 w-full bg-[#2B1C70] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#1E1549] transition-colors"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Add to My Week · ${item.price.toFixed(2)}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ── Sidebar ──────────────────────────────────────────────────────── */}
          <div
            className="bg-white rounded-2xl p-5 md:col-span-2 lg:col-span-1 lg:sticky lg:top-28"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag size={18} className="text-[#2B1C70]" strokeWidth={1.8} />
              <span className="font-semibold text-[#2B1C70] flex-1 text-sm">My Week Lunch</span>
              <span className="bg-[#D4F84A] text-[#2B1C70] text-xs font-bold px-2.5 py-0.5 rounded-full min-w-[24px] text-center">
                {cart.itemCount}
              </span>
            </div>

            {/* Progress */}
            {remaining > 0 && (
              <p className="text-xs text-gray-500 mb-2">
                Add {remaining} more meal{remaining !== 1 ? 's' : ''} to save 10%
              </p>
            )}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-[#db5a29] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Cart items */}
            {cart.items.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Your week is empty. Add a meal!</p>
            ) : (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {groupedItems.map(group => (
                  <div key={group.date}>
                    <p className="text-xs text-gray-400 font-semibold mb-2">{group.date}</p>
                    {group.items.map((item: any) => (
                      <div
                        key={`${item.id}-${item.serviceDate}-${JSON.stringify(item.customizations)}`}
                        className="flex items-center gap-2 mb-2"
                      >
                        <img
                          src={getFoodBgImage(item.name)}
                          alt={item.name}
                          className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#2B1C70] truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[#2B1C70]">
                          <button
                            onClick={() => cart.updateQuantity(item.id, item.serviceDate, -1, item.customizations)}
                            className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center text-xs hover:bg-gray-50 transition-colors"
                          >
                            −
                          </button>
                          <span className="text-xs w-4 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => cart.updateQuantity(item.id, item.serviceDate, 1, item.customizations)}
                            className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center text-xs hover:bg-gray-50 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => cart.removeItem(item.id, item.serviceDate, item.customizations)}
                          className="text-gray-300 hover:text-red-400 transition-colors ml-1 flex-shrink-0"
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
              <div className="mt-4 pt-3 border-t border-gray-100">
                {discount > 0 && (
                  <p className="text-xs text-green-600 text-right mb-2 font-medium">You're saving 10%</p>
                )}
                <button
                  onClick={() => { setAddress(''); setShowAddressModal(true); }}
                  className="w-full bg-[#D4F84A] text-[#2B1C70] py-3.5 rounded-xl font-bold text-sm flex justify-between items-center px-4 hover:brightness-95 transition-all shadow-sm"
                >
                  <span>Checkout</span>
                  <span>$ {displayTotal.toFixed(2)}</span>
                </button>
              </div>
            )}
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
