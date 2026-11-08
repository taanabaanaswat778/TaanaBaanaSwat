import { useMemo, useState } from "react";
import { updatePrices } from "../db";
import { money, friendly } from "../utils";

const ACTIONS = [
  ["inc%", "Increase prices by %"],
  ["dec%", "Decrease prices by %"],
  ["inc", "Increase prices by amount (Rs.)"],
  ["dec", "Decrease prices by amount (Rs.)"],
  ["sale%", "Put on sale: % off"],
  ["nosale", "Remove sale"],
];
const ROUND = [[1, "Nearest Rs. 1"], [10, "Nearest Rs. 10"], [50, "Nearest Rs. 50"], [100, "Nearest Rs. 100"]];
const catOf = (p) => p.cat || "Uncategorised";

// Works out the new price / sale price of one product
function calc(p, action, v, step, dates) {
  const rnd = (n) => Math.max(1, step > 1 ? Math.round(n / step) * step : Math.round(n));
  let price = p.price, sale = p.sale || 0, saleStart = p.saleStart || "", saleEnd = p.saleEnd || "";
  if (action === "inc%" || action === "dec%") {
    const k = 1 + ((action === "inc%" ? 1 : -1) * v) / 100;
    price = rnd(price * k); if (sale) sale = rnd(sale * k);
  } else if (action === "inc" || action === "dec") {
    const d = (action === "inc" ? 1 : -1) * v;
    price = Math.max(1, price + d); if (sale) sale = Math.max(1, sale + d);
  } else if (action === "sale%") {
    sale = rnd(price * (1 - v / 100)); saleStart = dates.start; saleEnd = dates.end;
  } else if (action === "nosale") {
    sale = 0; saleStart = ""; saleEnd = "";
  }
  if (sale >= price) { sale = 0; saleStart = ""; saleEnd = ""; }
  return { price, sale, saleStart, saleEnd };
}

// ---------- Update specific products (by code or name) ----------
function findMatches(products, token) {
  const t = token.toLowerCase();
  const byCode = products.filter((p) => (p.code || "").toLowerCase() === t);
  if (byCode.length) return byCode;
  const byName = products.filter((p) => (p.name || "").toLowerCase() === t);
  if (byName.length) return byName;
  return products.filter((p) => (p.name || "").toLowerCase().includes(t) || (p.code || "").toLowerCase().includes(t));
}

function SelectedPrices({ products }) {
  const [text, setText] = useState("");
  const [action, setAction] = useState("inc%");
  const [val, setVal] = useState("");
  const [step, setStep] = useState(10);
  const [off, setOff] = useState(new Set()); // products the admin un-ticked
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  // split on new lines, commas or semicolons, drop blanks and repeats
  const tokens = useMemo(() => {
    const seen = new Set();
    return text.split(/[\n,;]+/).map((x) => x.trim()).filter((x) => {
      const k = x.toLowerCase();
      if (!x || seen.has(k)) return false;
      seen.add(k); return true;
    });
  }, [text]);

  const found = useMemo(() => tokens.map((t) => ({ t, list: findMatches(products, t) })), [tokens, products]);
  const matched = useMemo(() => {
    const seen = new Set(), out = [];
    found.forEach(({ list }) => list.forEach((p) => { if (!seen.has(p.id)) { seen.add(p.id); out.push(p); } }));
    return out;
  }, [found]);
  const picked = matched.filter((p) => !off.has(p.id));

  const v = +val;
  const max = action === "inc%" ? 300 : 90;
  const valid = v > 0 && v <= max;
  const rows = picked.map((p) => ({ p, n: valid ? calc(p, action, v, step, { start: "", end: "" }) : null }));
  const changes = rows.filter(({ p, n }) => n && (n.price !== p.price || n.sale !== (p.sale || 0)));

  const toggle = (id) => setOff((o) => { const x = new Set(o); x.has(id) ? x.delete(id) : x.add(id); return x; });
  const allOn = matched.length > 0 && matched.every((p) => !off.has(p.id));
  const toggleAll = () => setOff(allOn ? new Set(matched.map((p) => p.id)) : new Set());

  async function apply() {
    if (!changes.length) return;
    if (!window.confirm(`Change the price of ${changes.length} product(s) by ${action === "inc%" ? "+" : "-"}${v}%? Customers will see the new prices straight away.`)) return;
    setBusy(true); setMsg(null);
    try {
      await updatePrices(changes.map(({ p, n }) => ({ id: p.id, ...n })));
      setMsg({ ok: true, t: `Done. ${changes.length} product(s) updated on your website.` });
      setText(""); setVal(""); setOff(new Set());
    } catch (e) { setMsg({ ok: false, t: friendly(e) }); }
    setBusy(false);
  }

  return (
    <div className="card">
      <div className="card-h"><h3>Update specific products by code or name</h3></div>
      <label>Product codes or names
        <textarea
          rows={4}
          placeholder={"Type or paste several, one per line or separated by commas.\nExample:\nC4036A, C4037B\nEmbroidered Lawn Suit"}
          value={text}
          onChange={(e) => { setText(e.target.value); setOff(new Set()); }}
        />
      </label>

      {found.length > 0 && (
        <div>
          {found.map(({ t, list }) => {
            const exact = list.length > 0 && list.every((p) => (p.code || "").toLowerCase() === t.toLowerCase() || (p.name || "").toLowerCase() === t.toLowerCase());
            return (
              <span key={t} className={"tok " + (!list.length ? "none" : exact ? "ok" : "part")}>
                {t} → {!list.length ? "not found" : exact ? `${list.length} product${list.length > 1 ? "s" : ""}` : `${list.length} partial match${list.length > 1 ? "es" : ""}`}
              </span>
            );
          })}
          {found.some(({ list }) => list.length > 1) && <div className="hint">A name that matches several products selects all of them. Un-tick any you do not want in the table below.</div>}
        </div>
      )}

      <div className="grid4">
        <label>What to do
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="inc%">Increase price by %</option>
            <option value="dec%">Decrease price by %</option>
          </select>
        </label>
        <label>Percent (%)
          <input type="number" min="1" value={val} onChange={(e) => setVal(e.target.value)} placeholder="e.g. 10" />
        </label>
        <label>Round to
          <select value={step} onChange={(e) => setStep(+e.target.value)}>{ROUND.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
        </label>
      </div>
      {val && !valid && <div className="msg bad">Enter a percent above 0{`, up to ${max}%`}.</div>}
      {msg && <div className={"msg " + (msg.ok ? "ok" : "bad")}>{msg.t}</div>}

      <h4 className="sub">Selected products ({picked.length} of {matched.length})</h4>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" className="ck" checked={allOn} onChange={toggleAll} aria-label="Select all" /></th>
              <th>Product</th><th>Code</th><th>Price now</th><th>New price</th><th>Sale now</th><th>New sale</th>
            </tr>
          </thead>
          <tbody>
            {matched.map((p) => {
              const on = !off.has(p.id);
              const n = on && valid ? calc(p, action, v, step, { start: "", end: "" }) : null;
              return (
                <tr key={p.id} style={on ? undefined : { opacity: 0.45 }}>
                  <td><input type="checkbox" className="ck" checked={on} onChange={() => toggle(p.id)} /></td>
                  <td>{p.name}<br /><small>{p.cat}</small></td>
                  <td>{p.code ? <span className="code">{p.code}</span> : "—"}</td>
                  <td>{money(p.price)}</td>
                  <td className={n && n.price !== p.price ? "chg" : ""}>{n ? money(n.price) : "—"}</td>
                  <td>{p.sale ? money(p.sale) : "—"}</td>
                  <td className={n && n.sale !== (p.sale || 0) ? "chg" : ""}>{n ? (n.sale ? money(n.sale) : "—") : "—"}</td>
                </tr>
              );
            })}
            {!matched.length && <tr><td colSpan={7} className="empty">{tokens.length ? "No products match what you typed." : "Type product codes or names above to select products."}</td></tr>}
          </tbody>
        </table>
      </div>
      <button className="btn" disabled={busy || !changes.length} onClick={apply}>
        {busy ? "Updating…" : `Apply to ${changes.length} product${changes.length === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}

export default function Prices({ products }) {
  const [cat, setCat] = useState("__all");
  const [action, setAction] = useState("inc%");
  const [val, setVal] = useState("");
  const [step, setStep] = useState(10);
  const [dates, setDates] = useState({ start: "", end: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const cats = useMemo(() => {
    const m = {};
    products.forEach((p) => {
      const c = catOf(p);
      const r = (m[c] ||= { name: c, n: 0, min: Infinity, max: 0, sale: 0 });
      r.n++; r.min = Math.min(r.min, p.price); r.max = Math.max(r.max, p.price);
      if (p.sale > 0 && p.sale < p.price) r.sale++;
    });
    return Object.values(m).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const v = +val;
  const isPct = action.endsWith("%");
  const needVal = action !== "nosale";
  const valid = !needVal || (v > 0 && (!isPct || v <= 90));

  const rows = useMemo(() => {
    if (!valid) return [];
    return products
      .filter((p) => cat === "__all" || catOf(p) === cat)
      .map((p) => ({ p, n: calc(p, action, v, step, dates) }))
      .filter(({ p, n }) => n.price !== p.price || n.sale !== (p.sale || 0) || n.saleStart !== (p.saleStart || "") || n.saleEnd !== (p.saleEnd || ""));
  }, [products, cat, action, v, step, dates, valid]);

  async function apply() {
    if (!rows.length) return;
    const where = cat === "__all" ? "all categories" : cat;
    if (!window.confirm(`Update ${rows.length} product(s) in ${where}? Customers will see the new prices straight away.`)) return;
    setBusy(true); setMsg(null);
    try {
      await updatePrices(rows.map(({ p, n }) => ({ id: p.id, ...n })));
      setMsg({ ok: true, t: `Done. ${rows.length} product(s) updated on your website.` });
      setVal("");
    } catch (e) { setMsg({ ok: false, t: friendly(e) }); }
    setBusy(false);
  }

  return (
    <>
      <div className="card">
        <div className="card-h"><h3>Categories</h3></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Category</th><th>Products</th><th>Price range</th><th>On sale</th><th></th></tr></thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.name}>
                  <td><b>{c.name}</b></td>
                  <td>{c.n}</td>
                  <td>{c.min === c.max ? money(c.min) : `${money(c.min)} - ${money(c.max)}`}</td>
                  <td>{c.sale}</td>
                  <td><button className="mini" onClick={() => { setCat(c.name); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }}>Update prices</button></td>
                </tr>
              ))}
              {!cats.length && <tr><td colSpan={5} className="empty">No products yet. Upload some first.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3>Change prices for a category</h3></div>
        <div className="grid4">
          <label>Category
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="__all">All categories</option>
              {cats.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.n})</option>)}
            </select>
          </label>
          <label>What to do
            <select value={action} onChange={(e) => setAction(e.target.value)}>
              {ACTIONS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
            </select>
          </label>
          {needVal && (
            <label>{isPct ? "Percent (%)" : "Amount (Rs.)"}
              <input type="number" min="1" value={val} onChange={(e) => setVal(e.target.value)} placeholder={isPct ? "e.g. 10" : "e.g. 500"} />
            </label>
          )}
          {action !== "nosale" && (
            <label>Round to
              <select value={step} onChange={(e) => setStep(+e.target.value)}>{ROUND.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
            </label>
          )}
          {action === "sale%" && (
            <>
              <label>Sale starts (optional)<input type="date" value={dates.start} onChange={(e) => setDates({ ...dates, start: e.target.value })} /></label>
              <label>Sale ends (optional)<input type="date" value={dates.end} onChange={(e) => setDates({ ...dates, end: e.target.value })} /></label>
            </>
          )}
        </div>
        {needVal && val && !valid && <div className="msg bad">Enter a number above 0{isPct ? " (maximum 90%)" : ""}.</div>}
        {msg && <div className={"msg " + (msg.ok ? "ok" : "bad")}>{msg.t}</div>}

        <h4 className="sub">Preview ({rows.length} product{rows.length === 1 ? "" : "s"} will change)</h4>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>Category</th><th>Price now</th><th>New price</th><th>Sale now</th><th>New sale</th></tr></thead>
            <tbody>
              {rows.map(({ p, n }) => (
                <tr key={p.id}>
                  <td>{p.name}</td><td>{catOf(p)}</td>
                  <td>{money(p.price)}</td>
                  <td className={n.price !== p.price ? "chg" : ""}>{money(n.price)}</td>
                  <td>{p.sale ? money(p.sale) : "—"}</td>
                  <td className={n.sale !== (p.sale || 0) ? "chg" : ""}>{n.sale ? money(n.sale) : "—"}</td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={6} className="empty">{valid && (val || !needVal) ? "Nothing would change." : "Choose a category and enter a value to see the preview."}</td></tr>}
            </tbody>
          </table>
        </div>
        <button className="btn" disabled={busy || !rows.length} onClick={apply}>
          {busy ? "Updating…" : `Apply to ${rows.length} product${rows.length === 1 ? "" : "s"}`}
        </button>
      </div>

      <SelectedPrices products={products} />
    </>
  );
}
