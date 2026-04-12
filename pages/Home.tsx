import React from 'react';
import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import IconBar from '../components/home/IconBar';
import CustomerFavs from '../components/home/CustomerFavs';
import ZipCode from '../components/ZipCode';
import FindRealLunch from '../components/home/FindRealLunch';
import OurPhilosophy from '../components/home/OurPhilosophy';
import WeCreateRealFood from '../components/home/WeCreateRealFood';

/* ══════════════════════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div className="flex flex-col">

      {/* ── 1 · HERO ─────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── 2 · ICON BAR ──────────────────────────────────────────────────────── */}
      <IconBar />

      {/* ── 3 · HOW IT WORKS ──────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── 4 · CUSTOMER FAVS ─────────────────────────────────────────────────── */}
      <CustomerFavs />

      {/* ── 4b · ZIP CODE CHECK ───────────────────────────────────────────────── */}
      <ZipCode />

      {/* ── 5 · FIND THE REAL LUNCH ───────────────────────────────────────────── */}
      <FindRealLunch />

      {/* ── 6 · OUR PHILOSOPHY ────────────────────────────────────────────────── */}
      <OurPhilosophy />

      {/* ── 7 · WE CREATE REAL FOOD ───────────────────────────────────────────── */}
      <WeCreateRealFood />

      {/* ── 8 · FOLLOW US @KNWNFOOD ───────────────────────────────────────────── */}

    </div>
  );
}
