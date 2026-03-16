
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react';

/* ─── menu slider data ────────────────────────────────────────────────────── */
const MENU_ITEMS = [
  {
    name: 'Korean Crispy Chicken',
    desc: 'Brown rice, crispy Korean chicken breast, glazed red cabbage, zucchini, carrot, red onion, gochujang sauce.',
    img: '/assets/food-bg/korean-crispy-chicken.jpg',
    cutout: '/assets/food-cutout/korean-crispy-chicken.png',
    tag: 'Customer Fav',
  },
  {
    name: 'Pesto Pasta',
    desc: 'Al dente rigatoni, house-made pesto, sun-dried tomatoes, fresh basil, pine nuts, aged parmesan.',
    img: '/assets/food-bg/pesto-pasta.jpg',
    cutout: '/assets/food-cutout/pesto-pasta.png',
    tag: 'Vegetarian',
  },
  {
    name: 'Chicken César Salad',
    desc: 'Grilled chicken breast, romaine hearts, shaved parmesan, house Caesar dressing, sourdough croutons.',
    img: '/assets/food-bg/chicken-cesar-salad.jpg',
    cutout: '/assets/food-cutout/chicken-cesar-salad.png',
    tag: 'High Protein',
  },
  {
    name: 'Thai Beef Salad',
    desc: 'Marinated beef, rice noodles, fresh herbs, cucumber, peanuts, lime-chili vinaigrette.',
    img: '/assets/food-bg/thai-beef-salad.jpg',
    cutout: '/assets/food-cutout/thai-beef-salad.png',
    tag: 'Spicy',
  },
  {
    name: 'Mediterranean Chicken',
    desc: 'Herb-roasted chicken thigh, quinoa, roasted peppers, kalamata olives, tzatziki, lemon.',
    img: '/assets/food-bg/mediterranean-chicken.jpg',
    cutout: '/assets/food-cutout/mediterranean-chicken.png',
    tag: 'Fan Pick',
  },
];

const STEPS = [
  { icon: '/assets/icons-steps/step-1.svg', label: 'Pick your meals', desc: 'Browse the weekly menu and choose what you want. No subscription required.' },
  { icon: '/assets/icons-steps/step-2.svg', label: 'We prep & cook', desc: 'Your order is cooked fresh every morning from scratch. Never frozen.' },
  { icon: '/assets/icons-steps/step-3.svg', label: 'Fast delivery', desc: 'Delivered straight to your office or door by lunchtime.' },
  { icon: '/assets/icons-steps/step-4.svg', label: 'Enjoy real food', desc: 'Sit down, dig in, and feel the difference real ingredients make.' },
];

const VALUES = [
  { icon: '/assets/icons-values/value-1.png', title: 'Zero Additives', desc: 'No preservatives, no shortcuts. Just food as it should be.' },
  { icon: '/assets/icons-values/value-2.png', title: 'Cooked Fresh Daily', desc: 'Every meal starts from scratch each morning.' },
  { icon: '/assets/icons-values/value-3.png', title: 'Fair Pricing', desc: 'No delivery app markup. What you pay goes to the food.' },
  { icon: '/assets/icons-values/value-4.png', title: 'Easy Weekday Lunch', desc: 'One less decision every day. Just order and eat.' },
];

/* ─── component ───────────────────────────────────────────────────────────── */
const Home = () => {
  const [slide, setSlide] = useState(0);
  const prev = () => setSlide(i => (i - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
  const next = () => setSlide(i => (i + 1) % MENU_ITEMS.length);
  const item = MENU_ITEMS[slide];

  return (
    <div className="flex flex-col bg-[#F5F3FF]">

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#F5F3FF] px-6 py-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-6 items-center">

          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-7 z-10"
          >
            {/* handwriting accent */}
            <span
              className="text-brand-orange text-xl md:text-2xl"
              style={{ fontFamily: '"Nothing You Could Do", cursive' }}
            >
              Real food. Real lunch.
            </span>

            <h1 className="text-5xl md:text-[5.5rem] font-extrabold text-brand-primary leading-[0.92] tracking-tight">
              Made this morning.{' '}
              <span className="text-brand-orange italic font-serif font-normal">Delivered by lunch.</span>
            </h1>

            <p className="text-brand-primary/60 text-base md:text-lg max-w-md leading-relaxed font-medium">
              Stop eating week-old meal prep. We cook fresh daily and deliver to your office or home. No subscription, no commitment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/menu"
                className="px-8 py-4 bg-brand-primary text-white rounded-full flex items-center justify-center gap-3 hover:bg-brand-dark transition-colors shadow-lg font-semibold text-sm"
              >
                Order This Week
                <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-white text-brand-primary border border-brand-primary/20 rounded-full hover:bg-brand-subtle/30 transition-all font-semibold text-sm text-center"
              >
                How It Works
              </a>
            </div>

            {/* social proof chips */}
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="px-4 py-2 bg-brand-lime text-brand-primary rounded-full text-xs font-bold">✓ No subscription</span>
              <span className="px-4 py-2 bg-white border border-brand-primary/15 text-brand-primary rounded-full text-xs font-bold">Order by 10:30 AM</span>
              <span className="px-4 py-2 bg-white border border-brand-primary/15 text-brand-primary rounded-full text-xs font-bold">Free delivery</span>
            </div>
          </motion.div>

          {/* Right — food collage with stickers */}
          <div className="relative flex items-center justify-center mt-8 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="relative w-full max-w-[520px] mx-auto"
            >
              {/* Main food hero image */}
              <div className="relative w-[82%] mx-auto">
                <img
                  src="/assets/food-cutout/korean-crispy-chicken.png"
                  alt="Korean Crispy Chicken"
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>

              {/* Sticker — "Real Ingredients." top-right */}
              <motion.img
                src="/assets/stickers/real-ingredients.png"
                alt="Real ingredients sticker"
                animate={{ rotate: [12, 16, 12] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                className="absolute -top-4 right-0 md:right-4 w-24 md:w-32 drop-shadow-xl z-20 rotate-12"
              />

              {/* Sticker — "Pay Less. Eat Better" bottom-left */}
              <motion.img
                src="/assets/stickers/pay-less-eat-better.png"
                alt="Pay less eat better sticker"
                animate={{ rotate: [-8, -4, -8] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                className="absolute bottom-4 -left-4 md:left-0 w-28 md:w-36 drop-shadow-xl z-20 -rotate-6"
              />

              {/* Small food cutouts floating around */}
              <div className="absolute bottom-[5%] right-0 w-[28%] drop-shadow-xl rotate-6 z-10">
                <img src="/assets/food-cutout/pesto-pasta.png" alt="Pesto pasta" className="w-full h-auto" />
              </div>
              <div className="absolute top-[10%] -left-4 w-[22%] drop-shadow-xl -rotate-6 z-10">
                <img src="/assets/food-cutout/chicken-cesar-salad.png" alt="Caesar salad" className="w-full h-auto" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 md:py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-4xl md:text-6xl font-extrabold text-brand-primary leading-tight">
              How it <span className="font-serif italic font-normal">works</span>
            </h2>
            <p className="text-brand-primary/50 text-sm max-w-xs leading-relaxed font-medium">
              Four simple steps stand between you and a great lunch every day.
            </p>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#F5F3FF] rounded-3xl p-8 flex flex-col gap-5 hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 flex items-center justify-center">
                  <img src={step.icon} alt={step.label} className="w-14 h-14 object-contain" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary/30 block mb-1">Step {i + 1}</span>
                  <h3 className="text-base font-bold text-brand-primary mb-2">{step.label}</h3>
                  <p className="text-brand-primary/55 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Full-width kitchen photo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="md:col-span-2 overflow-hidden rounded-3xl h-[280px] md:h-[420px]">
              <img src="/assets/how-it-works/photo-1.webp" alt="Fresh prep" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-3xl flex-1 h-[130px] md:h-auto">
                <img src="/assets/how-it-works/photo-2.webp" alt="Cooking" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="overflow-hidden rounded-3xl flex-1 h-[130px] md:h-auto">
                <img src="/assets/how-it-works/photo-3.webp" alt="Delivery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VALUES / PILLARS (dark bg) ────────────────────────────────────── */}
      <section className="py-20 px-6 bg-brand-primary text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-16 leading-tight">
            Why people choose{' '}
            <span className="font-serif italic font-normal text-brand-lime">KNWN</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-5"
              >
                <img src={v.icon} alt={v.title} className="w-20 h-20 object-contain drop-shadow-xl" />
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">{v.title}</h4>
                <p className="text-white/50 text-xs leading-relaxed max-w-[160px]">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CUSTOMER FAVS (menu slider) ───────────────────────────────────── */}
      <section className="py-24 md:py-32 px-4 md:px-8 bg-[#F5F3FF] overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">

          <div className="flex items-end justify-between px-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary/30 block mb-2">This Week</span>
              <h2 className="text-4xl md:text-6xl font-extrabold text-brand-primary leading-tight">
                Customer{' '}
                <span className="font-serif italic font-normal">Favorites</span>
              </h2>
            </div>
            <Link
              to="/menu"
              className="hidden md:flex items-center gap-2 text-brand-primary font-bold text-sm hover:gap-3 transition-all"
            >
              See full menu <ArrowRight size={16} />
            </Link>
          </div>

          {/* Slider */}
          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={prev}
              className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-brand-primary flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white transition-all z-20"
            >
              <ChevronLeft size={20} />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4 }}
                className="flex-1 overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-white flex flex-col md:flex-row border border-brand-primary/5 shadow-xl min-h-[400px] md:min-h-[480px]"
              >
                {/* Image panel */}
                <div className="w-full md:w-1/2 bg-[#E9FF70] flex items-center justify-center p-8 md:p-16 h-[280px] md:h-auto relative overflow-hidden">
                  <img
                    src={item.cutout}
                    className="w-[80%] h-auto object-contain drop-shadow-2xl z-10 relative"
                    alt={item.name}
                  />
                  {/* Try now sticker */}
                  <img
                    src="/assets/stickers/try-now.png"
                    alt="Try now"
                    className="absolute top-4 right-4 w-16 md:w-20 rotate-12 z-20 drop-shadow-md"
                  />
                </div>

                {/* Info panel */}
                <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center gap-5">
                  <span className="px-3 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-[10px] font-black uppercase tracking-wider self-start">
                    {item.tag}
                  </span>
                  <h3 className="text-2xl md:text-4xl font-extrabold text-brand-primary leading-tight">{item.name}</h3>
                  <p className="text-brand-primary/55 text-sm leading-relaxed max-w-xs">{item.desc}</p>

                  <div className="flex items-center gap-4 pt-2">
                    <Link
                      to="/menu"
                      className="px-6 py-3 bg-brand-lime text-brand-primary rounded-full font-bold text-sm hover:opacity-90 transition-opacity shadow-md"
                    >
                      Add to My Week
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={next}
              className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-brand-primary flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white transition-all z-20"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 pt-2">
            {MENU_ITEMS.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === slide ? 'bg-brand-primary w-6' : 'bg-brand-primary/20'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ──────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 bg-brand-orange overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center gap-4 mb-12">
            <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em]">The Honest Answer</span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
              Find the <span className="font-serif italic font-normal">real</span> lunch.
            </h2>
            <p className="text-white/65 text-sm max-w-sm leading-relaxed">
              We're not the cheapest option. We're the only option that is fresh, real, and affordable every day.
            </p>
          </div>

          {/* Use real tabla.png asset */}
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-white">
            <img
              src="/assets/tabla/tabla.png"
              alt="Comparison table: KNWN vs meal prep vs restaurants"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* ─── PHILOSOPHY ────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">

          {/* Left — real kitchen photo */}
          <div className="w-full lg:w-1/2 relative">
            <img
              src="/assets/how-it-works/our-philosophy.webp"
              alt="Our kitchen philosophy"
              className="w-full h-[440px] md:h-[580px] object-cover rounded-3xl shadow-2xl"
            />
            {/* Floating sticker */}
            <motion.img
              src="/assets/stickers/real-ingredients.png"
              alt="Real ingredients"
              animate={{ rotate: [8, 14, 8] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="absolute -bottom-6 -right-4 md:bottom-6 md:right-6 w-28 md:w-36 drop-shadow-xl z-10"
            />
          </div>

          {/* Right — text */}
          <div className="w-full lg:w-1/2 space-y-7">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary/30 block">
              Our Philosophy
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-brand-primary leading-snug">
              Busy people don't eat like shit by choice.{' '}
              <span className="text-brand-orange italic font-serif font-normal">They eat like shit by default.</span>
            </h2>

            <div className="space-y-4 text-brand-primary/60 leading-relaxed text-sm font-medium">
              <p>
                Most food systems aren't built for everyday eating.{' '}
                <span className="font-bold text-brand-primary">Restaurants are overpriced.</span>{' '}
                Delivery apps normalize a pile of fees. Meal prep isn't fresh.
              </p>
              <p>
                KNWN exists to replace that default.{' '}
                <span className="font-bold text-brand-primary">We cook real food every morning</span>{' '}
                and deliver it straight to the workday.
              </p>
              <p className="text-brand-primary font-bold text-base">
                One less daily decision.<br />
                Real food, handled.
              </p>
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-full font-semibold text-sm hover:bg-brand-dark transition-colors shadow-xl shadow-brand-primary/20"
            >
              Our Story <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="relative h-[560px] md:h-[640px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/how-it-works/we-create.webp"
            className="w-full h-full object-cover"
            alt="We create real food"
          />
          <div className="absolute inset-0 bg-brand-primary/55" />
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-4xl px-6">
          <span
            className="text-brand-lime text-2xl md:text-3xl block"
            style={{ fontFamily: '"Nothing You Could Do", cursive' }}
          >
            what are we doing for lunch?
          </span>
          <h2 className="text-4xl md:text-7xl font-extrabold text-white leading-tight">
            We create{' '}
            <span className="font-serif italic font-normal text-brand-lime">real food</span>
            <br />
            lunch experiences
          </h2>
          <Link
            to="/menu"
            className="inline-block px-12 py-5 bg-brand-lime text-brand-primary rounded-full font-black uppercase tracking-[0.15em] text-xs hover:scale-105 transition-transform shadow-2xl shadow-brand-lime/30"
          >
            Order This Week
          </Link>
        </div>
      </section>

      {/* ─── FOOD GRID (real photos) ────────────────────────────────────────── */}
      <section className="py-20 md:py-24 px-6 bg-[#F5F3FF]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl md:text-5xl font-extrabold text-brand-primary">
              This week's{' '}
              <span className="font-serif italic font-normal text-brand-orange">menu</span>
            </h2>
            <Link to="/menu" className="hidden md:flex items-center gap-2 text-sm font-bold text-brand-primary hover:gap-3 transition-all">
              Full menu <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { src: '/assets/food-bg/korean-crispy-chicken.jpg', name: 'Korean Crispy Chicken' },
              { src: '/assets/food-bg/pesto-pasta.jpg', name: 'Pesto Pasta' },
              { src: '/assets/food-bg/chicken-cesar-salad.jpg', name: 'Chicken César Salad' },
              { src: '/assets/food-bg/thai-beef-salad.jpg', name: 'Thai Beef Salad' },
              { src: '/assets/food-bg/mediterranean-chicken.jpg', name: 'Mediterranean Chicken' },
              { src: '/assets/food-bg/harissa-meatballs.jpg', name: 'Harissa Meatballs' },
              { src: '/assets/food-bg/milanesa.jpg', name: 'Milanesa' },
              { src: '/assets/food-bg/chicken-lime.jpg', name: 'Chicken Lime' },
            ].map((dish, i) => (
              <Link
                key={dish.name}
                to="/menu"
                className={`group overflow-hidden rounded-2xl md:rounded-3xl shadow-md relative ${i % 3 === 1 ? 'translate-y-2 md:translate-y-4' : ''}`}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={dish.src}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-xs font-bold">{dish.name}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Link
              to="/menu"
              className="px-8 py-4 bg-brand-primary text-white rounded-full font-semibold text-sm hover:bg-brand-dark transition-colors"
            >
              See Full Menu & Order
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
