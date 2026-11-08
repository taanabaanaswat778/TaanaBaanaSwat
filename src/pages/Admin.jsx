import { useEffect, useState } from "react";
import { Navbar, Container, Button, Card, Form, Alert } from "react-bootstrap";
import { DEMO, onAuth, subOrders, login, logout, isAdmin } from "../data";
import { SideMenu } from "../components/Menu";
import Dashboard from "./Dashboard";
import { ProductsTab, OrdersTab, SettingsTab } from "./AdminTabs";

export default function Admin({ products, s }) {
  const [user, setUser] = useState(undefined);
  const [tab, setTab] = useState("dashboard");
  const [menu, setMenu] = useState(false);
  const [orders, setOrders] = useState([]);
  const [cred, setCred] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  useEffect(() => onAuth(setUser), []);
  useEffect(() => (user && isAdmin(user) ? subOrders(setOrders) : undefined), [user]);

  if (user === undefined) return <p className="p-5 text-center">Loading…</p>;

  if (!user || !isAdmin(user)) {
    return (
      <Container style={{ maxWidth: 380 }} className="py-5">
        <Card body>
          <h4>Admin login</h4>
          {DEMO && <Alert variant="info">Demo mode: enter any email and password.</Alert>}
          {err && <Alert variant="danger">{err}</Alert>}
          {user && <Alert variant="warning">This account is not the admin.</Alert>}
          <Form onSubmit={async (e) => { e.preventDefault(); try { await login(cred.email, cred.password); setErr(""); } catch { setErr("Wrong email or password"); } }}>
            <Form.Control required type="email" className="mb-2" placeholder="Email" onChange={(e) => setCred({ ...cred, email: e.target.value })} />
            <Form.Control required type="password" className="mb-3" placeholder="Password" onChange={(e) => setCred({ ...cred, password: e.target.value })} />
            <Button type="submit" className="w-100">Log in</Button>
          </Form>
          <a href="#/" className="d-block text-center mt-3">← Back to store</a>
        </Card>
      </Container>
    );
  }

  const items = [
    { key: "dashboard", label: "Dashboard", onClick: () => setTab("dashboard") },
    { key: "products", label: "Products", onClick: () => setTab("products") },
    { key: "orders", label: "Orders", badge: orders.filter((o) => o.status === "new").length || null, onClick: () => setTab("orders") },
    { key: "settings", label: "Settings", onClick: () => setTab("settings") },
    { key: "store", label: "View Store", onClick: () => (window.location.hash = "#/") },
    { key: "out", label: "Log out", onClick: () => logout() },
  ];

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" sticky="top">
        <Container fluid className="d-grid px-3" style={{ gridTemplateColumns: "1fr auto 1fr" }}>
          <Button variant="link" className="text-white fs-3 p-0 lh-1 justify-self-start text-decoration-none" onClick={() => setMenu(true)}>☰</Button>
          <Navbar.Brand className="m-0 text-capitalize">{tab}</Navbar.Brand>
          <Button variant="link" className="text-white p-0 justify-self-end text-decoration-none small" onClick={() => (window.location.hash = "#/")}>Store ↗</Button>
        </Container>
      </Navbar>
      <SideMenu show={menu} onHide={() => setMenu(false)} title={`${s.name} Admin`} items={items} active={tab} />
      <Container className="py-3">
        {tab === "dashboard" && <Dashboard products={products} orders={orders} s={s} />}
        {tab === "products" && <ProductsTab products={products} s={s} />}
        {tab === "orders" && <OrdersTab orders={orders} s={s} />}
        {tab === "settings" && <SettingsTab s={s} />}
      </Container>
    </>
  );
}