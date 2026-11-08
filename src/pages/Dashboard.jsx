import { Row, Col, Card, Table, Badge } from "react-bootstrap";
import { fmtDate } from "../data";
import { eff, money } from "../utils";
import logo from "../assets/logo.png";

export default function Dashboard({ products, orders, s }) {
  const live = orders.filter((o) => o.status !== "cancelled");
  const stats = [
    ["Products", products.length],
    ["On sale", products.filter((p) => eff(p) < p.price).length],
    ["Out of stock", products.filter((p) => !p.stock).length],
    ["New orders", orders.filter((o) => o.status === "new").length],
    ["Revenue", money(s, live.reduce((a, o) => a + o.total, 0))],
  ];
  return (
    <>
      <div className="text-center mb-4">
        <img src={logo} alt={s.name} className="dash-logo" />
        <div className="text-muted small mt-1">Admin Dashboard</div>
      </div>
      <Row xs={2} md={5} className="g-3 mb-4">
        {stats.map(([k, v]) => (
          <Col key={k}><Card body className="text-center"><div className="text-muted small">{k}</div><div className="fs-4 fw-bold">{v}</div></Card></Col>
        ))}
      </Row>
      <h5>Recent orders</h5>
      <Table responsive className="bg-white align-middle">
        <tbody>
          {orders.slice(0, 5).map((o) => (
            <tr key={o.id}><td className="small">{fmtDate(o.createdAt)}</td><td>{o.customer.name}</td><td>{money(s, o.total)}</td><td><Badge bg="secondary">{o.status}</Badge></td></tr>
          ))}
          {!orders.length && <tr><td className="text-center text-muted py-4">No orders yet.</td></tr>}
        </tbody>
      </Table>
    </>
  );
}