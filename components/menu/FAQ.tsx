import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { clsx } from 'clsx';
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
    a: 'Yes. You can pause or cancel anytime. Just make sure to cancel your next delivery before 9 PM the day before.',
  },
  {
    q: "What if I don't like it?",
    a: "If something isn’t right with your order, please contact us as soon as possible. We want to know what happened and make it right.",
  },
  {
    q: 'Do I have to order every week?',
    a: 'No. You can order only when you want. Choose the days that work for you, with no weekly commitment.',
  },
];

const FAQ_RIGHT = [
  {
    q: 'What if I have dietary restrictions?',
    a: 'We offer customization for many dietary restrictions. You can remove certain ingredients when placing your order. For allergies, please note that all our food is prepared in a commercial kitchen that handles common ingredients, including, but not limited to, wheat, soy, dairy, eggs, peanuts, tree nuts, fish, and shellfish. While we take responsible precautions to prevent cross-contamination, we cannot guarantee that any dish is 100% free of allergens.',
  },
  {
    q: 'When do I get my delivery?',
    a: 'Deliveries arrive between 10 AM and 12 PM on your selected day. Please be ready to receive your order during that window.',
  },
  {
    q: 'Are the meals made fresh?',
    a: 'Yes. All meals are prepared fresh the same morning of your delivery. We thrive on real, fresh, honest food.',
  },
  {
    q: 'Do you deliver everywhere?',
    a: 'Not yet. We currently deliver only in selected areas. Enter your zip code to check availability.',
  },
];

// ─── FAQ Item (left column accordion) ────────────────────────────────────────
const FAQItem: React.FC<{ q: string; a: string; isOpen: boolean; onToggle: () => void; dark?: boolean }> = ({ q, a, isOpen, onToggle, dark }) => (
  <div
    className={clsx(s.faqItem, isOpen && dark ? s.faqItemOpen : isOpen ? s.faqItemActive : s.faqItemDefault)}
    onClick={onToggle}
  >
    <div className={s.faqItemHeader}>
      <span className={clsx(s.faqQuestion, isOpen && dark ? s.faqQuestionOpen : '')}>
        {q}
      </span>
      <div
        className={clsx(s.faqIcon, isOpen && dark ? s.faqIconOpen : '')}
      >
        {isOpen
          ? <X size={12} strokeWidth={2.5} />
          : <Plus size={12} strokeWidth={2} />}
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
          <p className={clsx(s.faqAnswer, dark ? s.faqAnswerDark : '')}>
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
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleToggleLeft = (i: number) => {
    setOpenLeft(openLeft === i ? null : i);
    if (isMobile) setOpenRight(null);
  };

  const handleToggleRight = (i: number) => {
    setOpenRight(openRight === i ? null : i);
    if (isMobile) setOpenLeft(null);
  };

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
                  onToggle={() => handleToggleLeft(i)}
                  dark={openLeft === i}
                />
              ))}
            </div>

            {/* Right column — accordion */}
            <div className={s.rightCol}>
              {FAQ_RIGHT.map((faq, i) => (
                <FAQItem
                  key={i}
                  q={faq.q}
                  a={faq.a}
                  isOpen={openRight === i}
                  onToggle={() => handleToggleRight(i)}
                  dark={openRight === i}
                />
              ))}

              {/* Still have questions? */}
              <div className={s.stillHaveWrap}>
                <img
                  src="/images_KNWN/Clip-path-group.jpg"
                  alt=""
                  loading="lazy"
                  className={s.stillHaveBlur}
                  aria-hidden="true"
                />
                <div className={s.stillHave}>
                  <div className={s.stickerWrap}>
                    <img
                      src={COPY.stickerImage}
                      alt=""
                      aria-hidden
                      loading="lazy"
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
      </div>
    </section>
  );
}
