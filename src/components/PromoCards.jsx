import { useState, useEffect } from "react";
import { eff, inCollection } from "../utils";
import { PiArrowRight } from "react-icons/pi";

/* ------------------------------------------------------------------ */
/* Single promo card — fully self-contained, no Bootstrap grid needed  */
/* ------------------------------------------------------------------ */
const PromoCardItem = ({ filter, title, sub, images, onPick }) => {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images]);

  return (
    <button
      type="button"
      onClick={() => onPick(filter)}
      className="group relative block w-full max-w-[420px] mx-auto aspect-[3/4] overflow-hidden rounded-2xl bg-[#e9d5c0] text-left cursor-pointer"
      aria-label={`${title} — shop now`}
    >
      {/* Cross-fading background images */}
      {images?.length
        ? images.map((img, k) => (
            <div
              key={k}
              className={
                "absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out " +
                (k === i ? "opacity-100 scale-105" : "opacity-0 scale-100")
              }
              style={{ backgroundImage: `url(${img})` }}
            />
          ))
        : null}

      {/* Dark gradient overlay so text stays readable on any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {/* Text content */}
      <div className="relative z-10 flex h-full w-full flex-col justify-end p-5 text-white">
        <h4 className="mb-1 text-lg font-extrabold leading-tight md:text-xl">{title}</h4>
        <p className="mb-4 text-xs opacity-90">{sub}</p>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase text-ink transition-transform group-hover:translate-x-0.5">
          Shop Now <PiArrowRight />
        </span>
      </div>

      {/* Dot indicators (only if more than one image) */}
      {images?.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5">
          {images.map((_, k) => (
            <span
              key={k}
              className={
                "h-1.5 rounded-full transition-all " +
                (k === i ? "w-4 bg-white" : "w-1.5 bg-white/50")
              }
            />
          ))}
        </div>
      )}
    </button>
  );
};

/* ------------------------------------------------------------------ */
/* Skeleton loader shown while products are still loading              */
/* ------------------------------------------------------------------ */
const PromoSkeleton = () => (
  <div className="mx-auto max-w-7xl px-4 py-4">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
      {[1, 2, 3, 4].map((k) => (
        <div
          key={k}
          className="aspect-[3/4] w-full max-w-[420px] mx-auto animate-pulse rounded-2xl bg-gray-200"
        />
      ))}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
export default function PromoCards({ products = [], onPick }) {
  if (!Array.isArray(products) || !products.length) {
    return <PromoSkeleton />;
  }

  /* Highest discount % available inside a given collection */
  const getMaxOff = (filter) => {
    const items = products.filter((p) => inCollection(p, filter) && eff(p) < p.price);
    return items.reduce(
      (m, p) => Math.max(m, Math.round(100 - (eff(p) / p.price) * 100)),
      0
    );
  };

  /* Up to 4 product images to cycle through for a collection */
  const getImages = (filter) =>
    products
      .filter((p) => inCollection(p, filter) && p.img)
      .slice(0, 4)
      .map((p) => p.img);

  const allCards = [
    {
      filter: "Sale",
      title: "End of Season Sale",
      sub: getMaxOff("Sale") ? `Up to ${getMaxOff("Sale")}% off` : "Shop our best deals",
    },
    {
      filter: "New",
      title: "New Arrivals",
      sub: getMaxOff("New") ? `Up to ${getMaxOff("New")}% off` : "Fresh designs just landed",
    },
    {
      filter: "Karandi",
      title: "Karandi Collection",
      sub: getMaxOff("Karandi") ? `Up to ${getMaxOff("Karandi")}% off` : "Warm, textured suits",
    },
    {
      filter: "Fancy",
      title: "Fancy Collection",
      sub: getMaxOff("Fancy") ? `Up to ${getMaxOff("Fancy")}% off` : "Chiffon & organza for events",
    },
  ];

  /* Keep only collections that actually have products */
  const cards = allCards
    .filter((c) => products.some((p) => inCollection(p, c.filter)))
    .map((c) => ({ ...c, images: getImages(c.filter) }));

  if (!cards.length) return null;

  /* Responsive column count based on how many cards we actually have */
  const lgCols =
    cards.length >= 4 ? "lg:grid-cols-4"
    : cards.length === 3 ? "lg:grid-cols-3"
    : cards.length === 2 ? "lg:grid-cols-2"
    : "lg:grid-cols-1";

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 ${lgCols}`}>
        {cards.map((c) => (
          <PromoCardItem key={c.title} {...c} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}