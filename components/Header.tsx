import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import s from './Header.module.css';
import { useUser } from '../store/useUser';

interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenProfile?: () => void;
}

export default function Header({ cartCount = 0, onOpenCart, onOpenProfile }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const { isRegistered } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAccountClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
      return;
    }

    navigate('/account');
  };

  const handleHowItWorksClick = (e: React.MouseEvent, closeMenu?: () => void) => {
    e.preventDefault();
    if (closeMenu) closeMenu();
    const scroll = () => {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };
    if (location.pathname !== '/') {
      navigate('/home');
      setTimeout(scroll, 150);
    } else {
      scroll();
    }
  };

  return (
    <header className={s.header}>

      <div className={s.headerInner}>
        {/* Logo */}
        <Link to="/home" onClick={() => setOpen(false)}>
          <img
            src="/assets/logo.webp"
            alt="KNWN Food"
            className={s.logo}
          />
        </Link>

        {/* Desktop nav */}
        <nav className={s.nav}>
          <Link to="/menu" className={s.navLink}>Menu</Link>
          <a href="#" onClick={(e) => handleHowItWorksClick(e)} className={s.navLink}>How it Works</a>
          <Link to="/about" className={s.navLink}>About Us</Link>
        </nav>

        {/* Desktop actions */}
        <div className={s.actions}>
          <Link to="/order-now" className={s.orderBtn}>Order now</Link>

          <button className={s.iconBtn} onClick={onOpenCart} aria-label="Cart">
            <ShoppingBag size={22} strokeWidth={2.5} />
            {cartCount > 0 && <span className={s.cartBadge}>{cartCount}</span>}
          </button>

          <button className={s.iconBtn} aria-label="Account" onClick={handleAccountClick}>
            <User size={22} strokeWidth={2.5} />
            {isRegistered && <span className={s.profileDot} />}
          </button>
        </div>

        {/* Mobile right: cart + hamburger */}
        <div className={s.mobileRight}>
          <button className={s.iconBtn} aria-label="Account" onClick={handleAccountClick}>
            <User size={22} strokeWidth={2.5} />
            {isRegistered && <span className={s.profileDot} />}
          </button>

          <button className={s.iconBtn} onClick={onOpenCart} aria-label="Cart">
            <ShoppingBag size={22} strokeWidth={2.5} />
            {cartCount > 0 && <span className={s.cartBadge}>{cartCount}</span>}
          </button>

          <button
            className={s.iconBtn}
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className={s.drawer}>
            <Link to="/menu" className={s.drawerLink} onClick={() => setOpen(false)}>Menu</Link>
            <a href="#" className={s.drawerLink} onClick={(e) => handleHowItWorksClick(e, () => setOpen(false))}>How it Works</a>
            <Link to="/about" className={s.drawerLink} onClick={() => setOpen(false)}>About Us</Link>
            <Link to="/order-now" className={s.drawerOrderBtn} onClick={() => setOpen(false)}>Order Now</Link>
          </div>
        )}
      </div>
    </header>
  );
}
