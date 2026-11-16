import { useState } from "react";
import { Container, Button } from "react-bootstrap";
import Header from "../components/Header";
import { SideMenu } from "../components/Menu";
import { Breadcrumb } from "../components/Breadcrumb";
import Cart from "../components/Cart";
import Footer from "../components/Footer";
import { buildMenu } from "../menuLinks";
import { useCart } from "../hooks";
import { useWishlist, toggleWishlist } from "../wishlist";
import { eff, money, inStock, stockLeft, remainText, waUrl, productLink } from "../utils";
import { PiHeart, PiWhatsappLogo, PiShoppingCart, PiTrash, PiArrowRight } from "react-icons/pi";

const nameOf = (p) => `${p.pieces ? p.pieces + " - " : ""}${p.name}${p.pieces ? " (Unstitched)" : ""}`;

export default function Wishlist({ products, s }) {
  const cart = useCart(products);
  const ids = useWishlist();
  const [menu, setMenu] = useState(false);
  const [want, setWant] = useState({}); // quantity the customer needs, per product

  const go = (f) => { window.location.hash = "#/c/" + encodeURIComponent(f); };
  const menuItems = buildMenu(products, go);
  
  // Get products that are actually in the wishlist
  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const qtyOf = (id) => Math.max(1, Math.floor(Number(want[id] ?? 1)) || 1);

  const msgFor = (p) => {
    const n = qtyOf(p.id);
    const left = stockLeft(p);
    const note = !inStock(p)
      ? "It shows out of stock. Please tell me when it will be available."
      : left !== null && n > left
      ? `I need ${n} pieces but only ${left} are in stock. Can you arrange the extra quantity?`
      : "Please send me more details.";
    return `Hi, I want this design: ${nameOf(p)}\nQuantity needed: ${n}\n${note}\n${productLink(p)}`;
  };
  
  const allMsg =
    "Hi, these are the designs I want:\n" +
    items.map((p, i) => `${i + 1}. ${nameOf(p)} x${qtyOf(p.id)}${inStock(p) ? "" : " (out of stock)"}\n${productLink(p)}`).join("\n") +
    "\nPlease send me details.";

  const links = (
    <div className="mt-4 border-top pt-2">
      <a className="menu-link" href="#/track">Track Your Order</a>
    </div>
  );

  return (
    <>
      <Header s={s} count={cart.count} onMenu={() => setMenu(true)} onCart={() => cart.setOpen(true)} search="" setSearch={() => {}} links={menuItems} active="" hideSearch />
      <SideMenu show={menu} onHide={() => setMenu(false)} title={s.name} items={menuItems} active="">{links}</SideMenu>

      <Container className="py-4 py-md-5" style={{ maxWidth: 900, minHeight: "60vh" }}>
        <Breadcrumb items={[{ label: "Home", href: "#/" }, { label: "My Wishlist" }]} />
        
        <div className="wl-header text-center my-4">
          <div className="wl-header-icon"><PiHeart /></div>
          <h1 className="section-title" style={{ margin: "10px 0 8px" }}>My Wishlist ({items.length})</h1>
          <p className="text-muted mx-auto" style={{ maxWidth: 500 }}>
            Save the designs you love. If a design is out of stock, or you need a larger quantity, send us a WhatsApp message and we will share the details.
          </p>
        </div>

        {!items.length ? (
          <div className="text-center py-5 wl-empty">
            <div className="wl-empty-icon"><PiHeart /></div>
            <h4 className="mt-3">Your wishlist is empty</h4>
            <p className="text-muted mb-4">Tap the heart on any design to save it here for later.</p>
            <a href="#/c/All" className="btn btn-dark pill px-4 py-2">Browse Collection <PiArrowRight /></a>
          </div>
        ) : (
          <>
            <div className="text-center mb-5">
              <a className="btn-wa-large" href={waUrl(s, allMsg)} target="_blank" rel="noreferrer">
                <PiWhatsappLogo size={20} /> Send my whole wishlist on WhatsApp
              </a>
            </div>

            <div className="wl-grid">
              {items.map((p) => {
                const left = stockLeft(p);
                const n = qtyOf(p.id);
                const out = !inStock(p);
                const over = !out && left !== null && n > left;
                
                return (
                  <div key={p.id} className="wl-card">
                    <a href={`#/product/${p.id}`} className="wl-card-img">
                      {p.img ? <img src={p.img} alt={p.name} /> : <div className="wl-ph">👗</div>}
                      {out && <span className="wl-badge out">Out of Stock</span>}
                      {!out && left !== null && left <= 3 && <span className="wl-badge low">Only {left} left</span>}
                    </a>
                    
                    <div className="wl-card-body">
                      <a className="wl-name" href={`#/product/${p.id}`}>{nameOf(p)}</a>
                      
                      <div className="wl-price-row">
                        <b>{money(s, eff(p))}</b>
                        {eff(p) < p.price && <s className="text-muted ms-2">{money(s, p.price)}</s>}
                      </div>

                      <div className="wl-status-row">
                        {out ? (
                          <span className="text-danger fw-semibold small">Currently unavailable</span>
                        ) : (
                          <span className="text-success fw-semibold small">{remainText(p) || "In Stock"}</span>
                        )}
                      </div>

                      <div className="wl-qty-row">
                        <label>Qty needed:</label>
                        <input 
                          type="number" 
                          min="1" 
                          value={want[p.id] ?? 1} 
                          onChange={(e) => setWant({ ...want, [p.id]: e.target.value })} 
                        />
                      </div>

                      {(out || over) && (
                        <div className="wl-alert">
                          {out 
                            ? "This design is out of stock. Send us a WhatsApp for details." 
                            : `You need more than the ${left} we have. Send us a WhatsApp and we'll arrange it.`}
                        </div>
                      )}

                      <div className="wl-actions">
                        <a className="btn-wa-small" href={waUrl(s, msgFor(p))} target="_blank" rel="noreferrer">
                          <PiWhatsappLogo size={16} /> WhatsApp
                        </a>
                        
                        {!out && !over && (
                          <Button size="sm" variant="dark" className="btn-add-wl" onClick={() => cart.add(p.id, n)}>
                            <PiShoppingCart size={16} /> Add to Cart
                          </Button>
                        )}
                        
                        <button className="btn-remove-wl" onClick={() => toggleWishlist(p.id)} title="Remove from wishlist">
                          <PiTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Container>

      <Footer s={s} />
      <Cart show={cart.open} onHide={() => cart.setOpen(false)} items={cart.items} products={products} s={s} qty={cart.qty} remove={cart.remove} add={cart.add} />
    </>
  );
}