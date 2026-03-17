import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Plus, X, Leaf, MapPin } from 'lucide-react';
import { MENUS } from '../data/menus';
import { MenuItem, Weekday } from '../types';
import {
  calculateActiveOrderDay,
  getDateStatus,
  getEtNow,
  isWeekend,
  findNextServiceDay,
} from '../utils/dateLogic';
import { clsx } from 'clsx';

// ─── Image map ───────────────────────────────────────────────────────────────
const FOOD_IMAGES: Record<string, string> = {
  'carne asada':           '/assets/food-bg/carne-asada.webp',
  'chicken lime':          '/assets/food-bg/chicken-lime.webp',
  'mediterranean chicken': '/assets/food-bg/mediterranean-chicken.webp',
  'bibi bump rice':        '/assets/food-bg/bibi-bamp-rice.webp',
  'chicken pesto pasta':   '/assets/food-bg/pesto-pasta.webp',
  'thai beef salad':       '/assets/food-bg/thai-beef-salad.webp',
  'milanesa':              '/assets/food-bg/milanesa.webp',
  'harissa meatballs':     '/assets/food-bg/harissa-meatballs.webp',
  'crispy korean chicken': '/assets/food-bg/korean-crispy-chicken.webp',
  'chicken caesar salad':  '/assets/food-bg/chicken-cesar-salad.webp',
};

function getFoodImage(name: string): string {
  const key = name.toLowerCase().trim();
  const match = Object.entries(FOOD_IMAGES).find(([k]) => key.includes(k) || k.includes(key));
  return match ? match[1] : '/assets/food-bg/korean-crispy-chicken.webp';
}

// ─── Week dates (Mon–Fri of current or next week) ────────────────────────────
function getThisWeekDates(): Date[] {
  const now = getEtNow();
  const dow = now.getDay();
  const daysToMonday = dow === 0 ? 1 : dow === 6 ? 2 : 1 - dow;
  // If we're past Friday, jump to next week's Monday
  const baseOffset = dow === 0 || dow === 6 ? daysToMonday : daysToMonday;
  const monday = new Date(now);
  monday.setDate(now.getDate() + baseOffset);
  monday.setHours(12, 0, 0, 0);

  // Build Mon→Fri of THAT week; if current weekday show current week
  const currentWeekMonday = new Date(now);
  if (dow >= 1 && dow <= 5) {
    currentWeekMonday.setDate(now.getDate() - (dow - 1));
  } else if (dow === 6) {
    currentWeekMonday.setDate(now.getDate() + 2);
  } else {
    currentWeekMonday.setDate(now.getDate() + 1);
  }
  currentWeekMonday.setHours(12, 0, 0, 0);

  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(currentWeekMonday);
    d.setDate(currentWeekMonday.getDate() + i);
    return d;
  });
}

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const WEEKDAY_KEYS: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQ_LEFT = [
  {
    q: 'How do I get started?',
    a: 'Pick your meals, choose your delivery day, and place your order. We cook everything fresh and deliver it straight to your door.',
  },
  {
    q: 'Can I pause or cancel anytime?',
    a: 'Yes! You can pause or cancel your order anytime before 10 PM the day before without any fees.',
  },
  {
    q: "What if I don't like it?",
    a: "We stand behind our food 100%. If you're not satisfied, reach out and we'll make it right — no questions asked.",
  },
  {
    q: 'Do I have to order every week?',
    a: 'No subscription required. Order whenever you want — once a week, daily, or whenever the mood strikes.',
  },
];

const FAQ_RIGHT = [
  {
    q: 'What if I have dietary restrictions?',
    a: "Every meal has customization options. You can swap bases, sauces, and remove ingredients you don't like.",
  },
  {
    q: 'When do I get my delivery?',
    a: 'Orders placed before 10 PM are delivered the next business day by lunchtime.',
  },
  {
    q: 'Are the meals made fresh?',
    a: 'Yes — we cook every morning and deliver the same day. Never frozen, never reheated.',
  },
  {
    q: 'Do you deliver everywhere?',
    a: 'We currently serve Brickell, Downtown, Bayside, and Coral Gables. More zones coming soon!',
  },
];

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
          <div className="relative h-64 bg-[#F3F4F6] flex items-center justify-center overflow-hidden">
            <button
              onClick={onClose}
              className="absolute top-5 left-5 z-10 p-2.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 rounded-full transition-colors"
            >
              <X size={20} className="stroke-[3]" />
            </button>
            <img
              src={getFoodImage(item.name)}
              className="w-full h-full object-cover mix-blend-multiply"
              alt={item.name}
            />
          </div>

          <div className="px-6 py-8 space-y-8">
            {/* Title */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-lime text-brand-primary rounded-md text-[10px] font-black uppercase tracking-widest">
                • Scheduled Delivery • {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: '2-digit' })}
              </span>
              <h2 className="text-[2rem] font-serif text-brand-primary leading-tight">{item.name}</h2>
              <p className="text-[13px] text-brand-primary/50 font-medium leading-relaxed">{item.description}</p>
            </div>

            {/* Bases */}
            {opts?.bases && opts.bases.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-brand-primary">Choose your base</h4>
                  <span className="text-[9px] bg-[#FEF0C7] text-[#93370D] px-2 py-1 rounded-sm font-bold tracking-widest uppercase">Required • 1</span>
                </div>
                {opts.bases.map(b => (
                  <label key={b} className="flex items-center gap-4 cursor-pointer group">
                    <div className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all', base === b ? 'border-brand-primary' : 'border-brand-primary/20 group-hover:border-brand-primary/50')}>
                      {base === b && <div className="w-2.5 h-2.5 bg-brand-primary rounded-full" />}
                    </div>
                    <span className={clsx('text-[13px] font-semibold', base === b ? 'text-brand-primary' : 'text-brand-primary/70')} onClick={() => setBase(b)}>{b}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Sauces */}
            {opts?.sauces && opts.sauces.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-brand-primary">Choose your sauce</h4>
                  <span className="text-[9px] bg-[#FEF0C7] text-[#93370D] px-2 py-1 rounded-sm font-bold tracking-widest uppercase">Required • 1</span>
                </div>
                {opts.sauces.map(s => (
                  <label key={s} className="flex items-center gap-4 cursor-pointer group">
                    <div className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all', sauce === s ? 'border-brand-primary' : 'border-brand-primary/20 group-hover:border-brand-primary/50')}>
                      {sauce === s && <div className="w-2.5 h-2.5 bg-brand-primary rounded-full" />}
                    </div>
                    <span className={clsx('text-[13px] font-semibold', sauce === s ? 'text-brand-primary' : 'text-brand-primary/70')} onClick={() => setSauce(s)}>{s}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Vegetarian */}
            {opts?.hasVegetarianOption && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-brand-primary">Make it vegetarian?</h4>
                  <span className="text-[9px] text-brand-primary/40 font-bold tracking-widest uppercase">Optional</span>
                </div>
                <label className="flex items-center gap-4 cursor-pointer group" onClick={() => setIsVeg(v => !v)}>
                  <div className={clsx('w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-all', isVeg ? 'border-brand-primary bg-brand-primary' : 'border-brand-primary/20 bg-white group-hover:border-brand-primary/50')}>
                    {isVeg && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white stroke-current stroke-[3]"><path d="M2.5 7L5.5 10L11.5 4" /></svg>}
                  </div>
                  <span className={clsx('text-[13px] font-semibold', isVeg ? 'text-brand-primary' : 'text-brand-primary/70')}>Replace protein with mushrooms</span>
                </label>
              </div>
            )}

            {/* Dislikes */}
            {opts?.dislikes && opts.dislikes.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-brand-primary">Remove ingredients</h4>
                  <span className="text-[9px] text-brand-primary/40 font-bold tracking-widest uppercase">Optional</span>
                </div>
                {opts.dislikes.map(opt => (
                  <label key={opt} className="flex items-center gap-4 cursor-pointer group" onClick={() => toggleAvoid(opt)}>
                    <div className={clsx('w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-all', avoidList.includes(opt) ? 'border-brand-primary bg-brand-primary' : 'border-brand-primary/20 bg-white group-hover:border-brand-primary/50')}>
                      {avoidList.includes(opt) && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white stroke-current stroke-[3]"><path d="M2.5 7L5.5 10L11.5 4" /></svg>}
                    </div>
                    <span className={clsx('text-[13px] font-semibold', avoidList.includes(opt) ? 'text-brand-primary' : 'text-brand-primary/70')}>{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky action bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t border-gray-100 flex items-center gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-20">
          <div className="flex items-center justify-between bg-[#F3F4F6] rounded-full px-4 py-3 w-28">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-brand-primary/60 hover:text-brand-primary transition-colors font-bold text-lg leading-none">−</button>
            <span className="text-sm font-bold text-brand-primary">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="text-brand-primary/60 hover:text-brand-primary transition-colors font-bold text-lg leading-none">+</button>
          </div>
          <button
            onClick={() => onConfirm({ base, sauce, isVegetarian: isVeg, avoid: avoidList.join(', '), quantity: qty })}
            className="flex-1 bg-brand-primary text-white py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
          >
            Add to My Week · ${(item.price * qty).toFixed(2)}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Dish Card ────────────────────────────────────────────────────────────────
const DishCard: React.FC<{ item: MenuItem; onTryNow: (item: MenuItem) => void; available: boolean }> = ({
  item, onTryNow, available,
}) => {
  const hasVeg = !!item.customizationOptions?.hasVegetarianOption;
  return (
    <div className={clsx('flex flex-col items-center w-full', !available && 'opacity-40 pointer-events-none')}>
      {/* Circular image */}
      <div
        className="relative z-10 w-[220px] h-[220px] md:w-[280px] md:h-[280px] rounded-full overflow-hidden border-[5px] border-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] -mb-[70px] md:-mb-[90px] flex-shrink-0 cursor-pointer"
        onClick={() => onTryNow(item)}
      >
        <img
          src={getFoodImage(item.name)}
          alt={item.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
        />
        {/* Veg icon badge */}
        {hasVeg && (
          <div className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
            <Leaf size={13} className="text-green-600" strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Lime label card */}
      <div
        className="w-full bg-brand-lime rounded-[1.5rem] pt-[84px] md:pt-[108px] pb-7 px-6 cursor-pointer hover:brightness-[0.97] transition-all"
        onClick={() => onTryNow(item)}
      >
        <span className="inline-block bg-brand-primary text-white text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-md mb-3">
          {item.name}
        </span>
        <p className="text-brand-primary/70 text-sm leading-relaxed font-medium">
          {item.description}
        </p>
      </div>
    </div>
  );
};

// ─── FAQ Item (accordion) ─────────────────────────────────────────────────────
const FAQItem: React.FC<{
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
  dark?: boolean;
}> = ({ q, a, isOpen, onToggle, dark }) => (
  <div
    className={clsx(
      'rounded-2xl border transition-all duration-200 cursor-pointer select-none',
      isOpen && dark
        ? 'bg-brand-primary border-brand-primary text-white'
        : isOpen
        ? 'bg-brand-primary/5 border-brand-primary/20'
        : 'bg-white border-gray-200 hover:border-brand-primary/30',
    )}
    onClick={onToggle}
  >
    <div className="flex items-center justify-between p-4 md:p-5 gap-3">
      <span className={clsx('text-sm font-bold leading-snug', isOpen && dark ? 'text-white' : 'text-brand-primary')}>
        {q}
      </span>
      <div className={clsx('flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all', isOpen && dark ? 'border-white' : 'border-brand-primary/20')}>
        {isOpen
          ? <X size={13} className={isOpen && dark ? 'text-white' : 'text-brand-primary'} strokeWidth={2.5} />
          : <Plus size={13} className="text-brand-primary/50" strokeWidth={2.5} />
        }
      </div>
    </div>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <p className={clsx('px-5 pb-5 text-[13px] leading-relaxed font-medium', dark ? 'text-white/75' : 'text-brand-primary/60')}>
            {a}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MenuPage({ cart }: { cart: any }) {
  const weekDates = useMemo(() => getThisWeekDates(), []);

  // Default to the active order day index
  const defaultIndex = useMemo(() => {
    const active = calculateActiveOrderDay();
    const activeKey = active.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const idx = weekDates.findIndex(d => {
      return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) === activeKey;
    });
    return idx >= 0 ? idx : 0;
  }, [weekDates]);

  const [selectedDay, setSelectedDay] = useState(defaultIndex);
  const [openFaqLeft, setOpenFaqLeft] = useState<number | null>(0);
  const [openFaqRight, setOpenFaqRight] = useState<number | null>(null);
  const [customizingItem, setCustomizingItem] = useState<{ item: MenuItem; date: Date } | null>(null);

  const selectedDate = weekDates[selectedDay];
  const dayKey = WEEKDAY_KEYS[selectedDay];
  const dayMenu = MENUS[dayKey];
  const items = dayMenu?.categories[0]?.items ?? [];

  const dateStatus = getDateStatus(selectedDate);
  const isAvailable = dateStatus === 'ACTIVE' || dateStatus === 'PREVIEW';

  const handleTryNow = (item: MenuItem) => {
    if (!isAvailable) return;
    setCustomizingItem({ item, date: selectedDate });
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
    <div className="bg-[#F5F3FF] min-h-screen font-sans overflow-x-hidden">

      {/* ── 1. THE WEEKLY SYSTEM ──────────────────────────────────────────────── */}
      <section className="pt-16 pb-16 px-5 md:px-12 max-w-5xl mx-auto">

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-[3.2rem] font-black text-brand-primary leading-tight">
            The Weekly System
          </h1>
          <p className="mt-2 text-brand-primary/55 text-sm md:text-base font-medium">
            Choose between two fresh options every day.
          </p>
        </div>

        {/* Day pills */}
        <div className="flex items-center justify-center gap-1 md:gap-2 mb-10">
          <div className="flex items-center bg-white rounded-full border border-gray-200 shadow-sm px-1 py-1 gap-1">
            {DAY_LABELS.map((label, i) => {
              const st = getDateStatus(weekDates[i]);
              const isPast = st === 'PAST' || st === 'TODAY_CLOSED';
              const isSelected = selectedDay === i;
              return (
                <button
                  key={label}
                  onClick={() => !isPast && setSelectedDay(i)}
                  disabled={isPast}
                  className={clsx(
                    'px-4 md:px-6 py-2 rounded-full text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all',
                    isSelected
                      ? 'text-brand-orange border-b-2 border-brand-orange bg-transparent'
                      : isPast
                      ? 'text-brand-primary/25 cursor-not-allowed'
                      : 'text-brand-primary hover:text-brand-primary/70',
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Two dish cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {items.length > 0 ? (
              items.map(item => (
                <DishCard key={item.id} item={item} onTryNow={handleTryNow} available={isAvailable} />
              ))
            ) : (
              <div className="col-span-2 py-24 text-center text-brand-primary/30 font-bold text-sm">
                No meals available for this day yet.
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer row: veg badge + TRY NOW */}
        {items.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            {/* Vegetarian badge */}
            {items.some(i => !!i.customizationOptions?.hasVegetarianOption) && (
              <div className="flex items-center gap-2 text-brand-primary/60 text-xs font-semibold">
                <span className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center">
                  <Leaf size={11} className="text-green-600" />
                </span>
                Vegetarian Options Available
              </div>
            )}
            <div className="ml-auto">
              {isAvailable ? (
                <button
                  onClick={() => items[0] && handleTryNow(items[0])}
                  className="px-8 py-3.5 bg-brand-orange text-white rounded-full font-black uppercase tracking-[0.18em] text-[11px] hover:opacity-90 transition-opacity shadow-md"
                >
                  Try Now
                </button>
              ) : (
                <span className="px-8 py-3.5 bg-brand-primary/10 text-brand-primary/30 rounded-full font-black uppercase tracking-[0.18em] text-[11px] cursor-not-allowed">
                  Not Available
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── 2. GOT QUESTIONS ──────────────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20 px-5 md:px-12">
        <div className="max-w-4xl mx-auto">

          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-brand-primary leading-tight">
              Got Questions?
            </h2>
            <p
              className="text-3xl md:text-4xl text-brand-orange mt-1"
              style={{ fontFamily: '"Nothing You Could Do", cursive', transform: 'rotate(-1deg)', display: 'inline-block' }}
            >
              We've Got Answers
            </p>
          </div>

          {/* Two-column FAQ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* Left column */}
            <div className="space-y-3">
              {FAQ_LEFT.map((faq, i) => (
                <FAQItem
                  key={i}
                  q={faq.q}
                  a={faq.a}
                  isOpen={openFaqLeft === i}
                  onToggle={() => setOpenFaqLeft(openFaqLeft === i ? null : i)}
                  dark={openFaqLeft === i}
                />
              ))}
            </div>

            {/* Right column */}
            <div className="space-y-3">
              {FAQ_RIGHT.map((faq, i) => (
                <FAQItem
                  key={i}
                  q={faq.q}
                  a={faq.a}
                  isOpen={openFaqRight === i}
                  onToggle={() => setOpenFaqRight(openFaqRight === i ? null : i)}
                />
              ))}

              {/* Still have questions */}
              <div className="mt-6 flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <img src="/assets/stickers/blank-sticker.png" alt="" className="w-24 h-auto" style={{ filter: 'hue-rotate(30deg) saturate(1.5)' }} />
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white uppercase tracking-widest text-center leading-tight px-2">
                    Still Have<br />Questions?
                  </span>
                </div>
                <p className="text-brand-primary/60 text-sm font-medium leading-relaxed mt-2">
                  Email us at{' '}
                  <a href="mailto:hello@knwnfood.com" className="text-brand-primary font-bold underline decoration-dotted hover:text-brand-orange transition-colors">
                    hello@knwnfood.com
                  </a>
                  . We're here to help!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FIND THE REAL LUNCH (comparison) ──────────────────────────────── */}
      <section className="bg-brand-orange py-16 md:py-20 px-5 md:px-12 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 max-w-lg">
            <h2 className="text-4xl md:text-[3.2rem] font-black text-white leading-tight">
              Find the{' '}
              <em
                style={{ fontFamily: '"Nothing You Could Do", cursive', fontStyle: 'normal', fontSize: '1.1em' }}
              >
                real
              </em>{' '}
              lunch.
            </h2>
            <p className="text-white/65 text-sm leading-relaxed font-medium mt-3">
              Real lunch is fresh, quality produce, no antibiotics or hormones ever, no seed oils, and sauces made from scratch — no preservatives, just real ingredients.
            </p>
          </div>

          {/* Table */}
          <div className="relative">
            <div className="rounded-2xl overflow-x-auto shadow-2xl bg-white">
              <table className="w-full text-center border-collapse min-w-[480px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="p-4 md:p-5 text-left w-[36%]" />
                    {['Pricing', 'Food Quality', 'Convenience', 'No Hidden Fees'].map(col => (
                      <th key={col} className="p-4 md:p-5">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-primary/35">{col}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-gray-100 bg-[#F5F3FF]">
                    <td className="p-4 md:p-5 text-left text-[10px] md:text-xs font-black uppercase tracking-wider text-brand-primary">KNWN Real Food Lunch</td>
                    {[true, true, true, true].map((_, i) => (
                      <td key={i} className="p-4 md:p-5">
                        <Check size={17} strokeWidth={3} className="mx-auto text-brand-orange" />
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 md:p-5 text-left text-[10px] md:text-xs font-black uppercase tracking-wider text-brand-primary/40">Meal Prep Service</td>
                    <td className="p-4 md:p-5"><Check size={17} strokeWidth={3} className="mx-auto text-brand-orange" /></td>
                    <td /><td /><td />
                  </tr>
                  <tr>
                    <td className="p-4 md:p-5 text-left text-[10px] md:text-xs font-black uppercase tracking-wider text-brand-primary/40">Restaurant & Delivery Apps</td>
                    <td /><td />
                    <td className="p-4 md:p-5"><Check size={17} strokeWidth={3} className="mx-auto text-brand-orange" /></td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ORDER NOW sticker */}
            <motion.button
              animate={{ rotate: [3, 6, 3] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              onClick={() => items[0] && handleTryNow(items[0])}
              className="absolute -bottom-4 -right-2 md:-right-6 bg-brand-lime text-brand-primary font-black uppercase tracking-widest text-xs px-5 py-3 rounded-xl shadow-xl hover:brightness-95 transition-all"
              style={{ transform: 'rotate(4deg)' }}
            >
              Order<br />Now
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── 4. DELIVERY ZONE CHECK ────────────────────────────────────────────── */}
      <section className="relative bg-brand-primary overflow-hidden py-10 px-5 md:px-12">
        {/* Delivery moto */}
        <img
          src="/assets/delivery-moto.png"
          alt=""
          aria-hidden
          className="absolute right-0 bottom-0 h-full object-contain object-right-bottom pointer-events-none select-none"
          style={{ mixBlendMode: 'screen', maxWidth: '240px' }}
        />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 pr-0 md:pr-52">
          <p className="text-white font-black text-lg md:text-xl leading-snug flex-shrink-0 md:w-52">
            Check if we deliver<br />to your office.
          </p>

          <div className="flex items-center gap-3 flex-1 max-w-sm">
            <div className="flex-1 flex items-center bg-white rounded-full overflow-hidden">
              <MapPin size={15} className="ml-4 flex-shrink-0 text-brand-primary/40" />
              <input
                type="text"
                placeholder="Enter ZIP code"
                className="flex-1 py-3 px-3 text-sm text-brand-primary placeholder-brand-primary/30 outline-none font-medium bg-transparent"
              />
            </div>
            <button className="w-11 h-11 flex-shrink-0 rounded-full bg-brand-lime flex items-center justify-center hover:brightness-95 transition-all">
              <ArrowRight size={17} className="text-brand-primary" strokeWidth={2.5} />
            </button>
          </div>

          <p className="hidden lg:block text-white/50 text-xs leading-relaxed flex-shrink-0 max-w-[200px]">
            Now serving Brickell, Downtown, Bayside, and Coral Gables.
          </p>
        </div>
      </section>

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
