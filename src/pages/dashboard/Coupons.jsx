import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Copy,
  Check,
  Calendar,
  Loader2,
  Info,
  ShoppingBag,
  Gift,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  fetchAvailableCoupons,
  validateCoupon,
  selectAvailableCoupons,
  selectCouponLoading,
} from '../../store/slices/couponSlice';
import { selectCartSubtotal } from '../../store/slices/cartSlice';


// ─── Coupon Card ───────────────────────────────────
const CouponCard = ({ coupon, onApply }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast.success(`Coupon code "${coupon.code}" copied!`);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = coupon.code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success(`Coupon code "${coupon.code}" copied!`);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const getDiscountDisplay = () => {
    if (coupon.discountType === 'percentage') {
      return (
        <div className="flex flex-col items-center">
          <span className="text-2xl sm:text-3xl font-black text-[#18212A] dark:text-white leading-none">
            {coupon.discountValue}%
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#5F6C7B]">OFF</span>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center">
          <span className="text-2xl sm:text-3xl font-black text-[#18212A] dark:text-white leading-none">
            ₹{coupon.discountValue}
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#5F6C7B]">OFF</span>
        </div>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#18212A] rounded-2xl border-2 border-[#14C6D8]/30 dark:border-[#14C6D8]/20 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row overflow-hidden min-h-[170px]"
    >
      <div className="w-full sm:w-[130px] lg:w-[150px] bg-[#E6F9FA] dark:bg-[#14C6D8]/10 flex flex-col items-center justify-center p-3 sm:p-2 text-center border-b sm:border-b-0 sm:border-r-2 border-dashed border-[#14C6D8]/20">
        {getDiscountDisplay()}
      </div>

      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold font-mono uppercase text-[#14C6D8]">
                {coupon.code}
              </h3>
              <button
                onClick={handleCopy}
                className={`p-1.5 rounded-lg transition-colors ${
                  copied
                    ? 'bg-[#22C55E]/20 text-[#22C55E]'
                    : 'text-[#5F6C7B]/60 hover:text-[#14C6D8] hover:bg-[#E6F9FA] dark:hover:bg-[#14C6D8]/20'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-600">
              Active
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#5F6C7B] dark:text-[#5F6C7B] mt-1">
            {coupon.description}
          </p>
        </div>

        <div className="space-y-1.5 text-xs sm:text-sm text-[#5F6C7B] dark:text-[#5F6C7B] mt-2">
          <div className="flex items-center gap-2">
            <ShoppingBag size={15} className="text-[#5F6C7B]/60" />
            <span>Min. order <span className="font-semibold text-[#18212A] dark:text-white">₹{coupon.minimumOrder || 0}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-[#5F6C7B]/60" />
            <span>Valid till <span className="font-semibold text-[#18212A] dark:text-white">
              {new Date(coupon.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span></span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E8EEF2] dark:border-[#18212A]/30">
          <button className="text-xs font-medium text-[#5F6C7B]/70 hover:text-[#18212A] dark:hover:text-white transition flex items-center gap-1">
            <Info size={14} /> Terms
          </button>
          <button
            onClick={() => onApply(coupon.code)}
            className="px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-[#14C6D8] hover:bg-[#0FB2C3] rounded-xl transition shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#14C6D8] focus:ring-offset-2 flex items-center gap-1"
          >
            <ExternalLink size={14} /> Apply
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ──────────────────────────────
const Coupons = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const coupons = useSelector(selectAvailableCoupons);
  const isLoading = useSelector(selectCouponLoading);
  const subtotal = useSelector(selectCartSubtotal) || 0;

  useEffect(() => {
    dispatch(fetchAvailableCoupons(subtotal));
  }, [dispatch, subtotal]);

  const handleApplyCoupon = async (code) => {
    await dispatch(validateCoupon({ code, subtotal }));
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 size={40} className="animate-spin text-[#14C6D8]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18212A] dark:text-white flex items-center gap-2">
            <Ticket size={28} className="text-[#14C6D8]" />
            My Coupons
          </h1>
          <p className="text-sm text-[#5F6C7B] dark:text-[#5F6C7B] mt-0.5">
            {coupons.length} active coupon{coupons.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-[#E6F9FA] dark:bg-[#14C6D8]/10 px-3 py-1.5 rounded-full border border-[#14C6D8]/20">
          <Gift size={16} className="text-[#14C6D8]" />
          <span className="font-medium text-[#18212A] dark:text-white">
            {coupons.length} available
          </span>
        </div>
      </div>

      {/* Available Coupons Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#18212A] dark:text-white">
          Available Coupons
        </h2>
        {coupons.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#18212A] rounded-2xl border border-[#E8EEF2] dark:border-[#18212A]/30">
            <Ticket size={48} className="mx-auto text-[#5F6C7B]/30 mb-3" />
            <p className="text-sm font-medium text-[#5F6C7B] dark:text-[#5F6C7B]">
              No coupons available right now.
            </p>
            <p className="text-xs text-[#5F6C7B]/60 mt-1">Check back later for offers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} onApply={handleApplyCoupon} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupons;