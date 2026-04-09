import React from 'react';
import { Link } from 'react-router-dom';
import s from './WeCreateRealFood.module.css';

export default function WeCreateRealFood() {
  return (
    <section className={s.section}>
      <img
        src="/assets/we-create.webp"
        alt=""
        aria-hidden
        className={s.bg}
      />
      <div className={s.overlay} />

      <div className={s.content}>
        <h2 className={s.heading}>
          We create{' '}
          <span className={s.handwriting}>real food</span>
          <br />
          lunch experiences
        </h2>
        <Link to="/menu" className={s.btn}>Order Now</Link>
      </div>
    </section>
  );
}
