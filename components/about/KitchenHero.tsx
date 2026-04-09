import React from 'react';
import s from './KitchenHero.module.css';

// ─── COPY — edit text here ────────────────────────────────────────────────────
const COPY = {
  eyebrow: 'It was a broken system...',
  heading: 'So we stopped chasing better options and built a better default.',
  photo:   '/assets/about/kitchen-1.webp',
};

export default function KitchenHero() {
  return (
    <section className={s.section}>
      <div className={s.inner}>
        <div className={s.card}>
          <img src={COPY.photo} alt="KNWN kitchen" className={s.photo} />
          <div className={s.overlay} />
          <div className={s.content}>
            <p className={s.eyebrow}>{COPY.eyebrow}</p>
            <h2 className={s.heading}>{COPY.heading}</h2>
          </div>
        </div>
      </div>
    </section>
  );
}
