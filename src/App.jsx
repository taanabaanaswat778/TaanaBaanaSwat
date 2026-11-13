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
import Customers from "./pages/Customers";
import SearchBox from "./components/SearchBox";
import { PiSquaresFour, PiTShirt, PiTag, PiDownloadSimple, PiPackage, PiUsers, PiGlobe, PiSignOut, PiWifiSlash } from "react-icons/pi";

const NAV = [
  ["dashboard", "Dashboard", <PiSquaresFour />],
  ["products", "Products", <PiTShirt />],
  ["prices", "Category Prices", <PiTag />],
  ["stock", "Import Stock", <PiDownloadSimple />],
  ["orders", "Orders", <PiPackage />],
  ["customers", "Customers", <PiUsers />],
];
const readPage = () => window.location.hash.replace("#/", "") || "dashboard";

// A beautiful spinner for the initial load
const PageLoader = () => (
  <div className="center-note">
    <svg className="spinner" viewBox="0 0 50 50" style={{ width: 40, height: 40, margin: "0 auto 16px" }}>
      <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4" strokeLinecap="round"></circle>
    </svg>
    <h3>Connecting to Firebase…</h3>
    <p>Loading your products and orders.</p>
  </div>
);

export default function App() {
  const [user, setUser] = useState(LOCAL ? { uid: "local", email: "local mode" } : undefined);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Loading and error states
  const [dataLoading, setDataLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  const [page, setPage] = useState(readPage());
  const [nav, setNav] = useState(false);
  const [editId, setEditId] = useState(null);

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

    // Timer to show error screen if Firebase takes more than 8 seconds
    const timer = setTimeout(() => {
      if (dataLoading && !products.length && !orders.length) {
        setConnectionError(true);
        setDataLoading(false);
      }
    }, 8000);

    const fail = (what) => (e) => {
      console.error(e);
      if (!products.length && !orders.length) {
        setConnectionError(true);
        setDataLoading(false);
      }
    };

    const a = subProducts(
      (data) => {
        setProducts(data);
        setDataLoading(false);
        setConnectionError(false);
      },
      fail("products")
    );
    
    const b = subOrders(
      (data) => {
        setOrders(data);
        setDataLoading(false);
        setConnectionError(false);
      },
      fail("orders")
    );

    return () => { a(); b(); clearTimeout(timer); };
  }, [ok]);

  if (user === undefined) return <PageLoader />;
  if (!ok) return <Login user={user} />;

  // Show Error screen if connection fails or times out
  if (connectionError && !products.length && !orders.length) {
    return (
      <div className="center-note" style={{ maxWidth: 400, margin: "80px auto" }}>
        <PiWifiSlash size={48} color="var(--ac)" style={{ marginBottom: 16 }} />
        <h2>Connection Timeout</h2>
        <p className="hint" style={{ marginBottom: 24 }}>
          We could not connect to your Firebase database. This usually happens due to a weak internet connection. Please check your internet and try again.
        </p>
        <button className="btn" style={{ width: "100%" }} onClick={() => window.location.reload()}>
          Retry Connection
        </button>
      </div>
    );
  }

  const newOrders = orders.filter((o) => o.status === "new").length;
  
  const view =
    page === "products" ? <Products products={products} openId={editId} onOpened={() => setEditId(null)} />
    : page === "prices" ? <Prices products={products} />
    : page === "stock" ? <Stock products={products} />
    : page === "orders" ? <Orders orders={orders} />
    : page === "customers" ? <Customers orders={orders} />
    : <Dashboard products={products} orders={orders} user={user} />;

  return (
    <div className="shell">
      <aside className={"side" + (nav ? " open" : "")}>
        <div className="brand">Taana Baana<small>Admin</small></div>
        <nav>
          {NAV.map(([k, label, ic]) => (
            <a key={k} href={"#/" + k} className={page === k ? "on" : ""}>
              <span className="nav-ic">{ic}</span>{label}
              {k === "orders" && newOrders > 0 && <b className="pill-n">{newOrders}</b>}
            </a>
          ))}
          {STORE_URL && (
            <a href={STORE_URL} target="_blank" rel="noreferrer">
              <span className="nav-ic"><PiGlobe /></span>View store
            </a>
          )}
        </nav>
        {LOCAL ? (
          <button className="logout" onClick={() => window.confirm("Remove everything you added and go back to the 8 sample products?") && resetLocal()}>
            Reset sample data
          </button>
        ) : (
          <button className="logout" onClick={() => signOut(auth)}>
            <PiSignOut style={{ marginRight: 6, verticalAlign: "middle" }} /> Log out
          </button>
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
        
        {/* Show loader inline if data is still loading but page is rendered */}
        {dataLoading && !products.length ? (
          <div className="content"><PageLoader /></div>
        ) : (
          <div className="content">{view}</div>
        )}
      </div>
    </div>
  );
}