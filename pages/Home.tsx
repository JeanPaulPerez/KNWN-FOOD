
import React, { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
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
      className="p-10 bg-white border border-brand-primary/5 rounded-[2.5rem] space-y-6 hover:border-brand-primary/20 transition-all cursor-pointer group shadow-sm hover:shadow-2xl hover:shadow-brand-primary/5"
    >
      <div className="w-14 h-14 bg-brand-subtle rounded-full flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl font-serif text-brand-primary">{title}</h3>
        <p className="text-brand-primary/60 font-medium leading-relaxed text-sm">{description}</p>
      </div>
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

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="relative overflow-hidden bg-brand-subtle">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 md:px-12 pt-20 pb-32 text-center">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="z-10 max-w-5xl space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2 bg-white rounded-full text-brand-primary font-black tracking-[0.2em] uppercase text-[10px] shadow-sm border border-brand-primary/5"
          >
            <Clock size={14} strokeWidth={2.5} /> Ordering Open for {date}
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl md:text-[10rem] font-serif tracking-tighter leading-[0.85] text-brand-primary"
            >
              Dining, <br />Redefined for <span className="italic font-light text-brand-primary/60">Tomorrow</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-xl md:text-2xl text-brand-primary/50 font-medium max-w-2xl mx-auto leading-relaxed"
            >
              Chef-crafted meals, artisanal ingredients, and a one-minute checkout. Experience the peak of convenience and quality.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link
              to="/menu"
              className="px-12 py-6 bg-brand-primary text-white rounded-full flex items-center justify-center gap-4 group hover:scale-105 transition-all shadow-2xl shadow-brand-primary/40 active:scale-95"
            >
              <span className="uppercase tracking-[0.3em] text-[10px] font-black">Reserve Your Meal</span>
              <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
      </section>

      {/* How it Works */}
      <section className="py-40 px-6 md:px-12 bg-white rounded-[4rem] mx-4 md:mx-8 mb-8 shadow-2xl shadow-brand-primary/5 border border-brand-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
            <div className="space-y-12">
              <div className="space-y-6">
                <span className="text-brand-primary/40 uppercase tracking-[0.3em] text-[10px] font-black border-l-4 border-brand-primary pl-6 py-1">The Process</span>
                <h2 className="text-6xl md:text-8xl font-serif leading-[0.9] text-brand-primary tracking-tighter">Elevated Dining <br /><span className="italic font-light">Direct to You.</span></h2>
              </div>
              <p className="text-lg text-brand-primary/60 font-medium leading-relaxed max-w-md">
                We operate exclusively with a 10:00 AM ET cutoff. This allows our chefs to source exact quantities, reducing waste and ensuring peak freshness.
              </p>
              <Link to="/about" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black text-brand-primary border-b-2 border-brand-primary/20 pb-2 hover:border-brand-primary transition-all">
                Our Story <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-6 pt-12 md:pt-24">
                <FeatureItem
                  icon={Clock}
                  title="Daily Board"
                  description="Curated rotations opening daily at 10 AM."
                  delay={0.1}
                />
                <FeatureItem
                  icon={CheckCircle2}
                  title="Chef Made"
                  description="Crafted with morning-fresh ingredients."
                  delay={0.3}
                />
              </div>
              <div className="space-y-6">
                <FeatureItem
                  icon={MapPin}
                  title="Local Peak"
                  description="Optimized delivery for perfect temperature."
                  delay={0.2}
                />
                <div className="p-10 bg-brand-primary rounded-[2.5rem] flex flex-col justify-end min-h-[250px] text-white space-y-4">
                  <h4 className="text-3xl font-serif leading-tight">Join the <br />Ritual.</h4>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-60">15k+ Meals Served</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-40 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="space-y-6 text-left">
            <span className="text-brand-primary/40 uppercase tracking-[0.3em] text-[10px] font-black">Weekly Board</span>
            <h2 className="text-6xl font-serif text-brand-primary leading-tight">Featured for <br /><span className="italic font-light">{date}</span></h2>
          </div>
          <Link to="/menu" className="px-10 py-5 bg-white border border-brand-primary/10 rounded-full text-[10px] uppercase tracking-[0.3em] font-black text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-lg shadow-brand-primary/5">
            Full Experience
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {featuredItems.map((item, i) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -15 }}
              className="group relative bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-brand-primary/5 border border-brand-primary/5"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src={item.image}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.2] group-hover:grayscale-0"
                  loading="lazy"
                />
                <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-brand-primary text-xs font-black shadow-sm">
                  ${item.price}
                </div>
              </div>
              <div className="p-10 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-3xl font-serif text-brand-primary">{item.name}</h3>
                  <p className="text-sm text-brand-primary/50 font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
                <Link to="/menu" className="block w-full text-center py-4 bg-brand-subtle text-brand-primary rounded-2xl text-[10px] uppercase tracking-[0.3em] font-black hover:bg-brand-primary hover:text-white transition-all">
                  Select
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
