import SocialLinks from "./SocialLinks"; // <-- Fixed Import (no curly braces)
import BrandLogo from "./BrandLogo";
import { 
  PiMapPin, PiPhone, PiEnvelopeSimple, PiClock, 
  PiTruck, PiHeadphones, PiShieldCheck
} from "react-icons/pi";

const INFO = {
  address: "Grace Center, Block A G.T Road, Swat Qambar",
  mapLink: "",                         
  phone: "0309-1812140",
  email: "sawat@taanabaana.pk",
  hours: "Monday - Saturday | 10:00 AM - 09:30 PM",
  freeShippingAbove: 25000,
  social: {
    instagram: "https://www.instagram.com/taanabaana.swat",
    tiktok: "https://www.tiktok.com/@taanabaanaswat",
    whatsapp: "",
  },
  payments: ["Cash on Delivery", "Easypaisa", "Bank Transfer"],
  couriers: ["Leopard Courier"],
};

const q = encodeURIComponent(INFO.address + ", Pakistan");
const mapUrl = INFO.mapLink || `https://www.google.com/maps?q=${q}`;
const digits = INFO.phone.replace(/\D/g, "");
const phoneIntl = digits.startsWith("0") ? "92" + digits.slice(1) : digits;
const callUrl = `tel:+${phoneIntl}`;
const waLink = (number, text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

export default function Footer({ s }) {
  const contactWa = waLink(phoneIntl, "Hi, I would like to contact you");

  const help = [
    ["Track Your Order", "#/track"],
    ["Shipping Policy", "#/policy/shipping"],
    ["Order Cancellation", "#/policy/cancellation"],
    ["Contact on WhatsApp", contactWa],
  ];
  
  const about = [
    ["Privacy Policy", "#/policy/privacy"],
    ["Terms & Conditions", "#/policy/terms"],
    ["Return & Exchange", "#/policy/returns"],
    ["About us", "#/policy/about"]
  ];

  return (
    <footer className="bg-[#111] text-white mt-12">
      {/* Features Strip */}
      <div className="bg-[#1a1a1a] py-4 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg text-[#d4af37]"><PiTruck /></div>
            <div>
              <b className="text-white text-sm">Free Shipping</b>
              <div className="text-gray-400 text-xs">On orders above {s.cur}{INFO.freeShippingAbove.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3 md:border-l md:border-white/10 md:pl-6">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg text-[#d4af37]"><PiHeadphones /></div>
            <div>
              <b className="text-white text-sm">Customer Support</b>
              <div className="text-gray-400 text-xs">Available 10:00 AM - 9:30 PM</div>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3 md:border-l md:border-white/10 md:pl-6">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg text-[#d4af37]"><PiShieldCheck /></div>
            <div>
              <b className="text-white text-sm">Easy Ordering</b>
              <div className="text-gray-400 text-xs">Cash on Delivery available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="mb-4"><BrandLogo color="#fff" subColor="#d4af37" size="2rem" /></div>
          <p className="text-gray-400 text-[13px] leading-relaxed max-w-xs">
            Discover the finest unstitched clothing at TaanaBaana. We bring you premium fabrics with traditional embroidery and modern digital prints.
          </p>
          <div className="mt-4"><SocialLinks links={INFO.social} /></div>
        </div>

        <div>
          <h6 className="text-[12px] font-bold uppercase tracking-widest text-white mb-4">Need Help</h6>
          <ul className="space-y-2">
            {help.map(([t, h]) => (
              <li key={t}><a href={h} target={h.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="text-gray-400 text-[13px] hover:text-[#d4af37] transition-colors">{t}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h6 className="text-[12px] font-bold uppercase tracking-widest text-white mb-4">Information</h6>
          <ul className="space-y-2">
            {about.map(([t, h]) => (
              <li key={t}><a href={h} className="text-gray-400 text-[13px] hover:text-[#d4af37] transition-colors">{t}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h6 className="text-[12px] font-bold uppercase tracking-widest text-white mb-4">Contact Us</h6>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-gray-400 text-[13px]"><PiMapPin size={18} className="text-[#d4af37] mt-0.5 flex-shrink-0" /> <span>{INFO.address}</span></li>
            <li className="flex items-start gap-3 text-gray-400 text-[13px]"><PiPhone size={18} className="text-[#d4af37] mt-0.5 flex-shrink-0" /> <a href={callUrl} className="hover:text-white">{INFO.phone}</a></li>
            <li className="flex items-start gap-3 text-gray-400 text-[13px]"><PiEnvelopeSimple size={18} className="text-[#d4af37] mt-0.5 flex-shrink-0" /> <a href={`mailto:${INFO.email}`} className="hover:text-white">{INFO.email}</a></li>
            <li className="flex items-start gap-3 text-gray-400 text-[13px]"><PiClock size={18} className="text-[#d4af37] mt-0.5 flex-shrink-0" /> <span>{INFO.hours}</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="bg-[#0a0a0a] py-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-[11px] mr-1">We Accept:</span>
            {INFO.payments.map((p) => <span key={p} className="bg-white/10 border border-white/10 px-2 py-1 rounded text-white text-[10px] font-semibold">{p}</span>)}
          </div>
          <div className="text-gray-500 text-[11px]">© {new Date().getFullYear()} Taana Baana. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}