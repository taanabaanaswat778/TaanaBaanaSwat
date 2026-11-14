import { useState, useEffect } from "react";
import { Row, Col, Badge, Button, Form, Spinner } from "react-bootstrap";
import { eff, money, shortDate, inCollection, collectionName, inStock, stockLeft, remainText } from "../utils";
import { toggleWishlist, useWishlist } from "../wishlist";
import { DEMO } from "../data";

export function ProductCard({ p, s, onAdd, onBuy }) {
  const onSale = eff(p) < p.price;
  const href = `#/product/${p.id}`;
  const liked = useWishlist().includes(p.id);
  const left = stockLeft(p);
  const remain = remainText(p);

  return (
    <Col className="text-center">
      <div className="product-card position-relative">
        <div className="product-img-wrap position-relative overflow-hidden">
          <a href={href} className="card-link">
            {p.img ? <img src={p.img} alt={p.name} className="product-img w-100" /> : <div className="product-ph">👗</div>}
          </a>
          {onSale && <Badge bg="danger" className="sale-badge">SALE -{Math.round(100 - (eff(p) / p.price) * 100)}%</Badge>}
          {!onSale && p.isNew && <Badge bg="dark" className="sale-badge">NEW</Badge>}
          <button
            type="button"
            className={"wish" + (liked ? " on" : "")}
            onClick={() => toggleWishlist(p.id)}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            title="Wishlist"
          >{liked ? "♥" : "♡"}</button>
        </div>

        <a href={href} className="card-link">
          <div className="small fw-semibold mt-2 product-title">
            {p.pieces ? `${p.pieces} - ` : ""}{p.name || "Product"}{p.pieces ? " (Unstitched)" : ""}
          </div>
        </a>
        <div className="mb-1 small">
          <span className={onSale ? "text-danger fw-bold" : "text-muted"}>{money(s, eff(p))}</span>
          {onSale && <span className="text-muted text-decoration-line-through ms-2">{money(s, p.price)}</span>}
          {onSale && p.saleEnd && <div className="text-danger" style={{ fontSize: 12 }}>Sale ends {shortDate(p.saleEnd)}</div>}
        </div>

        {remain && <div className={"remain" + (left <= 3 ? " low" : "")}>{remain}</div>}

        <div className="product-actions mt-2">
          {inStock(p) ? (
            <div className="d-flex gap-1 justify-content-center flex-wrap">
              <Button size="sm" variant="dark" className="pill px-3 btn-add-cart" onClick={() => onAdd(p.id)}>Add to cart</Button>
              <Button size="sm" variant="outline-dark" className="pill px-3" onClick={() => onBuy(p.id)}>Buy now</Button>
            </div>
          ) : <span className="text-muted small">Out of stock</span>}
        </div>
      </div>
    </Col>
  );
}

export default function Collection({ products = [], s, filter, search = "", onAdd, onBuy, loading, error }) {
  const [sort, setSort] = useState("rel");
  const [cols, setCols] = useState(4);
  const [visibleCount, setVisibleCount] = useState(16);

  useEffect(() => {
    setVisibleCount(16);
  }, [filter, search, sort]);

  const safeProducts = Array.isArray(products) ? products : [];
  const q = search.trim().toLowerCase();
  let shown = safeProducts.filter((p) => inCollection(p, filter) && (!q || (p.name && p.name.toLowerCase().includes(q))));
  
  if (sort === "low") shown = [...shown].sort((a, b) => eff(a) - eff(b));
  if (sort === "high") shown = [...shown].sort((a, b) => eff(b) - eff(a));

  const label = filter === "All" ? "All products" : collectionName(filter);
  const visibleProducts = shown.slice(0, visibleCount);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" variant="dark" />
        <p className="text-muted mt-3">Loading products, please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5" style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>📶</div>
        <h4 className="mb-3">Could not load products</h4>
        <p className="text-muted">{error.message || "Please check your internet connection and try again."}</p>
        <div className="text-start bg-light p-3 rounded mb-4 small" style={{ border: "1px solid #ddd" }}>
          <h6 className="mb-2 text-dark">Debug Info:</h6>
          <div><b>Mode:</b> {DEMO ? "Demo Mode" : "Live (Firebase Connected)"}</div>
        </div>
        <Button variant="dark" className="pill px-4 mt-2" onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
        <small className="text-muted">{q ? `Results for "${search.trim()}"` : label} ({shown.length})</small>
        <Form.Select size="sm" className="rounded-pill w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="rel">Most relevant</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </Form.Select>
        <div className="btn-group btn-group-sm d-none d-md-inline-flex">
          {[2, 3, 4].map((n) => (
            <Button key={n} variant={cols === n ? "dark" : "outline-dark"} onClick={() => setCols(n)}>{n}</Button>
          ))}
        </div>
      </div>

      {shown.length ? (
        <>
          <Row xs={2} md={cols} className="g-3 g-md-4">
            {visibleProducts.map((p) => <ProductCard key={p.id} p={p} s={s} onAdd={onAdd} onBuy={onBuy} />)}
          </Row>
          
          {visibleCount < shown.length && (
            <div className="text-center mt-5 mb-4">
              <Button 
                variant="outline-dark" 
                className="pill px-4 py-2" 
                onClick={() => setVisibleCount((prev) => prev + 16)}
              >
                See more products
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-muted py-5">
          {q ? "No suits match your search." : `No products in ${label} right now.`}
        </p>
      )}
    </>
  );
}