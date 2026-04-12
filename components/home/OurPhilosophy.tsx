import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// ─── COPY — edit text here ────────────────────────────────────────────────────
const COPY = {
  eyebrow: 'Our Philosophy',
  heading: {
    line1: "Busy people don't eat like sh*t by choice",
    line2: 'They eat like sh*t by default',
  },
  bullets: [
    'Restaurants are overpriced',
    'Delivery apps = a pile of fees',
    "Meal prep isn't fresh",
  ],
  tagline: 'One less daily decision. Real food, handled.',
  cta: 'About Us',
  ctaLink: '/about',
  image: '/assets/hero-bg/ourphilosophy.webp',
  imageAlt: 'Our philosophy',
} as const;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function OurPhilosophy() {
  return (
    <section className="bg-[#F5F3FF] py-14 md:py-20 px-5 md:px-8 lg:px-12">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">

        {/* LEFT — photo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[2rem] overflow-hidden h-[480px] md:h-[600px] lg:h-full lg:min-h-[580px]"
        >
          <img
            src={COPY.image}
            alt={COPY.imageAlt}
            loading="lazy"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* RIGHT — text */}
        <div className="flex flex-col justify-center gap-5 md:gap-6 px-0 py-4">
          <span className="text-[18px] font-bold uppercase tracking-[0.18em] text-[#2D1B69]">
            {COPY.eyebrow}
          </span>

          <h2
            className="font-normal text-[#2D1B69] leading-[1.1]"
            style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(36px, 4vw, 52px)' }}
          >
            {COPY.heading.line1}
            <br />
            <span className="text-[#DB5A29]">{COPY.heading.line2}</span>
          </h2>

          <ul
            className="space-y-[6px] md:space-y-2 text-[17px] md:text-[22px] md:text-[#2D1B69] md:bg-transparent md:p-0 md:rounded-none bg-[#2B1A5A] text-white px-8 py-6 rounded-[16px] leading-relaxed list-disc list-outside ml-4 md:ml-8"
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '500' }}
          >
            {COPY.bullets.map((b) => <li key={b} className="pl-1">{b}</li>)}
          </ul>

          <div className="flex flex-row items-center justify-between mt-2 gap-2">
            <p
              className="font-medium text-[#2D1B69] md:font-bold md:text-[20px] text-[16px] leading-tight"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              One less daily decision<br/>Real food, handled
            </p>

            <Link
              to={COPY.ctaLink}
              className="px-6 py-3 md:px-10 md:py-4 min-h-[44px] md:min-h-[52px] flex items-center bg-[#2D1B69] text-white rounded-full font-semibold text-[14px] md:text-[16px] hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {COPY.cta}
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
