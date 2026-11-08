import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { LOCAL, LOCAL_REASON, auth, ADMIN_UID, STORE_URL } from "./firebase";
import { subProducts, subOrders, resetLocal } from "./db";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Prices from "./pages/Prices";
import Orders from "./pages/Orders";
import Stock from "./pages/Stock";
import SearchBox from "./components/SearchBox";

const NAV = [
  ["dashboard", "Dashboard", "📊"],
  ["products", "Products", "👗"],
  ["prices", "Category Prices", "🏷️"],
  ["stock", "Import Stock", "📥"],
  ["orders", "Orders", "📦"],
];
const readPage = () => window.location.hash.replace("#/", "") || "dashboard";

export default function App() {
  const [user, setUser] = useState(LOCAL ? { uid: "local", email: "local mode" } : undefined);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(readPage());
  const [nav, setNav] = useState(false);
  const [readErr, setReadErr] = useState("");
  const [editId, setEditId] = useState(null);

  // If VITE_ADMIN_UID is empty, any signed-in user is allowed in (Firestore rules still protect the data)
  const ok = LOCAL || (!!user && (!ADMIN_UID || user.uid === ADMIN_UID));

  useEffect(() => {
    if (LOCAL) return;
    return onAuthStateChanged(auth, setUser);
  }, []);
  useEffect(() => {
    const h = () => { setPage(readPage()); setNav(false); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  useEffect(() => {
    if (!ok) return;
    const fail = (what) => (e) => {
      console.error(e);
      setReadErr(`Could not read ${what} from Firebase (${e.code || e.message}). ` + (e.code === "permission-denied" ? "Your Firestore rules need: allow read: if true; for products, and allow read for the admin on orders." : ""));
    };
    const a = subProducts(setProducts, fail("products"));
    const b = subOrders(setOrders, fail("orders"));
    return () => { a(); b(); };
  }, [ok]);

  if (user === undefined) return <p className="center-note">Loading…</p>;
  if (!ok) return <Login user={user} />;

  const newOrders = orders.filter((o) => o.status === "new").length;
  const view =
    page === "products" ? <Products products={products} openId={editId} onOpened={() => setEditId(null)} />
    : page === "prices" ? <Prices products={products} />
    : page === "stock" ? <Stock products={products} />
    : page === "orders" ? <Orders orders={orders} />
    : <Dashboard products={products} orders={orders} user={user} />;

  return (
    <div className="shell">
      <aside className={"side" + (nav ? " open" : "")}>
        <div className="brand">Taana Baana<small>Admin</small></div>
        <nav>
          {NAV.map(([k, label, ic]) => (
            <a key={k} href={"#/" + k} className={page === k ? "on" : ""}>
              <span>{ic}</span>{label}
              {k === "orders" && newOrders > 0 && <b className="pill-n">{newOrders}</b>}
            </a>
          ))}
          {STORE_URL && <a href={STORE_URL} target="_blank" rel="noreferrer"><span>🌐</span>View store</a>}
        </nav>
        {LOCAL ? (
          <button className="logout" onClick={() => window.confirm("Remove everything you added and go back to the 8 sample products?") && resetLocal()}>Reset sample data</button>
        ) : (
          <button className="logout" onClick={() => signOut(auth)}>Log out</button>
        )}
      </aside>
      {nav && <div className="scrim" onClick={() => setNav(false)} />}
      <div className="main">
        <header className="top">
          <button className="burger" onClick={() => setNav(true)} aria-label="Menu">☰</button>
          <h1>{(NAV.find((n) => n[0] === page) || NAV[0])[1]}</h1>
          <SearchBox products={products} onPick={(p) => { setEditId(p.id); window.location.hash = "#/products"; }} />
        </header>
        {LOCAL && <div className="banner">Local mode: Firebase is OFF, so nothing reaches your store. {LOCAL_REASON}</div>}
        {readErr && <div className="banner bad">{readErr}</div>}
        <div className="content">{view}</div>
      </div>
    </div>
  );
}
