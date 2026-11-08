import { useState } from "react";
import { Container } from "react-bootstrap";
import { DEMO } from "../data";
import Header from "../components/Header";
import { SideMenu } from "../components/Menu";
import { Hero, TrustStrip } from "../components/Hero";
import PromoCards from "../components/PromoCards";
import Collection from "../components/Collection";
import Cart from "../components/Cart";
import Footer from "../components/Footer";
import { buildMenu } from "../menuLinks";
import { useCart } from "../hooks";

export default function Store({ products, s }) {
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState(false);
  const cart = useCart(products);

  // Every link opens its own collection page
  const go = (f) => { window.location.hash = "#/c/" + encodeURIComponent(f); };
  const menuItems = buildMenu(products, go);
  const wa = s.wa ? `https://wa.me/${s.wa.replace(/\D/g, "")}` : "";
  const links = (
    <div className="mt-4 border-top pt-2">
      <a className="menu-link" href="#/track">Track Your Order</a>
      {wa && <a className="menu-link" href={wa} target="_blank" rel="noreferrer">Contact on WhatsApp</a>}
    </div>
  );

  return (
    <>
      <Header s={s} count={cart.count} onMenu={() => setMenu(true)} onCart={() => cart.setOpen(true)} search={search} setSearch={setSearch} links={menuItems} active="" />
      <SideMenu show={menu} onHide={() => setMenu(false)} title={s.name} items={menuItems} active="">{links}</SideMenu>
      {DEMO && <div className="bg-warning-subtle text-center small py-1">Demo mode: data is saved in this browser only. Add Firebase keys to go live.</div>}

      <Hero s={s} products={products} />
      <TrustStrip />
      <PromoCards products={products} onPick={go} />

      <Container className="pb-3" id="shop">
        <h2 className="section-title">All Products</h2>
        <Collection products={products} s={s} filter="All" search={search} onAdd={(id) => cart.add(id)} onBuy={(id) => cart.buy(id)} />
      </Container>

      <Footer s={s} />
      <Cart show={cart.open} onHide={() => cart.setOpen(false)} items={cart.items} products={products} s={s} qty={cart.qty} remove={cart.remove} add={cart.add} />
    </>
  );
}