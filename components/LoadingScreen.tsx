import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Shared loading UI — reused by both splash and route transitions
function LoadingUI({ progress }: { progress: number }) {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.50, ease: 'easeOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#F4F1FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Inner group — always visually centered */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: window.innerWidth < 768 ? 0 : 32,
        transform: window.innerWidth < 768 ? 'translateY(-60px)' : 'none',
      }}>
        <motion.img
          src="/assets/LOGO1.png"
          alt="KNWN Food"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-[160vw] md:w-[780px]"
          style={{ height: 'auto', maxWidth: 'none', display: 'block', marginLeft: '-30vw', marginRight: '-30vw' }}
        />

        <div style={{
          width: 200, height: 6, borderRadius: 99,
          background: 'rgba(43,28,112,0.12)',
          overflow: 'hidden',
          marginTop: window.innerWidth < 768 ? '-120px' : undefined,
        }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 99, background: '#2B1C70' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Initial Splash ───────────────────────────────────────────────────────────
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setProgress(40), 120);
    const t2 = setTimeout(() => setProgress(75), 500);

    const finish = () => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setTimeout(onDone, 380);
      }, 280);
    };

    if (document.readyState === 'complete') {
      setTimeout(finish, 700);
    } else {
      window.addEventListener('load', finish, { once: true });
      const fallback = setTimeout(finish, 3000);
      return () => {
        clearTimeout(t1); clearTimeout(t2); clearTimeout(fallback);
        window.removeEventListener('load', finish);
      };
    }

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && <LoadingUI progress={progress} />}
    </AnimatePresence>
  );
}

// ─── Route transition loader ──────────────────────────────────────────────────
// Shows the same splash screen between page navigations.
// Stays visible for MIN_DISPLAY ms so images have time to start loading,
// then fades out cleanly.
const MIN_DISPLAY = 700; // ms — enough for LCP images to start decoding

export function RouteLoader() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const isFirst = useRef(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  useEffect(() => {
    // Skip on initial render — SplashScreen handles that
    if (isFirst.current) { isFirst.current = false; return; }

    clear();
    setProgress(0);
    setVisible(true);

    const t1 = setTimeout(() => setProgress(50), 80);
    const t2 = setTimeout(() => setProgress(85), 350);

    // After MIN_DISPLAY, complete and fade out
    const done = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setVisible(false), 300);
    }, MIN_DISPLAY);

    timers.current = [t1, t2, done];
    return clear;
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {visible && <LoadingUI progress={progress} />}
    </AnimatePresence>
  );
}
