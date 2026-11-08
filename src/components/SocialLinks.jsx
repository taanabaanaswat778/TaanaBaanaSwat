import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";

const base = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  boxShadow: "0 4px 12px rgba(0,0,0,.25)",
  transition: "transform .2s, box-shadow .2s",
};

const ITEMS = [
  { key: "instagram", label: "Instagram", Icon: FaInstagram, bg: "linear-gradient(45deg,#feda75,#fa7e1e 30%,#d62976 60%,#962fbf 80%,#4f5bd5)" },
  { key: "tiktok", label: "TikTok", Icon: FaTiktok, bg: "#111111", glow: true },
  { key: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp, bg: "#25D366" },
];

export default function SocialLinks({ links }) {
  return (
    <div style={{ display: "flex", gap: 14 }}>
      {ITEMS.map(({ key, label, Icon, bg, glow }) => (
        <a
          key={key}
          href={links[key]}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
          style={{ ...base, background: bg }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px) scale(1.08)"; e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,.3)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = base.boxShadow; }}
        >
          <Icon
            size={24}
            color="#ffffff"
            style={glow ? { filter: "drop-shadow(-1px -1px 0 #25f4ee) drop-shadow(1px 1px 0 #fe2c55)" } : undefined}
          />
        </a>
      ))}
    </div>
  );
}