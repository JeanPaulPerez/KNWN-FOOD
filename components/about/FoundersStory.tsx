import React from 'react';
import s from './FoundersStory.module.css';

// ─── COPY — edit text here ────────────────────────────────────────────────────
const PROBLEM_CARDS = [
  {
    label: 'Another $22 sad salad?',
    img: '/assets/about/Untitled design.png',
    alt: 'Another $22 sad salad',
    cardClass: s.problemCard1,
    imgClass: s.problemImg1,
    style: { transform: 'rotate(-4deg) translateY(10px)' },
    imgStyle: { objectFit: 'cover' as const },
  },
  {
    label: 'Another pile of delivery fees?',
    img: "/assets/about/Fee's.png",
    alt: 'Another pile of delivery fees',
    cardClass: s.problemCard2,
    imgClass: s.problemImg2,
    style: { transform: 'rotate(2deg) translateY(-5px)' },
    imgStyle: { objectFit: 'contain' as const },
  },
  {
    label: 'Another fake fresh meal prep?',
    img: '/assets/about/Meal Prep.png',
    alt: 'Another fake fresh meal prep',
    cardClass: s.problemCard3,
    imgClass: s.problemImg3,
    style: { transform: 'rotate(-3deg) translateY(15px)' },
    imgStyle: { objectFit: 'cover' as const },
  },
];

export default function FoundersStory() {
  return (
    <section className={s.section}>
      <div className={s.inner}>

        <div className={s.divider} />

        {/* Row: photo + intro text */}
        <div className={s.foundersRow}>

          {/* Founders photo */}
          <div className={s.photoWrap}>
            <img src="/assets/about/clip-path-group.jpg" alt="" aria-hidden loading="lazy" className={s.blob} />
            <img src="/assets/about/Daniel y Choco.webp" alt="Daniel and Christian, founders of KNWN" loading="lazy" className={s.founderPhoto} />
            <span className={s.dateStamp}>09.23.2011</span>
          </div>

          {/* Text */}
          <div className={s.foundersText}>
            <h2 className={s.foundersHeading}>We're Daniel and Christian.</h2>
            <p className={s.foundersSubtitle}>
              Two friends. 9 to 5. Office every day.<br />
              And every day, the same question:
            </p>
            <div className={s.stickerWrap}>
              <img
                src="/assets/about/WHAT ARE WE DOING FOR LUNCH.png"
                alt="What are we doing for lunch?"
                loading="lazy"
                className={s.stickerImg}
              />
            </div>
          </div>
        </div>

        {/* Problem cards */}
        <div className={s.problemGrid}>
          {PROBLEM_CARDS.map(({ label, img, alt, style, imgStyle, cardClass, imgClass }) => (
            <div key={label} className={`${s.problemCard} ${cardClass}`} style={style}>
              <span className={s.problemLabel}>{label}</span>
              <div className={s.problemImgWrap}>
                <img src={img} alt={alt} loading="lazy" className={`${s.problemImg} ${imgClass}`} style={imgStyle} />
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className={s.quoteBlock}>
          <h3 className={s.quote}>
            Honestly? Some days it felt easier to skip lunch than to decide what to eat.
          </h3>
          <p className={s.quoteTag}>
            Overpriced lunches. Stacked fees. Daily overthinking.
          </p>
        </div>

      </div>
    </section>
  );
}
