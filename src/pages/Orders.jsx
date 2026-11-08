import { updateOrder, deleteOrder } from "../db";
import { money, fmtDate } from "../utils";

const intl = (ph = "") => { const d = ph.replace(/\D/g, ""); return d.startsWith("0") ? "92" + d.slice(1) : d; };

export default function Orders({ orders }) {
  return (
    <div className="card">
      <div className="table-wrap">
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Payment</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td><b>{o.orderNo || "—"}</b><br /><small>{fmtDate(o.createdAt)}</small></td>
                <td>
                  <b>{o.customer?.name}</b><br />
                  <small>📞 {o.customer?.phone}{o.contact ? ` · ✉️ ${o.contact}` : ""}<br />📍 {o.customer?.address}</small>
                  {o.customer?.phone && <><br /><a href={`https://wa.me/${intl(o.customer.phone)}`} target="_blank" rel="noreferrer">WhatsApp customer</a></>}
                </td>
                <td><small>{(o.items || []).map((i) => `${i.name}${i.pieces ? ` (${i.pieces})` : ""} x${i.qty}`).join(", ")}</small></td>
                <td><small>{o.payment || "Cash on Delivery"}</small></td>
                <td>
                  {money(o.total)}
                  {(o.discount > 0 || o.shipping > 0) && (
                    <small><br />{o.discount > 0 && <>Disc -{money(o.discount)} </>}{o.shipping > 0 && <>Ship {money(o.shipping)}</>}</small>
                  )}
                </td>
                <td>
                  <select className="sel" value={o.status} onChange={(e) => updateOrder(o.id, { status: e.target.value })}>
                    {["new", "confirmed", "shipped", "delivered", "cancelled"].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </td>
                <td><button className="mini del" onClick={() => window.confirm("Delete this order?") && deleteOrder(o.id)}>✕</button></td>
              </tr>
            ))}
            {!orders.length && <tr><td colSpan={7} className="empty">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
