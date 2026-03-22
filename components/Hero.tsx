import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import s from './Hero.module.css';

export default function Hero() {
  return (
    <section className={s.hero}>
      <div className={s.inner}>

        {/* ── LEFT: text ── */}
        <div className={s.left}>
          <p className={s.tag}>No subcription required</p>

          <h1 className={s.heading}>
            <span className={s.headingSerif}>Made this morning.</span>
            <span className={s.headingBold}>Delivered by lunch.</span>
          </h1>

          <p className={s.body}>
            Stop eating week-old meal prep. We cook fresh daily
            and deliver to your office or home instantly.
          </p>

          <Link to="/menu" className={s.cta}>Order Now</Link>

          <div className={s.badges}>
            <span className={s.badge}>
              <MapPin size={14} strokeWidth={1.8} />
              <strong>Free</strong>&nbsp;Next Day Delivery
            </span>
            <span className={s.badge}>
              <Clock size={14} strokeWidth={1.8} />
              Order by 10:00 PM.
            </span>
          </div>
        </div>

        {/* ── RIGHT: hero collage image ── */}
        <div className={s.right}>
          <img
            src="/assets/hero-bg/HomePage_ KNWN.png"
            alt="Fresh food bowls"
            className={s.heroImg}
          />
        </div>

      </div>
    </section>
  );
}
