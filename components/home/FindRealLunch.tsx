import React from 'react';
import { useNavigate } from 'react-router-dom';

// ─── COPY — edit text here ────────────────────────────────────────────────────
const COPY = {
  heading: { prefix: 'Find the', accent: 'real', suffix: 'lunch.' },
  subtitle:
    'Real lunch is made with fresh, high-quality produce, no antibiotics or hormones ever, no seed oils, and sauces made from scratch, no preservatives, just real ingredients.',
  stickerImage: '/assets/stickers/try-now.webp',
} as const;

const COMPARISON_COLUMNS = [
  { label: 'Pricing', compact: 'Pricing' },
  { label: 'Food\nQuality', compact: 'Food Quality' },
  { label: 'Convenience', compact: 'Convenience' },
  { label: 'No Hidden Fees', compact: 'No Hidden Fees' },
];

const COMPARISON_ROWS = [
  { label: 'KNWN Real Food Lunch', highlighted: true, checks: [true, true, true, true] },
  { label: 'Meal Prep Service', highlighted: false, checks: [true, false, false, false] },
  { label: 'Restaurant & Delivery Apps', highlighted: false, checks: [false, false, true, false] },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function FindRealLunch() {
  const navigate = useNavigate();
  return (
    <section className="bg-[#F5F3FF] py-10 px-[5px] md:px-14">
      <div
        style={{ background: '#DB5A29', borderRadius: '8px', maxWidth: '1280px' }}
        className="mx-auto py-10 px-5 md:px-12"
      >
        <div className="mx-auto max-w-7xl">

          {/* Heading */}
          <div className="text-center">
            <h2
              className="font-bold text-white leading-none"
              style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(40px, 6vw, 64px)' }}
            >
              {COPY.heading.prefix}{' '}
              <span style={{ fontFamily: '"Nothing You Could Do", cursive', color: '#D4F53C' }}>
                {COPY.heading.accent}
              </span>
              {' '}{COPY.heading.suffix}
            </h2>
            <p
              className="mt-4 text-white mx-auto leading-relaxed"
              style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', maxWidth: '1000px' }}
            >
              {COPY.subtitle}
            </p>
          </div>

          {/* Table */}
          <div className="relative mx-auto mt-10 max-w-5xl lg:max-w-[1120px]">

            {/* Desktop */}
            <div className="hidden md:block">
              <div className="grid grid-cols-[1.9fr_repeat(4,minmax(0,1fr))]">
                <div />
                <div className="col-span-4 grid grid-cols-4 overflow-hidden rounded-[20px] shadow-[0_8px_20px_rgba(43,28,112,0.06)]">
                  {COMPARISON_COLUMNS.map((col, i) => (
                  <div
                    key={col.compact}
                    className="flex min-h-[76px] items-center justify-center px-4 text-center text-[17px] font-medium leading-[1.02] text-[#34206E] whitespace-pre-line"
                    style={{
                      background: '#D8D3EA',
                      borderLeft: i === 0 ? 'none' : '2px solid #D75E2B',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {col.label}
                  </div>
                ))}
                </div>
              </div>

              <div className="mt-[10px] space-y-[9px]">
                {COMPARISON_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[1.9fr_repeat(4,minmax(0,1fr))] overflow-hidden rounded-[22px] shadow-[0_12px_28px_rgba(95,41,14,0.08)]"
                    style={{ background: row.highlighted ? '#34206E' : '#FFFFFF' }}
                  >
                    <div
                      className="flex min-h-[88px] items-center px-8 text-left text-[21px] font-bold leading-none"
                      style={{ color: row.highlighted ? '#FFFFFF' : '#34206E', fontFamily: 'Poppins, sans-serif' }}
                    >
                      {row.label}
                    </div>
                    {row.checks.map((hasCheck, ci) => (
                      <div
                        key={`${row.label}-${COMPARISON_COLUMNS[ci].compact}`}
                        className="flex min-h-[88px] items-center justify-center"
                        style={{ borderLeft: '2px solid #D75E2B' }}
                      >
                        {hasCheck && (
                          <svg width="42" height="42" viewBox="0 0 24 24" fill="none"
                            stroke={row.highlighted ? '#FFFFFF' : '#D75E2B'}
                            strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile table (Compressed Box - Rounded) */}
            <div className="md:hidden mt-8 overflow-hidden bg-[#311c67]" style={{ borderRadius: '8px' }}>
              <div className="flex flex-col">
                {/* Header Row */}
                <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr] bg-[#311c67]">
                  <div className="flex items-center justify-center p-4 text-[13px] font-extrabold uppercase tracking-widest text-[#FFFFFF]">Feature</div>
                  <div className="flex items-center justify-center bg-white p-3">
                    <span className="font-extrabold text-[#311c67] text-[17px] tracking-tight">K<span className="text-[12px]">N</span>W<span className="text-[12px]">N</span></span>
                  </div>
                  <div className="flex items-center justify-center p-3 text-center text-white font-extrabold text-[9px] uppercase tracking-widest">Meal Prep</div>
                  <div className="flex items-center justify-center p-3 text-center text-white font-extrabold text-[9px] uppercase tracking-widest leading-tight">Delivery<br/>Apps</div>
                </div>

                {/* Feature Rows */}
                {COMPARISON_COLUMNS.map((col, rowIndex) => (
                  <div key={col.compact} className="grid grid-cols-[1.3fr_1fr_1fr_1fr]">
                    <div className="flex items-center justify-start bg-[#e8e8e8] px-4 py-4 text-[13px] font-extrabold text-[#311c67] border-t-2 border-white leading-tight">
                      {col.compact}
                    </div>
                    {/* KNWN Column (White Highlight - Continuous Vertical Strip) */}
                    <div className="flex items-center justify-center bg-white">
                      {COMPARISON_ROWS[0].checks[rowIndex] && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D75E2B" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    {/* Meal Prep */}
                    <div className="flex items-center justify-center bg-[#e8e8e8] border-l-2 border-t-2 border-white">
                      {COMPARISON_ROWS[1].checks[rowIndex] ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#311c67" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : <span className="text-[#311c67]/10 font-black text-[15px]">--</span>}
                    </div>
                    {/* Apps */}
                    <div className="flex items-center justify-center bg-[#e8e8e8] border-l-2 border-t-2 border-white">
                      {COMPARISON_ROWS[2].checks[rowIndex] ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#311c67" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : <span className="text-[#311c67]/10 font-black text-[15px]">--</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sticker (Desktop only) */}
            <button onClick={() => navigate('/order')} aria-label="Try now — go to order"
              className="absolute bottom-[1.15rem] right-[-2rem] hidden md:block cursor-pointer bg-transparent border-none p-0 transition-transform duration-200 hover:scale-105 z-10">
              <img src={COPY.stickerImage} alt="Try now"
                className="w-[220px] rotate-[-4deg] lg:w-[255px]" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
