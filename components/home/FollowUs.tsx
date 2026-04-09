import React from 'react';
import s from './FollowUs.module.css';

const PHOTOS = [
  '/assets/food-bg/korean-crispy-chicken.webp',
  '/assets/how-it-works/photo-1.webp',
  '/assets/hero-bg/DSC01587.webp',
  '/assets/hero-bg/KNKW-1305.webp',
  '/assets/food-bg/mediterranean-chicken.webp',
  '/assets/hero-bg/DSC00958.webp',
  '/assets/how-it-works/photo-2.webp',
  '/assets/food-bg/thai-beef-salad.webp',
];

export default function FollowUs() {
  return (
    <section className={s.section}>
      <div className={s.inner}>
        <h2 className={s.heading}>Follow Us @knwnfood</h2>

        <div className={s.grid}>
          {PHOTOS.map((src, i) => (
            <div key={i} className={s.cell}>
              <img src={src} alt="" className={s.photo} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
