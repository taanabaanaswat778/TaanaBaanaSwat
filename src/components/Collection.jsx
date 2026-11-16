import { useState, useEffect, useRef } from "react";
import { Row, Col, Badge, Button, Form, Spinner } from "react-bootstrap";
import { eff, money, shortDate, inCollection, collectionName, inStock, stockLeft, remainText } from "../utils";
import { toggleWishlist, useWishlist } from "../wishlist";
import { PiCaretDown, PiArrowsDownUp, PiHeart, PiHeartFill } from "react-icons/pi";

export function ProductCard({ p, s, onAdd, onBuy }) {
  const onSale = eff(p) < p.price;
  const href = `#/product/${p.id}`;
  const liked = useWishlist().includes(p.id);
  const left = stockLeft(p);
  const remain = remainText(p);

  return (
    <Col className="text-center">
      <div className="product-card h-100">
        <div className="product-img-wrap position-relative overflow-hidden">
          <a href={href} className="card-link">
            {p.img ? (
              <img src={p.img} alt={p.name} className="product-img w-100" />
            ) : (
              <div className="product-ph">👗</div>
            )}
          </a>
          
          {onSale && <Badge bg="danger" className="sale-badge">SALE -{Math.round(100 - (eff(p) / p.price) * 100)}%</Badge>}
          {!onSale && p.isNew && <Badge bg="dark" className="sale-badge">NEW</Badge>}
          
          <button
            type="button"
            className={"wish" + (liked ? " on" : "")}
            onClick={() => toggleWishlist(p.id)}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          >
            {liked ? <PiHeartFill /> : <PiHeart />}
          </button>
        </div>

        <div className="product-info">
          <a href={href} className="card-link">
            <div className="product-title">
              {p.pieces ? `${p.pieces} - ` : ""}{p.name}{p.pieces ? " (Unstitched)" : ""}
            </div>
          </a>
          
          <div className="product-price-wrap">
            <span className={onSale ? "price-sale" : "price-normal"}>{money(s, eff(p))}</span>
            {onSale && <span className="price-old">{money(s, p.price)}</span>}
          </div>
          
          {remain ? (
            <div className={"product-stock" + (left <= 3 ? " low" : "")}>
              {remain}
            </div>
          ) : (
             <div className="product-stock" style={{ opacity: 0 }}>In Stock</div>
          )}

          <div className="product-actions">
            {inStock(p) ? (
              <>
                <Button size="sm" variant="dark" className="btn-add-cart" onClick={() => onAdd(p.id)}>Add to cart</Button>
                <Button size="sm" variant="outline-dark" className="btn-buy-now" onClick={() => onBuy(p.id)}>Buy now</Button>
              </>
            ) : (
              <Button size="sm" variant="secondary" disabled className="btn-out-stock">Out of stock</Button>
            )}
          </div>
        </div>
      </div>
    </Col>
  );
}

// Custom Dropdown Component
const SortDropdown = ({ sort, setSort }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const options = [
    { value: "rel", label: "Most Relevant" },
    { value: "low", label: "Price: Low to High" },
    { value: "high", label: "Price: High to Low" },
  ];

  const activeLabel = options.find((o) => o.value === sort)?.label || "Sort By";

  return (
    <div className="custom-sort" ref={ref}>
      <button className="sort-btn" onClick={() => setOpen(!open)}>
        <PiArrowsDownUp /> <span>{activeLabel}</span> <PiCaretDown className={open ? "rotated" : ""} />
      </button>
      {open && (
        <div className="sort-menu">
          {options.map((o) => (
            <button 
              key={o.value} 
              className={"sort-item " + (sort === o.value ? "on" : "")}
              onClick={() => { setSort(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
        <Button variant="dark" className="pill px-4 mt-2" onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="collection-controls">
        <div className="cc-left">
          <h5 className="cc-title">{q ? `Search Results for "${search}"` : label}</h5>
          <span className="cc-count">{shown.length} Products</span>
        </div>
        
        <div className="cc-right">
          <SortDropdown sort={sort} setSort={setSort} />
          <div className="grid-toggle d-none d-lg-flex">
            {[2, 3, 4].map((n) => (
              <button key={n} className={"grid-btn " + (cols === n ? "on" : "")} onClick={() => setCols(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {shown.length ? (
        <>
          <Row xs={2} md={cols} className="g-3 g-md-4">
            {visibleProducts.map((p) => <ProductCard key={p.id} p={p} s={s} onAdd={onAdd} onBuy={onBuy} />)}
          </Row>
          
          {visibleCount < shown.length && (
            <div className="text-center mt-5 mb-4">
              <Button variant="outline-dark" className="pill px-4 py-2" onClick={() => setVisibleCount((prev) => prev + 16)}>
                Load More Products
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-5">
          <div style={{ fontSize: 44, marginBottom: 16 }}>🔍</div>
          <h5>No products found</h5>
          <p className="text-muted">{q ? "Try searching for a different keyword." : `We haven't added any products to ${label} yet.`}</p>
        </div>
      )}
    </>
  );
}