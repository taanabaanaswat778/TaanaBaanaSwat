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
    const f = () => setBar(window.scrollY > 500);
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
      <button onClick={() => setN(Math.max(1, n - 1))} aria-label="Decrease">−</button>
      <span>{n}</span>
      <button onClick={() => setN(Math.min(max, n + 1))} aria-label="Increase">+</button>
    </div>
  );

  return shell(
    <>
      <Container className="py-4 pd-wrap">
        <Breadcrumb
          items={[
            { label: "Home", href: "#/" },
            ...(p.cat ? [{ label: p.cat, href: "#/c/" + encodeURIComponent(p.cat) }] : []),
            { label: p.name },
          ]}
        />
        <Row className="g-4 mt-1">
          <Col md={7}>
            <div className="pd-gallery">
              {imgs.length > 1 && (
                <div className="pd-thumbs">
                  {imgs.map((src, k) => <img key={k} src={src} alt="" className={k === i ? "on" : ""} onClick={() => setI(k)} />)}
                </div>
              )}
              <div className="pd-main">
                {cur ? <img src={cur} alt={p.name} /> : <div className="product-ph">👗</div>}
                {onSale && <span className="pd-off">-{off}%</span>}
                {imgs.length > 1 && (
                  <>
                    <button className="pd-arrow l" onClick={() => setI((i - 1 + imgs.length) % imgs.length)} aria-label="Previous">‹</button>
                    <button className="pd-arrow r" onClick={() => setI((i + 1) % imgs.length)} aria-label="Next">›</button>
                  </>
                )}
              </div>
            </div>
          </Col>

          <Col md={5}>
            <h1 className="pd-title">{title}</h1>
            <div className="pd-price my-2">
              {onSale && <s>{money(s, p.price)}</s>}
              <b>{money(s, eff(p))}</b>
            </div>
            <div className="text-muted small mb-1">Availability: <span className="text-dark">{available ? "In Stock" : "Out of Stock"}</span></div>
            {remain && <div className={"remain mb-3" + (left <= 3 ? " low" : "")}>{remain}</div>}

            <div className="d-flex gap-2 flex-wrap mb-3 mt-2">
              {available && (
                <>
                  {Qty}
                  <Button variant="dark" className="pill px-4" onClick={addNow}>Add to cart</Button>
                  <Button variant="outline-dark" className="pill px-4" onClick={() => cart.buy(p.id, n)}>Buy now</Button>
                </>
              )}
              <Button
                variant={liked ? "danger" : "outline-secondary"}
                className="pill px-3"
                onClick={() => toggleWishlist(p.id)}
              >{liked ? "♥ In wishlist" : "♡ Add to wishlist"}</Button>
            </div>
            {liked && <div className="small mb-3"><a href="#/wishlist">View my wishlist →</a></div>}

            {!available && (
              <div className="req-box">
                <p className="mb-2"><b>This design is out of stock.</b> Save it to your wishlist, or send us a WhatsApp for details and availability.</p>
                <a className="btn btn-success pill px-4" href={askOut} target="_blank" rel="noreferrer">Request on WhatsApp</a>
              </div>
            )}

            {available && left !== null && (
              <div className="req-box">
                <div className="small mb-2">Need a larger quantity than {left}?</div>
                <div className="d-flex gap-2 flex-wrap">
                  <a className="btn btn-success btn-sm pill px-3" href={askMore} target="_blank" rel="noreferrer">WhatsApp us</a>
                  <Button size="sm" variant="outline-dark" className="pill px-3" onClick={needMore}>♡ Add to wishlist &amp; request</Button>
                </div>
              </div>
            )}

            <Accordion flush className="pd-acc">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Description</Accordion.Header>
                <Accordion.Body>{desc}</Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Delivery &amp; Returns</Accordion.Header>
                <Accordion.Body>
                  Standard delivery within Pakistan is 4-5 working days (Sat-Sun are not included). Sale items are non-exchangeable.{" "}
                  <a href="#/policy/shipping">Read full shipping policy</a>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>Care Instructions</Accordion.Header>
                <Accordion.Body><ul className="mb-0">{CARE.map((c) => <li key={c}>{c}</li>)}</ul></Accordion.Body>
              </Accordion.Item>
            </Accordion>

            {saleActive(p) && (
              <div className="pd-banner">
                <b>End of Season Sale</b>
                <div className="small">{p.saleEnd ? `Sale ends ${shortDate(p.saleEnd)}` : "Limited time deals on our best selling collections"}</div>
              </div>
            )}
            <div className="small text-muted">🚚 Free shipping nationwide on orders above {s.cur}5,000</div>
          </Col>
        </Row>

        {rel.length > 0 && (
          <>
            <h2 className="section-title mt-5">You may also like</h2>
            <Row xs={2} md={4} className="g-3 g-md-4">
              {rel.map((x) => (
                <ProductCard key={x.id} p={x} s={s} onAdd={(pid) => cart.add(pid)} onBuy={(pid) => cart.buy(pid)} />
              ))}
            </Row>
          </>
        )}
      </Container>

      {bar && available && (
        <div className="pd-bar">
          {cur && <img src={cur} alt="" />}
          <div className="pd-bar-info">
            <div className="small fw-semibold">{title}</div>
            <div className="small">{onSale && <s className="text-muted me-2">{money(s, p.price)}</s>}<b className={onSale ? "text-danger" : ""}>{money(s, eff(p))}</b></div>
          </div>
          {Qty}
          <Button variant="dark" className="pill px-4" onClick={addNow}>Add to cart</Button>
        </div>
      )}
    </>
  );
}