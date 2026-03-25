
import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, ChevronRight, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import Home from './pages/Home';
import MenuPage from './pages/MenuPage';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';
import About from './pages/About';
import OrderPage from './pages/OrderPage';
import { useWooCart } from './store/useWooCart';
import { useUser } from './store/useUser';
import RegistrationModal from './components/RegistrationModal';
import Header from './components/Header';

const FOOD_BG_MAP: Record<string, string> = {
  'mediterranean chicken': '/assets/food-bg/mediterranean-chicken.webp',
  'bibi bump rice':        '/assets/food-bg/bibi-bamp-rice.webp',
  'carne asada':           '/assets/food-bg/carne-asada.webp',
  'chicken lime':          '/assets/food-bg/chicken-lime.webp',
  'chicken pesto pasta':   '/assets/food-bg/pesto-pasta.webp',
  'thai beef salad':       '/assets/food-bg/thai-beef-salad.webp',
  'milanesa':              '/assets/food-bg/milanesa.webp',
  'harissa meatballs':     '/assets/food-bg/harissa-meatballs.webp',
  'crispy korean chicken': '/assets/food-bg/korean-crispy-chicken.webp',
  'chicken caesar salad':  '/assets/food-bg/chicken-cesar-salad.webp',
};

function getFoodBg(name: string): string {
  const key = name.toLowerCase().trim();
  const match = Object.entries(FOOD_BG_MAP).find(([k]) => key.includes(k) || k.includes(key));
  return match ? match[1] : '/assets/food-bg/carne-asada.webp';
}


const CartDrawer = ({ isOpen, onClose, cart, onFinalize, isFinalizing }: { isOpen: boolean, onClose: () => void, cart: any, onFinalize: () => void, isFinalizing?: boolean }) => {
  const MAX_MEALS = 5;
  const progress = Math.min((cart.itemCount / MAX_MEALS) * 100, 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-primary/20 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[120] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-serif text-brand-primary">My Week Lunch</h2>
                {cart.syncing && (
                  <span className="text-[8px] uppercase tracking-widest text-brand-orange font-black animate-pulse">Syncing...</span>
                )}
              </div>
              <button onClick={onClose} className="p-2 bg-brand-bg text-brand-primary rounded-full hover:bg-brand-subtle/50 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-6 py-3 border-b border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary/40">Week Progress</span>
                <span className="text-[9px] font-black text-brand-primary/40">{cart.itemCount}/{MAX_MEALS} meals</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-lime rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
              {cart.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center">
                    <ShoppingBag size={26} className="text-brand-primary/20" strokeWidth={1.5} />
                  </div>
                  <p className="text-brand-primary/30 font-black uppercase tracking-[0.2em] text-[9px]">Your week is empty</p>
                  <Link
                    to="/menu"
                    onClick={onClose}
                    className="px-6 py-3 bg-brand-primary text-white rounded-full text-[10px] uppercase tracking-[0.2em] font-black hover:bg-brand-dark transition-colors"
                  >
                    Explore Menu
                  </Link>
                </div>
              ) : (
                cart.items.map((item: any) => (
                  <div key={`${item.id}-${item.serviceDate}-${JSON.stringify(item.customizations)}`} className="flex gap-3 bg-brand-bg p-3 rounded-2xl border border-gray-100">
                    <img src={getFoodBg(item.name)} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" alt={item.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-[11px] font-bold leading-tight text-brand-primary truncate">{item.name}</h3>
                        <span className="text-[11px] font-serif text-brand-primary flex-shrink-0">${item.price * item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-brand-primary/40">
                        <Calendar size={9} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{item.serviceDate}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center bg-white rounded-full border border-gray-100 p-0.5">
                          <button onClick={() => cart.updateQuantity(item.id, item.serviceDate, -1, item.customizations)} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-brand-bg transition-colors text-brand-primary text-xs font-bold">−</button>
                          <span className="px-2 text-[9px] text-brand-primary font-black">{item.quantity}</span>
                          <button onClick={() => cart.updateQuantity(item.id, item.serviceDate, 1, item.customizations)} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-brand-bg transition-colors text-brand-primary text-xs font-bold">+</button>
                        </div>
                        <button
                          onClick={() => cart.removeItem(item.id, item.serviceDate, item.customizations)}
                          className="text-[8px] uppercase tracking-widest text-brand-primary/25 hover:text-red-400 transition-colors font-black"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.items.length > 0 && (
              <div className="p-5 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary/40">Subtotal</span>
                  <span className="text-2xl font-serif text-brand-primary">${cart.total}</span>
                </div>
                <button
                  onClick={onFinalize}
                  className="w-full py-4 bg-brand-lime text-brand-primary rounded-2xl flex items-center justify-center gap-2 group hover:brightness-95 transition-all font-black text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-brand-lime/30"
                >
                  Checkout
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const cart = useWooCart();
  const { isRegistered, register } = useUser();
  const navigate = useNavigate();

  const handleFinalize = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleRegistrationConfirm = (userData: any) => {
    register(userData);
    setShowRegistration(false);
    navigate('/checkout');
  };

  const handleSkipToCheckout = () => {
    setShowRegistration(false);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen selection:bg-brand-primary selection:text-white flex flex-col font-sans bg-[#F5F3FF]">
      <Header cartCount={cart.itemCount} onOpenCart={() => setIsCartOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MenuPage cart={cart} />} />
          <Route path="/order" element={<OrderPage cart={cart} />} />
          <Route path="/about" element={<About />} />
          <Route path="/checkout" element={<Checkout cart={cart} />} />
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onFinalize={handleFinalize}
      />

      <AnimatePresence>
        {showRegistration && (
          <RegistrationModal
            isOpen={showRegistration}
            onClose={() => setShowRegistration(false)}
            onConfirm={handleRegistrationConfirm}
            onSkip={handleSkipToCheckout}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cart.error && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 bg-brand-primary text-white rounded-full shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <AlertTriangle className="text-brand-accent" size={18} />
            <span className="text-xs uppercase tracking-widest font-bold whitespace-nowrap">{cart.error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-brand-primary text-white py-10 md:py-16 lg:py-24 px-5 md:px-10 lg:px-12 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-16">
          <div className="col-span-1 sm:col-span-2 space-y-5 md:space-y-8">
            <img
              src="https://knwnfood.com/wp-content/uploads/2025/09/Recurso-91x.webp"
              alt="KNWN Food"
              className="w-28 md:w-40 lg:w-48 brightness-0 invert opacity-80"
            />
            <p className="text-white/40 max-w-sm font-light leading-relaxed text-xs md:text-sm">
              Chef-driven dining, delivered. Experience a rotating menu of seasonally-inspired bowls and plates, prepared with intention and delivered to your doorstep.
            </p>
          </div>
          <div>
            <h4 className="uppercase tracking-[0.3em] text-[9px] md:text-[10px] font-black mb-5 md:mb-8 text-white/40">Explore</h4>
            <ul className="text-white/80 text-[10px] md:text-xs font-black uppercase tracking-widest">
              <li><Link to="/menu" className="flex items-center min-h-[44px] hover:text-white transition-colors">Menu</Link></li>
              <li><Link to="/" className="flex items-center min-h-[44px] hover:text-white transition-colors">Story</Link></li>
              <li><Link to="/" className="flex items-center min-h-[44px] hover:text-white transition-colors">Values</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="uppercase tracking-[0.3em] text-[9px] md:text-[10px] font-black mb-5 md:mb-8 text-white/40">Connect</h4>
            <ul className="text-white/80 text-[10px] md:text-xs font-black uppercase tracking-widest">
              <li><Link to="/" className="flex items-center min-h-[44px] hover:text-white transition-colors">Instagram</Link></li>
              <li><Link to="/" className="flex items-center min-h-[44px] hover:text-white transition-colors">LinkedIn</Link></li>
              <li><Link to="/" className="flex items-center min-h-[44px] hover:text-white transition-colors">Newsletter</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 md:mt-16 lg:mt-24 pt-6 md:pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] md:text-[9px] tracking-[0.3em] text-white/20 uppercase font-black text-center md:text-left">
          <p>© 2024 KNWN FOOD. ARCHITECTING TOMORROW'S DINING.</p>
          <div className="flex gap-6 md:gap-8">
            <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
