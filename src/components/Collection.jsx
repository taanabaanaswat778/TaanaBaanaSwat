import { useState, useEffect, useRef } from "react";
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
    <div className="product-card group text-center">
      <div className="product-img-wrap">
        <a href={href} className="block w-full h-full">
          {p.img ? (
            <img src={p.img} alt={p.name} className="product-img" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-[#e9d5c0]">👗</div>
          )}
        </a>
        
        {onSale && <span className="absolute top-1.5 left-1.5 bg-[#e30613] text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wider z-10">SALE -{Math.round(100 - (eff(p) / p.price) * 100)}%</span>}
        {!onSale && p.isNew && <span className="absolute top-1.5 left-1.5 bg-black text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wider z-10">NEW</span>}
        
        <button
          onClick={() => toggleWishlist(p.id)}
          className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-[14px] z-10 transition-transform hover:scale-110 ${liked ? "text-red-500" : "text-gray-600"}`}
        >
          {liked ? <PiHeartFill /> : <PiHeart />}
        </button>
      </div>

      <div className="flex flex-col items-center w-full px-1 flex-1 justify-between">
        <div className="w-full">
          <a href={href} className="product-title">
            {p.pieces ? `${p.pieces} - ` : ""}{p.name}{p.pieces ? " (Unstitched)" : ""}
          </a>
          
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className={onSale ? "product-price" : "text-[13px] font-bold text-black"}>
              {money(s, eff(p))}
            </span>
            {onSale && <span className="product-old-price">{money(s, p.price)}</span>}
          </div>

          <div className={`product-stock ${left !== null && left <= 3 ? "low" : ""}`}>
            {remain || <span className="opacity-0">In stock</span>}
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 w-full mt-1">
          {inStock(p) ? (
            <>
              <button onClick={() => onAdd(p.id)} className="btn-add-cart flex-1">Add to cart</button>
              <button onClick={() => onBuy(p.id)} className="btn-buy-now flex-1">Buy now</button>
            </>
          ) : (
            <span className="text-gray-500 text-[10px] font-semibold py-1.5 uppercase tracking-wider">Out of stock</span>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <div className="relative" ref={ref}>
      <button className="bg-white border border-gray-300 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 hover:border-black transition-colors" onClick={() => setOpen(!open)}>
        <PiArrowsDownUp /> <span>{activeLabel}</span> <PiCaretDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-1 z-50 min-w-[160px]">
          {options.map((o) => (
            <button 
              key={o.value} 
              className={`block w-full text-left px-3 py-2 text-xs rounded-md hover:bg-gray-50 ${sort === o.value ? "bg-black text-white hover:bg-black" : "text-gray-700"}`}
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

  useEffect(() => { setVisibleCount(16); }, [filter, search, sort]);

  const safeProducts = Array.isArray(products) ? products : [];
  const q = search.trim().toLowerCase();
  let shown = safeProducts.filter((p) => inCollection(p, filter) && (!q || (p.name && p.name.toLowerCase().includes(q))));
  
  if (sort === "low") shown = [...shown].sort((a, b) => eff(a) - eff(b));
  if (sort === "high") shown = [...shown].sort((a, b) => eff(b) - eff(a));

  const label = filter === "All" ? "All products" : collectionName(filter);
  const visibleProducts = shown.slice(0, visibleCount);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 max-w-lg mx-auto">
        <div className="text-5xl mb-4">📶</div>
        <h4 className="text-xl font-bold mb-2">Could not load products</h4>
        <p className="text-gray-500 mb-6">{error.message || "Please check your internet connection."}</p>
        <button className="bg-black text-white px-6 py-2 rounded-full font-bold" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* 3rd Screenshot Fix: Collection Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div className="text-left w-full sm:w-auto">
          <h2 className="font-extrabold text-xl text-black m-0">{q ? `Search: "${search}"` : label}</h2>
          <span className="text-xs text-gray-500 font-medium">{shown.length} Products</span>
        </div>
        
        <div className="flex items-center gap-4">
          <SortDropdown sort={sort} setSort={setSort} />
          <div className="hidden lg:flex bg-gray-100 p-1 rounded-full gap-1">
            {[2, 3, 4].map((n) => (
              <button key={n} className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${cols === n ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`} onClick={() => setCols(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {shown.length ? (
        <>
          <div className={`grid grid-cols-2 ${cols === 2 ? "lg:grid-cols-2" : cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-3 md:gap-5`}>
            {visibleProducts.map((p) => (
              <ProductCard key={p.id} p={p} s={s} onAdd={onAdd} onBuy={onBuy} />
            ))}
          </div>
          
          {visibleCount < shown.length && (
            <div className="text-center mt-10 mb-6">
              <button className="border border-black text-black px-8 py-3 rounded-full font-bold text-sm uppercase hover:bg-black hover:text-white transition-colors" onClick={() => setVisibleCount((prev) => prev + 16)}>
                Load More Products
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h5 className="text-lg font-bold mb-1">No products found</h5>
          <p className="text-gray-500">{q ? "Try searching for a different keyword." : `We haven't added any products to ${label} yet.`}</p>
        </div>
      )}
    </div>
  );
}