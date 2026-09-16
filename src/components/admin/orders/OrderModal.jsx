// src/components/admin/orders/OrderModal.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import OrderStatusBadge from "./OrderStatusBadge";
import toast from "react-hot-toast";

const PaymentStatusBadge = ({ status }) => {
  const config = {
    Paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Unpaid: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Refunded: "bg-gray-100 text-gray-700 dark:bg-gray-800",
  };
  const className = config[status] || config.Unpaid;
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{status}</span>;
};

const OrderModal = ({ isOpen, onClose, orderId, orderService }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      setLoading(true);
      // ✅ Use admin getOrder
      orderService.getOrder(orderId)
        .then(data => {
          setOrder(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setOrder(null);
    }
  }, [isOpen, orderId, orderService]);

  const handleMarkPaid = async () => {
    setMarkingPaid(true);
    await orderService.markPaymentAsPaid(orderId);
    const updated = await orderService.getOrder(orderId);
    setOrder(updated);
    setMarkingPaid(false);
  };

  if (!isOpen) return null;

  const shipAddr = order?.shippingAddress || {};
  const addressString = shipAddr.address
    ? `${shipAddr.address}, ${shipAddr.city || ''}, ${shipAddr.state || ''} - ${shipAddr.pinCode || ''}`
    : order?.address || '—';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Order Details</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            {loading ? (
              <div className="p-8 text-center">Loading order details...</div>
            ) : !order ? (
              <div className="p-8 text-center text-red-500">Order not found</div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div><p className="text-sm text-gray-500">Order ID</p><p className="font-semibold">{order.id}</p></div>
                  <div><p className="text-sm text-gray-500">Date</p><p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p></div>
                  <div><p className="text-sm text-gray-500">Customer</p><p className="font-semibold">{order.customer}</p></div>
                  <div><p className="text-sm text-gray-500">Payment Method</p><p className="font-semibold">{order.paymentMethod}</p></div>
                  <div><p className="text-sm text-gray-500">Payment Status</p><PaymentStatusBadge status={order.paymentStatus} /></div>
                  <div><p className="text-sm text-gray-500">Order Status</p><OrderStatusBadge status={order.status} /></div>
                  <div><p className="text-sm text-gray-500">Tracking Number</p><p className="font-semibold">{order.trackingNumber || "—"}</p></div>
                  <div><p className="text-sm text-gray-500">Total</p><p className="font-bold text-orange-600">₹{order.total?.toLocaleString()}</p></div>
                </div>

                {order.paymentMethod === "COD" && order.paymentStatus === "Unpaid" && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleMarkPaid}
                      disabled={markingPaid}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {markingPaid ? "Processing..." : "Mark as Paid (COD)"}
                    </button>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Items</h3>
                  <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr><th className="px-4 py-2 text-left text-sm">Product</th><th className="px-4 py-2 text-center text-sm">Qty</th><th className="px-4 py-2 text-right text-sm">Price</th></tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="px-4 py-2 text-sm">{item.name}</td>
                          <td className="px-4 py-2 text-center text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 text-right text-sm">₹{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Shipping Address</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{addressString}</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderModal;