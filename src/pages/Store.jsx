import { useState } from "react";
import { DEMO } from "../data";
import Header from "../components/Header";
import { SideMenu } from "../components/Menu";
import { Hero } from "../components/Hero";
import PromoCards from "../components/PromoCards";
import Collection from "../components/Collection";
import Cart from "../components/Cart";
import Footer from "../components/Footer";
import { buildMenu } from "../menuLinks";
import { useCart } from "../hooks";
import { PiTruck, PiWhatsappLogo, PiDress } from "react-icons/pi";

export default function Store({ products, s, loading, error }) {
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState(false);
  const cart = useCart(products);

  const go = (f) => { window.location.hash = "#/c/" + encodeURIComponent(f); };
  const menuItems = buildMenu(products, go);
  const wa = s.wa ? `https://wa.me/${s.wa.replace(/\D/g, "")}` : "";
  
  const links = (
    <div className="mt-4 border-t border-gray-200 pt-2">
      <a className="block py-2 text-sm text-gray-700 hover:text-brand" href="#/track">Track Your Order</a>
      {wa && <a className="block py-2 text-sm text-gray-700 hover:text-brand" href={wa} target="_blank" rel="noreferrer">Contact on WhatsApp</a>}
    </div>
  );

  return (
    <>
      <Header s={s} count={cart.count} onMenu={() => setMenu(true)} onCart={() => cart.setOpen(true)} search={search} setSearch={setSearch} links={menuItems} active="" />
      <SideMenu show={menu} onHide={() => setMenu(false)} title={s.name} items={menuItems} active="">{links}</SideMenu>
      
      {DEMO && (
        <div className="bg-yellow-50 text-yellow-800 text-center text-xs py-1">
          Demo mode: data is saved in this browser only. Add Firebase keys to go live.
        </div>
      )}

      <Hero s={s} products={products} />
      
      {/* 4th Screenshot Fix: Trust Strip */}
      <div className="trust-strip">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center md:justify-around gap-4">
          <span className="trust-item"><PiTruck className="text-green-700" size={18} /> Cash on Delivery</span>
          <span className="trust-item"><PiWhatsappLogo className="text-purple-600" size={18} /> Order via WhatsApp</span>
          <span className="trust-item"><PiDress className="text-blue-600" size={18} /> Unstitched Collection</span>
        </div>
      </div>

      <PromoCards products={products} onPick={go} />

      <div id="shop">
        <Collection 
          products={products} 
          s={s} 
          filter="All" 
          search={search} 
          onAdd={(id) => cart.add(id)} 
          onBuy={(id) => cart.buy(id)} 
          loading={loading}
          error={error}
        />
      </div>

      <Footer s={s} />
      <Cart show={cart.open} onHide={() => cart.setOpen(false)} items={cart.items} products={products} s={s} qty={cart.qty} remove={cart.remove} add={cart.add} />
    </>
  );
}