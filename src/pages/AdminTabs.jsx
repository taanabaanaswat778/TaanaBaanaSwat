import { useState } from "react";
import { Row, Col, Card, Form, Button, Table } from "react-bootstrap";
import { saveProduct, deleteProduct, saveSettings, updateOrder, deleteOrder, fmtDate } from "../data";
import { money, resize, saleActive } from "../utils";

/* ================= PRODUCTS ================= */
const EMPTY = { name: "", price: "", sale: "", saleStart: "", saleEnd: "", cat: "", pieces: "3 Piece", img: "", imgs: [], desc: "", isNew: false, stock: true };

export function ProductsTab({ products, s }) {
  const [f, setF] = useState(EMPTY);
  const [id, setId] = useState(null);
  const [busy, setBusy] = useState(false);
  const photos = f.imgs && f.imgs.length ? f.imgs : f.img ? [f.img] : [];

  async function save(e) {
    e.preventDefault(); setBusy(true);
    const sale = +f.sale || 0;
    await saveProduct(id, {
      ...f,
      price: +f.price,
      sale,
      saleStart: sale ? f.saleStart : "",
      saleEnd: sale ? f.saleEnd : "",
      imgs: photos,
      img: photos[0] || "",
    });
    setF(EMPTY); setId(null); e.target.reset(); setBusy(false);
  }
  async function pickPhotos(e) {
    const files = [...e.target.files].slice(0, 4);
    if (!files.length) return;
    const imgs = await Promise.all(files.map((x) => resize(x)));
    setF({ ...f, imgs, img: imgs[0] });
  }

  return (
    <Row className="g-4">
      <Col lg={4}>
        <Card body>
          <h5>{id ? "Edit product" : "Add product"}</h5>
          <Form onSubmit={save}>
            <Form.Control required className="mb-2" placeholder="Product name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            <Form.Control required type="number" className="mb-2" placeholder="Price" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
            <Form.Control type="number" className="mb-2" placeholder="Sale price (optional)" value={f.sale || ""} onChange={(e) => setF({ ...f, sale: e.target.value })} />
            {+f.sale > 0 && (
              <Row className="g-2 mb-2">
                <Col><Form.Label className="small mb-0">Sale starts</Form.Label><Form.Control type="date" value={f.saleStart || ""} onChange={(e) => setF({ ...f, saleStart: e.target.value })} /></Col>
                <Col><Form.Label className="small mb-0">Sale ends</Form.Label><Form.Control type="date" value={f.saleEnd || ""} onChange={(e) => setF({ ...f, saleEnd: e.target.value })} /></Col>
              </Row>
            )}
            <Form.Control className="mb-2" placeholder="Category (Lawn, Cotton, Khaddar, Chiffon...)" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })} />
            <Form.Select className="mb-2" value={f.pieces} onChange={(e) => setF({ ...f, pieces: e.target.value })}>
              <option>1 Piece</option><option>2 Piece</option><option>3 Piece</option>
            </Form.Select>
            <Form.Control as="textarea" rows={3} className="mb-2" placeholder="Description (fabric, embroidery, dupatta...)" value={f.desc || ""} onChange={(e) => setF({ ...f, desc: e.target.value })} />
            <Form.Label className="small mb-0">Photos (up to 4, the first one is the main photo)</Form.Label>
            <Form.Control type="file" accept="image/*" multiple className="mb-2" onChange={pickPhotos} />
            {photos.length > 0 && <div className="d-flex gap-2 mb-2">{photos.map((src, k) => <img key={k} src={src} className="thumb" alt="" />)}</div>}
            <Form.Check type="checkbox" id="isNew" className="mb-2" label="New arrival" checked={!!f.isNew} onChange={(e) => setF({ ...f, isNew: e.target.checked })} />
            <Form.Select className="mb-3" value={f.stock ? "1" : "0"} onChange={(e) => setF({ ...f, stock: e.target.value === "1" })}>
              <option value="1">In stock</option><option value="0">Out of stock</option>
            </Form.Select>
            <Button type="submit" disabled={busy} className="me-2">{id ? "Save" : "Add product"}</Button>
            {id && <Button variant="outline-secondary" onClick={() => { setId(null); setF(EMPTY); }}>Cancel</Button>}
          </Form>
        </Card>
      </Col>
      <Col lg={8}>
        <Table responsive hover className="align-middle bg-white">
          <thead><tr><th></th><th>Name</th><th>Price</th><th>Sale</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.img ? <img src={p.img} className="thumb" alt="" /> : <div className="thumb" />}</td>
                <td>
                  {p.name}{p.isNew && <span className="badge text-bg-dark ms-2">NEW</span>}
                  <br /><small className="text-muted">{p.cat}{p.pieces ? ` · ${p.pieces}` : ""}</small>
                </td>
                <td>{money(s, p.price)}</td>
                <td>
                  {p.sale ? (
                    <>
                      {money(s, p.sale)}<br />
                      <small className={saleActive(p) ? "text-success" : "text-muted"}>
                        {saleActive(p) ? "Active" : "Not active"}{p.saleEnd ? ` · ends ${p.saleEnd}` : ""}
                      </small>
                    </>
                  ) : "—"}
                </td>
                <td>{p.stock ? "Yes" : "No"}</td>
                <td className="text-nowrap">
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => { setId(p.id); setF({ ...EMPTY, ...p }); window.scrollTo(0, 0); }}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => window.confirm("Delete this product?") && deleteProduct(p.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Col>
    </Row>
  );
}

/* ================= ORDERS ================= */
export function OrdersTab({ orders, s }) {
  const intl = (ph = "") => { const d = ph.replace(/\D/g, ""); return d.startsWith("0") ? "92" + d.slice(1) : d; };
  return (
    <Table responsive className="align-middle bg-white">
      <thead>
        <tr><th>Order</th><th>Customer</th><th>Items</th><th>Payment</th><th>Total</th><th>Status</th><th></th></tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id}>
            <td className="small">
              <b>{o.orderNo || "—"}</b><br />
              <span className="text-muted">{fmtDate(o.createdAt)}</span>
            </td>
            <td className="small">
              <b>{o.customer.name}</b><br />
              📞 {o.customer.phone}
              {o.contact && <><br />✉️ {o.contact}</>}
              <br />📍 {o.customer.address}
              {o.customer.phone && (
                <><br /><a href={`https://wa.me/${intl(o.customer.phone)}`} target="_blank" rel="noreferrer">WhatsApp customer</a></>
              )}
            </td>
            <td className="small">{o.items.map((i) => `${i.name}${i.pieces ? ` (${i.pieces})` : ""} x${i.qty}`).join(", ")}</td>
            <td className="small">{o.payment || "Cash on Delivery"}</td>
            <td>
              {money(s, o.total)}
              {(o.discount > 0 || o.shipping > 0) && (
                <div className="small text-muted">
                  {o.discount > 0 && <>Disc -{money(s, o.discount)}<br /></>}
                  {o.shipping > 0 && <>Ship {money(s, o.shipping)}</>}
                </div>
              )}
            </td>
            <td>
              <Form.Select size="sm" value={o.status} onChange={(e) => updateOrder(o.id, { status: e.target.value })}>
                {["new", "confirmed", "shipped", "delivered", "cancelled"].map((x) => <option key={x}>{x}</option>)}
              </Form.Select>
            </td>
            <td><Button size="sm" variant="outline-danger" onClick={() => window.confirm("Delete order?") && deleteOrder(o.id)}>✕</Button></td>
          </tr>
        ))}
        {!orders.length && <tr><td colSpan={7} className="text-center text-muted py-4">No orders yet.</td></tr>}
      </tbody>
    </Table>
  );
}

/* ================= SETTINGS ================= */
const SLIDE_FIELDS = [
  ["hero_summer", "Summer slide"],
  ["hero_winter", "Winter slide"],
  ["hero_new", "New Arrivals slide"],
  ["hero_sale", "Sale slide"],
];

export function SettingsTab({ s }) {
  const [f, setF] = useState(s);
  const [ok, setOk] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const pickSlide = (k) => async (e) => {
    const file = e.target.files[0];
    if (file) setF({ ...f, [k]: await resize(file, 1400, 0.6) });
  };

  return (
    <Card body style={{ maxWidth: 560 }}>
      <Form onSubmit={async (e) => { e.preventDefault(); await saveSettings(f); setOk(true); setTimeout(() => setOk(false), 2000); }}>
        <Form.Label>Store name</Form.Label><Form.Control className="mb-2" value={f.name} onChange={set("name")} />
        <Form.Label>Tagline</Form.Label><Form.Control className="mb-3" value={f.tagline} onChange={set("tagline")} />

        <h6 className="mt-3">Hero slideshow background images</h6>
        <p className="small text-muted">Optional. Upload a wide landscape image for each slide. Without one, the slide uses a colour gradient. Keep to a few images so the page stays fast.</p>
        {SLIDE_FIELDS.map(([k, label]) => (
          <div key={k} className="mb-3">
            <Form.Label className="small mb-0">{label}</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={pickSlide(k)} />
            {f[k] && (
              <div className="d-flex align-items-center gap-2 mt-1">
                <img src={f[k]} alt="" style={{ height: 56, borderRadius: 6 }} />
                <Button size="sm" variant="outline-danger" type="button" onClick={() => setF({ ...f, [k]: "" })}>Remove</Button>
              </div>
            )}
          </div>
        ))}

        <Form.Label className="mt-2">WhatsApp number (with country code, e.g. 923001234567)</Form.Label>
        <Form.Control className="mb-2" value={f.wa} onChange={set("wa")} />
        <Form.Label>Currency label</Form.Label><Form.Control className="mb-3" value={f.cur} onChange={set("cur")} />
        <Button type="submit">Save settings</Button> {ok && <span className="text-success ms-2">Saved ✓</span>}
      </Form>
    </Card>
  );
}