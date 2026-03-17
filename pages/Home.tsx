import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Truck, Clock } from 'lucide-react';

/* ─── Customer Favs data ────────────────────────────────────────────────────── */
const FAVS = [
  { day: 'Monday',    name: 'Crispy Korean Chicken',   price: '$15.90', img: '/assets/food-bg/korean-crispy-chicken.webp',   desc: 'Brown rice, crispy Korean chicken breast, glazed red cabbage, zucchini, carrot, red onion, gochujang sauce.' },
  { day: 'Tuesday',   name: 'Pesto Pasta',             price: '$15.90', img: '/assets/food-bg/pesto-pasta.webp',             desc: 'Al dente rigatoni, house-made basil pesto, sun-dried tomatoes, pine nuts, aged parmesan.' },
  { day: 'Wednesday', name: 'Mediterranean Chicken',   price: '$15.90', img: '/assets/food-bg/mediterranean-chicken.webp',   desc: 'Herb-roasted chicken, quinoa, roasted peppers, kalamata olives, tzatziki, fresh lemon.' },
  { day: 'Thursday',  name: 'Thai Beef Salad',         price: '$15.90', img: '/assets/food-bg/thai-beef-salad.webp',         desc: 'Marinated beef, rice noodles, fresh herbs, cucumber, peanuts, lime-chili vinaigrette.' },
  { day: 'Friday',    name: 'Chicken César Salad',     price: '$15.90', img: '/assets/food-bg/chicken-cesar-salad.webp',     desc: 'Grilled chicken breast, romaine, shaved parmesan, house César dressing, sourdough croutons.' },
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
      <section className="bg-white px-6 md:px-16 pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 items-center">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-5 max-w-lg"
          >
            {/* badge */}
            <span className="self-start text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary/55 border border-brand-primary/20 rounded-full px-4 py-1.5">
              No Subscription Required
            </span>

            {/* headline */}
            <h1 className="text-[2.6rem] md:text-[3.6rem] font-black text-brand-primary leading-[1.05] tracking-tight">
              Made this morning.
              <br />
              <em
                className="not-italic text-brand-orange"
                style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic' }}
              >
                Delivered by lunch.
              </em>
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

            {/* perks — pill badges per design */}
            <div className="flex flex-wrap gap-3 mt-1">
              <span className="flex items-center gap-2 text-[11px] font-semibold text-white bg-[#2D9455] px-4 py-2 rounded-full">
                🌿 Free Next Day Delivery
              </span>
              <span className="flex items-center gap-2 text-[11px] font-semibold text-white bg-brand-primary px-4 py-2 rounded-full">
                🕐 Order by 10:00 PM
              </span>
            </div>
          </motion.div>

          {/* RIGHT — bowl + stickers */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative flex justify-center items-center mt-6 lg:mt-0"
          >
            <div className="relative w-[300px] md:w-[380px] lg:w-[440px]">
              {/* main bowl — circular crop */}
              <img
                src="/assets/food-bg/korean-crispy-chicken.webp"
                alt="Crispy Korean Chicken bowl"
                className="w-full aspect-square object-cover rounded-full shadow-2xl border-[6px] border-white"
              />

              {/* "Real ingredients." sticker — top right, tilted */}
              <motion.img
                src="/assets/stickers/real-ingredients.png"
                alt=""
                aria-hidden
                animate={{ rotate: [10, 15, 10] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                className="absolute -top-4 -right-6 md:-top-6 md:-right-8 w-[110px] md:w-[136px] drop-shadow-xl pointer-events-none"
                style={{ transform: 'rotate(12deg)' }}
              />

              {/* "Pay Less. Eat better" sticker — bottom left, tilted */}
              <motion.img
                src="/assets/stickers/pay-less-eat-better.png"
                alt=""
                aria-hidden
                animate={{ rotate: [-8, -4, -8] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-8 md:-bottom-6 md:-left-10 w-[130px] md:w-[160px] drop-shadow-xl pointer-events-none"
                style={{ transform: 'rotate(-7deg)' }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2 · HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white border-t border-gray-100 py-16 md:py-24 px-6 md:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

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
          <div className="flex flex-col gap-7">
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
      <section className="bg-brand-primary py-14 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {[
            { icon: '/assets/icons-steps/step-1.svg', title: 'Simplifying Lunch',     desc: 'Plan once and handle the week.' },
            { icon: '/assets/icons-steps/step-2.svg', title: 'Freshness Guarantee',   desc: 'Never frozen. Never batch made.' },
            { icon: '/assets/icons-steps/step-3.svg', title: 'Bullsh*t Free',         desc: 'No additives. No shortcuts.' },
            { icon: '/assets/icons-steps/step-4.svg', title: 'Pay Less Eat Better',   desc: 'No delivery app fees. No overpriced salads.' },
          ].map(v => (
            <div key={v.title} className="flex flex-col items-center text-center gap-4">
              <img src={v.icon} alt={v.title} className="w-14 h-14 object-contain" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white leading-snug">{v.title}</h4>
              <p className="text-white/40 text-xs leading-relaxed max-w-[150px]">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4 · CUSTOMER FAVS ─────────────────────────────────────────────────── */}
      <section className="bg-[#F5F3FF] py-12 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-10">

          {/* Header row: day badge left, cursive title right */}
          <div className="flex items-center justify-between mb-6 md:mb-8 px-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={`day-${fav}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="px-5 py-2 bg-brand-lime text-brand-primary rounded-full text-xs font-black uppercase tracking-widest shadow-sm"
              >
                {item.day}
              </motion.span>
            </AnimatePresence>
            <span
              className="text-[2rem] md:text-[3rem] text-brand-primary"
              style={{ fontFamily: '"Nothing You Could Do", cursive', transform: 'rotate(-3deg)', display: 'block' }}
            >
              Customer favs
            </span>
          </div>

          {/* Slider */}
          <div className="relative">

            {/* Left arrow */}
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white border-2 border-brand-primary/20 text-brand-primary flex items-center justify-center hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={fav}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative flex items-center mx-10 md:mx-14 min-h-[280px] md:min-h-[400px]"
              >
                {/* Lime card — right side */}
                <div className="ml-auto w-[78%] md:w-[68%] rounded-[2rem] md:rounded-[2.5rem] bg-brand-lime min-h-[280px] md:min-h-[380px] flex items-center">
                  <div className="pl-[40%] md:pl-[38%] pr-6 md:pr-10 py-10 md:py-12 flex flex-col gap-3 md:gap-4">
                    <h3 className="text-xl md:text-2xl font-black text-brand-primary leading-tight">{item.name}</h3>
                    <p className="text-xs md:text-sm text-brand-primary/70 font-medium leading-relaxed max-w-[260px]">{item.desc}</p>
                    <div className="flex items-center gap-3 flex-wrap mt-1">
                      <span className="px-4 py-1.5 bg-brand-primary text-white rounded-full text-sm font-black shadow-sm">
                        {item.price}
                      </span>
                      <span className="text-[10px] font-bold text-brand-primary/60 uppercase tracking-wider">
                        Delivery Included
                      </span>
                    </div>
                    <Link
                      to="/menu"
                      className="self-start mt-2 px-7 py-3 bg-brand-orange text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-opacity shadow-md"
                    >
                      See Full Menu
                    </Link>
                  </div>
                </div>

                {/* Bowl — left side, overlapping the lime card */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[50%] md:w-[42%] z-20 pointer-events-none">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full aspect-square object-cover rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Right arrow */}
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white border-2 border-brand-primary/20 text-brand-primary flex items-center justify-center hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {FAVS.map((_, i) => (
              <button
                key={i}
                onClick={() => setFav(i)}
                className={`rounded-full transition-all duration-300 ${i === fav ? 'w-6 h-2 bg-brand-primary' : 'w-2 h-2 bg-brand-primary/20'}`}
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
      <section className="bg-brand-orange py-20 md:py-28 px-6 md:px-16">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">

          <div className="flex flex-col gap-3 max-w-xl">
            <h2 className="text-4xl md:text-[3.2rem] font-black text-white leading-tight">
              Find the{' '}
              <em style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontWeight: 400 }}>
                real
              </em>{' '}
              lunch.
            </h2>
            <p className="text-white/65 text-sm leading-relaxed font-medium">
              Real lunch is made with fresh, high-quality produce, no antibiotics or hormones ever, no seed oils, and sauces made from scratch — no preservatives, just real ingredients.
            </p>
          </div>

          {/* table */}
          <div className="rounded-2xl overflow-x-auto shadow-2xl bg-white">
            <table className="w-full text-center border-collapse min-w-[520px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-4 md:p-5 text-left w-[36%]" />
                  {['Pricing', 'Food Quality', 'Convenience', 'No Hidden Fees'].map(col => (
                    <th key={col} className="p-4 md:p-5">
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-primary/35">{col}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-100 bg-[#F5F3FF]">
                  <td className="p-4 md:p-5 text-left text-[10px] md:text-xs font-black uppercase tracking-wider text-brand-primary">KNWN Real Food Lunch</td>
                  {[true, true, true, true].map((v, i) => (
                    <td key={i} className="p-4 md:p-5">
                      <Check size={17} strokeWidth={3} className="mx-auto text-brand-orange" />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-4 md:p-5 text-left text-[10px] md:text-xs font-black uppercase tracking-wider text-brand-primary/40">Meal Prep Service</td>
                  <td className="p-4 md:p-5"><Check size={17} strokeWidth={3} className="mx-auto text-brand-orange" /></td>
                  <td /><td /><td />
                </tr>
                <tr>
                  <td className="p-4 md:p-5 text-left text-[10px] md:text-xs font-black uppercase tracking-wider text-brand-primary/40">Restaurant & Delivery Apps</td>
                  <td /><td />
                  <td className="p-4 md:p-5"><Check size={17} strokeWidth={3} className="mx-auto text-brand-orange" /></td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ── 7 · OUR PHILOSOPHY ────────────────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-28 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT — founders photo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl overflow-hidden shadow-2xl shadow-brand-primary/10 h-[360px] md:h-[500px]"
          >
            <img
              src="/assets/about/founders.webp"
              alt="KNWN founders"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* RIGHT — text */}
          <div className="flex flex-col gap-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary/30">
              Our Philosophy
            </span>

            <h2 className="text-3xl md:text-[2.6rem] font-black text-brand-primary leading-snug">
              Busy people don't eat like shit by choice.{' '}
              <span className="text-brand-orange">They eat like shit by default.</span>
            </h2>

            <ul className="space-y-2 text-brand-primary/55 text-sm font-medium leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-brand-orange flex-shrink-0" />
                Restaurants are overpriced.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-brand-orange flex-shrink-0" />
                Delivery apps = a pile of fees.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-brand-orange flex-shrink-0" />
                Meal prep isn't fresh.
              </li>
            </ul>

            <p className="font-black text-brand-primary text-base leading-snug">
              One less daily decision.<br />Real food, handled.
            </p>

            <Link
              to="/about"
              className="self-start px-8 py-3 bg-brand-primary text-white rounded-full text-[11px] font-black uppercase tracking-[0.15em] hover:bg-brand-dark transition-colors shadow-lg shadow-brand-primary/20 mt-1"
            >
              About Us
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
