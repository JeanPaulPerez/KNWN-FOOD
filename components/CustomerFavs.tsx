import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import s from './CustomerFavs.module.css';

const FAVS = [
  {
    day: 'Monday',
    name: 'Crispy Korean Chicken',
    desc: 'Brown rice, crispy Korean chicken breast, glazed red cabbage, zucchini, carrot, red onion, gochujang sauce.',
    img: '/assets/hero-bg/PLATOS SIN FONDO/Korean Crispy Chicken.png',
  },
  {
    day: 'Tuesday',
    name: 'Pesto Pasta',
    desc: 'Al dente rigatoni, house-made basil pesto, sun-dried tomatoes, pine nuts, aged parmesan.',
    img: '/assets/hero-bg/PLATOS SIN FONDO/Pesto Pasta.png',
  },
  {
    day: 'Wednesday',
    name: 'Mediterranean Chicken',
    desc: 'Herb-roasted chicken, quinoa, roasted peppers, kalamata olives, tzatziki, fresh lemon.',
    img: '/assets/hero-bg/PLATOS SIN FONDO/Mediterranean chicken.png',
  },
  {
    day: 'Thursday',
    name: 'Thai Beef Salad',
    desc: 'Marinated beef, rice noodles, fresh herbs, cucumber, peanuts, lime-chili vinaigrette.',
    img: '/assets/hero-bg/PLATOS SIN FONDO/Thai Beef Salad.png',
  },
  {
    day: 'Friday',
    name: 'Chicken César Salad',
    desc: 'Grilled chicken breast, romaine, shaved parmesan, house César dressing, sourdough croutons.',
    img: '/assets/hero-bg/PLATOS SIN FONDO/Chicken Cesar Salad.png',
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

        {/* "Customer favs" heading — top right, above blob */}
        <h2 className={s.heading}>Customer favs</h2>

        {/* Food bowl cutout — floats over lavender, overlaps blob */}
        <img
          key={item.img}
          src={item.img}
          alt={item.name}
          className={s.foodImg}
        />

        {/* Blob + card content — right side, behind bowl */}
        <div className={s.blobWrap}>
          <img
            src="/assets/hero-bg/Bloque_amarillo.png"
            alt=""
            className={s.blob}
            aria-hidden="true"
          />
          <div className={s.cardBody}>
            <h3 className={s.dishName}>{item.name}</h3>
            <p className={s.dishDesc}>{item.desc}</p>
            <div className={s.deliveryRow}>
              <span className={s.deliveryBox} />
              <span className={s.deliveryText}>Delivery Included</span>
            </div>
            <Link to="/menu" className={s.menuBtn}>See Full Menu</Link>
          </div>
        </div>

        {/* Left arrow */}
        <button className={s.arrowLeft} onClick={prev} aria-label="Previous">
          <ChevronLeft size={20} strokeWidth={2} />
        </button>

        {/* Right arrow */}
        <button className={s.arrowRight} onClick={next} aria-label="Next">
          <ChevronRight size={20} strokeWidth={2} />
        </button>

      </div>
    </section>
  );
}
