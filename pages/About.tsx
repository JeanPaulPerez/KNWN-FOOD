
import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="bg-brand-subtle min-h-screen">
      <section className="pt-32 md:pt-64 pb-16 md:pb-32 px-4 md:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl space-y-8 md:space-y-16"
        >
          <span className="text-brand-primary/40 uppercase tracking-[0.4em] text-[9px] md:text-[10px] font-black border-l-2 border-brand-primary pl-4 md:pl-6 py-1">The Narrative</span>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-serif leading-[1] md:leading-[0.8] tracking-tighter text-brand-primary">
            Architecting <br /><span className="italic font-light text-brand-primary/60">Modern Dining.</span>
          </h1>
          <p className="text-lg md:text-2xl lg:text-4xl text-brand-primary/50 font-medium leading-relaxed max-w-3xl italic">
            KNWN Food was born from a simple realization: high-end restaurant quality should be accessible without the friction of traditional dining.
          </p>
        </motion.div>
      </section>

      <section className="py-24 md:py-48 px-4 md:px-12 bg-white rounded-3xl md:rounded-[4rem] mx-4 md:mx-8 mb-8 shadow-2xl shadow-brand-primary/5 border border-brand-primary/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          <div className="space-y-8 md:space-y-16 order-2 lg:order-1">
            <h2 className="text-5xl md:text-7xl font-serif text-brand-primary leading-[0.9] tracking-tighter">The Culinary <br /><span className="italic font-light">Ecosystem.</span></h2>
            <div className="space-y-6 md:space-y-8 text-brand-primary/60 font-medium leading-relaxed text-base md:text-lg">
              <p>
                Contrary to standard logistics, we prioritize the integrity of the ingredient. By operating a digital-first kitchen, we redirect our focus into sourcing exceptional products and giving our team the space to innovate.
              </p>
              <p className="italic">
                Our model is a commitment to precision. By identifying demand in advance, we eliminate the structural waste inherent in traditional hospitality.
              </p>
            </div>
          </div>
          <div className="rounded-[2.5rem] md:rounded-[4rem] overflow-hidden aspect-square sm:aspect-[4/5] shadow-[0_40px_100px_rgba(43,28,112,0.1)] relative group order-1 lg:order-2">
            <div className="absolute inset-0 bg-brand-primary/10 group-hover:opacity-0 transition-opacity duration-1000 z-10" />
            <img
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000"
              className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
              alt="Culinary precision"
            />
          </div>
        </div>
      </section>

      <section className="py-24 md:py-48 px-4 md:px-12 max-w-7xl mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-16 md:space-y-24">
          <div className="space-y-6 md:space-y-8">
            <h2 className="text-5xl md:text-7xl font-serif text-brand-primary leading-tight md:leading-none tracking-tighter italic">Reimagining <br /><span className="not-italic">Expectations.</span></h2>
            <p className="text-lg md:text-xl text-brand-primary/40 font-medium leading-relaxed max-w-2xl mx-auto">
              Planning for tomorrow is a conscious choice. It's a commitment to efficiency, quality, and your own well-being.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 pt-6 md:pt-10">
            <div className="space-y-4 md:space-y-6 p-8 md:p-12 bg-white rounded-3xl md:rounded-[3rem] border border-brand-primary/5 shadow-2xl shadow-brand-primary/5">
              <p className="text-4xl md:text-6xl font-serif text-brand-primary tracking-tighter">0%</p>
              <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-brand-primary/30">Single Use Goal</p>
            </div>
            <div className="space-y-4 md:space-y-6 p-8 md:p-12 bg-brand-primary rounded-3xl md:rounded-[3rem] text-white shadow-2xl shadow-brand-primary/20 sm:scale-110 z-10 transition-transform">
              <p className="text-4xl md:text-6xl font-serif tracking-tighter">100%</p>
              <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black opacity-40">Artisanal Sourcing</p>
            </div>
            <div className="space-y-4 md:space-y-6 p-8 md:p-12 bg-white rounded-3xl md:rounded-[3rem] border border-brand-primary/5 shadow-2xl shadow-brand-primary/5">
              <p className="text-4xl md:text-6xl font-serif text-brand-primary tracking-tighter">35k+</p>
              <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-brand-primary/30">Curated Orders</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
