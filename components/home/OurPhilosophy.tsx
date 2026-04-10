import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// ─── COPY — edit text here ────────────────────────────────────────────────────
const COPY = {
  eyebrow: 'Our Philosophy',
  heading: {
    line1: "Busy people don't eat like shit by choice.",
    line2: 'They eat like shit by default.',
  },
  bullets: [
    'Restaurants are overpriced.',
    'Delivery apps = a pile of fees.',
    "Meal prep isn't fresh.",
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
            className="space-y-2 text-[22px] text-[#2D1B69] leading-relaxed list-disc list-inside"
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '500', paddingLeft: '2rem' }}
          >
            {COPY.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>

          <p
            className="font-bold text-[#2D1B69] text-[20px] leading-snug"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {COPY.tagline}
          </p>

          <Link
            to={COPY.ctaLink}
            className="self-start px-10 py-4 min-h-[52px] flex items-center bg-[#2D1B69] text-white rounded-full font-semibold text-[16px] hover:opacity-90 transition-opacity mt-2"
          >
            {COPY.cta}
          </Link>
        </div>

      </div>
    </section>
  );
}
