import React from 'react';

// ─── COPY — edit text here ────────────────────────────────────────────────────
const COPY = {
  heading: { prefix: 'Find the', accent: 'real', suffix: 'lunch.' },
  subtitle:
    'Real lunch is made with fresh, high-quality produce, no antibiotics or hormones ever, no seed oils, and sauces made from scratch, no preservatives, just real ingredients.',
  stickerImage: '/assets/stickers/try-now.png',
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
  return (
    <section style={{ background: '#f4f1ff' }} className="py-10 px-5 md:px-6">
      <div
        style={{ background: '#DB5A29', borderRadius: '24px', maxWidth: '1400px' }}
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

            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {COMPARISON_ROWS.map((row) => (
                <div
                  key={row.label}
                  className="overflow-hidden rounded-[24px] border-2 shadow-[0_10px_26px_rgba(69,27,10,0.12)]"
                  style={{ borderColor: '#D75E2B', background: row.highlighted ? '#34206E' : '#FFFFFF' }}
                >
                  <div
                    className="px-5 py-4 text-[18px] font-bold leading-tight"
                    style={{ color: row.highlighted ? '#FFFFFF' : '#34206E', fontFamily: 'Poppins, sans-serif' }}
                  >
                    {row.label}
                  </div>
                  <div className="grid grid-cols-2" style={{ borderTop: '2px solid #D75E2B' }}>
                    {COMPARISON_COLUMNS.map((col, i) => (
                      <div
                        key={`${row.label}-${col.compact}`}
                        className="flex min-h-[78px] flex-col items-center justify-center gap-2 px-3 py-3 text-center"
                        style={{
                          borderRight: i % 2 === 0 ? '2px solid #D75E2B' : 'none',
                          borderBottom: i < 2 ? '2px solid #D75E2B' : 'none',
                        }}
                      >
                        <span
                          className="text-[12px] font-semibold leading-tight"
                          style={{ color: row.highlighted ? 'rgba(255,255,255,0.78)' : '#5C4B92', fontFamily: 'Poppins, sans-serif' }}
                        >
                          {col.compact}
                        </span>
                        {row.checks[i] ? (
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                            stroke={row.highlighted ? '#FFFFFF' : '#D75E2B'}
                            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span
                            className="text-[11px] font-medium"
                            style={{ color: row.highlighted ? 'rgba(255,255,255,0.28)' : 'rgba(52,32,110,0.24)', fontFamily: 'Poppins, sans-serif' }}
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

            {/* Sticker */}
            <img src={COPY.stickerImage} alt="Try now"
              className="pointer-events-none absolute bottom-[1.15rem] right-[-2rem] hidden w-[220px] rotate-[-4deg] md:block lg:w-[255px]" />
            <img src={COPY.stickerImage} alt="Try now"
              className="mx-auto mt-4 w-[210px] rotate-[-4deg] md:hidden" />
          </div>

        </div>
      </div>
    </section>
  );
}
