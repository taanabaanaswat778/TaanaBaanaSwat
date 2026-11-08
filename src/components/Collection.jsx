import { useState } from "react";
import { Row, Col, Badge, Button, Form } from "react-bootstrap";
import { eff, money, shortDate, inCollection, collectionName, inStock, stockLeft, remainText } from "../utils";
import { toggleWishlist, useWishlist } from "../wishlist";

export function ProductCard({ p, s, onAdd, onBuy }) {
  const onSale = eff(p) < p.price;
  const href = `#/product/${p.id}`;
  const liked = useWishlist().includes(p.id);
  const left = stockLeft(p);
  const remain = remainText(p);

  return (
    <Col className="text-center">
      <div className="position-relative">
        <a href={href} className="card-link">
          {p.img ? <img src={p.img} alt={p.name} className="product-img" /> : <div className="product-ph">👗</div>}
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
        <div className="small fw-semibold mt-2">{p.pieces ? `${p.pieces} - ` : ""}{p.name}{p.pieces ? " (Unstitched)" : ""}</div>
      </a>
      <div className="mb-1 small">
        <span className={onSale ? "text-danger fw-bold" : "text-muted"}>{money(s, eff(p))}</span>
        {onSale && <span className="text-muted text-decoration-line-through ms-2">{money(s, p.price)}</span>}
        {onSale && p.saleEnd && <div className="text-danger" style={{ fontSize: 12 }}>Sale ends {shortDate(p.saleEnd)}</div>}
      </div>

      {remain && <div className={"remain" + (left <= 3 ? " low" : "")}>{remain}</div>}

      {inStock(p) ? (
        <div className="d-flex gap-1 justify-content-center flex-wrap">
          <Button size="sm" variant="dark" className="pill px-3" onClick={() => onAdd(p.id)}>Add to cart</Button>
          <Button size="sm" variant="outline-dark" className="pill px-3" onClick={() => onBuy(p.id)}>Buy now</Button>
        </div>
      ) : <span className="text-muted small">Out of stock</span>}
    </Col>
  );
}

export default function Collection({ products, s, filter, search = "", onAdd, onBuy }) {
  const [sort, setSort] = useState("rel");
  const [cols, setCols] = useState(4);

  const q = search.trim().toLowerCase();
  let shown = products.filter((p) => inCollection(p, filter) && (!q || p.name.toLowerCase().includes(q)));
  if (sort === "low") shown = [...shown].sort((a, b) => eff(a) - eff(b));
  if (sort === "high") shown = [...shown].sort((a, b) => eff(b) - eff(a));

  const label = filter === "All" ? "All products" : collectionName(filter);

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
        <Row xs={2} md={cols} className="g-3 g-md-4">
          {shown.map((p) => <ProductCard key={p.id} p={p} s={s} onAdd={onAdd} onBuy={onBuy} />)}
        </Row>
      ) : (
        <p className="text-center text-muted py-5">
          {q ? "No suits match your search." : `No products in ${label} right now.`}
        </p>
      )}
    </>
  );
}