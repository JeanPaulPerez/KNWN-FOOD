import React from 'react';
import { Link } from 'react-router-dom';
import s from './HowWeFixLunch.module.css';

// ─── COPY — edit text here ────────────────────────────────────────────────────
const CARDS = [
  {
    n: '1',
    title: 'We remove the daily decision.',
    body: 'Instead of asking what to eat every single day, you plan once for the week.',
  },
  {
    n: '2',
    title: 'Real fresh food every day.',
    body: 'We cook real food from scratch every morning and deliver it to your office by lunch.',
  },
  {
    n: '3',
    title: 'No inflated pricing.',
    body: 'No app fees. No overpriced salads. Just real food at a real price.',
  },
];

const COPY = {
  heading1: 'How we fix the',
  heading2: 'Lunch Problem',
  quote: 'Just fewer decisions, better ingredients, and a system built for real workdays.',
  cta: 'Ready to try it?',
  photo: '/assets/about/DSC01466.webp',
};

export default function HowWeFixLunch() {
  return (
    <section className={s.section}>
      <div className={s.inner}>
        <div className={s.layout}>

          {/* Left: tall photo */}
          <div className={s.photoWrap}>
            <img src={COPY.photo} alt="Person opening a KNWN lunch box at their desk" className={s.photo} />
          </div>

          {/* Right: heading + cards + quote + CTA */}
          <div className={s.content}>

            <h2 className={s.heading}>
              {COPY.heading1}<br />
              <span className={s.headingSpaced}>{COPY.heading2}</span>
            </h2>

            <div className={s.cards}>
              {CARDS.map(({ n, title, body }) => (
                <div key={n} className={s.card}>
                  <p className={s.cardTitle}>{title}</p>
                  <p className={s.cardBody}>{body}</p>
                  <span className={s.cardNumber}>{n}</span>
                </div>
              ))}
            </div>

            <p className={s.quote}>{COPY.quote}</p>

            <div className={s.ctaWrap}>
              <Link to="/menu" className={s.cta}>{COPY.cta}</Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
