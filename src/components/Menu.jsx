import { useEffect } from "react";
import BrandLogo from "./BrandLogo";
import { PiX } from "react-icons/pi";

// The list itself (used inside the slide-out menu)
export function MenuList({ items, active, onPick = () => {}, children }) {
  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* Menu Label */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          Browse Categories
        </span>
      </div>

      {/* Main Links */}
      <div className="flex-1 overflow-y-auto">
        {items.map((it) => (
          <button
            key={it.key}
            className={`flex items-center justify-between w-full px-6 py-4 text-[15px] text-left border-b border-gray-100 transition-all duration-200 ${
              active === it.key 
                ? "bg-[#faf5f0] text-brand font-bold border-l-4 border-l-brand pl-5" 
                : "text-gray-700 font-medium hover:bg-gray-50 hover:pl-7 border-l-4 border-l-transparent"
            }`}
            onClick={() => { it.onClick(); onPick(); }}
          >
            <span>{it.label}</span>
            {it.badge && (
              <span className="bg-black text-white text-[10px] font-bold rounded-full px-2.5 py-0.5 tracking-wider">
                {it.badge}
              </span>
            )}
          </button>
        ))}

        {/* Extra Links (Track Order, WhatsApp, etc) */}
        <div className="mt-4 px-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Slide-out menu: hidden until the ☰ button is clicked
export function SideMenu({ show, onHide, title, sub, items, active, children }) {
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (show) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onHide} />
      
      {/* Menu Panel */}
      <div className="relative w-[320px] max-w-[85vw] h-full bg-white flex flex-col shadow-2xl animate-slide-right">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <BrandLogo color="#111" subColor="#8a2c2c" size="1.6rem" />
          <button onClick={onHide} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
            <PiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <MenuList items={items} active={active} onPick={onHide}>
            {children}
          </MenuList>
        </div>
      </div>
    </div>
  );
}