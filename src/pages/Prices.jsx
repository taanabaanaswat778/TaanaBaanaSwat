import { useEffect, useMemo, useRef, useState } from "react";
import { updatePrices } from "../db";
import { money, friendly } from "../utils";
import { PiTag, PiListMagnifyingGlass, PiPercent, PiCalendarBlank, PiArrowRight, PiCheckCircle, PiWarningCircle } from "react-icons/pi";

const ACTIONS = [
  ["sale%", "Put on sale: % off"],
  ["saleRs", "Put on sale: Rs. off"],
  ["dates", "Change sale dates only (products already on sale)"],
  ["nosale", "Remove sale"],
  ["inc%", "Increase prices by %"],
  ["dec%", "Decrease prices by %"],
  ["inc", "Increase prices by amount (Rs.)"],
  ["dec", "Decrease prices by amount (Rs.)"],
];

const ROUND = [[1, "Nearest Rs. 1"], [10, "Nearest Rs. 10"], [50, "Nearest Rs. 50"], [100, "Nearest Rs. 100"]];

const DURATIONS = [
  ["none", "No end date (until I remove it)"],
  ["1", "1 day (today only)"],
  ["3", "3 days"],
  ["7", "1 week"],
  ["14", "2 weeks"],
  ["30", "1 month"],
  ["90", "3 months"],
  ["custom", "Pick my own dates"],
];

const STATE_LABEL = { active: "On sale", scheduled: "Scheduled", ended: "Ended" };
const catOf = (p) => p.cat || "Uncategorised";

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayStr = () => ymd(new Date());

const addDays = (s, n) => {
  const [y, m, d] = s.split("-").map(Number);
  return ymd(new Date(y, m - 1, d + n));
};

const fmtDate = (s) => {
  if (!s) return "";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export function saleState(p, today = todayStr()) {
  if (!(p.sale > 0 && p.sale < p.price)) return "none";
  if (p.saleEnd && p.saleEnd < today) return "ended";
  if (p.saleStart && p.saleStart > today) return "scheduled";
  return "active";
}

const span = (hasSale, start, end) => {
  if (!hasSale) return "—";
  if (start && end) return `${fmtDate(start)} → ${fmtDate(end)}`;
  if (start) return `From ${fmtDate(start)}, no end`;
  if (end) return `Until ${fmtDate(end)}`;
  return "No end date";
};

function datesFor(dur, custom) {
  if (dur === "none") return { start: "", end: "" };
  if (dur === "custom") return { start: custom.start, end: custom.end };
  const t = todayStr();
  return { start: t, end: addDays(t, Number(dur) - 1) };
}

function calc(p, action, v, step, dates) {
  const rnd = (n) => Math.max(1, step > 1 ? Math.round(n / step) * step : Math.round(n));
  let price = p.price, sale = p.sale || 0, saleStart = p.saleStart || "", saleEnd = p.saleEnd || "";

  if (action === "inc%" || action === "dec%") {
    const k = 1 + ((action === "inc%" ? 1 : -1) * v) / 100;
    price = rnd(price * k);
    if (sale) sale = rnd(sale * k);
  } else if (action === "inc" || action === "dec") {
    const d = (action === "inc" ? 1 : -1) * v;
    price = Math.max(1, price + d);
    if (sale) sale = Math.max(1, sale + d);
  } else if (action === "sale%") {
    sale = rnd(price * (1 - v / 100));
    saleStart = dates.start; saleEnd = dates.end;
  } else if (action === "saleRs") {
    sale = rnd(price - v);
    saleStart = dates.start; saleEnd = dates.end;
  } else if (action === "dates") {
    if (sale) { saleStart = dates.start; saleEnd = dates.end; }
  } else if (action === "nosale") {
    sale = 0; saleStart = ""; saleEnd = "";
  }

  if (sale >= price) { sale = 0; saleStart = ""; saleEnd = ""; }
  return { price, sale, saleStart, saleEnd };
}

const changed = (p, n) =>
  n.price !== p.price ||
  n.sale !== (p.sale || 0) ||
  n.saleStart !== (p.saleStart || "") ||
  n.saleEnd !== (p.saleEnd || "");

function findMatches(products, token) {
  const t = token.toLowerCase();
  const byCode = products.filter((p) => (p.code || "").toLowerCase() === t);
  if (byCode.length) return byCode;
  const byName = products.filter((p) => (p.name || "").toLowerCase() === t);
  if (byName.length) return byName;
  return products.filter((p) => (p.name || "").toLowerCase().includes(t) || (p.code || "").toLowerCase().includes(t));
}

export default function Prices({ products }) {
  const [text, setText] = useState("");
  const [addCats, setAddCats] = useState(new Set());
  const [action, setAction] = useState("sale%");
  const [val, setVal] = useState("");
  const [step, setStep] = useState(10);
  const [dur, setDur] = useState("none");
  const [custom, setCustom] = useState({ start: "", end: "" });
  const [off, setOff] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [cleanMsg, setCleanMsg] = useState(null);
  const [today, setToday] = useState(todayStr());
  const selectorRef = useRef(null);
  const tried = useRef(new Set());

  useEffect(() => {
    const t = setInterval(() => setToday(todayStr()), 60000);
    return () => clearInterval(t);
  }, []);

  const expired = useMemo(() => products.filter((p) => saleState(p, today) === "ended"), [products, today]);

  async function restore(list) {
    if (!list.length) return;
    list.forEach((p) => tried.current.add(p.id));
    try {
      await updatePrices(list.map((p) => ({ id: p.id, price: p.price, sale: 0, saleStart: "", saleEnd: "" })));
      setCleanMsg({ ok: true, t: `${list.length} product(s) whose sale ended are back to their original price.` });
    } catch (e) {
      list.forEach((p) => tried.current.delete(p.id));
      setCleanMsg({ ok: false, t: friendly(e), retry: true });
    }
  }

  useEffect(() => {
    const todo = expired.filter((p) => !tried.current.has(p.id));
    if (todo.length) restore(todo);
  }, [expired]);

  const cats = useMemo(() => {
    const m = {};
    products.forEach((p) => {
      const c = catOf(p);
      const r = (m[c] ||= { name: c, n: 0, min: Infinity, max: 0, sale: 0 });
      r.n++; r.min = Math.min(r.min, p.price); r.max = Math.max(r.max, p.price);
      if (saleState(p, today) === "active") r.sale++;
    });
    return Object.values(m).sort((a, b) => a.name.localeCompare(b.name));
  }, [products, today]);

  const toggleCat = (name) => {
    setAddCats((s) => { const x = new Set(s); x.has(name) ? x.delete(name) : x.add(name); return x; });
    setOff(new Set());
    selectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
    const add = (p) => { if (!seen.has(p.id)) { seen.add(p.id); out.push(p); } };
    found.forEach(({ list }) => list.forEach(add));
    products.filter((p) => addCats.has(catOf(p))).forEach(add);
    return out;
  }, [found, products, addCats]);

  const picked = matched.filter((p) => !off.has(p.id));
  const toggle = (id) => setOff((o) => { const x = new Set(o); x.has(id) ? x.delete(id) : x.add(id); return x; });
  const allOn = matched.length > 0 && matched.every((p) => !off.has(p.id));
  const toggleAll = () => setOff(allOn ? new Set(matched.map((p) => p.id)) : new Set());

  const v = +val;
  const isSale = action === "sale%" || action === "saleRs";
  const showDates = isSale || action === "dates";
  const needVal = action !== "nosale" && action !== "dates";
  const isPct = action.endsWith("%");
  const max = action === "inc%" ? 300 : isPct ? 90 : Infinity;
  const valOk = !needVal || (v > 0 && v <= max);

  const dates = useMemo(() => datesFor(dur, custom), [dur, custom, today]);
  const dateErr =
    !showDates || dur !== "custom"
      ? ""
      : dates.start && dates.end && dates.end < dates.start
      ? "The end date must be on or after the start date."
      : dates.end && dates.end < today
      ? "The end date is already in the past."
      : "";

  const valid = valOk && !dateErr;

  const rows = picked.map((p) => ({ p, n: valid ? calc(p, action, v, step, dates) : null }));
  const changes = rows.filter(({ p, n }) => n && changed(p, n));
  const actionLabel = (ACTIONS.find(([k]) => k === action) || [])[1] || "";

  async function apply() {
    if (!changes.length) return;
    const dateLine = showDates ? `\nSale period: ${span(true, dates.start, dates.end)}` : "";
    if (!window.confirm(`${actionLabel}\n${changes.length} product(s) will change.${dateLine}\n\nCustomers will see the new prices straight away. Continue?`)) return;
    setBusy(true); setMsg(null);
    try {
      await updatePrices(changes.map(({ p, n }) => ({ id: p.id, ...n })));
      setMsg({ ok: true, t: `Done. ${changes.length} product(s) updated on your website.` });
      setText(""); setVal(""); setOff(new Set()); setAddCats(new Set());
    } catch (e) { setMsg({ ok: false, t: friendly(e) }); }
    setBusy(false);
  }

  return (
    <div className="prices-page">
      {cleanMsg && (
        <div className={"msg " + (cleanMsg.ok ? "ok" : "bad")} style={{ marginBottom: 20 }}>
          {cleanMsg.t}{" "}
          {cleanMsg.retry && <button className="mini" onClick={() => { setCleanMsg(null); restore(expired); }}>Try again</button>}
        </div>
      )}

      {/* CATEGORIES CARD */}
      <div className="card" style={{ padding: 24 }}>
        <div className="card-h" style={{ borderBottom: "1px solid #eee", paddingBottom: 16, marginBottom: 16 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18 }}>
            <PiTag size={22} color="var(--ac)" /> Categories Overview
          </h3>
        </div>
        
        <div className="table-wrap">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Total Products</th>
                <th>Price Range</th>
                <th>On Sale</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.name}>
                  <td><b>{c.name}</b></td>
                  <td><span className="badge-count">{c.n}</span></td>
                  <td>{c.min === c.max ? money(c.min) : `${money(c.min)} - ${money(c.max)}`}</td>
                  <td>
                    {c.sale > 0 
                      ? <span className="badge-sale">{c.sale} products</span> 
                      : <span className="text-muted">—</span>}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className={"btn-select " + (addCats.has(c.name) ? "on" : "")} onClick={() => toggleCat(c.name)}>
                      {addCats.has(c.name) ? <><PiCheckCircle /> Selected</> : "Select all"}
                    </button>
                  </td>
                </tr>
              ))}
              {!cats.length && <tr><td colSpan={5} className="empty">No products yet. Upload some first.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* BULK UPDATE CARD */}
      <div className="card" ref={selectorRef} style={{ padding: 24 }}>
        <div className="card-h" style={{ borderBottom: "1px solid #eee", paddingBottom: 16, marginBottom: 16 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18 }}>
            <PiListMagnifyingGlass size={22} color="var(--ac)" /> Update specific products
          </h3>
        </div>

        <div className="form-group">
          <label>Product codes or names</label>
          <textarea
            rows={3}
            placeholder={"Type or paste several, one per line or separated by commas.\nExample:\nC4036A, C4037B\nEmbroidered Lawn Suit"}
            value={text}
            onChange={(e) => { setText(e.target.value); setOff(new Set()); }}
          />
        </div>

        {(found.length > 0 || addCats.size > 0) && (
          <div className="mb-4">
            {[...addCats].map((c) => (
              <span key={"cat-" + c} className="tok ok">
                Category: {c}{" "}
                <a href="#remove" onClick={(e) => { e.preventDefault(); toggleCat(c); }} style={{ marginLeft: 6, color: "#fff" }}>✕</a>
              </span>
            ))}
            {found.map(({ t, list }) => {
              const exact = list.length > 0 && list.every((p) => (p.code || "").toLowerCase() === t.toLowerCase() || (p.name || "").toLowerCase() === t.toLowerCase());
              return (
                <span key={t} className={"tok " + (!list.length ? "none" : exact ? "ok" : "part")}>
                  {t} → {!list.length ? "not found" : exact ? `${list.length} product${list.length > 1 ? "s" : ""}` : `${list.length} partial match${list.length > 1 ? "es" : ""}`}
                </span>
              );
            })}
          </div>
        )}

        <div className="update-grid">
          <label>What to do
            <select value={action} onChange={(e) => setAction(e.target.value)}>
              {ACTIONS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
            </select>
          </label>

          {needVal && (
            <label>{isPct ? "Percentage (%)" : "Amount (Rs.)"}
              <div className="input-icon">
                {isPct ? <PiPercent /> : <span style={{ fontWeight: 600 }}>Rs</span>}
                <input type="number" min="1" value={val} onChange={(e) => setVal(e.target.value)} placeholder={isPct ? "e.g. 10" : "e.g. 500"} />
              </div>
            </label>
          )}

          {needVal && (
            <label>Round to
              <select value={step} onChange={(e) => setStep(+e.target.value)}>{ROUND.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
            </label>
          )}

          {showDates && (
            <label>Sale duration
              <select value={dur} onChange={(e) => setDur(e.target.value)}>
                {DURATIONS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
              </select>
            </label>
          )}

          {showDates && dur === "custom" && (
            <>
              <label>Start Date
                <div className="input-icon"><PiCalendarBlank /><input type="date" value={custom.start} onChange={(e) => setCustom({ ...custom, start: e.target.value })} /></div>
              </label>
              <label>End Date
                <div className="input-icon"><PiCalendarBlank /><input type="date" value={custom.end} min={custom.start || undefined} onChange={(e) => setCustom({ ...custom, end: e.target.value })} /></div>
              </label>
            </>
          )}
        </div>

        {showDates && !dateErr && (
          <div className="hint-box">
            Sale period: <b>{span(true, dates.start, dates.end)}</b>
            {dates.end ? ". After the end date the product goes back to its original price automatically." : ""}
          </div>
        )}
        {needVal && val && !valOk && <div className="msg bad">Enter a number above 0{isPct ? ` (maximum ${max}%)` : ""}.</div>}
        {dateErr && <div className="msg bad">{dateErr}</div>}
        {msg && <div className={"msg " + (msg.ok ? "ok" : "bad")}>{msg.t}</div>}

        <h4 className="sub" style={{ marginTop: 24, marginBottom: 12 }}>Selected products ({picked.length} of {matched.length})</h4>
        <div className="table-wrap">
          <table className="preview-table">
            <thead>
              <tr>
                <th><input type="checkbox" className="ck" checked={allOn} onChange={toggleAll} aria-label="Select all" /></th>
                <th>Product</th><th>Code</th><th>Current Price</th><th>New Price</th><th>Current Sale</th><th>New Sale</th>
                <th>Status</th><th>New Dates</th>
              </tr>
            </thead>
            <tbody>
              {matched.map((p) => {
                const on = !off.has(p.id);
                const n = on && valid ? calc(p, action, v, step, dates) : null;
                const hasSale = p.sale > 0;
                const st = saleState(p, today);
                return (
                  <tr key={p.id} style={on ? undefined : { opacity: 0.4 }}>
                    <td><input type="checkbox" className="ck" checked={on} onChange={() => toggle(p.id)} /></td>
                    <td>
                      <div className="fw-semibold">{p.name}</div>
                      <small>{catOf(p)}</small>
                    </td>
                    <td>{p.code ? <span className="code">{p.code}</span> : "—"}</td>
                    <td>{money(p.price)}</td>
                    <td className={n && n.price !== p.price ? "chg" : ""}>{n ? money(n.price) : "—"}</td>
                    <td>{hasSale ? money(p.sale) : "—"}</td>
                    <td className={n && n.sale !== (p.sale || 0) ? "chg" : ""}>{n ? (n.sale ? money(n.sale) : "—") : "—"}</td>
                    <td>
                      {st !== "none" ? (
                        <span className={"status-badge " + st}>{STATE_LABEL[st]}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className={n && (n.saleStart !== (p.saleStart || "") || n.saleEnd !== (p.saleEnd || "")) ? "chg" : ""}>
                      {n ? span(n.sale > 0, n.saleStart, n.saleEnd) : "—"}
                    </td>
                  </tr>
                );
              })}
              {!matched.length && (
                <tr><td colSpan={9} className="empty">
                  {tokens.length ? "No products match what you typed." : "Type product codes above, or press “Select all” on a category."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <button className="btn update-btn" disabled={busy || !changes.length} onClick={apply}>
          {busy ? "Updating…" : `Apply Changes to ${changes.length} Product${changes.length === 1 ? "" : "s"} `}
          {!busy && <PiArrowRight style={{ marginLeft: 8 }} />}
        </button>
      </div>
    </div>
  );
}