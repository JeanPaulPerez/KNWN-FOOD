
import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="bg-brand-cream min-h-screen">
      <section className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl space-y-12"
        >
          <span className="text-brand-accent uppercase tracking-widest text-xs font-bold">Our Story</span>
          <h1 className="text-6xl md:text-8xl font-serif leading-[0.95] tracking-tight">
            Intentional food for <span className="italic font-light">busy lives.</span>
          </h1>
          <p className="text-2xl text-brand-muted font-light leading-relaxed">
            KNWN Food was born from a simple realization: high-end restaurant quality shouldn't require a high-end restaurant reservation.
          </p>
        </motion.div>
      </section>

      <section className="py-24 px-6 md:px-12 bg-white border-y border-brand-clay">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="space-y-8">
            <h2 className="text-4xl font-serif">The Chef-First Philosophy</h2>
            <p className="text-brand-muted font-light leading-relaxed">
              Unlike traditional restaurants that prioritize floor space and table turnover, we prioritize the kitchen. By operating as a ghost kitchen, we redirect our resources into sourcing the finest ingredients and giving our chefs the time they need to prepare every dish with meticulous care.
            </p>
            <p className="text-brand-muted font-light leading-relaxed">
              Our "Tomorrow Only" model is a commitment to sustainability. By knowing exactly what we need to prepare 24 hours in advance, we eliminate nearly all food waste—a stark contrast to the industry average.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden aspect-square">
            <img 
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000" 
              className="w-full h-full object-cover" 
              alt="Chef at work"
            />
          </div>
        </div>
      </section>

      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <div className="max-w-2xl mx-auto space-y-10">
          <h2 className="text-5xl font-serif">A New Kind of Ritual</h2>
          <p className="text-xl text-brand-muted font-light leading-relaxed">
            Ordering for tomorrow is a small act of self-care. It's a commitment to your future self that you'll be well-fed, energized, and inspired.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 pt-10">
            <div className="space-y-2">
              <p className="text-4xl font-serif text-brand-accent">0%</p>
              <p className="text-[10px] uppercase tracking-widest font-bold">Plastic Waste Goal</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-serif text-brand-accent">100%</p>
              <p className="text-[10px] uppercase tracking-widest font-bold">Sustainably Sourced</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-serif text-brand-accent">15k+</p>
              <p className="text-[10px] uppercase tracking-widest font-bold">Meals Served</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
