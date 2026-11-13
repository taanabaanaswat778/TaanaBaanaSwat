import { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { PiDownloadSimple, PiWhatsappLogo, PiUsers, PiMagnifyingGlass, PiMegaphone, PiXCircle } from "react-icons/pi";

const intl = (ph = "") => { const d = ph.replace(/\D/g, ""); return d.startsWith("0") ? "92" + d.slice(1) : d; };

export default function Customers({ orders }) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState([]);
  
  // Bulk send queue state
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // 1. Process orders to get unique customers
  const customers = useMemo(() => {
    const map = new Map();
    
    orders.forEach((o) => {
      if (!o.customer?.phone) return;
      const phone = o.customer.phone.trim();
      
      if (map.has(phone)) {
        const existing = map.get(phone);
        existing.orders += 1;
        existing.spent += (o.total || 0);
        if (!existing.name && o.customer.name) existing.name = o.customer.name;
      } else {
        map.set(phone, {
          id: phone, // use phone as ID
          name: o.customer.name || "Unknown",
          phone: phone,
          city: o.customer.city || "",
          orders: 1,
          spent: o.total || 0,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.spent - a.spent);
  }, [orders]);

  // 2. Filter by search
  const filtered = customers.filter((c) => 
    c.name.toLowerCase().includes(q.toLowerCase()) || 
    c.phone.includes(q) || 
    c.city.toLowerCase().includes(q.toLowerCase())
  );

  // Selection logic
  const allSelected = filtered.length > 0 && filtered.every((c) => selected.includes(c.id));
  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(filtered.map((c) => c.id));
  };

  // 3. Export to Excel
  const exportExcel = () => {
    const data = [
      ["Name", "Phone", "City", "Total Orders", "Total Spent (Rs)"],
      ...filtered.map((c) => [c.name, c.phone, c.city, c.orders, c.spent])
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["!cols"] = [{ wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "customer-database.xlsx");
  };

  // 4. Generate WhatsApp Promo Message
  const getMsg = (name) => {
    return `Assalam o Alaikum ${name}!\n\nTaana Baana here. We noticed you love our collections! 🌸\n\nOur New Arrivals and End of Season Sale are now live. Get up to 35% off on selected unstitched suits!\n\nShop here: ${window.location.origin}\n\nReply to this message if you need any help choosing a design.`;
  };

  const sendSingle = (c) => {
    window.open(`https://wa.me/${intl(c.phone)}?text=${encodeURIComponent(getMsg(c.name))}`, "_blank");
  };

  // 5. Bulk Send Logic
  const startBulkSend = () => {
    const targets = customers.filter((c) => selected.includes(c.id));
    if (!targets.length) return;
    setQueue(targets);
    setCurrentIndex(0);
    openWhatsApp(targets[0]);
  };

  const openWhatsApp = (c) => {
    window.open(`https://wa.me/${intl(c.phone)}?text=${encodeURIComponent(getMsg(c.name))}`, "_blank");
  };

  const nextCustomer = () => {
    if (currentIndex + 1 < queue.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      openWhatsApp(queue[nextIdx]);
    } else {
      // Finished
      setQueue([]);
      setCurrentIndex(-1);
      setSelected([]);
      alert("All promotional messages have been opened!");
    }
  };

  const cancelBulk = () => {
    setQueue([]);
    setCurrentIndex(-1);
  };

  return (
    <div className="card">
      <div className="card-h" style={{ borderBottom: "1px solid #eee", paddingBottom: 16, marginBottom: 16 }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18 }}>
          <PiUsers size={22} color="var(--ac)" /> Customer Database ({customers.length})
        </h3>
        <div className="row-wrap">
          {selected.length > 0 && (
            <button className="btn btn-promo" onClick={startBulkSend} style={{ padding: "8px 16px", fontSize: 14 }}>
              <PiMegaphone size={18} /> Send Promo to {selected.length} Selected
            </button>
          )}
          <button className="btn ghost" onClick={exportExcel} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PiDownloadSimple size={18} /> Export to Excel
          </button>
        </div>
      </div>

      <div className="msg ok" style={{ marginBottom: 16 }}>
        <b>💡 Marketing Tip:</b> Select multiple customers using the checkboxes below to send a bulk promotional message, or click <b>Export to Excel</b> to download their numbers.
      </div>

      <div className="search" style={{ maxWidth: 300, marginBottom: 16 }}>
        <PiMagnifyingGlass className="search-icon" />
        <input placeholder="Search by name, phone or city…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ width: 16, height: 16, cursor: "pointer" }} />
              </th>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>City</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} style={{ background: selected.includes(c.id) ? "#fcf9f6" : "transparent" }}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selected.includes(c.id)} 
                    onChange={() => toggleSelect(c.id)} 
                    style={{ width: 16, height: 16, cursor: "pointer" }} 
                  />
                </td>
                <td><b>{c.name}</b></td>
                <td style={{ fontFamily: "monospace", fontSize: 13 }}>{c.phone}</td>
                <td style={{ color: "var(--mut)" }}>{c.city || "—"}</td>
                <td>
                  <span className="badge-orders">{c.orders} {c.orders === 1 ? "order" : "orders"}</span>
                </td>
                <td><b style={{ color: "var(--ac)" }}>Rs. {c.spent.toLocaleString()}</b></td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn-promo" onClick={() => sendSingle(c)}>
                    <PiMegaphone size={16} /> Send
                  </button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={7} className="empty" style={{ padding: "40px", textAlign: "center" }}>
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== BULK SEND QUEUE MODAL ===== */}
      {queue.length > 0 && currentIndex >= 0 && (
        <div className="bulk-modal-overlay">
          <div className="bulk-modal">
            <h3>Sending Promo Messages</h3>
            <p>WhatsApp has opened in a new tab with the message for <b>{queue[currentIndex].name}</b>.</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }}></div>
            </div>
            <p className="small">Progress: {currentIndex + 1} of {queue.length}</p>
            
            <div className="modal-actions">
              <button className="btn ghost" onClick={cancelBulk}>Cancel</button>
              <button className="btn btn-promo" onClick={nextCustomer}>
                {currentIndex + 1 === queue.length ? "Finish & Close" : "Next Customer →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}