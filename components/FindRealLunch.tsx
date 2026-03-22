import React from 'react';
import s from './FindRealLunch.module.css';

const CHECK = '✓';

export default function FindRealLunch() {
  return (
    <section className={s.section}>
      <div className={s.inner}>

        <h2 className={s.heading}>
          Find the <span className={s.real}>real</span> lunch.
        </h2>

        <p className={s.subtitle}>
          Real lunch is made with fresh, high-quality produce, no antibiotics or hormones ever, no seed oils,
          and sauces made from scratch, no preservatives, just real ingredients.
        </p>

        <div className={s.tableWrap}>
          <table className={s.table}>
            <colgroup>
              <col style={{ width: '36%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
            </colgroup>

            <thead>
              <tr>
                {/* No header above label column */}
                <th className={s.thEmpty} />
                <th className={s.th}><div className={s.thBadge}>Pricing</div></th>
                <th className={s.th}><div className={s.thBadge}>Food<br />Quality</div></th>
                <th className={s.th}><div className={s.thBadge}>Convenience</div></th>
                <th className={s.th}><div className={s.thBadge}>No Hidden<br />Fees</div></th>
              </tr>
            </thead>

            <tbody>
              {/* Row 1 — KNWN: all ✓, purple card */}
              <tr>
                <td className={s.tdLabelKnwn}>KNWN Real Food Lunch</td>
                <td className={s.tdCheckKnwn}>{CHECK}</td>
                <td className={s.tdCheckKnwn}>{CHECK}</td>
                <td className={s.tdCheckKnwn}>{CHECK}</td>
                <td className={s.tdCheckKnwnLast}>{CHECK}</td>
              </tr>

              {/* Row 2 — Meal Prep: ✓ only in Pricing */}
              <tr>
                <td className={s.tdLabel}>Meal Prep Service</td>
                <td className={s.tdCheckOrange}>{CHECK}</td>
                <td className={s.tdEmptyWhite} />
                <td className={s.tdEmptyWhite} />
                <td className={s.tdEmptyWhiteLast} />
              </tr>

              {/* Row 3 — Restaurants: ✓ only in Convenience */}
              <tr>
                <td className={s.tdLabel}>Restaurant &amp; Delivery Apps</td>
                <td className={s.tdEmptyWhite} />
                <td className={s.tdEmptyWhite} />
                <td className={s.tdCheckOrange}>{CHECK}</td>
                <td className={s.tdEmptyWhiteLast} />
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}
