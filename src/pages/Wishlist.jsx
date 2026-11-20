import { useState } from "react";
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
  const [want, setWant] = useState({}); 

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
    <div className="mt-4 border-t border-gray-200 pt-2">
      <a className="block py-2 text-sm text-gray-700 hover:text-brand" href="#/track">Track Your Order</a>
    </div>
  );

  return (
    <>
      <Header s={s} count={cart.count} onMenu={() => setMenu(true)} onCart={() => cart.setOpen(true)} search="" setSearch={() => {}} links={menuItems} active="" hideSearch />
      <SideMenu show={menu} onHide={() => setMenu(false)} title={s.name} items={menuItems} active="">{links}</SideMenu>

      <div className="max-w-4xl mx-auto px-4 py-8 min-h-[60vh]">
        <Breadcrumb items={[{ label: "Home", href: "#/" }, { label: "My Wishlist" }]} />
        
        <div className="text-center my-8">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-3xl mx-auto mb-4">
            <PiHeart />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-2">My Wishlist ({items.length})</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Save the designs you love. If a design is out of stock, or you need a larger quantity, send us a WhatsApp message.
          </p>
        </div>

        {!items.length ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-4xl mx-auto mb-4">
              <PiHeart />
            </div>
            <h4 className="text-lg font-bold mb-2">Your wishlist is empty</h4>
            <p className="text-gray-500 text-sm mb-6">Tap the heart on any design to save it here for later.</p>
            <a href="#/c/All" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors">
              Browse Collection <PiArrowRight />
            </a>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <a className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:bg-[#1da851] transition-colors" href={waUrl(s, allMsg)} target="_blank" rel="noreferrer">
                <PiWhatsappLogo size={20} /> Send my whole wishlist on WhatsApp
              </a>
            </div>

            <div className="flex flex-col gap-4">
              {items.map((p) => {
                const left = stockLeft(p);
                const n = qtyOf(p.id);
                const out = !inStock(p);
                const over = !out && left !== null && n > left;
                
                return (
                  <div key={p.id} className="flex flex-col md:flex-row gap-4 bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow">
                    
                    <a href={`#/product/${p.id}`} className="relative w-full md:w-32 h-48 md:h-40 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                      {p.img ? <img src={p.img} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">👗</div>}
                      {out && <span className="absolute top-2 left-2 bg-black text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">Out of Stock</span>}
                      {!out && left !== null && left <= 3 && <span className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">Only {left} left</span>}
                    </a>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <a className="text-base font-bold text-black hover:text-brand mb-1" href={`#/product/${p.id}`}>{nameOf(p)}</a>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <b className="text-red-600 text-lg">{money(s, eff(p))}</b>
                        {eff(p) < p.price && <s className="text-gray-400 text-sm">{money(s, p.price)}</s>}
                      </div>

                      <div className="mb-3 text-sm font-semibold">
                        {out ? (
                          <span className="text-red-600">Currently unavailable</span>
                        ) : (
                          <span className="text-green-700">{remainText(p) || "In Stock"}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <label className="text-xs text-gray-500 font-medium">Qty needed:</label>
                        <input 
                          type="number" 
                          min="1" 
                          value={want[p.id] ?? 1} 
                          onChange={(e) => setWant({ ...want, [p.id]: e.target.value })} 
                          className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm font-semibold focus:outline-none focus:border-black"
                        />
                      </div>

                      {(out || over) && (
                        <div className="bg-yellow-50 text-yellow-800 text-xs font-medium p-2 rounded-md mb-3">
                          {out 
                            ? "This design is out of stock. Send us a WhatsApp for details." 
                            : `You need more than the ${left} we have. Send us a WhatsApp and we'll arrange it.`}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-auto">
                        <a className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-md font-semibold text-xs hover:bg-[#1da851] transition-colors" href={waUrl(s, msgFor(p))} target="_blank" rel="noreferrer">
                          <PiWhatsappLogo size={16} /> WhatsApp
                        </a>
                        
                        {!out && !over && (
                          <button className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md font-semibold text-xs hover:bg-gray-800 transition-colors" onClick={() => cart.add(p.id, n)}>
                            <PiShoppingCart size={16} /> Add to Cart
                          </button>
                        )}
                        
                        <button className="inline-flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-2 rounded-md border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors ml-auto" onClick={() => toggleWishlist(p.id)} title="Remove">
                          <PiTrash size={16} /> <span className="hidden md:inline ml-2 text-xs font-semibold">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Footer s={s} />
      <Cart show={cart.open} onHide={() => cart.setOpen(false)} items={cart.items} products={products} s={s} qty={cart.qty} remove={cart.remove} add={cart.add} />
    </>
  );
}