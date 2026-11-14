import { useState } from "react";
import { Row, Col, Card, Form, Button, Table, Badge } from "react-bootstrap";
import { saveDiscount, deleteDiscount } from "../db";
import { money } from "../utils";
import { PiTag, PiTrash, PiPencilSimple, PiPercent, PiCurrencyCircleDollar, PiCalendarX, PiCheckCircle, PiClock } from "react-icons/pi";

const EMPTY = { code: "", type: "percent", value: "", minOrder: "", startDate: "", endDate: "" };

export default function Discounts({ discounts = [] }) {
  const [f, setF] = useState(EMPTY);
  const [id, setId] = useState(null);
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    if (!f.code.trim()) return alert("Please enter a code (e.g. WELCOME10)");
    const val = Number(f.value);
    if (val <= 0) return alert("Discount value must be greater than 0");
    if (f.type === "percent" && val > 100) return alert("Percentage cannot exceed 100%");
    if (f.startDate && f.endDate && f.startDate > f.endDate) return alert("End date cannot be before Start date.");

    setBusy(true);
    await saveDiscount(id, {
      code: f.code.trim().toUpperCase(),
      type: f.type,
      value: val,
      minOrder: f.minOrder ? Number(f.minOrder) : 0,
      startDate: f.startDate || "",
      endDate: f.endDate || "",
    });
    setF(EMPTY); setId(null); setBusy(false);
  }

  function edit(d) {
    setId(d.id);
    setF({ ...EMPTY, ...d });
    window.scrollTo(0, 0);
  }

  const getStatus = (d) => {
    const today = new Date().toLocaleDateString("en-CA");
    if (d.endDate && d.endDate < today) return "expired";
    if (d.startDate && d.startDate > today) return "scheduled";
    return "active";
  };

  return (
    <Row className="g-4">
      {/* LEFT: FORM */}
      <Col lg={5}>
        <Card body className="discount-card">
          <h4 className="discount-title">
            <PiTag size={24} color="var(--ac)" /> {id ? "Edit Discount" : "Create Discount"}
          </h4>
          
          <Form onSubmit={save}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-uppercase text-muted">Coupon Code</Form.Label>
              <Form.Control 
                required 
                className="input-lg input-code" 
                placeholder="e.g. WELCOME10" 
                value={f.code} 
                onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-uppercase text-muted">Discount Type</Form.Label>
              <div className="discount-toggle-wrap">
                <button 
                  type="button" 
                  className={"discount-toggle-btn " + (f.type === "percent" ? "active" : "")}
                  onClick={() => setF({ ...f, type: "percent" })}
                >
                  <PiPercent /> Percentage
                </button>
                <button 
                  type="button" 
                  className={"discount-toggle-btn " + (f.type === "fixed" ? "active" : "")}
                  onClick={() => setF({ ...f, type: "fixed" })}
                >
                  <PiCurrencyCircleDollar /> Fixed Amount
                </button>
              </div>
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-uppercase text-muted">Discount Value</Form.Label>
                  <div className="position-relative">
                    {f.type === "fixed" && <span className="position-absolute ms-3 fw-bold text-muted" style={{ top: 14 }}>Rs.</span>}
                    <Form.Control 
                      required 
                      type="number" 
                      className="input-lg"
                      style={{ paddingLeft: f.type === "fixed" ? "45px" : "16px" }}
                      min="1"
                      max={f.type === "percent" ? "100" : ""}
                      placeholder={f.type === "percent" ? "10" : "500"} 
                      value={f.value} 
                      onChange={(e) => setF({ ...f, value: e.target.value })} 
                    />
                    {f.type === "percent" && <span className="position-absolute end-0 me-3 fw-bold text-muted" style={{ top: 14 }}>%</span>}
                  </div>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-uppercase text-muted">Min. Order (Optional)</Form.Label>
                  <Form.Control 
                    type="number" 
                    className="input-lg"
                    placeholder="e.g. 5000" 
                    value={f.minOrder} 
                    onChange={(e) => setF({ ...f, minOrder: e.target.value })} 
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-uppercase text-muted">Start Date (Optional)</Form.Label>
              <Form.Control 
                type="date" 
                className="input-lg"
                value={f.startDate} 
                onChange={(e) => setF({ ...f, startDate: e.target.value })} 
              />
              <Form.Text className="text-muted small mt-1">Leave empty to start immediately.</Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-uppercase text-muted">End Date (Optional)</Form.Label>
              <Form.Control 
                type="date" 
                className="input-lg"
                value={f.endDate} 
                min={f.startDate}
                onChange={(e) => setF({ ...f, endDate: e.target.value })} 
              />
              <Form.Text className="text-muted small mt-1">Leave empty to run forever.</Form.Text>
            </Form.Group>

            <Button type="submit" disabled={busy} className="w-100 py-3" style={{ background: "var(--ac)", borderColor: "var(--ac)", borderRadius: 12, fontWeight: 700, fontSize: 15 }}>
              {busy ? "Saving..." : id ? "Save Changes" : "Create Discount"}
            </Button>
            {id && (
              <Button variant="light" className="w-100 mt-2 py-3" style={{ borderRadius: 12, fontWeight: 600 }} onClick={() => { setId(null); setF(EMPTY); }}>
                Cancel Editing
              </Button>
            )}
          </Form>
        </Card>
      </Col>

      {/* RIGHT: TABLE */}
      <Col lg={7}>
        <Card body className="discount-card h-100">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold m-0">Active Promo Codes</h5>
            <Badge bg="light" text="dark" className="border px-3 py-2" style={{ borderRadius: 99 }}>
              {discounts.length} Total
            </Badge>
          </div>

          <div className="table-responsive">
            <Table hover className="promo-table mb-0">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => {
                  const status = getStatus(d);
                  return (
                    <tr key={d.id}>
                      <td>
                        <span className="code-ticket">{d.code}</span>
                        {d.minOrder > 0 && <div className="small text-muted mt-1">Min: {money(d.minOrder)}</div>}
                      </td>
                      <td>
                        <span className="fw-bold text-danger fs-6">
                          {d.type === "percent" ? `${d.value}%` : `Rs. ${d.value}`}
                        </span>
                        <div className="small text-muted fw-semibold">OFF</div>
                      </td>
                      <td>
                        <div className="small fw-medium text-dark">
                          {d.startDate ? `From: ${d.startDate}` : "Starts: Immediately"}
                        </div>
                        <div className="small fw-medium text-dark">
                          {d.endDate ? `To: ${d.endDate}` : "Ends: Never"}
                        </div>
                      </td>
                      <td>
                        {status === "expired" && (
                          <Badge bg="danger" className="d-inline-flex align-items-center gap-1 px-2 py-1">
                            <PiCalendarX /> Expired
                          </Badge>
                        )}
                        {status === "scheduled" && (
                          <Badge bg="warning" text="dark" className="d-inline-flex align-items-center gap-1 px-2 py-1">
                            <PiClock /> Scheduled
                          </Badge>
                        )}
                        {status === "active" && (
                          <Badge bg="success" className="d-inline-flex align-items-center gap-1 px-2 py-1">
                            <PiCheckCircle /> Active
                          </Badge>
                        )}
                      </td>
                      <td className="text-end text-nowrap">
                        <button className="action-btn me-1" onClick={() => edit(d)} title="Edit">
                          <PiPencilSimple size={16} />
                        </button>
                        <button className="action-btn del" onClick={() => window.confirm("Delete this discount code?") && deleteDiscount(d.id)} title="Delete">
                          <PiTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!discounts.length && (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <PiTag size={48} color="#e7e2da" className="mb-3" />
                      <h6 className="text-muted">No promo codes yet</h6>
                      <p className="small text-muted mb-0">Create a code on the left to boost your sales.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </Col>
    </Row>
  );
}