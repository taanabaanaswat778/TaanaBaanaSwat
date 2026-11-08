// ===== EDIT: the categories shown in the dropdown =====
// Names must match the store (see utils.js) so each product lands on the right menu page.
export const CATEGORY_GROUPS = [
  ["Summer fabrics", ["Lawn", "Cotton", "Linen"]],
  ["Winter fabrics", ["Karandi", "Khaddar", "Velvet"]],
  ["Fancy / Festive", ["Fancy", "Chiffon", "Silk", "Organza", "Formal", "Wedding", "Party"]],
];
// ======================================================

export const PRESETS = CATEGORY_GROUPS.flatMap(([, list]) => list);

// "  lawn   suit " -> "Lawn Suit"
export const titleCase = (s) =>
  String(s || "")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
