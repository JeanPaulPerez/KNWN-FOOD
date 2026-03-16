
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-[#F5F3FF] min-h-screen">

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl space-y-6"
          >
            <span className="text-brand-primary/40 uppercase tracking-[0.4em] text-[10px] font-black">Our Story</span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold leading-[0.9] tracking-tight text-brand-primary">
              We're just two guys who{' '}
              <span className="font-serif italic font-normal text-brand-orange">got tired of bad lunch.</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ─── FOUNDERS ──────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-brand-primary/10">
              <img
                src="/assets/about/founders.webp"
                alt="Daniel and Choco, KNWN founders"
                className="w-full h-[420px] md:h-[580px] object-cover"
              />
            </div>
            {/* Floating sticker */}
            <motion.img
              src="/assets/stickers/real-ingredients.png"
              alt="Real ingredients"
              animate={{ rotate: [10, 16, 10] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="absolute -bottom-4 -right-4 w-28 md:w-36 drop-shadow-xl z-10"
            />
          </motion.div>

          {/* Text */}
          <div className="space-y-7">
            <h2 className="text-3xl md:text-5xl font-extrabold text-brand-primary leading-tight">
              Born from frustration.{' '}
              <span className="font-serif italic font-normal text-brand-orange">Built with purpose.</span>
            </h2>

            <div className="space-y-4 text-brand-primary/60 leading-relaxed text-sm md:text-base font-medium">
              <p>
                We were working long days in Miami — back-to-back meetings, no time to cook, and the same three delivery apps cycling through overpriced mediocrity. The "healthy" options were either boring, expensive, or both.
              </p>
              <p>
                So we started cooking. Not as a side project. As a{' '}
                <span className="font-bold text-brand-primary">genuine attempt to solve the lunch problem</span>{' '}
                for people who work hard and eat way worse than they should.
              </p>
              <p>
                KNWN started in a small kitchen. We built the menu around one question:{' '}
                <span className="font-bold text-brand-primary italic">what would we actually want to eat five days a week?</span>
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-primary/20">
                <img src="/assets/about/founders.webp" alt="Daniel" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-brand-primary text-sm">Daniel & Choco</p>
                <p className="text-brand-primary/40 text-xs">Co-founders, KNWN Food</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── KITCHEN GALLERY ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#F5F3FF]">
        <div className="max-w-7xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-primary">
            Inside our{' '}
            <span className="font-serif italic font-normal">kitchen</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="overflow-hidden rounded-3xl shadow-lg h-[300px] md:h-[480px]">
              <img
                src="/assets/about/kitchen-1.webp"
                alt="KNWN kitchen"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-3xl shadow-lg col-span-2 h-[200px] md:h-[280px]">
                <img
                  src="/assets/about/kitchen-2.webp"
                  alt="Cooking fresh"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="overflow-hidden rounded-3xl shadow-lg h-[140px] md:h-[180px]">
                <img
                  src="/assets/food-bg/harissa-meatballs.jpg"
                  alt="Fresh food"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="overflow-hidden rounded-3xl shadow-lg h-[140px] md:h-[180px]">
                <img
                  src="/assets/food-bg/mediterranean-chicken.jpg"
                  alt="Mediterranean Chicken"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 bg-brand-primary text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 text-center">
            <div className="space-y-3">
              <p className="text-5xl md:text-7xl font-extrabold text-brand-lime tracking-tight">0%</p>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40">Frozen ingredients</p>
            </div>
            <div className="space-y-3">
              <p className="text-5xl md:text-7xl font-extrabold tracking-tight">100%</p>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40">Cooked daily from scratch</p>
            </div>
            <div className="space-y-3">
              <p className="text-5xl md:text-7xl font-extrabold text-brand-orange tracking-tight">5k+</p>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40">Lunches delivered</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PHILOSOPHY TEXT ───────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary/30">What We Believe</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-primary leading-snug">
            Real ingredients.{' '}
            <span className="font-serif italic font-normal text-brand-orange">Real people. Real food.</span>
          </h2>
          <p className="text-brand-primary/55 text-base leading-relaxed font-medium">
            We believe the best lunch isn't the fanciest or the cheapest — it's the one that's cooked with care, made from real food, and doesn't require you to stress about it. That's what we show up to build every single morning.
          </p>
          <Link
            to="/order"
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-lime text-brand-primary rounded-full font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
          >
            Try Our Menu <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}
