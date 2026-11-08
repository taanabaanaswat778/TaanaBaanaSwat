import { collection, doc, onSnapshot, addDoc, setDoc, getDoc, deleteDoc, updateDoc, writeBatch, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db, LOCAL } from "./firebase";

/* ================= LOCAL MODE (no Firebase) ================= */
const sale = "2026-12-31";
const SEED = [
  { id: "s1", name: "Embroidered Lawn Suit", price: 12900, sale: 10320, saleStart: "", saleEnd: sale, cat: "Lawn", pieces: "3 Piece", img: "", imgs: [], desc: "", isNew: true, stock: true },
  { id: "s2", name: "Printed Lawn 2-Piece", price: 4200, sale: 0, saleStart: "", saleEnd: "", cat: "Lawn", pieces: "2 Piece", img: "", imgs: [], desc: "", isNew: false, stock: true },
  { id: "s3", name: "Chikankari Lawn", price: 6800, sale: 5400, saleStart: "", saleEnd: sale, cat: "Lawn", pieces: "3 Piece", img: "", imgs: [], desc: "", isNew: false, stock: true },
  { id: "s4", name: "Karandi Embroidered Suit", price: 8900, sale: 0, saleStart: "", saleEnd: "", cat: "Karandi", pieces: "3 Piece", img: "", imgs: [], desc: "", isNew: true, stock: true },
  { id: "s5", name: "Karandi Printed 2-Piece", price: 5200, sale: 4200, saleStart: "", saleEnd: sale, cat: "Karandi", pieces: "2 Piece", img: "", imgs: [], desc: "", isNew: false, stock: true },
  { id: "s6", name: "Chiffon Party Wear", price: 7500, sale: 0, saleStart: "", saleEnd: "", cat: "Chiffon", pieces: "3 Piece", img: "", imgs: [], desc: "", isNew: true, stock: true },
  { id: "s7", name: "Raw Silk Festive Suit", price: 11500, sale: 0, saleStart: "", saleEnd: "", cat: "Silk", pieces: "3 Piece", img: "", imgs: [], desc: "", isNew: false, stock: true },
  { id: "s8", name: "Organza Wedding Wear", price: 18500, sale: 0, saleStart: "", saleEnd: "", cat: "Organza", pieces: "3 Piece", img: "", imgs: [], desc: "", isNew: false, stock: false },
];
const DEFAULTS = { products: SEED, orders: [] };
const subs = { products: [], orders: [] };
const read = (k) => { try { return JSON.parse(localStorage.getItem("adm_" + k)) ?? DEFAULTS[k]; } catch { return DEFAULTS[k]; } };
const write = (k, v) => { localStorage.setItem("adm_" + k, JSON.stringify(v)); subs[k].forEach((f) => f(v)); };
const lsub = (k, cb) => { subs[k].push(cb); cb(read(k)); return () => { subs[k] = subs[k].filter((x) => x !== cb); }; };

export function resetLocal() {
  localStorage.removeItem("adm_products");
  localStorage.removeItem("adm_orders");
  subs.products.forEach((f) => f(read("products")));
  subs.orders.forEach((f) => f(read("orders")));
}

/* ================= READING ================= */
const rows = (s) => s.docs.map((d) => ({ id: d.id, ...d.data() }));
const onErr = (e) => console.error("Firestore error:", e);

export const subProducts = (cb, onError = onErr) =>
  LOCAL ? lsub("products", cb)
  : onSnapshot(collection(db, "products"), (s) => cb(rows(s).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))), onError);

export const subOrders = (cb, onError = onErr) =>
  LOCAL ? lsub("orders", cb)
  : onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (s) => cb(rows(s)), onError);

/* ================= ADDING DATA TO FIREBASE ================= */

// Adds ONE new product to the Firebase "products" collection. Returns the new product's id.
export async function addProduct(data) {
  const name = (data.name || "").trim();
  const price = Number(data.price);
  if (!name) throw new Error("Product name is required.");
  if (!(price > 0)) throw new Error("Price must be more than 0.");
  const sale = Number(data.sale) || 0;
  const clean = {
    name,
    price,
    sale,
    saleStart: sale ? data.saleStart || "" : "",
    saleEnd: sale ? data.saleEnd || "" : "",
    cat: (data.cat || "").trim(),
    pieces: data.pieces || "3 Piece",
    img: data.img || "",
    imgs: data.imgs || [],
    code: (data.code || "").trim().toUpperCase(),
    stitching: data.stitching || "Unstitched",
    desc: data.desc || "",
    qty: data.qty === "" || data.qty == null ? "" : Number(data.qty),
    isNew: !!data.isNew,
    stock: data.stock !== false,
  };
  if (LOCAL) {
    const id = "p" + Date.now();
    write("products", [{ ...clean, id, createdAt: Date.now() }, ...read("products")]);
    return id;
  }
  const ref = await addDoc(collection(db, "products"), { ...clean, createdAt: serverTimestamp() });
  return ref.id;
}

// id = null -> add a new product, otherwise replace that product
export async function saveProduct(id, data) {
  const { createdAt, id: _drop, ...rest } = data;
  if (!id) return addProduct(rest);
  if (LOCAL) return write("products", read("products").map((p) => (p.id === id ? { ...rest, id, createdAt } : p)));
  return setDoc(doc(db, "products", id), { ...rest, ...(createdAt ? { createdAt } : {}) });
}

// Adds the 8 sample products to Firebase in one go. Returns how many were added.
export async function addSampleProducts() {
  if (LOCAL) return 0;
  const batch = writeBatch(db);
  SEED.forEach(({ id, ...p }) => batch.set(doc(collection(db, "products")), { ...p, createdAt: serverTimestamp() }));
  await batch.commit();
  return SEED.length;
}

// Writes a small test record to Firebase and reads it back, to prove the connection works
export async function testConnection() {
  if (LOCAL) return { ok: false, msg: "Local mode: Firebase is switched off, so nothing is sent to the database." };
  try {
    const ref = doc(db, "settings", "connection_test");
    await setDoc(ref, { ok: true, at: serverTimestamp() });
    const snap = await getDoc(ref);
    return snap.exists()
      ? { ok: true, msg: `Connected. Data was written to and read back from Firebase project "${db.app.options.projectId}".` }
      : { ok: false, msg: "Data was written but could not be read back." };
  } catch (e) {
    return {
      ok: false,
      msg: e.code === "permission-denied"
        ? "Permission denied. Your Firestore rules do not allow this account to write. Copy your UID from this page into the rules (replace PASTE_ADMIN_UID_HERE) and click Publish."
        : "Connection failed: " + (e.code || e.message),
    };
  }
}

/* ================= OTHER CHANGES ================= */
export async function deleteProduct(id) {
  if (LOCAL) return write("products", read("products").filter((p) => p.id !== id));
  return deleteDoc(doc(db, "products", id));
}

// changes = [{ id, price, sale, saleStart, saleEnd }, ...]
export async function updatePrices(changes) {
  if (LOCAL) {
    const by = Object.fromEntries(changes.map(({ id, ...patch }) => [id, patch]));
    return write("products", read("products").map((p) => (by[p.id] ? { ...p, ...by[p.id] } : p)));
  }
  for (let i = 0; i < changes.length; i += 400) {
    const batch = writeBatch(db);
    changes.slice(i, i + 400).forEach(({ id, ...patch }) => batch.update(doc(db, "products", id), patch));
    await batch.commit();
  }
}

export async function updateOrder(id, patch) {
  if (LOCAL) return write("orders", read("orders").map((o) => (o.id === id ? { ...o, ...patch } : o)));
  return updateDoc(doc(db, "orders", id), patch);
}
export async function deleteOrder(id) {
  if (LOCAL) return write("orders", read("orders").filter((o) => o.id !== id));
  return deleteDoc(doc(db, "orders", id));
}

// Updates several products at once: changes = [{ id, qty, stock }, ...]  (any fields can be included)
export const updateProducts = (changes) => updatePrices(changes);
