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

const nameOf = (p) => `${p.pieces ? p.pieces + " - " : ""}${p.name}${p.pieces ? " (Unstitched)" : ""}`;

export default function Wishlist({ products, s }) {
  const cart = useCart(products);
  const ids = useWishlist();
  const [menu, setMenu] = useState(false);
  const [want, setWant] = useState({}); // quantity the customer needs, per product

  const go = (f) => { window.location.hash = "#/c/" + encodeURIComponent(f); };
  const menuItems = buildMenu(products, go);
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

      <Container className="py-4" style={{ maxWidth: 900, minHeight: "55vh" }}>
        <Breadcrumb items={[{ label: "Home", href: "#/" }, { label: "My Wishlist" }]} />
        <h1 className="section-title" style={{ marginTop: 8 }}>My Wishlist ({items.length})</h1>
        <p className="text-center text-muted">
          Save the designs you love. If a design is out of stock, or you need a larger quantity, send us a WhatsApp and we will share the details.
        </p>

        {!items.length ? (
          <div className="text-center py-5">
            <div style={{ fontSize: 48 }}>♡</div>
            <p className="text-muted">Your wishlist is empty. Tap the heart on any design to save it here.</p>
            <a href="#/c/All" className="btn btn-dark pill px-4">Browse designs</a>
          </div>
        ) : (
          <>
            <div className="text-center mb-3">
              <a className="btn btn-success pill px-4" href={waUrl(s, allMsg)} target="_blank" rel="noreferrer">Send my whole wishlist on WhatsApp</a>
            </div>

            {items.map((p) => {
              const left = stockLeft(p);
              const n = qtyOf(p.id);
              const out = !inStock(p);
              const over = !out && left !== null && n > left;
              return (
                <div key={p.id} className="wl-item">
                  <a href={`#/product/${p.id}`}>{p.img ? <img src={p.img} alt={p.name} /> : <div className="wl-ph">👗</div>}</a>
                  <div className="wl-body">
                    <a className="wl-name" href={`#/product/${p.id}`}>{nameOf(p)}</a>
                    <div>
                      <b>{money(s, eff(p))}</b>
                      {eff(p) < p.price && <s className="text-muted ms-2">{money(s, p.price)}</s>}
                    </div>
                    <div className={"wl-status " + (out ? "out" : "in")}>{out ? "Out of stock" : remainText(p) || "In stock"}</div>

                    <label className="wl-qty">
                      How many do you need?
                      <input type="number" min="1" value={want[p.id] ?? 1} onChange={(e) => setWant({ ...want, [p.id]: e.target.value })} />
                    </label>
                    {out && <div className="wl-note">This design is out of stock. Send us a WhatsApp for details and availability.</div>}
                    {over && <div className="wl-note">You need more than the {left} we have in stock. Send us a WhatsApp and we will arrange it.</div>}

                    <div className="wl-actions">
                      <a className="btn btn-success btn-sm pill px-3" href={waUrl(s, msgFor(p))} target="_blank" rel="noreferrer">Send WhatsApp for details</a>
                      {!out && !over && <Button size="sm" variant="dark" className="pill px-3" onClick={() => cart.add(p.id, n)}>Add to cart</Button>}
                      <Button size="sm" variant="outline-secondary" className="pill px-3" onClick={() => toggleWishlist(p.id)}>Remove</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </Container>

      <Footer s={s} />
      <Cart show={cart.open} onHide={() => cart.setOpen(false)} items={cart.items} products={products} s={s} qty={cart.qty} remove={cart.remove} add={cart.add} />
    </>
  );
}