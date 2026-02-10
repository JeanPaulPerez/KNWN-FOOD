
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Menu as MenuIcon, ChevronRight, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import Home from './pages/Home';
import MenuPage from './pages/MenuPage';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';
import About from './pages/About';
import { useCart } from './store/useCart';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar = ({ cartCount, onOpenCart }: { cartCount: number, onOpenCart: () => void }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-brand-subtle/90 backdrop-blur-xl border-b border-brand-primary/10 h-24 flex items-center px-6 md:px-12 justify-between">
      {/* Central Logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Link to="/" className="block w-40 md:w-56 overflow-hidden">
          <img
            src="https://knwnfood.com/wp-content/uploads/2025/09/Recurso-91x.webp"
            alt="KNWN Food Logo"
            className="w-full h-auto"
          />
        </Link>
      </div>

      {/* Desktop Navigation Right */}
      <div className="hidden md:flex gap-8 items-center ml-auto">
        <Link
          to="/menu"
          className={cn(
            "text-[10px] uppercase tracking-[0.3em] font-black py-2 px-4 rounded-full border border-transparent transition-all hover:border-brand-primary/20",
            location.pathname === '/menu' ? "text-brand-primary border-brand-primary/20" : "text-brand-primary/60"
          )}
        >
          Menu
        </Link>
        <Link
          to="/about"
          className={cn(
            "text-[10px] uppercase tracking-[0.3em] font-black py-2 px-4 rounded-full border border-transparent transition-all hover:border-brand-primary/20",
            location.pathname === '/about' ? "text-brand-primary border-brand-primary/20" : "text-brand-primary/60"
          )}
        >
          About Us
        </Link>
        <div className="flex items-center gap-4 pl-4 border-l border-brand-primary/10">
          <button
            onClick={onOpenCart}
            className="relative p-2.5 bg-brand-primary text-white rounded-full transition-transform hover:scale-110 shadow-lg shadow-brand-primary/20"
          >
            <ShoppingBag size={18} strokeWidth={2.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-brand-primary text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="md:hidden flex items-center gap-3 ml-auto">
        <button onClick={onOpenCart} className="relative p-2.5 bg-brand-primary text-white rounded-full">
          <ShoppingBag size={18} strokeWidth={2.5} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-brand-primary text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
              {cartCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2.5 bg-white text-brand-primary rounded-full border border-brand-primary/10 shadow-sm"
        >
          {isMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-[calc(100%+1rem)] left-4 right-4 bg-white/95 backdrop-blur-2xl border border-brand-primary/10 rounded-[2.5rem] p-8 flex flex-col items-center gap-8 md:hidden z-50 shadow-2xl"
          >
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-3xl font-serif text-brand-primary">About Us</Link>
            <Link to="/menu" onClick={() => setIsMenuOpen(false)} className="text-3xl font-serif text-brand-primary">Menu</Link>
            <div className="w-full pt-8 border-t border-brand-primary/5 flex flex-col items-center gap-4">
              <span className="text-[10px] uppercase tracking-widest font-black text-brand-primary/40">Connect With Us</span>
              <div className="flex gap-6 text-brand-primary/60">
                <span className="text-xs font-black uppercase tracking-widest">IG</span>
                <span className="text-xs font-black uppercase tracking-widest">FB</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const CartDrawer = ({ isOpen, onClose, cart }: { isOpen: boolean, onClose: () => void, cart: any }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-primary/20 backdrop-blur-md z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-brand-primary/5 flex justify-between items-center">
              <h2 className="text-2xl font-serif text-brand-primary">Your Selection</h2>
              <button onClick={onClose} className="p-2.5 bg-brand-subtle text-brand-primary rounded-full hover:scale-110 transition-transform">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-brand-subtle rounded-full flex items-center justify-center">
                    <ShoppingBag size={32} className="text-brand-primary/30" strokeWidth={1.5} />
                  </div>
                  <p className="text-brand-primary/40 font-black uppercase tracking-[0.2em] text-[10px]">Your basket is currently empty</p>
                  <Link
                    to="/menu"
                    onClick={onClose}
                    className="px-8 py-3 bg-brand-primary text-white rounded-full text-[10px] uppercase tracking-[0.2em] font-black hover:scale-105 transition-transform"
                  >
                    Explore Menu
                  </Link>
                </div>
              ) : (
                cart.items.map((item: any) => (
                  <div key={`${item.id}-${item.serviceDate}-${JSON.stringify(item.customizations)}`} className="flex gap-5 group bg-brand-subtle/30 p-5 rounded-[2rem] border border-brand-primary/5">
                    <img src={item.image || 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&q=80&w=800'} className="w-24 h-24 object-cover rounded-[1.5rem]" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-bold leading-tight text-brand-primary">{item.name}</h3>
                        <span className="text-sm font-serif text-brand-primary">${item.price * item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-brand-primary/40 mt-1">
                        <Calendar size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{item.serviceDate}</span>
                      </div>

                      {item.customizations && (
                        <div className="mt-2 text-[9px] text-brand-primary/60 space-y-0.5 border-l-2 border-brand-primary/10 pl-2 font-medium italic">
                          {item.customizations.base && <div>{item.customizations.base}</div>}
                          {item.customizations.protein && <div>{item.customizations.protein}</div>}
                          {item.customizations.sauce && <div>{item.customizations.sauce}</div>}
                          {item.customizations.avoid && <div>No {item.customizations.avoid}</div>}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center bg-white rounded-full p-1 border border-brand-primary/5">
                          <button onClick={() => cart.updateQuantity(item.id, item.serviceDate, -1, item.customizations)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand-subtle transition-colors text-brand-primary">-</button>
                          <span className="px-4 text-[10px] text-brand-primary font-black">{item.quantity}</span>
                          <button onClick={() => cart.updateQuantity(item.id, item.serviceDate, 1, item.customizations)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-brand-subtle transition-colors text-brand-primary">+</button>
                        </div>
                        <button
                          onClick={() => cart.removeItem(item.id, item.serviceDate, item.customizations)}
                          className="text-[9px] uppercase tracking-[0.2em] text-brand-primary/40 hover:text-red-500 transition-colors font-black"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.items.length > 0 && (
              <div className="p-8 border-t border-brand-primary/5 bg-brand-subtle/50">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-brand-primary/40 uppercase tracking-[0.2em] text-[10px] font-black">Total Order</span>
                  <span className="text-4xl font-serif text-brand-primary">${cart.total}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full py-6 bg-brand-primary text-white rounded-[1.5rem] flex items-center justify-center gap-3 group hover:scale-[1.02] transition-all shadow-2xl shadow-brand-primary/30"
                >\
                  <span className="uppercase tracking-[0.3em] text-[10px] font-black">Finalize Order</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
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
  const cart = useCart();

  return (
    <div className="min-h-screen pt-24 selection:bg-brand-primary selection:text-white flex flex-col font-sans bg-brand-subtle">
      <Navbar cartCount={cart.itemCount} onOpenCart={() => setIsCartOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MenuPage addItem={cart.addItem} />} />
          <Route path="/checkout" element={<Checkout cart={cart} />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} />

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

      <footer className="bg-brand-primary text-white py-24 px-6 md:px-12 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <img
              src="https://knwnfood.com/wp-content/uploads/2025/09/Recurso-91x.webp"
              alt="KNWN Food"
              className="w-48 brightness-0 invert opacity-80"
            />
            <p className="text-white/40 max-w-sm font-light leading-relaxed text-sm">
              Chef-driven dining, delivered. Experience a rotating menu of seasonally-inspired bowls and plates, prepared with intention and delivered to your doorstep.
            </p>
          </div>
          <div>
            <h4 className="uppercase tracking-[0.3em] text-[10px] font-black mb-8 text-white/40">Explore</h4>
            <ul className="space-y-4 text-white/80 text-xs font-black uppercase tracking-widest">
              <li><Link to="/menu" className="hover:text-white transition-colors">Menu</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Story</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Values</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="uppercase tracking-[0.3em] text-[10px] font-black mb-8 text-white/40">Connect</h4>
            <ul className="space-y-4 text-white/80 text-xs font-black uppercase tracking-widest">
              <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Newsletter</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] tracking-[0.3em] text-white/20 uppercase font-black">
          <p>© 2024 KNWN FOOD. ARCHITECTING TOMORROW'S DINING.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
