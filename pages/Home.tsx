
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock, Truck, Star, StarHalf, Shield, Utensils, Leaf, Tag } from 'lucide-react';

const Home = () => {
    return (
        <div className="flex flex-col">

            {/* ─── HERO ─────────────────────────────────────────────── */}
            <section className="relative pt-12 pb-24 md:pt-20 md:pb-40 px-6 overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left — copy */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-start space-y-8 z-10"
                    >
                        <div className="inline-block px-4 py-1.5 border border-brand-primary/20 text-brand-primary rounded-full shadow-sm bg-white">
                            <span className="text-[10px] md:text-xs font-black tracking-widest uppercase">No Subscription Required</span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl font-serif text-brand-primary leading-[0.95]">
                                Made this morning.<br />
                                <span className="text-[#E6672E]">Delivered by lunch.</span>
                            </h1>
                            <p className="text-brand-primary/60 text-base md:text-lg max-w-md font-medium leading-relaxed">
                                Stop eating week-old meal prep. We cook fresh daily and deliver to your office or home instantly.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Link
                                to="/menu"
                                className="px-7 py-4 bg-brand-primary text-white rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-brand-primary/20"
                            >
                                <span className="uppercase tracking-[0.15em] text-xs font-black">View Today's Menu</span>
                            </Link>
                            <button className="px-7 py-4 bg-white text-brand-primary border border-brand-primary/20 rounded-xl hover:bg-brand-subtle/20 transition-all font-black uppercase tracking-[0.15em] text-xs">
                                How it Works
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-8 items-center pt-2">
                            <div className="flex items-center gap-2 text-brand-primary/50 font-bold uppercase tracking-widest text-[10px]">
                                <Clock size={14} strokeWidth={2.5} />
                                Order by 10:30 AM
                            </div>
                            <div className="flex items-center gap-2 text-brand-primary/50 font-bold uppercase tracking-widest text-[10px]">
                                <Truck size={14} strokeWidth={2.5} />
                                Free Local Delivery
                            </div>
                        </div>
                    </motion.div>

                    {/* Right — image collage */}
                    <div className="relative">
                        <div className="relative w-full aspect-square md:aspect-auto md:h-[580px] flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="relative w-full h-full"
                            >
                                {/* Main bowl */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] z-20">
                                    <img
                                        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800"
                                        alt="Fresh salad bowl"
                                        className="w-full h-auto rounded-full shadow-2xl border-8 border-white"
                                    />

                                    {/* "Real Ingredients" sticker */}
                                    <motion.div
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                        className="absolute -top-6 right-4 px-5 py-2 bg-[#BBF7D0] text-brand-primary rounded-full rotate-12 shadow-md z-30"
                                    >
                                        <span className="text-[11px] font-black italic whitespace-nowrap">Real Ingredients</span>
                                    </motion.div>

                                    {/* "made fresh this morning" banner */}
                                    <div className="absolute bottom-10 -left-6 px-6 py-2 bg-[#FDE68A] text-brand-primary rounded-full -rotate-6 shadow-md z-30">
                                        <span className="text-[10px] font-serif font-black italic whitespace-nowrap">made fresh this morning</span>
                                    </div>
                                </div>

                                {/* Small bowl — bottom left */}
                                <div className="absolute bottom-0 left-0 w-[42%] z-10 -rotate-12">
                                    <img
                                        src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=800"
                                        alt="Quinoa bowl"
                                        className="w-full h-auto rounded-full shadow-xl border-4 border-white"
                                    />
                                </div>

                                {/* Small bowl — top right */}
                                <div className="absolute top-0 right-0 w-[38%] z-0 rotate-6">
                                    <img
                                        src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800"
                                        alt="Veggie bowl"
                                        className="w-full h-auto rounded-full shadow-xl"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ─── HOW WE FIX THE LUNCH PROBLEM ────────────────────── */}
            <section className="py-24 md:py-32 px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/* Left — single large image */}
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=900"
                            alt="Fresh food spread"
                            className="w-full h-[500px] md:h-[620px] object-cover rounded-3xl shadow-xl"
                        />
                    </div>

                    {/* Right — steps */}
                    <div className="space-y-10">
                        <h2 className="text-4xl md:text-6xl font-serif text-brand-primary leading-tight">
                            How we fix the<br /><span className="italic">Lunch Problem</span>
                        </h2>

                        {/* Step 1 — active */}
                        <div className="space-y-4 pb-8 border-b border-brand-primary/10">
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand-primary text-white rounded-full shadow-md">
                                <span className="text-[11px] font-black uppercase tracking-wider">Step 1</span>
                                <span className="text-white/40 text-[11px]">→</span>
                                <span className="text-[11px] font-black uppercase tracking-wider">Pick Your Week's Lunch</span>
                            </div>
                            <p className="text-brand-primary/60 text-sm leading-relaxed max-w-sm pl-1">
                                Pick from two real food options daily and select your lunches for the week. Plan ahead and save more.
                            </p>
                            <Link
                                to="/menu"
                                className="inline-flex items-center gap-2 text-brand-primary font-black uppercase tracking-[0.2em] text-[10px] hover:gap-3 transition-all pl-1"
                            >
                                Explore Menu <ArrowRight size={13} />
                            </Link>
                        </div>

                        {/* Step 2 — inactive */}
                        <div className="pb-8 border-b border-brand-primary/10 opacity-40">
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand-subtle text-brand-primary rounded-full">
                                <span className="text-[11px] font-black uppercase tracking-wider">Step 2</span>
                                <span className="text-brand-primary/40 text-[11px]">→</span>
                                <span className="text-[11px] font-black uppercase tracking-wider">We Cook Your Week</span>
                            </div>
                        </div>

                        {/* Step 3 — inactive */}
                        <div className="opacity-40">
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-brand-subtle text-brand-primary rounded-full">
                                <span className="text-[11px] font-black uppercase tracking-wider">Step 3</span>
                                <span className="text-brand-primary/40 text-[11px]">→</span>
                                <span className="text-[11px] font-black uppercase tracking-wider">Delivered to Your Office</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ─── 4 PILLARS (dark purple) ──────────────────────────── */}
            <section className="py-20 px-6 bg-brand-primary text-white">
                <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-14">

                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                            <Shield className="text-[#BBF7D0]" size={26} />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.25em]">Decisions</h4>
                        <p className="text-white/55 text-xs leading-relaxed max-w-[170px]">No daily lunch chaos. Plan once and handle the week.</p>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                            <Utensils className="text-[#BFDBFE]" size={26} />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.25em]">Fresh Guarantee</h4>
                        <p className="text-white/55 text-xs leading-relaxed max-w-[170px]">Cooked from scratch every morning. Never frozen. Batch made.</p>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                            <Leaf className="text-[#FDE68A]" size={26} />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.25em]">Real Food</h4>
                        <p className="text-white/55 text-xs leading-relaxed max-w-[170px]">Made with real ingredients. No additives. No shortcuts.</p>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                            <Tag className="text-[#E9D5FF]" size={26} />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.25em]">Fair Price</h4>
                        <p className="text-white/55 text-xs leading-relaxed max-w-[170px]">Honest pricing. No delivery app fees. No overpriced salads.</p>
                    </div>

                </div>
            </section>

            {/* ─── OUR MENU SLIDER ──────────────────────────────────── */}
            <section className="py-24 md:py-32 px-4 md:px-8 bg-[#F5F3FF] overflow-hidden">
                <div className="max-w-7xl mx-auto space-y-10">

                    <div className="text-right pr-4">
                        <h2 className="text-5xl md:text-7xl font-serif italic text-brand-primary">Our Menu</h2>
                    </div>

                    <div className="flex items-center gap-3 md:gap-5">
                        {/* Prev arrow */}
                        <button className="flex-shrink-0 w-11 h-11 rounded-full border-2 border-brand-primary flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white transition-all text-lg font-bold">
                            ←
                        </button>

                        {/* Card */}
                        <div className="flex-1 overflow-hidden rounded-[2.5rem] bg-white flex flex-col md:flex-row border border-brand-primary/5 shadow-xl min-h-[420px]">

                            {/* Image — left */}
                            <div className="w-full md:w-1/2 bg-[#E9FF70] flex items-center justify-center p-8 md:p-14 h-[320px] md:h-auto relative overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&q=80&w=800"
                                    className="w-[90%] aspect-square rounded-full shadow-2xl object-cover z-10"
                                    alt="Crispy Korean Chicken"
                                />
                            </div>

                            {/* Info — right */}
                            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-5">
                                <h3 className="text-3xl md:text-5xl font-serif text-brand-primary leading-tight">Crispy Korean Chicken</h3>
                                <p className="text-brand-primary/60 text-sm leading-relaxed max-w-xs">
                                    Brown rice, crispy Korean chicken breast, glazed red cabbage, zucchini, carrot, red onion, gochujang sauce.
                                </p>

                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-serif font-black text-brand-primary">$12.90</span>
                                    <span className="px-3 py-1 bg-[#E9FF70] text-brand-primary text-[9px] font-black uppercase tracking-wider rounded-full">
                                        Delivery Included
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex text-[#E6672E] gap-0.5">
                                        <Star size={15} fill="#E6672E" />
                                        <Star size={15} fill="#E6672E" />
                                        <Star size={15} fill="#E6672E" />
                                        <Star size={15} fill="#E6672E" />
                                        <StarHalf size={15} fill="#E6672E" />
                                    </div>
                                    <span className="text-[9px] font-black tracking-widest text-brand-primary/40 uppercase">25 Reviews</span>
                                </div>
                            </div>

                        </div>

                        {/* Next arrow */}
                        <button className="flex-shrink-0 w-11 h-11 rounded-full border-2 border-brand-primary flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white transition-all text-lg font-bold">
                            →
                        </button>
                    </div>

                </div>
            </section>

            {/* ─── COMPARISON TABLE (orange) ────────────────────────── */}
            <section className="py-24 md:py-32 px-6 bg-[#E6672E] text-white overflow-hidden">
                <div className="max-w-5xl mx-auto">

                    <div className="flex flex-col items-center text-center space-y-4 mb-12">
                        <h2 className="text-5xl md:text-7xl font-serif leading-tight">
                            Find the <span className="italic">real</span> lunch.
                        </h2>
                    </div>

                    {/* 3 product images */}
                    <div className="flex flex-wrap justify-center gap-8 md:gap-14 py-8 mb-10">
                        <div className="w-28 h-28 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl">
                            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="KNWN bowl" />
                        </div>
                        <div className="w-28 h-28 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl opacity-75">
                            <img src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Meal prep" />
                        </div>
                        <div className="w-28 h-28 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl opacity-50">
                            <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Takeout" />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-[1.75rem] bg-white text-brand-primary shadow-2xl">
                        <table className="w-full text-center border-collapse">
                            <thead>
                                <tr className="border-b border-brand-primary/10">
                                    <th className="p-5 text-left w-[38%]"></th>
                                    <th className="p-5 bg-[#E6672E]/10">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary/50">Pricing</span>
                                    </th>
                                    <th className="p-5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary/50">Food Quality</span>
                                    </th>
                                    <th className="p-5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary/50">Convenience</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <tr className="border-b border-brand-primary/10 bg-[#F5F3FF]">
                                    <td className="p-5 text-left font-black uppercase tracking-widest text-[11px]">KNWN Real Food Lunch</td>
                                    <td className="p-5"><div className="flex justify-center text-[#E6672E]"><Check size={18} strokeWidth={3} /></div></td>
                                    <td className="p-5"><div className="flex justify-center text-[#E6672E]"><Check size={18} strokeWidth={3} /></div></td>
                                    <td className="p-5"><div className="flex justify-center text-[#E6672E]"><Check size={18} strokeWidth={3} /></div></td>
                                </tr>
                                <tr className="border-b border-brand-primary/10">
                                    <td className="p-5 text-left font-black tracking-widest text-[11px] opacity-45">Meal Prep Service</td>
                                    <td className="p-5"><div className="flex justify-center text-[#E6672E]"><Check size={18} strokeWidth={3} /></div></td>
                                    <td className="p-5"></td>
                                    <td className="p-5"></td>
                                </tr>
                                <tr>
                                    <td className="p-5 text-left font-black tracking-widest text-[11px] opacity-45">Restaurant &amp; Delivery Apps</td>
                                    <td className="p-5"></td>
                                    <td className="p-5"></td>
                                    <td className="p-5"><div className="flex justify-center text-[#E6672E]"><Check size={18} strokeWidth={3} /></div></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-center mt-10 text-white/65 text-xs font-medium max-w-2xl mx-auto leading-relaxed">
                        Conclusion: KNWN is the only option that is cooked fresh every morning with 100% real ingredients, zero additives, and delivered to your office. Ditch the processed meal prep and greasy takeout.
                    </p>

                </div>
            </section>

            {/* ─── PHILOSOPHY ───────────────────────────────────────── */}
            <section className="py-24 md:py-32 px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">

                    {/* Left — image */}
                    <div className="w-full lg:w-1/2">
                        <img
                            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=900"
                            alt="KNWN kitchen"
                            className="w-full h-[480px] md:h-[560px] object-cover rounded-3xl shadow-2xl"
                        />
                    </div>

                    {/* Right — text */}
                    <div className="w-full lg:w-1/2 space-y-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary/40 block">
                            Our Philosophy
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-brand-primary leading-snug">
                            Busy people don't eat like shit by choice.{' '}
                            <span className="text-[#E6672E]">They eat like shit by default.</span>
                        </h2>

                        <div className="space-y-5 text-brand-primary/65 font-medium leading-relaxed text-sm">
                            <p>
                                Most food systems aren't built for everyday eating.{' '}
                                <span className="font-black text-brand-primary">Restaurants are overpriced.</span>{' '}
                                Delivery apps normalize a pile of fees. Meal prep isn't fresh.
                            </p>
                            <p>
                                KNWN exists to replace that default.{' '}
                                <span className="font-black text-brand-primary">We cook real food every morning</span>{' '}
                                and deliver it straight to the workday.
                            </p>
                            <p className="font-bold text-brand-primary text-base leading-snug">
                                One less daily decision.<br />
                                Real food, handled.
                            </p>
                        </div>

                        <Link
                            to="/about"
                            className="inline-block px-10 py-4 bg-brand-primary text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-transform shadow-xl shadow-brand-primary/20"
                        >
                            Read Our Story
                        </Link>
                    </div>

                </div>
            </section>

            {/* ─── FINAL CTA (full-bleed photo) ─────────────────────── */}
            <section className="relative h-[580px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=2400"
                        className="w-full h-full object-cover scale-110"
                        alt="Food background"
                    />
                    <div className="absolute inset-0 bg-brand-primary/50 backdrop-blur-[2px]" />
                </div>

                <div className="relative z-10 text-center space-y-10 max-w-4xl px-6">
                    <h2 className="text-5xl md:text-8xl font-serif text-white leading-tight">
                        We create <span className="text-[#E6672E] italic">real food</span><br />
                        lunch experiences
                    </h2>
                    <Link
                        to="/menu"
                        className="inline-block px-12 py-5 bg-[#E6672E] text-white rounded-full font-black uppercase tracking-[0.2em] text-xs hover:scale-110 transition-transform shadow-2xl"
                    >
                        Order Now
                    </Link>
                </div>
            </section>

            {/* ─── FOLLOW US / INSTAGRAM GRID ───────────────────────── */}
            <section className="py-24 px-6 bg-[#F5F3FF]">
                <div className="max-w-7xl mx-auto space-y-12">
                    <h2 className="text-4xl md:text-6xl font-serif italic text-[#E6672E]">Follow Us</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                        <div className="aspect-square overflow-hidden rounded-3xl shadow-md">
                            <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="" />
                        </div>
                        <div className="aspect-square overflow-hidden rounded-3xl shadow-md translate-y-4">
                            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="" />
                        </div>
                        <div className="aspect-square overflow-hidden rounded-3xl shadow-md">
                            <img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="" />
                        </div>
                        <div className="aspect-square overflow-hidden rounded-3xl shadow-md translate-y-4">
                            <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="" />
                        </div>
                        <div className="aspect-square overflow-hidden rounded-3xl shadow-md -translate-y-4">
                            <img src="https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="" />
                        </div>
                        <div className="aspect-square overflow-hidden rounded-3xl shadow-md">
                            <img src="https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="" />
                        </div>
                        <div className="aspect-square overflow-hidden rounded-3xl shadow-md -translate-y-4">
                            <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="" />
                        </div>
                        <div className="aspect-square overflow-hidden rounded-3xl shadow-md">
                            <img src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="" />
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
