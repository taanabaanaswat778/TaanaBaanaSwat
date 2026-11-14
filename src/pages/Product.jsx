import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Accordion } from "react-bootstrap";
import Header from "../components/Header";
import { SideMenu } from "../components/Menu";
import { ProductCard } from "../components/Collection";
import { Breadcrumb, BackHome } from "../components/Breadcrumb";
import Cart from "../components/Cart";
import Footer from "../components/Footer";
import { buildMenu } from "../menuLinks";
import { useCart } from "../hooks";
import { toggleWishlist, useWishlist } from "../wishlist";
import { eff, money, shortDate, saleActive, inStock, stockLeft, remainText, waUrl, productLink } from "../utils";
import { 
  PiHeart, PiHeartFill, PiTruck, PiShieldCheck, PiWhatsappLogo, 
  PiCaretLeft, PiCaretRight, PiCheckCircle, PiArrowRight
} from "react-icons/pi";

// ===== EDIT: care instructions shown on every product =====
const CARE = ["Dry clean recommended", "Do not bleach", "Iron on low heat", "Wash dark colours separately"];
// ==========================================================

export default function Product({ products, s, id }) {
  const cart = useCart(products);
  const wished = useWishlist();
  const [menu, setMenu] = useState(false);
  const [n, setN] = useState(1);
  const [i, setI] = useState(0);
  const [bar, setBar] = useState(false);

  useEffect(() => { setN(1); setI(0); }, [id]);
  useEffect(() => {
    const f = () => setBar(window.scrollY > 600);
    f();
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);

  const go = (f) => { window.location.hash = "#/c/" + encodeURIComponent(f); };
  const menuItems = buildMenu(products, go);
  const links = (
    <div className="mt-4 border-top pt-2">
      <a className="menu-link" href="#/track">Track Your Order</a>
    </div>
  );
  const p = products.find((x) => x.id === id);

  const shell = (body) => (
    <>
      <Header s={s} count={cart.count} onMenu={() => setMenu(true)} onCart={() => cart.setOpen(true)} search="" setSearch={() => {}} links={menuItems} active="" hideSearch />
      <SideMenu show={menu} onHide={() => setMenu(false)} title={s.name} items={menuItems} active="">{links}</SideMenu>
      {body}
      <Footer s={s} />
      <Cart show={cart.open} onHide={() => cart.setOpen(false)} items={cart.items} products={products} s={s} qty={cart.qty} remove={cart.remove} add={cart.add} />
    </>
  );

  if (!p) {
    return shell(
      <Container className="text-center py-5">
        <h3 className="mb-3">{products.length ? "Product not found" : "Loading…"}</h3>
        <BackHome />
      </Container>
    );
  }

  const imgs = p.imgs && p.imgs.length ? p.imgs : p.img ? [p.img] : [];
  const cur = imgs[i] || imgs[0];
  const onSale = eff(p) < p.price;
  const off = onSale ? Math.round(100 - (eff(p) / p.price) * 100) : 0;
  const title = `${p.pieces ? p.pieces + " - " : ""}${p.name}${p.pieces ? " (Unstitched)" : ""}`;
  
  const rel = [
    ...products.filter((x) => x.id !== p.id && x.cat === p.cat),
    ...products.filter((x) => x.id !== p.id && x.cat !== p.cat),
  ].slice(0, 4);
  const desc = p.desc || `${p.pieces || ""} unstitched suit${p.cat ? ` from our ${p.cat} collection` : ""}.`.trim();

  const available = inStock(p);
  const left = stockLeft(p);
  const remain = remainText(p);
  const max = left === null ? 99 : left;
  const liked = wished.includes(p.id);

  const addNow = () => cart.add(p.id, n);
  const askOut = waUrl(s, `Hi, I want this design: ${title}\nIt shows out of stock. Please send me details and when it will be available.\n${productLink(p)}`);
  const askMore = waUrl(s, `Hi, I want this design: ${title}\nI need a larger quantity than the ${left} you have in stock. Can you arrange it?\n${productLink(p)}`);
  const needMore = () => { if (!liked) toggleWishlist(p.id); window.location.hash = "#/wishlist"; };

  const Qty = (
    <div className="pd-qty">
      <button onClick={() => setN(Math.max(1, n - 1))} disabled={n <= 1} aria-label="Decrease">−</button>
      <span>{n}</span>
      <button onClick={() => setN(Math.min(max, n + 1))} disabled={n >= max} aria-label="Increase">+</button>
    </div>
  );

  return shell(
    <>
      <Container className="py-4 pd-wrap">
        <div className="mb-3">
          <Breadcrumb
            items={[
              { label: "Home", href: "#/" },
              ...(p.cat ? [{ label: p.cat, href: "#/c/" + encodeURIComponent(p.cat) }] : []),
              { label: p.name },
            ]}
          />
        </div>

        <Row className="g-4 g-lg-5 mt-1">
          {/* LEFT: GALLERY */}
          <Col lg={7}>
            <div className="pd-gallery-modern">
              {imgs.length > 1 && (
                <div className="pd-thumbs-modern">
                  {imgs.map((src, k) => (
                    <img 
                      key={k} 
                      src={src} 
                      alt="" 
                      className={k === i ? "on" : ""} 
                      onClick={() => setI(k)} 
                    />
                  ))}
                </div>
              )}
              <div className="pd-main-modern">
                {cur ? <img src={cur} alt={p.name} /> : <div className="product-ph">👗</div>}
                {onSale && <span className="pd-off">{off}% OFF</span>}
                
                {imgs.length > 1 && (
                  <>
                    <button className="pd-arrow-modern l" onClick={() => setI((i - 1 + imgs.length) % imgs.length)} aria-label="Previous">
                      <PiCaretLeft />
                    </button>
                    <button className="pd-arrow-modern r" onClick={() => setI((i + 1) % imgs.length)} aria-label="Next">
                      <PiCaretRight />
                    </button>
                  </>
                )}
              </div>
            </div>
          </Col>

          {/* RIGHT: DETAILS */}
          <Col lg={5}>
            <div className="pd-info">
              <h1 className="pd-title-modern">{title}</h1>
              
              <div className="pd-price-modern">
                {onSale && <s>{money(s, p.price)}</s>}
                <b>{money(s, eff(p))}</b>
                {onSale && <span className="pd-save-badge">Save {money(s, p.price - eff(p))}</span>}
              </div>

              <div className="pd-stock">
                {available ? (
                  <span className="in-stock"><PiCheckCircle /> In Stock {remain && <span className="remain-text">({remain})</span>}</span>
                ) : (
                  <span className="out-stock">Out of Stock</span>
                )}
              </div>

              <div className="pd-actions-row">
                {available && (
                  <>
                    {Qty}
                    <Button variant="dark" className="btn-add-cart" onClick={addNow}>Add to cart</Button>
                    <Button variant="outline-dark" className="btn-buy-now" onClick={() => cart.buy(p.id, n)}>Buy now</Button>
                  </>
                )}
                <button 
                  className={"pd-wish-btn " + (liked ? "on" : "")} 
                  onClick={() => toggleWishlist(p.id)}
                  title={liked ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {liked ? <PiHeartFill /> : <PiHeart />}
                </button>
              </div>

              {!available && (
                <div className="pd-request-box out">
                  <p><b>This design is currently out of stock.</b> Save it to your wishlist, or message us on WhatsApp for details and availability.</p>
                  <a className="btn-wa" href={askOut} target="_blank" rel="noreferrer">
                    <PiWhatsappLogo size={18} /> Request on WhatsApp
                  </a>
                </div>
              )}

              {available && left !== null && (
                <div className="pd-request-box">
                  <div className="pd-req-text">
                    Need a larger quantity than {left}? We can arrange it for you.
                  </div>
                  <div className="pd-req-actions">
                    <a className="btn-wa" href={askMore} target="_blank" rel="noreferrer">
                      <PiWhatsappLogo size={18} /> WhatsApp us
                    </a>
                    <Button size="sm" variant="outline-dark" className="btn-wish-req" onClick={needMore}>
                      <PiHeart /> Request
                    </Button>
                  </div>
                </div>
              )}

              {saleActive(p) && (
                <div className="pd-sale-banner">
                  <b>End of Season Sale</b>
                  <span>{p.saleEnd ? `Ends ${shortDate(p.saleEnd)}` : "Limited time deals"}</span>
                </div>
              )}

              <div className="pd-trust">
                <div className="pd-trust-item"><PiTruck size={20} /> Free delivery on orders above Rs. 5,000</div>
                <div className="pd-trust-item"><PiShieldCheck size={20} /> Cash on Delivery available</div>
              </div>

              <Accordion flush className="pd-acc">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Description</Accordion.Header>
                  <Accordion.Body>{desc}</Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Delivery &amp; Returns</Accordion.Header>
                  <Accordion.Body>
                    Standard delivery within Pakistan is 4-5 working days (Sat-Sun are not included). Sale items are non-exchangeable.{" "}
                    <a href="#/policy/shipping" className="text-danger fw-semibold">Read full shipping policy</a>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>Care Instructions</Accordion.Header>
                  <Accordion.Body>
                    <ul className="mb-0">{CARE.map((c) => <li key={c}>{c}</li>)}</ul>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          </Col>
        </Row>

        {/* RELATED PRODUCTS */}
        {rel.length > 0 && (
          <div className="mt-5 pt-4 border-top">
            <h2 className="section-title">You may also like</h2>
            <Row xs={2} md={4} className="g-3 g-md-4">
              {rel.map((x) => (
                <ProductCard key={x.id} p={x} s={s} onAdd={(pid) => cart.add(pid)} onBuy={(pid) => cart.buy(pid)} />
              ))}
            </Row>
          </div>
        )}
      </Container>

      {/* STICKY BOTTOM BAR */}
      {bar && available && (
        <div className="pd-sticky-bar">
          {cur && <img src={cur} alt="" />}
          <div className="pd-sticky-info">
            <div className="pd-sticky-title">{title}</div>
            <div className="pd-sticky-price">
              {onSale && <s>{money(s, p.price)}</s>}
              <b className={onSale ? "text-danger" : ""}>{money(s, eff(p))}</b>
            </div>
          </div>
          {Qty}
          <Button variant="dark" className="btn-add-cart" onClick={addNow}>Add to cart</Button>
        </div>
      )}
    </>
  );
}