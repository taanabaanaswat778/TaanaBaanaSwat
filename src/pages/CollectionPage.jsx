import { useState } from "react";
import Header from "../components/Header";
import { SideMenu } from "../components/Menu";
import Collection from "../components/Collection";
import { Breadcrumb } from "../components/Breadcrumb";
import Cart from "../components/Cart";
import Footer from "../components/Footer";
import { MENU, buildMenu } from "../menuLinks";
import { useCart } from "../hooks";
import { collectionName, inCollection } from "../utils";

// ===== EDIT: banner text and colours for each collection page =====
const INFO = {
  Sale: ["Limited time deals on our best selling suits", ["#2e2e2e", "#8a2c2c"]],
  New: ["Fresh unstitched designs that just landed", ["#b5545e", "#6d2733"]],
  Lawn: ["Light and breezy lawn suits for the season", ["#f6b44a", "#d9692b"]],
  Karandi: ["Warm, richly textured karandi suits", ["#5b6c8f", "#2b3558"]],
  Fancy: ["Chiffon, silk and organza for weddings and special events", ["#6b2a50", "#2d1230"]],
  Summer: ["Light lawn and cotton suits for the season", ["#f6b44a", "#e0702b"]],
  Winter: ["Warm khaddar, karandi and velvet suits", ["#5b6c8f", "#2b3558"]],
  All: ["Browse our complete unstitched collection", ["#3d2a1f", "#8b5e3c"]],
};
// ====================================================================

export default function CollectionPage({ products, s, name, loading, error }) {
  const cart = useCart(products);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState("");

  const go = (f) => { window.location.hash = "#/c/" + encodeURIComponent(f); };
  const menuItems = buildMenu(products, go);
  const title = name === "All" ? "All Products" : collectionName(name);
  const [text, colors] = INFO[name] || [`Browse our ${title} collection`, ["#3d2a1f", "#8b5e3c"]];
  const count = products.filter((p) => inCollection(p, name)).length;

  const wa = s.wa ? `https://wa.me/${s.wa.replace(/\D/g, "")}` : "";
  const links = (
    <div className="mt-4 border-t border-gray-200 pt-2">
      <a className="block py-2 text-sm text-gray-700 hover:text-brand" href="#/track">Track Your Order</a>
      {wa && <a className="block py-2 text-sm text-gray-700 hover:text-brand" href={wa} target="_blank" rel="noreferrer">Contact on WhatsApp</a>}
    </div>
  );

  return (
    <>
      <Header s={s} count={cart.count} onMenu={() => setMenu(true)} onCart={() => cart.setOpen(true)} search={search} setSearch={setSearch} links={menuItems} active={name} />
      <SideMenu show={menu} onHide={() => setMenu(false)} title={s.name} items={menuItems} active={name}>{links}</SideMenu>

      {/* Banner */}
      <section 
        className="text-white py-8 md:py-10"
        style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-4">
            <Breadcrumb items={[{ label: "Home", href: "#/" }, { label: title }]} />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-2">{title}</h1>
          <p className="text-white/90 text-sm max-w-lg mb-4">{text}</p>
          <span className="inline-block bg-white/20 border border-white/40 px-4 py-1 rounded-full text-xs font-semibold">
            {count} {count === 1 ? "product" : "products"}
          </span>
        </div>
      </section>

      {/* Quick Filter Chips */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
          {MENU.map((m) => (
            <a 
              key={m.key} 
              href={"#/c/" + encodeURIComponent(m.key)} 
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${m.key === name ? "bg-black text-white" : "bg-white border border-gray-300 text-gray-700 hover:border-black"}`}
            >
              {m.label}
            </a>
          ))}
        </div>
      </div>

      {/* Collection Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12" id="shop">
        <Collection 
          products={products} 
          s={s} 
          filter={name} 
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