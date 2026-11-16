import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { eff, inCollection } from "../utils";
import { PiArrowRight } from "react-icons/pi";

const PromoCardItem = ({ filter, title, sub, images, onPick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="promo-card" onClick={() => onPick(filter)} style={{ background: "#e9d5c0" }}>
        <div className="promo-overlay" />
        <div className="promo-content">
          <h4>{title}</h4>
          <p>{sub}</p>
          <span className="promo-btn">Shop Now <PiArrowRight /></span>
        </div>
      </div>
    );
  }

  return (
    <div className="promo-card" onClick={() => onPick(filter)}>
      {images.map((img, i) => (
        <div
          key={i}
          className={"promo-bg " + (i === currentIndex ? "active" : "")}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      <div className="promo-overlay" />
      <div className="promo-content">
        <h4>{title}</h4>
        <p>{sub}</p>
        <span className="promo-btn">Shop Now <PiArrowRight /></span>
      </div>
      {images.length > 1 && (
        <div className="promo-dots">
          {images.map((_, i) => (
            <span key={i} className={"promo-dot " + (i === currentIndex ? "on" : "")} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function PromoCards({ products = [], onPick }) {
  if (!Array.isArray(products) || !products.length) {
    return (
      <Container className="py-4">
        <Row xs={1} sm={2} lg={4} className="g-3 g-md-4">
          {[1, 2, 3, 4].map((i) => (
            <Col key={i}>
              <div className="promo-card skeleton">
                <div className="promo-skeleton-loader"></div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

  const getMaxOff = (filter) => {
    const items = products.filter((p) => inCollection(p, filter) && eff(p) < p.price);
    return items.reduce((m, p) => Math.max(m, Math.round(100 - (eff(p) / p.price) * 100)), 0);
  };

  const getImages = (filter) => {
    return products
      .filter((p) => inCollection(p, filter) && p.img)
      .slice(0, 4)
      .map((p) => p.img);
  };

  const cards = [
    { filter: "Sale", title: "End of Season Sale", sub: getMaxOff("Sale") ? `Up to ${getMaxOff("Sale")}% off` : "Shop our best deals", images: getImages("Sale") },
    { filter: "New", title: "New Arrivals", sub: getMaxOff("New") ? `Up to ${getMaxOff("New")}% off` : "Fresh designs just landed", images: getImages("New") },
    { filter: "Karandi", title: "Karandi Collection", sub: getMaxOff("Karandi") ? `Up to ${getMaxOff("Karandi")}% off` : "Warm, textured suits", images: getImages("Karandi") },
    { filter: "Fancy", title: "Fancy Collection", sub: getMaxOff("Fancy") ? `Up to ${getMaxOff("Fancy")}% off` : "Chiffon & organza for events", images: getImages("Fancy") },
  ].filter((c) => products.some((p) => inCollection(p, c.filter)));

  if (!cards.length) return null;

  return (
    <Container className="py-4">
      <Row xs={1} sm={2} lg={cards.length} className="g-3 g-md-4">
        {cards.map((c) => (
          <Col key={c.title}>
            <PromoCardItem filter={c.filter} title={c.title} sub={c.sub} images={c.images} onPick={onPick} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}