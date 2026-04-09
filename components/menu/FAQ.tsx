import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import s from './FAQ.module.css';

// ─── COPY — edit questions & answers here ─────────────────────────────────────
const COPY = {
  heading:      'Got Questions?',
  subheading:   "We've Got Answers",
  stickerText:  'Still Have\nQuestions?',
  stickerImage: '/assets/hero-bg/Bloque_amarillo.png',
  email:        'hello@knwnfood.com',
  emailSuffix:  "We're here to help!",
} as const;

const FAQ_LEFT = [
  {
    q: 'How do I get started?',
    a: 'Pick your meals, choose your delivery day, and place your order. We cook everything fresh and deliver it straight to your door.',
  },
  {
    q: 'Can I pause or cancel anytime?',
    a: 'Yes! You can pause or cancel your order anytime before 10 PM the day before without any fees.',
  },
  {
    q: "What if I don't like it?",
    a: "We stand behind our food 100%. If you're not satisfied, reach out and we'll make it right — no questions asked.",
  },
  {
    q: 'Do I have to order every week?',
    a: 'No subscription required. Order whenever you want — once a week, daily, or whenever the mood strikes.',
  },
];

const FAQ_RIGHT = [
  {
    q: 'What if I have dietary restrictions?',
    a: "Every meal has customization options. You can swap bases, sauces, and remove ingredients you don't like.",
  },
  {
    q: 'When do I get my delivery?',
    a: 'Orders placed before 10 PM are delivered the next business day by lunchtime.',
  },
  {
    q: 'Are the meals made fresh?',
    a: 'Yes — we cook every morning and deliver the same day. Never frozen, never reheated.',
  },
  {
    q: 'Do you deliver everywhere?',
    a: 'We currently serve Brickell, Downtown, Bayside, and Coral Gables. More zones coming soon!',
  },
];

// ─── FAQ Item (left column accordion) ────────────────────────────────────────
const FAQItem: React.FC<{ q: string; a: string; isOpen: boolean; onToggle: () => void; dark?: boolean }> = ({ q, a, isOpen, onToggle, dark }) => (
  <div
    className={s.faqItem}
    onClick={onToggle}
    style={
      isOpen && dark
        ? { background: '#2D1B69', borderRadius: '16px' }
        : isOpen
          ? { background: 'rgba(45,27,105,0.05)', border: '1.5px solid #2D1B69', borderRadius: '16px' }
          : { border: '1.5px solid #2D1B69', borderRadius: '9999px', background: '#fff' }
    }
  >
    <div className={s.faqItemHeader}>
      <span
        className={s.faqQuestion}
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: isOpen ? 700 : 400,
          color:      isOpen && dark ? '#FFFFFF' : '#2D1B69',
        }}
      >
        {q}
      </span>
      <div
        className={s.faqIcon}
        style={{ border: isOpen && dark ? '1.5px solid rgba(255,255,255,0.5)' : '1.5px solid #2D1B69' }}
      >
        {isOpen
          ? <X size={12} color={dark ? '#FFFFFF' : '#2D1B69'} strokeWidth={2.5} />
          : <Plus size={12} color="#2D1B69" strokeWidth={2} />}
      </div>
    </div>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <p
            className={s.faqAnswer}
            style={{ color: dark ? '#ffffff' : 'rgba(45,27,105,0.6)' }}
          >
            {a}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function FAQ() {
  const [openLeft, setOpenLeft] = useState<number | null>(0);
  const [openRight, setOpenRight] = useState<number | null>(null);

  return (
    <section className={s.section}>
      <div className={s.card}>

        <div className={s.inner}>
          {/* Heading */}
          <div className={s.headingBlock}>
            <h2 className={s.heading}>{COPY.heading}</h2>
            <p className={s.subheading}>{COPY.subheading}</p>
          </div>

          {/* Two-column grid */}
          <div className={s.grid}>

            {/* Left column — accordion */}
            <div className={s.leftCol}>
              {FAQ_LEFT.map((faq, i) => (
                <FAQItem
                  key={i}
                  q={faq.q}
                  a={faq.a}
                  isOpen={openLeft === i}
                  onToggle={() => setOpenLeft(openLeft === i ? null : i)}
                  dark={openLeft === i}
                />
              ))}
            </div>

            {/* Right column — pill buttons */}
            <div className={s.rightCol}>
              {FAQ_RIGHT.map((faq, i) => (
                <button
                  key={i}
                  className={s.rightBtn}
                  onClick={() => setOpenRight(openRight === i ? null : i)}
                >
                  <span className={s.rightBtnText}>{faq.q}</span>
                  <span className={s.rightBtnIcon}>+</span>
                </button>
              ))}

              {/* Still have questions? */}
              <div className={s.stillHave}>
                <div className={s.stickerWrap}>
                  <img
                    src={COPY.stickerImage}
                    alt=""
                    aria-hidden
                    className={s.stickerImg}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className={s.stickerText}>{COPY.stickerText}</span>
                </div>
                <div className={s.emailBlock}>
                  <span>Email us at </span>
                  <a href={`mailto:${COPY.email}`} className={s.emailLink}>{COPY.email}</a>
                  <span className={s.emailSuffix}>{COPY.emailSuffix}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
