import { useEffect, useState } from "react";
import { subProducts, subSettings } from "./data";
import { DEFAULTS, stockLeft } from "./utils";
import { toast } from "./wishlist";

export function useProducts() {
  const [list, setList] = useState([]);
  useEffect(() => subProducts(setList), []);
  return list;
}

export function useSettings() {
  const [s, setS] = useState(DEFAULTS);
  useEffect(() => subSettings((d) => setS({ ...DEFAULTS, ...(d || {}) })), []);
  return s;
}

// Shared cart (saved in the browser, so it works on every page)
export function useCart(products) {
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; } });
  const [open, setOpen] = useState(false);
  useEffect(() => { try { localStorage.setItem("cart", JSON.stringify(cart)); } catch {} }, [cart]);

  const items = cart.map((c) => ({ p: products.find((x) => x.id === c.id), q: c.q })).filter((x) => x.p);
  const count = cart.reduce((a, c) => a + c.q, 0);

  // how many of this product can be bought (Infinity = no limit set)
  const capOf = (id) => {
    const p = products.find((x) => x.id === id);
    const n = p ? stockLeft(p) : null;
    return n === null ? Infinity : n;
  };
  const haveOf = (id) => (cart.find((x) => x.id === id) || { q: 0 }).q;

  const add = (id, n = 1) => {
    const cap = capOf(id);
    const have = haveOf(id);
    if (have >= cap) { toast(`Only ${cap} available`); return false; }
    const next = Math.min(have + n, cap);
    setCart((c) => (c.find((x) => x.id === id) ? c.map((x) => (x.id === id ? { ...x, q: next } : x)) : [...c, { id, q: next }]));
    toast(next < have + n ? `Only ${cap} available` : "Added to cart");
    return true;
  };
  const buy = (id, n = 1) => {
    const cap = capOf(id);
    if (cap < 1) { toast("Out of stock"); return; }
    setCart([{ id, q: Math.min(n, cap) }]);
    setOpen(true);
  };
  const qty = (id, d) => {
    if (d > 0 && haveOf(id) + d > capOf(id)) { toast(`Only ${capOf(id)} available`); return; }
    setCart((c) => c.map((x) => (x.id === id ? { ...x, q: x.q + d } : x)).filter((x) => x.q > 0));
  };
  const remove = (id) => setCart((c) => c.filter((x) => x.id !== id));
  const clear = () => setCart([]);
  return { items, count, add, buy, qty, remove, clear, open, setOpen };
}