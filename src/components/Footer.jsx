import { Container, Row, Col } from "react-bootstrap";
import SocialLinks from "./SocialLinks";
import BrandLogo from "./BrandLogo"; // <-- Using BrandLogo
import { 
  PiMapPin, PiPhone, PiEnvelopeSimple, PiClock, 
  PiTruck, PiHeadphones, PiShieldCheck
} from "react-icons/pi";

// ===== EDIT THESE =====
const INFO = {
  address: "Grace Center, Block A G.T Road, Swat Qambar",
  mapLink: "",                         
  phone: "0309-1812140",
  email: "sawat@taanabaana.pk",
  hours: "Monday - Saturday | 10:00 AM - 09:30 PM",
  freeShippingAbove: 25000,
  social: {
    instagram: "https://www.instagram.com/taanabaana.swat?srtk=YmNsYXl5dWJvZjd6&utm_source=qr",
    tiktok: "https://www.tiktok.com/@taanabaanaswat?_r=1&_t=ZS-9AdNpfqdNZM",
    whatsapp: "",
  },
  payments: ["Cash on Delivery", "Easypaisa", "Bank Transfer"],
  couriers: ["Leopard Courier"],
};
// ======================

const q = encodeURIComponent(INFO.address + ", Pakistan");
const mapUrl = INFO.mapLink || `https://www.google.com/maps?q=${q}`;
const embedUrl = `https://maps.google.com/maps?q=${q}&z=15&output=embed`;

const digits = INFO.phone.replace(/\D/g, "");
const phoneIntl = digits.startsWith("0") ? "92" + digits.slice(1) : digits;
const callUrl = `tel:+${phoneIntl}`;
const waLink = (number, text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const subject = encodeURIComponent("Question about your suits");
const emailUrl = isMobile
  ? `mailto:${INFO.email}?subject=${subject}`
  : `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(INFO.email)}&su=${subject}`;

export default function Footer({ s }) {
  const number = s.wa ? s.wa.replace(/\D/g, "") : phoneIntl;
  const contactWa = waLink(number, "Hi, I would like to contact you");

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
    <footer className="footer-luxe mt-5">
      <div className="footer-features">
        <Container>
          <Row className="g-4 text-center text-md-start">
            <Col md={4} className="d-flex align-items-center justify-content-center justify-content-md-start gap-3">
              <div className="ff-icon"><PiTruck /></div>
              <div>
                <b>Free Shipping</b>
                <div className="small text-white-50">On orders above {s.cur}{INFO.freeShippingAbove.toLocaleString()}</div>
              </div>
            </Col>
            <Col md={4} className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 border-md-x">
              <div className="ff-icon"><PiHeadphones /></div>
              <div>
                <b>Customer Support</b>
                <div className="small text-white-50">Available 10:00 AM - 9:30 PM</div>
              </div>
            </Col>
            <Col md={4} className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 border-md-x">
              <div className="ff-icon"><PiShieldCheck /></div>
              <div>
                <b>Easy Ordering</b>
                <div className="small text-white-50">Cash on Delivery available</div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        <Row className="g-5">
          
          <Col lg={4} md={6}>
            {/* NEW BRAND LOGO */}
            <div className="mb-4">
              <BrandLogo color="#fff" subColor="#d4af37" size="2.4rem" />
            </div>
            <p className="footer-desc">
              Discover the finest unstitched clothing at TaanaBaana. We bring you premium fabrics with traditional embroidery and modern digital prints.
            </p>
            <div className="mt-4">
              <SocialLinks
                links={{
                  instagram: INFO.social.instagram,
                  tiktok: INFO.social.tiktok,
                  whatsapp: INFO.social.whatsapp || contactWa,
                }}
              />
            </div>
          </Col>

          <Col lg={2} md={6} xs={6}>
            <h6 className="footer-title">Need Help</h6>
            <ul className="footer-links">
              {help.map(([t, h]) => (
                <li key={t}>
                  <a href={h} target={h.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{t}</a>
                </li>
              ))}
            </ul>
          </Col>

          <Col lg={2} md={6} xs={6}>
            <h6 className="footer-title">Information</h6>
            <ul className="footer-links">
              {about.map(([t, h]) => <li key={t}><a href={h}>{t}</a></li>)}
            </ul>
          </Col>

          <Col lg={4} md={6}>
            <h6 className="footer-title">Contact Us</h6>
            <ul className="footer-contact">
              <li><PiMapPin /> <span>{INFO.address}</span></li>
              <li><PiPhone /> <a href={callUrl}>{INFO.phone}</a></li>
              <li><PiEnvelopeSimple /> <a href={emailUrl}>{INFO.email}</a></li>
              <li><PiClock /> <span>{INFO.hours}</span></li>
            </ul>
          </Col>
        </Row>
      </Container>

      <div className="footer-bottom">
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <span className="small text-white-50 me-2">We Accept:</span>
              {INFO.payments.map((p) => <span key={p} className="pay-chip">{p}</span>)}
            </div>
            
            <div className="small text-white-50">
              © {new Date().getFullYear()} Taana Baana. All rights reserved.
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}