import { useState } from "react";
import { eff, money, SHIPPING } from "../utils";
import { PiTrash, PiShoppingCart, PiTruck, PiX } from "react-icons/pi";

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

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onHide} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#faf9f7] h-full flex flex-col shadow-2xl animate-slide-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
            <PiShoppingCart size={18} /> Shopping Cart
          </h2>
          <button onClick={onHide} className="p-2 text-gray-500 hover:text-black transition-colors">
            <PiX size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {!items.length ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-brand mb-4">
                <PiShoppingCart size={36} />
              </div>
              <h4 className="text-lg font-extrabold mb-2">Your cart is empty</h4>
              <p className="text-sm text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
              <button className="bg-black text-white rounded-xl px-8 py-3 font-bold text-sm uppercase tracking-wider hover:bg-gray-800" onClick={onHide}>
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Free Shipping Bar */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium mb-3">
                  <PiTruck size={18} className="text-brand" />
                  {left > 0 
                    ? <span>Add <b>{money(s, left)}</b> more for <b>free shipping</b></span> 
                    : <span>🎉 You've unlocked <b>free shipping</b>!</span>}
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex flex-col gap-3">
                {items.map(({ p, q }) => (
                  <div key={p.id} className="flex gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <a href={`#/product/${p.id}`} onClick={onHide} className="flex-shrink-0">
                      {p.img ? <img src={p.img} alt="" className="w-16 h-20 object-cover rounded-lg" /> : <div className="w-16 h-20 bg-gray-100 rounded-lg" />}
                    </a>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <a href={`#/product/${p.id}`} onClick={onHide} className="text-xs font-semibold text-black line-clamp-2 hover:text-brand">{nameOf(p)}</a>
                        <div className="text-xs text-gray-500 mt-1 font-medium">{money(s, eff(p))}</div>
                      </div>
                      
                      <div className="flex items-center border border-gray-300 rounded-md h-8 w-fit mt-2">
                        {q === 1 ? (
                          <button onClick={() => remove(p.id)} className="w-8 h-full text-red-600 flex items-center justify-center hover:bg-red-50 rounded-l-md transition-colors"><PiTrash size={14} /></button>
                        ) : (
                          <button onClick={() => qty(p.id, -1)} className="w-8 h-full text-black flex items-center justify-center hover:bg-gray-100 rounded-l-md">−</button>
                        )}
                        <span className="w-6 text-center text-xs font-bold">{q}</span>
                        <button onClick={() => qty(p.id, 1)} className="w-8 h-full text-black flex items-center justify-center hover:bg-gray-100 rounded-r-md">+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* You May Also Like */}
              {cur && (
                <div className="mt-8 pt-6 border-t border-dashed border-gray-300 text-center">
                  <h6 className="text-sm font-extrabold text-black mb-4 uppercase tracking-wider">You may also like</h6>
                  <div className="flex items-center gap-2 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black" onClick={() => setK((k - 1 + rel.length) % rel.length)}>‹</button>
                    <a href={`#/product/${cur.id}`} onClick={onHide} className="flex-1 flex gap-3 text-left">
                      {cur.img ? <img src={cur.img} alt="" className="w-14 h-18 object-cover rounded-md" /> : <div className="w-14 h-18 bg-gray-100 rounded-md" />}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold line-clamp-2">{nameOf(cur)}</div>
                        <div className="text-xs text-gray-500 mt-1">{money(s, eff(cur))}</div>
                      </div>
                    </a>
                    <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black" onClick={() => setK((k + 1) % rel.length)}>›</button>
                  </div>
                  <button className="w-full mt-3 bg-white border border-black rounded-lg py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors" onClick={() => add(cur.id)}>
                    + Add to Cart
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-lg font-extrabold">Subtotal</span>
              <span className="text-lg font-extrabold">{money(s, subtotal)}</span>
            </div>
            <div className="text-xs text-gray-500 mb-4">Shipping and discounts are calculated at checkout.</div>
            
            <button className="w-full bg-black text-white rounded-xl py-3.5 font-bold text-sm uppercase tracking-wider hover:bg-brand transition-colors" onClick={checkout}>
              Check Out
            </button>
            <button className="w-full bg-transparent border border-gray-200 text-gray-500 rounded-xl py-3 mt-2 font-semibold text-sm hover:bg-gray-50 transition-colors" onClick={onHide}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}