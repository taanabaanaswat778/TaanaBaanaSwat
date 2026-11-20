const home = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" />
  </svg>
);
const arrow = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" /><path d="M11 6l-6 6 6 6" />
  </svg>
);

export function Breadcrumb({ items }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={i} className="flex items-center">
          {i > 0 && <span className="mx-2 text-gray-300">/</span>}
          {it.href ? (
            <a href={it.href} className="flex items-center gap-1.5 hover:text-brand transition-colors">
              {i === 0 && home}
              {it.label}
            </a>
          ) : (
            <span className="text-black font-semibold truncate max-w-[200px]" title={it.label}>{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function BackHome({ label = "Back to Home" }) {
  return (
    <a href="#/" className="inline-flex items-center gap-2 border border-gray-300 rounded-full bg-white px-4 py-2 text-xs font-semibold tracking-wider uppercase text-black hover:bg-black hover:text-white hover:border-black transition-colors">
      {arrow}<span>{label}</span>
    </a>
  );
}