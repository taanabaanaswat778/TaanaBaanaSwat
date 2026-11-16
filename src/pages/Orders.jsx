import { useState } from "react";
import { updateOrder, deleteOrder } from "../db";
import { money, fmtDate } from "../utils";
import { PiTrash, PiWhatsappLogo, PiPhone, PiMapPin, PiCube, PiCreditCard, PiListChecks } from "react-icons/pi";

const intl = (ph = "") => { const d = ph.replace(/\D/g, ""); return d.startsWith("0") ? "92" + d.slice(1) : d; };

const TABS = [
  { key: "new", label: "New Orders", color: "#fff0cf", textColor: "#8a5a00" },
  { key: "confirmed", label: "Confirmed", color: "#dbeafe", textColor: "#1d4ed8" },
  { key: "shipped", label: "Shipped", color: "#e0e7ff", textColor: "#4338ca" },
  { key: "delivered", label: "Delivered", color: "#e7f6ec", textColor: "#17653a" },
  { key: "cancelled", label: "Cancelled", color: "#fde8e8", textColor: "#9b1c1c" },
  { key: "all", label: "All Orders", color: "#f1ede6", textColor: "#1c1917" },
];

export default function Orders({ orders }) {
  const [activeTab, setActiveTab] = useState("new");

  // Filter orders based on the selected tab
  const filteredOrders = activeTab === "all" 
    ? orders 
    : orders.filter((o) => o.status === activeTab);

  const getTabCount = (key) => {
    if (key === "all") return orders.length;
    return orders.filter((o) => o.status === key).length;
  };

  return (
    <div className="card">
      
      {/* HEADER */}
      <div className="card-h" style={{ borderBottom: "1px solid #eee", paddingBottom: 16, marginBottom: 16 }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18 }}>
          <PiCube size={22} color="var(--ac)" /> Orders Management
        </h3>
      </div>

      {/* TABS */}
      <div className="order-tabs">
        {TABS.map((tab) => {
          const count = getTabCount(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={"order-tab " + (isActive ? "active" : "")}
              style={isActive ? { background: tab.color, color: tab.textColor, borderColor: tab.textColor } : {}}
            >
              {tab.label}
              <span className="tab-count" style={isActive ? { background: tab.textColor, color: "#fff" } : {}}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TABLE */}
      <div className="table-wrap mt-3">
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
            {filteredOrders.map((o) => (
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
            
            {!filteredOrders.length && (
              <tr>
                <td colSpan={5} className="empty" style={{ padding: "60px", textAlign: "center", color: "var(--mut)" }}>
                  <PiListChecks size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                  <h5>No {activeTab === "all" ? "" : activeTab} orders found</h5>
                  <p className="small">When customers place orders, they will appear here.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}