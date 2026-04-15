import React from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
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
        <div className={s.mobileTableContainer}>
          <div className={s.mobileInnerTable}>
            {/* Header Row */}
            <div className={s.mHeaderRow}>
              <div className={s.mHeaderCellLabel}>Feature</div>
              <div className={s.mHeaderCellBrand}>
                <span className={s.mBrandText}>K<span className={s.mBrandSmall}>N</span>W<span className={s.mBrandSmall}>N</span></span>
              </div>
              <div className={s.mHeaderCellOther}>Meal Prep{'\n'}Service</div>
              <div className={s.mHeaderCellOther}>Restaurant{'\n'}& Apps</div>
            </div>

            {/* Feature Rows */}
            {COMPARISON_COLUMNS.map((col, rowIndex) => (
              <div key={col.compact} className={s.mRow}>
                <div className={s.mLabelCell}>{col.compact}</div>
                <div className={s.mCheckCellBrand}>
                  {COMPARISON_ROWS[0].checks[rowIndex] && (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#311c67" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div className={s.mCheckCellOther}>
                  {COMPARISON_ROWS[1].checks[rowIndex] ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#311c67" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : <span className={s.mEmpty} />}
                </div>
                <div className={s.mCheckCellOther}>
                  {COMPARISON_ROWS[2].checks[rowIndex] ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#311c67" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : <span className={s.mEmpty} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticker (Desktop Only) */}
        <Link to="/order" className={s.stickerLinkDesktop}>
          <img src={COPY.stickerImage} alt="Try now" loading="lazy" className={s.stickerDesktop} />
        </Link>
      </div>

      </div>
    </section>
  );
}
