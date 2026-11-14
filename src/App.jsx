import { useEffect, useState } from "react";
import { useProducts, useSettings } from "./hooks";
import Store from "./pages/Store";
import CollectionPage from "./pages/CollectionPage";
import Admin from "./pages/Admin";
import Track from "./pages/Track";
import Policy from "./pages/Policy";
import Product from "./pages/Product";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Toaster from "./components/Toaster";
import StatusBanner from "./components/StatusBanner";

export default function App() {
  const { products, loading, error } = useProducts();
  const s = useSettings();
  const [hash, setHash] = useState(window.location.hash);
  
  useEffect(() => {
    const h = () => { setHash(window.location.hash); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  
  useEffect(() => { document.title = s.name; }, [s.name]);

  // A safety wrapper to ensure data is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  let page;
  if (hash === "#/admin") page = <Admin products={safeProducts} s={s} />;
  else if (hash === "#/track") page = <Track s={s} />;
  else if (hash === "#/checkout") page = <Checkout products={safeProducts} s={s} />;
  else if (hash === "#/wishlist") page = <Wishlist products={safeProducts} s={s} />;
  else if (hash.startsWith("#/policy/")) page = <Policy s={s} slug={hash.split("/")[2]} />;
  else if (hash.startsWith("#/product/")) page = <Product products={safeProducts} s={s} id={decodeURIComponent(hash.split("/")[2])} />;
  else if (hash.startsWith("#/c/")) page = <CollectionPage products={safeProducts} s={s} name={decodeURIComponent(hash.slice(4)) || "All"} loading={loading} error={error} />;
  else page = <Store products={safeProducts} s={s} loading={loading} error={error} />;

  return (
    <>
      <StatusBanner />
      {page}
      <Toaster />
    </>
  );
}