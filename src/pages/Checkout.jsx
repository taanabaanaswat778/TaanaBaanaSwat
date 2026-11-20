import { useState, useEffect } from "react";
import { addOrder, subDiscounts, getPaymentSettings } from "../data";
import { useCart } from "../hooks";
import { eff, money, shippingFor } from "../utils";
import { BackHome } from "../components/Breadcrumb";
import Footer from "../components/Footer";
import BrandLogo from "../components/BrandLogo";
import { 
  PiTruck, PiCreditCard, PiBank, PiCheckCircle, PiTag, 
  PiLockKey, PiUser, PiMapPin, PiPhone, PiShoppingBag
} from "react-icons/pi";

const FALLBACK_WA = "923091812140";
const nameOf = (p) => `${p.pieces ? p.pieces + " - " : ""}${p.name}${p.pieces ? " (Unstitched)" : ""}`;

export default function Checkout({ products, s }) {
  const cart = useCart(products);
  const saved = (() => { try { return JSON.parse(localStorage.getItem("checkout_info") || "null"); } catch { return null; } })();
  
  const [f, setF] = useState({ first: "", last: "", address: "", city: "", phone: "", save: true, ...(saved || {}) });
  const [pay, setPay] = useState("cod");
  const [code, setCode] = useState("");
  const [activeDiscounts, setActiveDiscounts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [applied, setApplied] = useState(null);
  const [codeMsg, setCodeMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);

  useEffect(() => {
    const unsub = subDiscounts(setActiveDiscounts);
    getPaymentSettings().then((data) => {
      if (data && data.accounts) setBankAccounts(data.accounts);
    });
    return () => unsub();
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  
  // Custom Floating Label Component
  const field = (k, label, Icon, props = {}) => (
    <div className="relative w-full">
      <span className="absolute left-3 top-3.5 text-gray-400 pointer-events-none">{Icon}</span>
      <input 
        id={k}
        className="peer w-full border border-gray-300 rounded-lg px-3 pt-6 pb-2 pl-10 text-sm bg-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 placeholder-transparent transition-all" 
        placeholder={label}
        value={f[k]} 
        onChange={set(k)} 
        {...props} 
      />
      <label 
        htmlFor={k}
        className="absolute left-10 top-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:font-normal peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-brand peer-focus:uppercase peer-focus:font-semibold"
      >
        {label}
      </label>
    </div>
  );

  const items = cart.items;
  const subtotal = items.reduce((a, { p, q }) => a + eff(p) * q, 0);
  const discount = applied ? applied.amount : 0;
  const ship = shippingFor(subtotal);
  const total = subtotal - discount + ship;
  const wa = (s.wa || FALLBACK_WA).replace(/\D/g, "");

  const PAYMENTS = [
    { id: "cod", label: "Cash on Delivery", icon: <PiTruck />, note: "Pay in cash when your order arrives." },
    { id: "manual", label: "Bank Transfer / JazzCash / Easypaisa", icon: <PiBank />, isManual: true },
  ];
  const payLabel = (PAYMENTS.find((m) => m.id === pay) || PAYMENTS[0]).label;

  const apply = () => {
    const c = code.trim().toUpperCase();
    const found = activeDiscounts.find((d) => d.code === c);
    const today = new Date().toLocaleDateString("en-CA");

    if (!found) { setApplied(null); return setCodeMsg("Invalid discount code."); }
    if (found.startDate && found.startDate > today) { setApplied(null); return setCodeMsg(`This code is scheduled to start on ${found.startDate}.`); }
    if (found.endDate && found.endDate < today) { setApplied(null); return setCodeMsg("This discount code has expired."); }
    if (found.minOrder > 0 && subtotal < found.minOrder) { setApplied(null); return setCodeMsg(`This code requires a minimum order of ${money(s, found.minOrder)}.`); }

    let discountAmt = 0;
    if (found.type === "percent") discountAmt = Math.round((subtotal * found.value) / 100);
    else discountAmt = found.value;
    discountAmt = Math.min(discountAmt, subtotal);

    setApplied({ code: found.code, amount: discountAmt });
    setCodeMsg(`Discount applied successfully!`);
  };

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (f.phone.replace(/\D/g, "").length < 10) return setErr("Please enter a valid phone number.");
    setBusy(true);

    const lines = items.map(({ p, q }) => ({ id: p.id, name: p.name, pieces: p.pieces || "", price: eff(p), qty: q }));
    const order = {
      orderNo: "TB" + Date.now().toString().slice(-7),
      customer: {
        name: `${f.first} ${f.last}`.trim(),
        first: f.first, last: f.last, phone: f.phone, country: "Pakistan", city: f.city,
        address: [f.address, f.city, "Pakistan"].filter(Boolean).join(", "),
      },
      items: lines, subtotal, discount, discountCode: applied ? applied.code : "", shipping: ship, total, payment: payLabel, status: "new",
    };

    try {
      await addOrder(order);
      try {
        if (f.save) localStorage.setItem("checkout_info", JSON.stringify({ first: f.first, last: f.last, address: f.address, city: f.city, phone: f.phone, save: true }));
        else localStorage.removeItem("checkout_info");
      } catch {}
      cart.clear();
      setDone(order);
      window.scrollTo(0, 0);
    } catch {
      setErr("Could not place your order. Please try again.");
    }
    setBusy(false);
  }

  const waText = (o) => `New order ${o.orderNo}\n` + o.items.map((l) => `- ${l.name}${l.pieces ? ` (${l.pieces})` : ""} x${l.qty}`).join("\n") + `\nTotal: ${s.cur} ${o.total}\nName: ${o.customer.name}\nPhone: ${o.customer.phone}\nAddress: ${o.customer.address}`;

  const shell = (body) => (
    <>
      {/* Fixed Header Layout */}
      <header className="grid grid-cols-3 items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="justify-self-start">
          <BackHome label="Continue shopping" />
        </div>
        <a href="#/" className="justify-self-center flex justify-center"><BrandLogo color="#111" subColor="#8a2c2c" size="1.8rem" /></a>
        <div className="justify-self-end"></div>
      </header>
      {body}
      <Footer s={s} />
    </>
  );

  if (done) {
    return shell(
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 bg-green-50 text-green-700 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"><PiCheckCircle /></div>
        <h1 className="text-3xl font-extrabold mb-2">Thank you, {done.customer.first || "friend"}!</h1>
        <p className="text-gray-500 mb-8">Your order <b>#{done.orderNo}</b> has been placed successfully.<br />We will contact you on <b>{done.customer.phone}</b> to confirm it.</p>
        <div className="bg-[#faf9f7] border border-gray-200 rounded-2xl p-6 text-left mb-8">
          <div className="flex flex-col gap-3 mb-4">
            {done.items.map((l) => (
              <div key={l.id} className="flex justify-between text-sm"><span>{l.name} <span className="text-gray-400">× {l.qty}</span></span><span className="font-semibold">{money(s, l.price * l.qty)}</span></div>
            ))}
          </div>
          <div className="h-px bg-gray-200 my-4" />
          <div className="flex justify-between text-sm mb-2"><span>Shipping</span><span>{done.shipping ? money(s, done.shipping) : "FREE"}</span></div>
          <div className="h-px bg-gray-200 my-4" />
          <div className="flex justify-between text-lg font-extrabold"><span>Total</span><span>{money(s, done.total)}</span></div>
          <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-dashed border-gray-300">Payment Method: <b>{done.payment}</b></div>
        </div>
        <div className="flex flex-col gap-3">
          <a className="flex items-center justify-center gap-2 bg-[#25D366] text-white p-4 rounded-xl font-bold text-sm shadow-lg hover:bg-[#1da851] transition-colors" href={`https://wa.me/${wa}?text=${encodeURIComponent(waText(done))}`} target="_blank" rel="noreferrer">Send order details on WhatsApp</a>
          <a className="flex items-center justify-center border border-gray-300 text-black p-4 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors" href="#/">Continue Shopping</a>
        </div>
      </div>
    );
  }

  if (!products.length) return shell(<p className="text-center py-20">Loading…</p>);
  if (!items.length) {
    return shell(
      <div className="text-center py-20 px-4">
        <div className="text-6xl mb-4">🛍️</div>
        <h3 className="text-2xl font-bold mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <a href="#/" className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-6 py-3 font-semibold text-sm hover:bg-gray-50 transition-colors">Continue shopping</a>
      </div>
    );
  }

  return shell(
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7 order-2 lg:order-1">
          <form onSubmit={submit} className="flex flex-col gap-8">
            
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 pb-2 border-b border-gray-200"><PiUser /> Delivery Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>{field("first", "First name", <PiUser />, { required: true })}</div>
                <div>{field("last", "Last name", <PiUser />, { required: true })}</div>
                <div className="sm:col-span-2">{field("address", "Street Address", <PiMapPin />, { required: true })}</div>
                <div>{field("city", "City", <PiMapPin />, { required: true })}</div>
                <div>{field("phone", "Phone Number", <PiPhone />, { required: true, type: "tel" })}</div>
              </div>
              <label className="flex items-center gap-2 mt-4 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={f.save} onChange={set("save")} className="w-4 h-4 accent-brand" />
                Save this information for next time
              </label>
            </div>

            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 pb-2 border-b border-gray-200"><PiTruck /> Shipping Method</h2>
              <div className="border border-brand bg-brand-light rounded-xl p-4 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border border-brand flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-brand" /></div>
                <span className="font-bold text-sm flex-1">Standard Delivery (4-5 working days)</span>
                <b className="text-sm">{ship ? money(s, ship) : "FREE"}</b>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2 mb-2 pb-2 border-b border-gray-200"><PiCreditCard /> Payment Method</h2>
              <p className="text-xs text-gray-500 mb-4">All transactions are secure and encrypted.</p>
              <div className="flex flex-col gap-3">
                {PAYMENTS.map((m) => (
                  <div key={m.id} className={`border rounded-xl p-4 cursor-pointer transition-colors ${pay === m.id ? "border-brand bg-brand-light" : "border-gray-300 bg-white hover:border-gray-400"}`} onClick={() => setPay(m.id)}>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center bg-white">{pay === m.id && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}</div>
                      <span className="text-brand text-xl">{m.icon}</span>
                      <span className="font-bold text-sm flex-1">{m.label}</span>
                    </div>
                    {pay === m.id && m.isManual && (
                      <div className="mt-4 pt-4 border-t border-dashed border-gray-300">
                        <p className="text-xs text-gray-600 mb-3">Please transfer the total amount to one of the following accounts.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {bankAccounts.map((acc, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                              <div className="text-xs font-extrabold text-black uppercase mb-2">{acc.bankName}</div>
                              <div className="flex justify-between text-[11px] text-gray-600 mb-1"><span>Title:</span> <span className="font-medium text-black">{acc.accountTitle}</span></div>
                              <div className="flex justify-between text-[11px] text-gray-600"><span>Account #:</span> <span className="font-mono font-bold text-brand">{acc.accountNumber}</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {pay === m.id && !m.isManual && <div className="mt-3 text-xs text-gray-600 leading-relaxed">{m.note}</div>}
                  </div>
                ))}
              </div>
            </div>

            {err && <div className="bg-red-50 text-red-600 text-sm font-semibold p-3 rounded-lg">{err}</div>}
            
            <div>
              <button type="submit" className="w-full bg-black text-white p-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-brand transition-colors disabled:opacity-70" disabled={busy}>
                {busy ? "Processing..." : <><PiLockKey size={18} /> Place Order · {money(s, total)}</>}
              </button>
              <div className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1"><PiLockKey /> Secure Checkout</div>
            </div>
          </form>
        </div>
        
        {/* Right Column: Summary */}
        <div className="lg:col-span-5 order-1 lg:order-2">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 lg:p-6 shadow-sm lg:sticky lg:top-24">
            <h3 className="text-lg font-extrabold flex items-center gap-2 mb-5 pb-4 border-b border-gray-200"><PiShoppingBag /> Order Summary</h3>
            
            <div className="flex flex-col gap-4 mb-6">
              {items.map(({ p, q }) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="relative w-14 h-18 flex-shrink-0">
                    {p.img ? <img src={p.img} alt="" className="w-full h-full object-cover rounded-md border border-gray-200" /> : <div className="w-full h-full bg-gray-100 rounded-md" />}
                    <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{q}</span>
                  </div>
                  <div className="flex-1 min-w-0 text-sm font-semibold leading-tight">{nameOf(p)}</div>
                  <div className="text-sm font-bold">{money(s, eff(p) * q)}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-1">
              <div className="relative flex items-center flex-1">
                <span className="absolute left-3 text-gray-400"><PiTag /></span>
                <input className="w-full p-3 pl-10 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-brand" placeholder="Discount code" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apply()} />
              </div>
              <button className="bg-gray-100 border border-gray-300 text-black px-5 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors" onClick={apply}>Apply</button>
            </div>
            {codeMsg && <div className={`text-xs mb-4 ${applied ? "text-green-600" : "text-red-500"}`}>{codeMsg}</div>}

            <div className="border-t border-gray-200 pt-4 mt-2">
              <div className="flex justify-between text-sm text-gray-600 mb-2"><span>Subtotal</span><span>{money(s, subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm text-green-600 mb-2"><span>Discount ({applied.code})</span><span>-{money(s, discount)}</span></div>}
              <div className="flex justify-between text-sm text-gray-600 mb-2"><span>Shipping</span><span>{ship ? money(s, ship) : <span className="text-green-600 font-bold">FREE</span>}</span></div>
              <div className="flex justify-between items-baseline text-lg font-extrabold mt-4 pt-4 border-t border-gray-200"><span>Total</span><span><small className="text-xs text-gray-500 font-semibold mr-1">PKR</small>{money(s, total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}