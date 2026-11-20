import { useEffect, useState } from "react";
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
  PiCaretLeft, PiCaretRight, PiHeart, PiHeartFill, 
  PiTruck, PiShieldCheck, PiWhatsappLogo, PiCheckCircle 
} from "react-icons/pi";

const CARE = ["Dry clean recommended", "Do not bleach", "Iron on low heat", "Wash dark colours separately"];

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
  const p = products.find((x) => x.id === id);

  const shell = (body) => (
    <>
      <Header s={s} count={cart.count} onMenu={() => setMenu(true)} onCart={() => cart.setOpen(true)} search="" setSearch={() => {}} links={menuItems} active="" hideSearch />
      <SideMenu show={menu} onHide={() => setMenu(false)} title={s.name} items={menuItems} active="" />
      {body}
      <Footer s={s} />
      <Cart show={cart.open} onHide={() => cart.setOpen(false)} items={cart.items} products={products} s={s} qty={cart.qty} remove={cart.remove} add={cart.add} />
    </>
  );

  if (!p) {
    return shell(
      <div className="text-center py-20">
        <h3 className="text-xl font-bold mb-4">{products.length ? "Product not found" : "Loading…"}</h3>
        <BackHome />
      </div>
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

  const Qty = (
    <div className="inline-flex items-center border border-gray-300 rounded-full h-12 overflow-hidden bg-white">
      <button onClick={() => setN(Math.max(1, n - 1))} disabled={n <= 1} className="w-10 h-full text-lg hover:bg-gray-50 disabled:opacity-30">−</button>
      <span className="w-8 text-center font-bold">{n}</span>
      <button onClick={() => setN(Math.min(max, n + 1))} disabled={n >= max} className="w-10 h-full text-lg hover:bg-gray-50 disabled:opacity-30">+</button>
    </div>
  );

  return shell(
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8">
      
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb items={[{ label: "Home", href: "#/" }, ...(p.cat ? [{ label: p.cat, href: "#/c/" + encodeURIComponent(p.cat) }] : []), { label: p.name }]} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-4">
        
        {/* Left: Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          {imgs.length > 1 && (
            <div className="flex flex-row md:flex-col gap-2 w-full md:w-20 overflow-x-auto">
              {imgs.map((src, k) => (
                <img key={k} src={src} alt="" className={`w-16 md:w-full aspect-[3/4] object-cover rounded-lg cursor-pointer border-2 transition-all ${k === i ? "border-black opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`} onClick={() => setI(k)} />
              ))}
            </div>
          )}
          <div className="relative flex-1 rounded-2xl overflow-hidden bg-[#f5f2ec]">
            {cur ? <img src={cur} alt={p.name} className="w-full aspect-[3/4] object-cover" /> : <div className="aspect-[3/4] flex items-center justify-center text-6xl">👗</div>}
            {onSale && <span className="absolute top-4 right-4 bg-orange-500 text-white rounded-lg px-3 py-1.5 text-sm font-extrabold shadow-md">{off}% OFF</span>}
            
            {imgs.length > 1 && (
              <>
                <button className="absolute top-1/2 -translate-y-1/2 left-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white" onClick={() => setI((i - 1 + imgs.length) % imgs.length)}><PiCaretLeft size={20} /></button>
                <button className="absolute top-1/2 -translate-y-1/2 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white" onClick={() => setI((i + 1) % imgs.length)}><PiCaretRight size={20} /></button>
              </>
            )}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-extrabold text-black leading-tight mb-3">{title}</h1>
          
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {onSale && <s className="text-gray-500 text-lg">{money(s, p.price)}</s>}
            <b className="text-red-600 text-3xl font-extrabold">{money(s, eff(p))}</b>
            {onSale && <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">Save {money(s, p.price - eff(p))}</span>}
          </div>

          <div className="mb-5 text-sm font-semibold">
            {available ? (
              <span className="text-green-700 flex items-center gap-1.5"><PiCheckCircle /> In Stock {remain && <span className="text-orange-600">({remain})</span>}</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center mb-6">
            {available && (
              <>
                {Qty}
                <button className="flex-1 bg-black text-white rounded-md px-6 py-3 font-bold text-sm uppercase tracking-wider hover:bg-gray-800" onClick={addNow}>Add to cart</button>
                <button className="flex-1 border border-black text-black rounded-md px-6 py-3 font-bold text-sm uppercase tracking-wider hover:bg-gray-50" onClick={() => cart.buy(p.id, n)}>Buy now</button>
              </>
            )}
            <button className={`w-12 h-12 rounded-md border flex items-center justify-center text-xl transition-all ${liked ? "border-red-200 bg-red-50 text-red-500" : "border-gray-300 text-gray-600 hover:border-black"}`} onClick={() => toggleWishlist(p.id)}>
              {liked ? <PiHeartFill /> : <PiHeart />}
            </button>
          </div>

          {!available && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-6">
              <p className="text-sm font-medium mb-3"><b>This design is out of stock.</b> Save it to your wishlist, or message us on WhatsApp for details.</p>
              <a className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-md font-bold text-sm hover:bg-[#1da851]" href={askOut} target="_blank" rel="noreferrer">
                <PiWhatsappLogo size={18} /> Request on WhatsApp
              </a>
            </div>
          )}

          {available && left !== null && (
            <div className="bg-[#faf5f0] border border-[#eeeeee] rounded-xl p-5 mb-6">
              <div className="text-sm font-semibold mb-3">Need a larger quantity than {left}?</div>
              <div className="flex gap-2 flex-wrap">
                <a className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-md font-bold text-xs hover:bg-[#1da851]" href={askMore} target="_blank" rel="noreferrer">
                  <PiWhatsappLogo size={16} /> WhatsApp us
                </a>
                <button className="inline-flex items-center gap-2 border border-black text-black bg-white px-4 py-2 rounded-md font-bold text-xs hover:bg-gray-50" onClick={() => { if (!liked) toggleWishlist(p.id); window.location.hash = "#/wishlist"; }}>
                  <PiHeart /> Request
                </button>
              </div>
            </div>
          )}

          {saleActive(p) && (
            <div className="bg-black text-white rounded-lg p-4 flex justify-between items-center mb-6">
              <b className="text-sm font-bold">End of Season Sale</b>
              <span className="text-xs opacity-80">{p.saleEnd ? `Ends ${shortDate(p.saleEnd)}` : "Limited time deals"}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 mb-8">
            <div className="flex items-center gap-3 text-sm text-gray-600"><PiTruck size={20} className="text-brand" /> Free delivery on orders above Rs. 5,000</div>
            <div className="flex items-center gap-3 text-sm text-gray-600"><PiShieldCheck size={20} className="text-brand" /> Cash on Delivery available</div>
          </div>

          <div className="border-t border-gray-200">
            <details className="group border-b border-gray-200 py-4">
              <summary className="font-bold text-sm cursor-pointer flex justify-between items-center">Description <span className="transition group-open:rotate-180">▼</span></summary>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{desc}</p>
            </details>
            <details className="group border-b border-gray-200 py-4">
              <summary className="font-bold text-sm cursor-pointer flex justify-between items-center">Delivery & Returns <span className="transition group-open:rotate-180">▼</span></summary>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">Standard delivery within Pakistan is 4-5 working days. Sale items are non-exchangeable. <a href="#/policy/shipping" className="text-brand font-semibold">Read full policy</a></p>
            </details>
            <details className="group border-b border-gray-200 py-4">
              <summary className="font-bold text-sm cursor-pointer flex justify-between items-center">Care Instructions <span className="transition group-open:rotate-180">▼</span></summary>
              <ul className="text-sm text-gray-600 mt-3 list-disc pl-5 space-y-1">{CARE.map((c) => <li key={c}>{c}</li>)}</ul>
            </details>
          </div>
        </div>
      </div>

      {rel.length > 0 && (
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-extrabold text-center mb-8">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {rel.map((x) => (
              <ProductCard key={x.id} p={x} s={s} onAdd={(pid) => cart.add(pid)} onBuy={(pid) => cart.buy(pid)} />
            ))}
          </div>
        </div>
      )}

      {bar && available && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-3 flex items-center justify-between md:justify-center gap-4">
          {cur && <img src={cur} alt="" className="hidden md:block w-12 h-16 object-cover rounded-md" />}
          <div className="hidden md:block min-w-0 max-w-xs">
            <div className="text-sm font-bold truncate">{title}</div>
            <div className="text-sm">{onSale && <s className="text-gray-400 text-xs mr-2">{money(s, p.price)}</s>}<b className={onSale ? "text-red-600" : ""}>{money(s, eff(p))}</b></div>
          </div>
          {Qty}
          <button className="bg-black text-white rounded-md px-8 py-3 font-bold text-sm uppercase tracking-wider hover:bg-gray-800" onClick={addNow}>Add to cart</button>
        </div>
      )}
    </div>
  );
}