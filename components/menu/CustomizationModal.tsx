import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { MenuItem } from '../../types';
import s from './CustomizationModal.module.css';

// ─── COPY — edit labels here ──────────────────────────────────────────────────
const COPY = {
  baseLabel:       'Choose your base',
  baseRequired:    'Required • 1',
  sauceLabel:      'Choose your sauce',
  sauceRequired:   'Required • 1',
  vegLabel:        'Make it vegetarian?',
  vegOptional:     'Optional',
  vegOption:       'Replace protein with mushrooms',
  dislikeLabel:    'Remove ingredients',
  dislikeOptional: 'Optional',
  addToWeek:       'Add to My Week',
} as const;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
interface Props {
  item: MenuItem;
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customs: any) => void;
}

export const CustomizationModal: React.FC<Props> = ({ item, date, isOpen, onClose, onConfirm }) => {
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
    <div className={s.overlay}>
      <motion.div
        className={s.modal}
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className={s.scrollBody}>

          {/* Image header */}
          <div className={s.imageHeader}>
            <button className={s.closeBtn} onClick={onClose}>
              <X size={20} className="stroke-[3]" />
            </button>
            <img src={item.image} className={s.headerImage} alt={item.name} />
          </div>

          {/* Content */}
          <div className={s.body}>
            <div>
              <span className={s.deliveryBadge}>
                • Scheduled Delivery • {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: '2-digit' })}
              </span>
              <h2 className={s.itemTitle}>{item.name}</h2>
              <p className={s.itemDesc}>{item.description}</p>
            </div>

            {opts?.bases && opts.bases.length > 0 && (
              <div className={s.optSection}>
                <div className={s.optHeader}>
                  <h4 className={s.optLabel}>{COPY.baseLabel}</h4>
                  <span className={s.optRequired}>{COPY.baseRequired}</span>
                </div>
                {opts.bases.map(b => (
                  <label key={b} className={s.optRow}>
                    <div className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all', base === b ? 'border-[#2D1B69]' : 'border-[#2D1B69]/20 hover:border-[#2D1B69]/50')}>
                      {base === b && <div className="w-2.5 h-2.5 bg-[#2D1B69] rounded-full" />}
                    </div>
                    <span className={clsx('text-[13px] font-semibold', base === b ? 'text-[#2D1B69]' : 'text-[#2D1B69]/70')} onClick={() => setBase(b)}>{b}</span>
                  </label>
                ))}
              </div>
            )}

            {opts?.sauces && opts.sauces.length > 0 && (
              <div className={s.optSection}>
                <div className={s.optHeader}>
                  <h4 className={s.optLabel}>{COPY.sauceLabel}</h4>
                  <span className={s.optRequired}>{COPY.sauceRequired}</span>
                </div>
                {opts.sauces.map(sc => (
                  <label key={sc} className={s.optRow}>
                    <div className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all', sauce === sc ? 'border-[#2D1B69]' : 'border-[#2D1B69]/20 hover:border-[#2D1B69]/50')}>
                      {sauce === sc && <div className="w-2.5 h-2.5 bg-[#2D1B69] rounded-full" />}
                    </div>
                    <span className={clsx('text-[13px] font-semibold', sauce === sc ? 'text-[#2D1B69]' : 'text-[#2D1B69]/70')} onClick={() => setSauce(sc)}>{sc}</span>
                  </label>
                ))}
              </div>
            )}

            {opts?.hasVegetarianOption && (
              <div className={s.optSection}>
                <div className={s.optHeader}>
                  <h4 className={s.optLabel}>{COPY.vegLabel}</h4>
                  <span className={s.optOptional}>{COPY.vegOptional}</span>
                </div>
                <label className={s.optRow} onClick={() => setIsVeg(v => !v)}>
                  <div className={clsx('w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-all', isVeg ? 'border-[#2D1B69] bg-[#2D1B69]' : 'border-[#2D1B69]/20 bg-white hover:border-[#2D1B69]/50')}>
                    {isVeg && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white stroke-current stroke-[3]"><path d="M2.5 7L5.5 10L11.5 4" /></svg>}
                  </div>
                  <span className={clsx('text-[13px] font-semibold', isVeg ? 'text-[#2D1B69]' : 'text-[#2D1B69]/70')}>{COPY.vegOption}</span>
                </label>
              </div>
            )}

            {opts?.dislikes && opts.dislikes.length > 0 && (
              <div className={s.optSection}>
                <div className={s.optHeader}>
                  <h4 className={s.optLabel}>{COPY.dislikeLabel}</h4>
                  <span className={s.optOptional}>{COPY.dislikeOptional}</span>
                </div>
                {opts.dislikes.map(opt => (
                  <label key={opt} className={s.optRow} onClick={() => toggleAvoid(opt)}>
                    <div className={clsx('w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-all', avoidList.includes(opt) ? 'border-[#2D1B69] bg-[#2D1B69]' : 'border-[#2D1B69]/20 bg-white hover:border-[#2D1B69]/50')}>
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
        <div className={s.actionBar}>
          <div className={s.qtyControl}>
            <button className={s.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span className={s.qtyValue}>{qty}</span>
            <button className={s.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
          </div>
          <button
            className={s.addBtn}
            onClick={() => onConfirm({ base, sauce, isVegetarian: isVeg, avoid: avoidList.join(', '), quantity: qty })}
          >
            {COPY.addToWeek} · ${(item.price * qty).toFixed(2)}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
