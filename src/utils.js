export const CUR = "Rs."; // change this if you use another currency label
export const money = (n) => `${CUR} ${Number(n || 0).toLocaleString()}`;

const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
export const saleActive = (p) =>
  p.sale > 0 && p.sale < p.price &&
  (!p.saleStart || p.saleStart <= today()) &&
  (!p.saleEnd || p.saleEnd >= today());

export const fmtDate = (v) => (v ? (v.toDate ? v.toDate() : new Date(v)).toLocaleString() : "");

// Shrinks a photo so it uploads quickly
export function resize(file, max = 800, q = 0.72) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => {
      const i = new Image();
      i.onload = () => {
        const k = Math.min(1, max / Math.max(i.width, i.height)), c = document.createElement("canvas");
        c.width = i.width * k; c.height = i.height * k;
        c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", q));
      };
      i.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

export const friendly = (err) =>
  err?.code === "permission-denied"
    ? "Permission denied. Check that your admin UID in the Firestore rules matches your login."
    : err?.message || "Something went wrong. Please try again.";
