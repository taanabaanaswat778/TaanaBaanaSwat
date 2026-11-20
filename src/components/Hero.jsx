import { useEffect, useRef, useState } from "react";
import { eff, inCollection } from "../utils";

const INTERVAL = 6000;          
const PAUSE_ON_HOVER = false;   

export function Hero({ s, products = [] }) {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const touch = useRef(null);
  const paused = PAUSE_ON_HOVER && hover;

  const safeProducts = Array.isArray(products) ? products : [];
  
  const maxOff = safeProducts.reduce(
    (m, p) => (eff(p) < p.price ? Math.max(m, Math.round(100 - (eff(p) / p.price) * 100)) : m),
    0
  );

  const base = [
    { filter: "Summer", tag: "Collection", title: "Summer Collection", sub: "Light lawn and cotton suits for the season", img: "hero_summer", c: ["#f6b44a", "#e0702b"] },
    { filter: "Winter", tag: "Collection", title: "Winter Collection", sub: "Warm khaddar and embroidered suits", img: "hero_winter", c: ["#5b6c8f", "#2b3558"] },
    { filter: "New", tag: "Just in", title: "New Arrivals", sub: "Fresh unstitched designs just landed", img: "hero_new", c: ["#b5545e", "#6d2733"] },
    { filter: "Sale", tag: "Limited time", title: "End of Season Sale", sub: maxOff ? `Up to ${maxOff}% off on selected suits` : "Grab our best deals", img: "hero_sale", c: ["#2e2e2e", "#8a2c2c"] },
  ];
  
  const slides = base.map((sl) => ({
    ...sl,
    bgImg: s[sl.img],
    photo: (safeProducts.find((p) => inCollection(p, sl.filter) && p.img) || {}).img,
  }));

  const n = slides.length;

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), INTERVAL);
    return () => clearTimeout(t);
  }, [i, paused, n]);

  const go = (k) => setI((k + n) % n);

  return (
    <section
      className="relative overflow-hidden bg-[#f5f2ec]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1);
        touch.current = null;
      }}
    >
      <div className="flex transition-transform duration-700 ease-[cubic-bezier(.65,0,.35,1)]" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((sl) => (
          <a
            key={sl.filter}
            href={`#/c/${encodeURIComponent(sl.filter)}`}
            className="flex-none w-full min-h-[350px] md:min-h-[500px] flex items-center text-white bg-cover bg-center no-underline"
            style={{
              backgroundImage: sl.bgImg
                ? `linear-gradient(90deg, rgba(0,0,0,.6), rgba(0,0,0,.15)), url(${sl.bgImg})`
                : `linear-gradient(135deg, ${sl.c[0]}, ${sl.c[1]})`, 
            }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-5 py-10 px-4 w-full text-center md:text-left max-w-7xl mx-auto">
              <div className="max-w-lg mx-auto md:mx-0">
                <span className="inline-block text-[11px] tracking-widest uppercase bg-white/20 border border-white/40 px-3 py-1 rounded-full mb-4">{sl.tag}</span>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-3 drop-shadow-md">{sl.title}</h1>
                <p className="text-sm md:text-base opacity-90 mb-6">{sl.sub}</p>
                <span className="inline-block bg-white text-[#111] px-7 py-3 rounded-full font-bold text-[12px] tracking-widest uppercase hover:bg-[#111] hover:text-white transition-colors">Shop Now →</span>
              </div>
              {sl.photo && (
                <div className="hidden md:block flex-none w-64 aspect-[3/4] rounded-2xl overflow-hidden border-4 border-white/90 shadow-2xl transform rotate-2">
                  <img src={sl.photo} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </a>
        ))}
      </div>

      <button className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-4 w-10 h-10 rounded-full bg-white/90 text-[#111] text-2xl items-center justify-center z-10 hover:bg-white" onClick={(e) => { e.preventDefault(); go(i - 1); }} aria-label="Previous slide">‹</button>
      <button className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-4 w-10 h-10 rounded-full bg-white/90 text-[#111] text-2xl items-center justify-center z-10 hover:bg-white" onClick={(e) => { e.preventDefault(); go(i + 1); }} aria-label="Next slide">›</button>

      <div className="absolute left-0 right-0 bottom-4 flex justify-center gap-2 z-10">
        {slides.map((sl, k) => (
          <button key={sl.filter} className={`h-2 rounded-full transition-all cursor-pointer ${k === i ? "w-6 bg-white" : "w-2 bg-white/50"}`} onClick={() => go(k)} aria-label={`Go to ${sl.title}`} />
        ))}
      </div>
    </section>
  );
}

export function TrustStrip() {
  const items = [["💵", "Cash on Delivery"], ["💬", "Order via WhatsApp"], ["👗", "Unstitched Collection"]];
  return (
    <div className="bg-[#f5f2ec] py-3 border-y border-[#eeeeee]">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center md:justify-around gap-4">
        {items.map(([ic, t]) => <span key={t} className="flex items-center gap-2 text-[12px] font-semibold">{ic} {t}</span>)}
      </div>
    </div>
  );
}