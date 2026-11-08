import { useSyncExternalStore } from "react";

const KEY = "wishlist";
let list = (() => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } })();
const subs = new Set();

// Shows a temporary message at the bottom of the screen (see Toaster.jsx)
// action is optional, for example { label: "View wishlist", href: "#/wishlist" }
export const toast = (msg, action) => window.dispatchEvent(new CustomEvent("app-toast", { detail: { msg, action } }));

export function toggleWishlist(id) {
  const has = list.includes(id);
  list = has ? list.filter((x) => x !== id) : [...list, id];
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
  subs.forEach((f) => f());
  if (has) toast("Removed from wishlist");
  else toast("Added to wishlist ♥", { label: "View wishlist", href: "#/wishlist" });
}

export const useWishlist = () =>
  useSyncExternalStore(
    (cb) => { subs.add(cb); return () => subs.delete(cb); },
    () => list
  );