// src/components/admin/orders/OrderTable.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Printer,
  MoreVertical,
  Package,
  Edit,
  Copy,
  Trash2,
  Send,
  Ban,
  AlertCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const rowVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 15 } },
};

const statusOptions = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const statusColors = {
  Pending: "bg-orange-50 text-orange-600 border-orange-200",
  Processing: "bg-blue-50 text-blue-600 border-blue-200",
  Shipped: "bg-purple-50 text-purple-600 border-purple-200",
  Delivered: "bg-green-50 text-green-600 border-green-200",
  Cancelled: "bg-red-50 text-red-600 border-red-200",
};

const paymentColors = {
  Paid: "text-green-600",
  Unpaid: "text-red-600",
  Refunded: "text-gray-500",
};

const fulfillmentColors = {
  Delivered: "text-green-600",
  Processing: "text-blue-600",
  Shipped: "text-purple-600",
  Pending: "text-orange-600",
  Cancelled: "text-red-500",
};

// ---------- Helper: Get first product ----------
const getFirstProduct = (order) => {
  const items = order.items || [];
  const firstItem = items[0];
  const productName = firstItem?.name || "Product";
  const productImage = firstItem?.image || null; // ✅ use item.image
  return { name: productName, image: productImage };
};

// ---------- Cancellation Eligibility ----------
const canCancelOrder = (status) => {
  return status === "Pending" || status === "Processing";
};

// ==============================================
//  CANCELLATION CONFIRMATION MODAL
// ==============================================
const CancelConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  order,
  isProcessing,
}) => {
  const [reason, setReason] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-red-50 dark:bg-red-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Cancel Order</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">#{order?.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            disabled={isProcessing}
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>⚠️ This action cannot be undone.</strong> The order will be cancelled and:
            </p>
            <ul className="text-sm text-amber-700 dark:text-amber-400 mt-2 space-y-1 list-disc list-inside">
              <li>Inventory will be restored</li>
              <li>{order?.paymentStatus === "Paid" ? "Refund will be processed" : "No payment will be charged"}</li>
              <li>Customer will be notified</li>
            </ul>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cancellation Reason <span className="text-gray-400">(optional)</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="">Select a reason...</option>
              <option value="Customer requested cancellation">Customer requested cancellation</option>
              <option value="Out of stock">Out of stock</option>
              <option value="Payment issue">Payment issue</option>
              <option value="Shipping delay">Shipping delay</option>
              <option value="Fraud suspicion">Fraud suspicion</option>
              <option value="Other">Other</option>
            </select>
            {reason === "Other" && (
              <input
                type="text"
                placeholder="Please specify..."
                className="w-full mt-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            )}
          </div>

          {/* Notify customer */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notifyCustomer"
              checked={notifyCustomer}
              onChange={(e) => setNotifyCustomer(e.target.checked)}
              className="rounded border-gray-300 text-red-500 focus:ring-red-500"
            />
            <label htmlFor="notifyCustomer" className="text-sm text-gray-600 dark:text-gray-400">
              Send cancellation notification to customer
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
          >
            Keep Order
          </button>
          <button
            onClick={() => onConfirm({ reason, notifyCustomer })}
            disabled={isProcessing}
            className={`
              px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-sm transition flex items-center gap-2
              ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Ban size={16} /> Confirm Cancellation
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==============================================
// MAIN COMPONENT
// ==============================================
const OrderTable = ({
  orders = [],
  isLoading = false,
  onViewDetails = () => {},
  onUpdateStatus = () => {},
  onEditOrder = () => {},
  onDuplicateOrder = () => {},
  onDeleteOrder = () => {},
  onSendEmail = () => {},
  onCancelOrder = () => {},
  onPrintInvoice,
  selectedOrders = [],
  onSelectOrder = () => {},
  onSelectAll = () => {},
}) => {
  const [updatingId, setUpdatingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // ---------- Cancellation Modal State ----------
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    order: null,
    isProcessing: false,
  });

  const allSelected = orders.length > 0 && selectedOrders.length === orders.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------- Status change ----------
  const handleStatusChange = useCallback(
    async (id, newStatus) => {
      try {
        setUpdatingId(id);
        await onUpdateStatus(id, newStatus);
      } finally {
        setUpdatingId(null);
      }
    },
    [onUpdateStatus]
  );

  // ---------- Print handler ----------
  const handlePrint = useCallback((orderId, type = "invoice") => {
    const url = `/admin/orders/${orderId}/print/${type}`;
    const printWindow = window.open(url, "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("Please allow popups to print the invoice.");
    }
  }, []);

  // ---------- Open Cancel Modal ----------
  const openCancelModal = useCallback((order) => {
    if (!canCancelOrder(order.status)) {
      toast.error(`Cannot cancel order in "${order.status}" status.`);
      return;
    }
    setCancelModal({ isOpen: true, order, isProcessing: false });
  }, []);

  // ---------- Confirm Cancellation ----------
  const handleConfirmCancel = useCallback(
    async ({ reason, notifyCustomer }) => {
      const order = cancelModal.order;
      if (!order) return;

      setCancelModal((prev) => ({ ...prev, isProcessing: true }));

      try {
        // 1. Update status
        await onCancelOrder(order.id);

        // 2. Log cancellation reason (you can send this to your backend)
        console.log(`Order ${order.id} cancelled. Reason: ${reason || "Not specified"}`);
        console.log(`Customer notified: ${notifyCustomer}`);

        // 3. Show success message
        toast.success(`Order #${order.id} cancelled successfully`);

        // 4. Close modal
        setCancelModal({ isOpen: false, order: null, isProcessing: false });
        setOpenMenuId(null);
      } catch (error) {
        toast.error("Failed to cancel order. Please try again.");
        setCancelModal((prev) => ({ ...prev, isProcessing: false }));
      }
    },
    [cancelModal.order, onCancelOrder]
  );

  // ---------- Close Cancel Modal ----------
  const closeCancelModal = useCallback(() => {
    if (!cancelModal.isProcessing) {
      setCancelModal({ isOpen: false, order: null, isProcessing: false });
    }
  }, [cancelModal.isProcessing]);

  // ---------- Dropdown actions ----------
  const handleMenuAction = useCallback(
    (action, order) => {
      setOpenMenuId(null);
      switch (action) {
        case "edit":
          onEditOrder(order.id);
          break;
        case "duplicate":
          onDuplicateOrder(order.id);
          break;
        case "delete":
          if (window.confirm(`Delete order ${order.id}? This action cannot be undone.`)) {
            onDeleteOrder(order.id);
          }
          break;
        case "email":
          onSendEmail(order.id);
          break;
        case "cancel":
          openCancelModal(order);
          break;
        case "print-packing":
          handlePrint(order.id, "packing-slip");
          break;
        case "print-shipping":
          handlePrint(order.id, "shipping-label");
          break;
        default:
          break;
      }
    },
    [
      onEditOrder,
      onDuplicateOrder,
      onDeleteOrder,
      onSendEmail,
      openCancelModal,
      handlePrint,
    ]
  );

  // ----- Loading / Empty states -----
  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-gray-500">Loading orders...</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="p-12 text-center text-gray-500">
        <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <p>No orders found</p>
        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  // ----- Table -----
  return (
    <>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[900px] table-auto">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Order ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Payment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Fulfillment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Product</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 w-16">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => {
              const { name: productName, image: productImage } = getFirstProduct(order);
              const isCancellable = canCancelOrder(order.status);
              const isAlreadyCancelled = order.status === "Cancelled";

              return (
                <motion.tr
                  key={order.id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => onViewDetails(order.id)}
                  className="hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  {/* Checkbox */}
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => onSelectOrder(order.id)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-medium text-orange-600 hover:underline">
                      #{order.orderNumber || order.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{order.customer}</div>
                    <div className="text-xs text-gray-500">{order.email}</div>
                    <div className="text-xs text-gray-400">{order.phone || "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{order.date}</div>
                    <div className="text-xs text-gray-400">{order.time || "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">₹{order.total?.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">{order.paymentMethod}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700">{order.paymentMethod}</div>
                    <div className={`text-xs font-medium ${paymentColors[order.paymentStatus] || "text-gray-500"}`}>
                      {order.paymentStatus}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`text-sm font-medium ${fulfillmentColors[order.fulfillmentStatus] || "text-gray-500"}`}>
                      {order.fulfillmentStatus}
                    </div>
                    <div className="text-xs text-gray-400">
                      {order.fulfillmentDate || order.shippedDate || order.deliveredDate || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id || isAlreadyCancelled}
                      onChange={(e) => {e.stopPropagation();
                        handleStatusChange(order.id, e.target.value);
                      }}
        
                      className={`
                        px-2 py-1 pr-6 rounded-md border text-xs font-medium cursor-pointer outline-none bg-white
                        ${statusColors[order.status] || "bg-gray-50 text-gray-600 border-gray-200"}
                        ${updatingId === order.id ? "opacity-50 cursor-wait" : ""}
                        ${isAlreadyCancelled ? "opacity-60 cursor-not-allowed" : ""}
                      `}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {isAlreadyCancelled && (
                      <div className="text-[10px] text-red-500 font-medium mt-0.5">Cancelled</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML =
                                '<svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M9 9h6v6H9z"/><line x1="9" y1="15" x2="15" y2="9"/></svg>';
                            }}
                          />
                        ) : (
                          <Package size={14} className="text-gray-400" />
                        )}
                      </div>
                      <span className="text-xs text-gray-700 truncate max-w-[120px]" title={productName}>
                        {productName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      {/* Print button */}
                      <button
                        onClick={() => {
                          if (onPrintInvoice) {
                            onPrintInvoice(order.id);
                          } else {
                            handlePrint(order.id, "invoice");
                          }
                        }}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                        title="Print invoice"
                      >
                        <Printer size={15} />
                      </button>
                      {/* Dropdown */}
                      <div className="relative" ref={menuRef}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                          title="More actions"
                        >
                          <MoreVertical size={15} />
                        </button>
                        <AnimatePresence>
                          {openMenuId === order.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-20 overflow-hidden"
                            >
                              <button
                                onClick={() => handleMenuAction("edit", order)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Edit size={14} /> Edit Order
                              </button>
                              <button
                                onClick={() => handleMenuAction("duplicate", order)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Copy size={14} /> Duplicate
                              </button>
                              <button
                                onClick={() => handleMenuAction("email", order)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Send size={14} /> Email Invoice
                              </button>
                              <button
                                onClick={() => handleMenuAction("print-packing", order)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Printer size={14} /> Packing Slip
                              </button>
                              <button
                                onClick={() => handleMenuAction("print-shipping", order)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Printer size={14} /> Shipping Label
                              </button>

                              {/* ===== CANCEL BUTTON – Only if cancellable ===== */}
                              {isCancellable && (
                                <button
                                  onClick={() => handleMenuAction("cancel", order)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1 pt-1"
                                >
                                  <Ban size={14} /> Cancel Order
                                </button>
                              )}

                              {/* ===== SHOW "CANCELLED" STATUS if already cancelled ===== */}
                              {isAlreadyCancelled && (
                                <div className="w-full px-3 py-2 text-sm text-gray-400 flex items-center gap-2 border-t border-gray-100 mt-1 pt-1">
                                  <Ban size={14} /> Cancelled
                                </div>
                              )}

                              <hr className="my-1" />
                              <button
                                onClick={() => handleMenuAction("delete", order)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ===== CANCELLATION MODAL ===== */}
      <CancelConfirmModal
        isOpen={cancelModal.isOpen}
        onClose={closeCancelModal}
        onConfirm={handleConfirmCancel}
        order={cancelModal.order}
        isProcessing={cancelModal.isProcessing}
      />
    </>
  );
};

export default OrderTable;