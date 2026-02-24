
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getEtNow,
  getDateStatus,
  generateDatesForCalendar,
  calculateActiveOrderDay,
  findNextServiceDay,
  DateStatus,
  CUTOFF_HOUR,
  toDateKey
} from '../utils/dateLogic';
import { getMenuForDate } from '../data/menuTemplates';
import { MenuItem } from '../types';
import {
  Plus, Search, Lock, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, CheckCircle2, X,
  ShoppingBag, ArrowRight, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { useUser } from '../store/useUser';
import RegistrationModal from '../components/RegistrationModal';

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&q=80&w=800";

const CustomizationModal: React.FC<{
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customs: any) => void;
}> = ({ item, isOpen, onClose, onConfirm }) => {
  const options = item.customizationOptions;

  const [base, setBase] = useState(options?.bases?.[0] || '');
  const [sauce, setSauce] = useState(options?.sauces?.[0] || '');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [swap, setSwap] = useState(options?.swaps?.[0] || '');
  const [avoidList, setAvoidList] = useState<string[]>([]);

  // Reset state when item changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setBase(options?.bases?.[0] || '');
      setSauce(options?.sauces?.[0] || '');
      setIsVegetarian(false);
      setSwap(options?.swaps?.[0] || '');
      setAvoidList([]);
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const toggleDislike = (d: string) => {
    setAvoidList(prev =>
      prev.includes(d) ? prev.filter(i => i !== d) : [...prev, d]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="bg-brand-bg max-w-lg w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-primary/10"
      >
        <div className="p-10 space-y-8 overflow-y-auto max-h-[90vh] no-scrollbar">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-4xl font-serif text-brand-primary">Customize Your <br /><span className="italic font-light">{item.name}</span></h3>
              <p className="text-[10px] text-brand-primary/40 uppercase tracking-[0.3em] mt-4 font-black">Refining your culinary selection</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-brand-subtle/40 rounded-full transition-colors text-brand-primary"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Base Selection */}
            {options?.bases && options.bases.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Select Base (Choose 1)</label>
                <div className="grid grid-cols-1 gap-2">
                  {options.bases.map(b => (
                    <button
                      key={b}
                      onClick={() => setBase(b)}
                      className={clsx(
                        "py-3 px-6 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all border text-left flex items-center justify-between",
                        base === b ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20" : "bg-white text-brand-primary/60 border-brand-primary/5 hover:border-brand-primary/20"
                      )}
                    >
                      {b}
                      {base === b && <CheckCircle2 size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sauce Selection */}
            {options?.sauces && options.sauces.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Select Sauce (Choose 1)</label>
                <div className="grid grid-cols-2 gap-2">
                  {options.sauces.map(s => (
                    <button
                      key={s}
                      onClick={() => setSauce(s)}
                      className={clsx(
                        "py-3 px-4 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border text-center",
                        sauce === s ? "bg-brand-primary text-white border-brand-primary shadow-md" : "bg-white text-brand-primary/40 border-brand-primary/5"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Vegetarian Toggle */}
            {options?.hasVegetarianOption && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40">
                  {options.hasVegetarianOption.label}
                </label>
                <button
                  onClick={() => setIsVegetarian(!isVegetarian)}
                  className={clsx(
                    "w-full py-4 px-6 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all border text-left flex items-center justify-between group",
                    isVegetarian
                      ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
                      : "bg-white text-brand-primary/60 border-brand-primary/5 hover:border-brand-primary/20"
                  )}
                >
                  <span className="flex-1 capitalize">{options.hasVegetarianOption.instructions || 'Make it vegetarian'}</span>
                  <div className={clsx(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    isVegetarian ? "border-white bg-white/20" : "border-brand-primary/20"
                  )}>
                    {isVegetarian && <CheckCircle2 size={12} />}
                  </div>
                </button>
              </div>
            )}

            {/* Swap Selection */}
            {options?.swaps && options.swaps.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Sustituciones (Swap)</label>
                <div className="grid grid-cols-1 gap-2">
                  {options.swaps.map(sw => (
                    <button
                      key={sw}
                      onClick={() => setSwap(swap === sw ? '' : sw)}
                      className={clsx(
                        "py-3 px-6 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all border text-left",
                        swap === sw ? "bg-brand-primary text-white border-brand-primary shadow-lg" : "bg-white text-brand-primary/60 border-brand-primary/5"
                      )}
                    >
                      {sw}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dislikes Selection */}
            {options?.dislikes && options.dislikes.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Anything you don't like?</label>
                <div className="flex flex-wrap gap-2">
                  {options.dislikes.map(d => (
                    <button
                      key={d}
                      onClick={() => toggleDislike(d)}
                      className={clsx(
                        "py-3 px-6 rounded-full text-[9px] font-black transition-all border uppercase tracking-[0.2em]",
                        avoidList.includes(d) ? "bg-red-500 text-white border-red-500 shadow-xl shadow-red-500/20" : "bg-white text-brand-primary/40 border-brand-primary/5 hover:border-brand-primary/20"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onConfirm({
              base,
              sauce,
              isVegetarian,
              vegInstructions: isVegetarian ? options?.hasVegetarianOption?.instructions : undefined,
              swap,
              avoid: avoidList.join(', ')
            })}
            className="w-full py-6 bg-brand-primary text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            Add to Selection <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// RegistrationModal removed and imported from components/RegistrationModal.tsx

const PromotionalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
}> = ({ isOpen, onClose, onSignUp }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-primary/60 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative bg-brand-primary max-w-6xl w-full rounded-[2rem] md:rounded-[4rem] overflow-hidden flex flex-col md:flex-row shadow-[0_60px_120px_rgba(0,0,0,0.5)] border border-white/10 max-h-[95vh] md:max-h-none overflow-y-auto md:overflow-visible no-scrollbar"
      >
        <button onClick={onClose} className="absolute top-4 right-4 md:top-8 md:right-8 z-50 text-white/40 hover:text-white transition-colors p-2 bg-black/20 md:bg-transparent rounded-full backdrop-blur-md md:backdrop-blur-none">
          <X size={20} className="md:w-7 md:h-7" />
        </button>

        {/* Left Side: Visuals */}
        <div className="md:w-1/2 relative min-h-[280px] md:min-h-[600px] bg-[#FF5C00] overflow-hidden flex items-center justify-center p-6 md:p-12">
          {/* KN Pattern */}
          <div className="absolute inset-0 opacity-30 flex flex-wrap gap-4 md:gap-12 items-center justify-center pointer-events-none p-4">
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} className="text-4xl md:text-9xl font-black text-[#FFD600] leading-none transform -rotate-12 italic tracking-tighter select-none">KN</span>
            ))}
          </div>

          <div className="relative z-10 w-full max-w-[200px] md:max-w-[380px]">
            {/* Food Image Container */}
            <div className="relative group">
              <div className="w-full aspect-square bg-[#FDF6E3] rounded-full shadow-[0_40px_80px_rgba(0,0,0,0.3)] p-2 md:p-3 border-4 md:border-8 border-white overflow-hidden transform group-hover:scale-105 transition-transform duration-700">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000"
                  alt="Special Pesto Pasta"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Hand-drawn type stickers */}
              <div className="absolute -top-4 -right-2 md:-top-6 md:-right-6 bg-brand-primary text-white px-3 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-xl text-[7px] md:text-[12px] font-black uppercase tracking-[0.2em] transform rotate-[15deg] shadow-2xl border border-white/20 whitespace-nowrap">No additives</div>
              <div className="absolute top-8 -left-4 md:top-12 md:-left-12 bg-brand-primary text-white px-3 md:px-6 py-1.5 md:py-3 rounded-lg md:rounded-xl text-[7px] md:text-[12px] font-black uppercase tracking-[0.2em] transform rotate-[-20deg] shadow-2xl border border-white/20 whitespace-nowrap">Zero lies</div>
              <div className="absolute bottom-8 -left-2 md:bottom-12 md:-left-10 bg-brand-primary text-white px-3 md:px-6 py-2 md:py-4 rounded-lg md:rounded-xl text-[7px] md:text-[11px] font-black uppercase tracking-[0.2em] transform rotate-[8deg] shadow-2xl border border-white/20 leading-tight">Cooked fresh<br />every morning</div>

              {/* NEW! Starburst Sticker */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="absolute -bottom-4 -right-4 md:-bottom-10 md:-right-10 w-16 h-16 md:w-40 md:h-40 bg-brand-primary text-white flex items-center justify-center font-serif text-sm md:text-6xl shadow-2xl border md:border-4 border-white/30 z-20"
                style={{ clipPath: 'polygon(50% 0%, 63% 38%, 100% 35%, 75% 60%, 85% 100%, 50% 80%, 15% 100%, 25% 60%, 0% 35%, 37% 38%)' }}
              >
                NEW!
              </motion.div>
            </div>
          </div>

          {/* Ripped Paper Effect Layered */}
          <div className="absolute bottom-0 left-0 right-0 h-10 md:h-28 bg-[#BADA55]/40 transform translate-y-2 md:translate-y-4"
            style={{ clipPath: 'polygon(0% 100%, 100% 100%, 100% 25%, 95% 40%, 90% 20%, 85% 45%, 80% 25%, 75% 50%, 70% 20%, 65% 45%, 60% 30%, 55% 50%, 50% 20%, 45% 45%, 40% 25%, 35% 50%, 30% 20%, 25% 45%, 20% 30%, 15% 55%, 10% 25%, 5% 50%, 0% 15%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-8 md:h-24 bg-white"
            style={{ clipPath: 'polygon(0% 100%, 100% 100%, 100% 20%, 94% 45%, 88% 25%, 82% 50%, 75% 30%, 69% 55%, 62% 20%, 55% 50%, 48% 30%, 42% 60%, 35% 25%, 28% 55%, 22% 30%, 15% 55%, 8% 20%, 0% 50%)' }} />
        </div>


        {/* Right Side: Copy & Actions */}
        <div className="md:w-1/2 p-8 md:p-24 flex flex-col items-center justify-center text-center space-y-8 md:space-y-16">
          {/* Circular Branding Logo */}
          <div className="relative w-20 h-20 md:w-28 md:h-28 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 border border-white/20 border-dashed rounded-full"
            />
            <div className="text-[8px] md:text-[10px] text-white/40 font-black uppercase tracking-[0.5em] absolute -top-4">Bullsht Free</div>
            <img
              src="https://knwnfood.com/wp-content/uploads/2025/09/Recurso-91x.webp"
              className="w-10 md:w-14 brightness-0 invert opacity-60"
              alt="KNWN"
            />
          </div>

          <div className="space-y-4 md:space-y-6">
            <h2 className="text-3xl md:text-8xl font-serif text-white tracking-tighter leading-[0.85] uppercase">
              FIRST 100 TO SIGN UP<br />
              <span className="italic font-light text-white/50 lowercase">get a</span> <span className="text-brand-bg text-brand-primary px-3 md:px-4 py-1">FREE LUNCH!</span>
            </h2>
          </div>

          <div className="w-full max-w-sm md:max-w-md flex flex-col gap-3 md:gap-5">
            <button
              onClick={onSignUp}
              className="w-full py-5 md:py-7 bg-[#E67E22] text-white rounded-full text-[10px] md:text-[14px] font-black uppercase tracking-[0.5em] shadow-[0_25px_50px_rgba(230,126,34,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              FREE LUNCH
            </button>
            <button
              onClick={onClose}
              className="w-full py-5 md:py-7 border-2 border-white/20 text-white/40 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] hover:text-white hover:border-white/60 transition-all hover:bg-white/5"
            >
              NEHHH, I PREFER TO PAY
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const MenuCard: React.FC<{
  item: MenuItem;
  status: DateStatus;
  date: Date;
  activeOrderDay: Date;
  onAdd: (i: MenuItem, d: Date) => void
}> = ({ item, status, date, activeOrderDay, onAdd }) => {
  const isActive = status === 'ACTIVE' || status === 'PREVIEW';
  const isPreview = status === 'PREVIEW';
  const activeDateFormatted = activeOrderDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        "relative bg-white rounded-[3rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 border flex flex-col h-full group/card",
        isActive ? "border-brand-primary/5 hover:border-brand-primary/10 hover:shadow-[0_20px_50px_rgba(43,28,112,0.1)] hover:-translate-y-1" : "border-brand-primary/5 grayscale opacity-60"
      )}
    >
      <div className="aspect-[16/10] relative overflow-hidden">
        <img
          src={item.image || PLACEHOLDER_IMAGE}
          className={clsx(
            "w-full h-full object-cover transition-transform duration-1000",
            isActive && "group-hover/card:scale-105"
          )}
          alt={item.name}
        />

        {item.popular && isActive && (
          <span className="absolute top-4 left-4 bg-brand-accent text-white px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl">
            Popular
          </span>
        )}

        {(status !== 'ACTIVE' && status !== 'PREVIEW') && (
          <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-brand-dark/90 text-white px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <Lock size={12} /> Unavailable
            </div>
          </div>
        )}
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4 gap-4">
          <h3 className="text-2xl font-serif leading-[1.1] text-brand-primary group-hover/card:text-brand-primary transition-colors">{item.name}</h3>
          <span className="text-xl font-serif text-brand-primary">${item.price}</span>
        </div>
        <p className="text-sm text-brand-primary/40 font-medium mb-8 line-clamp-2 leading-relaxed italic">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-10 mt-auto">
          {item.tags?.map(tag => (
            <span key={tag} className="text-[9px] uppercase tracking-[0.2em] font-black text-brand-primary/40 bg-brand-subtle/30 px-3.5 py-1.5 rounded-full border border-brand-primary/5">
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={() => onAdd(item, date)}
          disabled={!isActive}
          className={clsx(
            "w-full py-5 rounded-[1.25rem] flex items-center justify-center gap-3 transition-all font-black uppercase tracking-[0.3em] text-[9px] active:scale-[0.98]",
            isActive
              ? "bg-brand-primary text-white hover:scale-[1.02] shadow-xl shadow-brand-primary/20"
              : "bg-brand-primary/5 text-brand-primary/20 cursor-not-allowed border border-dashed border-brand-primary/10"
          )}
        >
          {isActive ? (
            <>
              <Plus size={16} strokeWidth={3} />
              <span>Personalize</span>
            </>
          ) : (
            <span>Sold Out</span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

const MiniCalendar: React.FC<{
  selectedDate: Date;
  onSelect: (d: Date) => void;
}> = ({ selectedDate, onSelect }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const monthName = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

  const daysInMonth = [];
  const startDay = startOfMonth.getDay();
  for (let i = 0; i < startDay; i++) daysInMonth.push(null);
  for (let i = 1; i <= endOfMonth.getDate(); i++) {
    daysInMonth.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), i));
  }

  return (
    <div className="bg-brand-bg border border-brand-primary/5 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      <div className="flex justify-between items-center mb-8">
        <h4 className="font-serif text-2xl text-brand-primary leading-none uppercase tracking-tighter">{monthName}</h4>
        <div className="flex gap-2">
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-2.5 bg-brand-subtle text-brand-primary rounded-full hover:scale-110 transition-transform"><ChevronLeft size={16} /></button>
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-2.5 bg-brand-subtle text-brand-primary rounded-full hover:scale-110 transition-transform"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-6">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={`${d}-${i}`} className="text-[10px] font-black text-brand-primary/20 text-center uppercase tracking-[0.3em]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day, i) => {
          if (!day) return <div key={`p-${i}`} />;
          const isSelected = toDateKey(day) === toDateKey(selectedDate);
          const status = getDateStatus(day);
          const weekday = day.getDay();
          const isMonTue = weekday === 1 || weekday === 2;
          const isWeekendDay = weekday === 0 || weekday === 6;

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect(day)}
              className={clsx(
                "aspect-square text-[11px] rounded-[1rem] flex items-center justify-center transition-all relative font-black uppercase tracking-tighter",
                isSelected ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/30 scale-110 z-10" : "hover:bg-brand-primary/5 text-brand-primary/60",
                (status === 'ACTIVE' || status === 'PREVIEW') && !isSelected && !isWeekendDay && "text-brand-primary bg-white border border-brand-primary/30 hover:border-brand-primary/60",
                isWeekendDay && !isSelected && "text-brand-primary/10 cursor-not-allowed bg-brand-primary/5 opacity-40 grayscale",
                (status === 'PAST' || status === 'TODAY_CLOSED') && !isSelected && "text-brand-primary/10"
              )}
            >
              {day.getDate()}
              {status === 'ACTIVE' && !isSelected && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Hero = ({ onFreeLunch }: { onFreeLunch: () => void }) => {
  return (
    <section className="relative bg-[#D9CFF2] pt-24 md:pt-32 pb-24 px-4 md:px-12 overflow-hidden min-h-[100dvh] md:min-h-[90vh] flex flex-col items-center">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #2B1C70 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto relative z-10 text-center space-y-12 md:space-y-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 md:space-y-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-[10rem] font-serif text-brand-primary tracking-tighter leading-[0.9] md:leading-[0.8] px-4">
            Pay Less. <br />
            Eat Fresh. <span className="italic font-light text-[#E67E22]">Feel Good.</span>
          </h1>
          <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-brand-primary/40">
            Bullsht Free. Real. Cooked this morning. Priced right.
          </p>
        </motion.div>

        <div className="relative mt-16 md:mt-40 flex flex-col items-center w-full">
          {/* Main Comparison Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative w-full max-w-6xl px-4 md:px-0"
          >
            {/* Split Food Image */}
            <div className="relative aspect-square sm:aspect-[16/9] md:aspect-[21/9] rounded-[2rem] sm:rounded-[4rem] md:rounded-[6rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white/30">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1500"
                alt="Healthier KNWN Bowl vs Traditional"
                className="w-full h-full object-cover scale-110"
              />
              {/* Center Divider Gradient */}
              <div className="absolute inset-0 flex justify-center">
                <div className="w-1 md:w-2 h-full bg-white/40 backdrop-blur-2xl shadow-2xl" />
              </div>
            </div>

            {/* Comparison Tags - Adjusted for Mobile */}
            <div className="flex flex-col md:block items-center gap-4 mt-8 md:mt-0">
              {/* Left Tag (KNWN) */}
              <div className="md:absolute -left-4 md:-left-24 md:top-1/2 md:-translate-y-1/2 w-full max-w-[320px] md:w-[380px] z-20">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: -3 }}
                  className="bg-brand-primary text-white p-8 md:p-14 rounded-[2rem] md:rounded-[5rem] transform md:-rotate-2 shadow-2xl border border-white/10"
                >
                  <div className="text-[10px] md:text-[12px] opacity-60 uppercase tracking-[0.4em] font-black mb-2 md:mb-4">At KNWN</div>
                  <div className="text-5xl md:text-8xl font-serif mb-2 md:mb-4">$12.90</div>
                  <div className="text-[10px] md:text-[14px] font-bold leading-relaxed uppercase tracking-[0.3em]">
                    Cooked this morning <br className="hidden md:block" />Real Food.
                  </div>
                </motion.div>
              </div>

              {/* Right Tag (Traditional) */}
              <div className="md:absolute -right-4 md:-right-24 md:top-1/2 md:-translate-y-1/2 w-full max-w-[320px] md:w-[380px] z-20">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  className="bg-[#E67E22] text-white p-8 md:p-14 rounded-[2rem] md:rounded-[5rem] transform md:rotate-2 shadow-2xl border border-white/10"
                >
                  <div className="text-[10px] md:text-[12px] opacity-60 uppercase tracking-[0.4em] font-black mb-2 md:mb-4">Traditional Restaurants</div>
                  <div className="text-5xl md:text-8xl font-serif mb-2 md:mb-4">$19.35</div>
                  <div className="text-[10px] md:text-[14px] font-bold leading-relaxed uppercase tracking-[0.3em]">
                    Plus <br className="hidden md:block" />additional fees
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Controls - Hide on small mobile or reposition */}
        <div className="fixed bottom-6 left-6 md:bottom-12 md:left-12 z-[110]">
          <button
            onClick={onFreeLunch}
            className="bg-[#E67E22] text-white px-8 md:px-12 py-4 md:py-6 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2 md:gap-3 border border-white/20"
          >
            <CheckCircle2 size={18} strokeWidth={3} /> Free Lunch
          </button>
        </div>

        <div className="fixed bottom-6 right-6 md:bottom-12 md:right-12 z-[110] flex flex-col items-end gap-4 group">
          <div className="bg-white/80 backdrop-blur-xl px-6 md:px-10 py-3 md:py-5 rounded-full md:rounded-[2.5rem] shadow-2xl flex items-center gap-3 md:gap-4 border border-brand-primary/5 cursor-pointer hover:bg-white transition-all scale-100 hover:scale-105">
            <span className="text-[9px] md:text-[11px] font-black text-brand-primary uppercase tracking-[0.3em] hidden sm:block">Contact us</span>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-primary rounded-full flex items-center justify-center text-white group-hover:rotate-90 transition-transform shadow-xl shadow-brand-primary/20">
              <X size={20} className="rotate-45" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



export default function MenuPage({ cart }: { cart: any }) {
  const { addItem } = cart;
  const navigate = useNavigate();
  const activeOrderDay = useMemo(() => calculateActiveOrderDay(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(activeOrderDay);
  const [search, setSearch] = useState('');
  const sliderRef = useRef<HTMLDivElement>(null);

  const { isRegistered, register } = useUser();
  const [showRegistration, setShowRegistration] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<{ item: MenuItem, date: Date, customs: any } | null>(null);

  const [customizingItem, setCustomizingItem] = useState<{ item: MenuItem, date: Date } | null>(null);

  const calendarDates = useMemo(() => generateDatesForCalendar(), []);
  const currentStatus = useMemo(() => getDateStatus(selectedDate), [selectedDate]);
  const menuData = useMemo(() => getMenuForDate(selectedDate), [selectedDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeenPromo = sessionStorage.getItem('knwn_promo_seen');
      if (!hasSeenPromo && !isRegistered) {
        setShowPromo(true);
        sessionStorage.setItem('knwn_promo_seen', 'true');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isRegistered]);

  const togglePromo = () => {
    if (!isRegistered) {
      setShowPromo(true);
    } else {
      // If already registered, maybe just show a message or redirect
      setShowRegistration(false);
    }
  };

  useEffect(() => {
    if (sliderRef.current) {
      const selectedEl = sliderRef.current.querySelector(`[data-date="${toDateKey(selectedDate)}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate]);

  const handleAddClick = (item: MenuItem, date: Date) => {
    setCustomizingItem({ item, date });
  };

  const handleCustomizationConfirm = (customs: any) => {
    if (customizingItem) {
      // 1. Add item to cart
      addItem(customizingItem.item, customizingItem.date, customs, customizingItem.item.wooProductId);

      // 2. Find next available service date relative to the item's date
      const nextDate = findNextServiceDay(customizingItem.date);
      setSelectedDate(nextDate);

      // 3. Clear modal
      setCustomizingItem(null);
    }
  };

  const handleRegistrationConfirm = (userData: any) => {
    register(userData);
    setShowRegistration(false);
    navigate('/checkout');
  };

  const handleFinalizeClick = async () => {
    await cart.syncAllToWoo();
    window.location.href = 'https://knwnfood.com/cart/';
  };

  return (
    <div className="bg-white min-h-screen">
      <Hero onFreeLunch={togglePromo} />

      <header className="bg-white pt-24 pb-8 md:pb-12 px-4 md:px-12 relative overflow-hidden border-b border-brand-primary/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12 relative z-10">
          <div className="space-y-4 md:space-y-6 text-left">
            <div className="flex items-center gap-3 text-brand-primary/40 uppercase tracking-[0.4em] text-[9px] md:text-[10px] font-black border-l-2 border-brand-primary/20 pl-4 py-1">
              <CalendarIcon size={14} /> Seasonal Rotation
            </div>
            <h2 className="text-5xl md:text-9xl font-serif tracking-tighter text-brand-primary leading-[0.85]">The Weekly <br /><span className="italic font-light opacity-60">Board.</span></h2>
          </div>
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-brand-primary/30" size={20} />
            <input
              type="text"
              placeholder="Searching for a flavor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-brand-primary/10 rounded-2xl md:rounded-[2rem] py-4 md:py-6 pl-14 md:pl-16 pr-8 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all placeholder:text-brand-primary/20 tracking-wider font-medium text-brand-primary shadow-sm"
            />
          </div>

        </div>
      </header>

      <section className="px-4 md:px-12 py-6 md:py-10 sticky top-20 md:top-24 bg-white/90 backdrop-blur-3xl z-30 border-b border-brand-primary/5 shadow-sm overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div
            ref={sliderRef}
            className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth"
          >
            {calendarDates.map(date => {
              const isSelected = toDateKey(date) === toDateKey(selectedDate);
              const status = getDateStatus(date);
              const weekday = date.getDay();
              const isWeekendDay = weekday === 0 || weekday === 6;

              return (
                <button
                  key={date.toISOString()}
                  data-date={toDateKey(date)}
                  onClick={() => setSelectedDate(date)}
                  className={clsx(
                    "flex flex-col items-center min-w-[75px] md:min-w-[90px] py-4 md:py-6 rounded-2xl md:rounded-[2.5rem] transition-all border shrink-0 group/date",
                    isSelected
                      ? "bg-brand-primary text-white border-brand-primary shadow-2xl shadow-brand-primary/30 scale-[1.05]"
                      : status === 'WEEKEND'
                        ? "bg-brand-primary/[0.02] text-brand-primary/10 border-transparent cursor-not-allowed opacity-30 grayscale"
                        : (status === 'ACTIVE' || status === 'PREVIEW')
                          ? "bg-white text-brand-primary border-brand-primary/30 shadow-sm hover:border-brand-primary/60 hover:bg-brand-primary/[0.02]"
                          : "bg-brand-primary/[0.02] text-brand-primary/5 border-transparent cursor-not-allowed opacity-20"
                  )}
                >
                  <span
                    className={clsx(
                      "text-[7px] md:text-[8px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-black mb-1 px-2.5 py-1 rounded-full transition-all",
                      isSelected
                        ? "bg-white/10 text-white"
                        : "text-brand-primary/40 group-hover/date:text-brand-primary/60"
                    )}
                  >
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-xl md:text-2xl font-serif leading-none mb-1">{date.getDate()}</span>
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] opacity-30">
                    {date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>


      <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-8">
            <div className="mb-8 md:mb-16 space-y-4 md:space-y-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 border-b border-brand-primary/5 pb-6 md:pb-8">
                <h2 className="text-4xl md:text-6xl font-serif capitalize text-brand-primary tracking-tighter">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
                {currentStatus === 'ACTIVE' && (
                  <span className="inline-flex items-center w-fit gap-2 px-6 py-2 bg-brand-primary/5 text-brand-primary rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] shadow-sm mb-2 border border-brand-primary/10">
                    <CheckCircle2 size={12} strokeWidth={3} /> Active Now
                  </span>
                )}
              </div>
              <p className="text-base md:text-lg text-brand-primary/40 font-medium max-w-xl leading-relaxed italic">
                {currentStatus === 'ACTIVE'
                  ? `Ordering is open. Secure your selection by ${CUTOFF_HOUR}:00 AM ET for same-day artisanal delivery.`
                  : currentStatus === 'PREVIEW'
                    ? `Curating the experience for ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. Preview the menu below.`
                    : `Our kitchen is currently in rest mode. Reimagining new flavors for the coming week.`}
              </p>
            </div>


            <AnimatePresence mode="wait">
              <motion.div
                key={toDateKey(selectedDate)}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {menuData ? (
                  menuData.categories.map((cat) => (
                    <React.Fragment key={cat.categoryName}>
                      {cat.items.map(item => (
                        <MenuCard
                          key={item.id}
                          item={item}
                          status={currentStatus}
                          date={selectedDate}
                          activeOrderDay={activeOrderDay}
                          onAdd={handleAddClick}
                        />
                      ))}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center space-y-4 bg-brand-primary/[0.02] rounded-[2rem] border border-dashed border-brand-primary/10">
                    <Lock size={32} className="mx-auto text-brand-primary/20" />
                    <h3 className="text-xl font-serif text-brand-primary/80">Kitchen Resting</h3>
                    <p className="text-brand-primary/40 text-[12px] font-light max-w-xs mx-auto">Our culinary team is currently sourcing fresh ingredients for the next service window.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <div className="hidden lg:flex sticky top-40 space-y-8 flex-col h-[calc(100vh-12rem)] pb-10">
              <MiniCalendar
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
              />

              {/* Persistent Cart Sidebar */}
              <div className="flex-1 bg-white rounded-[3rem] border border-brand-primary/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
                <div className="p-8 border-b border-brand-primary/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={18} className="text-brand-primary" />
                    <h2 className="text-lg font-serif text-brand-primary">Your Selection</h2>
                  </div>
                  <span className="bg-brand-primary/5 text-brand-primary text-[10px] px-3 py-1 rounded-full font-black">{cart.itemCount}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                  {cart.items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-30">
                      <ShoppingBag size={24} strokeWidth={1.5} />
                      <p className="text-[9px] font-black uppercase tracking-widest">Basket is empty</p>
                    </div>
                  ) : (
                    cart.items.map((item: any) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={`${item.id}-${item.serviceDate}-${JSON.stringify(item.customizations)}`}
                        className="flex gap-4 group bg-brand-subtle/20 p-4 rounded-[1.5rem] border border-brand-primary/5"
                      >
                        <img src={item.image || PLACEHOLDER_IMAGE} className="w-16 h-16 object-cover rounded-xl" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-[11px] font-bold leading-tight text-brand-primary truncate">{item.name}</h3>
                            <span className="text-[11px] font-serif text-brand-primary">${item.price * item.quantity}</span>
                          </div>
                          <div className="flex items-center gap-1 text-brand-primary/40 mt-1">
                            <Calendar size={10} />
                            <span className="text-[8px] font-black uppercase tracking-widest">{item.serviceDate}</span>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center bg-white rounded-full p-0.5 border border-brand-primary/5 scale-90 -ml-1">
                              <button onClick={() => cart.updateQuantity(item.id, item.serviceDate, -1, item.customizations)} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-brand-subtle transition-colors text-brand-primary text-xs">-</button>
                              <span className="px-2 text-[9px] text-brand-primary font-black">{item.quantity}</span>
                              <button onClick={() => cart.updateQuantity(item.id, item.serviceDate, 1, item.customizations)} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-brand-subtle transition-colors text-brand-primary text-xs">+</button>
                            </div>
                            <button
                              onClick={() => cart.removeItem(item.id, item.serviceDate, item.customizations)}
                              className="text-[8px] uppercase tracking-widest text-brand-primary/20 hover:text-red-500 transition-colors font-black"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {cart.items.length > 0 && (
                  <div className="p-6 border-t border-brand-primary/5 bg-brand-subtle/30">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-brand-primary/40 uppercase tracking-[0.2em] text-[9px] font-black">Subtotal</span>
                      <span className="text-xl font-serif text-brand-primary">${cart.total}</span>
                    </div>
                    <button
                      onClick={handleFinalizeClick}
                      disabled={cart.syncing}
                      className="w-full py-4 bg-brand-primary text-white rounded-xl flex items-center justify-center gap-2 group hover:scale-[1.02] transition-all shadow-xl shadow-brand-primary/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                    >
                      {cart.syncing ? (
                        <span className="uppercase tracking-[0.3em] text-[9px] font-black animate-pulse">Preparing...</span>
                      ) : (
                        <>
                          <span className="uppercase tracking-[0.3em] text-[9px] font-black">Checkout</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tablet/Mobile Calendar (visible only when not large desktop) */}
            <div className="lg:hidden space-y-8">
              <MiniCalendar
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
              />
            </div>
          </aside>

        </div>
      </div>

      <AnimatePresence>
        {customizingItem && (
          <CustomizationModal
            item={customizingItem.item}
            isOpen={!!customizingItem}
            onClose={() => setCustomizingItem(null)}
            onConfirm={handleCustomizationConfirm}
          />
        )}
        {showRegistration && (
          <RegistrationModal
            isOpen={showRegistration}
            onClose={() => setShowRegistration(false)}
            onConfirm={handleRegistrationConfirm}
            onSkip={() => {
              setShowRegistration(false);
              navigate('/checkout');
            }}
          />
        )}
        {showPromo && (
          <PromotionalModal
            isOpen={showPromo}
            onClose={() => setShowPromo(false)}
            onSignUp={() => {
              setShowPromo(false);
              setShowRegistration(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
