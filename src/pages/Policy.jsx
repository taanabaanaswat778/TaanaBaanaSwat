import Footer from "../components/Footer";
import { BackHome } from "../components/Breadcrumb";
import BrandLogo from "../components/BrandLogo";
import { PiCheckCircle, PiInfo } from "react-icons/pi";

const PAGES = {
  shipping: {
    title: "Shipping Policy",
    intro: "Please note the shipping policy adopted by TaanaBaana. We want to make sure your order reaches you safely and on time.",
    sections: [
      {
        items: [
          "We are committed to delivering your order accurately and in good condition. After placing an order, you will receive a confirmation call/email from our side.",
        ],
      },
      {
        heading: "Standard Delivery Time Period:",
        items: [
          "The standard delivery duration within Pakistan is 4-5 working days (Sat-Sun are not included).",
          "Delivery time for selected collections may vary; further details will be available on WhatsApp or Instagram.",
          "The estimated delivery duration for international orders is 7-9 working days (Sat-Sun are not included) (depending on the destination).",
          "Delivery time may exceed due to high volume order log or the unavailability of the stock.",
          "Duty/custom charges may apply according to your Country/Region; we send the parcels worldwide as a gift.",
          "We provide free shipping across Pakistan on orders above Rs. 4500/-",
          "For worldwide, we provide free delivery above 1000$ USD; below that, shipping rates depend on the weight and the country.",
          "We ship worldwide.",
          "Sale Items are non-exchangeable.",
        ],
      },
    ],
    note: "During any Festive day's shipping timeline may change.",
  },
  privacy: {
    title: "Privacy Policy",
    intro: "We take your privacy seriously, so we take all the possible measures to protect your personal information.",
    sections: [
      {
        items: [
          "The data you provide on this site for your order will be used just to maintain a healthy relationship with our customer.",
          "We collect the information that you enter into a form or share with us via email, for example, your name, email ID, or IP address.",
          "We will not resell or redistribute your information.",
          "Maintaining the security of your data is a priority at TaanaBaana, and we are committed to protecting your privacy rights.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro: "Customers are required to read and accept all of the terms and conditions laid down in these Terms and Conditions and the linked Privacy Policy.",
    sections: [
      {
        heading: "Terms Of Service",
        items: [
          "The Site allows you to browse, select, and purchase Clothing.",
          "These TERMS AND CONDITIONS are effective upon acceptance and govern the relationship between you and TaanaBaana Pakistan (SMC-Private) Limited, a company incorporated under.",
          "If these TERMS AND CONDITIONS conflict with any other document, the TERMS AND CONDITIONS will prevail for the purposes of usage of the Site.",
          "If you do not agree to be bound by these TERMS AND CONDITIONS and the Privacy Policy, you may not use the Site in any way.",
          "The Company may amend this Agreement and/or the Privacy Policy at any time by posting a revised version on the Site. All updates and amendments shall be notified to you via posts on the website or through e-mail.",
        ],
      },
      {
        heading: "Delivery Information & Shipment Charges",
        items: [
          "We aim to dispatch every order within 4-5 Working days & international orders in 5-7 Working days (Sat-Sun not Included).",
          "After the order has been dispatched it will take 2-4 working days to deliver according to your Country.",
          "However, there may be any situation where delivery takes more then 2-4 working days due to any technical issues, such as; flight schedule, Bad weather, ETC or in Far areas.",
          "We process COD (Cash on Delivery) via multiple courier services.",
          "In case the customer is absent upon delivery, a representative would call and act upon the instructions of the customer. The parcel can either be delivered on another time or dropped by at neighbor’s only upon receiving the payment.",
        ],
      },
      {
        heading: "Payment Information",
        items: [
          "Pay by Card (Visa, MasterCard)",
          "Pay by Western Union, Jazz cash/EasyPaisa and Bank deposit",
          "If you chose Bank deposit Please share the screenshot of the transaction to our WhatsApp or Instagram or Email us at customercare@taanabaana.pk",
          "Cash on delivery (COD) Nationwide only.",
        ],
      },
      {
        heading: "Product Information",
        items: [
          "Most of the products displayed at our site are available while the supplies last.",
          "Colors: We have made every effort to display as accurately as possible the colors of our products. However, as the actual colors you see will depend on your monitor, we cannot guarantee that your monitor’s display of any color will be accurate.",
          "Our products are same as shown on our website.",
          "We amend our policies time to time, please stay updated with us.",
        ],
      },
      {
        heading: "Customs & Duties",
        items: [
          "Customs Duty is a tariff or tax imposed on goods when transported across international borders.",
          "The receivers of the packages have to pay the custom duties to clear shipments on arrival.",
          "You will not be paying to DHL any further shipping costs. Rather, you will be asked instead to pay customs duties, taxes and other import charges related to customs clearance in your home country, as per local regulations.",
          "Whether a shipment is a gift or not, it must still go through an import procedure as determined by custom’s law in the destination country.",
          "TaanaBaana is not responsible to pay for any customs duties charged to their customer at the time of the receival of the package.",
          "If the package has already been shipped and customer refuses to pay the charges, TaanaBaana has every right to get the package back and deduct the following charges from the refund: Initial shipping paid with the order, Return shipping charges, Any tax/duties charged to TaanaBaana upon return.",
        ],
      },
    ],
  },
  returns: {
    title: "Return & Exchange Policy",
    intro: "Thank you for shopping at TaanaBaana! Please read our return and exchange policy carefully.",
    sections: [
      {
        heading: "Exchange Policy",
        items: [
          "You have to let us know within 7 days after the delivery to claim for the exchange if: The product is damaged, The product received does not match the ordered size.",
          "The product must be unused, in the original packaging with labels and protective stickers/papers attached.",
          "Article must be returned in the original packaging before use.",
          "Your item needs to have the receipt or proof of purchase.",
          "Once we receive your item, we will inspect it and notify you that we have received your returned item.",
          "You will be responsible for paying for your own shipping cost for returning your item. Shipping cost are non-refundable.",
          "The exchange will only be catered if you have the video of opening the parcel, in case of any color or damaged article.",
        ],
      },
      {
        heading: "International Exchanges",
        items: [
          "Kindly inspect the item on arrival before sending them abroad as the exchange won’t be catered.",
          "We advise you to check the size charts and the descriptions before placing an order (as international orders cannot be exchanged or refunded).",
          "As per courier policy they will attempt the delivery once (on your given address and phone number) if the customer is not available the parcel will be left on your door step.",
        ],
      },
      {
        heading: "Return Policy",
        items: [
          "We will not accept return or exchange for any item that has been washed, dried, damaged or stained in any way.",
          "We are not responsible for bleeding, damage of print or fading of colors due to washing.",
          "We recommend hand wash all items in cold water and hand drying to prevent discoloration, print damage and shrinkage.",
        ],
      },
      {
        heading: "Refund Policy",
        items: [
          "At TaanaBaana we don’t have a refund policy, we will issue you a store credit (Amount Voucher valid till Use).",
          "Once the order is placed it cannot be cancelled a store credit will be issued (Paid orders only).",
          "The Voucher given in any compensation can be redeemed on the website only.",
        ],
      },
    ],
  },
  cancellation: {
    title: "Order Cancellation",
    intro: "Please review our cancellation policy before placing an order.",
    sections: [
      {
        items: [
          "Once the order is placed it cannot be cancelled. A store credit will be issued (Paid orders only).",
          "The Voucher given in any compensation can be redeemed on the website only.",
          "If you have any questions on how to cancel or return your item you may contact us at +923400321111",
        ],
      },
    ],
  },
  about: {
    title: "About Us",
    intro: "Welcome to TaanaBaana.",
    sections: [
      {
        items: [
          "We are a premier unstitched clothing brand based in Swat, Pakistan.",
          "Our goal is to provide high-quality, beautiful fabrics that blend traditional embroidery with modern digital prints.",
          "We take pride in our craftsmanship and our ability to bring the latest fashion trends directly to your doorstep.",
          "Thank you for choosing TaanaBaana for your wardrobe needs.",
        ],
      },
    ],
  }
};

export default function Policy({ s, slug }) {
  const page = PAGES[slug] || PAGES.shipping;

  return (
    <>
      <header className="grid grid-cols-[1fr_auto_1fr] items-center p-4 border-b border-gray-200 bg-white">
        <BackHome />
        <a href="#/" className="flex justify-center"><BrandLogo color="#111" subColor="#8a2c2c" size="1.8rem" /></a>
        <span />
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Quick Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Object.entries(PAGES).map(([key, p]) => (
            <a 
              key={key} 
              href={`#/policy/${key}`}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${slug === key ? "bg-black text-white" : "bg-white border border-gray-300 text-gray-600 hover:border-black hover:text-black"}`}
            >
              {p.title}
            </a>
          ))}
        </div>

        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-4">{page.title}</h1>
          {page.intro && <p className="text-gray-500 text-sm text-center max-w-xl mx-auto mb-10 leading-relaxed">{page.intro}</p>}

          {page.sections.map((sec, i) => (
            <div key={i} className="mb-8">
              {sec.heading && <h3 className="text-lg font-bold border-b-2 border-gray-100 pb-2 mb-4 inline-block">{sec.heading}</h3>}
              <ul className="flex flex-col gap-3">
                {sec.items.map((t, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                    <PiCheckCircle className="text-brand text-lg flex-shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {page.note && (
            <div className="flex items-start gap-3 bg-[#faf7f2] border-l-4 border-brand p-5 rounded-r-xl mt-8 text-sm text-gray-700 leading-relaxed">
              <PiInfo className="text-brand text-xl flex-shrink-0 mt-0.5" />
              <div><b>Note:</b> {page.note}</div>
            </div>
          )}
        </div>
      </div>

      <Footer s={s} />
    </>
  );
}