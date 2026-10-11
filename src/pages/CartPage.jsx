import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiHeart,
  FiCheckCircle,
  FiLock,
  FiTruck,
  FiRotateCcw,
  FiShield,
  FiCheck,
  FiInfo,
  FiMapPin,
  FiEdit2,
} from "react-icons/fi";
import { Snowflake, Droplets, Leaf, Shield, Tag, CheckCircle as LucideCheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  selectCartItems,
  selectCartTotalItems,
  selectCartSubtotal,
  selectCartShipping,
  selectCartLoading,
} from "../store/slices/cartSlice";
import {
  fetchAddresses,
  addAddress,
  selectAllAddresses,
  selectAddressesLoading,
} from "../store/slices/addressSlice";
import { selectIsAuthenticated } from "../store/slices/authSlice";
import {
  selectAppliedCoupon,
  validateCoupon,
  clearAppliedCoupon,
  selectCouponLoading,
  fetchAvailableCoupons,
} from '../store/slices/couponSlice';
import AvailableCoupons from "../components/AvailableCoupons";

const BRAND_CYAN = "#00C2D6";
const FREE_SHIPPING_THRESHOLD = 499;

// ─── Responsive Step Progress ──────────────────────
const StepProgress = ({ isAddressSelected, onAddressClick }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-4 sm:px-10 py-4 sm:py-6 shadow-sm">
      <div className="relative">
        {/* Track line — spans between the 1st and 3rd circle centers */}
        <div
          className="absolute h-[2px] bg-gray-100 rounded-full -z-0"
          style={{ top: "14px", left: "16.66%", right: "16.66%" }}
        />
        {/* Filled progress — reaches 2nd circle when address is selected */}
        <div
          className="absolute h-[2px] bg-[#00C2D6] rounded-full transition-all duration-500 -z-0"
          style={{
            top: "14px",
            left: "16.66%",
            width: isAddressSelected ? "33.34%" : "0%",
          }}
        />

        <div className="flex items-start justify-between relative z-10">
          {/* ─── Step 1: Address ─── */}
          <div
            className="flex flex-col items-center flex-1 gap-1.5 min-w-0 px-1"
            onClick={onAddressClick}
            style={{ cursor: onAddressClick ? "pointer" : "default" }}
          >
            <div
              className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center text-[10px] sm:text-xs font-bold bg-white transition-all shrink-0 ${
                isAddressSelected
                  ? "border-[#00C2D6] text-[#00C2D6]"
                  : "border-gray-200 text-gray-400"
              }`}
            >
              {isAddressSelected ? (
                <FiCheck size={12} strokeWidth={3} />
              ) : (
                "1"
              )}
            </div>
            <span
              className={`text-[10px] sm:text-xs font-semibold text-center leading-tight whitespace-nowrap ${
                isAddressSelected ? "text-gray-900" : "text-gray-400"
              }`}
            >
              Address
            </span>
            <span className="hidden sm:block text-[10px] text-gray-400 font-medium whitespace-nowrap">
              {isAddressSelected ? "✓ Verified" : "Delivery"}
            </span>
          </div>

          {/* ─── Step 2: Order Summary (current) ─── */}
          <div className="flex flex-col items-center flex-1 gap-1.5 min-w-0 px-1">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#00C2D6] text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-sm shrink-0">
              2
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-900 text-center leading-tight">
              Order
              <span className="hidden sm:inline"> Summary</span>
            </span>
            <span className="hidden sm:block text-[10px] text-gray-400 font-medium whitespace-nowrap">
              Review items
            </span>
          </div>

          {/* ─── Step 3: Payment ─── */}
          <div className="flex flex-col items-center flex-1 gap-1.5 min-w-0 px-1">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-gray-200 bg-white text-gray-400 flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">
              3
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 text-center leading-tight whitespace-nowrap">
              Payment
            </span>
            <span className="hidden sm:block text-[10px] text-gray-400 font-medium whitespace-nowrap">
              Secure
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ─── Redux State ──────────────────────────
  const cartItems = useSelector(selectCartItems);
  const totalItems = useSelector(selectCartTotalItems);
  const subtotal = useSelector(selectCartSubtotal);
  const shipping = useSelector(selectCartShipping);
  const isLoading = useSelector(selectCartLoading);
  const addresses = useSelector(selectAllAddresses);
  const addressesLoading = useSelector(selectAddressesLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // ─── Coupon State ─────────────────────────
  const appliedCoupon = useSelector(selectAppliedCoupon);
  const couponLoading = useSelector(selectCouponLoading);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  // ─── Local UI State ──────────────────────
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
    isDefault: false,
  });

  // ─── Coupon Handlers ──────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError("");
    try {
      await dispatch(
        validateCoupon({ code: couponCode.trim(), subtotal: rawSubtotal }),
      ).unwrap();
      setCouponCode("");
    } catch (err) {
      setCouponError(err || "Invalid coupon");
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(clearAppliedCoupon());
  };

  // ─── Load Data ────────────────────────────
  useEffect(() => {
    dispatch(fetchCart());
    if (isAuthenticated) {
      dispatch(fetchAddresses());
    }
  }, [dispatch, isAuthenticated]);

  // Fetch available coupons whenever cart subtotal changes
  useEffect(() => {
    if (subtotal > 0) {
      dispatch(fetchAvailableCoupons(subtotal));
    }
  }, [subtotal, dispatch]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr?._id || defaultAddr?.id);
    }
  }, [addresses]);

  // ─── Cart Operations ──────────────────────
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    if (!itemId) return;
    dispatch(updateCartItem({ itemId, quantity: newQuantity }));
  };

  const removeItem = (itemId) => {
    if (!itemId) {
      toast.error("Invalid item");
      return;
    }
    dispatch(removeFromCart(itemId));
    toast.success("Item removed from cart");
  };

  const moveToWishlist = (item) => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const productId = item.product?._id || item.productId || item._id;

    if (!wishlist.some((w) => w.id === productId)) {
      wishlist.push({
        id: productId,
        title: item.product?.name || item.title,
        price: item.product?.price || item.price,
        image:
          item.product?.mainImage ||
          (item.product?.images && item.product?.images[0]) ||
          item.image,
        discount: item.product?.discount || item.discount,
      });
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      window.dispatchEvent(new Event("wishlistUpdated"));
    }
    removeItem(item._id);
    toast.success("Moved to Wishlist!");
  };

  // ─── Address Management ──────────────────
  const handleSaveAddress = (e) => {
    e.preventDefault();
    const required = [
      "fullName",
      "phoneNumber",
      "address",
      "city",
      "state",
      "pinCode",
    ];
    for (const field of required) {
      if (!newAddress[field]?.trim()) {
        toast.error(
          `Please enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`,
        );
        return;
      }
    }
    if (newAddress.phoneNumber.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (newAddress.pinCode.replace(/\D/g, "").length !== 6) {
      toast.error("Enter a 6-digit pin code");
      return;
    }

    dispatch(addAddress(newAddress))
      .unwrap()
      .then((newAddr) => {
        setSelectedAddressId(newAddr._id || newAddr.id);
        setIsAddingAddress(false);
        toast.success("Address saved!");
        setNewAddress({
          label: "Home",
          fullName: "",
          phoneNumber: "",
          address: "",
          city: "",
          state: "",
          pinCode: "",
          country: "India",
          isDefault: false,
        });
      })
      .catch(() => {
        toast.error("Failed to save address");
      });
  };

  // ─── Calculations ──────────────────────────
  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const rawSubtotal = cartItems.reduce((sum, item) => {
    const isCustom = item.customization?.isCustom;
    const price = isCustom
      ? item.customization?.price || 0
      : item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  // 🧾 No default discount – only coupon discount if applied
  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    couponDiscountAmount = appliedCoupon.discountAmount || 0;
  }

  // 🧮 Tax: 12% on discounted subtotal
  const discountedSubtotal = Math.max(0, rawSubtotal - couponDiscountAmount);
  const tax = Math.round(discountedSubtotal * 0.12);
  // Shipping: free above ₹499 (based on rawSubtotal)
  const shippingCost =
    rawSubtotal >= FREE_SHIPPING_THRESHOLD || cartItems.length === 0 ? 0 : 49;
  // Final Total
  const totalAmount = discountedSubtotal + tax + shippingCost;
  const totalSavings = couponDiscountAmount; // savings = coupon discount only
  const freeShippingProgress = Math.min(
    100,
    (rawSubtotal / FREE_SHIPPING_THRESHOLD) * 100,
  );

  const selectedAddress = addresses.find(
    (a) => (a._id || a.id) === selectedAddressId,
  );

  // ─── Checkout Navigation ──────────────────
  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to proceed");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    if (!selectedAddress) {
      toast.error("Please add a delivery address first");
      setIsAddingAddress(true);
      return;
    }
    navigate("/checkout");
  };

  // ─── Loading State ────────────────────────
  if (isLoading && cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50/50 font-sans">
        <div className="w-10 h-10 border-4 border-[#00C2D6] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm font-medium text-gray-400">
          Loading your shopping cart…
        </p>
      </div>
    );
  }

  // ─── Empty Cart ───────────────────────────
  if (!isLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans text-gray-800">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
          <StepProgress isAddressSelected={false} />
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] tracking-tight">
              Your Shopping Cart
            </h1>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E6F9FA] text-[#00C2D6] flex items-center justify-center mx-auto">
              <FiShoppingCart size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Your cart is empty
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              Looks like you haven't added any tumblers yet.
            </p>
            <Link to="/allproducts">
              <button className="px-6 py-3 bg-[#00C2D6] hover:bg-[#00A0B0] text-white font-bold text-sm rounded-xl transition shadow-sm">
                Explore All Products
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN RENDER ──────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans text-gray-800">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
        {/* Step Progress */}
        <StepProgress
          isAddressSelected={!!selectedAddress}
          onAddressClick={() => setIsAddingAddress(true)}
        />
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] tracking-tight">
            Your Shopping Cart
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Product Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 bg-white px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <div className="col-span-6">PRODUCT</div>
                <div className="col-span-2 text-center">PRICE</div>
                <div className="col-span-2 text-center">QUANTITY</div>
                <div className="col-span-2 text-right">TOTAL</div>
              </div>
              <div className="divide-y divide-gray-100">
                <AnimatePresence>
                  {cartItems.map((item) => {
                    const isCustom = item.customization?.isCustom;
                    const product = item.product || {};
                    const cartItemId = item._id;
                    const image =
                      item.customization?.designImage ||
                      product.mainImage ||
                      (product.images && product.images[0]) ||
                      "";
                    const title = isCustom
                      ? item.customization.name
                      : product.name || "Product";
                    const price = isCustom
                      ? item.customization.price
                      : product.price || 0;
                    const quantity = item.quantity || 1;
                    const color = item.customization?.color || product.color;
                    const isInStock = product.stock > 0;

                    return (
                      <motion.div
                        key={cartItemId}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                      >
                        <div className="md:col-span-6 flex items-start gap-4">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#E6F9FA] border border-gray-100 flex items-center justify-center p-2 flex-shrink-0">
                            <img
                              src={
                                image ||
                                "https://placehold.co/80x80/f3f4f6/9ca3af?text=No"
                              }
                              alt={title}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="space-y-1.5 min-w-0">
                            <h3 className="font-bold text-[#1E293B] text-sm sm:text-base leading-snug">
                              {title}
                            </h3>
                            {color && (
                              <p className="text-sm text-gray-500 font-medium">
                                Color: {color}
                              </p>
                            )}
                            <div className="flex items-center gap-1 text-[#00C2D6] text-xs font-semibold pt-0.5">
                              <FiCheckCircle
                                size={14}
                                className="fill-[#00C2D6] text-white"
                              />
                              <span className="text-emerald-600 font-semibold">
                                {isInStock ? "In Stock" : "Out of Stock"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold pt-2 text-gray-400">
                              <button
                                onClick={() => moveToWishlist(item)}
                                className="hover:text-gray-700 transition flex items-center gap-1"
                              >
                                <FiHeart size={14} /> Move to Wishlist
                              </button>
                              <button
                                onClick={() => removeItem(cartItemId)}
                                className="text-red-500 hover:text-red-600 transition flex items-center gap-1"
                              >
                                <FiTrash2 size={14} /> Remove
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2 text-left md:text-center flex md:block justify-between items-center border-t md:border-t-0 pt-2 md:pt-0 border-gray-50">
                          <span className="md:hidden text-xs text-gray-400 font-bold">
                            Price:
                          </span>
                          <span className="font-bold text-gray-900 text-sm sm:text-base">
                            ₹{price}
                          </span>
                        </div>

                        <div className="md:col-span-2 flex justify-between md:justify-center items-center border-t md:border-t-0 pt-2 md:pt-0 border-gray-50">
                          <span className="md:hidden text-xs text-gray-400 font-bold">
                            Qty:
                          </span>
                          <div className="flex items-center bg-[#F8FAFC] border border-gray-200 rounded-xl overflow-hidden p-0.5">
                            <button
                              onClick={() =>
                                updateQuantity(cartItemId, quantity - 1)
                              }
                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition text-xs font-bold disabled:opacity-40"
                              disabled={quantity <= 1}
                            >
                              <FiMinus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-gray-900">
                              {quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(cartItemId, quantity + 1)
                              }
                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition text-xs font-bold"
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-2 text-right flex md:block justify-between items-center border-t md:border-t-0 pt-2 md:pt-0 border-gray-50">
                          <span className="md:hidden text-xs text-gray-400 font-bold">
                            Total:
                          </span>
                          <span className="font-bold text-[#00C2D6] text-base sm:text-lg">
                            ₹{price * quantity}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              <div className="bg-[#FAFDFD] border-t border-gray-100 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E6F9FA] text-[#00C2D6] flex items-center justify-center flex-shrink-0">
                    <FiShield size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Secure Checkout
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-6">
                  <div className="w-10 h-10 rounded-full bg-[#E6F9FA] text-[#00C2D6] flex items-center justify-center flex-shrink-0">
                    <FiTruck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Free Shipping
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Link
                to="/allproducts"
                className="text-sm font-bold text-[#00C2D6] hover:text-[#00A0B0] flex items-center gap-1.5 transition"
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* Address Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900">
                  <FiMapPin className="text-[#00C2D6]" size={20} />
                  <h3 className="font-bold text-base sm:text-lg">
                    Delivery Address
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddingAddress(!isAddingAddress)}
                  className="text-sm font-semibold text-[#00C2D6] hover:underline flex items-center gap-1"
                >
                  <FiEdit2 size={16} />{" "}
                  {selectedAddress ? "Change Address" : "Add Address"}
                </button>
              </div>

              {selectedAddress && !isAddingAddress && (
                <div className="p-4 rounded-xl bg-[#E6F9FA]/60 border border-[#00C2D6]/20 text-sm space-y-1">
                  <p className="font-bold text-gray-900">
                    {selectedAddress.fullName}{" "}
                    <span className="font-normal text-gray-500">
                      ({selectedAddress.phoneNumber})
                    </span>
                  </p>
                  <p className="text-gray-700">
                    {selectedAddress.address}, {selectedAddress.city},{" "}
                    {selectedAddress.state} - {selectedAddress.pinCode}
                  </p>
                  {selectedAddress.isDefault && (
                    <span className="inline-block text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Default
                    </span>
                  )}
                </div>
              )}

              {isAddingAddress && (
                <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={newAddress.fullName}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          fullName: e.target.value,
                        })
                      }
                      className="p-3 border border-gray-200 rounded-xl outline-none focus:border-[#00C2D6] bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Phone Number *"
                      value={newAddress.phoneNumber}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="p-3 border border-gray-200 rounded-xl outline-none focus:border-[#00C2D6] bg-white"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Address (Street, Area) *"
                    value={newAddress.address}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, address: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#00C2D6] bg-white"
                    required
                  />
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <input
                      type="text"
                      placeholder="City *"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="p-3 border border-gray-200 rounded-xl outline-none focus:border-[#00C2D6] bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State *"
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                      className="p-3 border border-gray-200 rounded-xl outline-none focus:border-[#00C2D6] bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Pincode *"
                      value={newAddress.pinCode}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          pinCode: e.target.value,
                        })
                      }
                      className="p-3 border border-gray-200 rounded-xl outline-none focus:border-[#00C2D6] bg-white"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#00C2D6] hover:bg-[#00A0B0] text-white font-bold text-sm rounded-xl transition shadow-sm"
                    >
                      Save & Use Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Column – Order Summary */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm space-y-5 sticky top-24">
              <h2 className="text-lg font-extrabold text-gray-900">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-sm font-semibold text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({itemsCount} items)</span>
                  <span className="font-bold text-gray-900">
                    ₹{rawSubtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Coupon Discount line - only if applied */}
                {appliedCoupon && (
                  <div className="flex justify-between text-[#14C6D8] font-bold">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscountAmount}</span>
                  </div>
                )}

                {/* Tax line - always show */}
                <div className="flex justify-between text-gray-600">
                  <span>GST</span>
                  <span className="font-bold text-gray-900">₹{tax}</span>
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    Shipping <FiInfo size={14} className="text-gray-300" />
                  </span>
                  <span className="font-bold text-emerald-600">
                    {shippingCost === 0 ? "Free" : `₹${shippingCost}`}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-4 flex justify-between text-base font-extrabold text-gray-900">
                  <span>Total</span>
                  <span className="text-2xl font-black text-[#00C2D6]">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* ✅ Savings message – only shows if coupon applied */}
              {appliedCoupon && (
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                  <FiCheckCircle size={16} className="text-emerald-500" /> You
                  saved ₹{totalSavings} on this order
                </div>
              )}

              {/* ─── Available Coupons (auto-loaded) ─── */}
              <AvailableCoupons subtotal={rawSubtotal} />
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-[#00C2D6] hover:bg-[#00A0B0] text-white font-bold text-sm rounded-xl transition shadow-md shadow-[#00C2D6]/20 flex items-center justify-center gap-2"
                >
                  <FiLock size={16} /> Proceed to Checkout
                </button>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  Checkout with{" "}
                  <span className="font-black italic text-blue-900">
                    Razorpay
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-gray-100 text-xs font-bold text-gray-400">
                <div className="space-y-1">
                  <FiRotateCcw className="mx-auto text-gray-400" size={18} />
                  <p>7 Days Return</p>
                </div>
                <div className="space-y-1">
                  <FiShield className="mx-auto text-gray-400" size={18} />
                  <p>Secure Payment</p>
                </div>
                <div className="space-y-1">
                  <FiCheckCircle className="mx-auto text-gray-400" size={18} />
                  <p>100% Genuine</p>
                </div>
              </div>

              <div className="bg-[#E6F9FA] border border-[#00C2D6]/20 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold">
                  <FiCheckCircle size={16} className="text-[#00C2D6]" />
                  <span>
                    {rawSubtotal >= FREE_SHIPPING_THRESHOLD
                      ? "Yay! You're eligible for FREE shipping"
                      : `Add ₹${FREE_SHIPPING_THRESHOLD - rawSubtotal} more for free shipping`}
                  </span>
                </div>
                <div className="w-full bg-white h-2.5 rounded-full overflow-hidden p-0.5 border border-[#00C2D6]/10">
                  <div
                    className="bg-[#00C2D6] h-full rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 font-semibold text-center">
                  {rawSubtotal >= FREE_SHIPPING_THRESHOLD
                    ? "🎉 Free shipping unlocked!"
                    : `₹${FREE_SHIPPING_THRESHOLD - rawSubtotal} away from free shipping!`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Value Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 items-center shadow-sm">
          {[
            {
              icon: Shield,
              label: "Premium Quality",
              desc: "Top‑grade materials",
            },
            {
              icon: Snowflake,
              label: "12H Cold • 8H Hot",
              desc: "Advanced insulation",
            },
            { icon: Droplets, label: "Leak Proof", desc: "100% reliable" },
            { icon: Leaf, label: "BPA Free", desc: "Safe & non‑toxic" },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 justify-center md:justify-start ${idx > 0 ? "border-l border-gray-100 pl-4" : ""}`}
            >
              <div className="w-10 h-10 rounded-full bg-[#E6F9FA] text-[#00C2D6] flex items-center justify-center flex-shrink-0">
                <item.icon size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  {item.label}
                </h4>
                <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};;

export default CartPage;