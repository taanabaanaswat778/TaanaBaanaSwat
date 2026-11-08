import { Offcanvas } from "react-bootstrap";
import logo from "../assets/logo.png";

// The list itself (used inside the slide-out menu)
export function MenuList({ items, active, onPick = () => {}, children }) {
  return (
    <>
      <div className="menu-title">Menu</div>
      {items.map((it) => (
        <button
          key={it.key}
          className={"menu-item" + (active === it.key ? " on" : "")}
          onClick={() => { it.onClick(); onPick(); }}
        >
          <span>{it.label}</span>
          {it.badge && <span className="menu-badge">{it.badge}</span>}
        </button>
      ))}
      {children}
    </>
  );
}

// Slide-out menu: hidden until the ☰ button is clicked
export function SideMenu({ show, onHide, title, sub, items, active, children }) {
  return (
    <Offcanvas show={show} onHide={onHide} placement="start" className="side-menu">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          <img src={logo} alt={title} className="menu-logo" />
          {sub && <div className="small text-muted">{sub}</div>}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="p-0">
        <MenuList items={items} active={active} onPick={onHide}>{children}</MenuList>
      </Offcanvas.Body>
    </Offcanvas>
  );
}