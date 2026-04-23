import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import s from './CustomerFavs.module.css';

const FAVS = [
  {
    day: 'Monday',
    name: 'Mediterranean Chicken',
    desc: 'Grilled Mediterranean chicken over brown rice and quinoa with fresh greens, cucumber, tomato, and tahini-lemon dressing.',
    img: '/assets/hero-bg/PLATOS SIN FONDO/Mediterranean chicken.png',
    price: '$12.90',
  },
  {
    day: 'Tuesday',
    name: 'Carne Asada',
    desc: 'Mexican-marinated steak over brown rice with sautéed peppers and corn, black beans, fresh red onion, and house Chilanga sauce.',
    img: '/assets/hero-bg/PLATOS SIN FONDO/Carne Asada.png',
    price: '$15.90',
  },
  {
    day: 'Wednesday',
    name: 'Thai Beef Salad',
    desc: 'Thai-marinated steak over quinoa with crisp greens, cucumber, radish, basil, mint, toasted peanuts, and Thai dressing.',
    img: '/assets/hero-bg/PLATOS SIN FONDO/Thai Beef Salad.png',
    price: '$15.90',
  },
];

const fadeSlide = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit:    { opacity: 0, scale: 0.97 },
  transition: { duration: 0.32, ease: 'easeInOut' },
};

export default function CustomerFavs() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + FAVS.length) % FAVS.length);
  const next = () => setIdx(i => (i + 1) % FAVS.length);
  const item = FAVS[idx];

  // Preload all images on mount so there's no network lag on slide change
  React.useEffect(() => {
    FAVS.forEach(f => { new Image().src = f.img; });
  }, []);

  return (
    <section className={s.section}>
      <div className={s.inner}>

        {/* Day badge — top left */}
        <AnimatePresence mode="wait">
          <motion.span key={`badge-${idx}`} {...fadeSlide} className={s.dayBadge}>
            {item.day}
          </motion.span>
        </AnimatePresence>

        {/* "Customer favs" heading — desktop */}
        <h2 className={s.heading}>Customer favs</h2>

        {/* "CUSTOMER FAVS" arched heading — mobile only */}
        <svg className={s.headingCurved} viewBox="0 0 360 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <path id="custFavsArch" d="M 15 100 Q 180 8 345 100" />
          </defs>
          <text fontFamily="'Instrument Serif', Georgia, serif" fontSize="46" fontWeight="400" fill="#2B1C70" textAnchor="middle" letterSpacing="1">
            <textPath href="#custFavsArch" startOffset="50%">CUSTOMER FAVS</textPath>
          </text>
        </svg>

        {/* Food bowl cutout — crossfade on slide change */}
        <AnimatePresence mode="wait">
          <motion.img
            key={`food-${idx}`}
            src={item.img}
            alt={item.name}
            loading="eager"
            className={s.foodImg}
            {...fadeSlide}
          />
        </AnimatePresence>

        {/* Blob + card content — right side, behind bowl */}
        <div className={s.blobWrap}>
          <img
            src="/assets/hero-bg/Bloque_amarillo.png"
            alt=""
            loading="lazy"
            className={s.blob}
            aria-hidden="true"
          />
          <AnimatePresence mode="wait">
            <motion.div key={`card-${idx}`} {...fadeSlide} className={s.cardBody}>
              <h3 className={s.dishName}>{item.name}</h3>
              <p className={s.dishDesc}>{item.desc}</p>
              <div className={s.deliveryRow}>
                <span className={s.pricePill}>{item.price}</span>
                <span className={s.deliveryText}>Delivery Included</span>
              </div>
              <Link to="/menu" className={s.menuBtnWrap}>
                <img src="/assets/hero-bg/HOMEPAGE.png" alt="" loading="lazy" className={s.menuBtnImg} />
                <span className={s.menuBtnText}>SEE MENU</span>
              </Link>
            </motion.div>
          </AnimatePresence>
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
