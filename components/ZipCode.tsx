import React, { useState } from 'react';
import { MapPin, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import s from './ZipCode.module.css';

const DELIVERY_ZIPS = new Set(['33130','33131','33132','33133','33134','33126','33137','33127','33128']);

export default function ZipCode() {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<'valid' | 'invalid' | null>(null);

  const handleCheck = () => {
    const zip = value.trim();
    if (!zip) return;
    setResult(DELIVERY_ZIPS.has(zip) ? 'valid' : 'invalid');
  };

  return (
    <section className={s.section}>
      <div className={s.banner}>

        {/* Left: headline */}
        <p className={s.headline}>
          Check if we<br />deliver to<br />your office.
        </p>

        {/* Center: input + arrow + result */}
        <div className={s.inputGroup}>
          <div className={s.inputWrap}>
            <MapPin size={16} strokeWidth={2} className={s.pin} />
            <input
              type="text"
              placeholder="Enter ZIP code"
              className={s.input}
              value={value}
              maxLength={5}
              onChange={(e) => { setValue(e.target.value.replace(/\D/g, '')); setResult(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            />
            <button className={s.arrowBtn} aria-label="Check delivery" onClick={handleCheck} type="button">
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </div>

          {result === 'valid' && (
            <p className={s.resultValid}>
              <CheckCircle size={14} strokeWidth={2.5} />
              Great news! We deliver to {value}.
            </p>
          )}
          {result === 'invalid' && (
            <p className={s.resultInvalid}>
              <XCircle size={14} strokeWidth={2.5} />
              Sorry, we don't deliver to {value} yet. We serve select Miami, FL zip codes only.
            </p>
          )}
        </div>

        {/* Right text */}
        <p className={s.serving}>
          Now serving Brickell, Downtown,<br />
          Bayside, and Coral Gables.
        </p>

        {/* Illustration */}
        <img
          src="/assets/icons-values/value-3.png"
          alt="Delivery"
          className={s.moto}
        />

      </div>
    </section>
  );
}
