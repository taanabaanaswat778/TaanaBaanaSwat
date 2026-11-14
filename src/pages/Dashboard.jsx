import { useState } from "react";
import { money, fmtDate, saleActive, friendly } from "../utils";
import { LOCAL, LOCAL_REASON, PROJECT_ID, ADMIN_UID } from "../firebase";
import { testConnection, addSampleProducts } from "../db";
import { 
  PiDatabase, PiCheckCircle, PiUploadSimple, PiTag, PiStorefront, 
  PiShoppingCart, PiPackage, PiTrendUp, PiWarning, PiCopy, PiPlug, PiPlusSquare
} from "react-icons/pi";

export default function Dashboard({ products, orders, user }) {
  const [busy, setBusy] = useState("");
  const [res, setRes] = useState(null);
  const [copied, setCopied] = useState(false);

  async function test() {
    setBusy("test"); setRes(null);
    setRes(await testConnection());
    setBusy("");
  }
  async function sample() {
    if (!window.confirm("Add 8 sample products to your Firebase database? They will also appear on your store.")) return;
    setBusy("sample"); setRes(null);
    try {
      const n = await addSampleProducts();
      setRes({ ok: true, msg: `Added ${n} sample products. They are now in Firebase and on your store.` });
    } catch (e) { setRes({ ok: false, msg: friendly(e) }); }
    setBusy("");
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(user.uid); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const live = orders.filter((o) => o.status !== "cancelled");
  const cats = new Set(products.map((p) => p.cat).filter(Boolean));
  
  const stats = [
    { label: "Total Products", value: products.length, icon: <PiShoppingCart />, color: "#3b82f6" },
    { label: "Categories", value: cats.size, icon: <PiTag />, color: "#8b5cf6" },
    { label: "On Sale Now", value: products.filter(saleActive).length, icon: <PiTrendUp />, color: "#10b981" },
    { label: "Out of Stock", value: products.filter((p) => !p.stock).length, icon: <PiWarning />, color: "#ef4444" },
    { label: "Low Stock", value: products.filter((p) => p.qty !== "" && p.qty != null && Number(p.qty) > 0 && Number(p.qty) <= 3).length, icon: <PiPackage />, color: "#f59e0b" },
    { label: "New Orders", value: orders.filter((o) => o.status === "new").length, icon: <PiStorefront />, color: "#6366f1" },
    { label: "Total Revenue", value: money(live.reduce((a, o) => a + (o.total || 0), 0)), icon: <PiTrendUp />, color: "#8a2c2c", large: true },
  ];

  return (
    <div className="dashboard-page">
      {/* CONNECTION CARD */}
      <div className="card" style={{ padding: 24, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.04)" }}>
        <div className="card-h" style={{ borderBottom: "1px solid #eee", paddingBottom: 16, marginBottom: 16 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18 }}>
            <PiDatabase size={22} color="var(--ac)" /> Database Connection
          </h3>
        </div>
        
        {LOCAL ? (
          <>
            <div className="msg bad"><b>Not connected.</b> {LOCAL_REASON}</div>
            <div className="hint">Products you upload now stay in this browser only and will NOT appear on your store.</div>
          </>
        ) : (
          <div className="connection-info">
            <div className="msg ok" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PiCheckCircle size={20} /> 
              <span><b>Connected</b> to Firebase project <code>{PROJECT_ID}</code>. Products you upload are saved to the database and shown on your store.</span>
            </div>
            
            <div className="user-details">
              <div className="ud-row">
                <span className="ud-label">Login Email</span>
                <span className="ud-val">{user.email}</span>
              </div>
              <div className="ud-row">
                <span className="ud-label">Your UID (Admin Key)</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <code>{user.uid}</code>
                  <button className="btn-copy" onClick={copy}>
                    {copied ? <><PiCheckCircle /> Copied</> : <><PiCopy /> Copy</>}
                  </button>
                </div>
              </div>
            </div>
            {!ADMIN_UID && <small style={{ marginTop: 8 }}>Paste this UID into your Firestore rules (replace PASTE_ADMIN_UID_HERE, then Publish). You can also add it to .env as VITE_ADMIN_UID.</small>}
          </div>
        )}

        <div className="row-wrap" style={{ marginTop: 16 }}>
          <button className="btn ghost" disabled={LOCAL || !!busy} onClick={test}>
            <PiPlug /> {busy === "test" ? "Testing…" : "Test connection"}
          </button>
          <button className="btn ghost" disabled={LOCAL || !!busy} onClick={sample}>
            <PiPlusSquare /> {busy === "sample" ? "Adding…" : "Add 8 sample products"}
          </button>
        </div>
        {res && <div className={"msg mt-3 " + (res.ok ? "ok" : "bad")}>{res.msg}</div>}
      </div>

      {/* STATS GRID */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className={"stat-card " + (s.large ? "large" : "")}>
            <div className="stat-icon" style={{ background: s.color + "15", color: s.color }}>
              {s.icon}
            </div>
            <div className="stat-data">
              <span className="stat-label">{s.label}</span>
              <b className="stat-value">{s.value}</b>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="card" style={{ padding: 24, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.04)" }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Quick Actions</h3>
        <div className="quick-actions">
          <a className="qa-btn primary" href="#/products">
            <PiUploadSimple size={20} /> Upload Product
          </a>
          <a className="qa-btn secondary" href="#/prices">
            <PiTag size={20} /> Update Prices
          </a>
          <a className="qa-btn secondary" href="#/orders">
            <PiShoppingCart size={20} /> View Orders
          </a>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="card" style={{ padding: 24, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.04)" }}>
        <div className="card-h" style={{ borderBottom: "1px solid #eee", paddingBottom: 16, marginBottom: 0 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18 }}>
            <PiStorefront size={22} color="var(--ac)" /> Recent Orders
          </h3>
        </div>
        <div className="table-wrap">
          <table>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td style={{ padding: "16px 12px" }}>
                    <div style={{ fontWeight: 600, color: "var(--ink)" }}>#{o.orderNo || "—"}</div>
                    <small>{fmtDate(o.createdAt)}</small>
                  </td>
                  <td style={{ padding: "16px 12px" }}>{o.customer?.name}</td>
                  <td style={{ padding: "16px 12px", fontWeight: 600 }}>{money(o.total)}</td>
                  <td style={{ padding: "16px 12px", textAlign: "right" }}>
                    <span className={"status-badge " + o.status}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!orders.length && <tr><td className="empty" style={{ padding: "40px", textAlign: "center" }}>No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}