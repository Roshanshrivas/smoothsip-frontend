// src/components/admin/orders/OrderPrintView.jsx
import React, { useEffect } from "react";
import QRCode from "react-qr-code";

// ---------- Helper ----------
const formatCurrency = (amount) => {
  if (!amount) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getBaseUrl = () => {
  if (typeof window === "undefined") return "https://yourstore.com";
  return window.location.origin;
};

// ==============================================
// 1. PROFESSIONAL INVOICE
// ==============================================
const Invoice = ({ order }) => {
  const orderDate = new Date(order.createdAt || order.date);
  const formattedDate = orderDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const trackingUrl = `${getBaseUrl()}/track/order/${order.id}`;
  const shipAddr = order.shippingAddress || {};
  const addressString = shipAddr.address
    ? `${shipAddr.address}, ${shipAddr.city || ''}, ${shipAddr.state || ''} - ${shipAddr.pinCode || ''}`
    : order.address || '—';

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.pageContent}>
        <div style={styles.invoiceHeader}>
          <div>
            <h1 style={styles.brandName}>✦ TUMBLER STUDIO</h1>
            <p style={styles.brandTag}>Premium Hydration Gear</p>
          </div>
          <div style={styles.invoiceMeta}>
            <div style={styles.metaBox}>
              <span style={styles.metaLabel}>INVOICE</span>
              <span style={styles.metaValue}>#{order.id}</span>
            </div>
          </div>
        </div>

        <div style={styles.addressesGrid}>
          <div>
            <p style={styles.label}>Billed To</p>
            <p style={styles.value}>{order.customer}</p>
            <p style={styles.detail}>{order.email}</p>
            <p style={styles.detail}>{order.phone}</p>
            <p style={styles.detail}>{addressString}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={styles.label}>Invoice Details</p>
            <p style={styles.detail}>Date: {formattedDate}</p>
            <p style={styles.detail}>Status: <span style={{ fontWeight: "bold", color: order.status === "Delivered" ? "#16a34a" : "#ea580c" }}>{order.status}</span></p>
            <p style={styles.detail}>Payment: {order.paymentMethod}</p>
          </div>
        </div>

        <table style={styles.itemTable}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={{ ...styles.th, textAlign: "left" }}>Product Description</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Qty</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Unit Price</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx}>
                <td style={styles.td}>{idx + 1}</td>
                <td style={{ ...styles.td, textAlign: "left" }}>
                  {item.name}
                  <div style={styles.skuText}>{item.sku}</div>
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>{item.quantity}</td>
                <td style={{ ...styles.td, textAlign: "right" }}>{formatCurrency(item.price)}</td>
                <td style={{ ...styles.td, textAlign: "right" }}>{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" style={styles.td}></td>
              <td style={{ ...styles.td, textAlign: "right", fontWeight: "bold" }}>Subtotal</td>
              <td style={{ ...styles.td, textAlign: "right", fontWeight: "bold" }}>{formatCurrency(order.total)}</td>
            </tr>
            <tr>
              <td colSpan="3" style={styles.td}></td>
              <td style={{ ...styles.td, textAlign: "right", fontWeight: "bold" }}>Shipping</td>
              <td style={{ ...styles.td, textAlign: "right" }}>{formatCurrency(order.shipping || 0)}</td>
            </tr>
            <tr>
              <td colSpan="3" style={styles.td}></td>
              <td style={{ ...styles.td, textAlign: "right", fontWeight: "bold", borderTop: "2px solid #1a1a1a" }}>Grand Total</td>
              <td style={{ ...styles.td, textAlign: "right", fontWeight: "bold", fontSize: "20px", color: "#ea580c", borderTop: "2px solid #1a1a1a" }}>
                {formatCurrency(order.total)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div style={styles.invoiceFooter}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ background: "white", padding: "8px", borderRadius: "4px", border: "1px solid #e5e7eb" }}>
              <QRCode value={trackingUrl} size={80} style={{ width: "80px", height: "80px" }} level="H" />
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#4b5563", margin: 0 }}>Scan to track your order</p>
              <p style={{ fontSize: "14px", fontWeight: "bold", margin: "4px 0 0 0" }}>Thank you for your business!</p>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "11px", color: "#9ca3af" }}>
            <p>GST: 22ABCDE1234F1Z5</p>
            <p>This is a system generated invoice.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================================
// 2. PROFESSIONAL PACKING SLIP
// ==============================================
const PackingSlip = ({ order }) => {
  const shipAddr = order.shippingAddress || {};
  const addressString = shipAddr.address
    ? `${shipAddr.address}, ${shipAddr.city || ''}, ${shipAddr.state || ''} - ${shipAddr.pinCode || ''}`
    : order.address || '—';
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.pageContent}>
        <div style={{ borderBottom: "3px solid #ea580c", paddingBottom: "15px", marginBottom: "20px" }}>
          <h1 style={styles.brandName}>✦ TUMBLER STUDIO</h1>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ background: "#f3f4f6", padding: "4px 12px", borderRadius: "4px", fontWeight: "bold", fontSize: "14px" }}>
              PACKING SLIP
            </span>
            <span style={{ fontSize: "14px" }}>Order #{order.id}</span>
          </div>
        </div>

        <div style={styles.addressesGrid}>
          <div>
            <p style={styles.label}>Pick from (Warehouse)</p>
            <p style={styles.value}>Tumbler Studio Warehouse</p>
            <p style={styles.detail}>Sector 62, Noida, UP - 201301</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={styles.label}>Ship To</p>
            <p style={styles.value}>{order.customer}</p>
            <p style={styles.detail}>{addressString}</p>
            <p style={styles.detail}>{order.phone}</p>
          </div>
        </div>

        <table style={styles.itemTable}>
          <thead>
            <tr>
              <th style={styles.th}>Item</th>
              <th style={{ ...styles.th, textAlign: "center" }}>SKU</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Qty to Pack</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx}>
                <td style={{ ...styles.td, textAlign: "left" }}>{item.name}</td>
                <td style={{ ...styles.td, textAlign: "center" }}>{item.sku || "N/A"}</td>
                <td style={{ ...styles.td, textAlign: "center", fontWeight: "bold" }}>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "30px", padding: "15px", background: "#fef9f5", borderLeft: "4px solid #ea580c" }}>
          <p style={{ fontSize: "12px", color: "#4b5563", margin: 0 }}>🔔 Packing Instructions: Handle with care. Double-check all items before sealing.</p>
        </div>
      </div>
    </div>
  );
};

// ==============================================
// 3. PROFESSIONAL SHIPPING LABEL
// ==============================================
const ShippingLabel = ({ order }) => {
  const trackingNumber = order.trackingNumber || `TUM-${order.id}`;
  const trackingUrl = `${getBaseUrl()}/track/${trackingNumber}`;
  const shipAddr = order.shippingAddress || {};
  const addressString = shipAddr.address
    ? `${shipAddr.address}, ${shipAddr.city || ''}, ${shipAddr.state || ''} - ${shipAddr.pinCode || ''}`
    : order.address || '—';

  return (
    <div style={styles.pageWrapper}>
      <div style={{ ...styles.pageContent, maxWidth: "600px", border: "1px solid #d1d5db", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #ea580c", paddingBottom: "10px" }}>
          <div>
            <span style={{ fontWeight: "bold", fontSize: "18px" }}>✦ TUMBLER STUDIO</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "10px", color: "#6b7280", textAlign: "right" }}>
              PRIORITY <br /> SHIPPING
            </span>
            <div style={{ background: "white", padding: "4px", border: "1px solid #e5e7eb" }}>
              <QRCode value={trackingUrl} size={50} style={{ width: "50px", height: "50px" }} level="H" />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "20px", marginTop: "20px" }}>
          <div>
            <p style={styles.label}>SENDER</p>
            <p style={styles.value}>Tumbler Studio</p>
            <p style={styles.detail}>Sector 62, Noida</p>
            <p style={styles.detail}>UP - 201301, India</p>
          </div>
          <div style={{ borderLeft: "2px solid #e5e7eb", paddingLeft: "20px" }}>
            <p style={styles.label}>RECIPIENT</p>
            <p style={{ ...styles.value, fontSize: "18px" }}>{order.customer}</p>
            <p style={styles.detail}>{addressString}</p>
            <p style={styles.detail}>📞 {order.phone}</p>
          </div>
        </div>

        <div style={{ marginTop: "20px", padding: "10px", background: "#f9fafb", borderTop: "1px dashed #d1d5db", borderBottom: "1px dashed #d1d5db" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: "bold" }}>
              TRACKING: <span style={{ fontFamily: "monospace" }}>{trackingNumber}</span>
            </span>
            <span style={{ fontSize: "10px", color: "#6b7280" }}>WEIGHT: 0.5 kg</span>
          </div>
          <div style={{ width: "100%", height: "40px", background: "white", marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", letterSpacing: "4px", color: "#374151", border: "1px solid #e5e7eb" }}>
            ██ ██ ██ ██ ██ ██ ██ ██ ██ ██ (Barcode Sim)
          </div>
        </div>

        <div style={{ marginTop: "15px", textAlign: "center", fontSize: "10px", color: "#9ca3af" }}>
          Generated on {new Date().toLocaleString()} | Scan QR to track
        </div>
      </div>
    </div>
  );
};

// ==============================================
// MAIN EXPORT
// ==============================================
const OrderPrintView = ({ order, type = "invoice" }) => {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 600);
    return () => clearTimeout(timer);
  }, []);

  if (!order) return <div style={styles.centered}>No order data available</div>;

  const renderContent = () => {
    switch (type) {
      case "packing-slip": return <PackingSlip order={order} />;
      case "shipping-label": return <ShippingLabel order={order} />;
      default: return <Invoice order={order} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "20px" }}>
      {renderContent()}
      <div style={{ textAlign: "center", padding: "15px", marginTop: "15px" }}>
        <button onClick={() => window.print()} style={styles.printBtn}>
          🖨️ Print / Save as PDF
        </button>
      </div>
    </div>
  );
};

// ==============================================
// MASTER STYLES
// ==============================================
const styles = {
  pageWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  pageContent: {
    background: "#ffffff",
    padding: "40px 50px",
    maxWidth: "850px",
    width: "100%",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
    borderRadius: "12px",
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  brandName: {
    fontSize: "24px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    margin: 0,
    color: "#1a1a1a",
  },
  brandTag: {
    fontSize: "12px",
    color: "#6b7280",
    letterSpacing: "2px",
    margin: 0,
  },
  invoiceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "2px solid #ea580c",
    paddingBottom: "20px",
    marginBottom: "25px",
  },
  invoiceMeta: {
    display: "flex",
    alignItems: "center",
  },
  metaBox: {
    background: "#f3f4f6",
    padding: "8px 16px",
    borderRadius: "8px",
    textAlign: "right",
  },
  metaLabel: {
    fontSize: "10px",
    color: "#6b7280",
    display: "block",
  },
  metaValue: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  addressesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    marginBottom: "30px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "4px",
  },
  value: {
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 2px 0",
    color: "#111827",
  },
  detail: {
    fontSize: "14px",
    color: "#4b5563",
    margin: "2px 0",
  },
  itemTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  th: {
    padding: "12px 8px",
    background: "#f9fafb",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#4b5563",
    borderBottom: "2px solid #e5e7eb",
    textAlign: "right",
  },
  td: {
    padding: "12px 8px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "14px",
    color: "#1a1a1a",
    textAlign: "right",
  },
  skuText: {
    fontSize: "11px",
    color: "#9ca3af",
  },
  invoiceFooter: {
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  printBtn: {
    padding: "10px 30px",
    background: "#ea580c",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: "0 4px 6px -1px rgba(234, 88, 12, 0.4)",
  },
};

export default OrderPrintView;