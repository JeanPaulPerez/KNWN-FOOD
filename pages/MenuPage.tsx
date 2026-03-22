import React, { useState } from 'react';
import ZipCode from '../components/ZipCode';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Plus, X, Leaf, MapPin } from 'lucide-react';
import { MENUS } from '../data/menus';
import { MenuItem, Weekday } from '../types';
import { getEtNow } from '../utils/dateLogic';
import { clsx } from 'clsx';

// ─── Constants ────────────────────────────────────────────────────────────────
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const DAY_KEYS: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

const DAY_IMAGES: Record<Weekday, [string, string]> = {
  monday: ['/assets/menu/Menu_Platos/Monday/4.png', '/assets/menu/Menu_Platos/Monday/3.png'],
  tuesday: ['/assets/menu/Menu_Platos/Tuesday/2.png', '/assets/menu/Menu_Platos/Tuesday/1.png'],
  wednesday: ['/assets/menu/Menu_Platos/Wednesday/5.png', '/assets/menu/Menu_Platos/Wednesday/7.png'],
  thursday: ['/assets/menu/Menu_Platos/Thursday/6.png', '/assets/menu/Menu_Platos/Thursday/8.png'],
  friday: ['/assets/menu/Menu_Platos/Friday/9.png', '/assets/menu/Menu_Platos/Friday/10.png'],
};

// ─── Cutout plate images (transparent PNGs, used for the card layout) ─────────
const CUTOUT_IMAGES: Record<string, string> = {
  'mediterranean chicken': '/assets/food-cutout/mediterranean-chicken.png',
  'bibi bump rice': '/assets/food-bg/bibi-bamp-rice.webp',
  'carne asada': '/assets/food-cutout/carne-asada.png',
  'chicken lime': '/assets/food-cutout/chicken-lime.png',
  'chicken pesto pasta': '/assets/food-cutout/pesto-pasta.png',
  'thai beef salad': '/assets/food-cutout/thai-beef-salad.png',
  'milanesa': '/assets/food-cutout/milanesa.png',
  'harissa meatballs': '/assets/food-cutout/harissa-meatballs.png',
  'crispy korean chicken': '/assets/food-cutout/korean-crispy-chicken.png',
  'chicken caesar salad': '/assets/food-cutout/chicken-cesar-salad.png',
};

function getCutoutImage(name: string): string {
  const key = name.toLowerCase().trim();
  const match = Object.entries(CUTOUT_IMAGES).find(([k]) => key.includes(k) || k.includes(key));
  return match ? match[1] : '/assets/food-bg/carne-asada.webp';
}

// Derive a real Date for a given day-of-week index (0=Mon … 4=Fri)
function getDateForDayIndex(dayIndex: number): Date {
  const now = getEtNow();
  const dow = now.getDay(); // 0=Sun, 1=Mon, …
  const todayMondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + todayMondayOffset);
  monday.setHours(12, 0, 0, 0);
  const d = new Date(monday);
  d.setDate(monday.getDate() + dayIndex);
  return d;
}

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQ_LEFT = [
  {
    q: 'How do I get started?',
    a: 'Pick your meals, choose your delivery day, and place your order. We cook everything fresh and deliver it straight to your door.',
  },
  { q: 'Can I pause or cancel anytime?', a: 'Yes! You can pause or cancel your order anytime before 10 PM the day before without any fees.' },
  { q: "What if I don't like it?", a: "We stand behind our food 100%. If you're not satisfied, reach out and we'll make it right — no questions asked." },
  { q: 'Do I have to order every week?', a: 'No subscription required. Order whenever you want — once a week, daily, or whenever the mood strikes.' },
];

const FAQ_RIGHT = [
  { q: 'What if I have dietary restrictions?', a: "Every meal has customization options. You can swap bases, sauces, and remove ingredients you don't like." },
  { q: 'When do I get my delivery?', a: 'Orders placed before 10 PM are delivered the next business day by lunchtime.' },
  { q: 'Are the meals made fresh?', a: 'Yes — we cook every morning and deliver the same day. Never frozen, never reheated.' },
  { q: 'Do you deliver everywhere?', a: 'We currently serve Brickell, Downtown, Bayside, and Coral Gables. More zones coming soon!' },
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

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
const FAQItem: React.FC<{
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
  dark?: boolean;
}> = ({ q, a, isOpen, onToggle, dark }) => (
  <div
    onClick={onToggle}
    className="cursor-pointer select-none transition-all duration-200"
    style={
      isOpen && dark
        ? { background: '#2D1B69', borderRadius: '16px' }
        : isOpen
          ? { background: 'rgba(45,27,105,0.05)', border: '1.5px solid #2D1B69', borderRadius: '16px' }
          : { border: '1.5px solid #2D1B69', borderRadius: '9999px', background: '#fff' }
    }
  >
    <div className="flex items-center justify-between px-5 py-3 gap-3">
      <span
        className="text-sm leading-snug"
        style={{
          fontFamily: isOpen && dark ? '"Instrument Serif", serif' : 'Poppins, sans-serif',
          fontWeight: isOpen && dark ? 600 : 500,
          color: isOpen && dark ? '#FFFFFF' : '#2D1B69',
        }}
      >
        {q}
      </span>
      {/* Icon circle — white when active-dark, grey ring when collapsed */}
      <div
        className="flex-shrink-0 flex items-center justify-center transition-all"
        style={{
          width: '28px', height: '28px',
          borderRadius: '50%',
          border: isOpen && dark ? '1.5px solid rgba(255,255,255,0.5)' : '1.5px solid #2D1B69',
          flexShrink: 0,
        }}
      >
        {isOpen
          ? <X size={12} color={dark ? '#FFFFFF' : '#2D1B69'} strokeWidth={2.5} />
          : <Plus size={12} color="#2D1B69" strokeWidth={2} />}
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
          <p
            className="px-5 pb-5 text-[13px] leading-relaxed"
            style={{
              fontFamily: 'Poppins, sans-serif',
              color: dark ? 'rgba(255,255,255,0.72)' : 'rgba(45,27,105,0.6)',
            }}
          >
            {a}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MenuPage({ cart }: { cart: any }) {
  const [activeDay, setActiveDay] = useState(1); // default Tuesday
  const [openFaqLeft, setOpenFaqLeft] = useState<number | null>(0);
  const [openFaqRight, setOpenFaqRight] = useState<number | null>(null);
  const [customizingItem, setCustomizingItem] = useState<{ item: MenuItem; date: Date } | null>(null);
  const [zipCode, setZipCode] = useState('');

  const dayKey = DAY_KEYS[activeDay];
  const items = MENUS[dayKey].categories[0].items;
  const images = DAY_IMAGES[dayKey];

  const handleTryNow = (item?: MenuItem) => {
    const target = item ?? items[0];
    if (!target) return;
    setCustomizingItem({ item: target, date: getDateForDayIndex(activeDay) });
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

      {/* ── SECTION 1 + 2: THE WEEKLY SYSTEM + MEAL CARDS ───────────────────── */}
      <section className="bg-[#EEEAF8] pt-16 pb-12 px-5 md:px-12">

        {/* Title */}
        <div className="text-center">
          <h1
            className="font-bold text-[#2D1B69] leading-none"
            style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(52px, 8vw, 80px)' }}
          >
            The Weekly System
          </h1>
          <p
            className="mt-3 text-[#2D1B69]"
            style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', opacity: 0.65 }}
          >
            Choose between two fresh options every day.
          </p>
        </div>

        {/* Day selector — single orange-bordered pill
            Active = orange fill + white bold · Inactive = no fill + orange thin */}
        <div className="flex justify-center mt-8">
          <div
            className="inline-flex items-center rounded-full px-1.5 py-1"
            style={{ border: '1.5px solid #C64D29' }}
          >
            {DAY_LABELS.map((label, i) => (
              <button
                key={label}
                onClick={() => setActiveDay(i)}
                className="px-5 py-2 rounded-full text-sm cursor-pointer transition-all duration-200"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  color: activeDay === i ? 'white' : '#C64D29',
                  fontWeight: activeDay === i ? 700 : 300,
                  background: activeDay === i ? '#C64D29' : 'transparent',
                  border: 'none',
                  letterSpacing: activeDay === i ? '0.01em' : '0',
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8"
          >
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="relative cursor-pointer group"
                onClick={() => handleTryNow(item)}
              >
                {/* Leaf icon — only for dishes with vegetarian option */}
                {item.customizationOptions?.hasVegetarianOption && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '25%',
                      right: '12%',
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#DB5A29',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 20,
                    }}
                  >
                    <Leaf size={16} color="white" strokeWidth={2} />
                  </div>
                )}

                {/* Food image — fills card width, image already includes name + description */}
                <img
                  src={images[idx]}
                  alt={item.name}
                  className="w-full group-hover:scale-[1.02] transition-transform duration-500"
                  style={{
                    display: 'block',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    mixBlendMode: 'multiply',
                  }}
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom row — veg badge + TRY NOW */}
        <div
          className="mt-6 flex items-center justify-between max-w-4xl mx-auto"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {/* Left — filled orange circle + label */}
          <div className="flex items-center gap-3 text-[#2D1B69]">
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#DB5A29',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Leaf size={15} color="white" strokeWidth={2} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Vegetarian Options Available</span>
          </div>

          {/* Right — TRY NOW: brown rounded rectangle */}
          <button
            onClick={() => handleTryNow()}
            style={{
              background: '#A0451C',
              color: 'white',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '16px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              padding: '13px 44px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            TRY NOW
          </button>
        </div>

      </section>

      {/* ── SECTION 3: FAQ ────────────────────────────────────────────────────── */}
      <section
        className="py-16 px-5 md:px-12"
        style={{ background: '#EEEAF8' }}
      >
        <div
          className="max-w-4xl mx-auto relative overflow-hidden"
          style={{
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 8px 40px rgba(150,130,200,0.15), 0 2px 12px rgba(150,130,200,0.08)',
            background: 'white',
          }}
        >
          {/* Soft salmon glow — bottom-left inside the card */}
          <div style={{
            position: 'absolute',
            bottom: '-40%',
            right: '-20%',
            width: '70%',
            height: '80%',
            background: 'radial-gradient(ellipse at center, rgba(255,175,155,0.45) 0%, rgba(255,190,170,0.15) 45%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />
          {/* Content — above the glow */}
          <div className="relative" style={{ zIndex: 1 }}>
            <div className="text-center mb-10">
              <h2
                className="text-[#2D1B69] font-bold"
                style={{
                  fontFamily: '"Instrument Serif", serif',
                  fontSize: 'clamp(36px, 5vw, 52px)',
                }}
              >
                Got Questions?
              </h2>
              <p
                style={{
                  fontFamily: '"Instrument Serif", serif',
                  fontSize: 'clamp(22px, 3vw, 32px)',
                  letterSpacing: '0.07em',
                  color: '#DB5A29',
                  marginTop: '6px',
                }}
              >
                We've Got Answers
              </p>
            </div>

            {/* Two-column FAQ grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

              {/* Left column — unchanged */}
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

              {/* FIX 2 — right column: tight gap-3, fully-rounded pills, thin border */}
              <div className="flex flex-col gap-3">
                {FAQ_RIGHT.map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => setOpenFaqRight(openFaqRight === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-3 bg-white text-left"
                    style={{
                      border: '1.5px solid #2D1B69',
                      borderRadius: '9999px',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    <span className="text-sm text-[#2D1B69] font-medium leading-snug">
                      {faq.q}
                    </span>
                    {/* + icon: 28×28, dark navy border */}
                    <span
                      className="flex-shrink-0 flex items-center justify-center text-[#2D1B69]"
                      style={{
                        width: '28px',
                        height: '28px',
                        border: '1.5px solid #2D1B69',
                        borderRadius: '50%',
                        fontSize: '18px',
                        lineHeight: 1,
                      }}
                    >
                      +
                    </span>
                  </button>
                ))}

                {/* "Still Have Questions?" — sticker + email */}
                <div className="mt-6 flex flex-row items-center gap-5">

                  {/* Yellow sticker: image bg with CSS fallback shape */}
                  <div
                    className="relative flex-shrink-0 flex items-center justify-center"
                    style={{
                      width: '120px',
                      height: '60px',
                      transform: 'rotate(-2deg)',
                    }}
                  >
                    {/* CSS-generated yellow blob (paper-tear feel) */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: '#E8D84A',
                        borderRadius: '6px 14px 8px 10px / 10px 8px 14px 6px',
                        boxShadow: '2px 3px 8px rgba(0,0,0,0.12)',
                      }}
                    />
                    {/* Overlay real image if it loads */}
                    <img
                      src="/assets/hero-bg/Bloque_amarillo.png"
                      alt=""
                      aria-hidden
                      style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'contain',
                      }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span
                      className="relative z-10 text-center font-bold text-[#2D1B69]"
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '11px',
                        lineHeight: '1.35',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {'Still Have\nQuestions?'}
                    </span>
                  </div>

                  {/* Email copy */}
                  <div style={{ fontFamily: 'Poppins, sans-serif', color: '#2D1B69' }} className="text-sm leading-snug">
                    <span>Email us at </span>
                    <a
                      href="mailto:hello@knwnfood.com"
                      className="font-bold hover:text-[#DB5A29] transition-colors"
                    >
                      hello@knwnfood.com
                    </a>
                    <span className="block mt-0.5">We're here to help!</span>
                  </div>

                </div>
              </div>

            </div>
          </div>{/* end relative content wrapper */}
        </div>
      </section>

      {/* ── SECTION 4: COMPARISON TABLE ───────────────────────────────────────── */}
      {/* TOKEN: Section bg = #DB5A29 */}
      <section style={{ background: '#DB5A29' }} className="py-16 px-5 md:px-12">

        {/* TOKEN: Title = Instrument Serif 64px bold white, centered */}
        <div className="text-center">
          <h2
            className="font-bold text-white leading-none"
            style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(40px, 6vw, 64px)' }}
          >
            Find the{' '}
            {/* TOKEN: "real" = NothingYouCouldDo 64px #D4F53C */}
            <span style={{ fontFamily: '"Nothing You Could Do", cursive', color: '#D4F53C' }}>
              real
            </span>
            {' '}lunch.
          </h2>

          {/* TOKEN: Table subtitle = Poppins 13px white centered */}
          <p
            className="mt-4 text-white mx-auto leading-relaxed"
            style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', maxWidth: '680px' }}
          >
            Real lunch is made with fresh, high-quality produce, no antibiotics or hormones ever, no seed oils,
            and sauces made from scratch, no preservatives, just real ingredients.
          </p>
        </div>

        {/* Table container — relative for TRY NOW button */}
        <div className="relative mx-auto mt-10" style={{ maxWidth: '900px' }}>

          {/* ── Purple header tabs (separate element, no white bg) */}
          <div style={{ display: 'grid', gridTemplateColumns: '35% repeat(4, 16.25%)' }}>
            <div /> {/* empty first cell — orange bg shows through */}
            {['Pricing', 'Food\nQuality', 'Convenience', 'No Hidden Fees'].map((col, i) => (
              <div
                key={col}
                style={{
                  background: '#D2CFEA',
                  padding: '12px 8px',
                  textAlign: 'center',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#291A5A',
                  whiteSpace: 'pre-line',
                  borderRight: i < 3 ? '2px solid #C64D29' : 'none',
                  borderRadius: i === 0 ? '10px 0 0 0' : i === 3 ? '0 10px 0 0' : 0,
                }}
              >
                {col}
              </div>
            ))}
          </div>

          {/* ── 5px gap between tabs and navy row */}
          <div style={{ height: '5px' }} />

          {/* ── Table body — own container so KNWN row gets rounded corners */}
          <div style={{ borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.20)' }}>
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
              <colgroup>
                <col style={{ width: '35%' }} />
                <col style={{ width: '16.25%' }} />
                <col style={{ width: '16.25%' }} />
                <col style={{ width: '16.25%' }} />
                <col style={{ width: '16.25%' }} />
              </colgroup>
              <tbody>
                {/* KNWN row — top corners rounded by container overflow:hidden */}
                <tr style={{ background: '#291A5A' }}>
                  <td
                    className="py-5 px-6 text-left font-bold text-white"
                    style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px' }}
                  >
                    KNWN Real Food Lunch
                  </td>
                  {[0, 1, 2, 3].map(i => (
                    <td key={i} style={{ padding: '20px 12px', textAlign: 'center' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </td>
                  ))}
                </tr>

                {/* Meal Prep row */}
                <tr style={{ background: 'white', borderTop: '2px solid #C64D29' }}>
                  <td
                    className="py-5 px-6 text-left font-bold"
                    style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#291A5A', borderRight: '2px solid #C64D29' }}
                  >
                    Meal Prep Service
                  </td>
                  <td style={{ padding: '20px 12px', textAlign: 'center', borderRight: '2px solid #C64D29' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C64D29" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </td>
                  <td style={{ borderRight: '2px solid #C64D29' }} />
                  <td style={{ borderRight: '2px solid #C64D29' }} />
                  <td />
                </tr>

                {/* Restaurant row — bottom corners rounded by container overflow:hidden */}
                <tr style={{ background: 'white', borderTop: '2px solid #C64D29' }}>
                  <td
                    className="py-5 px-6 text-left font-bold"
                    style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#291A5A', borderRight: '2px solid #C64D29' }}
                  >
                    Restaurant &amp; Delivery Apps
                  </td>
                  <td style={{ borderRight: '2px solid #C64D29' }} />
                  <td style={{ borderRight: '2px solid #C64D29' }} />
                  <td style={{ padding: '20px 12px', textAlign: 'center', borderRight: '2px solid #C64D29' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C64D29" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          {/* TRY NOW — no shadow, no border-radius, ready for background-image */}
          <button
            style={{
              position: 'absolute',
              bottom: '-18px',
              right: '-8px',
              background: '#DDEB00',
              color: '#291A5A',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '22px',
              fontWeight: 900,
              fontStyle: 'italic',
              padding: '10px 28px',
              borderRadius: 0,
              transform: 'rotate(-3deg)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            TRY NOW
          </button>
        </div>
      </section>

      {/* ── SECTION 5: ZIP CODE BANNER ────────────────────────────────────────── */}
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
