import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import s from './Header.module.css';

interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function Header({ cartCount = 0, onOpenCart }: HeaderProps) {
  const [open, setOpen] = useState(false);

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

        <button className={s.iconBtn} aria-label="Account">
          <User size={20} strokeWidth={1.8} />
        </button>
      </div>

      {/* Mobile right: cart + hamburger */}
      <div className={s.mobileRight}>
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
