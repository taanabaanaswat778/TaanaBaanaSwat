export const DEFAULTS = {
  name: "Taana Baana",
  tagline: "Unstitched Collection for Women",
  wa: "",
  cur: "Rs.",
  banner: "",
  hero_summer: "",
  hero_winter: "",
  hero_new: "",
  hero_sale: "",
};

const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time

// Is the sale price active right now (inside the start/end dates)?
export const saleActive = (p) =>
  p.sale > 0 && p.sale < p.price &&
  (!p.saleStart || p.saleStart <= today()) &&
  (!p.saleEnd || p.saleEnd >= today());

export const eff = (p) => (saleActive(p) ? p.sale : p.price);
export const money = (s, n) => `${s.cur} ${Number(n).toLocaleString()}`;
export const shortDate = (d) => new Date(d + "T00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" });

// ===== EDIT: which categories belong to which collection (use lowercase) =====
const SUMMER = ["summer", "lawn", "cotton", "linen"];
const WINTER = ["winter", "khaddar", "karandi", "velvet"];
const FANCY = ["fancy", "chiffon", "silk", "organza", "formal", "wedding", "party"];
// ==============================================================================

// Which products belong to a collection (used by the menu, slides and collection pages)
export const inCollection = (p, f) => {
  const cat = (p.cat || "").toLowerCase();
  if (f === "All") return true;
  if (f === "Sale") return eff(p) < p.price;
  if (f === "New") return !!p.isNew;
  if (f === "Summer") return SUMMER.includes(cat);
  if (f === "Winter") return WINTER.includes(cat);
  if (f === "Fancy") return FANCY.includes(cat);
  return cat === String(f).toLowerCase();
};

// Title of a collection
export const collectionName = (f) =>
  ({
    New: "New Arrivals",
    Sale: "End of Season Sale",
    Summer: "Summer Collection",
    Winter: "Winter Collection",
    Fancy: "Fancy Collection",
  }[f] || f);

// Shrinks an uploaded photo so it saves quickly
export function resize(file, max = 700, q = 0.78) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => {
      const i = new Image();
      i.onload = () => {
        const k = Math.min(1, max / Math.max(i.width, i.height)), c = document.createElement("canvas");
        c.width = i.width * k; c.height = i.height * k;
        c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", q));
      };
      i.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

// ===== EDIT: delivery charge =====
export const SHIPPING = { fee: 250, freeAbove: 5000 };
export const shippingFor = (subtotal) => (subtotal <= 0 || subtotal >= SHIPPING.freeAbove ? 0 : SHIPPING.fee);
// ===== Stock helpers (quantity left) =====
export const stockLeft = (p) => (p.qty === undefined || p.qty === null || p.qty === "" ? null : Number(p.qty));
export const inStock = (p) => !!p.stock && (stockLeft(p) === null || stockLeft(p) > 0);
export const remainText = (p) => { const n = stockLeft(p); return n !== null && n > 0 ? `${n} quantity remains` : ""; };
// ===== WhatsApp requests =====
export const FALLBACK_WA = "923091812140"; // used if no WhatsApp number is saved in Admin > Settings
export const waUrl = (s, text) => `https://wa.me/${String(s.wa || FALLBACK_WA).replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
export const productLink = (p) => `${window.location.origin}${window.location.pathname}#/product/${p.id}`;