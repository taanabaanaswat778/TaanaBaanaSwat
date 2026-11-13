import { updateOrder, deleteOrder } from "../db";
import { money, fmtDate } from "../utils";
import { PiTrash, PiWhatsappLogo, PiPhone, PiMapPin, PiCube, PiCreditCard } from "react-icons/pi";

const intl = (ph = "") => { const d = ph.replace(/\D/g, ""); return d.startsWith("0") ? "92" + d.slice(1) : d; };

export default function Orders({ orders }) {
  return (
    <div className="card">
      <div className="card-h" style={{ borderBottom: "1px solid #eee", paddingBottom: 16, marginBottom: 16 }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18 }}>
          <PiCube size={22} color="var(--ac)" /> Recent Orders
        </h3>
      </div>

      <div className="table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th style={{ width: "20%" }}>Order Info</th>
              <th style={{ width: "25%" }}>Customer</th>
              <th style={{ width: "25%" }}>Items</th>
              <th style={{ width: "15%" }}>Total & Payment</th>
              <th style={{ width: "15%" }}>Status / Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <div className="order-id">#{o.orderNo || "—"}</div>
                  <div className="order-date">{fmtDate(o.createdAt)}</div>
                </td>
                
                <td>
                  <div className="customer-name">{o.customer?.name}</div>
                  <div className="customer-meta">
                    <span><PiPhone /> {o.customer?.phone}</span>
                    <span><PiMapPin /> {o.customer?.address}</span>
                  </div>
                  {o.customer?.phone && (
                    <a 
                      href={`https://wa.me/${intl(o.customer.phone)}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="wa-link"
                    >
                      <PiWhatsappLogo size={16} /> Message on WhatsApp
                    </a>
                  )}
                </td>
                
                <td>
                  <div className="items-list">
                    {(o.items || []).map((i, idx) => (
                      <div key={idx} className="item-row">
                        <span className="item-qty">{i.qty}x</span> 
                        <span>{i.name}</span>
                        {i.pieces && <span className="item-piece">({i.pieces})</span>}
                      </div>
                    ))}
                  </div>
                </td>
                
                <td>
                  <div className="order-total">{money(o.total)}</div>
                  <div className="order-payment"><PiCreditCard /> {o.payment || "Cash on Delivery"}</div>
                  {(o.discount > 0 || o.shipping > 0) && (
                    <div className="order-adjustments">
                      {o.discount > 0 && <span>Disc: -{money(o.discount)}</span>}
                      {o.shipping > 0 && <span>Ship: {money(o.shipping)}</span>}
                    </div>
                  )}
                </td>
                
                <td>
                  <div className="status-actions">
                    <select 
                      className={`status-select ${o.status}`} 
                      value={o.status} 
                      onChange={(e) => updateOrder(o.id, { status: e.target.value })}
                    >
                      {["new", "confirmed", "shipped", "delivered", "cancelled"].map((x) => (
                        <option key={x} value={x}>{x.charAt(0).toUpperCase() + x.slice(1)}</option>
                      ))}
                    </select>
                    <button 
                      className="btn-delete" 
                      onClick={() => window.confirm("Delete this order permanently?") && deleteOrder(o.id)}
                      title="Delete order"
                    >
                      <PiTrash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={5} className="empty" style={{ padding: "40px", textAlign: "center", color: "var(--mut)" }}>
                  <PiCube size={48} style={{ opacity: 0.2, marginBottom: 10 }} />
                  <br />No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}