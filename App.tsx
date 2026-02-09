
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Menu as MenuIcon, ChevronRight, AlertTriangle, Calendar } from 'lucide-react';
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

  const links = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/about', label: 'Story' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-cream/80 backdrop-blur-md border-b border-brand-clay/30 h-16 flex items-center px-6 md:px-12 justify-between">
      <Link to="/" className="font-serif text-2xl tracking-tighter hover:opacity-70 transition-opacity">
        KNWN<span className="font-light italic">Food</span>
      </Link>

      <div className="hidden md:flex gap-8 items-center text-sm font-medium tracking-widest uppercase">
        {links.map(link => (
          <Link 
            key={link.to} 
            to={link.to} 
            className={cn(
              "hover:text-brand-accent transition-colors",
              location.pathname === link.to ? "text-brand-accent" : "text-brand-charcoal"
            )}
          >
            {link.label}
          </Link>
        ))}
        <button 
          onClick={onOpenCart}
          className="relative p-2 hover:bg-brand-clay/20 rounded-full transition-colors"
        >
          <ShoppingBag size={20} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-brand-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="md:hidden flex items-center gap-4">
        <button onClick={onOpenCart} className="relative p-2">
          <ShoppingBag size={22} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute -top-0 -right-0 bg-brand-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-brand-cream border-b border-brand-clay p-6 flex flex-col gap-6 md:hidden z-40"
          >
            {links.map(link => (
              <Link 
                key={link.to} 
                to={link.to} 
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-serif"
              >
                {link.label}
              </Link>
            ))}
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-cream z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-brand-clay flex justify-between items-center">
              <h2 className="text-xl font-serif">Your Order</h2>
              <button onClick={onClose} className="p-2 hover:bg-brand-clay/20 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-brand-clay/20 rounded-full flex items-center justify-center">
                    <ShoppingBag size={32} className="text-brand-muted" strokeWidth={1} />
                  </div>
                  <p className="text-brand-muted font-light uppercase tracking-widest text-sm">Cart is empty</p>
                  <Link 
                    to="/menu" 
                    onClick={onClose}
                    className="text-brand-accent font-medium hover:underline flex items-center gap-1"
                  >
                    View menu <ChevronRight size={16} />
                  </Link>
                </div>
              ) : (
                cart.items.map((item: any) => (
                  <div key={`${item.id}-${item.serviceDate}`} className="flex gap-4 group bg-white p-4 rounded-2xl border border-brand-clay/20">
                    <img src={item.image || 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&q=80&w=800'} className="w-20 h-20 object-cover rounded-xl" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium leading-tight">{item.name}</h3>
                        <span className="text-sm font-serif ml-2">${item.price * item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-brand-accent mt-1">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{item.serviceDate}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-brand-clay rounded-full px-2 py-0.5">
                          <button onClick={() => cart.updateQuantity(item.id, item.serviceDate, -1)} className="px-1 text-lg">-</button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button onClick={() => cart.updateQuantity(item.id, item.serviceDate, 1)} className="px-1 text-lg">+</button>
                        </div>
                        <button 
                          onClick={() => cart.removeItem(item.id, item.serviceDate)}
                          className="text-[10px] uppercase tracking-widest text-brand-muted hover:text-red-500 transition-colors"
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
              <div className="p-6 border-t border-brand-clay bg-brand-clay/10">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-brand-muted uppercase tracking-widest text-xs">Subtotal</span>
                  <span className="text-2xl font-serif">${cart.total}</span>
                </div>
                <Link 
                  to="/checkout" 
                  onClick={onClose}
                  className="w-full py-4 bg-brand-charcoal text-white rounded-full flex items-center justify-center gap-2 group hover:bg-brand-charcoal/90 transition-all shadow-lg"
                >
                  <span className="uppercase tracking-[0.2em] text-xs font-semibold">Proceed to Checkout</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
    <div className="min-h-screen pt-16 selection:bg-brand-accent selection:text-white flex flex-col">
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 bg-brand-charcoal text-white rounded-full shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <AlertTriangle className="text-brand-accent" size={18} />
            <span className="text-xs uppercase tracking-widest font-bold whitespace-nowrap">{cart.error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-brand-charcoal text-white py-20 px-6 md:px-12 border-t border-brand-clay/10 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <h2 className="font-serif text-3xl tracking-tighter">KNWN<span className="italic">Food</span></h2>
            <p className="text-brand-muted max-w-sm font-light leading-relaxed">
              Chef-driven dining, delivered. Experience a rotating menu of seasonally-inspired bowls and plates, prepared with intention and delivered to your doorstep.
            </p>
          </div>
          <div>
            <h4 className="uppercase tracking-widest text-xs font-bold mb-6">Explore</h4>
            <ul className="space-y-4 text-brand-muted font-light">
              <li><Link to="/menu" className="hover:text-white">Menu</Link></li>
              <li><Link to="/about" className="hover:text-white">Our Story</Link></li>
              <li><Link to="/about" className="hover:text-white">Sustainability</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="uppercase tracking-widest text-xs font-bold mb-6">Social</h4>
            <ul className="space-y-4 text-brand-muted font-light">
              <li><a href="#" className="hover:text-white">Instagram</a></li>
              <li><a href="#" className="hover:text-white">TikTok</a></li>
              <li><a href="#" className="hover:text-white">Newsletter</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-brand-clay/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs tracking-widest text-brand-muted uppercase">
          <p>© 2024 KNWN Food. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
