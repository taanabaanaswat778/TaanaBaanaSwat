import { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import { eff, inCollection } from "../utils";

// ===== EDIT THESE =====
const INTERVAL = 6000;          // time per slide in milliseconds: 5000 = 5 seconds ... 10000 = 10 seconds
const PAUSE_ON_HOVER = false;   // set to true if you want it to pause while the mouse is over the slideshow
// ======================

export function Hero({ s, products = [] }) {
  const maxOff = products.reduce(
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
    photo: (products.find((p) => inCollection(p, sl.filter) && p.img) || {}).img,
  }));

  const n = slides.length;
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const touch = useRef(null);
  const paused = PAUSE_ON_HOVER && hover;

  // Automatic slide change. The timer restarts every time the slide changes (also after a manual click).
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), INTERVAL);
    return () => clearTimeout(t);
  }, [i, paused, n]);

  const go = (k) => setI((k + n) % n);

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