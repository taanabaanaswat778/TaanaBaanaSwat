import { useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { eff, money, SHIPPING } from "../utils";
import { PiTrash, PiShoppingCart, PiTruck } from "react-icons/pi";

const nameOf = (p) => `${p.pieces ? p.pieces + " - " : ""}${p.name}${p.pieces ? " (Unstitched)" : ""}`;

export default function Cart({ show, onHide, items, products = [], s, qty, remove, add }) {
  const [k, setK] = useState(0);
  
  const safeProducts = Array.isArray(products) ? products : [];
  const subtotal = items.reduce((a, { p, q }) => a + eff(p) * q, 0);
  const inCart = new Set(items.map(({ p }) => p.id));
  
  const rel = safeProducts.filter((p) => !inCart.has(p.id) && p.stock).slice(0, 5);
  const cur = rel.length ? rel[k % rel.length] : null;
  
  const left = Math.max(0, SHIPPING.freeAbove - subtotal);
  const pct = Math.min(100, (subtotal / SHIPPING.freeAbove) * 100);
  const checkout = () => { onHide(); window.location.hash = "#/checkout"; };

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" className="ct">
      <Offcanvas.Header closeButton className="ct-header">
        <Offcanvas.Title className="ct-title">
          <PiShoppingCart size={20} /> Shopping Cart
        </Offcanvas.Title>
      </Offcanvas.Header>
      
      <Offcanvas.Body className="ct-body">
        {!items.length ? (
          <div className="ct-empty">
            <div className="ct-empty-icon"><PiShoppingCart /></div>
            <h4>Your cart is empty</h4>
            <p>Looks like you haven't added anything yet.</p>
            <button className="ct-btn-primary" onClick={onHide}>Start Shopping</button>
          </div>
        ) : (
          <>
            <div className="ct-scroll">
              
              {/* Free Shipping Bar */}
              <div className="ct-ship-box">
                <div className="ct-ship-text">
                  <PiTruck size={18} /> 
                  {left > 0 
                    ? <span>Add <b>{money(s, left)}</b> more for <b>free shipping</b></span> 
                    : <span>🎉 You've unlocked <b>free shipping</b>!</span>}
                </div>
                <div className="ct-bar"><i style={{ width: pct + "%" }} /></div>
              </div>

              {/* Cart Items */}
              <div className="ct-items">
                {items.map(({ p, q }) => (
                  <div key={p.id} className="ct-item">
                    <a href={`#/product/${p.id}`} onClick={onHide} className="ct-img-link">
                      {p.img ? <img src={p.img} alt="" className="ct-img" /> : <div className="ct-img" />}
                    </a>
                    <div className="ct-item-info">
                      <a href={`#/product/${p.id}`} onClick={onHide} className="ct-name">{nameOf(p)}</a>
                      <div className="ct-price">{money(s, eff(p))}</div>
                      
                      <div className="ct-qty">
                        {q === 1 ? (
                          <button onClick={() => remove(p.id)} aria-label="Remove" className="ct-trash"><PiTrash size={16} /></button>
                        ) : (
                          <button onClick={() => qty(p.id, -1)} aria-label="Decrease">−</button>
                        )}
                        <span>{q}</span>
                        <button onClick={() => qty(p.id, 1)} aria-label="Increase">+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* You May Also Like */}
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
                  
                  <button className="ct-add-btn" onClick={() => add(cur.id)}>+ Add to Cart</button>
                  
                  <div className="ct-dots">
                    {rel.map((r, i) => <i key={r.id} className={i === k % rel.length ? "on" : ""} />)}
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Checkout */}
            <div className="ct-foot">
              <div className="ct-sub">
                <span>Subtotal</span>
                <span>{money(s, subtotal)}</span>
              </div>
              <div className="ct-note">Shipping and discounts are calculated at checkout.</div>
              
              <button className="ct-btn-primary" onClick={checkout}>
                Check Out
              </button>
              <button className="ct-btn-ghost" onClick={onHide}>
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}