import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag, ChevronDown, ChevronUp, Check, Loader2,
  Percent, IndianRupee, Lock, Copy, Sparkles, Ban,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  selectAvailableCoupons,
  selectCouponLoading,
  selectAppliedCoupon,
  validateCoupon,
} from "../store/slices/couponSlice";

const formatDiscount = (coupon) => {
  if (coupon.discountType === "percentage") {
    return `${coupon.discountValue}% OFF${
      coupon.maxDiscount ? ` up to ₹${coupon.maxDiscount}` : ""
    }`;
  }
  return `₹${coupon.discountValue} OFF`;
};

const formatExpiry = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Expired";
  if (diff === 0) return "Expires today";
  if (diff === 1) return "Expires tomorrow";
  if (diff <= 7) return `${diff} days left`;
  return `Valid till ${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`;
};

const AvailableCoupons = ({ subtotal }) => {
  const dispatch = useDispatch();
  const coupons = useSelector(selectAvailableCoupons);
  const loading = useSelector(selectCouponLoading);
  const appliedCoupon = useSelector(selectAppliedCoupon);

  const [expanded, setExpanded] = useState(true);
  const [applyingCode, setApplyingCode] = useState(null);

  const handleApply = async (coupon) => {
    setApplyingCode(coupon.code);
    try {
      await dispatch(validateCoupon({ code: coupon.code, subtotal })).unwrap();
      toast.success(`Coupon "${coupon.code}" applied!`);
    } catch (err) {
      toast.error(err || "Could not apply coupon");
    } finally {
      setApplyingCode(null);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  // Group by state
  const eligible = coupons.filter((c) => c.eligible);
  const used = coupons.filter((c) => c.userLimitReached);
  const locked = coupons.filter(
    (c) => !c.eligible && !c.userLimitReached
  );

  if (loading && coupons.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin text-[#00C2D6]" />
          Loading available offers…
        </div>
      </div>
    );
  }

  if (coupons.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-gray-50/60 transition"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E6F9FA] flex items-center justify-center">
            <Tag size={16} className="text-[#00C2D6]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">Available Offers</p>
            <p className="text-xs text-gray-500 font-medium">
              {eligible.length > 0
                ? `${eligible.length} coupon${eligible.length > 1 ? "s" : ""} you can use`
                : "No applicable coupons right now"}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100"
          >
            <div className="p-3 sm:p-4 space-y-2.5">
              {/* ✅ APPLICABLE COUPONS */}
              {eligible.map((coupon) => {
                const isApplied = appliedCoupon?.code === coupon.code;
                const isApplying = applyingCode === coupon.code;

                return (
                  <div
                    key={coupon._id || coupon.code}
                    className={`rounded-xl border-2 transition-all ${
                      isApplied
                        ? "border-emerald-300 bg-emerald-50/40"
                        : "border-dashed border-[#00C2D6]/40 bg-[#F4FDFE] hover:border-[#00C2D6]"
                    }`}
                  >
                    <div className="p-3 sm:p-3.5 flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isApplied ? "bg-emerald-100" : "bg-[#00C2D6]/10"
                        }`}
                      >
                        {isApplied ? (
                          <Check size={18} className="text-emerald-600" strokeWidth={3} />
                        ) : coupon.discountType === "percentage" ? (
                          <Percent size={18} className="text-[#00C2D6]" />
                        ) : (
                          <IndianRupee size={18} className="text-[#00C2D6]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-black text-sm tracking-wide ${
                              isApplied ? "text-emerald-700" : "text-gray-900"
                            }`}
                          >
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopy(coupon.code)}
                            className="text-gray-400 hover:text-[#00C2D6] transition"
                          >
                            <Copy size={11} />
                          </button>
                        </div>

                        <p
                          className={`text-xs font-bold mt-0.5 ${
                            isApplied ? "text-emerald-700" : "text-[#00C2D6]"
                          }`}
                        >
                          {formatDiscount(coupon)} — You save ₹{coupon.previewDiscount}
                        </p>

                        {coupon.description && (
                          <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                            {coupon.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 font-medium">
                          {coupon.minimumOrder > 0 && (
                            <span>Min order ₹{coupon.minimumOrder}</span>
                          )}
                          {coupon.validUntil && <span>{formatExpiry(coupon.validUntil)}</span>}
                          {coupon.endDate && <span>{formatExpiry(coupon.endDate)}</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => handleApply(coupon)}
                        disabled={isApplied || isApplying || applyingCode !== null}
                        className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                          isApplied
                            ? "bg-emerald-500 text-white cursor-default"
                            : isApplying
                            ? "bg-[#00C2D6]/60 text-white cursor-wait"
                            : "bg-[#00C2D6] hover:bg-[#00A0B0] text-white shadow-sm disabled:opacity-50"
                        }`}
                      >
                        {isApplied ? (
                          <span className="flex items-center gap-1">
                            <Check size={12} strokeWidth={3} /> Applied
                          </span>
                        ) : isApplying ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          "APPLY"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* 🔒 LOCKED COUPONS (need higher cart value) */}
              {locked.length > 0 && (
                <div className="pt-2 mt-2 border-t border-gray-100">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-2 flex items-center gap-1.5">
                    <Lock size={11} /> Unlock with more items
                  </p>
                  {locked.slice(0, 3).map((coupon) => (
                    <div
                      key={coupon._id || coupon.code}
                      className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 flex items-start gap-3 mb-2"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <Lock size={14} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs text-gray-600 tracking-wide">
                          {coupon.code}
                        </span>
                        <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                          {formatDiscount(coupon)}
                        </p>
                        <p className="text-[10px] text-orange-500 font-bold mt-1">
                          Add ₹{coupon.amountToUnlock} more to unlock
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ⛔ USED COUPONS (user already used) */}
              {used.length > 0 && (
                <div className="pt-2 mt-2 border-t border-gray-100">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-2 flex items-center gap-1.5">
                    <Ban size={11} /> Already used by you
                  </p>
                  {used.slice(0, 3).map((coupon) => (
                    <div
                      key={coupon._id || coupon.code}
                      className="rounded-xl border border-gray-200 bg-white p-3 flex items-start gap-3 mb-2 opacity-60"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Ban size={14} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs text-gray-500 tracking-wide line-through">
                          {coupon.code}
                        </span>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                          {coupon.perUserLimit === 1
                            ? "One-time coupon — you've used it"
                            : `Used ${coupon.userUsageCount} of ${coupon.perUserLimit} times`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ✨ Pro tip */}
              {eligible.length > 1 && !appliedCoupon && (
                <div className="mt-3 flex items-start gap-2 bg-gradient-to-br from-[#E6F9FA] to-white border border-[#00C2D6]/20 rounded-xl p-3">
                  <Sparkles size={14} className="text-[#00C2D6] flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-gray-600 leading-snug">
                    <span className="font-bold text-[#00C2D6]">Pro tip:</span> Use{" "}
                    <span className="font-bold">{eligible[0].code}</span> for maximum
                    savings of ₹{eligible[0].previewDiscount}.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AvailableCoupons;