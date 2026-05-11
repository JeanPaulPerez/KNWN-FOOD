import React from 'react';
import { motion } from 'framer-motion';

export default function MaintenancePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-20 bg-[#F4F1FF] text-center">

      {/* Logo */}
      <motion.img
        src="/assets/logo.webp"
        alt="KNWN Food"
        className="w-28 md:w-36 brightness-0 mb-12 opacity-90"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 0.9, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />

      {/* Food cutout decorative */}
      <motion.img
        src="/assets/food-cutout/mediterranean-chicken.webp"
        alt=""
        aria-hidden="true"
        className="w-44 md:w-56 drop-shadow-2xl mb-10 select-none pointer-events-none"
        initial={{ opacity: 0, scale: 0.88, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, rotate: -2 }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
      />

      {/* Heading */}
      <motion.h1
        className="font-serif text-[40px] md:text-[56px] leading-[1.1] text-brand-primary mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        Back Soon.
      </motion.h1>

      {/* Subtext */}
      <motion.p
        className="text-brand-primary/50 text-sm md:text-base font-medium max-w-sm leading-relaxed mb-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45 }}
      >
        We're taking a moment to improve your experience.
        <br />
        Real food, better than ever — coming right back.
      </motion.p>

      {/* Pill badge */}
      <motion.div
        className="inline-flex items-center gap-2 bg-brand-primary/5 border border-brand-primary/10 text-brand-primary/60 rounded-full px-5 py-2.5 text-[11px] uppercase tracking-[0.25em] font-black mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse inline-block" />
        Maintenance in Progress
      </motion.div>

      {/* Instagram link */}
      <motion.a
        href="https://www.instagram.com/knwnfood/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] uppercase tracking-[0.25em] font-black text-brand-primary/30 hover:text-brand-primary transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.75 }}
      >
        @knwnfood
      </motion.a>
    </div>
  );
}
