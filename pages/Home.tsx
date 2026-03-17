import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Truck, Clock } from 'lucide-react';

/* ─── Customer Favs data ────────────────────────────────────────────────────── */
const FAVS = [
  { day: 'Monday',    name: 'Crispy Korean Chicken',   price: '$12.90', img: '/assets/hero-bg/PLATOS SIN FONDO/Korean Crispy Chicken.png',   desc: 'Brown rice, crispy Korean chicken breast, glazed red cabbage, zucchini, carrot, red onion, gochujang sauce.' },
  { day: 'Tuesday',   name: 'Pesto Pasta',             price: '$12.90', img: '/assets/hero-bg/PLATOS SIN FONDO/Pesto Pasta.png',             desc: 'Al dente rigatoni, house-made basil pesto, sun-dried tomatoes, pine nuts, aged parmesan.' },
  { day: 'Wednesday', name: 'Mediterranean Chicken',   price: '$12.90', img: '/assets/hero-bg/PLATOS SIN FONDO/Mediterranean chicken.png',   desc: 'Herb-roasted chicken, quinoa, roasted peppers, kalamata olives, tzatziki, fresh lemon.' },
  { day: 'Thursday',  name: 'Thai Beef Salad',         price: '$12.90', img: '/assets/hero-bg/PLATOS SIN FONDO/Thai Beef Salad.png',         desc: 'Marinated beef, rice noodles, fresh herbs, cucumber, peanuts, lime-chili vinaigrette.' },
  { day: 'Friday',    name: 'Chicken César Salad',     price: '$12.90', img: '/assets/hero-bg/PLATOS SIN FONDO/Chicken Cesar Salad.png',     desc: 'Grilled chicken breast, romaine, shaved parmesan, house César dressing, sourdough croutons.' },
];

/* ─── Instagram photos ────────────────────────────────────────────────────────── */
const IG_PHOTOS = [
  '/assets/food-bg/korean-crispy-chicken.webp',
  '/assets/food-bg/pesto-pasta.webp',
  '/assets/how-it-works/photo-1.webp',
  '/assets/food-bg/mediterranean-chicken.webp',
  '/assets/how-it-works/photo-2.webp',
  '/assets/food-bg/thai-beef-salad.webp',
];

/* ══════════════════════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [fav, setFav] = useState(0);
  const prev = () => setFav(i => (i - 1 + FAVS.length) % FAVS.length);
  const next = () => setFav(i => (i + 1) % FAVS.length);
  const item = FAVS[fav];

  return (
    <div className="flex flex-col">

      {/* ── 1 · HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-white px-6 md:px-16 pt-16 pb-0 md:pt-20 md:pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-5 max-w-lg"
          >
            {/* orange tag */}
            <span className="self-start text-[10px] font-black uppercase tracking-[0.16em] text-white bg-[#FF5C00] rounded-full px-4 py-1.5">
              Free Next Day Delivery
            </span>

            {/* headline */}
            <h1 className="text-[2.6rem] md:text-[3.6rem] font-black text-[#2D1B69] leading-[1.05] tracking-tight">
              Made this morning.
              <br />
              <span
                className="text-[#FF5C00]"
                style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontWeight: 400 }}
              >
                Delivered by lunch.
              </span>
            </h1>

            <p className="text-brand-primary/55 text-sm md:text-[15px] leading-relaxed font-medium max-w-[400px]">
              Stop eating week-old meal prep. We cook fresh daily and deliver to your office or home instantly.
            </p>

            {/* CTA */}
            <Link
              to="/menu"
              className="w-full sm:self-start sm:w-auto px-7 py-4 sm:py-3.5 bg-brand-orange text-white rounded-full text-xs font-black uppercase tracking-[0.15em] hover:opacity-90 transition-opacity shadow-md mt-1 text-center min-h-[48px] flex items-center justify-center sm:inline-flex"
            >
              Order Now
            </Link>

            {/* perks — outlined badges */}
            <div className="flex flex-wrap gap-3 mt-1">
              <span className="flex items-center gap-2 text-[11px] font-semibold text-[#2D1B69] border border-[#2D1B69]/20 bg-white px-4 py-2 rounded-full shadow-sm">
                <Truck size={13} strokeWidth={2} className="text-[#FF5C00]" />
                Free Next Day Delivery
              </span>
              <span className="flex items-center gap-2 text-[11px] font-semibold text-[#2D1B69] border border-[#2D1B69]/20 bg-white px-4 py-2 rounded-full shadow-sm">
                <Clock size={13} strokeWidth={2} className="text-[#FF5C00]" />
                Order by 5PM
              </span>
            </div>
          </motion.div>

          {/* RIGHT — HomePage_ KNWN.png */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative flex justify-center lg:justify-end items-center mt-8 lg:mt-0"
          >
            <img
              src="/assets/hero-bg/HomePage_ KNWN.png"
              alt="Fresh food bowls"
              className="w-[340px] md:w-[500px] lg:w-[580px] h-auto object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── 2 · HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white border-t border-gray-100 py-24 md:py-36 px-6 md:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* LEFT — photo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl overflow-hidden shadow-xl h-[300px] md:h-[480px]"
          >
            <img
              src="/assets/we-create.webp"
              alt="Freshly cooked meals"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* RIGHT — steps */}
          <div className="flex flex-col gap-10">
            <h2 className="text-4xl md:text-5xl font-black text-brand-primary leading-tight">
              How it{' '}
              <em style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontWeight: 400 }}>
                works
              </em>
            </h2>

            {/* Step 1 — active */}
            <div className="flex flex-col gap-3 pb-6 border-b border-brand-primary/10">
              <div className="self-start flex items-center gap-2.5 px-4 py-2 bg-brand-primary text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-md">
                <span>Step 1</span>
                <span className="text-white/40">→</span>
                <span>Plan Your Week's Lunch</span>
              </div>
              <p className="text-brand-primary/55 text-sm leading-relaxed max-w-sm font-medium">
                Pick from two real food options daily and select your lunches for the week. Plan ahead and save more.
              </p>
              <Link
                to="/menu"
                className="self-start flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary hover:gap-3 transition-all"
              >
                Explore Menu <ArrowRight size={12} />
              </Link>
            </div>

            {/* Step 2 — inactive */}
            <div className="pb-6 border-b border-brand-primary/10 opacity-30">
              <div className="self-start inline-flex items-center gap-2.5 px-4 py-2 bg-brand-subtle text-brand-primary rounded-full text-[11px] font-black uppercase tracking-wider">
                <span>Step 2</span>
                <span className="text-brand-primary/40">→</span>
                <span>We Cook Your Week</span>
              </div>
            </div>

            {/* Step 3 — inactive */}
            <div className="opacity-30">
              <div className="self-start inline-flex items-center gap-2.5 px-4 py-2 bg-brand-subtle text-brand-primary rounded-full text-[11px] font-black uppercase tracking-wider">
                <span>Step 3</span>
                <span className="text-brand-primary/40">→</span>
                <span>Delivered to Your Office</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 · 4 PILLARS (dark navy) ─────────────────────────────────────────── */}
      <section className="bg-[#2D1B69] py-10 px-6 md:px-16 min-h-[120px]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { icon: '/assets/hero-bg/ICONOS VALORES copy/5.png', title: 'SIMPLIFYING LUNCH',   desc: 'Plan once and handle the week.' },
            { icon: '/assets/hero-bg/ICONOS VALORES copy/6.png', title: 'FRESHNESS GUARANTEE', desc: 'Never frozen. Never batch made.' },
            { icon: '/assets/hero-bg/ICONOS VALORES copy/7.png', title: 'BULLSH*T FREE',       desc: 'No additives. No shortcuts.' },
            { icon: '/assets/hero-bg/ICONOS VALORES copy/8.png', title: 'PAY LESS EAT BETTER', desc: 'No delivery app fees. No overpriced salads.' },
          ].map(v => (
            <div key={v.title} className="flex flex-col items-center text-center gap-3">
              <img src={v.icon} alt={v.title} className="w-12 h-12 object-contain" />
              <h4 className="text-[14px] font-bold uppercase tracking-wide text-white leading-snug">{v.title}</h4>
              <p className="text-white/80 text-xs leading-relaxed max-w-[160px]">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4 · CUSTOMER FAVS ─────────────────────────────────────────────────── */}
      <section className="bg-[#EEEAF8] py-16 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 md:px-12">

          {/* TOP ROW */}
          <div className="flex items-center justify-between mb-10">
            <AnimatePresence mode="wait">
              <motion.span
                key={`day-${fav}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="px-5 py-2 bg-[#D4F53C] text-[#2D1B69] rounded-full text-xs font-bold uppercase tracking-widest"
              >
                {item.day}
              </motion.span>
            </AnimatePresence>
            <span
              className="text-4xl text-[#FF5C00]"
              style={{ fontFamily: '"Nothing You Could Do", cursive' }}
            >
              Customer Favs
            </span>
          </div>

          {/* MAIN CARD */}
          <div className="relative" style={{ minHeight: '380px' }}>

            <AnimatePresence mode="wait">
              <motion.div
                key={fav}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
                style={{ minHeight: '380px' }}
              >

                {/* RIGHT SIDE — card with Bloque_amarillo as <img> behind content */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    marginLeft: '300px',
                    minHeight: '380px',
                    borderRadius: '12px',
                  }}
                >
                  {/* Bloque_amarillo as real img, fills the card behind text */}
                  <img
                    src="/assets/hero-bg/Bloque_amarillo.png"
                    alt=""
                    aria-hidden
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'fill', zIndex: 0 }}
                  />

                  {/* Text content on top */}
                  <div style={{ position: 'relative', zIndex: 1, padding: '48px 48px 48px 120px' }}>
                    <h2 className="text-2xl font-bold text-[#2D1B69] leading-tight mb-3">{item.name}</h2>
                    <p className="text-sm text-[#2D1B69] leading-relaxed mb-4 max-w-[320px]">{item.desc}</p>
                    <div className="flex items-center gap-3 flex-wrap mb-4">
                      <span className="bg-[#2D1B69] text-white px-4 py-2 rounded-full text-sm font-bold">
                        {item.price}
                      </span>
                      <span className="border border-[#2D1B69] text-[#2D1B69] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide">
                        Delivery Included
                      </span>
                    </div>
                    <Link
                      to="/menu"
                      className="inline-block mt-2 bg-[#FF5C00] text-white px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                      SEE FULL MENU
                    </Link>
                  </div>
                </div>

                {/* LEFT SIDE — food photo, absolute bottom:0, left:-80px, z-20 */}
                <motion.img
                  key={`img-${fav}`}
                  src={item.img}
                  alt={item.name}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute bottom-0 object-contain pointer-events-none"
                  style={{ width: '450px', zIndex: 20, left: '-80px' }}
                />

              </motion.div>
            </AnimatePresence>

            {/* Left arrow */}
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-[#2D1B69]/20 text-[#2D1B69] flex items-center justify-center hover:bg-[#2D1B69] hover:text-white transition-all shadow-md"
              style={{ zIndex: 30, left: '-48px' }}
            >
              <ChevronLeft size={20} />
            </button>

            {/* Right arrow */}
            <button
              onClick={next}
              aria-label="Next"
              className="absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-[#2D1B69]/20 text-[#2D1B69] flex items-center justify-center hover:bg-[#2D1B69] hover:text-white transition-all shadow-md"
              style={{ zIndex: 30, right: '-48px' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* DOT PAGINATION */}
          <div className="flex justify-center gap-2.5 mt-8">
            {FAVS.map((_, i) => (
              <button
                key={i}
                onClick={() => setFav(i)}
                className={`rounded-full transition-all duration-300 ${i === fav ? 'w-7 h-2.5 bg-[#2D1B69]' : 'w-2.5 h-2.5 bg-[#2D1B69]/20 hover:bg-[#2D1B69]/40'}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ── 5 · DELIVERY ZONE BANNER ──────────────────────────────────────────── */}
      <section className="relative bg-brand-primary overflow-hidden">
        {/* Delivery moto illustration — far right, mix-blend-mode to knock out white bg */}
        <img
          src="/assets/delivery-moto.png"
          alt=""
          aria-hidden
          className="absolute right-0 bottom-0 h-full object-contain object-right-bottom pointer-events-none select-none"
          style={{ mixBlendMode: 'screen', maxWidth: '260px' }}
        />

        <div className="relative z-10 py-8 px-6 md:px-16">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-10 pr-0 md:pr-56">

            <p className="text-white font-black text-base md:text-lg leading-snug flex-shrink-0 md:w-56">
              Check if we deliver<br className="hidden md:block" /> to your office.
            </p>

            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="flex-1 flex items-center bg-white rounded-full overflow-hidden">
                <svg className="ml-4 flex-shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1E0B6E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Enter ZIP code"
                  className="flex-1 py-3 px-3 text-sm text-brand-primary placeholder-brand-primary/30 outline-none font-medium bg-transparent"
                />
              </div>
              <button className="w-11 h-11 flex-shrink-0 rounded-full bg-brand-lime flex items-center justify-center hover:brightness-95 transition-all">
                <ArrowRight size={17} className="text-brand-primary" strokeWidth={2.5} />
              </button>
            </div>

            <p className="hidden lg:block text-white/50 text-xs leading-relaxed flex-shrink-0 max-w-[180px]">
              Now serving Brickell, Downtown, Bayside and Coral Gables.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6 · COMPARISON TABLE (orange bg) ──────────────────────────────────── */}
      <section className="bg-[#FF5C00] w-full py-16 px-8">

        {/* Title block — centered, subtle outlined box */}
        <div className="max-w-3xl mx-auto text-center mb-4">
          <div className="inline-block border border-white/30 rounded-xl px-10 py-5 mb-4">
            <h2 className="text-6xl font-bold italic text-white leading-tight whitespace-nowrap">
              Find the{' '}
              <span className="text-[#D4F53C] not-italic" style={{ fontFamily: '"Nothing You Could Do", cursive', fontWeight: 400 }}>
                real
              </span>{' '}
              lunch.
            </h2>
          </div>
          <p className="text-white text-sm leading-relaxed max-w-2xl mx-auto mt-4">
            Real lunch is made with fresh, high-quality produce, no antibiotics or hormones ever, no seed oils, and sauces made from scratch, no preservatives, just real ingredients.
          </p>
        </div>

        {/* Table */}
        <div className="max-w-4xl mx-auto mt-8 rounded-2xl overflow-hidden bg-white">
          <table className="w-full border-collapse">
            {/* Header */}
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="py-4 px-6 text-left" style={{ width: '12rem' }} />
                {['Pricing', 'Food Quality', 'Convenience', 'No Hidden Fees'].map(col => (
                  <th key={col} className="py-4 px-4 text-center text-sm text-gray-500 font-medium">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row 1 — KNWN: purple bg, white text, white checkmarks */}
              <tr className="bg-[#2D1B69]">
                <td className="py-5 px-6 text-white font-bold text-sm">KNWN Real Food Lunch</td>
                {[0,1,2,3].map(i => (
                  <td key={i} className="py-5 px-4 text-center text-xl text-white">✓</td>
                ))}
              </tr>
              {/* Row 2 — Meal Prep */}
              <tr className="bg-white border-b border-gray-100">
                <td className="py-5 px-6 text-[#2D1B69] text-sm">Meal Prep Service</td>
                <td className="py-5 px-4 text-center text-xl text-[#FF5C00]">✓</td>
                <td /><td /><td />
              </tr>
              {/* Row 3 — Restaurants */}
              <tr className="bg-white">
                <td className="py-5 px-6 text-[#2D1B69] text-sm">Restaurant & Delivery Apps</td>
                <td /><td />
                <td className="py-5 px-4 text-center text-xl text-[#FF5C00]">✓</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>

      </section>

      {/* ── 7 · OUR PHILOSOPHY ────────────────────────────────────────────────── */}
      <section className="bg-white py-16 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">

          {/* LEFT — ourphilosophy.webp */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden h-[360px] lg:h-auto min-h-[420px]"
          >
            <img
              src="/assets/hero-bg/ourphilosophy.webp"
              alt="Our philosophy"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* RIGHT — text */}
          <div className="flex flex-col justify-center gap-5">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
              Our Philosophy
            </span>

            <h2 className="text-3xl font-bold text-[#2D1B69] leading-snug">
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
              className="self-start px-8 py-3 bg-[#2D1B69] text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity mt-1"
            >
              ABOUT US
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8 · WE CREATE REAL FOOD (full-bleed CTA) ──────────────────────────── */}
      <section className="relative h-[460px] md:h-[540px] flex items-center justify-center overflow-hidden">
        <img
          src="/assets/we-create.webp"
          className="absolute inset-0 w-full h-full object-cover"
          alt=""
          aria-hidden
        />
        <div className="absolute inset-0 bg-brand-primary/55" />

        <div className="relative z-10 text-center flex flex-col items-center gap-6 px-6">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
            We create{' '}
            <em
              className="not-italic text-brand-orange"
              style={{ fontFamily: '"Nothing You Could Do", cursive', fontSize: '0.85em' }}
            >
              real food
            </em>
            <br />
            lunch experiences
          </h2>
          <Link
            to="/menu"
            className="px-10 py-4 bg-brand-orange text-white rounded-full font-black uppercase tracking-[0.15em] text-[11px] hover:opacity-90 transition-opacity shadow-2xl"
          >
            Order Now
          </Link>
        </div>
      </section>

      {/* ── 9 · FOLLOW US @KNWNFOOD ───────────────────────────────────────────── */}
      <section className="bg-[#F5F3FF] py-16 md:py-20 px-6 md:px-16">
        <div className="max-w-7xl mx-auto space-y-8">
          <h2
            className="text-4xl md:text-5xl text-brand-orange"
            style={{ fontFamily: '"Nothing You Could Do", cursive' }}
          >
            Follow Us @Knwnfood
          </h2>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {IG_PHOTOS.map((src, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl aspect-square ${i % 2 === 1 ? 'translate-y-3' : ''}`}
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
