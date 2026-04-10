import React from 'react';
import { Link } from 'react-router-dom';
import s from './HowItWorks.module.css';

type Step = {
  id: number;
  title: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  headingTop: string;
  headingBottom: string;
  headingCompact?: boolean;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

const STEPS = [
  {
    id: 1,
    title: "Plan Your Week's Lunch",
    image: '/assets/hero-bg/KNKW-1293.webp',
    imageAlt: 'Weekly lunch meal selection',
    imagePosition: 'center',
    headingTop: 'How it',
    headingBottom: 'works',
    headingCompact: false,
    description:
      'Pick from two real food options daily and select your lunches for the week. Plan ahead and save more.',
    ctaLabel: 'Explore Menu',
    ctaHref: '/menu',
  },
  {
    id: 2,
    title: 'We Cook Your Week',
    image: '/assets/hero-bg/DSC00958.webp',
    imageAlt: 'KNWN packaging prepared in the kitchen',
    imagePosition: 'center',
    headingTop: 'How we fix the',
    headingBottom: 'Lunch Problem',
    headingCompact: true,
    description:
      'You lay back while our chefs cook your weekly plan from scratch every morning, using real ingredients, no additives, no shortcuts.',
  },
  {
    id: 3,
    title: 'Delivered to Your Office',
    image: '/assets/hero-bg/DSC01587.webp',
    imageAlt: 'KNWN delivery partner walking food to the office',
    imagePosition: 'center',
    headingTop: 'How we fix the',
    headingBottom: 'Lunch Problem',
    headingCompact: true,
    description:
      'Delivered fresh to your office everyday, exactly when you need it.',
    ctaLabel: 'Order Now',
    ctaHref: '/order',
  },
] satisfies Step[];

export default function HowItWorks() {
  const [activeStepId, setActiveStepId] = React.useState(1);
  const activeStep = STEPS.find((step) => step.id === activeStepId) || STEPS[0];

  return (
    <section id="how-it-works" className={s.section}>
      <div className={s.card}>
        <div className={s.photoWrap}>
          {STEPS.map((step) => (
            <img
              key={step.id}
              src={step.image}
              alt={step.id === activeStepId ? step.imageAlt : ''}
              aria-hidden={step.id === activeStepId ? undefined : true}
              className={`${s.photo} ${step.id === activeStepId ? s.photoActive : s.photoInactive}`}
              style={{ objectPosition: step.imagePosition || 'center' }}
            />
          ))}
        </div>

        <div className={s.content}>
          <h2 className={`${s.heading} ${activeStep.headingCompact ? s.headingCompact : ''}`}>
            <span className={s.headingTop}>{activeStep.headingTop}</span>
            <span className={s.headingBottom}>{activeStep.headingBottom}</span>
          </h2>

          <div className={s.steps}>
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={step.id === activeStepId ? s.stepActive : s.step}>
                  <div className={s.stepHeader}>
                    <button
                      type="button"
                      onClick={() => setActiveStepId(step.id)}
                      className={step.id === activeStepId ? s.pillActive : s.pill}
                      aria-pressed={step.id === activeStepId}
                    >
                      Step {step.id} &bull; {step.title}
                    </button>
                  </div>

                  {step.id === activeStepId && (
                    <>
                      <p className={s.desc}>{step.description}</p>
                      {step.ctaLabel && step.ctaHref ? (
                        <Link to={step.ctaHref} className={s.exploreBtn}>{step.ctaLabel}</Link>
                      ) : null}
                    </>
                  )}
                </div>

                {index < STEPS.length - 1 && <hr className={s.divider} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
