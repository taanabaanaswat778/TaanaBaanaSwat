import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { PiBank, PiTrash, PiPlus, PiFloppyDisk, PiPencilSimple, PiX, PiCheck, PiWallet, PiCreditCard } from "react-icons/pi";

export default function Payments() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  
  const [editingRows, setEditingRows] = useState({});
  const [draftAccounts, setDraftAccounts] = useState({});

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "payments"));
        if (snap.exists()) {
          setAccounts(snap.data().accounts || []);
        } else {
          setAccounts([{ id: Date.now(), bankName: "Meezan Bank", accountTitle: "Taana Baana", accountNumber: "0000-0000000000" }]);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchAccounts();
  }, []);

  const saveChanges = async () => {
    setSaving(true);
    setMsg("");
    try {
      await setDoc(doc(db, "settings", "payments"), { accounts });
      setMsg("Payment methods updated successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("Failed to save. Check your connection.");
    }
    setSaving(false);
  };

  const addAccount = () => {
    const newId = Date.now();
    setAccounts([...accounts, { id: newId, bankName: "", accountTitle: "", accountNumber: "" }]);
    setEditingRows({ ...editingRows, [newId]: true });
    setDraftAccounts({ ...draftAccounts, [newId]: { bankName: "", accountTitle: "", accountNumber: "" } });
  };

  const removeAccount = (id) => {
    if (!window.confirm("Delete this account?")) return;
    setAccounts(accounts.filter((a) => a.id !== id));
    const newEditing = { ...editingRows };
    delete newEditing[id];
    setEditingRows(newEditing);
    const newDraft = { ...draftAccounts };
    delete newDraft[id];
    setDraftAccounts(newDraft);
  };

  const startEdit = (acc) => {
    setEditingRows({ ...editingRows, [acc.id]: true });
    setDraftAccounts({ ...draftAccounts, [acc.id]: { ...acc } });
  };

  const cancelEdit = (id) => {
    const newEditing = { ...editingRows };
    delete newEditing[id];
    setEditingRows(newEditing);
  };

  const saveRow = (id) => {
    const draft = draftAccounts[id];
    setAccounts(accounts.map((a) => (a.id === id ? { ...draft } : a)));
    const newEditing = { ...editingRows };
    delete newEditing[id];
    setEditingRows(newEditing);
    setTimeout(() => saveChanges(), 100);
  };

  const updateDraft = (id, field, value) => {
    setDraftAccounts({
      ...draftAccounts,
      [id]: { ...draftAccounts[id], [field]: value }
    });
  };

  if (loading) return <p className="center-note">Loading accounts...</p>;

  return (
    <div className="payments-page">
      <div className="card" style={{ padding: 24, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.04)" }}>
        
        {/* HEADER */}
        <div className="card-h" style={{ borderBottom: "1px solid #eee", paddingBottom: 16, marginBottom: 24 }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 20, margin: 0 }}>
              <PiBank size={26} color="var(--ac)" /> Payment Details
            </h3>
            <p className="text-muted small mt-1 mb-0">These accounts will appear on the checkout page.</p>
          </div>
          <button className="btn" onClick={saveChanges} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px" }}>
            <PiFloppyDisk size={18} /> {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>

        {msg && <div className={"msg " + (msg.includes("success") ? "ok" : "bad")} style={{ marginBottom: 20 }}>{msg}</div>}

        {/* CARDS LIST */}
        <div className="payment-cards">
          {accounts.map((acc, index) => {
            const isEditing = editingRows[acc.id];
            const draft = draftAccounts[acc.id] || {};

            return (
              <div key={acc.id} className={`payment-card ${isEditing ? "editing" : ""}`}>
                <div className="pc-icon">
                  {acc.bankName.toLowerCase().includes("easy") ? <PiWallet /> : <PiCreditCard />}
                </div>
                
                <div className="pc-content">
                  {isEditing ? (
                    <div className="pc-edit-grid">
                      <div>
                        <label className="small text-muted mb-1 d-block">Bank Name</label>
                        <input className="form-control" value={draft.bankName} onChange={(e) => updateDraft(acc.id, "bankName", e.target.value)} autoFocus />
                      </div>
                      <div>
                        <label className="small text-muted mb-1 d-block">Account Title</label>
                        <input className="form-control" value={draft.accountTitle} onChange={(e) => updateDraft(acc.id, "accountTitle", e.target.value)} />
                      </div>
                      <div>
                        <label className="small text-muted mb-1 d-block">Account Number</label>
                        <input className="form-control" value={draft.accountNumber} onChange={(e) => updateDraft(acc.id, "accountNumber", e.target.value)} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="pc-bank">{acc.bankName || "Unknown Bank"}</div>
                      <div className="pc-details">
                        <span><b>Title:</b> {acc.accountTitle}</span>
                        <span><b>Account:</b> {acc.accountNumber}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="pc-actions">
                  {isEditing ? (
                    <>
                      <button className="btn-icon success" onClick={() => saveRow(acc.id)} title="Save"><PiCheck size={18} /></button>
                      <button className="btn-icon danger" onClick={() => cancelEdit(acc.id)} title="Cancel"><PiX size={18} /></button>
                    </>
                  ) : (
                    <>
                      <button className="btn-icon" onClick={() => startEdit(acc)} title="Edit"><PiPencilSimple size={18} /></button>
                      <button className="btn-icon danger" onClick={() => removeAccount(acc.id)} title="Delete"><PiTrash size={18} /></button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          
          {!accounts.length && (
            <div className="text-center py-5">
              <PiBank size={48} color="#e7e2da" className="mb-3" />
              <h5 className="text-muted">No accounts added yet</h5>
              <p className="small text-muted mb-0">Click the button below to add your first bank account.</p>
            </div>
          )}
        </div>

        <button className="btn ghost mt-4" onClick={addAccount} style={{ width: "fit-content", display: "flex", alignItems: "center", gap: 6 }}>
          <PiPlus size={18} /> Add Another Account
        </button>

      </div>
    </div>
  );
}