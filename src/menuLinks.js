// ===== EDIT: the links shown in the header and the ☰ menu =====
// key must match a collection name (see utils.js). label is the text customers see.
export const MENU = [
  { key: "Sale", label: "End of Season Sale", badge: "LIVE" },
  { key: "New", label: "New Arrivals" },
  { key: "Lawn", label: "Lawn" },
  { key: "Karandi", label: "Karandi" },
  { key: "Fancy", label: "Fancy" },
  { key: "All", label: "View All" },
];
// ==============================================================

export function buildMenu(products, go) {
  return MENU.map((m) => ({ ...m, onClick: () => go(m.key) }));
}