import React from 'react';
import s from './AboutHero.module.css';

const RIBBON_ITEMS = ['Fewer decisions', 'Real food', 'Fair Pricing', 'One weekly plan'];

export default function AboutHero() {
  return (
    <>
      <section className={s.heroSection}>
        <div className={s.heroInner}>
          <img
            src="/assets/about/About_Hero.png"
            alt="KNWN is a weekly lunch system delivering freshly cooked meals made with real ingredients every day"
            className={s.heroImg}
          />
        </div>
      </section>

      <div className={s.ribbon}>
        <div className={s.ribbonInner}>
          {RIBBON_ITEMS.map((item, i) => (
            <React.Fragment key={item}>
              <span>{item}</span>
              {i < RIBBON_ITEMS.length - 1 && <span className={s.dot}>•</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
