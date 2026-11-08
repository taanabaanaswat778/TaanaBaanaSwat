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

// Home / Category / Product
export function Breadcrumb({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={i} className="crumb">
          {i > 0 && <span className="crumb-sep">/</span>}
          {it.href ? (
            <a href={it.href}>{i === 0 && home}{it.label}</a>
          ) : (
            <span className="crumb-now" title={it.label}>{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// Rounded "Back to Home" button
export function BackHome({ label = "Back to Home" }) {
  return (
    <a href="#/" className="back-home" aria-label={label}>
      {arrow}<span>{label}</span>
    </a>
  );
}