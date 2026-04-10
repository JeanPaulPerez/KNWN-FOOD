import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import s from './Hero.module.css';

export default function Hero() {
  return (
    <section className={s.hero}>
      <div className={s.inner}>
        <div className={s.left}>
          <p className={s.tag}>No subscription required</p>

          <h1 className={s.heading}>
            <span className={s.headingSerif}>Made this morning.</span>
            <span className={s.headingBold}>Delivered by lunch.</span>
          </h1>

          <p className={s.body}>
            <span className={s.bodyLine}>Stop eating week-old meal prep. We cook fresh daily</span>
            <span className={s.bodyLine}>and deliver to your office or home instantly.</span>
          </p>

          <Link to="/order" className={s.cta}>Order Now</Link>

          <div className={s.badges}>
            <span className={s.badge}>
              <span className={s.badgeIcon}>
                <MapPin size={18} strokeWidth={2} />
              </span>
              <strong>Free</strong>&nbsp;Next Day Delivery
            </span>
            <span className={s.badge}>
              <span className={s.badgeIcon}>
                <Clock size={18} strokeWidth={2} />
              </span>
              Order by 10:00 PM.
            </span>
          </div>
        </div>

        <div className={s.right}>
          <div className={s.collage} aria-hidden="true">
            <div className={s.glowBlue} />
            <div className={s.glowOrange} />

            <img
              src="/assets/food-cutout/pesto-pasta.png"
              alt=""
              className={`${s.bowl} ${s.bowlTop}`}
              loading="eager"
            />
            <img
              src="/assets/food-cutout/thai-beef-salad.png"
              alt=""
              className={`${s.bowl} ${s.bowlBottom}`}
              loading="eager"
            />

            <img
              src="/assets/stickers/real-ingredients.png"
              alt=""
              className={`${s.sticker} ${s.stickerTop}`}
              loading="eager"
            />
            <img
              src="/assets/stickers/pay-less-eat-better.png"
              alt=""
              className={`${s.sticker} ${s.stickerBottom}`}
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
