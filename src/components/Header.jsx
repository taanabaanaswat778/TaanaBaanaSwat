import { useEffect, useState } from "react";
import { useWishlist } from "../wishlist";
import BrandLogo from "./BrandLogo";

const MESSAGES = [
  "Cash on delivery available",
  "Order easily on WhatsApp",
  "New unstitched arrivals every week",
];

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
    <header className={`sticky -top-8 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 transition-shadow duration-300 ${scrolled ? "shadow-md" : ""}`}>
      
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-[#111] via-[#3a2a22] to-[#111] text-[#f5e6d3] text-center text-[11px] tracking-widest uppercase h-8 leading-8 overflow-hidden">
        <span key={i} className="inline-block animate-fade-in">{MESSAGES[i]}</span>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 grid grid-cols-[1fr_auto_1fr] items-center">
        
        {/* Menu Button */}
        <button className="justify-self-start inline-flex items-center gap-2 p-2 rounded-full text-[13px] font-semibold tracking-wider uppercase transition-colors hover:bg-brand-light hover:text-brand" onClick={onMenu} aria-label="Open menu">
          {Icon.menu}
          <span className="hidden md:inline">Menu</span>
        </button>
        
        {/* Brand Logo */}
        <a href="#/" className="justify-self-center flex justify-center px-4">
          <BrandLogo color="#111" subColor="#8a2c2c" size="2.2rem" />
        </a>

        {/* Action Icons */}
        <div className="justify-self-end flex gap-1">
          {!hideSearch && (
            <button className="inline-flex items-center p-2 rounded-full transition-colors hover:bg-brand-light hover:text-brand" onClick={toggleSearch} aria-label="Search">
              {box ? Icon.close : Icon.search}
            </button>
          )}
          <a href="#/wishlist" className="relative inline-flex items-center p-2 rounded-full transition-colors hover:bg-brand-light hover:text-brand" aria-label="Wishlist">
            {Icon.heart}
            {wishCount > 0 && <span className="absolute top-0 right-0 min-w-[18px] h-[18px] rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center px-1">{wishCount}</span>}
          </a>
          <button className="relative inline-flex items-center p-2 rounded-full transition-colors hover:bg-brand-light hover:text-brand" onClick={onCart} aria-label="Cart">
            {Icon.cart}
            {count > 0 && <span className="absolute top-0 right-0 min-w-[18px] h-[18px] rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center px-1">{count}</span>}
          </button>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden lg:flex justify-center flex-wrap gap-x-6 gap-y-1.5 px-5 pb-2.5">
        {links.map((l) => (
          <button 
            key={l.key} 
            className={`text-[12px] font-semibold tracking-widest uppercase pb-1 border-b-2 transition-colors ${active === l.key ? "text-brand border-brand" : "text-[#333] border-transparent hover:text-brand hover:border-brand"}`} 
            onClick={l.onClick}
          >
            {l.label}
            {l.badge && <span className="ml-1.5 bg-brand text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{l.badge}</span>}
          </button>
        ))}
      </nav>

      {/* Search Input */}
      {box && !hideSearch && (
        <div className="px-5 pb-3 max-w-2xl mx-auto animate-slide-down">
          <input 
            autoFocus 
            placeholder="Search suits..." 
            value={search} 
            onChange={onSearch} 
            className="w-full border border-gray-300 rounded-full px-5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
          />
        </div>
      )}
    </header>
  );
}