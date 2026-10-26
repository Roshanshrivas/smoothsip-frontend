import React, { useEffect } from "react";
import QRCode from "react-qr-code";
import "./OrderPrintView.css";

const BUSINESS = {
  name: "Smoothsip",
  tagline: "Premium Insulated Tumblers",
  addressLine1: "28/1 Shirdipuram, Kolar Road, Bhopal (M.P.) 462042",
  addressLine2: "near Parel Railway Station, Mumbai, Maharashtra, 400012",
  pinCode: "462042",
  state: "Madhya Pradesh",
  stateCode: "23",
  phone: "+91 9109575185",
  email: "connectsmoothsip@gmail.com",
  website: "smoothsip.in",
  gstin: "23BQFPJ3171D1ZB",
  pan: "ABCDXXXX",
  // hsnCode: "",
  gstRate: 18,
  // bank: "HDFC Bank · A/C 50200012345678 · IFSC HDFC0001234",
};

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR",
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});
const formatCurrency = (val) => INR.format(Number(val) || 0);
const formatAmount = (val) => formatCurrency(val).replace("₹", "").trim();

const getBaseUrl = () =>
  typeof window === "undefined" ? `https://${BUSINESS.website}` : window.location.origin;

const getOrderNumber = (order) => order.orderNumber || order.id || order._id || "—";

const getCustomerName = (order) =>
  order.customer?.name || (typeof order.customer === "string" ? order.customer : null) ||
  order.shippingAddress?.name || "Customer";

const buildAddressString = (address) => {
  if (!address) return "Address not provided";
  if (typeof address === "string") return address;
  return [address.address, address.city, address.state, address.pinCode, address.country]
    .filter(Boolean).join("\n") || "Address not provided";
};

const numberToWords = (amount) => {
  const ONES = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const TENS = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const convert = (number) => {
    if (number === 0) return "Zero";
    if (number < 20) return ONES[number];
    if (number < 100) return TENS[Math.floor(number / 10)] + (number % 10 ? " " + ONES[number % 10] : "");
    if (number < 1000) return ONES[Math.floor(number / 100)] + " Hundred" + (number % 100 ? " " + convert(number % 100) : "");
    if (number < 100000) return convert(Math.floor(number / 1000)) + " Thousand" + (number % 1000 ? " " + convert(number % 1000) : "");
    if (number < 10000000) return convert(Math.floor(number / 100000)) + " Lakh" + (number % 100000 ? " " + convert(number % 100000) : "");
    return convert(Math.floor(number / 10000000)) + " Crore" + (number % 10000000 ? " " + convert(number % 10000000) : "");
  };
  const safeAmount = Math.max(0, Number(amount) || 0);
  const rupees = Math.floor(safeAmount + 0.000001);
  const paise = Math.round((safeAmount - rupees) * 100);
  let result = `${convert(rupees)} Rupees`;
  if (paise > 0) result += ` and ${convert(paise)} Paise`;
  return `${result} Only`;
};

const buildCalc = (order) => {
  const items = (Array.isArray(order.items) ? order.items : []).map((item) => ({
    ...item,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 0,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = Number(order.shipping) || 0;
  const discount = Number(order.couponDiscount ?? order.discount) || 0;
  const taxableAmount = Math.max(0, subtotal - discount);

  const invoiceSubtotal = taxableAmount / (1 + BUSINESS.gstRate / 100);
  const gstAmount = taxableAmount - invoiceSubtotal;

  const total = order.total !== undefined && order.total !== null ? Number(order.total) : taxableAmount + shipping;
  const orderDate = new Date(order.createdAt || order.date || Date.now());
  const formattedDate = Number.isNaN(orderDate.getTime()) ? "—" : orderDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return {
    items, subtotal, invoiceSubtotal, gstAmount, shipping, discount, total,
    formattedDate, invoiceNumber: `SS-2026-00${getOrderNumber(order)}`,
    orderNumber: getOrderNumber(order), customerName: getCustomerName(order),
    email: order.email || "", phone: order.phone || order.shippingAddress?.phone || "",
    billingAddress: buildAddressString(order.billingAddress || order.shippingAddress),
    shippingAddress: buildAddressString(order.shippingAddress),
    trackingNumber: order.trackingNumber || "123456789012",
    amountInWords: numberToWords(total),
    totalUnits: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

const Brand = ({ tagline = false }) => (
  <div>
    <h1 className="inv-brand">{BUSINESS.name}</h1>
    {tagline && <p className="inv-tagline">{BUSINESS.tagline}</p>}
  </div>
);

const AddressText = ({ value, style }) => (
  <p className="inv-addr-text" style={style}>{value}</p>
);

const Invoice = ({ order }) => {
  const c = buildCalc(order);
  return (
    <div className="invoice-sheet">
      <div className="inv-header">
        <Brand tagline />
        <div className="inv-meta-right">
          <h2 className="inv-title">TAX INVOICE</h2>
          <p className="inv-subtitle">Original for Recipient</p>
          <table className="inv-meta-table">
            <tbody>
              <tr><td>Invoice No</td><td>: {c.invoiceNumber}</td></tr>
              <tr><td>Order No</td><td>: {c.orderNumber}</td></tr>
              <tr><td>Invoice Date</td><td>: {c.formattedDate}</td></tr>
              <tr><td>Order Date</td><td>: {c.formattedDate}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="inv-addr-grid">
        <div className="inv-addr-box">
          <p className="inv-addr-title">Bill To</p>
          <p className="inv-addr-name">{c.customerName}</p>
          <AddressText value={c.billingAddress} />
          {c.phone && <AddressText value={`Mobile: ${c.phone}`} />}
        </div>
        <div className="inv-addr-box" style={{ borderRight: "none" }}>
          <p className="inv-addr-title">Ship To</p>
          <p className="inv-addr-name">{c.customerName}</p>
          <AddressText value={c.shippingAddress} />
          {c.phone && <AddressText value={`Mobile: ${c.phone}`} />}
        </div>
      </div>

      <table className="inv-table">
        <thead>
          <tr>
            <th className="inv-th" style={{ width: 30 }}>#</th>
            <th className="inv-th">Product</th>
            <th className="inv-th" style={{ width: 70, textAlign: "center" }}>HSN/SAC</th>
            <th className="inv-th" style={{ width: 40, textAlign: "center" }}>Qty</th>
            <th className="inv-th" style={{ width: 80, textAlign: "right" }}>Price (₹)</th>
            <th className="inv-th" style={{ width: 90, textAlign: "right" }}>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {c.items.length === 0 ? (
            <tr><td colSpan="6" className="inv-td" style={{ textAlign: "center", padding: 20 }}>No items found.</td></tr>
          ) : (
            c.items.map((item, index) => (
              <tr key={item._id || item.sku || index}>
                <td className="inv-td" style={{ textAlign: "center" }}>{index + 1}</td>
                <td className="inv-td">
                  <div className="inv-item-name">{item.name || "Product"}</div>
                  <div className="inv-item-desc">{item.description || "Item Description"}</div>
                </td>
                <td className="inv-td" style={{ textAlign: "center" }}>{item.hsnCode || BUSINESS.hsnCode}</td>
                <td className="inv-td" style={{ textAlign: "center" }}>{item.quantity}</td>
                <td className="inv-td" style={{ textAlign: "right" }}>{formatAmount(item.price)}</td>
                <td className="inv-td" style={{ textAlign: "right" }}>{formatAmount(item.price * item.quantity)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="inv-totals-wrap">
        <table className="inv-totals-table">
          <tbody>
            <tr>
              <td className="inv-totals-label">Sub Total</td>
              <td className="inv-totals-val">₹ {formatAmount(c.invoiceSubtotal)}</td>
            </tr>
            <tr>
              <td className="inv-totals-label">GST ({BUSINESS.gstRate}%)</td>
              <td className="inv-totals-val">₹ {formatAmount(c.gstAmount)}</td>
            </tr>
            {c.shipping > 0 && (
              <tr>
                <td className="inv-totals-label">Shipping</td>
                <td className="inv-totals-val">₹ {formatAmount(c.shipping)}</td>
              </tr>
            )}
            {c.discount > 0 && (
              <tr>
                <td className="inv-totals-label">Discount</td>
                <td className="inv-totals-val">- ₹ {formatAmount(c.discount)}</td>
              </tr>
            )}
            <tr className="inv-totals-grand">
              <td className="inv-totals-label">Total</td>
              <td className="inv-totals-val">₹ {formatAmount(c.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="inv-words">
        <strong>Amount in Words:</strong>
        <p style={{ margin: "6px 0 0" }}>{c.amountInWords}</p>
      </div>

      <div className="inv-footer">
        <div>
          <p className="inv-sign-for">For SmoothSip</p>
          <div className="inv-sign-line" />
          <p className="inv-sign-label">Authorized Signatory</p>
        </div>
        <div className="inv-footer-right">
          <p><strong>GSTIN:</strong> {BUSINESS.gstin}</p>
          <p><strong>PAN:</strong> {BUSINESS.pan}</p>
          <p><strong>Support:</strong> {BUSINESS.email}</p>
          <p>{BUSINESS.website}</p>
        </div>
      </div>
    </div>
  );
};

const PackingSlip = ({ order }) => {
  const c = buildCalc(order);
  return (
    <div className="pack-sheet">
      <div className="pack-header">
        <Brand />
        <div style={{ textAlign: "right" }}>
          <h2 className="pack-title">Packing Slip</h2>
          <p className="pack-meta">Order # {c.orderNumber}</p>
          <p className="pack-meta">Date: {c.formattedDate}</p>
        </div>
      </div>

      <div className="pack-box">
        <p className="pack-box-title">Shipping Address</p>
        <p className="inv-addr-name">{c.customerName}</p>
        <AddressText value={c.shippingAddress} />
        {c.phone && <AddressText value={`Mobile: ${c.phone}`} />}
      </div>

      <p className="pack-section-title">Order Items</p>
      <table className="pack-table">
        <thead>
          <tr>
            <th className="pack-th" style={{ width: 30 }}>#</th>
            <th className="pack-th">Product</th>
            <th className="pack-th" style={{ width: 50, textAlign: "center" }}>Qty</th>
          </tr>
        </thead>
        <tbody>
          {c.items.length === 0 ? (
             <tr><td colSpan="3" className="pack-td" style={{ textAlign: "center", padding: 20 }}>No items found.</td></tr>
          ) : (
            c.items.map((item, index) => (
              <tr key={item._id || item.sku || index}>
                <td className="pack-td" style={{ textAlign: "center" }}>{index + 1}</td>
                <td className="pack-td">
                  <div className="inv-item-name">{item.name || "Product"}</div>
                  <div className="inv-item-desc">{item.description || "Item Description"}</div>
                </td>
                <td className="pack-td" style={{ textAlign: "center" }}>{item.quantity}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pack-box" style={{ marginTop: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <tbody>
            {[
              ["Order ID", c.orderNumber],
              ["Order Date", c.formattedDate],
              ["Shipping Method", order.shippingMethod || "Standard Delivery"],
              ["Payment Method", order.paymentMethod || "COD"],
            ].map(([label, value]) => (
              <tr key={label}>
                <td style={{ padding: "5px 0", color: "#555" }}>{label}</td>
                <td style={{ padding: "5px 0", fontWeight: 600 }}>: {value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pack-footer">
        <p>Thank you for shopping with SmoothSip!</p>
        <p>Stay Hydrated &nbsp;•&nbsp; Stay Healthy</p>
      </div>
    </div>
  );
};

const ShippingLabel = ({ order }) => {
  const c = buildCalc(order);
  const trackingUrl = `${getBaseUrl()}/track/${encodeURIComponent(c.trackingNumber)}`;

  const barcodeLines = Array.from({ length: 38 }, (_, index) => {
    const width = [1, 2, 3][index % 3];
    return <div key={index} style={{ width, height: 48, background: "#000", marginRight: 2, flexShrink: 0 }} />;
  });

  return (
    <div className="label-sheet">
      <div className="label-header">
        <h1 className="label-brand">SmoothSip</h1>
        <div style={{ textAlign: "right" }}>
          <p className="label-courier">Delhivery</p>
          <p className="label-tracking-text">Tracking No:</p>
          <p className="label-tracking-no">{c.trackingNumber}</p>
        </div>
      </div>

      <div className="barcode-wrap">
        <div className="barcode-bars">{barcodeLines}</div>
        <p className="barcode-num">{c.trackingNumber}</p>
      </div>

      <div className="label-ship-to">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="label-section-title">Ship To:</p>
          <p className="label-name">{c.customerName}</p>
          <p className="label-addr">{c.shippingAddress}</p>
          {c.phone && <p className="label-addr">Mobile: {c.phone}</p>}
        </div>
        <div style={{ marginLeft: 10, flexShrink: 0 }}>
          <QRCode value={trackingUrl} size={65} level="M" />
        </div>
      </div>

      <div className="label-details">
        <p className="label-section-title">Order Details:</p>
        <table className="label-table">
          <tbody>
            {[
              ["Order ID", c.orderNumber],
              ["Order Date", c.formattedDate],
              ["Weight", order.weight || "0.5 kg"],
              ["Dimensions", order.dimensions || "20 x 15 x 15 cm"],
            ].map(([label, value]) => (
              <tr key={label}>
                <td className="label-td-key">{label}</td>
                <td className="label-td-val">: {value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="label-from">
        <p className="label-section-title">From:</p>
        <p className="label-name">{BUSINESS.name}</p>
        <p className="label-addr">{BUSINESS.addressLine1}</p>
        <p className="label-addr">India</p>
      </div>

      <div className="label-cod">
        <span className="label-cod-text">
          {String(order.paymentMethod || "COD").toUpperCase() === "COD" ? "COD" : "PAID"}
        </span>
        <span className="label-cod-amt">₹ {formatAmount(c.total)}</span>
      </div>
    </div>
  );
};

const OrderPrintView = ({ order, type = "invoice", autoPrint = true }) => {
  useEffect(() => {
    if (!order || !autoPrint) return undefined;
    let cancelled = false;
    const firstFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) window.print();
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
    };
  }, [order, autoPrint]);

  if (!order) return <div className="centered">No order data available</div>;

  const handleClose = () => {
    window.close();
    window.setTimeout(() => {
      if (!window.closed) {
        if (window.history.length > 1) window.history.back();
        else window.location.href = "/admin/orders";
      }
    }, 150);
  };

  const renderDocument = () => {
    switch (type) {
      case "packing-slip":
        return <PackingSlip order={order} />;
      case "shipping-label":
        return <ShippingLabel order={order} />;
      case "all":
        return (
          <>
            <div className="print-document"><PackingSlip order={order} /></div>
            <div className="page-break" />
            <div className="print-document"><Invoice order={order} /></div>
            <div className="page-break" />
            <div className="print-document"><ShippingLabel order={order} /></div>
          </>
        );
      case "invoice":
      default:
        return <Invoice order={order} />;
    }
  };

  return (
    <div className={`page-wrapper ${type === "shipping-label" ? "label-mode" : ""}`}>
      {renderDocument()}
      <div className="no-print actions">
        <button type="button" onClick={() => window.print()} className="btn-print">
          Print / Save as PDF
        </button>
        <button type="button" onClick={handleClose} className="btn-close">
          Close
        </button>
      </div>
    </div>
  );
};

export default OrderPrintView;