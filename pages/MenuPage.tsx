
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getEtNow,
  getDateStatus,
  generateDatesForCalendar,
  calculateActiveOrderDay,
  DateStatus,
  CUTOFF_HOUR,
  toDateKey
} from '../utils/dateLogic';
import { getMenuForDate } from '../data/menuTemplates';
import { MenuItem } from '../types';
import {
  Plus, Search, Lock, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, CheckCircle2, X
} from 'lucide-react';
import { clsx } from 'clsx';
import { useUser } from '../store/useUser';

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&q=80&w=800";

const CustomizationModal: React.FC<{
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customs: any) => void;
}> = ({ item, isOpen, onClose, onConfirm }) => {
  const [base, setBase] = useState('Forbidden Rice');
  const [protein, setProtein] = useState('Grilled Chicken');
  const [sauce, setSauce] = useState('Miso-Ginger');
  const [avoidList, setAvoidList] = useState<string[]>([]);

  const bases = ['Forbidden Rice', 'Warm Farro', 'Quinoa Blend'];
  const proteins = ['Grilled Chicken', 'Seared Tofu'];
  const sauces = ['Miso-Ginger', 'Spicy Mayo'];
  const dislikes = ['Onions', 'Cilantro', 'Spicy', 'Nuts', 'Dairy'];

  if (!isOpen) return null;

  const toggleDislike = (item: string) => {
    setAvoidList(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
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
        <div className="p-10 space-y-10">
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

          <div className="space-y-5">
            {/* Base Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Select Base (Choose 1)</label>
              <div className="grid grid-cols-3 gap-2">
                {bases.map(b => (
                  <button
                    key={b}
                    onClick={() => setBase(b)}
                    className={clsx(
                      "py-4 px-2 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all border",
                      base === b ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20" : "bg-white text-brand-primary/60 border-brand-primary/5 hover:border-brand-primary/20"
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Protein Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Select Protein (Choose 1)</label>
              <div className="grid grid-cols-2 gap-2">
                {proteins.map(p => (
                  <button
                    key={p}
                    onClick={() => setProtein(p)}
                    className={clsx(
                      "py-3 px-2 rounded-xl text-[10px] font-bold transition-all border",
                      protein === p ? "bg-brand-dark text-white border-brand-dark" : "bg-white text-brand-dark border-brand-subtle/60"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Sauce Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Select Sauce (Choose 1)</label>
              <div className="grid grid-cols-2 gap-2">
                {sauces.map(s => (
                  <button
                    key={s}
                    onClick={() => setSauce(s)}
                    className={clsx(
                      "py-3 px-2 rounded-xl text-[10px] font-bold transition-all border",
                      sauce === s ? "bg-brand-dark text-white border-brand-dark" : "bg-white text-brand-dark border-brand-subtle/60"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Dislikes Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Anything you don't like?</label>
              <div className="flex flex-wrap gap-2">
                {dislikes.map(d => (
                  <button
                    key={d}
                    onClick={() => toggleDislike(d)}
                    className={clsx(
                      "py-3 px-6 rounded-full text-[9px] font-black transition-all border uppercase tracking-[0.2em]",
                      avoidList.includes(d) ? "bg-brand-primary text-white border-brand-primary shadow-xl shadow-brand-primary/20" : "bg-white text-brand-primary/40 border-brand-primary/5 hover:border-brand-primary/20"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onConfirm({ base, protein, sauce, avoid: avoidList.join(', ') })}
            className="w-full py-6 bg-brand-primary text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            Add to Selection <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const RegistrationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userData: { email: string, phone: string, zip: string }) => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [zip, setZip] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && phone && zip) {
      onConfirm({ email, phone, zip });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="bg-white max-w-md w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-primary/10"
      >
        <div className="p-10 space-y-10 text-center">
          <div className="flex justify-end -mr-4 -mt-4">
            <button onClick={onClose} className="p-2 hover:bg-brand-primary/5 rounded-full transition-colors text-brand-primary"><X size={20} /></button>
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl font-serif text-brand-primary">Get Started</h2>
            <p className="text-[10px] text-brand-primary/40 uppercase tracking-[0.3em] font-bold">Chef-prepared meals await</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <input
                required
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-primary/5 border border-transparent rounded-2xl px-8 py-5 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/20 text-sm text-brand-primary"
              />
              <input
                required
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-brand-primary/5 border border-transparent rounded-2xl px-8 py-5 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/20 text-sm text-brand-primary"
              />
              <input
                required
                type="text"
                placeholder="ZIP Code"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full bg-brand-primary/5 border border-transparent rounded-2xl px-8 py-5 focus:bg-white focus:border-brand-primary focus:outline-none transition-all placeholder:text-brand-primary/20 text-sm text-brand-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full py-6 bg-brand-primary text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] transition-all mt-6 active:scale-[0.98]"
            >
              Access the Menu
            </button>
          </form>

          <p className="text-[10px] text-brand-primary/40 font-light leading-relaxed px-4">
            By continuing, you agree to our terms of service and privacy policy.
            We use your info for delivery updates only.
          </p>
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
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-[10px] font-black text-brand-primary/20 text-center uppercase tracking-[0.3em]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day, i) => {
          if (!day) return <div key={`p-${i}`} />;
          const isSelected = toDateKey(day) === toDateKey(selectedDate);
          const status = getDateStatus(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect(day)}
              className={clsx(
                "aspect-square text-[11px] rounded-[1rem] flex items-center justify-center transition-all relative font-black uppercase tracking-tighter",
                isSelected ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/30 scale-110 z-10" : "hover:bg-brand-primary/5 text-brand-primary/60",
                status === 'ACTIVE' && !isSelected && "text-brand-primary bg-white border border-brand-primary/5",
                status === 'WEEKEND' && !isSelected && "text-brand-primary/10 cursor-not-allowed",
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

export default function MenuPage({ addItem }: { addItem: (i: MenuItem, d: Date, c?: any) => void }) {
  const navigate = useNavigate();
  const activeOrderDay = useMemo(() => calculateActiveOrderDay(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(activeOrderDay);
  const [search, setSearch] = useState('');
  const sliderRef = useRef<HTMLDivElement>(null);

  const { isRegistered, register } = useUser();
  const [showRegistration, setShowRegistration] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<{ item: MenuItem, date: Date, customs: any } | null>(null);

  const [customizingItem, setCustomizingItem] = useState<{ item: MenuItem, date: Date } | null>(null);

  const calendarDates = useMemo(() => generateDatesForCalendar(), []);
  const currentStatus = useMemo(() => getDateStatus(selectedDate), [selectedDate]);
  const menuData = useMemo(() => getMenuForDate(selectedDate), [selectedDate]);

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
      if (!isRegistered) {
        setPendingAdd({ item: customizingItem.item, date: customizingItem.date, customs });
        setCustomizingItem(null);
        setShowRegistration(true);
      } else {
        addItem(customizingItem.item, customizingItem.date, customs);
        setCustomizingItem(null);
      }
    }
  };

  const handleRegistrationConfirm = (userData: any) => {
    register(userData);
    setShowRegistration(false);
    if (pendingAdd) {
      addItem(pendingAdd.item, pendingAdd.date, pendingAdd.customs);
      setPendingAdd(null);
    }
    navigate('/checkout');
  };

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-brand-bg pt-48 pb-24 px-6 md:px-12 relative overflow-hidden border-b border-brand-primary/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full -mr-64 -mt-64 blur-[100px]" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12 relative z-10">
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-3 text-brand-primary/40 uppercase tracking-[0.4em] text-[10px] font-black border-l-2 border-brand-primary/20 pl-4 py-1">
              <CalendarIcon size={14} /> Seasonal Rotation
            </div>
            <h1 className="text-7xl md:text-9xl font-serif tracking-tighter text-brand-primary leading-[0.85]">The Weekly <br /><span className="italic font-light opacity-60">Board.</span></h1>
          </div>
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-brand-primary/30" size={20} />
            <input
              type="text"
              placeholder="Searching for a flavor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-brand-primary/10 rounded-[2rem] py-6 pl-16 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary/20 transition-all placeholder:text-brand-primary/20 tracking-wider font-medium text-brand-primary shadow-sm"
            />
          </div>
        </div>
      </header>

      <section className="px-6 md:px-12 py-10 sticky top-24 bg-white/90 backdrop-blur-3xl z-30 border-b border-brand-primary/5 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div
            ref={sliderRef}
            className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth"
          >
            {calendarDates.map(date => {
              const isSelected = toDateKey(date) === toDateKey(selectedDate);
              const status = getDateStatus(date);

              return (
                <button
                  key={date.toISOString()}
                  data-date={toDateKey(date)}
                  onClick={() => setSelectedDate(date)}
                  className={clsx(
                    "flex flex-col items-center min-w-[90px] py-6 rounded-[2.5rem] transition-all border shrink-0 group/date",
                    isSelected
                      ? "bg-brand-primary text-white border-brand-primary shadow-2xl shadow-brand-primary/30 scale-[1.05]"
                      : status === 'ACTIVE'
                        ? "bg-white text-brand-primary border-brand-primary/10 shadow-sm hover:border-brand-primary/30 hover:bg-brand-primary/[0.02]"
                        : status === 'PREVIEW'
                          ? "bg-white text-brand-primary/40 border-brand-primary/5 shadow-sm hover:border-brand-primary/20"
                          : "bg-brand-primary/[0.02] text-brand-primary/5 border-transparent cursor-not-allowed opacity-20"
                  )}
                >
                  <span className="text-[8px] uppercase tracking-[0.3em] font-black mb-1 opacity-50 group-hover/date:opacity-100 transition-opacity">
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-serif leading-none mb-1">{date.getDate()}</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">
                    {date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 lg:gap-24">
          <div className="lg:col-span-3">
            <div className="mb-16 space-y-6">
              <div className="flex flex-col md:flex-row md:items-end gap-6 border-b border-brand-primary/5 pb-8">
                <h2 className="text-6xl font-serif capitalize text-brand-primary tracking-tighter">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
                {currentStatus === 'ACTIVE' && (
                  <span className="inline-flex items-center w-fit gap-2 px-6 py-2 bg-brand-primary/5 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-sm mb-2 border border-brand-primary/10">
                    <CheckCircle2 size={12} strokeWidth={3} /> Active Now
                  </span>
                )}
              </div>
              <p className="text-lg text-brand-primary/40 font-medium max-w-xl leading-relaxed italic">
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

          <aside className="lg:col-span-1">
            <div className="sticky top-40 space-y-8">
              <MiniCalendar
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
              />
              <div className="p-12 bg-brand-primary text-white rounded-[4rem] space-y-8 relative overflow-hidden group shadow-2xl shadow-brand-primary/30">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-110 transition-transform" />
                <div className="space-y-4 relative z-10">
                  <h4 className="font-serif text-4xl text-white leading-tight tracking-tighter">Peak <br />Precision.</h4>
                  <p className="font-medium opacity-40 leading-relaxed text-[13px] italic">Automated logistics for seamless delivery. Reaching the Miami metropolitan area daily.</p>
                </div>
                <div className="pt-8 border-t border-white/5 flex flex-col gap-4 relative z-10">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="opacity-40">Daily Cutoff</span>
                    <span>{CUTOFF_HOUR} AM ET</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="opacity-40">Efficiency</span>
                    <span>99.8%</span>
                  </div>
                </div>
              </div>
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
            onClose={() => {
              setShowRegistration(false);
              setPendingAdd(null);
            }}
            onConfirm={handleRegistrationConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
