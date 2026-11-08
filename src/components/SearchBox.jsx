import { useState, useRef, useEffect } from "react";
import { money } from "../utils";

// Search bar shown at the top of the admin: finds products by name, code or category
export default function SearchBox({ products, onPick }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(0);
  const box = useRef(null);

  useEffect(() => {
    const away = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  const term = q.trim().toLowerCase();
  const results = term
    ? products
        .filter((p) => [p.name, p.code, p.cat].join(" ").toLowerCase().includes(term))
        .slice(0, 8)
    : [];

  const pick = (p) => { onPick(p); setQ(""); setOpen(false); };
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setAt((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setAt((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && results[at]) { e.preventDefault(); pick(results[at]); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="sb" ref={box}>
      <input
        type="search"
        placeholder="🔍 Search a product by name or code…"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setAt(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
      />
      {open && term && (
        <div className="sb-res">
          {results.map((p, i) => {
            const n = p.qty === "" || p.qty == null ? null : Number(p.qty);
            return (
              <button key={p.id} type="button" className={"sb-row" + (i === at ? " on" : "")} onClick={() => pick(p)} onMouseEnter={() => setAt(i)}>
                {p.img ? <img src={p.img} alt="" /> : <span className="ph" />}
                <span className="sb-main">
                  <b>{p.name}</b>
                  <small>{p.code ? <span className="code">{p.code}</span> : null} {p.cat}</small>
                </span>
                <span className="sb-side">
                  {money(p.price)}
                  <small className={n === 0 ? "qty-out" : n !== null && n <= 3 ? "qty-low" : ""}>{n === null ? "" : n === 0 ? "Sold out" : `Qty ${n}`}</small>
                </span>
              </button>
            );
          })}
          {!results.length && <div className="sb-none">No product found for “{q}”.</div>}
        </div>
      )}
    </div>
  );
}
