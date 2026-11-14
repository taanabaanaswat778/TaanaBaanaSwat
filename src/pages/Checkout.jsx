import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { addOrder, subDiscounts } from "../data";
import { useCart } from "../hooks";
import { eff, money, shippingFor } from "../utils";
import { BackHome } from "../components/Breadcrumb";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";
import { 
  PiTruck, PiCreditCard, PiBank, PiCheckCircle, PiTag, 
  PiLockKey, PiUser, PiMapPin, PiPhone, PiShoppingBag
} from "react-icons/pi";

const FALLBACK_WA = "923091812140";
const PAYMENTS = [
  { id: "cod", label: "Cash on Delivery", icon: <PiTruck />, note: "Pay in cash when your order arrives." },
  {
    id: "manual",
    label: "Bank Transfer / JazzCash / Easypaisa",
    icon: <PiBank />,
    note: "Send the payment to the account below, then send the screenshot to us on WhatsApp.\n\nAccount title: Taana Baana\nJazzCash / Easypaisa: 0309-1812140\nBank: Meezan Bank\nAccount: 0000-0000000000",
  },
];

const nameOf = (p) => `${p.pieces ? p.pieces + " - " : ""}${p.name}${p.pieces ? " (Unstitched)" : ""}`;

export default function Checkout({ products, s }) {
  const cart = useCart(products);
  const saved = (() => { try { return JSON.parse(localStorage.getItem("checkout_info") || "null"); } catch { return null; } })();
  const [f, setF] = useState({ first: "", last: "", address: "", city: "", phone: "", save: true, ...(saved || {}) });
  const [pay, setPay] = useState("cod");
  
  const [code, setCode] = useState("");
  const [activeDiscounts, setActiveDiscounts] = useState([]);
  const [applied, setApplied] = useState(null);
  const [codeMsg, setCodeMsg] = useState("");
  
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);

  useEffect(() => {
    const unsub = subDiscounts(setActiveDiscounts);
    return () => unsub();
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  
  const field = (k, label, Icon, props = {}) => (
    <div className="co-input-group">
      <span className="co-input-icon">{Icon}</span>
      <input className="co-input" placeholder={label} value={f[k]} onChange={set(k)} {...props} />
      <label className="co-floating-label">{label}</label>
    </div>
  );

  const items = cart.items;
  const subtotal = items.reduce((a, { p, q }) => a + eff(p) * q, 0);
  
  const discount = applied ? applied.amount : 0;
  const ship = shippingFor(subtotal);
  const total = subtotal - discount + ship;
  
  const wa = (s.wa || FALLBACK_WA).replace(/\D/g, "");
  const payLabel = (PAYMENTS.find((m) => m.id === pay) || PAYMENTS[0]).label;

  // ====== DISCOUNT LOGIC WITH START & END DATES ======
  const apply = () => {
    const c = code.trim().toUpperCase();
    const found = activeDiscounts.find((d) => d.code === c);
    const today = new Date().toLocaleDateString("en-CA");

    if (!found) {
      setApplied(null);
      return setCodeMsg("Invalid discount code.");
    }

    // Check Start Date
    if (found.startDate && found.startDate > today) {
      setApplied(null);
      return setCodeMsg(`This code is scheduled to start on ${found.startDate}.`);
    }

    // Check End Date
    if (found.endDate && found.endDate < today) {
      setApplied(null);
      return setCodeMsg("This discount code has expired.");
    }

    // Check Minimum Order
    if (found.minOrder > 0 && subtotal < found.minOrder) {
      setApplied(null);
      return setCodeMsg(`This code requires a minimum order of ${money(s, found.minOrder)}.`);
    }

    // Calculate Discount
    let discountAmt = 0;
    if (found.type === "percent") {
      discountAmt = Math.round((subtotal * found.value) / 100);
    } else {
      discountAmt = found.value;
    }
    discountAmt = Math.min(discountAmt, subtotal);

    setApplied({ code: found.code, amount: discountAmt });
    setCodeMsg(`Discount applied successfully!`);
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
        <div className="co-check"><PiCheckCircle /></div>
        <h2>Thank you, {done.customer.first || "friend"}!</h2>
        <p className="text-muted mb-4">Your order <b>#{done.orderNo}</b> has been placed successfully. We will contact you on {done.customer.phone} to confirm it.</p>
        
        <div className="co-done-summary">
          {done.items.map((l) => (
            <div key={l.id} className="co-row"><span>{l.name} × {l.qty}</span><span>{money(s, l.price * l.qty)}</span></div>
          ))}
          <hr />
          {done.discount > 0 && <div className="co-row text-success"><span>Discount ({done.discountCode})</span><span>-{money(s, done.discount)}</span></div>}
          <div className="co-row"><span>Shipping</span><span>{done.shipping ? money(s, done.shipping) : "FREE"}</span></div>
          <div className="co-row co-total"><span>Total</span><span>{money(s, done.total)}</span></div>
          <div className="small text-muted mt-3">Payment Method: {done.payment}</div>
          {m && m.id === "manual" && <div className="co-pay-note mt-2">{m.note}</div>}
        </div>

        <div className="d-flex gap-3 justify-content-center flex-wrap mt-4">
          <a className="co-wa" href={`https://wa.me/${wa}?text=${encodeURIComponent(waText(done))}`} target="_blank" rel="noreferrer">
            Send order details on WhatsApp
          </a>
          <a className="back-home" href="#/"><span>Continue shopping</span></a>
        </div>
      </Container>
    );
  }

  if (!products.length) return shell(<p className="text-center py-5">Loading…</p>);
  if (!items.length) {
    return shell(
      <Container className="text-center py-5">
        <div style={{ fontSize: 64, marginBottom: 16 }}>🛍️</div>
        <h3 className="mb-3">Your cart is empty</h3>
        <p className="text-muted mb-4">Looks like you haven't added anything to your cart yet.</p>
        <a href="#/" className="back-home"><span>Continue shopping</span></a>
      </Container>
    );
  }

  const summary = (
    <div className="co-summary-modern">
      <h3 className="co-sum-title"><PiShoppingBag /> Order Summary</h3>
      
      <div className="co-sum-items">
        {items.map(({ p, q }) => (
          <div key={p.id} className="co-sum-item">
            <div className="co-sum-img">
              {p.img ? <img src={p.img} alt="" /> : <div className="co-ph" />}
              <span className="co-sum-qty">{q}</span>
            </div>
            <div className="co-sum-name">{nameOf(p)}</div>
            <div className="co-sum-price">{money(s, eff(p) * q)}</div>
          </div>
        ))}
      </div>

      <div className="co-discount-box">
        <div className="co-input-group" style={{ marginBottom: 0 }}>
          <span className="co-input-icon"><PiTag /></span>
          <input 
            className="co-input" 
            placeholder="Discount code" 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && apply()}
          />
        </div>
        <Button variant="dark" className="co-apply-btn" onClick={apply}>Apply</Button>
      </div>
      {codeMsg && <div className={"small mb-3 " + (applied ? "text-success" : "text-danger")}>{codeMsg}</div>}

      <div className="co-sum-totals">
        <div className="co-sum-row"><span>Subtotal</span><span>{money(s, subtotal)}</span></div>
        {discount > 0 && <div className="co-sum-row text-success"><span>Discount ({applied.code})</span><span>-{money(s, discount)}</span></div>}
        <div className="co-sum-row"><span>Shipping</span><span>{ship ? money(s, ship) : <span className="text-success fw-bold">FREE</span>}</span></div>
        <div className="co-sum-row total"><span>Total</span><span><small>PKR</small> {money(s, total)}</span></div>
      </div>
    </div>
  );

  return shell(
    <Container className="co-wrap py-4 py-md-5">
      <Row className="g-4 g-lg-5">
        <Col lg={7} className="order-2 order-lg-1">
          <Form onSubmit={submit}>
            
            <div className="co-section">
              <h2 className="co-section-title"><PiUser /> Delivery Information</h2>
              <Row className="g-3">
                <Col sm={6}>{field("first", "First name", <PiUser />, { required: true })}</Col>
                <Col sm={6}>{field("last", "Last name", <PiUser />, { required: true })}</Col>
                <Col xs={12}>{field("address", "Street Address", <PiMapPin />, { required: true })}</Col>
                <Col sm={6}>{field("city", "City", <PiMapPin />, { required: true })}</Col>
                <Col sm={6}>{field("phone", "Phone Number", <PiPhone />, { required: true, type: "tel" })}</Col>
              </Row>
              <Form.Check type="checkbox" id="co-save" className="mt-3 co-checkbox" label="Save this information for next time" checked={f.save} onChange={set("save")} />
            </div>

            <div className="co-section">
              <h2 className="co-section-title"><PiTruck /> Shipping Method</h2>
              <div className="co-pay-card on">
                <div className="co-pay-header">
                  <div className="co-pay-radio"><div className="dot" /></div>
                  <div className="co-pay-content"><span className="co-pay-label">Standard Delivery (4-5 working days)</span></div>
                  <b className="co-pay-price">{ship ? money(s, ship) : "FREE"}</b>
                </div>
              </div>
            </div>

            <div className="co-section">
              <h2 className="co-section-title"><PiCreditCard /> Payment Method</h2>
              <p className="text-muted small mb-3">All transactions are secure and encrypted.</p>
              
              <div className="co-payment-grid">
                {PAYMENTS.map((m) => (
                  <div key={m.id} className={"co-pay-card " + (pay === m.id ? "on" : "")} onClick={() => setPay(m.id)}>
                    <div className="co-pay-header">
                      <div className="co-pay-radio">{pay === m.id && <div className="dot" />}</div>
                      <span className="co-pay-icon">{m.icon}</span>
                      <span className="co-pay-label">{m.label}</span>
                    </div>
                    {pay === m.id && <div className="co-pay-note">{m.note}</div>}
                  </div>
                ))}
              </div>
            </div>

            {err && <div className="msg bad mb-3">{err}</div>}
            
            <button type="submit" className="co-submit-btn" disabled={busy}>
              {busy ? "Processing..." : <><PiLockKey /> Place Order · {money(s, total)}</>}
            </button>
            
            <div className="co-secure-badge"><PiLockKey /> Secure Checkout</div>
          </Form>
        </Col>
        
        <Col lg={5} className="order-1 order-lg-2">
          {summary}
        </Col>
      </Row>
    </Container>
  );
}