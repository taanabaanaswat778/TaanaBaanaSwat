import { useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { eff, money, SHIPPING } from "../utils";

const Trash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
);
const nameOf = (p) => `${p.pieces ? p.pieces + " - " : ""}${p.name}${p.pieces ? " (Unstitched)" : ""}`;

// Added products = [] to prevent crash
export default function Cart({ show, onHide, items, products = [], s, qty, remove, add }) {
  const [k, setK] = useState(0);
  
  // SAFETY CHECK: Ensure products is an array before filtering
  const safeProducts = Array.isArray(products) ? products : [];

  const subtotal = items.reduce((a, { p, q }) => a + eff(p) * q, 0);
  const inCart = new Set(items.map(({ p }) => p.id));
  
  // Use safeProducts here
  const rel = safeProducts.filter((p) => !inCart.has(p.id) && p.stock).slice(0, 5);
  const cur = rel.length ? rel[k % rel.length] : null;
  
  const left = Math.max(0, SHIPPING.freeAbove - subtotal);
  const pct = Math.min(100, (subtotal / SHIPPING.freeAbove) * 100);
  const checkout = () => { onHide(); window.location.hash = "#/checkout"; };

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" className="ct">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="ct-title">Shopping cart</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="ct-body">
        {!items.length ? (
          <div className="text-center py-5 px-3">
            <div style={{ fontSize: 44 }}>🛍️</div>
            <p className="text-muted my-3">Your cart is empty.</p>
            <button className="ct-go" onClick={onHide}>Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="ct-scroll">
              <div className="ct-ship">
                {left > 0 ? <>Add <b>{money(s, left)}</b> more for <b>free shipping</b></> : <>🎉 You've got <b>free shipping</b></>}
                <div className="ct-bar"><i style={{ width: pct + "%" }} /></div>
              </div>

              {items.map(({ p, q }) => (
                <div key={p.id} className="ct-item">
                  {p.img ? <img src={p.img} alt="" className="ct-img" /> : <div className="ct-img" />}
                  <div className="flex-grow-1 min-w-0">
                    <div className="ct-name">{nameOf(p)}</div>
                    <div className="ct-price">{money(s, eff(p))}</div>
                    <div className="ct-qty">
                      {q === 1 ? (
                        <button onClick={() => remove(p.id)} aria-label="Remove"><Trash /></button>
                      ) : (
                        <button onClick={() => qty(p.id, -1)} aria-label="Decrease">−</button>
                      )}
                      <span>{q}</span>
                      <button onClick={() => qty(p.id, 1)} aria-label="Increase">+</button>
                    </div>
                  </div>
                </div>
              ))}

              {cur && (
                <div className="ct-rel">
                  <h6>You may also like</h6>
                  <div className="ct-rel-card">
                    <button className="ct-nav" onClick={() => setK((k - 1 + rel.length) % rel.length)} aria-label="Previous">‹</button>
                    <a href={`#/product/${cur.id}`} onClick={onHide} className="ct-rel-main">
                      {cur.img ? <img src={cur.img} alt="" /> : <div className="ct-rel-ph" />}
                      <div className="min-w-0">
                        <div className="ct-name">{nameOf(cur)}</div>
                        <div className="ct-price mb-0">{money(s, eff(cur))}</div>
                      </div>
                    </a>
                    <button className="ct-nav" onClick={() => setK((k + 1) % rel.length)} aria-label="Next">›</button>
                  </div>
                  <button className="ct-add" onClick={() => add(cur.id)}>+ Add to cart</button>
                  <div className="ct-dots">
                    {rel.map((r, i) => <i key={r.id} className={i === k % rel.length ? "on" : ""} />)}
                  </div>
                </div>
              )}
            </div>

            <div className="ct-foot">
              <div className="ct-sub"><span>Subtotal:</span><span>{money(s, subtotal)}</span></div>
              <div className="small text-muted mb-2">Shipping and discounts are calculated at checkout.</div>
              <button className="ct-view" onClick={onHide}>Continue shopping</button>
              <button className="ct-go" onClick={checkout}>Check out</button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}