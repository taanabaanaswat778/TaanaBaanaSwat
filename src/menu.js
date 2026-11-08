// Menu items used by the store page and the product page
export function buildMenu(products, go) {
  const cats = [...new Set(products.map((p) => p.cat).filter(Boolean))];
  return [
    { key: "Sale", label: "End of Season Sale", badge: "LIVE", onClick: () => go("Sale") },
    { key: "New", label: "New Arrivals", onClick: () => go("New") },
    ...cats.map((c) => ({ key: c, label: c, onClick: () => go(c) })),
    { key: "All", label: "View All", onClick: () => go("All") },
  ];
}