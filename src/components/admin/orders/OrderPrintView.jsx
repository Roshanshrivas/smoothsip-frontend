// src/components/admin/orders/OrderPrintView.jsx
import React, { useEffect } from "react";
import QRCode from "react-qr-code";

// ─── Business Config ───
const BUSINESS = {
  name: "Tumbler Studio",
  tagline: "Premium Hydration Gear",
  addressLine1: "Sector 62",
  addressLine2: "Noida, Uttar Pradesh",
  pinCode: "201301",
  state: "Uttar Pradesh",
  stateCode: "09",
  phone: "+91 98765 43210",
  email: "support@tumblerstudio.com",
  website: "tumblerstudio.com",
  gstin: "09ABCDE1234F1Z5",
  pan: "ABCDE1234F",
  hsnCode: "96170010",
  gstRate: 18,
  bank: "HDFC Bank · A/C 50200012345678 · IFSC HDFC0001234",
};

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR",
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});
const formatCurrency = (n) => INR.format(Number(n) || 0);

const getBaseUrl = () =>
  typeof window === "undefined" ? `https://${BUSINESS.website}` : window.location.origin;

const getOrderNumber = (o) => o.orderNumber || o.id || o._id || "—";
const getCustomerName = (o) =>
  o.customer?.name || (typeof o.customer === "string" ? o.customer : null) ||
  o.shippingAddress?.name || o.billingAddress?.name || "Customer";

const buildAddressString = (addr) => {
  if (!addr) return "—";
  if (typeof addr === "string") return addr;
  return [addr.address, addr.city, addr.state, addr.pinCode, addr.country]
    .filter(Boolean).join(", ") || "—";
};

const isIntraState = (s) =>
  !s || s.trim().toLowerCase() === BUSINESS.state.toLowerCase();

const numberToWords = (num) => {
  const ONES=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const TENS=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const c=(n)=>{
    if(n<20)return ONES[n];
    if(n<100)return TENS[Math.floor(n/10)]+(n%10?" "+ONES[n%10]:"");
    if(n<1000)return ONES[Math.floor(n/100)]+" Hundred"+(n%100?" "+c(n%100):"");
    if(n<100000)return c(Math.floor(n/1000))+" Thousand"+(n%1000?" "+c(n%1000):"");
    if(n<10000000)return c(Math.floor(n/100000))+" Lakh"+(n%100000?" "+c(n%100000):"");
    return c(Math.floor(n/10000000))+" Crore"+(n%10000000?" "+c(n%10000000):"");
  };
  const r=Math.floor(num), p=Math.round((num-r)*100);
  let out=c(r)+" Rupees";
  if(p>0)out+=" and "+c(p)+" Paise";
  return out+" Only";
};

// Shared calculations — computed once per render
const buildCalc = (order) => {
  const items = order.items || [];
  const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0);
  const shipping = Number(order.shipping) || 0;
  const discount = Number(order.couponDiscount || order.discount) || 0;
  const total = Number(order.total) || (subtotal - discount + shipping);
  const intra = isIntraState(order.shippingAddress?.state);
  const goodsAmount = subtotal - discount;
  const taxableGoods = goodsAmount / (1 + BUSINESS.gstRate / 100);
  const totalGST = goodsAmount - taxableGoods;
  const cgst = intra ? totalGST / 2 : 0;
  const sgst = intra ? totalGST / 2 : 0;
  const igst = intra ? 0 : totalGST;
  const orderDate = new Date(order.createdAt || order.date || Date.now());
  return {
    items, subtotal, shipping, discount, total, intra, cgst, sgst, igst,
    totalGST,
    formattedDate: orderDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    invoiceNumber: `INV/${getOrderNumber(order)}`,
    orderNumber: getOrderNumber(order),
    customerName: getCustomerName(order),
    email: order.email || order.customer?.email || "",
    phone: order.phone || order.shippingAddress?.phone || "",
    billingAddress: buildAddressString(order.billingAddress || order.shippingAddress),
    shippingAddress: buildAddressString(order.shippingAddress),
    shipState: order.shippingAddress?.state || BUSINESS.state,
    trackingNumber: order.trackingNumber || `TUM-${getOrderNumber(order)}`,
    amountInWords: numberToWords(total),
  };
};

// ═══════════════════════════════════════════════
// 1. TAX INVOICE
// ═══════════════════════════════════════════════
const Invoice = ({ order }) => {
  const c = buildCalc(order);
  const cancelled = order.status === "Cancelled";

  return (
    <div style={{ ...styles.pageContent, position: "relative" }}>
      {cancelled && (
        <div style={styles.watermark}>CANCELLED</div>
      )}

      <div style={styles.invoiceHeader}>
        <div>
          <h1 style={styles.brandName}>✦ {BUSINESS.name.toUpperCase()}</h1>
          <p style={styles.brandTag}>{BUSINESS.tagline}</p>
          <p style={styles.detail}>
            {BUSINESS.addressLine1}, {BUSINESS.addressLine2} – {BUSINESS.pinCode}<br />
            <strong>GSTIN:</strong> {BUSINESS.gstin} &nbsp;|&nbsp; <strong>PAN:</strong> {BUSINESS.pan}<br />
            📞 {BUSINESS.phone} &nbsp;|&nbsp; ✉ {BUSINESS.email}
          </p>
        </div>
        <div style={styles.metaBox}>
          <span style={styles.metaLabel}>TAX INVOICE</span>
          <span style={styles.metaValue}>{c.invoiceNumber}</span>
          <span style={{ fontSize: 11, color: "#6b7280", display: "block", marginTop: 2 }}>
            {c.formattedDate}
          </span>
        </div>
      </div>

      <div style={styles.addressesGrid}>
        <div>
          <p style={styles.label}>Billed To</p>
          <p style={styles.value}>{c.customerName}</p>
          {c.email && <p style={styles.detail}>{c.email}</p>}
          {c.phone && <p style={styles.detail}>{c.phone}</p>}
          <p style={styles.detail}>{c.billingAddress}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={styles.label}>Invoice Details</p>
          <p style={styles.detail}><strong>Order No:</strong> #{c.orderNumber}</p>
          <p style={styles.detail}>
            <strong>Payment:</strong> {order.paymentMethod || "—"} ·{" "}
            <span style={{ fontWeight: "bold", color: order.paymentStatus === "Paid" ? "#16a34a" : "#dc2626" }}>
              {order.paymentStatus || "Unpaid"}
            </span>
          </p>
          <p style={styles.detail}>
            <strong>Status:</strong>{" "}
            <span style={{ fontWeight: "bold", color: cancelled ? "#dc2626" : "#ea580c" }}>{order.status}</span>
          </p>
          <p style={styles.detail}><strong>Place of Supply:</strong> {c.shipState} {c.intra ? "(Intra)" : "(Inter)"}</p>
        </div>
      </div>

      <table style={styles.itemTable}>
        <thead>
          <tr>
            <th style={{ ...styles.th, textAlign: "center", width: 36 }}>#</th>
            <th style={{ ...styles.th, textAlign: "left" }}>Description</th>
            <th style={{ ...styles.th, textAlign: "center", width: 70 }}>HSN</th>
            <th style={{ ...styles.th, textAlign: "center", width: 46 }}>Qty</th>
            <th style={{ ...styles.th, textAlign: "right", width: 90 }}>Rate</th>
            <th style={{ ...styles.th, textAlign: "right", width: 100 }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {c.items.map((item, idx) => (
            <tr key={idx}>
              <td style={{ ...styles.td, textAlign: "center" }}>{idx + 1}</td>
              <td style={{ ...styles.td, textAlign: "left" }}>
                {item.name}
                <div style={styles.skuText}>SKU: {item.sku || "N/A"}</div>
                {item.customization?.allTexts?.length > 0 && (
                  <div style={{ ...styles.skuText, color: "#ea580c" }}>
                    Personalization: {item.customization.allTexts.map((t) => `"${t.text}"`).join(", ")}
                  </div>
                )}
              </td>
              <td style={{ ...styles.td, textAlign: "center" }}>{item.hsnCode || BUSINESS.hsnCode}</td>
              <td style={{ ...styles.td, textAlign: "center" }}>{item.quantity}</td>
              <td style={{ ...styles.td, textAlign: "right" }}>{formatCurrency(item.price)}</td>
              <td style={{ ...styles.td, textAlign: "right", fontWeight: 600 }}>
                {formatCurrency(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, marginTop: 8 }}>
        <div>
          <p style={styles.label}>Amount in Words</p>
          <p style={{ fontSize: 12, fontStyle: "italic", marginTop: 4 }}>{c.amountInWords}</p>
          <div style={{ marginTop: 14, padding: "8px 10px", background: "#f9fafb", borderLeft: "3px solid #ea580c" }}>
            <p style={{ fontSize: 10, color: "#4b5563", margin: 0, lineHeight: 1.5 }}>
              <strong>Bank:</strong> {BUSINESS.bank}
            </p>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <tbody>
            <tr><td style={styles.summaryLabel}>Subtotal</td><td style={styles.summaryValue}>{formatCurrency(c.subtotal)}</td></tr>
            {c.discount > 0 && (
              <tr><td style={styles.summaryLabel}>Discount</td><td style={{ ...styles.summaryValue, color: "#16a34a" }}>− {formatCurrency(c.discount)}</td></tr>
            )}
            <tr><td style={styles.summaryLabel}>Shipping</td><td style={styles.summaryValue}>{formatCurrency(c.shipping)}</td></tr>
            {c.intra ? (
              <>
                <tr><td style={styles.summaryLabel}>CGST ({BUSINESS.gstRate / 2}%)</td><td style={styles.summaryValue}>{formatCurrency(c.cgst)}</td></tr>
                <tr><td style={styles.summaryLabel}>SGST ({BUSINESS.gstRate / 2}%)</td><td style={styles.summaryValue}>{formatCurrency(c.sgst)}</td></tr>
              </>
            ) : (
              <tr><td style={styles.summaryLabel}>IGST ({BUSINESS.gstRate}%)</td><td style={styles.summaryValue}>{formatCurrency(c.igst)}</td></tr>
            )}
            <tr>
              <td style={{ ...styles.summaryLabel, borderTop: "2px solid #1a1a1a", paddingTop: 10, fontWeight: 700, fontSize: 14 }}>GRAND TOTAL</td>
              <td style={{ ...styles.summaryValue, borderTop: "2px solid #1a1a1a", paddingTop: 10, fontSize: 18, color: "#ea580c", fontWeight: 800 }}>
                {formatCurrency(c.total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={styles.invoiceFooter}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ background: "white", padding: 8, borderRadius: 4, border: "1px solid #e5e7eb" }}>
            <QRCode value={`${getBaseUrl()}/track/order/${order.id}`} size={70} level="M" />
          </div>
          <div>
            <p style={{ fontSize: 11, color: "#4b5563", margin: 0 }}>Scan to track your order</p>
            <p style={{ fontSize: 13, fontWeight: "bold", margin: "4px 0 0 0" }}>Thank you for your business!</p>
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 10, color: "#9ca3af" }}>
          <p style={{ margin: 0 }}>Computer-generated invoice.</p>
          <p style={{ margin: 0 }}>No signature required.</p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// 2. PACKING SLIP (no prices — for warehouse)
// ═══════════════════════════════════════════════
const PackingSlip = ({ order }) => {
  const c = buildCalc(order);
  return (
    <div style={styles.pageContent}>
      <div style={{ borderBottom: "3px solid #ea580c", paddingBottom: 15, marginBottom: 20 }}>
        <h1 style={styles.brandName}>✦ {BUSINESS.name.toUpperCase()}</h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <span style={{ background: "#f3f4f6", padding: "4px 12px", borderRadius: 4, fontWeight: "bold", fontSize: 13 }}>
            PACKING SLIP
          </span>
          <span style={{ fontSize: 13 }}>Order #{c.orderNumber} · {c.formattedDate}</span>
        </div>
      </div>

      <div style={styles.addressesGrid}>
        <div>
          <p style={styles.label}>From (Warehouse)</p>
          <p style={styles.value}>{BUSINESS.name}</p>
          <p style={styles.detail}>{BUSINESS.addressLine1}, {BUSINESS.addressLine2} – {BUSINESS.pinCode}</p>
          <p style={styles.detail}>📞 {BUSINESS.phone}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={styles.label}>Ship To</p>
          <p style={styles.value}>{c.customerName}</p>
          <p style={styles.detail}>{c.shippingAddress}</p>
          {c.phone && <p style={styles.detail}>📞 {c.phone}</p>}
        </div>
      </div>

      <table style={styles.itemTable}>
        <thead>
          <tr>
            <th style={{ ...styles.th, textAlign: "left", width: 36 }}>#</th>
            <th style={{ ...styles.th, textAlign: "left" }}>Item</th>
            <th style={{ ...styles.th, textAlign: "left", width: 120 }}>SKU</th>
            <th style={{ ...styles.th, textAlign: "center", width: 90 }}>Qty to Pack</th>
          </tr>
        </thead>
        <tbody>
          {c.items.map((item, idx) => (
            <tr key={idx}>
              <td style={{ ...styles.td, textAlign: "left" }}>{idx + 1}</td>
              <td style={{ ...styles.td, textAlign: "left" }}>
                {item.name}
                {item.customization?.allTexts?.length > 0 && (
                  <div style={{ ...styles.skuText, color: "#ea580c", fontWeight: 600 }}>
                    ⚠️ Personalized: {item.customization.allTexts.map((t) => `"${t.text}"`).join(", ")}
                  </div>
                )}
              </td>
              <td style={{ ...styles.td, textAlign: "left" }}>{item.sku || "N/A"}</td>
              <td style={{ ...styles.td, textAlign: "center", fontWeight: "bold" }}>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 24, padding: 14, background: "#fef9f5", borderLeft: "4px solid #ea580c" }}>
        <p style={{ fontSize: 12, color: "#4b5563", margin: 0 }}>
          🔔 <strong>Packing Instructions:</strong> Verify every item and personalization before sealing.
          Total items: <strong>{c.items.reduce((s, i) => s + (i.quantity || 0), 0)}</strong>
        </p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// 3. SHIPPING LABEL
// ═══════════════════════════════════════════════
const ShippingLabel = ({ order }) => {
  const c = buildCalc(order);
  const trackingUrl = `${getBaseUrl()}/track/${c.trackingNumber}`;

  return (
    <div style={{ ...styles.pageContent, maxWidth: 540, border: "2px solid #1a1a1a" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #1a1a1a", paddingBottom: 10 }}>
        <span style={{ fontWeight: "bold", fontSize: 20 }}>✦ {BUSINESS.name.toUpperCase()}</span>
        <span style={{ fontSize: 10, textAlign: "right", fontWeight: 700, lineHeight: 1.2 }}>
          PRIORITY<br />SHIPPING
        </span>
      </div>

      <div style={{ marginTop: 16, paddingBottom: 12 }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: "#6b7280", letterSpacing: 1.5, marginBottom: 4 }}>SHIP TO</p>
        <p style={{ fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{c.customerName}</p>
        <p style={{ fontSize: 14, color: "#1a1a1a", margin: "6px 0 0 0", lineHeight: 1.4 }}>{c.shippingAddress}</p>
        {c.phone && <p style={{ fontSize: 15, fontWeight: 700, margin: "6px 0 0 0" }}>📞 {c.phone}</p>}
      </div>

      <div style={{ borderTop: "1px dashed #1a1a1a", borderBottom: "1px dashed #1a1a1a", padding: "10px 0", margin: "10px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 9, color: "#6b7280", margin: 0, fontWeight: 700, letterSpacing: 1 }}>TRACKING</p>
          <p style={{ fontSize: 14, fontFamily: "monospace", fontWeight: 700, margin: "2px 0 0 0" }}>{c.trackingNumber}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 9, color: "#6b7280", margin: 0, fontWeight: 700, letterSpacing: 1 }}>ORDER</p>
          <p style={{ fontSize: 13, fontWeight: 700, margin: "2px 0 0 0" }}>#{c.orderNumber}</p>
        </div>
      </div>

      <div style={{ fontSize: 10, color: "#4b5563", lineHeight: 1.5 }}>
        <strong>FROM:</strong> {BUSINESS.name} · {BUSINESS.addressLine1}, {BUSINESS.addressLine2} – {BUSINESS.pinCode}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <QRCode value={trackingUrl} size={64} level="M" />
        <div style={{ textAlign: "right", fontSize: 8, color: "#9ca3af" }}>
          <p style={{ margin: 0 }}>Scan to track</p>
          <p style={{ margin: "2px 0 0 0" }}>{new Date().toLocaleString("en-IN")}</p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// 4. COMBINED — all 3 in one PDF (A4, 3 pages)
// ═══════════════════════════════════════════════
const Combined = ({ order }) => (
  <>
    <div style={{ marginBottom: 30 }}>
      <PackingSlip order={order} />
    </div>
    <div className="page-break" />
    <div style={{ marginBottom: 30 }}>
      <Invoice order={order} />
    </div>
    <div className="page-break" />
    <div>
      <ShippingLabel order={order} />
      <p style={{ fontSize: 9, color: "#9ca3af", textAlign: "center", marginTop: 10, fontStyle: "italic" }}>
        ✂ Cut along the border and stick on box
      </p>
    </div>
  </>
);

// ═══════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════
const OrderPrintView = ({ order, type = "invoice" }) => {
  useEffect(() => {
    if (!order) return;
    let cancelled = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) window.print();
      });
    });
    return () => { cancelled = true; };
  }, [order]);

  // Only swap page size for the standalone label
  useEffect(() => {
    if (type !== "shipping-label") return;
    const el = document.createElement("style");
    el.id = "__ship_label_page__";
    el.textContent = "@page { size: 100mm 150mm; margin: 3mm; }";
    document.head.appendChild(el);
    return () => el.remove();
  }, [type]);

  if (!order) return <div style={styles.centered}>No order data available</div>;

  const render = () => {
    switch (type) {
      case "packing-slip":   return <PackingSlip order={order} />;
      case "shipping-label": return <ShippingLabel order={order} />;
      case "all":            return <Combined order={order} />;
      default:               return <Invoice order={order} />;
    }
  };

  const handleClose = () => {
    window.close();
    setTimeout(() => {
      if (!window.closed) {
        if (window.history.length > 1) window.history.back();
        else window.location.href = "/admin/orders";
      }
    }, 150);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: 20 }}>
      {render()}
      <div style={{ textAlign: "center", padding: 15, marginTop: 15 }} className="no-print">
        <button onClick={() => window.print()} style={styles.printBtn}>🖨️ Print / Save as PDF</button>
        <button onClick={handleClose} style={styles.closeBtn}>Close</button>
      </div>
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; break-after: page; }
          @page { margin: 10mm; size: A4; }
        }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════
const styles = {
  pageContent: {
    background: "#ffffff",
    padding: "32px 40px",
    maxWidth: 820,
    width: "100%",
    margin: "0 auto",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
    borderRadius: 12,
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    color: "#1a1a1a",
    boxSizing: "border-box",
  },
  centered: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" },
  brandName: { fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", margin: 0, color: "#1a1a1a" },
  brandTag: { fontSize: 11, color: "#6b7280", letterSpacing: 2, margin: "2px 0 8px 0", textTransform: "uppercase" },
  invoiceHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #ea580c", paddingBottom: 16, marginBottom: 20, gap: 20 },
  metaBox: { background: "#fff7ed", border: "1px solid #fed7aa", padding: "10px 16px", borderRadius: 8, textAlign: "right", minWidth: 180 },
  metaLabel: { fontSize: 10, color: "#9a3412", display: "block", letterSpacing: 1, fontWeight: 700 },
  metaValue: { fontSize: 15, fontWeight: 800, color: "#c2410c", display: "block", marginTop: 2 },
  addressesGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 },
  label: { fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  value: { fontSize: 15, fontWeight: 700, margin: "0 0 3px 0", color: "#111827" },
  detail: { fontSize: 12, color: "#4b5563", margin: "2px 0", lineHeight: 1.5 },
  itemTable: { width: "100%", borderCollapse: "collapse", marginBottom: 16 },
  th: { padding: "9px 6px", background: "#f9fafb", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#4b5563", borderBottom: "2px solid #e5e7eb", letterSpacing: 0.5 },
  td: { padding: "10px 6px", borderBottom: "1px solid #f3f4f6", fontSize: 12, color: "#1a1a1a", verticalAlign: "top" },
  skuText: { fontSize: 10, color: "#9ca3af", marginTop: 2 },
  summaryLabel: { padding: "5px 8px", color: "#4b5563" },
  summaryValue: { padding: "5px 8px", textAlign: "right", fontWeight: 600 },
  invoiceFooter: { marginTop: 24, paddingTop: 16, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 },
  printBtn: { padding: "10px 28px", background: "#ea580c", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13, marginRight: 8 },
  closeBtn: { padding: "10px 22px", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 },
  watermark: {
    position: "absolute", top: "40%", left: "50%",
    transform: "translate(-50%, -50%) rotate(-25deg)",
    fontSize: 80, fontWeight: 900, color: "rgba(220,38,38,0.08)",
    letterSpacing: 8, pointerEvents: "none", whiteSpace: "nowrap",
  },
};

export default OrderPrintView;