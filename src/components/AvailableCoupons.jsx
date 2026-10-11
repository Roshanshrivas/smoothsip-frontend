import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag, Check, Loader2, Percent, IndianRupee, Lock,
  Copy, X, Sparkles, Ban, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  selectAvailableCoupons,
  selectCouponLoading,
  selectAppliedCoupon,
  validateCoupon,
  clearAppliedCoupon,
} from "../store/slices/couponSlice";

// ─── Helpers ────────────────────────────────────
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
  return `Till ${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`;
};

// ─── Single Coupon Row (radio-style) ─────────────
const CouponRow = ({ coupon, selected, onSelect }) => {
  const isDisabled = !coupon.eligible;
  const isUsed = coupon.userLimitReached;

  return (
    <button
      type="button"
      onClick={() => !isDisabled && onSelect(coupon)}
      disabled={isDisabled}
      className={`w-full text-left rounded-xl border-2 transition-all ${
        isDisabled
          ? "border-gray-200 bg-gray-50/60 opacity-70 cursor-not-allowed"
          : selected
          ? "border-[#00C2D6] bg-[#E6F9FA] shadow-sm ring-2 ring-[#00C2D6]/20"
          : "border-dashed border-[#00C2D6]/40 bg-white hover:border-[#00C2D6] hover:bg-[#F4FDFE]"
      }`}
    >
      <div className="p-3 flex items-start gap-3">
        {/* Radio indicator */}
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
            selected
              ? "border-[#00C2D6] bg-[#00C2D6]"
              : isDisabled
              ? "border-gray-300"
              : "border-gray-300"
          }`}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>

        {/* Discount icon */}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isDisabled
              ? "bg-gray-100"
              : selected
              ? "bg-white"
              : "bg-[#E6F9FA]"
          }`}
        >
          {isUsed ? (
            <Ban size={16} className="text-gray-400" />
          ) : isDisabled ? (
            <Lock size={16} className="text-gray-400" />
          ) : coupon.discountType === "percentage" ? (
            <Percent size={16} className="text-[#00C2D6]" />
          ) : (
            <IndianRupee size={16} className="text-[#00C2D6]" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-black text-sm tracking-wide ${
                isDisabled ? "text-gray-500" : "text-gray-900"
              }`}
            >
              {coupon.code}
            </span>
            {!isDisabled && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Save ₹{coupon.previewDiscount}
              </span>
            )}
          </div>

          <p
            className={`text-xs font-bold mt-0.5 ${
              isDisabled ? "text-gray-500" : "text-[#00C2D6]"
            }`}
          >
            {formatDiscount(coupon)}
          </p>

          {coupon.description && (
            <p className="text-[11px] text-gray-500 mt-1 leading-snug line-clamp-1">
              {coupon.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400 font-medium">
            {coupon.minimumOrder > 0 && (
              <span>Min ₹{coupon.minimumOrder}</span>
            )}
            {coupon.endDate && <span>{formatExpiry(coupon.endDate)}</span>}
            {isUsed && (
              <span className="text-gray-500">
                {coupon.perUserLimit === 1
                  ? "You've used this"
                  : `Used ${coupon.userUsageCount}/${coupon.perUserLimit}`}
              </span>
            )}
            {!isUsed && !coupon.eligible && coupon.amountToUnlock > 0 && (
              <span className="text-orange-500 font-bold">
                Add ₹{coupon.amountToUnlock} more
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

// ─── Coupon Modal ────────────────────────────────
const CouponModal = ({
  isOpen,
  onClose,
  coupons,
  subtotal,
  onApply,
  applyingCode,
}) => {
  const [manualCode, setManualCode] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const eligible = coupons.filter((c) => c.eligible);
  const disabled = coupons.filter((c) => !c.eligible);

  const handleManualApply = async () => {
    const code = manualCode.trim().toUpperCase();
    if (!code) {
      toast.error("Enter a coupon code");
      return;
    }
    const ok = await onApply({ code });
    if (ok) {
      setManualCode("");
      onClose();
    }
  };

  const handleListApply = async () => {
    if (!selectedCoupon) {
      toast.error("Select a coupon first");
      return;
    }
    const ok = await onApply(selectedCoupon);
    if (ok) {
      setSelectedCoupon(null);
      onClose();
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E6F9FA] flex items-center justify-center">
                <Tag size={18} className="text-[#00C2D6]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Apply Coupon
                </h3>
                <p className="text-xs text-gray-500">
                  {eligible.length} offer{eligible.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
              aria-label="Close"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {/* ─── MANUAL ENTRY ─── */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Enter Coupon Code Manually
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleManualApply()}
                  placeholder="e.g., WELCOME20"
                  maxLength={20}
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono tracking-wider focus:ring-2 focus:ring-[#00C2D6] focus:border-transparent outline-none bg-white"
                />
                <button
                  onClick={handleManualApply}
                  disabled={!manualCode.trim() || applyingCode === "MANUAL"}
                  className="px-5 py-2.5 bg-[#00C2D6] hover:bg-[#00A0B0] text-white font-bold text-sm rounded-lg transition disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                >
                  {applyingCode === "MANUAL" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
            </div>

            {/* ─── OR divider ─── */}
            <div className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                or choose from below
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* ─── COUPON LIST ─── */}
            <div className="px-5 pb-5 space-y-2.5">
              {coupons.length === 0 ? (
                <div className="text-center py-10">
                  <Tag size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-sm text-gray-500 font-medium">
                    No coupons available right now
                  </p>
                </div>
              ) : (
                <>
                  {/* Eligible */}
                  {eligible.length > 0 && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-2">
                        Available for you
                      </p>
                      <div className="space-y-2">
                        {eligible.map((coupon) => (
                          <CouponRow
                            key={coupon._id || coupon.code}
                            coupon={coupon}
                            selected={
                              selectedCoupon?._id === coupon._id ||
                              selectedCoupon?.code === coupon.code
                            }
                            onSelect={setSelectedCoupon}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disabled / Locked / Used */}
                  {disabled.length > 0 && (
                    <div className="pt-3">
                      <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-2 flex items-center gap-1.5">
                        <Lock size={11} /> Not applicable right now
                      </p>
                      <div className="space-y-2">
                        {disabled.map((coupon) => (
                          <CouponRow
                            key={coupon._id || coupon.code}
                            coupon={coupon}
                            selected={false}
                            onSelect={() => {}}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer — Apply Selected */}
          <div className="px-5 py-4 border-t border-gray-100 bg-white flex-shrink-0">
            {selectedCoupon ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                    Selected
                  </p>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {selectedCoupon.code} · Save ₹
                    {selectedCoupon.previewDiscount}
                  </p>
                </div>
                <button
                  onClick={handleListApply}
                  disabled={applyingCode === selectedCoupon.code}
                  className="px-6 py-3 bg-[#00C2D6] hover:bg-[#00A0B0] text-white font-bold text-sm rounded-xl transition disabled:opacity-50 flex items-center gap-2 shadow-sm whitespace-nowrap"
                >
                  {applyingCode === selectedCoupon.code ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Applying…
                    </>
                  ) : (
                    <>
                      Apply Coupon
                      <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 transition"
              >
                Close
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main Component ──────────────────────────────
const AvailableCoupons = ({ subtotal }) => {
  const dispatch = useDispatch();
  const coupons = useSelector(selectAvailableCoupons);
  const loading = useSelector(selectCouponLoading);
  const appliedCoupon = useSelector(selectAppliedCoupon);

  const [modalOpen, setModalOpen] = useState(false);
  const [applyingCode, setApplyingCode] = useState(null);

  // Shared apply handler — used by both manual & list
  const handleApply = async (coupon) => {
    const code = typeof coupon === "string" ? coupon : coupon.code;
    setApplyingCode(code === "MANUAL" ? "MANUAL" : code);
    try {
      await dispatch(validateCoupon({ code, subtotal })).unwrap();
      toast.success(`Coupon "${code}" applied!`);
      return true;
    } catch (err) {
      toast.error(err || "Could not apply coupon");
      return false;
    } finally {
      setApplyingCode(null);
    }
  };

  const handleRemove = () => {
    dispatch(clearAppliedCoupon());
    toast.success("Coupon removed");
  };

  const eligibleCount = coupons.filter((c) => c.eligible).length;

  return (
    <>
      {/* ─── Applied state ─── */}
      {appliedCoupon ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Check size={18} className="text-emerald-600" strokeWidth={3} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600">
                Coupon Applied
              </p>
              <p className="text-sm font-black text-emerald-800 truncate">
                {appliedCoupon.code}
              </p>
              <p className="text-xs font-bold text-emerald-600">
                You saved ₹{appliedCoupon.discountAmount}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="px-4 py-2 bg-white border border-emerald-200 text-red-500 hover:bg-red-50 text-xs font-bold rounded-lg transition whitespace-nowrap"
          >
            Remove
          </button>
        </div>
      ) : (
        /* ─── Trigger row ─── */
        <button
          onClick={() => setModalOpen(true)}
          disabled={loading}
          className="w-full bg-white hover:bg-[#F4FDFE] border border-dashed border-[#00C2D6]/40 hover:border-[#00C2D6] rounded-2xl p-4 flex items-center justify-between transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F9FA] flex items-center justify-center">
              {loading ? (
                <Loader2 size={18} className="text-[#00C2D6] animate-spin" />
              ) : (
                <Tag size={18} className="text-[#00C2D6]" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">
                Apply Coupon
              </p>
              <p className="text-xs text-gray-500 font-medium">
                {eligibleCount > 0
                  ? `${eligibleCount} offer${eligibleCount !== 1 ? "s" : ""} available`
                  : "Enter code or browse offers"}
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className="text-gray-400 group-hover:text-[#00C2D6] group-hover:translate-x-0.5 transition-all"
          />
        </button>
      )}

    {/* ─── Modal (rendered via portal to escape sticky stacking context) ─── */}
      {createPortal(
        <CouponModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          coupons={coupons}
          subtotal={subtotal}
          onApply={handleApply}
          applyingCode={applyingCode}
        />,
        document.body
      )}
    </>
  );
};

export default AvailableCoupons;