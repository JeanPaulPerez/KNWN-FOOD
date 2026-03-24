import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import IconBar from '../components/IconBar';
import CustomerFavs from '../components/CustomerFavs';
import WeCreateRealFood from '../components/WeCreateRealFood';
import FollowUs from '../components/FollowUs';

/* ══════════════════════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const comparisonColumns = [
    { label: 'Pricing', compact: 'Pricing' },
    { label: 'Food\nQuality', compact: 'Food Quality' },
    { label: 'Convenience', compact: 'Convenience' },
    { label: 'No Hidden Fees', compact: 'No Hidden Fees' },
  ];
  const comparisonRows = [
    {
      label: 'KNWN Real Food Lunch',
      highlighted: true,
      checks: [true, true, true, true],
    },
    {
      label: 'Meal Prep Service',
      highlighted: false,
      checks: [true, false, false, false],
    },
    {
      label: 'Restaurant & Delivery Apps',
      highlighted: false,
      checks: [false, false, true, false],
    },
  ];

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

      {/* ── 5 · FIND THE REAL LUNCH ───────────────────────────────────────────── */}
      <section style={{ background: '#DB5A29' }} className="py-16 px-5 md:px-12">
        <div className="mx-auto max-w-7xl">
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

          <div className="relative mx-auto mt-10 max-w-5xl lg:max-w-[1120px]">
            <div className="hidden md:block">
              <div className="ml-[34.5%] grid grid-cols-4 overflow-hidden rounded-[20px] shadow-[0_8px_20px_rgba(43,28,112,0.06)]">
                {comparisonColumns.map((column, index) => (
                  <div
                    key={column.compact}
                    className="flex min-h-[76px] items-center justify-center px-4 text-center text-[17px] font-medium leading-[1.02] text-[#34206E] whitespace-pre-line"
                    style={{
                      background: '#D8D3EA',
                      borderLeft: index === 0 ? 'none' : '2px solid #D75E2B',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {column.label}
                  </div>
                ))}
              </div>

              <div className="mt-[10px] space-y-[9px]">
                {comparisonRows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[1.9fr_repeat(4,minmax(0,1fr))] overflow-hidden rounded-[22px] shadow-[0_12px_28px_rgba(95,41,14,0.08)]"
                    style={{
                      background: row.highlighted ? '#34206E' : '#FFFFFF',
                    }}
                  >
                    <div
                      className="flex min-h-[88px] items-center px-8 text-left text-[21px] font-bold leading-none"
                      style={{
                        color: row.highlighted ? '#FFFFFF' : '#34206E',
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      {row.label}
                    </div>
                    {row.checks.map((hasCheck, columnIndex) => (
                      <div
                        key={`${row.label}-${comparisonColumns[columnIndex].compact}`}
                        className="flex min-h-[88px] items-center justify-center"
                        style={{
                          borderLeft: '2px solid #D75E2B',
                        }}
                      >
                        {hasCheck && (
                          <svg
                            width="42"
                            height="42"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={row.highlighted ? '#FFFFFF' : '#D75E2B'}
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {comparisonRows.map((row) => (
                <div
                  key={row.label}
                  className="overflow-hidden rounded-[24px] border-2 shadow-[0_10px_26px_rgba(69,27,10,0.12)]"
                  style={{
                    borderColor: '#D75E2B',
                    background: row.highlighted ? '#34206E' : '#FFFFFF',
                  }}
                >
                  <div
                    className="px-5 py-4 text-[18px] font-bold leading-tight"
                    style={{
                      color: row.highlighted ? '#FFFFFF' : '#34206E',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {row.label}
                  </div>
                  <div className="grid grid-cols-2" style={{ borderTop: '2px solid #D75E2B' }}>
                    {comparisonColumns.map((column, index) => (
                      <div
                        key={`${row.label}-${column.compact}`}
                        className="flex min-h-[78px] flex-col items-center justify-center gap-2 px-3 py-3 text-center"
                        style={{
                          borderRight: index % 2 === 0 ? '2px solid #D75E2B' : 'none',
                          borderBottom: index < 2 ? '2px solid #D75E2B' : 'none',
                        }}
                      >
                        <span
                          className="text-[12px] font-semibold leading-tight"
                          style={{
                            color: row.highlighted ? 'rgba(255,255,255,0.78)' : '#5C4B92',
                            fontFamily: 'Poppins, sans-serif',
                          }}
                        >
                          {column.compact}
                        </span>
                        {row.checks[index] ? (
                          <svg
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={row.highlighted ? '#FFFFFF' : '#D75E2B'}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span
                            className="text-[11px] font-medium"
                            style={{
                              color: row.highlighted ? 'rgba(255,255,255,0.28)' : 'rgba(52,32,110,0.24)',
                              fontFamily: 'Poppins, sans-serif',
                            }}
                          >
                            --
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <img
              src="/assets/stickers/try-now.png"
              alt="Try now"
              className="pointer-events-none absolute bottom-[1.15rem] right-[-2rem] hidden w-[220px] rotate-[-4deg] md:block lg:w-[255px]"
            />

            <img
              src="/assets/stickers/try-now.png"
              alt="Try now"
              className="mx-auto mt-4 w-[210px] rotate-[-4deg] md:hidden"
            />
          </div>
        </div>
      </section>

      {/* ── 6 · OUR PHILOSOPHY ────────────────────────────────────────────────── */}
      <section className="bg-[#F5F3FF] py-12 md:py-16 px-5 md:px-10 lg:px-16">
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
          <div className="flex flex-col justify-center gap-4 md:gap-5 rounded-[2rem] bg-white px-6 py-8 shadow-[0_14px_40px_rgba(43,28,112,0.06)] md:px-8 md:py-10">
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

      {/* ── 7 · WE CREATE REAL FOOD ───────────────────────────────────────────── */}
      <WeCreateRealFood />

      {/* ── 8 · FOLLOW US @KNWNFOOD ───────────────────────────────────────────── */}
      <FollowUs />

    </div>
  );
}
