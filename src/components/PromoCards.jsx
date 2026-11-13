import { Container, Row, Col, Button } from "react-bootstrap";
import { eff, inCollection } from "../utils";

export default function PromoCards({ products, onPick }) {
  // 1. Filter products for the Sale card
  const onSale = products.filter((p) => eff(p) < p.price);
  const maxOff = onSale.reduce((m, p) => Math.max(m, Math.round(100 - (eff(p) / p.price) * 100)), 0);

  // 2. Filter products for New Arrivals
  const newArrivals = products.filter((p) => inCollection(p, "New"));

  // 3. Find the first available category for the third card
  const cat = [...new Set(products.map((p) => p.cat).filter(Boolean))][0];
  const catProducts = cat ? products.filter((p) => p.cat === cat) : [];

  // Helper to find the first image ONLY from the specific list provided
  const imgOf = (list) => (list.find((p) => p.img) || {}).img;

  const cards = [
    { 
      title: "End of Season Sale", 
      sub: maxOff ? `Up to ${maxOff}% off on selected suits` : "Grab our best deals", 
      img: imgOf(onSale), // Only looks in onSale array
      filter: "Sale" 
    },
    { 
      title: "New Arrivals", 
      sub: "Latest unstitched collection", 
      img: imgOf(newArrivals), // Only looks in New Arrivals array
      filter: "New" 
    },
    cat && { 
      title: `Shop ${cat}`, 
      sub: `Explore our ${cat} suits`, 
      img: imgOf(catProducts), // Only looks in this specific category
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