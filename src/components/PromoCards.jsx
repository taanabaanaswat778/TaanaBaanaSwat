import { Container, Row, Col, Button } from "react-bootstrap";
import { eff, inCollection } from "../utils";

export default function PromoCards({ products = [], onPick }) {
  // 1. SAFETY CHECK: If products is not an array yet, don't try to filter it.
  if (!Array.isArray(products) || !products.length) {
    return (
      <Container className="py-4">
        <Row xs={1} md={3} className="g-3">
          {[1, 2, 3].map((i) => (
            <Col key={i}>
              <div className="promo" style={{ background: "#f5f2ec", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="spinner-border text-secondary" role="status"></div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

  // 2. Filter products for the Sale card
  const onSale = products.filter((p) => eff(p) < p.price);
  const maxOff = onSale.reduce((m, p) => Math.max(m, Math.round(100 - (eff(p) / p.price) * 100)), 0);

  // 3. Filter products for New Arrivals
  const newArrivals = products.filter((p) => inCollection(p, "New"));

  // 4. Find the first available category for the third card
  const cat = [...new Set(products.map((p) => p.cat).filter(Boolean))][0];
  const catProducts = cat ? products.filter((p) => p.cat === cat) : [];

  // Helper to find the first image ONLY from the specific list provided
  const imgOf = (list) => (list.find((p) => p.img) || {}).img;

  const cards = [
    { 
      title: "End of Season Sale", 
      sub: maxOff ? `Up to ${maxOff}% off on selected suits` : "Grab our best deals", 
      img: imgOf(onSale), 
      filter: "Sale" 
    },
    { 
      title: "New Arrivals", 
      sub: "Latest unstitched collection", 
      img: imgOf(newArrivals), 
      filter: "New" 
    },
    cat && { 
      title: `Shop ${cat}`, 
      sub: `Explore our ${cat} suits`, 
      img: imgOf(catProducts), 
      filter: cat 
    },
  ].filter(Boolean);

  return (
    <Container className="py-4">
      <Row xs={1} md={cards.length} className="g-3">
        {cards.map((c) => (
          <Col key={c.title}>
            <div className="promo" style={c.img ? { backgroundImage: `url(${c.img})` } : {}}>
              <div className="promo-in">
                <h4>{c.title}</h4>
                <p>{c.sub}</p>
                <Button size="sm" variant="light" className="pill px-3" onClick={() => onPick(c.filter)}>Shop Now</Button>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
}