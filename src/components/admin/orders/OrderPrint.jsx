// src/pages/admin/OrderPrint.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import OrderPrintView from "../../../components/admin/orders/OrderPrintView";
import { orderService } from "../../../services/orderService";

const OrderPrint = () => {
  const { id, type = "invoice" } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const data = await orderService.getOrder(id);
        if (cancelled) return;
        if (!data) throw new Error("Order not found");
        setOrder(data);
      } catch (err) {
        if (cancelled) return;
        setError(err?.response?.data?.message || err?.message || "Could not load order data.");
        toast.error("Failed to load order for printing");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div style={styles.centered}>
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p style={{ marginTop: "1rem", color: "#6b7280" }}>Loading order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={styles.centered}>
        <p style={{ color: "#dc2626", fontWeight: "bold" }}>{error || "Order not found"}</p>
        <button
          onClick={() => window.close()}
          style={{ marginTop: 16, padding: "8px 24px", background: "#f97316", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
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