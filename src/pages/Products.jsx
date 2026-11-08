import { useState, useEffect } from "react";
import { saveProduct, deleteProduct } from "../db";
import { resize, saleActive, friendly } from "../utils";
import { CATEGORY_GROUPS, PRESETS, titleCase } from "../categories";

const EMPTY = { name: "", code: "", price: "", sale: "", saleStart: "", saleEnd: "", cat: "", pieces: "3 Piece", stitching: "Unstitched", img: "", imgs: [], desc: "", qty: "", isNew: false, stock: true };
const qtyOf = (p) => (p.qty === "" || p.qty === undefined || p.qty === null ? null : Number(p.qty));

// Quantity filter options: label shown on the chip -> value used for filtering
const QTY_FILTERS = [
  ["All", "All"],
  ["0", 0], ["1", 1], ["2", 2], ["3", 3], ["4", 4],
  ["5", 5], ["6", 6], ["7", 7], ["8", 8],
  ["9+", "9+"],
  ["No qty", "none"],
];

// Number box that saves when you leave it (for quick price / quantity edits)
function Inline({ value, onSave }) {
  const [v, setV] = useState(value ?? "");
  useEffect(() => setV(value ?? ""), [value]);
  return (
    <input
      className="inl" type="number" min="0" value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { if (+v !== +(value || 0)) onSave(+v || 0); }}
      onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
    />
  );
}

export default function Products({ products, openId, onOpened }) {
  const [f, setF] = useState(EMPTY);
  const [id, setId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [stitch, setStitch] = useState("All");
  const [qtyF, setQtyF] = useState("All"); // quantity filter
  const [selected, setSelected] = useState([]); // ids ticked with the checkboxes
  const [deleting, setDeleting] = useState(false);
  const [custom, setCustom] = useState(false); // true while typing a brand new category

  const photos = f.imgs && f.imgs.length ? f.imgs : f.img ? [f.img] : [];
  const sizeKB = Math.round((photos.join("").length + (photos[0] || "").length) / 1024); // main photo is stored twice
  const cats = [...new Set(products.map((p) => p.cat).filter(Boolean))].sort();
  const extra = cats.filter((c) => !PRESETS.some((p) => p.toLowerCase() === c.toLowerCase()));

  // opened from the search bar at the top: load that product into the form
  useEffect(() => {
    if (!openId) return;
    const p = products.find((x) => x.id === openId);
    if (p) { edit(p); onOpened && onOpened(); }
  }, [openId, products]);

  // drop ticked ids that no longer exist (e.g. after deleting)
  useEffect(() => {
    setSelected((s) => {
      const alive = s.filter((sid) => products.some((p) => p.id === sid));
      return alive.length === s.length ? s : alive;
    });
  }, [products]);

  function pickCat(e) {
    const v = e.target.value;
    if (v === "__other") { setCustom(true); setF({ ...f, cat: "" }); }
    else { setCustom(false); setF({ ...f, cat: v }); }
  }

  async function pickPhotos(e) {
    const files = [...e.target.files].slice(0, 4 - photos.length);
    if (!files.length) return;
    const added = await Promise.all(files.map((x) => resize(x)));
    const imgs = [...photos, ...added];
    setF({ ...f, imgs, img: imgs[0] });
    e.target.value = "";
  }
  const removePhoto = (k) => { const imgs = photos.filter((_, i) => i !== k); setF({ ...f, imgs, img: imgs[0] || "" }); };
  const reset = () => { setF(EMPTY); setId(null); setCustom(false); };

  async function save(e) {
    e.preventDefault();
    const category = custom ? titleCase(f.cat) : f.cat;
    if (!category) return setStatus({ ok: false, t: "Please choose a category." });
    const code = (f.code || "").trim().toUpperCase();
    if (code && products.some((p) => p.id !== id && (p.code || "").toUpperCase() === code))
      return setStatus({ ok: false, t: `Another product already uses the code ${code}. Please use a different code.` });
    if (!photos.length && !window.confirm("No photo added. Upload this product without a photo?")) return;
    if (sizeKB > 900) return setStatus({ ok: false, t: `Photos are too large (${sizeKB} KB). Use fewer or smaller photos (limit about 900 KB).` });
    setBusy(true); setStatus(null);
    const sale = +f.sale || 0;
    const hasQty = f.qty !== "" && f.qty !== null && f.qty !== undefined;
    const qtyNum = hasQty ? Math.max(0, Math.floor(+f.qty)) : "";
    try {
      await saveProduct(id, {
        ...f, code, qty: qtyNum, stock: f.stock && (!hasQty || qtyNum > 0),
        cat: category, price: +f.price, sale,
        saleStart: sale ? f.saleStart : "", saleEnd: sale ? f.saleEnd : "",
        imgs: photos, img: photos[0] || "",
      });
      setStatus({ ok: true, t: id ? "Changes saved. They are live on your website." : "Product uploaded. It is now live on your website." });
      reset();
    } catch (err) { setStatus({ ok: false, t: friendly(err) }); }
    setBusy(false);
  }

  function edit(p) {
    const match = PRESETS.find((x) => x.toLowerCase() === (p.cat || "").toLowerCase());
    setId(p.id);
    setF({ ...EMPTY, ...p, cat: match || p.cat || "" });
    setCustom(false);
    setStatus(null);
    window.scrollTo(0, 0);
  }

  const term = q.trim().toLowerCase();
  const shown = products.filter((p) => {
    const n = qtyOf(p);
    const qtyOk =
      qtyF === "All" ? true :
      qtyF === "none" ? n === null :
      qtyF === "9+" ? n !== null && n >= 9 :
      n === qtyF;
    return (
      (cat === "All" || p.cat === cat) &&
      (stitch === "All" || (p.stitching || "Unstitched") === stitch) &&
      qtyOk &&
      (!term || [p.name, p.code, p.cat].join(" ").toLowerCase().includes(term))
    );
  });

  // checkbox helpers
  const shownIds = shown.map((p) => p.id);
  const allShownTicked = shownIds.length > 0 && shownIds.every((sid) => selected.includes(sid));
  const toggleOne = (pid) => setSelected((s) => (s.includes(pid) ? s.filter((x) => x !== pid) : [...s, pid]));
  const toggleAllShown = () =>
    setSelected((s) => (allShownTicked ? s.filter((x) => !shownIds.includes(x)) : [...new Set([...s, ...shownIds])]));

  async function deleteSelected() {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} selected product${selected.length > 1 ? "s" : ""} from your website? This cannot be undone.`)) return;
    setDeleting(true);
    const results = await Promise.allSettled(selected.map((pid) => deleteProduct(pid)));
    const failed = results.filter((r) => r.status === "rejected").length;
    const done = results.length - failed;
    setStatus(
      failed
        ? { ok: false, t: `${done} deleted, ${failed} could not be deleted. Please try again.` }
        : { ok: true, t: `${done} product${done > 1 ? "s" : ""} deleted.` }
    );
    setSelected([]);
    setDeleting(false);
    window.scrollTo(0, 0);
  }

  return (
    <div className="split">
      <form className="card" onSubmit={save}>
        <div className="card-h"><h3>{id ? "Edit product" : "Upload new product"}</h3></div>
        {status && <div className={"msg " + (status.ok ? "ok" : "bad")}>{status.t}</div>}

        <input required placeholder="Product name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <label>Product code
          <input placeholder="e.g. C4036A (used to find the product quickly)" value={f.code || ""} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} />
        </label>

        <div className="two">
          <input required type="number" min="1" placeholder="Price" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
          <input type="number" min="0" placeholder="Sale price" value={f.sale || ""} onChange={(e) => setF({ ...f, sale: e.target.value })} />
        </div>
        {+f.sale > 0 && (
          <div className="two">
            <label>Sale starts<input type="date" value={f.saleStart || ""} onChange={(e) => setF({ ...f, saleStart: e.target.value })} /></label>
            <label>Sale ends<input type="date" value={f.saleEnd || ""} onChange={(e) => setF({ ...f, saleEnd: e.target.value })} /></label>
          </div>
        )}

        <label>Quantity in inventory
          <input type="number" min="0" placeholder="How many pieces do you have? e.g. 10" value={f.qty ?? ""} onChange={(e) => setF({ ...f, qty: e.target.value })} />
        </label>
        <div className="hint">Customers see "10 quantity remains". At 0 the product shows as out of stock. Leave empty to hide it.</div>

        <label>Category
          <select required={!custom} value={custom ? "__other" : f.cat} onChange={pickCat}>
            <option value="" disabled>Select category…</option>
            {CATEGORY_GROUPS.map(([label, list]) => (
              <optgroup key={label} label={label}>
                {list.map((c) => <option key={c} value={c}>{c}</option>)}
              </optgroup>
            ))}
            {extra.length > 0 && (
              <optgroup label="Your other categories">
                {extra.map((c) => <option key={c} value={c}>{c}</option>)}
              </optgroup>
            )}
            <option value="__other">+ Add a new category…</option>
          </select>
        </label>
        {custom && (
          <input required autoFocus placeholder="Type the new category name" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })} />
        )}
        <div className="hint">The category decides which store page the product appears on (Lawn, Karandi, Fancy…).</div>

        <select value={f.pieces} onChange={(e) => setF({ ...f, pieces: e.target.value })}>
          <option>1 Piece</option><option>2 Piece</option><option>3 Piece</option>
        </select>
        <label>Stitching
          <select value={f.stitching || "Unstitched"} onChange={(e) => setF({ ...f, stitching: e.target.value })}>
            <option>Unstitched</option><option>Stitched</option>
          </select>
        </label>
        <textarea rows={3} placeholder="Description (fabric, embroidery, dupatta...)" value={f.desc || ""} onChange={(e) => setF({ ...f, desc: e.target.value })} />

        <label className="lbl">Photos ({photos.length}/4, the first is the main photo)</label>
        {photos.length > 0 && (
          <div className="photos">
            {photos.map((src, k) => (
              <div key={k} className="photo">
                <img src={src} alt="" />
                {k === 0 && <span>Main</span>}
                <button type="button" onClick={() => removePhoto(k)} aria-label="Remove photo">✕</button>
              </div>
            ))}
          </div>
        )}
        {photos.length < 4 && (
          <label className="drop">
            <input type="file" accept="image/*" multiple hidden onChange={pickPhotos} />
            📷 Tap to add photos<small>JPG or PNG, resized automatically</small>
          </label>
        )}
        {photos.length > 0 && <div className="hint">Photos size: {sizeKB} KB (limit about 900 KB)</div>}

        <label className="chk"><input type="checkbox" checked={!!f.isNew} onChange={(e) => setF({ ...f, isNew: e.target.checked })} /> New arrival</label>
        <select value={f.stock ? "1" : "0"} onChange={(e) => setF({ ...f, stock: e.target.value === "1" })}>
          <option value="1">In stock</option><option value="0">Out of stock</option>
        </select>
        <button className="btn" disabled={busy}>{busy ? "Uploading…" : id ? "Save changes" : "⬆ Upload to website"}</button>
        {id && <button type="button" className="btn ghost" onClick={reset}>Cancel editing</button>}
      </form>

      <div className="card">
        <div className="card-h">
          <h3>Your products ({shown.length}{shown.length !== products.length ? ` of ${products.length}` : ""})</h3>
          <input className="search" placeholder="Filter by name or code…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="chips">
          {["All", ...cats].map((c) => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div className="chips">
          {["All", "Stitched", "Unstitched"].map((c) => <button key={c} className={"chip" + (stitch === c ? " on" : "")} onClick={() => setStitch(c)}>{c}</button>)}
        </div>
        <div className="chips" title="Filter by quantity">
          <small style={{ alignSelf: "center", marginRight: 4 }}>Qty:</small>
          {QTY_FILTERS.map(([label, val]) => (
            <button key={label} className={"chip" + (qtyF === val ? " on" : "")} onClick={() => setQtyF(val)}>{label}</button>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="msg bad" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <b>{selected.length} selected</b>
            <button type="button" className="mini del" disabled={deleting} onClick={deleteSelected}>
              {deleting ? "Deleting…" : `Delete selected (${selected.length})`}
            </button>
            <button type="button" className="mini" disabled={deleting} onClick={() => setSelected([])}>Clear</button>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={allShownTicked} onChange={toggleAllShown} disabled={!shown.length} aria-label="Select all shown products" title="Select all shown" />
                </th>
                <th></th><th>Name</th><th>Price</th><th>Sale price</th><th>Qty</th><th>Stock</th><th></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => {
                const n = qtyOf(p);
                return (
                  <tr key={p.id}>
                    <td>
                      <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleOne(p.id)} aria-label={`Select ${p.name}`} />
                    </td>
                    <td>{p.img ? <img className="thumb" src={p.img} alt="" /> : <div className="thumb" />}</td>
                    <td>
                      {p.name}{p.isNew && <span className="tag dark">NEW</span>}
                      <br />{p.code && <span className="code">{p.code}</span>} <small>{p.cat}{p.pieces ? ` · ${p.pieces}` : ""}{` · ${p.stitching || "Unstitched"}`}</small>
                    </td>
                    <td><Inline value={p.price} onSave={(v) => saveProduct(p.id, { ...p, price: v })} /></td>
                    <td>
                      <Inline value={p.sale} onSave={(v) => saveProduct(p.id, { ...p, sale: v })} />
                      {p.sale > 0 && <small className={saleActive(p) ? "good" : ""}>{saleActive(p) ? "Active" : "Not active"}{p.saleEnd ? ` · ends ${p.saleEnd}` : ""}</small>}
                    </td>
                    <td>
                      <Inline value={p.qty} onSave={(v) => saveProduct(p.id, { ...p, qty: v, stock: v > 0 })} />
                      {n !== null && n <= 3 && <small className={n === 0 ? "qty-out" : "qty-low"}>{n === 0 ? "Sold out" : "Low stock"}</small>}
                    </td>
                    <td><button className={"tog" + (p.stock ? " on" : "")} onClick={() => saveProduct(p.id, { ...p, stock: !p.stock })}>{p.stock ? "In stock" : "Out"}</button></td>
                    <td className="nowrap">
                      <button className="mini" onClick={() => edit(p)}>Edit</button>
                      <button className="mini del" onClick={() => window.confirm("Delete this product from your website?") && deleteProduct(p.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
              {!shown.length && <tr><td colSpan={8} className="empty">No products found.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="hint">Tip: change a price, sale price or quantity in the table and press Enter. It saves and goes live straight away. To delete many products: pick a Qty filter, tick the top checkbox to select all shown, then press "Delete selected".</div>
      </div>
    </div>
  );
}
