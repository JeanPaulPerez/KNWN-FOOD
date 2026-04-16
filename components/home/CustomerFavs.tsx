import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import s from './CustomerFavs.module.css';

const FAVS = [
  {
    day: 'Monday',
    name: 'Mediterranean Chicken',
    desc: 'Grilled Mediterranean chicken over brown rice and quinoa with fresh greens, cucumber, tomato, and tahini-lemon dressing.',
    img: '/assets/hero-bg/PLATOS SIN FONDO/Mediterranean chicken.png',
  },
  {
    day: 'Tuesday',
    name: 'Carne Asada',
    desc: 'Mexican-marinated steak over brown rice with sautéed peppers and corn, black beans, fresh red onion, and house Chilanga sauce.',
    img: '/assets/hero-bg/PLATOS SIN FONDO/Carne Asada.png',
  },
  {
    day: 'Wednesday',
    name: 'Thai Beef Salad',
    desc: 'Thai-marinated steak over quinoa with crisp greens, cucumber, radish, basil, mint, toasted peanuts, and Thai dressing.',
    img: '/assets/hero-bg/PLATOS SIN FONDO/Thai Beef Salad.png',
  },
];

export default function CustomerFavs() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + FAVS.length) % FAVS.length);
  const next = () => setIdx(i => (i + 1) % FAVS.length);
  const item = FAVS[idx];

  return (
    <section className={s.section}>
      <div className={s.inner}>

        {/* Day badge — top left */}
        <span className={s.dayBadge}>{item.day}</span>

        {/* "Customer favs" heading — desktop */}
        <h2 className={s.heading}>Customer favs</h2>

        {/* "CUSTOMER FAVS" arched heading — mobile only */}
        <svg className={s.headingCurved} viewBox="0 0 360 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <path id="custFavsArch" d="M 15 100 Q 180 8 345 100" />
          </defs>
          <text fontFamily="'Instrument Serif', Georgia, serif" fontSize="46" fontWeight="700" fill="#2B1C70" textAnchor="middle" letterSpacing="1">
            <textPath href="#custFavsArch" startOffset="50%">CUSTOMER FAVS</textPath>
          </text>
        </svg>

        {/* Food bowl cutout — floats over lavender, overlaps blob */}
        <img
          key={item.img}
          src={item.img}
          alt={item.name}
          loading="lazy"
          className={s.foodImg}
        />

        {/* Blob + card content — right side, behind bowl */}
        <div className={s.blobWrap}>
          <img
            src="/assets/hero-bg/Bloque_amarillo.png"
            alt=""
            loading="lazy"
            className={s.blob}
            aria-hidden="true"
          />
          <div className={s.cardBody}>
            <h3 className={s.dishName}>{item.name}</h3>
            <p className={s.dishDesc}>{item.desc}</p>
            <div className={s.deliveryRow}>
              <span className={s.pricePill}>$12.90</span>
              <span className={s.deliveryText}>Delivery Included</span>
            </div>
            <Link to="/menu" className={s.menuBtnWrap}>
              <img src="/assets/hero-bg/SEEMENU.png" alt="See Full Menu" loading="lazy" className={s.menuBtnImg} />
            </Link>
          </div>
        </div>

        {/* Left arrow */}
        <button className={s.arrowLeft} onClick={prev} aria-label="Previous">
          <ChevronLeft size={32} strokeWidth={2.5} />
        </button>

        {/* Right arrow */}
        <button className={s.arrowRight} onClick={next} aria-label="Next">
          <ChevronRight size={32} strokeWidth={2.5} />
        </button>

      </div>
    </section>
  );
}
