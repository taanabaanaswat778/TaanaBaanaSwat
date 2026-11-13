import { Offcanvas } from "react-bootstrap";

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
          <div style={{ minHeight: 40 }}>
             {title}
          </div>
          {sub && <div className="small text-muted" style={{ letterSpacing: "2px" }}>{sub}</div>}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="p-0">
        <MenuList items={items} active={active} onPick={onHide}>{children}</MenuList>
      </Offcanvas.Body>
    </Offcanvas>
  );
}