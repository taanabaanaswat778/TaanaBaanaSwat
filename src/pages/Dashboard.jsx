import { useState } from "react";
import { money, fmtDate, saleActive, friendly } from "../utils";
import { LOCAL, LOCAL_REASON, PROJECT_ID, ADMIN_UID } from "../firebase";
import { testConnection, addSampleProducts } from "../db";

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
    ["Products", products.length],
    ["Categories", cats.size],
    ["On sale now", products.filter(saleActive).length],
    ["Out of stock", products.filter((p) => !p.stock).length],
    ["Low stock (3 or less)", products.filter((p) => p.qty !== "" && p.qty != null && Number(p.qty) > 0 && Number(p.qty) <= 3).length],
    ["New orders", orders.filter((o) => o.status === "new").length],
    ["Revenue", money(live.reduce((a, o) => a + (o.total || 0), 0))],
  ];

  return (
    <>
      <div className="card">
        <div className="card-h"><h3>Firebase database</h3></div>
        {LOCAL ? (
          <>
            <div className="msg bad"><b>Not connected.</b> {LOCAL_REASON}</div>
            <div className="hint">Products you upload now stay in this browser only and will NOT appear on your store.</div>
          </>
        ) : (
          <>
            <div className="msg ok"><b>Connected</b> to Firebase project <code>{PROJECT_ID}</code>. Products you upload are saved to the database and shown on your store.</div>
            <div className="uid">
              <span>Your login: <b>{user.email}</b></span>
              <span>Your UID: <code>{user.uid}</code> <button className="mini" onClick={copy}>{copied ? "Copied ✓" : "Copy"}</button></span>
              {!ADMIN_UID && <small>Paste this UID into your Firestore rules (replace PASTE_ADMIN_UID_HERE, then Publish). You can also add it to .env as VITE_ADMIN_UID.</small>}
            </div>
          </>
        )}
        <div className="row-wrap">
          <button className="btn ghost" disabled={LOCAL || !!busy} onClick={test}>{busy === "test" ? "Testing…" : "🔌 Test connection"}</button>
          <button className="btn ghost" disabled={LOCAL || !!busy} onClick={sample}>{busy === "sample" ? "Adding…" : "➕ Add 8 sample products"}</button>
        </div>
        {res && <div className={"msg " + (res.ok ? "ok" : "bad")}>{res.msg}</div>}
      </div>

      <div className="stats">
        {stats.map(([k, v]) => <div key={k} className="stat"><span>{k}</span><b>{v}</b></div>)}
      </div>

      <div className="card">
        <div className="card-h"><h3>Quick actions</h3></div>
        <div className="row-wrap">
          <a className="btn" href="#/products">⬆ Upload a product</a>
          <a className="btn ghost" href="#/prices">🏷️ Update prices by category</a>
          <a className="btn ghost" href="#/orders">📦 View orders</a>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3>Recent orders</h3></div>
        <div className="table-wrap">
          <table>
            <tbody>
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id}>
                  <td><b>{o.orderNo || "—"}</b><br /><small>{fmtDate(o.createdAt)}</small></td>
                  <td>{o.customer?.name}</td>
                  <td>{money(o.total)}</td>
                  <td><span className={"tag " + o.status}>{o.status}</span></td>
                </tr>
              ))}
              {!orders.length && <tr><td className="empty">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
