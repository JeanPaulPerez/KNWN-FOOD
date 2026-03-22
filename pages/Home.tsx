import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import IconBar from '../components/IconBar';
import CustomerFavs from '../components/CustomerFavs';
import ZipCode from '../components/ZipCode';
import FindRealLunch from '../components/FindRealLunch';
import WeCreateRealFood from '../components/WeCreateRealFood';
import FollowUs from '../components/FollowUs';

/* ══════════════════════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function Home() {

  return (
    <div className="flex flex-col">

      {/* ── 1 · HERO ─────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── 2 · HOW IT WORKS ──────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── 3 · ICON BAR ──────────────────────────────────────────────────────── */}
      <IconBar />

      {/* ── 4 · CUSTOMER FAVS ─────────────────────────────────────────────────── */}
      <CustomerFavs />

      {/* ── 5 · ZIP CODE BANNER ───────────────────────────────────────────────── */}
      <ZipCode />

      {/* ── 6 · FIND THE REAL LUNCH ───────────────────────────────────────────── */}
      <FindRealLunch />

      {/* ── 7 · OUR PHILOSOPHY ────────────────────────────────────────────────── */}
      <section className="bg-white py-12 md:py-16 px-5 md:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-stretch">

          {/* LEFT — ourphilosophy.webp */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden h-[240px] md:h-[340px] lg:h-auto lg:min-h-[420px]"
          >
            <img
              src="/assets/hero-bg/ourphilosophy.webp"
              alt="Our philosophy"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* RIGHT — text */}
          <div className="flex flex-col justify-center gap-4 md:gap-5">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
              Our Philosophy
            </span>

            <h2 className="text-2xl md:text-3xl font-bold text-[#2D1B69] leading-snug">
              Busy people don't eat like shit by choice.
              <br />
              <span className="text-[#FF5C00]">They eat like shit by default.</span>
            </h2>

            <ul className="space-y-2 text-sm text-[#2D1B69] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#FF5C00] font-bold mt-0.5">•</span>
                Restaurants are overpriced.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5C00] font-bold mt-0.5">•</span>
                Delivery apps = a pile of fees.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5C00] font-bold mt-0.5">•</span>
                Meal prep isn't fresh.
              </li>
            </ul>

            <p className="font-bold text-[#2D1B69] text-base leading-snug">
              One less daily decision. Real food, handled.
            </p>

            <Link
              to="/about"
              className="self-start px-8 py-3 min-h-[44px] flex items-center bg-[#2D1B69] text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity mt-1"
            >
              ABOUT US
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8 · WE CREATE REAL FOOD ───────────────────────────────────────────── */}
      <WeCreateRealFood />

      {/* ── 9 · FOLLOW US @KNWNFOOD ───────────────────────────────────────────── */}
      <FollowUs />

    </div>
  );
}
