import { Container, Row, Col } from "react-bootstrap";
import SocialLinks from "./SocialLinks";

// ===== EDIT THESE =====
const INFO = {
  address: "Grace Center, Block A G.T Road, Swat Qambar",
  mapLink: "",                         // optional: paste your Google Maps share link here
  phone: "0309-1812140",
  email: "sawat@taanabaana.pk",
  hours: "Monday - Saturday | 10:00 AM - 09:30 PM",
  freeShippingAbove: 5000,
  // Paste your real page links here (leave whatsapp empty to use the phone number above)
  social: {
    instagram: "https://www.instagram.com/taanabaana.swat?srtk=YmNsYXl5dWJvZjd6&utm_source=qr",
    tiktok: "https://www.tiktok.com/@taanabaanaswat?_r=1&_t=ZS-9AdNpfqdNZM",
    whatsapp: "",
  },
  payments: ["Cash on Delivery", "JazzCash", "Easypaisa", "Bank Transfer"],
  couriers: ["leopard"],
};
// ======================

// Address -> Google Maps
const q = encodeURIComponent(INFO.address + ", Pakistan");
const mapUrl = INFO.mapLink || `https://www.google.com/maps?q=${q}`;
const embedUrl = `https://maps.google.com/maps?q=${q}&z=15&output=embed`;

// Phone: 03091-812140 becomes 923091812140 (Pakistan country code)
const digits = INFO.phone.replace(/\D/g, "");
const phoneIntl = digits.startsWith("0") ? "92" + digits.slice(1) : digits;
const callUrl = `tel:+${phoneIntl}`; // clicking the number starts a phone call
const waLink = (number, text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

// Email -> Gmail compose on computers, mail app on phones
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const subject = encodeURIComponent("Question about your suits");
const emailUrl = isMobile
  ? `mailto:${INFO.email}?subject=${subject}`
  : `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(INFO.email)}&su=${subject}`;

export default function Footer({ s }) {
  // Uses the number saved in Admin > Settings if there is one, otherwise the phone number above
  const number = s.wa ? s.wa.replace(/\D/g, "") : phoneIntl;
  const contactWa = waLink(number, "Hi, I would like to contact you");

  const help = [
    ["Track Your Order", "#/track"],
    ["Shipping Policy", "#/policy/shipping"],
    ["Order Cancellation", "#"],
    ["Contact on WhatsApp", contactWa],
  ];
  const about = [["Privacy Policy", "#"], ["Terms & Conditions", "#"], ["Return & Exchange", "#"], ["About us", "#"]];

  return (
    <footer className="site-footer mt-5">
      <div className="footer-strip">
        <Container>
          <Row className="g-3 text-center text-md-start">
            <Col md={4}><b>🚚 SHIPPING</b><div className="small text-muted">Free shipping nationwide above {s.cur}{INFO.freeShippingAbove.toLocaleString()}</div></Col>
            <Col md={4}><b>🎧 CUSTOMER SUPPORT</b><div className="small text-muted">Contact us 10:00 AM - 9:30 PM</div></Col>
            <Col md={4}><b>🛡 EASY ORDERING</b><div className="small text-muted">Cash on delivery available</div></Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4">
        <Row className="g-4">
          <Col md={6} lg={4}>
            <h6 className="fw-bold">Contact Us</h6>
            <ul className="footer-list">
              <li><a href={mapUrl} target="_blank" rel="noreferrer" title="Open in Google Maps">📍 {INFO.address}</a></li>
              <li><a href={callUrl} title="Call us">📞 {INFO.phone}</a></li>
              <li><a href={emailUrl} target={isMobile ? undefined : "_blank"} rel="noreferrer" title="Send us an email">✉️ {INFO.email}</a></li>
              <li>🕘 {INFO.hours}</li>
            </ul>
            <iframe title="Store location" className="footer-map" loading="lazy" src={embedUrl} />
          </Col>

          <Col xs={6} md={3} lg={2}>
            <h6 className="fw-bold">Need help</h6>
            <ul className="footer-list">
              {help.map(([t, h]) => (
                <li key={t}>
                  <a href={h} target={h.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{t}</a>
                </li>
              ))}
            </ul>
          </Col>

          <Col xs={6} md={3} lg={2}>
            <h6 className="fw-bold">Information</h6>
            <ul className="footer-list">
              {about.map(([t, h]) => <li key={t}><a href={h}>{t}</a></li>)}
            </ul>
          </Col>

          <Col lg={4}>
            <h6 className="fw-bold">Follow Us</h6>
            <div className="mb-3">
              <SocialLinks
                links={{
                  instagram: INFO.social.instagram,
                  tiktok: INFO.social.tiktok,
                  whatsapp: INFO.social.whatsapp || contactWa,
                }}
              />
            </div>
            <div className="fs-4 fw-bold fst-italic">{s.name}</div>
          </Col>
        </Row>

        <hr className="my-4" />
        <Row className="g-4">
          <Col md={6} className="text-center">
            <div className="fw-semibold mb-2">Accepted Payments</div>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              {INFO.payments.map((p) => <span key={p} className="chip">{p}</span>)}
            </div>
          </Col>
          <Col md={6} className="text-center border-md-start">
            <div className="fw-semibold mb-2">Official Delivery Partner</div>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              {INFO.couriers.map((c) => <span key={c} className="chip fw-bold">{c}</span>)}
            </div>
          </Col>
        </Row>

        <div className="text-center text-muted small mt-4">© {new Date().getFullYear()} {s.name}. All rights reserved.</div>
      </Container>
    </footer>
  );
}