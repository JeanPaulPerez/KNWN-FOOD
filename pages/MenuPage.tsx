
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
        className="bg-brand-cream max-w-lg w-full rounded-[2rem] overflow-hidden shadow-2xl border border-brand-clay/30"
      >
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-serif text-brand-charcoal">Customize Your {item.name}</h3>
              <p className="text-xs text-brand-muted uppercase tracking-widest mt-1">Personalize your meal</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-brand-clay/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-5">
            {/* Base Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Select Base (Choose 1)</label>
              <div className="grid grid-cols-3 gap-2">
                {bases.map(b => (
                  <button
                    key={b}
                    onClick={() => setBase(b)}
                    className={clsx(
                      "py-3 px-2 rounded-xl text-[10px] font-bold transition-all border",
                      base === b ? "bg-brand-charcoal text-white border-brand-charcoal" : "bg-white text-brand-charcoal border-brand-clay/40"
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Protein Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Select Protein (Choose 1)</label>
              <div className="grid grid-cols-2 gap-2">
                {proteins.map(p => (
                  <button
                    key={p}
                    onClick={() => setProtein(p)}
                    className={clsx(
                      "py-3 px-2 rounded-xl text-[10px] font-bold transition-all border",
                      protein === p ? "bg-brand-charcoal text-white border-brand-charcoal" : "bg-white text-brand-charcoal border-brand-clay/40"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Sauce Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Select Sauce (Choose 1)</label>
              <div className="grid grid-cols-2 gap-2">
                {sauces.map(s => (
                  <button
                    key={s}
                    onClick={() => setSauce(s)}
                    className={clsx(
                      "py-3 px-2 rounded-xl text-[10px] font-bold transition-all border",
                      sauce === s ? "bg-brand-charcoal text-white border-brand-charcoal" : "bg-white text-brand-charcoal border-brand-clay/40"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Dislikes Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Anything you don't like?</label>
              <div className="flex flex-wrap gap-2">
                {dislikes.map(d => (
                  <button
                    key={d}
                    onClick={() => toggleDislike(d)}
                    className={clsx(
                      "py-2 px-4 rounded-full text-[10px] font-bold transition-all border uppercase tracking-widest",
                      avoidList.includes(d) ? "bg-red-500 text-white border-red-500 shadow-md" : "bg-white text-brand-charcoal border-brand-clay/40"
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
            className="w-full py-5 bg-brand-accent text-white rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-brand-accent/90 transition-all flex items-center justify-center gap-2"
          >
            Add to Order <Plus size={16} />
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
        className="bg-white max-w-md w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-clay/20"
      >
        <div className="p-10 space-y-8 text-center">
          <div className="flex justify-end -mr-4 -mt-4">
            <button onClick={onClose} className="p-2 hover:bg-brand-clay/10 rounded-full transition-colors"><X size={20} /></button>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-brand-charcoal">Get Started</h2>
            <p className="text-xs text-brand-muted uppercase tracking-[0.2em]">Enter your details to proceed</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <input
                required
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-clay/10 border border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-brand-accent focus:outline-none transition-all placeholder:text-brand-muted/50 text-sm"
              />
              <input
                required
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-brand-clay/10 border border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-brand-accent focus:outline-none transition-all placeholder:text-brand-muted/50 text-sm"
              />
              <input
                required
                type="text"
                placeholder="ZIP Code"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full bg-brand-clay/10 border border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-brand-accent focus:outline-none transition-all placeholder:text-brand-muted/50 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-brand-charcoal text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-brand-accent transition-all mt-4"
            >
              Confirm & Continue
            </button>
          </form>

          <p className="text-[10px] text-brand-muted font-light leading-relaxed px-4">
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
        "relative bg-white rounded-[1.25rem] overflow-hidden shadow-sm transition-all border flex flex-col h-full group/card",
        isActive ? "border-brand-clay/60 hover:border-brand-accent/30 hover:shadow-xl" : "border-brand-clay/20 grayscale opacity-70"
      )}
    >
      <div className="aspect-[16/9] relative overflow-hidden">
        <img
          src={item.image || PLACEHOLDER_IMAGE}
          className={clsx(
            "w-full h-full object-cover transition-transform duration-1000",
            isActive && "group-hover/card:scale-105"
          )}
          alt={item.name}
        />

        {item.popular && isActive && (
          <span className="absolute top-3 left-3 bg-brand-accent text-white px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
            Popular
          </span>
        )}

        {(status !== 'ACTIVE' && status !== 'PREVIEW') && (
          <div className="absolute inset-0 bg-brand-charcoal/20 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-brand-charcoal/80 text-white px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Lock size={10} /> Unavailable
            </div>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2 gap-4">
          <h3 className="text-base font-serif leading-tight text-brand-charcoal">{item.name}</h3>
          <span className="text-base font-serif text-brand-accent whitespace-nowrap">${item.price}</span>
        </div>
        <p className="text-[11px] text-brand-muted font-light mb-5 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
          {item.tags?.map(tag => (
            <span key={tag} className="text-[8px] uppercase tracking-widest font-bold text-brand-muted/70 bg-brand-clay/30 px-2 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={() => onAdd(item, date)}
          disabled={!isActive}
          className={clsx(
            "w-full py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all font-black uppercase tracking-[0.15em] text-[9px]",
            isActive
              ? "bg-brand-charcoal text-white hover:bg-brand-accent shadow-md"
              : "bg-brand-clay/20 text-brand-muted cursor-not-allowed border border-dashed border-brand-clay/40"
          )}
        >
          {isActive ? (
            <>
              <Plus size={12} />
              <span>Add to Order</span>
            </>
          ) : (
            <span>Kitchen Closed</span>
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
    <div className="bg-white border border-brand-clay/30 rounded-[1.25rem] p-5 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <h4 className="font-serif text-base text-brand-charcoal">{monthName}</h4>
        <div className="flex gap-1">
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-1 hover:bg-brand-clay/10 rounded-full transition-colors"><ChevronLeft size={14} /></button>
          <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-1 hover:bg-brand-clay/10 rounded-full transition-colors"><ChevronRight size={14} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-[8px] font-black text-brand-muted/30 text-center uppercase tracking-widest">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, i) => {
          if (!day) return <div key={`p-${i}`} />;
          const isSelected = toDateKey(day) === toDateKey(selectedDate);
          const status = getDateStatus(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect(day)}
              className={clsx(
                "aspect-square text-[10px] rounded-lg flex items-center justify-center transition-all relative font-medium",
                isSelected ? "bg-brand-charcoal text-white shadow-md font-bold" : "hover:bg-brand-clay/10 text-brand-charcoal",
                status === 'ACTIVE' && !isSelected && "text-brand-accent ring-1 ring-brand-accent/10",
                status === 'WEEKEND' && !isSelected && "text-brand-muted/20 cursor-not-allowed",
                (status === 'PAST' || status === 'TODAY_CLOSED') && !isSelected && "text-brand-muted/10"
              )}
            >
              {day.getDate()}
              {status === 'ACTIVE' && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 bg-brand-accent rounded-full" />
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
    <div className="bg-brand-cream min-h-screen">
      <header className="bg-brand-charcoal text-white pt-28 pb-10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-brand-accent uppercase tracking-[0.2em] text-[9px] font-black">
              <CalendarIcon size={12} /> Daily Rotation
            </div>
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-white">Miami <span className="italic font-light">Curation</span></h1>
          </div>
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-5 text-sm focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-brand-accent transition-all placeholder:text-brand-muted/40"
            />
          </div>
        </div>
      </header>

      <section className="px-6 md:px-12 py-3 sticky top-16 bg-brand-cream/90 backdrop-blur-md z-30 border-b border-brand-clay/10">
        <div className="max-w-7xl mx-auto">
          <div
            ref={sliderRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
          >
            {calendarDates.map(date => {
              const isSelected = toDateKey(date) === toDateKey(selectedDate);
              const status = getDateStatus(date);
              const isToday = toDateKey(date) === toDateKey(getEtNow());

              return (
                <button
                  key={date.toISOString()}
                  data-date={toDateKey(date)}
                  onClick={() => setSelectedDate(date)}
                  className={clsx(
                    "flex flex-col items-center min-w-[64px] py-2.5 rounded-xl transition-all border shrink-0",
                    isSelected
                      ? "bg-brand-charcoal text-white border-brand-charcoal shadow-sm"
                      : status === 'ACTIVE'
                        ? "bg-white text-brand-charcoal border-brand-accent/40 shadow-sm"
                        : status === 'PREVIEW'
                          ? "bg-white text-brand-charcoal border-brand-clay/30"
                          : "bg-white/10 text-brand-muted/30 border-transparent cursor-not-allowed",
                    isToday && !isSelected && "ring-1 ring-brand-accent/50 ring-offset-2 ring-offset-brand-cream"
                  )}
                >
                  <span className="text-[7px] uppercase tracking-widest font-black mb-0.5 opacity-40">
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-base font-serif leading-none mb-0.5">{date.getDate()}</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest opacity-30">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3">
            <div className="mb-10 space-y-3 border-b border-brand-clay/40 pb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-serif capitalize text-brand-charcoal">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
                {currentStatus === 'ACTIVE' && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-accent/10 text-brand-accent rounded-full text-[8px] font-black uppercase tracking-widest">
                    <CheckCircle2 size={10} /> Active Window
                  </span>
                )}
              </div>
              <p className="text-[12px] text-brand-muted font-light max-w-lg leading-relaxed">
                {currentStatus === 'ACTIVE'
                  ? `Order by ${CUTOFF_HOUR}:00 AM ET for same-day Miami delivery.`
                  : currentStatus === 'PREVIEW'
                    ? `Currently viewing the menu for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`
                    : `Kitchen is closed. We operate Monday through Friday.`}
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
                  <div className="col-span-full py-20 text-center space-y-3 bg-brand-clay/10 rounded-2xl border border-dashed border-brand-clay/30">
                    <Lock size={24} className="mx-auto text-brand-muted/40" />
                    <h3 className="text-lg font-serif text-brand-muted">Kitchen Resting</h3>
                    <p className="text-brand-muted/60 text-[11px] font-light">Our chefs return on business days.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-40 space-y-6">
              <MiniCalendar
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
              />
              <div className="p-6 bg-brand-charcoal text-white rounded-[1.25rem] space-y-3">
                <h4 className="font-serif text-base text-brand-accent">Miami Delivery</h4>
                <p className="font-light opacity-60 leading-relaxed text-[11px]">We exclusively serve the Miami metropolitan area. Ordering closes daily at {CUTOFF_HOUR} AM ET.</p>
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
