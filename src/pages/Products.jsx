import { useState, useEffect } from "react";
import { saveProduct, deleteProduct } from "../db";
import { resize, saleActive, friendly } from "../utils";
import { CATEGORY_GROUPS, PRESETS, titleCase } from "../categories";
import { 
  PiMagnifyingGlass, PiTrash, PiPencilSimple, PiCheckCircle, PiXCircle, 
  PiImageSquare, PiListMagnifyingGlass, PiUploadSimple, PiFloppyDisk
} from "react-icons/pi";

const EMPTY = { name: "", code: "", price: "", sale: "", saleStart: "", saleEnd: "", cat: "", pieces: "3 Piece", stitching: "Unstitched", img: "", imgs: [], desc: "", qty: "", isNew: false, stock: true };
const qtyOf = (p) => (p.qty === "" || p.qty === undefined || p.qty === null ? null : Number(p.qty));

const QTY_FILTERS = [
  ["All", "All"], ["0", 0], ["1", 1], ["2", 2], ["3", 3], ["4", 4],
  ["5", 5], ["6", 6], ["7", 7], ["8", 8], ["9+", "9+"], ["No qty", "none"],
];

// A beautiful SVG Spinner
const Spinner = () => (
  <svg className="spinner" viewBox="0 0 50 50">
    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4" strokeLinecap="round"></circle>
  </svg>
);

// Number box that saves when you leave it
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
  
  // Filters
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [stitch, setStitch] = useState("All");
  const [qtyF, setQtyF] = useState("All"); 
  
  // Selection
  const [selected, setSelected] = useState([]); 
  const [deleting, setDeleting] = useState(false);
  const [custom, setCustom] = useState(false); 

  const photos = f.imgs && f.imgs.length ? f.imgs : f.img ? [f.img] : [];
  const sizeKB = Math.round((photos.join("").length + (photos[0] || "").length) / 1024);
  const cats = [...new Set(products.map((p) => p.cat).filter(Boolean))].sort();
  const extra = cats.filter((c) => !PRESETS.some((p) => p.toLowerCase() === c.toLowerCase()));

  useEffect(() => {
    if (!openId) return;
    const p = products.find((x) => x.id === openId);
    if (p) { edit(p); onOpened && onOpened(); }
  }, [openId, products]);

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
      {/* ================= FORM SECTION ================= */}
      <form className="card" onSubmit={save}>
        <div className="card-h" style={{ borderBottom: "1px solid #eee", paddingBottom: 12, marginBottom: 12 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {id ? <><PiPencilSimple /> Edit product</> : <><PiUploadSimple /> Upload product</>}
          </h3>
        </div>
        
        {status && <div className={"msg " + (status.ok ? "ok" : "bad")}>{status.t}</div>}

        <div className="form-group">
          <label>Product Information</label>
          <input required placeholder="Product name (e.g. Embroidered Lawn Suit)" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input placeholder="Product code (e.g. C4036A)" value={f.code || ""} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} />
        </div>

        <div className="form-group">
          <label>Pricing (Rs.)</label>
          <div className="two">
            <input required type="number" min="1" placeholder="Original Price" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
            <input type="number" min="0" placeholder="Sale Price (optional)" value={f.sale || ""} onChange={(e) => setF({ ...f, sale: e.target.value })} />
          </div>
          {+f.sale > 0 && (
            <div className="two mt-2">
              <label>Sale starts<input type="date" value={f.saleStart || ""} onChange={(e) => setF({ ...f, saleStart: e.target.value })} /></label>
              <label>Sale ends<input type="date" value={f.saleEnd || ""} onChange={(e) => setF({ ...f, saleEnd: e.target.value })} /></label>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Inventory</label>
          <input type="number" min="0" placeholder="Quantity in stock (e.g. 10)" value={f.qty ?? ""} onChange={(e) => setF({ ...f, qty: e.target.value })} />
          <small>Customers see "10 quantity remains". Leave empty to hide quantity.</small>
        </div>

        <div className="form-group">
          <label>Category & Details</label>
          {!custom ? (
            <select required value={f.cat} onChange={pickCat}>
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
          ) : (
            <div className="two">
              <input required autoFocus placeholder="New category name" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })} />
              <button type="button" className="btn ghost" onClick={() => { setCustom(false); setF({...f, cat: ""}); }}>Cancel</button>
            </div>
          )}
          <div className="two mt-2">
            <select value={f.pieces} onChange={(e) => setF({ ...f, pieces: e.target.value })}>
              <option>1 Piece</option><option>2 Piece</option><option>3 Piece</option>
            </select>
            <select value={f.stitching || "Unstitched"} onChange={(e) => setF({ ...f, stitching: e.target.value })}>
              <option>Unstitched</option><option>Stitched</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea rows={3} placeholder="Fabric details, embroidery, dupatta..." value={f.desc || ""} onChange={(e) => setF({ ...f, desc: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Photos ({photos.length}/4)</label>
          {photos.length > 0 && (
            <div className="photos mb-2">
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
              <PiImageSquare size={24} style={{ marginBottom: 4 }} /><br/>
              Tap to add photos
            </label>
          )}
          {photos.length > 0 && <small style={{ marginTop: 4 }}>Size: {sizeKB} KB (Max ~900 KB)</small>}
        </div>

        <div className="form-group" style={{ flexDirection: "row", gap: 16, alignItems: "center", marginTop: 8 }}>
          <label className="chk" style={{ margin: 0 }}>
            <input type="checkbox" checked={!!f.isNew} onChange={(e) => setF({ ...f, isNew: e.target.checked })} /> Mark as New Arrival
          </label>
          <label className="chk" style={{ margin: 0 }}>
            <input type="checkbox" checked={f.stock} onChange={(e) => setF({ ...f, stock: e.target.checked })} /> In Stock
          </label>
        </div>

        {/* ACTION BUTTONS with ANIMATION */}
        <div style={{ marginTop: 16 }}>
          <button className={`btn ${busy ? "uploading" : ""}`} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", height: "46px" }} disabled={busy}>
            {busy ? (
              <><Spinner /> Uploading...</>
            ) : id ? (
              <><PiFloppyDisk size={18} /> Save Changes</>
            ) : (
              <><PiUploadSimple size={18} /> Upload Product</>
            )}
          </button>
          {id && <button type="button" className="btn ghost mt-2" style={{ width: "100%" }} onClick={reset} disabled={busy}>Cancel Editing</button>}
        </div>
      </form>

      {/* ================= TABLE SECTION ================= */}
      <div className="card">
        <div className="card-h">
          <h3>Products ({shown.length}{shown.length !== products.length ? ` of ${products.length}` : ""})</h3>
          <div className="search">
            <PiMagnifyingGlass className="search-icon" />
            <input placeholder="Filter by name or code…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <div className="filter-chips">
          <div className="chips">
            {["All", ...cats].map((c) => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          <div className="chips">
            {["All", "Stitched", "Unstitched"].map((c) => <button key={c} className={"chip" + (stitch === c ? " on" : "")} onClick={() => setStitch(c)}>{c}</button>)}
          </div>
          <div className="chips" title="Filter by quantity">
            <span style={{ fontSize: 12, marginRight: 6, color: "var(--mut)", display: "flex", alignItems: "center", gap: 4 }}>
              <PiListMagnifyingGlass /> Qty:
            </span>
            {QTY_FILTERS.map(([label, val]) => (
              <button key={label} className={"chip" + (qtyF === val ? " on" : "")} onClick={() => setQtyF(val)}>{label}</button>
            ))}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="msg bad" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <b>{selected.length} selected</b>
            <button type="button" className="mini del" disabled={deleting} onClick={deleteSelected}>
              {deleting ? "Deleting…" : `Delete selected (${selected.length})`}
            </button>
            <button type="button" className="mini" disabled={deleting} onClick={() => setSelected([])}>Clear</button>
          </div>
        )}

        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={allShownTicked} onChange={toggleAllShown} disabled={!shown.length} aria-label="Select all shown products" />
                </th>
                <th>Product Details</th>
                <th>Price</th>
                <th>Sale Price</th>
                <th>Qty</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
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
                    <td>
                      <div className="product-cell">
                        {p.img ? <img className="thumb" src={p.img} alt="" /> : <div className="thumb" />}
                        <div>
                          <div className="p-name">
                            {p.name} 
                            {p.isNew && <span className="tag dark">NEW</span>}
                          </div>
                          <div className="p-meta">
                            {p.code && <span className="code">{p.code}</span>} 
                            {p.cat} · {p.pieces} · {p.stitching || "Unstitched"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Inline value={p.price} onSave={(v) => saveProduct(p.id, { ...p, price: v })} />
                    </td>
                    <td>
                      <Inline value={p.sale} onSave={(v) => saveProduct(p.id, { ...p, sale: v })} />
                      {p.sale > 0 && <small className={saleActive(p) ? "good" : ""}>{saleActive(p) ? "Active" : "Not active"}{p.saleEnd ? ` · ends ${p.saleEnd}` : ""}</small>}
                    </td>
                    <td>
                      <Inline value={p.qty} onSave={(v) => saveProduct(p.id, { ...p, qty: v, stock: v > 0 })} />
                      {n !== null && n <= 3 && <small className={n === 0 ? "qty-out" : "qty-low"}>{n === 0 ? "Sold out" : "Low stock"}</small>}
                    </td>
                    <td>
                      <button className={"tog" + (p.stock ? " on" : "")} onClick={() => saveProduct(p.id, { ...p, stock: !p.stock })}>
                        {p.stock ? <PiCheckCircle /> : <PiXCircle />} {p.stock ? "In stock" : "Out"}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }} className="nowrap">
                      <button className="mini edit" onClick={() => edit(p)}><PiPencilSimple /> Edit</button>
                      <button className="mini del" onClick={() => window.confirm("Delete this product from your website?") && deleteProduct(p.id)}><PiTrash /></button>
                    </td>
                  </tr>
                );
              })}
              {!shown.length && <tr><td colSpan={7} className="empty">No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}