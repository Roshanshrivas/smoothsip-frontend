import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  MapPin,
  CreditCard,
  IndianRupee,
  CheckCircle,
  ChevronLeft,
  ShoppingBag,
  Plus,
  Tag,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  selectCartItems,
  selectCartSubtotal,
  clearCart,
  removeFromCart,
} from "../store/slices/cartSlice";
import {
  selectAllAddresses,
  fetchAddresses,
  addAddress,
  selectAddressesLoading,
} from "../store/slices/addressSlice";
import { createOrder } from "../store/slices/ordersSlice";
import { orderService } from "../services/orderService";
import { selectIsAuthenticated } from "../store/slices/authSlice";
import {
  selectAppliedCoupon,
  validateCoupon,
  clearAppliedCoupon,
  selectCouponLoading,
} from "../store/slices/couponSlice";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const addresses = useSelector(selectAllAddresses);
  const addressesLoading = useSelector(selectAddressesLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // ─── COUPON CODE START ───
  const appliedCoupon = useSelector(selectAppliedCoupon);
  const couponLoading = useSelector(selectCouponLoading);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchAddresses());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr?._id || defaultAddr?.id);
    }
  }, [addresses, selectedAddressId]);

  const cleanInvalidCartItems = () => {
    const invalidItems = cartItems.filter((item) => !item.product);
    if (invalidItems.length > 0) {
      invalidItems.forEach((item) => {
        const itemId = item._id || item.id;
        if (itemId) dispatch(removeFromCart(itemId));
      });
      toast.error(
        "Some items were updated because they are no longer available.",
      );
      return false;
    }
    return true;
  };

  // ─── Calculations ──────────────────────────────────
  const shipping = subtotal > 499 ? 0 : 49;

  // Coupon discount
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = appliedCoupon.discountAmount || 0;
  }

  // Tax: 12% on discounted subtotal
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(discountedSubtotal * 0.12);

  // ✅ Final total = discountedSubtotal + tax + shipping
  const finalTotal = discountedSubtotal + tax + shipping;

  const selectedAddress = addresses.find(
    (a) => a._id === selectedAddressId || a.id === selectedAddressId,
  );


  // ─── COUPON CODE START ───
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    try {
      await dispatch(
        validateCoupon({ code: couponCode.trim(), subtotal }),
      ).unwrap();
      setCouponCode("");
    } catch (err) {
      setCouponError(err || "Invalid coupon");
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(clearAppliedCoupon());
  };

  // ─── COD Flow ────────────────────────────────────
  const handleCODOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }
    setIsPlacingOrder(true);
    try {
      const orderData = {
        shippingAddress: {
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pinCode: selectedAddress.pinCode,
          country: selectedAddress.country || "India",
        },
        paymentMethod: "COD",
        notes: "",
        couponId: appliedCoupon?.id,
      };

      const result = await dispatch(createOrder(orderData)).unwrap();
      if (result) {
        toast.success("Order placed successfully!");
        dispatch(clearCart());
        navigate(`/order-success/${result._id || result.id}`);
      }
    } catch (error) {
      toast.error(error || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // ─── Razorpay Online Flow ───
  const handleRazorpayPayment = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }
    setIsPlacingOrder(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Payment gateway failed to load.");
        setIsPlacingOrder(false);
        return;
      }

      const orderData = {
        shippingAddress: {
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pinCode: selectedAddress.pinCode,
          country: selectedAddress.country || "India",
        },
        paymentMethod: "Razorpay",
        notes: "",
        couponId: appliedCoupon?.id,
      };

      const order = await dispatch(createOrder(orderData)).unwrap();
      const targetOrderId = order?._id || order?.id;

      if (!targetOrderId) {
        toast.error("Order instantiation failed. Please try again.");
        setIsPlacingOrder(false);
        return;
      }

      // Fetch Razorpay credentials from server
      const responseData = await orderService.initiateRazorpayPayment({
        orderId: targetOrderId,
      });

      // FIX: Robust payload unpacking logic to secure order identifier key
      const { razorpayOrderId, amount, currency } =
        responseData.data || responseData;

      if (!razorpayOrderId) {
        toast.error("Payment gateway communication error. Missing order_id.");
        setIsPlacingOrder(false);
        return;
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
      if (!razorpayKey) {
        toast.error("Payment configuration missing. Please contact support.");
        setIsPlacingOrder(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: amount * 100,
        currency: currency || "INR",
        name: "SmoothSip",
        description: `Order #${order.orderNumber || "New Payment"}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyResponse = await orderService.verifyRazorpayPayment({
              orderId: targetOrderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              razorpayOrderId: response.razorpay_order_id,
            });
            if (verifyResponse.success) {
              toast.success("Payment successful!");
              dispatch(clearCart());
              navigate(`/order-success/${targetOrderId}`);
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (err) {
            toast.error("Verification connection failed.");
          } finally {
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: "Customer Profile",
          email: order.email || "customer@smoothsip.tech",
          contact: order.phone || "9999999999",
        },
        theme: { color: "#00C2D6" },
        modal: {
          ondismiss: function () {
            setIsPlacingOrder(false);
            toast.error("Payment cancelled");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      toast.error(error?.message || "Error executing secure checkout process.");
      setIsPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to place an order");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    if (!cleanInvalidCartItems()) return;
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (paymentMethod === "COD") {
      await handleCODOrder();
    } else {
      await handleRazorpayPayment();
    }
  };

  if (addressesLoading && addresses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={40} className="animate-spin text-orange-500" />
      </div>
    );
  }

  // ─── Empty Cart ───
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-md p-12">
            <ShoppingBag className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your cart is empty
            </h2>
            <Link to="/allproducts">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl mt-4 transition">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/cart"
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Back to Cart</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {/* Address Form Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin size={20} className="text-orange-500" /> Shipping
                  Address
                </h2>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="text-sm text-orange-500 font-medium flex items-center gap-1"
                >
                  <Plus size={16} /> Add New
                </button>
              </div>

              {addresses.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No addresses saved. Please add one to continue.
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const id = addr._id || addr.id;
                    return (
                      <label
                        key={id}
                        className={`block p-4 rounded-xl border-2 cursor-pointer transition ${selectedAddressId === id ? "border-orange-500 bg-orange-50/30" : "border-gray-200"}`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === id}
                          onChange={() => setSelectedAddressId(id)}
                          className="sr-only"
                        />
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-semibold text-gray-800">
                              {addr.label || "Address"}
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              {addr.address}, {addr.city}, {addr.state} -{" "}
                              {addr.pinCode}
                            </p>
                          </div>
                          {selectedAddressId === id && (
                            <CheckCircle
                              size={18}
                              className="text-orange-500"
                            />
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment Options */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <CreditCard size={20} className="text-orange-500" /> Payment
                Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    value: "COD",
                    label: "Cash on Delivery",
                    icon: IndianRupee,
                  },
                  {
                    value: "Razorpay",
                    label: "Online UPI / Cards",
                    icon: CreditCard,
                  },
                ].map((m) => (
                  <label
                    key={m.value}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === m.value ? "border-orange-500 bg-orange-50/30" : "border-gray-200"}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === m.value}
                      onChange={() => setPaymentMethod(m.value)}
                      className="sr-only"
                    />
                    <m.icon size={20} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">
                      {m.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Summary Area */}
          <div className="lg:w-96">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Order Summary
              </h2>
              <div className="space-y-4 max-h-60 overflow-y-auto mb-4">
                {cartItems.map((item) => {
                  const product = item.product || {};
                  return (
                    <div
                      key={item._id || item.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <img
                        src={
                          product.image ||
                          product.mainImage ||
                          "https://placehold.co/48x48"
                        }
                        alt=""
                        className="w-12 h-12 object-cover rounded-lg bg-gray-50"
                      />
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {product.title || product.name || "SmoothSip Item"}
                        </p>
                        <p className="text-gray-500">
                          ₹{product.price || 0} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-gray-800">
                        ₹{(product.price || 0) * (item.quantity || 1)}
                      </span>
                    </div>
                  );
                })}
              </div>

               {/* ─── UPDATED ORDER SUMMARY WITH TAX ─── */}
              <div className="space-y-3 border-t border-gray-200 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-[#14C6D8] font-bold">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                {/* ✅ Tax Line – always visible */}
                <div className="flex justify-between text-gray-600">
                  <span>Tax (12%)</span>
                  <span className="font-medium">₹{tax}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-3">
                  <span>Total</span>
                  <span className="text-orange-500">₹{finalTotal}</span>
                </div>
              </div>

              {/* ─── COUPON INPUT SECTION ────────────── */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-[#E6F9FA] dark:bg-[#14C6D8]/10 rounded-xl p-3 border border-[#14C6D8]/30">
                    <div>
                      <span className="text-xs font-bold text-[#14C6D8] uppercase">
                        {appliedCoupon.code}
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        -₹{appliedCoupon.discountAmount} off
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-gray-400 hover:text-red-500 transition p-1 rounded-full hover:bg-red-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#14C6D8] focus:border-transparent outline-none"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2 bg-[#14C6D8] hover:bg-[#0FB2C3] text-white font-semibold rounded-xl text-sm transition disabled:opacity-50 flex items-center gap-1"
                      >
                        {couponLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Tag size={16} />
                        )}
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-500">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !selectedAddressId}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl mt-6 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPlacingOrder ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Address Form Modal Component */}
      <AnimatePresence>
        {showAddressModal && (
          <AddressModal
            onClose={() => setShowAddressModal(false)}
            onAdd={(newAddress) => {
              dispatch(addAddress(newAddress));
              setShowAddressModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AddressModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    label: "Home",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Add New Address</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Street Address"
            className="w-full border p-2 rounded-lg text-sm"
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="City"
              className="border p-2 rounded-lg text-sm"
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="State"
              className="border p-2 rounded-lg text-sm"
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
            />
          </div>
          <input
            type="text"
            placeholder="Pin Code"
            className="w-full border p-2 rounded-lg text-sm"
            onChange={(e) =>
              setFormData({ ...formData, pinCode: e.target.value })
            }
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 border rounded-lg text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onAdd(formData)}
            className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
