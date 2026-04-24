import React from 'react';
import s from './AboutHero.module.css';

const RIBBON_ITEMS = ['Fewer decisions', 'Real food', 'Fair Pricing', 'One weekly plan'];

export default function AboutHero() {
  // Render items 4× so the marquee seamlessly loops at -50%
  const repeated = [...RIBBON_ITEMS, ...RIBBON_ITEMS, ...RIBBON_ITEMS, ...RIBBON_ITEMS];

  return (
    <>
      <section className={s.heroSection}>
        <div className={s.heroInner}>
          <picture>
            <source media="(max-width: 767px)" srcSet="/assets/about/hero-mobile.webp" />
            <img
              src="/assets/about/About_Hero.png"
              alt="KNWN is a weekly lunch system delivering freshly cooked meals made with real ingredients every day"
              className={s.heroImg}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </div>
      </section>

      <div className={s.ribbon}>
        <div className={s.ribbonTrack}>
          {repeated.map((item, i) => (
            <React.Fragment key={i}>
              <span className={s.ribbonItem}>{item}</span>
              <span className={s.dot} aria-hidden>•</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
