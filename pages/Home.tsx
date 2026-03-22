import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import IconBar from '../components/IconBar';
import CustomerFavs from '../components/CustomerFavs';
import ZipCode from '../components/ZipCode';
import WeCreateRealFood from '../components/WeCreateRealFood';
import FollowUs from '../components/FollowUs';

/* ══════════════════════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function Home() {

  return (
    <div className="flex flex-col">

      {/* ── 1 · HERO ─────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── 2 · HOW IT WORKS ──────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── 3 · ICON BAR ──────────────────────────────────────────────────────── */}
      <IconBar />

      {/* ── 4 · CUSTOMER FAVS ─────────────────────────────────────────────────── */}
      <CustomerFavs />

      {/* ── 5 · ZIP CODE BANNER ───────────────────────────────────────────────── */}
      <ZipCode />

      {/* ── 6 · FIND THE REAL LUNCH ───────────────────────────────────────────── */}
      <section style={{ background: '#DB5A29' }} className="py-16 px-5 md:px-12">

        <div className="text-center">
          <h2
            className="font-bold text-white leading-none"
            style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(40px, 6vw, 64px)' }}
          >
            Find the{' '}
            <span style={{ fontFamily: '"Nothing You Could Do", cursive', color: '#D4F53C' }}>
              real
            </span>
            {' '}lunch.
          </h2>

          <p
            className="mt-4 text-white mx-auto leading-relaxed"
            style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', maxWidth: '680px' }}
          >
            Real lunch is made with fresh, high-quality produce, no antibiotics or hormones ever, no seed oils,
            and sauces made from scratch, no preservatives, just real ingredients.
          </p>
        </div>

        <div className="relative mx-auto mt-10" style={{ maxWidth: '900px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '35% repeat(4, 16.25%)' }}>
            <div />
            {['Pricing', 'Food\nQuality', 'Convenience', 'No Hidden Fees'].map((col, i) => (
              <div
                key={col}
                style={{
                  background: '#D2CFEA',
                  padding: '12px 8px',
                  textAlign: 'center',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#291A5A',
                  whiteSpace: 'pre-line',
                  borderRight: i < 3 ? '2px solid #C64D29' : 'none',
                  borderRadius: i === 0 ? '10px 0 0 0' : i === 3 ? '0 10px 0 0' : 0,
                }}
              >
                {col}
              </div>
            ))}
          </div>

          <div style={{ height: '5px' }} />

          <div style={{ borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.20)' }}>
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
              <colgroup>
                <col style={{ width: '35%' }} />
                <col style={{ width: '16.25%' }} />
                <col style={{ width: '16.25%' }} />
                <col style={{ width: '16.25%' }} />
                <col style={{ width: '16.25%' }} />
              </colgroup>
              <tbody>
                <tr style={{ background: '#291A5A' }}>
                  <td
                    className="py-5 px-6 text-left font-bold text-white"
                    style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px' }}
                  >
                    KNWN Real Food Lunch
                  </td>
                  {[0, 1, 2, 3].map(i => (
                    <td key={i} style={{ padding: '20px 12px', textAlign: 'center' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </td>
                  ))}
                </tr>

                <tr style={{ background: 'white', borderTop: '2px solid #C64D29' }}>
                  <td
                    className="py-5 px-6 text-left font-bold"
                    style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#291A5A', borderRight: '2px solid #C64D29' }}
                  >
                    Meal Prep Service
                  </td>
                  <td style={{ padding: '20px 12px', textAlign: 'center', borderRight: '2px solid #C64D29' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C64D29" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </td>
                  <td style={{ borderRight: '2px solid #C64D29' }} />
                  <td style={{ borderRight: '2px solid #C64D29' }} />
                  <td />
                </tr>

                <tr style={{ background: 'white', borderTop: '2px solid #C64D29' }}>
                  <td
                    className="py-5 px-6 text-left font-bold"
                    style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#291A5A', borderRight: '2px solid #C64D29' }}
                  >
                    Restaurant &amp; Delivery Apps
                  </td>
                  <td style={{ borderRight: '2px solid #C64D29' }} />
                  <td style={{ borderRight: '2px solid #C64D29' }} />
                  <td style={{ padding: '20px 12px', textAlign: 'center', borderRight: '2px solid #C64D29' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C64D29" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          <button
            style={{
              position: 'absolute',
              bottom: '-18px',
              right: '-8px',
              background: '#DDEB00',
              color: '#291A5A',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '22px',
              fontWeight: 900,
              fontStyle: 'italic',
              padding: '10px 28px',
              borderRadius: 0,
              transform: 'rotate(-3deg)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            TRY NOW
          </button>
        </div>
      </section>

      {/* ── 7 · OUR PHILOSOPHY ────────────────────────────────────────────────── */}
      <section className="bg-white py-12 md:py-16 px-5 md:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-stretch">

          {/* LEFT — ourphilosophy.webp */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden h-[240px] md:h-[340px] lg:h-auto lg:min-h-[420px]"
          >
            <img
              src="/assets/hero-bg/ourphilosophy.webp"
              alt="Our philosophy"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* RIGHT — text */}
          <div className="flex flex-col justify-center gap-4 md:gap-5">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
              Our Philosophy
            </span>

            <h2 className="text-2xl md:text-3xl font-bold text-[#2D1B69] leading-snug">
              Busy people don't eat like shit by choice.
              <br />
              <span className="text-[#FF5C00]">They eat like shit by default.</span>
            </h2>

            <ul className="space-y-2 text-sm text-[#2D1B69] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#FF5C00] font-bold mt-0.5">•</span>
                Restaurants are overpriced.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5C00] font-bold mt-0.5">•</span>
                Delivery apps = a pile of fees.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5C00] font-bold mt-0.5">•</span>
                Meal prep isn't fresh.
              </li>
            </ul>

            <p className="font-bold text-[#2D1B69] text-base leading-snug">
              One less daily decision. Real food, handled.
            </p>

            <Link
              to="/about"
              className="self-start px-8 py-3 min-h-[44px] flex items-center bg-[#2D1B69] text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity mt-1"
            >
              ABOUT US
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8 · WE CREATE REAL FOOD ───────────────────────────────────────────── */}
      <WeCreateRealFood />

      {/* ── 9 · FOLLOW US @KNWNFOOD ───────────────────────────────────────────── */}
      <FollowUs />

    </div>
  );
}
