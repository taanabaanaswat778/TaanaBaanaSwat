import { reportStatus } from "./status";

export const DEMO = !String(import.meta.env.VITE_FIREBASE_API_KEY || "").trim();
const ADMIN_UID = String(import.meta.env.VITE_ADMIN_UID || "").trim();
const fbp = DEMO ? null : Promise.all([import("firebase/firestore"), import("firebase/auth"), import("./firebase")]);

const DEFAULTS = { products: [], orders: [], settings: null, user: null };

const listeners = {};
const read = (k) => { try { return JSON.parse(localStorage.getItem("demo_" + k)) ?? DEFAULTS[k]; } catch { return DEFAULTS[k]; } };
const write = (k, v) => { localStorage.setItem("demo_" + k, JSON.stringify(v)); (listeners[k] || []).forEach((f) => f(v)); };
const lsub = (k, fn) => { (listeners[k] ??= []).push(fn); fn(read(k)); return () => { listeners[k] = listeners[k].filter((x) => x !== fn); }; };

const sub = (fn) => {
  let off = () => {}, dead = false;
  fbp
    .then(([f, a, k]) => { if (!dead) off = fn(f, a, k); })
    .catch((e) => reportStatus("err", "Could not start Firebase: " + (e.message || e)));
  return () => { dead = true; off(); };
};

const rows = (s) => s.docs.map((d) => ({ id: d.id, ...d.data() }));

const explain = (e, what) =>
  e.code === "permission-denied"
    ? `Firebase blocked reading ${what}. Check your Firestore Rules.`
    : e.code === "unavailable"
    ? `Could not connect to Firebase. Please check your internet connection.`
    : `Could not load ${what} from Firebase (${e.code || e.message}).`;

export const subProducts = (cb, onError) => {
  if (DEMO) return lsub("products", cb);

  let retryTimer = null;
  let hasReceivedData = false;

  const startListener = () => {
    return sub((f, a, k) => {
      const unsub = f.onSnapshot(
        f.collection(k.db, "products"), 
        (s) => {
          hasReceivedData = true;
          clearTimeout(retryTimer);
          
          const items = rows(s);
          // Sort by newest first, but don't let missing timestamps hide the products
          items.sort((x, y) => (y.createdAt?.seconds || 0) - (x.createdAt?.seconds || 0));
          
          if (items.length) reportStatus("", "");
          else reportStatus("info", "Connected to Firebase, but there are no products yet. Upload one in your admin website.");
          
          cb(items);
        },
        (e) => {
          console.error("FIRESTORE LISTENER ERROR:", e);
          reportStatus("err", explain(e, "products"));
          if (onError) onError(e);
          
          if (e.code === 'unavailable' || e.message?.includes('404')) {
            clearTimeout(retryTimer);
            retryTimer = setTimeout(() => {
              if (!hasReceivedData) startListener();
            }, 3000);
          }
        }
      );
      return unsub;
    });
  };

  return startListener();
};

export const subSettings = (cb) =>
  DEMO
    ? lsub("settings", cb)
    : sub((f, a, k) =>
        f.onSnapshot(f.doc(k.db, "settings", "store"), (d) => cb(d.exists() ? d.data() : null), (e) => console.error(explain(e, "settings")))
      );

export const subOrders = (cb, onError) =>
  DEMO
    ? lsub("orders", cb)
    : sub((f, a, k) =>
        f.onSnapshot(f.query(f.collection(k.db, "orders"), f.orderBy("createdAt", "desc")), 
          (s) => cb(rows(s)), 
          (e) => {
            console.error("FIRESTORE LISTENER ERROR:", e);
            if (onError) onError(e);
          }
        )
      );

export const onAuth = (cb) => (DEMO ? lsub("user", cb) : sub((f, a, k) => a.onAuthStateChanged(k.auth, cb)));

export async function saveProduct(id, data) {
  if (DEMO) {
    const l = read("products");
    return write("products", id ? l.map((p) => (p.id === id ? { ...data, id } : p)) : [{ ...data, id: "p" + Date.now() }, ...l]);
  }
  const [f, , k] = await fbp;
  const { createdAt, ...rest } = data;
  return id
    ? f.setDoc(f.doc(k.db, "products", id), { ...rest, ...(createdAt ? { createdAt } : {}) })
    : f.addDoc(f.collection(k.db, "products"), { ...rest, createdAt: f.serverTimestamp() });
}

export async function deleteProduct(id) {
  if (DEMO) return write("products", read("products").filter((p) => p.id !== id));
  const [f, , k] = await fbp; return f.deleteDoc(f.doc(k.db, "products", id));
}

export async function saveSettings(d) {
  if (DEMO) return write("settings", d);
  const [f, , k] = await fbp; return f.setDoc(f.doc(k.db, "settings", "store"), d);
}

export async function addOrder(o) {
  if (DEMO) return write("orders", [{ ...o, id: "o" + Date.now(), createdAt: Date.now() }, ...read("orders")]);
  const [f, , k] = await fbp; return f.addDoc(f.collection(k.db, "orders"), { ...o, createdAt: f.serverTimestamp() });
}

export async function updateOrder(id, patch) {
  if (DEMO) return write("orders", read("orders").map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const [f, , k] = await fbp; return f.updateDoc(f.doc(k.db, "orders", id), patch);
}

export async function deleteOrder(id) {
  if (DEMO) return write("orders", read("orders").filter((o) => o.id !== id));
  const [f, , k] = await fbp; return f.deleteDoc(f.doc(k.db, "orders", id));
}

export async function login(email, password) {
  if (DEMO) return write("user", { uid: "demo", email });
  const [, a, k] = await fbp; return a.signInWithEmailAndPassword(k.auth, email, password);
}

export async function logout() {
  if (DEMO) return write("user", null);
  const [, a, k] = await fbp; return a.signOut(k.auth);
}

export const isAdmin = (u) => (DEMO ? !u ? false : (!ADMIN_UID || u.uid === ADMIN_UID) : false);
export const fmtDate = (v) => (v ? (v.toDate ? v.toDate() : new Date(v)).toLocaleString() : "");