import { Container, Row, Col } from "react-bootstrap";
import Footer from "../components/Footer";
import { BackHome } from "../components/Breadcrumb";
import logo from "../assets/logo.png";

// ===== EDIT: courier names and their tracking page links =====
const COURIERS = [
  { name: "TCS Express", mark: "TCS", color: "#e30613", url: "https://www.tcsexpress.com/" },
  { name: "Fly Courier", mark: "FLY Courier", color: "#111", url: "" }, // paste the Fly Courier tracking link here
];
// =============================================================

const link = (c) => c.url || `https://www.google.com/search?q=${encodeURIComponent(c.name + " tracking")}`;

export default function Track({ s }) {
  const wa = s.wa ? `https://wa.me/${s.wa.replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I want to track my order")}` : "";
  return (
    <>
      <header className="track-top">
        <BackHome />
        <a href="#/"><img src={logo} alt={s.name} className="track-logo" /></a>
        <span />
      </header>

      <Container className="text-center py-5">
        <h1 className="track-title">TRACK YOUR ORDER</h1>
        <p className="text-muted">Select your courier to track your shipment status</p>
        <hr className="track-line" />

        <Row className="g-4 justify-content-center mt-2">
          {COURIERS.map((c) => (
            <Col key={c.name} xs={12} sm={6} md={4} lg={3}>
              <a className="track-card" href={link(c)} target="_blank" rel="noreferrer">
                <div className="track-mark" style={{ color: c.color }}>{c.mark}</div>
                <div className="track-info">
                  <div className="fw-bold text-uppercase">{c.name}</div>
                  <div className="track-go">TRACK ORDER →</div>
                </div>
              </a>
            </Col>
          ))}
        </Row>

        {wa && (
          <p className="mt-5 text-muted">
            Don't have a tracking number? <a href={wa} target="_blank" rel="noreferrer">Message us on WhatsApp</a>
          </p>
        )}
      </Container>

      <Footer s={s} />
    </>
  );
}