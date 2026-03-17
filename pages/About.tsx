import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="bg-[#F5F3FF] min-h-screen font-sans overflow-x-hidden pt-12">

      {/* ─── HERO & FOUNDERS INTRO ──────────────────────────────────────────── */}
      {/* Dark background top section */}
      <section className="bg-brand-primary py-20 px-6 md:px-12 relative overflow-hidden flex flex-col items-center">
        {/* Background Plates */}
        <div className="absolute inset-0 max-w-[1200px] mx-auto pointer-events-none">
          {/* Orbiting plates with badges */}
          <div className="absolute top-10 left-[15%] w-32 md:w-40 aspect-square rounded-full bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
            <img src="/assets/food-bg/thai-beef-salad.jpg" alt="" className="w-full h-full object-cover rounded-full" />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase text-white tracking-widest bg-black/30 backdrop-blur-[1px]">Wednesday</span>
          </div>
          <div className="absolute top-[-20px] left-[35%] w-40 md:w-56 aspect-square rounded-full border-4 border-brand-primary overflow-hidden shadow-2xl z-10">
            <img src="/assets/food-bg/carne-asada.webp" alt="" className="w-full h-full object-cover rounded-full" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-orange text-white px-3 py-1 rounded-sm text-[12px] font-black uppercase tracking-widest rotate-[-10deg]">Tuesday</span>
          </div>
          <div className="absolute top-[20px] right-[20%] w-36 md:w-48 aspect-square rounded-full border border-white/10 overflow-hidden shadow-2xl">
            <img src="/assets/food-bg/harissa-meatballs.jpg" alt="" className="w-full h-full object-cover rounded-full" />
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black uppercase text-white tracking-widest bg-black/20 backdrop-blur-[1px] rotate-[15deg]">Monday</span>
          </div>
          <div className="absolute bottom-10 left-[5%] w-32 md:w-44 aspect-square rounded-full border border-white/10 overflow-hidden shadow-2xl opacity-80">
            <img src="/assets/food-bg/milanesa.jpg" alt="" className="w-full h-full object-cover rounded-full" />
            <span className="absolute inset-x-0 bottom-4 text-center text-[10px] font-black uppercase text-white tracking-widest">Thursday</span>
          </div>
          <div className="absolute bottom-[0] right-[10%] w-48 md:w-64 aspect-square rounded-full border-4 border-brand-primary overflow-hidden shadow-2xl z-10">
            <img src="/assets/food-bg/mediterranean-chicken.jpg" alt="" className="w-full h-full object-cover rounded-full" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary/80 backdrop-blur-sm text-brand-lime border border-brand-lime px-3 py-1 text-[12px] font-black uppercase tracking-widest rotate-[5deg]">Thursday</span>
          </div>
        </div>

        {/* Text */}
        <div className="relative z-20 text-center mt-32 md:mt-48 mb-20">
          <h1 className="text-white text-5xl md:text-7xl font-sans font-black tracking-tight leading-none mb-3">
            We Rebuilt the<br />
            <span className="font-handwriting text-white text-[1.4em] font-normal tracking-normal -mt-4 block" style={{ transform: 'rotate(-3deg)' }}>Work Lunch System.</span>
          </h1>
          <img src="/assets/stickers/blank-sticker.png" className="absolute -left-12 bottom-0 w-24 opacity-10 mix-blend-screen" alt="" aria-hidden />
        </div>
      </section>

      {/* Under Hero: White/Light section */}
      <section className="bg-white py-20 px-6 relative z-30 -mt-10 rounded-t-[3rem] shadow-[0_0_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* Photo */}
          <div className="relative w-full max-w-[320px] md:max-w-[400px] shrink-0">
            <div className="bg-[#EEECE6] p-4 pb-12 rounded-sm shadow-xl transform -rotate-3 transition-transform hover:rotate-0 duration-500">
              <img src="/assets/about/founders.webp" alt="Daniel and Choco" className="w-full aspect-square object-cover sepia-[0.3] contrast-125" />
              <div className="absolute top-6 right-6 text-white/80 font-mono text-xs drop-shadow-md">09.23.2011</div>
            </div>
          </div>

          {/* Intro Text */}
          <div className="text-center md:text-left space-y-6">
            <h2 className="text-5xl md:text-[4rem] font-serif text-[#CF5C36] leading-[0.9]">
              We're Daniel and Choco.
            </h2>
            <p className="text-brand-orange font-medium text-xl md:text-2xl leading-snug">
              Two friends. 9 to 5. Office every day.<br />
              And every day, the same question:
            </p>
            <div className="inline-block relative">
              <img src="/assets/stickers/blank.png" className="absolute inset-0 w-full h-[140%] -top-[20%] object-fill opacity-90" style={{ filter: 'hue-rotate(-20deg) brightness(0.9) saturate(1.5)' }} alt="" />
              <h3 className="relative z-10 text-white font-handwriting text-3xl md:text-4xl px-8 py-3 rotate-[-2deg]">
                What are we doing for lunch?
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE PROBLEM ────────────────────────────────────────────────────── */}
      <section className="bg-white pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* 3 Images row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-20 mt-10">
            {/* Salad */}
            <div className="flex flex-col items-center">
              <div className="bg-brand-primary text-white font-sans font-bold text-sm px-6 py-2 rounded-full mb-4 shadow-lg transform -rotate-3 border-2 border-brand-primary/20">
                Another $22 sad salad?
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl aspect-square w-full max-w-[280px]">
                <img src="/assets/food-bg/pesto-pasta.jpg" alt="Sad salad" className="w-full h-full object-cover scale-110 sepia-[0.2]" />
              </div>
            </div>

            {/* Fees */}
            <div className="flex flex-col items-center md:-translate-y-8">
              <div className="bg-brand-primary text-white font-sans font-bold text-sm px-6 py-2 rounded-full mb-4 shadow-lg transform rotate-2 border-2 border-brand-primary/20">
                Another pile of delivery fees?
              </div>
              <div className="bg-brand-subtle/20 p-6 rounded-2xl shadow-xl font-mono text-xs text-brand-primary w-full max-w-[280px] border tracking-tight leading-relaxed">
                <div className="flex justify-between mb-2"><span className="font-bold">Subtotal</span><span>$47.25</span></div>
                <div className="flex justify-between text-brand-primary/50"><span className="flex items-center gap-1">Retail Delivery Fees ⓘ</span><span>$0.27</span></div>
                <div className="flex justify-between text-brand-primary/50"><span>Delivery Fee</span><span>$4.99</span></div>
                <div className="flex justify-between text-brand-primary/50"><span className="flex items-center gap-1">Service Fee ⓘ</span><span>$8.98</span></div>
                <div className="flex justify-between mb-2"><span>Estimated Tax</span><span>$4.01</span></div>
                <div className="flex justify-between text-[#2D9455] font-bold mb-2"><span>Credits Applied</span><span>-$0.66</span></div>
                <div className="flex justify-between mb-4"><span>Dasher Tip</span><span>$9.87</span></div>
                <div className="flex justify-between font-black text-[14px]"><span>Total</span><span>$74.71</span></div>
              </div>
            </div>

            {/* Meal prep */}
            <div className="flex flex-col items-center">
              <div className="bg-brand-primary text-white font-sans font-bold text-sm px-6 py-2 rounded-full mb-4 shadow-lg transform -rotate-2 border-2 border-brand-primary/20">
                Another fake fresh meal prep?
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl aspect-square w-full max-w-[280px]">
                <img src="/assets/food-bg/harissa-meatballs.jpg" alt="Meal prep containers" className="w-full h-full object-cover scale-110 saturate-50" />
              </div>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-6xl font-serif text-brand-primary leading-tight">
              Honestly? Some days it felt easier to skip lunch than to decide what to eat.
            </h2>
            <p className="text-brand-primary/60 font-sans text-xl font-medium tracking-tight">
              Overpriced lunches. Stacked fees. Daily overthinking.
            </p>
          </div>
        </div>
      </section>

      {/* ─── THE SOLUTION / BROKEN SYSTEM ───────────────────────────────────── */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-6xl mx-auto relative rounded-[3rem] overflow-hidden shadow-2xl group cursor-default">
          <img src="/assets/how-it-works/photo-3.webp" alt="Kitchen staff" className="w-full h-[500px] md:h-[650px] object-cover group-hover:scale-105 transition-transform duration-[2s]" />
          <div className="absolute inset-0 bg-black/60" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
            <p className="text-white/80 font-handwriting text-3xl md:text-5xl -mb-4 rotate-[-3deg]">
              It was a broken system...
            </p>
            <h2 className="text-white font-sans font-black text-4xl md:text-[5rem] leading-[0.9] tracking-tight">
              So we stopped chasing better options and built a better default.
            </h2>
          </div>
        </div>

        {/* Orange Ribbon */}
        <div className="bg-brand-orange py-4 md:py-6 mt-1 rounded-2xl mx-auto max-w-6xl flex justify-center shadow-lg transform -translate-y-6 relative border-4 border-white">
          <ul className="flex flex-wrap justify-center items-center gap-4 md:gap-12 text-white font-black uppercase text-[10px] md:text-sm tracking-widest px-4 text-center">
            <li>Fewer decisions</li>
            <li className="hidden md:block">•</li>
            <li>Real food</li>
            <li className="hidden md:block">•</li>
            <li>Fair Pricing</li>
            <li className="hidden md:block">•</li>
            <li>One weekly plan</li>
          </ul>
        </div>
      </section>

      {/* ─── HOW WE FIX IT ──────────────────────────────────────────────────── */}
      <section className="bg-brand-primary py-24 px-6 md:px-16 rounded-t-[4rem]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Photo / Info box */}
          <div className="relative">
            <div className="rounded-[2rem] border-4 border-[#30266B] overflow-hidden bg-white/5 h-[450px] md:h-[600px] shadow-2xl relative">
              <img src="/assets/we-create.webp" alt="Lunch box open on desk" className="w-full h-full object-cover" />
              
              {/* Note sticker overlay */}
              <div className="absolute bottom-16 left-8 bg-[#FDFBF2] text-brand-primary font-handwriting text-xl md:text-2xl p-6 rounded-sm shadow-xl transform -rotate-6 max-w-[200px]">
                What's in here contains zero bs! Enjoy!
              </div>
            </div>
          </div>

          {/* Right: Steps */}
          <div className="space-y-12">
            <div>
              <h2 className="text-4xl md:text-[3.5rem] text-white font-serif leading-[1.1] mb-2">How we fix the</h2>
              <h2 className="text-5xl md:text-[4.5rem] text-white font-handwriting ml-12 rotate-[-2deg]">Lunch Problem</h2>
            </div>

            <div className="space-y-6 relative">
              {/* Line connector */}
              <div className="absolute left-6 top-8 bottom-8 w-1 bg-white/10 rounded-full hidden md:block" />

              <div className="bg-white rounded-[2rem] p-6 md:p-8 flex items-start gap-6 shadow-xl relative transform -rotate-1 hover:rotate-0 transition-transform cursor-default">
                <span className="text-brand-primary font-black text-5xl opacity-20 absolute top-4 left-6">1</span>
                <div className="relative z-10 pt-10">
                  <h3 className="text-brand-primary font-black text-xl md:text-2xl leading-tight mb-2 tracking-tight">We remove the daily decision.</h3>
                  <p className="text-brand-primary/60 font-medium text-sm leading-relaxed">
                    Instead of asking what to eat every single day, you plan once for the week.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 md:p-8 flex items-start gap-6 shadow-xl relative transform rotate-1 hover:rotate-0 transition-transform cursor-default">
                <span className="text-brand-primary font-black text-5xl opacity-20 absolute top-4 left-6">2</span>
                <div className="relative z-10 pt-10">
                  <h3 className="text-brand-primary font-black text-xl md:text-2xl leading-tight mb-2 tracking-tight">Real fresh food every day.</h3>
                  <p className="text-brand-primary/60 font-medium text-sm leading-relaxed">
                    We cook real food from scratch every morning and deliver it to your office by lunch.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 md:p-8 flex items-start gap-6 shadow-xl relative transform -rotate-1 hover:rotate-0 transition-transform cursor-default border-2 border-brand-orange/30">
                <span className="text-brand-primary font-black text-5xl opacity-20 absolute top-4 left-6">3</span>
                <div className="relative z-10 pt-10">
                  <h3 className="text-brand-primary font-black text-xl md:text-2xl leading-tight mb-2 tracking-tight">No inflated pricing.</h3>
                  <p className="text-brand-primary/60 font-medium text-sm leading-relaxed">
                    No app fees. No overpriced salads. Just real food at a real price.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center pt-8">
              <p className="text-white/80 font-serif text-2xl md:text-[2rem] leading-[1.2] max-w-lg mx-auto mb-8">
                Just fewer decisions, better ingredients, and a system built for real workdays.
              </p>
              
              <Link to="/menu" className="inline-block relative">
                <span className="bg-brand-orange text-white px-10 py-5 rounded-full font-black text-sm md:text-base uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(232,79,43,0.4)] hover:brightness-110 transition-all border border-brand-orange">
                  READY TO TRY IT?
                </span>
                {/* Custom cursor over button effect to match design! */}
                <div className="absolute -bottom-8 -right-4 w-6 h-6 z-20 pointer-events-none">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.5 2V21.5L9 17.5L13.5 24L16 22.5L11.5 16H18.5L5.5 2Z" fill="white" stroke="black" strokeWidth="1.5" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
