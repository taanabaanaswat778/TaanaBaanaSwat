import { Container, Row, Col, Button } from "react-bootstrap";
import { eff } from "../utils";

export default function PromoCards({ products, onPick }) {
  const onSale = products.filter((p) => eff(p) < p.price);
  const maxOff = onSale.reduce((m, p) => Math.max(m, Math.round(100 - (eff(p) / p.price) * 100)), 0);
  const cat = [...new Set(products.map((p) => p.cat).filter(Boolean))][0];
  const imgOf = (list) => (list.find((p) => p.img) || {}).img;

  const cards = [
    { title: "End of Season Sale", sub: maxOff ? `Up to ${maxOff}% off on selected suits` : "Grab our best deals", img: imgOf(onSale), filter: "Sale" },
    { title: "New Arrivals", sub: "Latest unstitched collection", img: imgOf(products), filter: "All" },
    cat && { title: `Shop ${cat}`, sub: `Explore our ${cat} suits`, img: imgOf(products.filter((p) => p.cat === cat)), filter: cat },
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