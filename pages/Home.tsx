
import React, { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';
import { getActiveOrderInfo } from '../utils/dateLogic';
import { getMenuForDate } from '../data/menuTemplates';

const FeatureItem = ({ icon: Icon, title, description, delay }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      className="p-8 bg-brand-clay/10 border border-brand-clay/30 rounded-2xl space-y-4"
    >
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-accent shadow-sm">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-serif">{title}</h3>
      <p className="text-brand-muted font-light leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default function Home() {
  const { date, raw } = getActiveOrderInfo();
  const activeMenu = useMemo(() => getMenuForDate(raw), [raw]);
  
  const featuredItems = useMemo(() => {
    if (!activeMenu) return [];
    const allItems = activeMenu.categories.flatMap(c => c.items);
    return allItems.slice(0, 3);
  }, [activeMenu]);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[90vh] flex items-center px-6 md:px-12 bg-brand-cream overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="z-10 max-w-4xl space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-brand-accent font-medium tracking-[0.2em] uppercase text-xs"
          >
            <Clock size={16} /> Active Window: {date}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-8xl font-serif tracking-tight leading-[0.95]"
          >
            Dining, redefined for <span className="italic font-light">tomorrow</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-brand-muted font-light max-w-2xl leading-relaxed"
          >
            Chef-crafted meals, artisanal ingredients, and a one-minute checkout. The ghost kitchen that prioritizes quality over everything.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link 
              to="/menu"
              className="px-8 py-5 bg-brand-charcoal text-white rounded-full flex items-center justify-center gap-3 group hover:bg-brand-charcoal/90 transition-all shadow-lg"
            >
              <span className="uppercase tracking-[0.2em] text-xs font-bold">Explore the Board</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Background Image */}
        <div className="absolute top-0 right-0 w-full h-full md:w-1/2 overflow-hidden -z-0 opacity-20 md:opacity-100">
           <motion.img 
             style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }}
             src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1200" 
             className="w-full h-full object-cover grayscale-[0.3]" 
           />
           <div className="absolute inset-0 bg-gradient-to-l from-transparent via-brand-cream/50 to-brand-cream" />
        </div>
      </section>

      {/* How it Works - Sticky Section */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="lg:sticky lg:top-32 space-y-8">
            <span className="text-brand-accent uppercase tracking-widest text-xs font-bold">Process</span>
            <h2 className="text-5xl font-serif leading-tight">Elevated dining from our kitchen to your table.</h2>
            <p className="text-lg text-brand-muted font-light leading-relaxed max-w-md">
              We operate exclusively with a 10:00 AM ET cutoff. This allows our chefs to source exact quantities, reducing waste and ensuring peak freshness.
            </p>
          </div>
          <div className="space-y-6">
            <FeatureItem 
              icon={Clock}
              title="View Weekly Board"
              description="Browse the full week's curated rotation. We open ordering daily with a 10:00 AM cutoff for next-available service."
              delay={0.1}
            />
            <FeatureItem 
              icon={CheckCircle2}
              title="Chef-Prepared"
              description="Every dish is prepared from scratch by our culinary team using ingredients delivered that very morning."
              delay={0.2}
            />
            <FeatureItem 
              icon={MapPin}
              title="Swift Delivery"
              description="Choose pickup or delivery. Our logistics team ensures your meal arrives at the perfect temperature."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Weekly Highlights Preview */}
      <section className="py-24 bg-brand-clay/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <span className="text-brand-accent uppercase tracking-widest text-xs font-bold">Board Preview</span>
              <h2 className="text-4xl font-serif">Featured Flavors: {date}</h2>
            </div>
            <Link to="/menu" className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold border-b border-brand-charcoal pb-1 hover:text-brand-accent hover:border-brand-accent transition-colors">
              Full Weekly Board <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredItems.map((item, i) => (
              <motion.div 
                key={item.id}
                whileHover={{ y: -10 }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-sm"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img 
                    src={item.image} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    loading="lazy"
                  />
                </div>
                <div className="p-8 space-y-2">
                  <h3 className="text-xl font-serif">{item.name}</h3>
                  <p className="text-sm text-brand-muted font-light line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-brand-clay/30">
                    <span className="text-lg font-serif">${item.price}</span>
                    <Link to="/menu" className="text-xs uppercase tracking-widest font-bold group-hover:text-brand-accent">Add to Order</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
