import Footer from "../components/Footer";
import { BackHome } from "../components/Breadcrumb";
import BrandLogo from "../components/BrandLogo";
import { PiTruck, PiWhatsappLogo } from "react-icons/pi";

const COURIERS = [
  { name: "Leopard Courier", mark: "LEOPARD", color: "#e30613", url: "https://www.leopardscourier.com/" },
  // Add more couriers here if needed
];

export default function Track({ s }) {
  const wa = s.wa ? `https://wa.me/${s.wa.replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I want to track my order")}` : "";
  
  return (
    <>
      <header className="grid grid-cols-[1fr_auto_1fr] items-center p-4 border-b border-gray-200 bg-white">
        <BackHome />
        <a href="#/" className="flex justify-center"><BrandLogo color="#111" subColor="#8a2c2c" size="1.8rem" /></a>
        <span />
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16 text-center min-h-[50vh]">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-widest mb-4">TRACK YOUR ORDER</h1>
        <p className="text-gray-500 mb-8">Select your courier to track your shipment status</p>
        <div className="w-16 h-0.5 bg-gray-400 mx-auto mb-10"></div>

        <div className="flex flex-wrap justify-center gap-6">
          {COURIERS.map((c) => (
            <a 
              key={c.name} 
              href={c.url || `https://www.google.com/search?q=${encodeURIComponent(c.name + " tracking")}`} 
              target="_blank" 
              rel="noreferrer"
              className="group block w-full max-w-xs bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="h-32 bg-[#faf7f2] flex items-center justify-center text-3xl font-black italic group-hover:scale-105 transition-transform" style={{ color: c.color }}>
                {c.mark}
              </div>
              <div className="p-5 text-left border-t border-gray-100">
                <div className="font-bold text-sm uppercase tracking-wider text-black mb-1">{c.name}</div>
                <div className="text-xs font-bold text-brand group-hover:translate-x-1 transition-transform inline-block">TRACK ORDER →</div>
              </div>
            </a>
          ))}
        </div>

        {wa && (
          <p className="mt-16 text-sm text-gray-500">
            Don't have a tracking number? <a href={wa} target="_blank" rel="noreferrer" className="text-brand font-semibold hover:underline inline-flex items-center gap-1"><PiWhatsappLogo /> Message us on WhatsApp</a>
          </p>
        )}
      </div>

      <Footer s={s} />
    </>
  );
}