import React from 'react';
import { Link } from 'react-router-dom';
import ZipCode from '../components/ZipCode';


export default function About() {
  return (
    <div className="bg-[#F5F3FF] min-h-screen overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════ */}
      <section className="px-4 md:px-6 pt-2">
        <div className="max-w-[1400px] mx-auto">
          <img
            src="/assets/about/About_Hero.png"
            alt="KNWN is a weekly lunch system delivering freshly cooked meals made with real ingredients every day"
            className="w-full rounded-2xl md:rounded-3xl"
          />
        </div>
      </section>

      {/* Orange ribbon — full width, flush below hero */}
      <div className="bg-brand-orange py-4 md:py-5">
        <div
          className="flex flex-wrap justify-center items-center gap-3 md:gap-10 text-white font-black uppercase tracking-widest px-4"
          style={{ fontSize: 'clamp(12px, 1.05vw, 14px)' }}
        >
          <span>Fewer decisions</span>
          <span className="hidden md:inline opacity-50">•</span>
          <span>Real food</span>
          <span className="hidden md:inline opacity-50">•</span>
          <span>Fair Pricing</span>
          <span className="hidden md:inline opacity-50">•</span>
          <span>One weekly plan</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — HOW WE FIX THE LUNCH PROBLEM
      ══════════════════════════════════════════════════════ */}
      <section className="bg-[#F5F3FF] py-8 md:py-12">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-stretch">

            {/* ── Left: tall photo ──────────────────────────────── */}
            <div className="shrink-0 w-full md:w-[44%]">
              <img
                src="/assets/about/DSC01466.webp"
                alt="Person opening a KNWN lunch box at their desk"
                className="w-full object-cover rounded-3xl shadow-md"
                style={{ height: '100%', minHeight: '360px', maxHeight: '650px' }}
              />
            </div>

            {/* ── Right: heading + cards + quote + CTA ─────────── */}
            <div className="flex flex-col justify-center gap-5 flex-1">

              {/* Heading */}
              <h2
                className="w-full max-w-[620px] self-center font-serif text-brand-primary leading-tight text-center"
                style={{ fontSize: 'clamp(35px, 3.4vw, 70px)' }}
              >
                How we fix the<br />
                <span className="tracking-[0.16em]">Lunch Problem</span>
              </h2>

              {/* 3 feature cards */}
              <div className="flex flex-col gap-2.5">
                {[
                  {
                    n: '1',
                    title: 'We remove the daily decision.',
                    body: 'Instead of asking what to eat every single day, you plan once for the week.',
                  },
                  {
                    n: '2',
                    title: 'Real fresh food every day.',
                    body: 'We cook real food from scratch every morning and deliver it to your office by lunch.',
                  },
                  {
                    n: '3',
                    title: 'No inflated pricing.',
                    body: 'No app fees. No overpriced salads. Just real food at a real price.',
                  },
                ].map(({ n, title, body }) => (
                  <div key={n} className="relative overflow-hidden bg-brand-primary rounded-2xl px-6 pt-5 pb-10 text-center">
                    <p className="text-white font-black leading-snug" style={{ fontSize: 'clamp(15px, 1.15vw, 17px)' }}>
                      {title}
                    </p>
                    <p className="text-white/65 font-medium mt-1.5 leading-relaxed" style={{ fontSize: 'clamp(13px, 0.95vw, 15px)' }}>
                      {body}
                    </p>
                    <span
                      className="absolute bottom-[-8px] left-5 z-10 text-white font-black leading-none select-none"
                      style={{ fontSize: 'clamp(38px, 3.5vw, 54px)' }}
                    >
                      {n}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quote */}
              <p
                className="font-serif italic text-brand-primary leading-tight text-center md:text-left"
                style={{ fontSize: 'clamp(18px, 2vw, 30px)' }}
              >
                Just fewer decisions, better ingredients, and a system built for real workdays.
              </p>

              {/* CTA */}
              <div className="flex justify-center md:justify-start">
                <Link
                  to="/menu"
                  className="inline-block bg-brand-orange text-white font-black uppercase tracking-widest rounded-full"
                  style={{
                    fontSize: 'clamp(12px, 0.85vw, 14px)',
                    padding: 'clamp(12px, 1vw, 15px) clamp(28px, 2.2vw, 40px)',
                  }}
                >
                  Ready to try it?
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — WE'RE DANIEL AND CHRISTIAN
      ══════════════════════════════════════════════════════ */}
      <section className="bg-[#F5F3FF] pt-0 pb-8 md:pb-12">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">

          {/* ── Row: photo + intro text ──────────────────────────── */}
          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-14 mb-8 md:mb-12">

            {/* Founders photo — blob behind */}
            <div className="shrink-0 relative w-full max-w-[200px] md:max-w-[260px] mx-auto md:mx-0">
              {/* Peach gradient blob */}
              <img
                src="/assets/about/clip-path-group.jpg"
                alt=""
                aria-hidden="true"
                className="absolute pointer-events-none select-none"
                style={{
                  width: '170%',
                  top: '-25%',
                  left: '-35%',
                  opacity: 1,
                  mixBlendMode: 'multiply',
                }}
              />
              <img
                src="/assets/about/Daniel y Choco.webp"
                alt="Daniel and Christian, founders of KNWN"
                className="relative w-full aspect-square object-cover rounded-3xl shadow-md"
              />
            </div>

            {/* Text block */}
            <div className="flex flex-col gap-4 text-center md:text-left pt-0 md:pt-2">
              <h2
                className="font-serif italic text-brand-orange leading-tight"
                style={{ fontSize: 'clamp(30px, 4vw, 60px)' }}
              >
                We're Daniel and Christian.
              </h2>
              <p
                className="text-brand-orange font-medium leading-relaxed"
                style={{ fontSize: 'clamp(15px, 1.15vw, 17px)' }}
              >
                Two friends. 9 to 5. Office every day.<br />
                And every day, the same question:
              </p>
              {/* "What are we doing for lunch?" — sticker PNG */}
              <div className="flex justify-center md:justify-start">
                <img
                  src="/assets/about/WHAT ARE WE DOING FOR LUNCH.png"
                  alt="What are we doing for lunch?"
                  className="w-full max-w-[380px] md:max-w-[460px] object-contain drop-shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* ── Three problem cards — irregular layout ───────────── */}
          {/*
            EDIT GUIDE (pages/About.tsx):
            Each card has its own transform:
              Card 1 (salad)  → rotate(-2deg)  translateY(18px)   — lower-left
              Card 2 (fees)   → rotate(1deg)                       — center, straight
              Card 3 (prep)   → rotate(2.5deg) translateY(-22px)  — upper-right
            Change these values to adjust positioning manually.
          */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-16 md:mb-20" style={{ overflow: 'visible' }}>

            {/* Card 1 — Sad salad */}
            <div
              className="flex flex-col gap-2.5"
              style={{ transform: 'rotate(-2deg) translateY(18px)', transformOrigin: 'center bottom' }}
            >
              <span
                className="self-start inline-block bg-brand-primary text-white font-black uppercase tracking-widest rounded-full px-4 py-[6px]"
                style={{ fontSize: 'clamp(10px, 0.7vw, 11.5px)' }}
              >
                Another $22 sad salad?
              </span>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
                <img src="/assets/about/Untitled design.png" alt="Another $22 sad salad" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Card 2 — Delivery fees */}
            <div
              className="flex flex-col gap-2.5"
              style={{ transform: 'rotate(1deg)', transformOrigin: 'center bottom' }}
            >
              <span
                className="self-start inline-block bg-brand-primary text-white font-black uppercase tracking-widest rounded-full px-4 py-[6px]"
                style={{ fontSize: 'clamp(10px, 0.7vw, 11.5px)' }}
              >
                Another pile of delivery fees?
              </span>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-md bg-white flex items-center justify-center p-5">
                <img src="/assets/about/Fee's.png" alt="Another pile of delivery fees" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Card 3 — Meal prep */}
            <div
              className="flex flex-col gap-2.5"
              style={{ transform: 'rotate(2.5deg) translateY(-22px)', transformOrigin: 'center bottom' }}
            >
              <span
                className="self-start inline-block bg-brand-primary text-white font-black uppercase tracking-widest rounded-full px-4 py-[6px]"
                style={{ fontSize: 'clamp(10px, 0.7vw, 11.5px)' }}
              >
                Another fake fresh meal prep?
              </span>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-md">
                <img src="/assets/about/Meal Prep.png" alt="Another fake fresh meal prep" className="w-full h-full object-cover" />
              </div>
            </div>

          </div>

          {/* ── Quote ────────────────────────────────────────────── */}
          <div className="text-center max-w-[720px] mx-auto space-y-3">
            <h3
              className="font-serif italic text-brand-primary leading-tight"
              style={{ fontSize: 'clamp(22px, 2.8vw, 44px)' }}
            >
              Honestly? Some days it felt easier to skip lunch than to decide what to eat.
            </h3>
            <p
              className="text-brand-primary/50 font-semibold uppercase tracking-widest"
              style={{ fontSize: 'clamp(11px, 0.8vw, 13px)' }}
            >
              Overpriced lunches &nbsp;·&nbsp; Stacked fees &nbsp;·&nbsp; Daily overthinking.
            </p>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — KITCHEN HERO
      ══════════════════════════════════════════════════════ */}
      <section className="bg-[#F5F3FF] px-4 md:px-6 pb-10 pt-2">
        <div className="max-w-[1200px] mx-auto">
          <div
            className="relative w-full overflow-hidden rounded-3xl"
            style={{ minHeight: 'clamp(280px, 40vw, 520px)' }}
          >
            {/* Background photo */}
            <img
              src="/assets/about/kitchen-1.webp"
              alt="KNWN kitchen"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/55" />

            {/* Text */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 py-14 md:py-20 gap-3 md:gap-5">
              <p
                className="font-serif italic text-white/85 tracking-[0.15em]"
                style={{ fontSize: 'clamp(15px, 1.8vw, 26px)' }}
              >
                It was a broken system...
              </p>
              <h2
                className="text-white font-black leading-tight"
                style={{ fontSize: 'clamp(26px, 5vw, 72px)', maxWidth: '860px' }}
              >
                So we stopped chasing better options and built a better default.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — ZIP CODE BANNER
      ══════════════════════════════════════════════════════ */}
      <ZipCode />

    </div>
  );
}
