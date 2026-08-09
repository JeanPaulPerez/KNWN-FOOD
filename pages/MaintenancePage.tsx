import React from 'react';
import { motion } from 'framer-motion';

export default function MaintenancePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-[#F4F1FF] text-center">

      {/* Logo */}
      <motion.img
        src="/assets/logo.webp"
        alt="KNWN"
        className="w-32 md:w-44 brightness-0 mb-10 opacity-90"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 0.9, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />

      {/* Heading */}
      <motion.h1
        className="font-serif text-[40px] md:text-[56px] leading-[1.1] text-brand-primary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
      >
        Coming Soon
      </motion.h1>
    </div>
  );
}
