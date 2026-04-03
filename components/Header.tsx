import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  const handleAccountClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
      return;
    }

    navigate('/account');
  };

  return (
    <header className={s.header}>

      {/* Logo */}
      <Link to="/" onClick={() => setOpen(false)}>
        <img
          src="https://knwnfood.com/wp-content/uploads/2025/09/Recurso-91x.webp"
          alt="KNWN Food"
          className={s.logo}
        />
      </Link>

      {/* Desktop nav */}
      <nav className={s.nav}>
        <Link to="/menu"  className={s.navLink}>Menu</Link>
        <a href="/#how-it-works" className={s.navLink}>How it Works</a>
        <Link to="/about" className={s.navLink}>About Us</Link>
      </nav>

      {/* Desktop actions */}
      <div className={s.actions}>
        <Link to="/order" className={s.orderBtn}>Order now</Link>

        <button className={s.iconBtn} onClick={onOpenCart} aria-label="Cart">
          <ShoppingBag size={20} strokeWidth={1.8} />
          {cartCount > 0 && <span className={s.cartBadge}>{cartCount}</span>}
        </button>

        <button className={s.iconBtn} aria-label="Account" onClick={handleAccountClick}>
          <User size={20} strokeWidth={1.8} />
          {isRegistered && <span className={s.profileDot} />}
        </button>
      </div>

      {/* Mobile right: cart + hamburger */}
      <div className={s.mobileRight}>
        <button className={s.iconBtn} aria-label="Account" onClick={onOpenProfile}>
          <User size={20} strokeWidth={1.8} />
          {isRegistered && <span className={s.profileDot} />}
        </button>

        <button className={s.iconBtn} onClick={onOpenCart} aria-label="Cart">
          <ShoppingBag size={20} strokeWidth={1.8} />
          {cartCount > 0 && <span className={s.cartBadge}>{cartCount}</span>}
        </button>

        <button
          className={s.iconBtn}
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} strokeWidth={1.8} /> : <Menu size={22} strokeWidth={1.8} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className={s.drawer}>
          <Link to="/menu"  className={s.drawerLink} onClick={() => setOpen(false)}>Menu</Link>
          <a href="/#how-it-works" className={s.drawerLink} onClick={() => setOpen(false)}>How it Works</a>
          <Link to="/about" className={s.drawerLink} onClick={() => setOpen(false)}>About Us</Link>
          <Link to="/order" className={s.drawerOrderBtn} onClick={() => setOpen(false)}>Order Now</Link>
        </div>
      )}

    </header>
  );
}
