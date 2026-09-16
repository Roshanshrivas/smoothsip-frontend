// src/pages/admin/OrderForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Plus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { orderService } from "../../../services/orderService";

const OrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    customer: "",
    email: "",
    phone: "",
    shippingAddress: {
      address: "",
      city: "",
      state: "",
      pinCode: "",
      country: "India",
    },
    items: [{ name: "", sku: "", quantity: 1, price: 0 }],
    paymentMethod: "Card",
    paymentStatus: "Paid",
    status: "Pending",
    fulfillmentStatus: "Pending",
  });

  useEffect(() => {
    if (isEditing) {
      const loadOrder = async () => {
        try {
          const order = await orderService.getOrder(id);
          setFormData({
            customer: order.customer || "",
            email: order.email || "",
            phone: order.phone || "",
            shippingAddress: order.shippingAddress || {
              address: "",
              city: "",
              state: "",
              pinCode: "",
              country: "India",
            },
            items: order.items || [{ name: "", sku: "", quantity: 1, price: 0 }],
            paymentMethod: order.paymentMethod || "Card",
            paymentStatus: order.paymentStatus || "Paid",
            status: order.status || "Pending",
            fulfillmentStatus: order.fulfillmentStatus || "Pending",
          });
        } catch (err) {
          toast.error("Failed to load order");
          navigate("/admin/orders");
        } finally {
          setLoading(false);
        }
      };
      loadOrder();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, [field]: value },
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", sku: "", quantity: 1, price: 0 }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      toast.error("At least one item is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0,
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!formData.items.some((item) => item.name.trim())) {
      toast.error("At least one valid item is required");
      return;
    }
    setIsSaving(true);
    try {
      const data = { ...formData, total: calculateTotal() };
      if (isEditing) {
        await orderService.updateOrder(id, data);
        toast.success("Order updated");
      } else {
        await orderService.createAdminOrder(data);
        toast.success("Order created");
      }
      navigate("/admin/orders");
    } catch (err) {
      toast.error("Failed to save order");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/admin/orders" className="hover:text-orange-600 flex items-center gap-1">
          <ArrowLeft size={16} /> Orders
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">
          {isEditing ? "Edit Order" : "Create Order"}
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <Package size={20} className="text-orange-500" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {isEditing ? "Edit Order" : "Create New Order"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Shipping Address Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Shipping Address
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  placeholder="Address line"
                  value={formData.shippingAddress.address}
                  onChange={(e) => handleAddressChange("address", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <input
                  placeholder="City"
                  value={formData.shippingAddress.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <input
                  placeholder="State"
                  value={formData.shippingAddress.state}
                  onChange={(e) => handleAddressChange("state", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <input
                  placeholder="Pin Code"
                  value={formData.shippingAddress.pinCode}
                  onChange={(e) => handleAddressChange("pinCode", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <input
                  placeholder="Country"
                  value={formData.shippingAddress.country}
                  onChange={(e) => handleAddressChange("country", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="COD">Cash on Delivery</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Status
              </label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Order Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Order Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">SKU</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-center">Price</th>
                    <th className="px-4 py-2 text-center">Total</th>
                    <th className="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {formData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          placeholder="Item name"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.sku}
                          onChange={(e) => handleItemChange(idx, "sku", e.target.value)}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          placeholder="SKU"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, "quantity", parseInt(e.target.value) || 1)
                          }
                          className="w-16 mx-auto border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm text-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(idx, "price", parseFloat(e.target.value) || 0)
                          }
                          className="w-24 mx-auto border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm text-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-2 text-center font-semibold">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-red-400 hover:text-red-600 transition p-1"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-800/30">
                  <tr>
                    <td colSpan="4" className="px-4 py-2 text-right font-semibold">
                      Total:
                    </td>
                    <td className="px-4 py-2 text-center font-bold text-orange-600">
                      ₹{calculateTotal().toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Link
              to="/admin/orders"
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg shadow-sm transition flex items-center gap-2"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : isEditing ? "Update Order" : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;