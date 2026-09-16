// src/pages/admin/OrderPrint.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import OrderPrintView from "../../../components/admin/orders/OrderPrintView";

const OrderPrint = () => {
  const { id, type = "invoice" } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        // ✅ Use mock data for now – replace with real API later
        const mockOrder = {
          id,
          customer: "John Doe",
          email: "john@example.com",
          phone: "+91 98765 43210",
          address: "123 Main St, Kolkata, West Bengal - 700001",
          shippingAddress: "123 Main St, Kolkata, West Bengal - 700001",
          items: [
            { name: "Premium Tumbler – Matte Black", sku: "TUM-001", quantity: 2, price: 799 },
            { name: "Stainless Steel Straw Set", sku: "STR-002", quantity: 1, price: 199 },
          ],
          total: 1797,
          subtotal: 1598,
          shipping: 199,
          status: "Processing",
          paymentMethod: "Credit Card",
          paymentStatus: "Paid",
          createdAt: new Date().toISOString(),
          trackingNumber: "TUM-TRK-123456",
          companyName: "Tumbler Studio",
          companyAddress: "Sector 62, Noida, UP - 201301",
          companyPhone: "+91 98765 43210",
          companyEmail: "support@tumblerstudio.com",
          gst: "22ABCDE1234F1Z5",
        };
        setOrder(mockOrder);
      } catch (err) {
        console.error("Failed to load order:", err);
        setError("Could not load order data. Please try again.");
        toast.error("Failed to load order for printing");
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.centered}>
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p style={{ marginTop: "1rem", color: "#6b7280" }}>Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={styles.centered}>
        <p style={{ color: "#dc2626", fontWeight: "bold" }}>{error || "Order not found"}</p>
        <button
          onClick={() => window.close()}
          style={{
            marginTop: "1rem",
            padding: "8px 24px",
            background: "#f97316",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Close Window
        </button>
      </div>
    );
  }

  return <OrderPrintView order={order} type={type} />;
};

const styles = {
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  },
};

export default OrderPrint;