import { useState } from "react";
import { Container, Row, Col, Form, FloatingLabel, Button } from "react-bootstrap";
import { addOrder } from "../data";
import { useCart } from "../hooks";
import { eff, money, shippingFor } from "../utils";
import { BackHome } from "../components/Breadcrumb";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";

// ===== EDIT THESE =====
const CODES = { WELCOME10: 10 };                 // discount codes, written as CODE: percent off
const FALLBACK_WA = "923091812140";              // used if no WhatsApp number is saved in Admin > Settings
const PAYMENTS = [
  { id: "cod", label: "Cash on Delivery (COD)", note: "Pay in cash when your order arrives." },
  {
    id: "manual",
    label: "Bank Transfer / JazzCash / Easypaisa",
    note: "Send the payment to the account below, then send the screenshot to us on WhatsApp. We confirm your order after we receive it.\n\nAccount title: Your Name\nJazzCash / Easypaisa: 0300-0000000\nBank account: 0000-0000000000",
  },
];
// ======================

const nameOf = (p) => `${p.pieces ? p.pieces + " - " : ""}${p.name}${p.pieces ? " (Unstitched)" : ""}`;

export default function Checkout({ products, s }) {
  const cart = useCart(products);
  const saved = (() => { try { return JSON.parse(localStorage.getItem("checkout_info") || "null"); } catch { return null; } })();
  const [f, setF] = useState({ first: "", last: "", address: "", city: "", phone: "", save: true, ...(saved || {}) });
  const [pay, setPay] = useState("cod");
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(null);
  const [codeMsg, setCodeMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const field = (k, label, props = {}) => (
    <FloatingLabel controlId={"co-" + k} label={label} className="mb-2">
      <Form.Control placeholder={label} value={f[k]} onChange={set(k)} {...props} />
    </FloatingLabel>
  );

  const items = cart.items;
  const subtotal = items.reduce((a, { p, q }) => a + eff(p) * q, 0);
  const discount = applied ? Math.round((subtotal * applied.pct) / 100) : 0;
  const ship = shippingFor(subtotal);
  const total = subtotal - discount + ship;
  const wa = (s.wa || FALLBACK_WA).replace(/\D/g, "");
  const payLabel = (PAYMENTS.find((m) => m.id === pay) || PAYMENTS[0]).label;

  const apply = () => {
    const c = code.trim().toUpperCase();
    if (CODES[c]) { setApplied({ code: c, pct: CODES[c] }); setCodeMsg(`${CODES[c]}% discount applied`); }
    else { setApplied(null); setCodeMsg("Invalid discount code"); }
  };

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (f.phone.replace(/\D/g, "").length < 10) return setErr("Please enter a valid phone number.");

    setBusy(true);
    const lines = items.map(({ p, q }) => ({ id: p.id, name: p.name, pieces: p.pieces || "", price: eff(p), qty: q }));
    const order = {
      orderNo: "TB" + Date.now().toString().slice(-7),
      customer: {
        name: `${f.first} ${f.last}`.trim(),
        first: f.first,
        last: f.last,
        phone: f.phone,
        country: "Pakistan",
        city: f.city,
        address: [f.address, f.city, "Pakistan"].filter(Boolean).join(", "),
      },
      items: lines,
      subtotal,
      discount,
      discountCode: applied ? applied.code : "",
      shipping: ship,
      total,
      payment: payLabel,
      status: "new",
    };
    try {
      await addOrder(order);
      try {
        if (f.save) localStorage.setItem("checkout_info", JSON.stringify({ first: f.first, last: f.last, address: f.address, city: f.city, phone: f.phone, save: true }));
        else localStorage.removeItem("checkout_info");
      } catch {}
      cart.clear();
      setDone(order);
      window.scrollTo(0, 0);
    } catch {
      setErr("Could not place your order. Please try again.");
    }
    setBusy(false);
  }

  const waText = (o) =>
    `New order ${o.orderNo}\n${o.items.map((l) => `- ${l.name}${l.pieces ? ` (${l.pieces} Unstitched)` : ""} x${l.qty} = ${s.cur} ${l.price * l.qty}`).join("\n")}\n` +
    `Subtotal: ${s.cur} ${o.subtotal}\n` + (o.discount ? `Discount: -${s.cur} ${o.discount}\n` : "") +
    `Shipping: ${o.shipping ? s.cur + " " + o.shipping : "Free"}\nTotal: ${s.cur} ${o.total}\n\n` +
    `Name: ${o.customer.name}\nPhone: ${o.customer.phone}\nAddress: ${o.customer.address}\nPayment: ${o.payment}`;

  const shell = (body) => (
    <>
      <header className="track-top">
        <BackHome label="Continue shopping" />
        <a href="#/"><img src={logo} alt={s.name} className="track-logo" /></a>
        <span />
      </header>
      {body}
      <Footer s={s} />
    </>
  );

  // ----- Order placed -----
  if (done) {
    const m = PAYMENTS.find((x) => x.label === done.payment);
    return shell(
      <Container className="co-done py-5">
        <div className="co-check">✓</div>
        <h2>Thank you, {done.customer.first || "friend"}!</h2>
        <p className="text-muted">Your order <b>{done.orderNo}</b> has been placed. We will contact you on {done.customer.phone} to confirm it.</p>
        <div className="co-sum text-start my-4" style={{ position: "static" }}>
          {done.items.map((l) => (
            <div key={l.id} className="co-row"><span>{l.name} × {l.qty}</span><span>{money(s, l.price * l.qty)}</span></div>
          ))}
          <hr />
          <div className="co-row"><span>Shipping</span><span>{done.shipping ? money(s, done.shipping) : "FREE"}</span></div>
          <div className="co-row co-total"><span>Total</span><span>{money(s, done.total)}</span></div>
          <div className="small text-muted mt-2">Payment: {done.payment}</div>
          {m && m.id === "manual" && <div className="co-pay-note mt-2">{m.note}</div>}
        </div>
        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <a className="co-wa" href={`https://wa.me/${wa}?text=${encodeURIComponent(waText(done))}`} target="_blank" rel="noreferrer">Send order on WhatsApp</a>
          <a className="back-home" href="#/"><span>Continue shopping</span></a>
        </div>
      </Container>
    );
  }

  if (!products.length) return shell(<p className="text-center py-5">Loading…</p>);
  if (!items.length) {
    return shell(
      <Container className="text-center py-5">
        <h3 className="mb-3">Your cart is empty</h3>
        <a href="#/" className="back-home"><span>Continue shopping</span></a>
      </Container>
    );
  }

  const summary = (
    <div className="co-sum">
      {items.map(({ p, q }) => (
        <div key={p.id} className="co-line">
          <div className="co-thumb">
            {p.img ? <img src={p.img} alt="" /> : <div className="co-ph" />}
            <span className="co-badge">{q}</span>
          </div>
          <div className="flex-grow-1 small">{nameOf(p)}</div>
          <div className="small">{money(s, eff(p) * q)}</div>
        </div>
      ))}

      <div className="d-flex gap-2 my-3">
        <Form.Control placeholder="Discount code" value={code} onChange={(e) => setCode(e.target.value)} />
        <Button variant="outline-dark" onClick={apply}>Apply</Button>
      </div>
      {codeMsg && <div className={"small mb-2 " + (applied ? "text-success" : "text-danger")}>{codeMsg}</div>}

      <div className="co-row"><span>Subtotal</span><span>{money(s, subtotal)}</span></div>
      {discount > 0 && <div className="co-row text-success"><span>Discount ({applied.code})</span><span>-{money(s, discount)}</span></div>}
      <div className="co-row"><span>Shipping</span><span>{ship ? money(s, ship) : "FREE"}</span></div>
      <div className="co-row co-total"><span>Total</span><span><small className="text-muted fw-normal">PKR </small>{money(s, total)}</span></div>
    </div>
  );

  return shell(
    <Container className="co-wrap py-4">
      <Row className="g-4">
        <Col lg={7} className="order-2 order-lg-1">
          <Form onSubmit={submit}>
            <h2 className="co-h" style={{ marginTop: 4 }}>Delivery</h2>
            <Row className="g-2">
              <Col sm={6}>{field("first", "First name", { required: true })}</Col>
              <Col sm={6}>{field("last", "Last name", { required: true })}</Col>
            </Row>
            {field("address", "Address", { required: true })}
            <Row className="g-2">
              <Col sm={6}>{field("city", "City", { required: true })}</Col>
              <Col sm={6}>{field("phone", "Phone", { required: true, type: "tel" })}</Col>
            </Row>
            <Form.Check type="checkbox" id="co-save" label="Save this information for next time" checked={f.save} onChange={set("save")} />

            <h2 className="co-h">Shipping method</h2>
            <div className="co-pay on d-flex justify-content-between">
              <span>Standard (4-5 working days)</span>
              <b>{ship ? money(s, ship) : "FREE"}</b>
            </div>

            <h2 className="co-h">Payment</h2>
            <div className="small text-muted mb-2">All orders are confirmed by our team before dispatch.</div>
            {PAYMENTS.map((m) => (
              <div key={m.id} className={"co-pay" + (pay === m.id ? " on" : "")} onClick={() => setPay(m.id)}>
                <Form.Check type="radio" name="pay" id={"pay-" + m.id} label={m.label} checked={pay === m.id} onChange={() => setPay(m.id)} />
                {pay === m.id && <div className="co-pay-note">{m.note}</div>}
              </div>
            ))}

            {err && <div className="alert alert-danger mt-3 mb-0 py-2">{err}</div>}
            <button type="submit" className="co-btn" disabled={busy}>{busy ? "Placing order…" : `Place order · ${money(s, total)}`}</button>
          </Form>
        </Col>
        <Col lg={5} className="order-1 order-lg-2">{summary}</Col>
      </Row>
    </Container>
  );
}