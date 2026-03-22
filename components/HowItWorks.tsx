import React from 'react';
import { Link } from 'react-router-dom';
import s from './HowItWorks.module.css';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className={s.section}>
      <div className={s.card}>

        {/* ── LEFT: photo ── */}
        <div className={s.photoWrap}>
          <img
            src="/assets/hero-bg/KNKW-1293.webp"
            alt="Fresh food bowls"
            className={s.photo}
          />
        </div>

        {/* ── RIGHT: steps ── */}
        <div className={s.content}>

          <h2 className={s.heading}>
            How it<br />works
          </h2>

          {/* Step 1 — active */}
          <div className={s.stepActive}>
            <span className={s.pillActive}>Step 1 &bull; Plan Your Week's Lunch</span>
            <p className={s.desc}>
              Pick from two real food options daily and select your lunches for
              the week. Plan ahead and save more.
            </p>
            <Link to="/menu" className={s.exploreBtn}>Explore Menu</Link>
          </div>

          <hr className={s.divider} />

          {/* Step 2 */}
          <div className={s.step}>
            <span className={s.pill}>Step 2 &bull;&nbsp; We Cook Your Week</span>
          </div>

          <hr className={s.divider} />

          {/* Step 3 */}
          <div className={s.step}>
            <span className={s.pill}>Step 3 &bull;&nbsp; Delivered to Your Office</span>
          </div>

        </div>
      </div>
    </section>
  );
}
