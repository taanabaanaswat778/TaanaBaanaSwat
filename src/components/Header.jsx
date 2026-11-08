import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import { useWishlist } from "../wishlist";

// ===== EDIT THESE MESSAGES =====
const MESSAGES = [
  "Cash on delivery available",
  "Order easily on WhatsApp",
  "New unstitched arrivals every week",
];
// ===============================

const svg = (children) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const Icon = {
  menu: svg(<path d="M4 7h16M4 12h10M4 17h16" />),
  search: svg(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>),
  close: svg(<path d="M6 6l12 12M18 6L6 18" />),
  heart: svg(<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />),
  cart: svg(<><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h3l2.6 12.2a2 2 0 002 1.6h8.2a2 2 0 002-1.5L21.5 7H6" /></>),
};

export default function Header({ s, count, onMenu, onCart, search, setSearch, links, active, hideSearch }) {
  const [i, setI] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [box, setBox] = useState(false);
  const wishCount = useWishlist().length;

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % MESSAGES.length), 3500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 10);
    f();
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);

  const onSearch = (e) => {
    setSearch(e.target.value);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };
  const toggleSearch = () => { if (box) setSearch(""); setBox(!box); };

  return (
    <header className={"hdr" + (scrolled ? " scrolled" : "")}>
      <div className="hdr-announce"><span key={i} className="hdr-msg">{MESSAGES[i]}</span></div>

      <div className="hdr-main">
        <button className="hdr-btn hdr-menu" onClick={onMenu} aria-label="Open menu">
          {Icon.menu}<span className="d-none d-md-inline">Menu</span>
        </button>
        <a href="#/" className="hdr-logo"><img src={logo} alt={s.name} /></a>
        <div className="hdr-actions">
          {!hideSearch && (
            <button className="hdr-btn" onClick={toggleSearch} aria-label="Search">{box ? Icon.close : Icon.search}</button>
          )}
          <a href="#/wishlist" className="hdr-btn" aria-label="Wishlist" title="Wishlist">
            {Icon.heart}{wishCount > 0 && <span className="hdr-count">{wishCount}</span>}
          </a>
          <button className="hdr-btn" onClick={onCart} aria-label="Cart">
            {Icon.cart}{count > 0 && <span className="hdr-count">{count}</span>}
          </button>
        </div>
      </div>

      <nav className="hdr-links d-none d-lg-flex">
        {links.map((l) => (
          <button key={l.key} className={active === l.key ? "on" : ""} onClick={l.onClick}>
            {l.label}{l.badge && <span className="hdr-live">{l.badge}</span>}
          </button>
        ))}
      </nav>

      {box && !hideSearch && (
        <div className="hdr-search">
          <input autoFocus placeholder="Search suits..." value={search} onChange={onSearch} />
        </div>
      )}
    </header>
  );
}