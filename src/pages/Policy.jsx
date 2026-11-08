import { Container } from "react-bootstrap";
import Footer from "../components/Footer";
import { BackHome } from "../components/Breadcrumb";
import logo from "../assets/logo.png";

// ===== EDIT POLICY TEXT HERE =====
const PAGES = {
  shipping: {
    title: "Shipping Policy",
    intro: "Please note the shipping policy adopted by Taana Baana.",
    sections: [
      {
        items: [
          "We are committed to delivering your order accurately, in good condition. After placing an order, you will receive a confirmation call/email from our side.",
        ],
      },
      {
        heading: "Standard Delivery time period:",
        items: [
          "The standard delivery duration within Pakistan is 4-5 working days (Sat-Sun are not included)",
          "Delivery time for selected collections may vary, further details will be available on WhatsApp or Instagram",
          "The estimated delivery duration for international orders is 7-9 working days (Sat-Sun are not included) (depending on the destination).",
          "Delivery time may exceed due to high volume order log or the unavailability of the stock.",
          "Duty/ custom charges may apply according to your Country/Region, we send the parcels worldwide as a gift.",
          "We provide free shipping across Pakistan on orders above Rs.5000/-",
          "For worldwide we provide free delivery above 1000$ USD, below that shipping rates depends on the weight and the country.",
          "We are shipping worldwide.",
          "Sale Items are non-exchangeable",
        ],
      },
    ],
    note: "Note: During any Festive day's shipping timeline may change.",
  },
  // To add another page, copy the block above, e.g.  privacy: { title: "Privacy Policy", ... }
  // then link to it with  #/policy/privacy
};
// =================================

export default function Policy({ s, slug }) {
  const page = PAGES[slug];
  return (
    <>
      <header className="track-top">
        <BackHome />
        <a href="#/"><img src={logo} alt={s.name} className="track-logo" /></a>
        <span />
      </header>

      <Container className="policy py-5">
        {page ? (
          <>
            <h1 className="policy-title">{page.title}</h1>
            {page.intro && <p className="policy-text">{page.intro}</p>}
            {page.sections.map((sec, i) => (
              <div key={i} className="mb-4">
                {sec.heading && <p className="policy-text">{sec.heading}</p>}
                <ul className="policy-list">{sec.items.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            ))}
            {page.note && <p className="policy-text mt-4">{page.note}</p>}
          </>
        ) : (
          <div className="text-center py-5">
            <h1 className="policy-title">Page not found</h1>
            <p className="policy-text">This page isn't available yet.</p>
          </div>
        )}
      </Container>

      <Footer s={s} />
    </>
  );
}