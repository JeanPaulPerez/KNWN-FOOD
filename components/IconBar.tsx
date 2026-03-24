import React from 'react';
import s from './IconBar.module.css';

const VALUES = [
  {
    icon: '/assets/icons-values/value-4.png',
    title: 'Simplifying Lunch',
    desc: 'Plan once and handle the week.',
  },
  {
    icon: '/assets/icons-values/value-3.png',
    title: 'Freshness Guarantee',
    desc: 'Never frozen.\nNever batch made.',
  },
  {
    icon: '/assets/icons-values/value-2.png',
    title: 'Bullsh*T Free',
    desc: 'No additives.\nNo shortcuts.',
  },
  {
    icon: '/assets/icons-values/value-1.png',
    title: 'Pay Less Eat Better',
    desc: 'No delivery app fees.\nNo overpriced salads.',
  },
];

export default function IconBar() {
  return (
    <section className={s.section}>
      <div className={s.inner}>
        {VALUES.map(v => (
          <div key={v.title} className={s.item}>
            <img src={v.icon} alt={v.title} className={s.icon} />
            <h4 className={s.title}>{v.title}</h4>
            <p className={s.desc}>{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
