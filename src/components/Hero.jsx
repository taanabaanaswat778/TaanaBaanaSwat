import { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import { eff, inCollection } from "../utils";

// ===== EDIT THESE =====
const INTERVAL = 6000;          
const PAUSE_ON_HOVER = false;   
// ======================

export function Hero({ s, products = [], loading }) {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const touch = useRef(null);
  const timerRef = useRef(null);
  
  const paused = PAUSE_ON_HOVER && hover;
  const safeProducts = Array.isArray(products) ? products : [];
  const n = 4; // There are always 4 base slides

  // 1. Stable timer logic (MUST come before any returns)
  useEffect(() => {
    if (paused || loading) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    
    timerRef.current = setTimeout(() => {
      setI((prev) => (prev + 1) % n);
    }, INTERVAL);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [i, paused, n, loading]);

  const go = (k) => setI((k + n) % n);

  // 2. Skeleton Loader (Now placed AFTER all hooks)
  if (loading) {
    return (
      <section className="hs" style={{ background: "#f5f2ec" }}>
        <div className="hs-track" style={{ display: "flex", minHeight: "clamp(320px, 46vw, 540px)" }}>
          <div style={{ flex: 1, padding: "60px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ width: "120px", height: "24px", background: "#e8dccf", borderRadius: "99px", marginBottom: "20px" }}></div>
            <div style={{ width: "60%", height: "60px", background: "#e8dccf", borderRadius: "10px", marginBottom: "16px" }}></div>
            <div style={{ width: "40%", height: "24px", background: "#e8dccf", borderRadius: "10px", marginBottom: "30px" }}></div>
            <div style={{ width: "140px", height: "44px", background: "#e8dccf", borderRadius: "99px" }}></div>
          </div>
          <div style={{ width: "clamp(110px, 22vw, 270px)", height: "80%", background: "#e8dccf", borderRadius: "14px", margin: "auto 40px" }}></div>
        </div>
      </section>
    );
  }

  // 3. Real data rendering
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

  return (
    <section
      className="hs"
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
      <div className="hs-track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((sl) => (
          <a
            key={sl.filter}
            href={`#/c/${encodeURIComponent(sl.filter)}`}
            className="hs-slide"
            aria-label={`${sl.title} - shop now`}
            style={{
              backgroundImage: sl.bgImg
                ? `linear-gradient(90deg, rgba(0,0,0,.6), rgba(0,0,0,.15)), url(${sl.bgImg})`
                : `linear-gradient(135deg, ${sl.c[0]}, ${sl.c[1]})`,
            }}
          >
            <Container className="hs-inner">
              <div className="hs-text">
                <span className="hs-tag">{sl.tag}</span>
                <h1>{sl.title}</h1>
                <p>{sl.sub}</p>
                <span className="hs-btn">Shop Now →</span>
              </div>
              {sl.photo && (
                <div className="hs-photo"><img src={sl.photo} alt="" /></div>
              )}
            </Container>
          </a>
        ))}
      </div>

      <button className="hs-arrow l" onClick={() => go(i - 1)} aria-label="Previous slide">‹</button>
      <button className="hs-arrow r" onClick={() => go(i + 1)} aria-label="Next slide">›</button>

      <div className="hs-dots">
        {slides.map((sl, k) => (
          <button key={sl.filter} className={"hs-dot" + (k === i ? " on" : "")} onClick={() => go(k)} aria-label={`Go to ${sl.title}`} />
        ))}
      </div>

      <div
        key={i}
        className="hs-progress"
        style={{ animationDuration: `${INTERVAL}ms`, animationPlayState: paused ? "paused" : "running" }}
      />
    </section>
  );
}

export function TrustStrip() {
  const items = [["💵", "Cash on Delivery"], ["💬", "Order via WhatsApp"], ["👗", "Unstitched Collection"]];
  return (
    <div className="trust">
      <Container className="d-flex justify-content-around flex-wrap gap-2">
        {items.map(([ic, t]) => <span key={t} className="trust-item">{ic} {t}</span>)}
      </Container>
    </div>
  );
}