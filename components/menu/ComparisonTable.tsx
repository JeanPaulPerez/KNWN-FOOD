import React from 'react';
import { Link } from 'react-router-dom';
import s from './ComparisonTable.module.css';

// ─── COPY — edit text & table data here ───────────────────────────────────────
const COPY = {
  heading:      { prefix: 'Find the', accent: 'real', suffix: 'lunch.' },
  subtitle:     'Real lunch is made with fresh, high-quality produce, no antibiotics or hormones ever, no seed oils, and sauces made from scratch, no preservatives, just real ingredients.',
  stickerImage: '/assets/stickers/try-now.png',
} as const;

const COMPARISON_COLUMNS = [
  { label: 'Pricing',        compact: 'Pricing' },
  { label: 'Food\nQuality',  compact: 'Food Quality' },
  { label: 'Convenience',    compact: 'Convenience' },
  { label: 'No Hidden Fees', compact: 'No Hidden Fees' },
];

const COMPARISON_ROWS = [
  { label: 'KNWN Real Food Lunch',       highlighted: true,  checks: [true,  true,  true,  true]  },
  { label: 'Meal Prep Service',          highlighted: false, checks: [true,  false, false, false] },
  { label: 'Restaurant & Delivery Apps', highlighted: false, checks: [false, false, true,  false] },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function ComparisonTable() {
  return (
    <section className={s.section}>
      <div className={s.inner}>

      {/* Heading */}
      <h2 className={s.heading}>
        {COPY.heading.prefix}{' '}
        <span className={s.headingAccent}>{COPY.heading.accent}</span>
        {' '}{COPY.heading.suffix}
      </h2>
      <p className={s.subtitle}>{COPY.subtitle}</p>

      <div className={s.tableWrap}>

        {/* Desktop table */}
        <div className={s.desktopTable}>
          <div className={s.headerRowContainer}>
            <div />
            <div className={s.headerRow}>
              {COMPARISON_COLUMNS.map((col) => (
                <div key={col.compact} className={s.headerCell}>{col.label}</div>
              ))}
            </div>
          </div>

          <div className={s.bodyRows}>
            {COMPARISON_ROWS.map((row) => (
              <div
                key={row.label}
                className={s.tableRow}
                style={{ background: row.highlighted ? '#34206E' : '#FFFFFF' }}
              >
                <div
                  className={s.rowLabel}
                  style={{ color: row.highlighted ? '#FFFFFF' : '#34206E' }}
                >
                  {row.label}
                </div>
                {row.checks.map((hasCheck, ci) => (
                  <div key={`${row.label}-${ci}`} className={s.checkCell}>
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

        {/* Mobile table */}
        <div className={s.mobileTable}>
          {COMPARISON_ROWS.map((row) => (
            <div
              key={row.label}
              className={s.mobileRow}
              style={{ background: row.highlighted ? '#34206E' : '#FFFFFF' }}
            >
              <div
                className={s.mobileRowLabel}
                style={{ color: row.highlighted ? '#FFFFFF' : '#34206E' }}
              >
                {row.label}
              </div>
              <div className={s.mobileGrid}>
                {COMPARISON_COLUMNS.map((col, i) => (
                  <div
                    key={`${row.label}-${col.compact}`}
                    className={s.mobileCell}
                    style={{
                      borderRight:  i % 2 === 0 ? '2px solid #D75E2B' : 'none',
                      borderBottom: i < 2       ? '2px solid #D75E2B' : 'none',
                    }}
                  >
                    <span
                      className={s.mobileCellLabel}
                      style={{ color: row.highlighted ? 'rgba(255,255,255,0.78)' : '#5C4B92' }}
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
                        className={s.mobileCellEmpty}
                        style={{ color: row.highlighted ? 'rgba(255,255,255,0.28)' : 'rgba(52,32,110,0.24)' }}
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
        <Link to="/order" className={s.stickerLinkDesktop}>
          <img src={COPY.stickerImage} alt="Try now" className={s.stickerDesktop} />
        </Link>
        <Link to="/order" className={s.stickerLinkMobile}>
          <img src={COPY.stickerImage} alt="Try now" className={s.stickerMobile} />
        </Link>
      </div>

      </div>
    </section>
  );
}
