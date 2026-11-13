import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { updateProducts } from "../db";
import { friendly } from "../utils";
import { PiDownloadSimple, PiUploadSimple, PiFileCsv, PiTable, PiArrowCounterClockwise } from "react-icons/pi";

const qtyOf = (p) => (p.qty === "" || p.qty === undefined || p.qty === null ? null : Number(p.qty));
const norm = (v) => String(v ?? "").trim().toUpperCase().replace(/\s+/g, "");
const letter = (i) => (i < 26 ? String.fromCharCode(65 + i) : String(i + 1));

const MODES = [
  ["set", "Make my stock match the file (set each quantity to the file's number)"],
  ["add", "Add the file quantities to my current stock (new stock arrived)"],
  ["sub", "Subtract the file quantities from my current stock (items sold)"],
];

function parseQty(v) {
  if (v === "" || v === null || v === undefined) return null;
  const m = String(v).replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = Math.round(Number(m[0]));
  return n >= 0 ? n : null;
}

function guess(heads) {
  const h = heads.map((x) => String(x ?? "").toLowerCase());
  const find = (words, skip = []) => h.findIndex((t, i) => !skip.includes(i) && words.some((w) => t.includes(w)));
  const code = find(["code", "sku", "article", "design no", "style", "item no"]);
  const qty = find(["qty", "quantity", "stock", "available", "inventory", "balance", "in hand", "pcs", "pieces"], [code]);
  const name = find(["name", "product", "item", "title", "description", "design"], [code, qty]);
  return { code, name, qty };
}

export default function Stock({ products }) {
  const [fileName, setFileName] = useState("");
  const [book, setBook] = useState(null);
  const [sheet, setSheet] = useState("");
  const [header, setHeader] = useState(true);
  const [map, setMap] = useState({ code: -1, name: -1, qty: -1 });
  const [mode, setMode] = useState("set");
  const [zero, setZero] = useState(false);
  const [only, setOnly] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [undo, setUndo] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const rows = useMemo(() => (book && sheet ? book.sheets[sheet] || [] : []), [book, sheet]);
  const width = Math.max(0, ...rows.slice(0, 50).map((r) => r.length));
  const heads = useMemo(
    () => Array.from({ length: width }, (_, i) => (header ? String(rows[0]?.[i] ?? "").trim() : "") || `Column ${letter(i)}`),
    [rows, width, header]
  );

  const setup = (b, name, hdr) => {
    const r = b.sheets[name] || [];
    const w = Math.max(0, ...r.slice(0, 50).map((x) => x.length));
    setMap(guess(Array.from({ length: w }, (_, i) => (hdr ? String(r[0]?.[i] ?? "").trim() : "") || `Column ${letter(i)}`)));
  };

  async function processFile(f) {
    if (!f) return;
    setMsg(null);
    try {
      const wb = XLSX.read(await f.arrayBuffer(), { type: "array" });
      const sheets = {};
      wb.SheetNames.forEach((n) => { sheets[n] = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: "", blankrows: false }); });
      const b = { names: wb.SheetNames, sheets };
      const first = wb.SheetNames.find((n) => sheets[n].length) || wb.SheetNames[0];
      if (!first) throw new Error("The file has no sheets.");
      setBook(b); setSheet(first); setFileName(f.name); setHeader(true);
      setup(b, first, true);
    } catch (err) {
      setBook(null); setFileName("");
      setMsg({ ok: false, t: "Could not read that file. Please use an Excel (.xlsx, .xls) or CSV file. " + (err.message || "") });
    }
  }

  async function pickFile(e) {
    const f = e.target.files[0];
    e.target.value = "";
    processFile(f);
  }

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const idx = useMemo(() => {
    const code = new Map(), name = new Map();
    const push = (m, k, p) => { if (k) m.set(k, [...(m.get(k) || []), p]); };
    products.forEach((p) => { push(code, norm(p.code), p); push(name, norm(p.name), p); });
    return { code, name };
  }, [products]);

  const result = useMemo(() => {
    if (!rows.length || map.qty < 0 || (map.code < 0 && map.name < 0)) return null;
    const find = (codeVal, nameVal) => {
      const c = norm(codeVal), n = norm(nameVal);
      const tries = [];
      if (c) tries.push(idx.code.get(c), idx.name.get(c));
      if (n) tries.push(idx.name.get(n), idx.code.get(n));
      for (const hit of tries) if (hit && hit.length) return hit.length === 1 ? { p: hit[0] } : { many: hit };
      return {};
    };
    const data = header ? rows.slice(1) : rows;
    const groups = new Map();
    const notFound = [], invalid = [], many = [];
    data.forEach((r, i) => {
      const code = map.code >= 0 ? r[map.code] : "";
      const name = map.name >= 0 ? r[map.name] : "";
      const raw = r[map.qty];
      if (String(code ?? "").trim() === "" && String(name ?? "").trim() === "" && String(raw ?? "").trim() === "") return;
      const line = i + (header ? 2 : 1);
      const label = String(code || name || "(blank)").trim();
      const n = parseQty(raw);
      if (n === null) { invalid.push({ line, label, raw: String(raw ?? "") }); return; }
      const m = find(code, name);
      if (m.many) { many.push({ line, label, n: m.many.length }); return; }
      if (!m.p) { notFound.push({ line, label, qty: n }); return; }
      const g = groups.get(m.p.id) || { p: m.p, fileQty: 0, times: 0 };
      g.fileQty += n; g.times += 1; groups.set(m.p.id, g);
    });

    const out = [];
    groups.forEach(({ p, fileQty, times }) => {
      const cur = qtyOf(p);
      const base = cur ?? 0;
      const next = mode === "set" ? fileQty : mode === "add" ? base + fileQty : Math.max(0, base - fileQty);
      out.push({ p, cur, fileQty, times, next, delta: next - base, changed: cur === null || next !== cur });
    });
    if (mode === "set" && zero) {
      products.forEach((p) => {
        if (groups.has(p.id)) return;
        const cur = qtyOf(p);
        if (cur !== null && cur > 0) out.push({ p, cur, fileQty: null, times: 0, next: 0, delta: -cur, changed: true });
      });
    }
    out.sort((a, b) => (b.changed - a.changed) || String(a.p.name).localeCompare(String(b.p.name)));
    return { out, notFound, invalid, many };
  }, [rows, header, map, mode, zero, products, idx]);

  const todo = result ? result.out.filter((r) => r.changed) : [];
  const up = todo.filter((r) => r.delta > 0).length;
  const down = todo.filter((r) => r.delta < 0).length;
  const shown = result ? (only ? todo : result.out).slice(0, 500) : [];

  async function apply() {
    if (!todo.length) return;
    if (!window.confirm(`Update the quantity of ${todo.length} product(s)? Customers will see the new quantities straight away.`)) return;
    setBusy(true); setMsg(null);
    try {
      await updateProducts(todo.map((r) => ({ id: r.p.id, qty: r.next, stock: r.next > 0 ? (r.cur === 0 ? true : r.p.stock !== false) : false })));
      setUndo(todo.map((r) => ({ id: r.p.id, qty: r.cur ?? "", stock: r.p.stock !== false })));
      setMsg({ ok: true, t: `Done. ${todo.length} product(s) updated on your website. The file was cleared so it cannot be applied twice.` });
      setBook(null); setFileName(""); setSheet("");
    } catch (e) { setMsg({ ok: false, t: friendly(e) }); }
    setBusy(false);
  }

  async function undoLast() {
    if (!undo) return;
    setBusy(true); setMsg(null);
    try {
      await updateProducts(undo);
      setMsg({ ok: true, t: `Undone. ${undo.length} product(s) are back to their earlier quantities.` });
      setUndo(null);
    } catch (e) { setMsg({ ok: false, t: friendly(e) }); }
    setBusy(false);
  }

  function download() {
    const data = [["Code", "Name", "Category", "Quantity"], ...products.map((p) => [p.code || "", p.name || "", p.cat || "", qtyOf(p) ?? ""])];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 14 }, { wch: 34 }, { wch: 14 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock");
    XLSX.writeFile(wb, "current-stock.xlsx");
  }

  const colSelect = (label, key, optional) => (
    <label>{label}
      <select value={map[key]} onChange={(e) => setMap({ ...map, [key]: +e.target.value })}>
        {optional ? <option value={-1}>— none —</option> : map[key] < 0 && <option value={-1}>Choose a column…</option>}
        {heads.map((h, i) => <option key={i} value={i}>{h}</option>)}
      </select>
    </label>
  );

  return (
    <>
      <div className="card" style={{ padding: "24px" }}>
        <div className="card-h" style={{ borderBottom: "1px solid #eee", paddingBottom: 16, marginBottom: 16 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18 }}>
            <PiTable size={22} color="var(--ac)" /> Import stock from Excel
          </h3>
        </div>
        
        <div className="hint" style={{ marginBottom: 20 }}>
          Your sheet needs a column with the <b>product code</b> (or name) and a column with the <b>quantity</b>. Excel (.xlsx, .xls) and CSV files work.
          Not sure about the layout? Download your current stock, edit the Quantity column, and upload it again.
        </div>

        <div className="row-wrap" style={{ marginBottom: 20 }}>
          <button className="btn ghost" style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={download} disabled={!products.length}>
            <PiDownloadSimple size={18} /> Download current stock (Excel)
          </button>
          {undo && (
            <button className="btn ghost" style={{ display: "flex", alignItems: "center", gap: 8 }} disabled={busy} onClick={undoLast}>
              <PiArrowCounterClockwise size={18} /> Undo last import
            </button>
          )}
        </div>

        {/* Beautiful Drag & Drop File Input */}
        <div 
          className={`file-drop-zone ${dragActive ? "active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            accept=".xlsx,.xls,.csv" 
            onChange={pickFile} 
            id="file-upload" 
            style={{ display: "none" }} 
          />
          <label htmlFor="file-upload" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", margin: 0 }}>
            <div className="file-icon-wrap">
              {fileName ? <PiFileCsv size={28} /> : <PiUploadSimple size={28} />}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
              {fileName ? fileName : "Click to upload or drag and drop"}
            </div>
            <div style={{ fontSize: 13, color: "var(--mut)" }}>
              Excel or CSV file
            </div>
          </label>
        </div>

        {msg && <div className={"msg " + (msg.ok ? "ok" : "bad")} style={{ marginTop: 16 }}>{msg.t}</div>}
      </div>

      {book && (
        <div className="card">
          <div className="card-h"><h3>Set up the import</h3><small>{fileName}</small></div>
          <div className="grid4">
            {book.names.length > 1 && (
              <label>Sheet
                <select value={sheet} onChange={(e) => { setSheet(e.target.value); setup(book, e.target.value, header); }}>
                  {book.names.map((n) => <option key={n}>{n}</option>)}
                </select>
              </label>
            )}
            {colSelect("Product code column", "code", true)}
            {colSelect("Product name column", "name", true)}
            {colSelect("Quantity column", "qty", false)}
          </div>
          <label className="chk">
            <input type="checkbox" checked={header} onChange={(e) => { setHeader(e.target.checked); setup(book, sheet, e.target.checked); }} />
            The first row is a heading row
          </label>

          <label>What should the import do?
            <select value={mode} onChange={(e) => setMode(e.target.value)}>{MODES.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
          </label>
          {mode === "set" && (
            <label className="chk">
              <input type="checkbox" checked={zero} onChange={(e) => setZero(e.target.checked)} />
              Products that are not in my file: set their quantity to 0
            </label>
          )}
          {!result && <div className="msg bad">Choose the <b>Quantity</b> column and at least one of the <b>code</b> or <b>name</b> columns.</div>}
        </div>
      )}

      {book && result && (
        <div className="card">
          <div className="card-h"><h3>Preview</h3></div>
          <div>
            <span className="tok ok">{up} will increase</span>
            <span className="tok none">{down} will decrease</span>
            <span className="tok">{result.out.length - todo.length} unchanged</span>
            {result.notFound.length > 0 && <span className="tok part">{result.notFound.length} not found</span>}
            {result.invalid.length > 0 && <span className="tok part">{result.invalid.length} rows with no valid quantity</span>}
            {result.many.length > 0 && <span className="tok part">{result.many.length} match several products</span>}
          </div>
          <label className="chk"><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} /> Show only the products that will change</label>

          <div className="table-wrap">
            <table>
              <thead><tr><th></th><th>Product</th><th>Code</th><th>Now</th><th>File</th><th>New quantity</th><th>Change</th></tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.p.id}>
                    <td>{r.p.img ? <img className="thumb" src={r.p.img} alt="" /> : <div className="thumb" />}</td>
                    <td>{r.p.name}<br /><small>{r.p.cat}{r.times > 1 ? ` · appears ${r.times} times in the file (added together)` : ""}</small></td>
                    <td>{r.p.code ? <span className="code">{r.p.code}</span> : "—"}</td>
                    <td>{r.cur === null ? "not set" : r.cur}</td>
                    <td>{r.fileQty === null ? "not in file" : r.fileQty}</td>
                    <td><b>{r.next}</b></td>
                    <td className={r.cur === null ? "" : r.delta > 0 ? "up" : r.delta < 0 ? "down" : ""}>
                      {r.cur === null ? "now tracked" : r.delta > 0 ? `+${r.delta}` : r.delta < 0 ? `${r.delta}` : "no change"}
                    </td>
                  </tr>
                ))}
                {!shown.length && <tr><td colSpan={7} className="empty">{result.out.length ? "Nothing would change." : "No products from your file were found."}</td></tr>}
              </tbody>
            </table>
          </div>
          {(only ? todo : result.out).length > 500 && <div className="hint">Showing the first 500 rows. All changes will still be applied.</div>}

          {(result.notFound.length > 0 || result.invalid.length > 0 || result.many.length > 0) && (
            <details className="probs">
              <summary>Rows that were skipped ({result.notFound.length + result.invalid.length + result.many.length})</summary>
              <ul>
                {result.notFound.map((x) => <li key={"n" + x.line}>Row {x.line}: <b>{x.label}</b> (quantity {x.qty}) was not found in your products.</li>)}
                {result.many.map((x) => <li key={"m" + x.line}>Row {x.line}: <b>{x.label}</b> matches {x.n} of your products, so it was skipped. Give each product its own code.</li>)}
                {result.invalid.map((x) => <li key={"i" + x.line}>Row {x.line}: <b>{x.label}</b> has no valid quantity{x.raw ? ` ("${x.raw}")` : ""}.</li>)}
              </ul>
            </details>
          )}

          <button className="btn" disabled={busy || !todo.length} onClick={apply}>
            {busy ? "Updating…" : `Apply to ${todo.length} product${todo.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}
    </>
  );
}