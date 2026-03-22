import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import s from './ZipCode.module.css';

export default function ZipCode() {
  return (
    <section className={s.section}>
      <div className={s.banner}>

        {/* Left: headline */}
        <p className={s.headline}>
          Check if we<br />deliver to<br />your office.
        </p>

        {/* Center: input + arrow */}
        <div className={s.inputWrap}>
          <MapPin size={16} strokeWidth={2} className={s.pin} />
          <input
            type="text"
            placeholder="Enter ZIP code"
            className={s.input}
          />
          <button className={s.arrowBtn} aria-label="Check delivery">
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
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
