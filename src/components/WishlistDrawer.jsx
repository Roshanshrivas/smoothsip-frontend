// WishlistDrawer.jsx – Teal Theme, Production-Ready, Responsive
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiX, FiTrash2, FiHeart, FiShoppingCart } from "react-icons/fi";
import toast from "react-hot-toast";
import {
  fetchWishlist,
  removeFromWishlist,
  selectWishlistProducts,
  selectWishlistTotal,
} from "../store/slices/wishlistSlice";
import { addToCart } from "../store/slices/cartSlice";


const WishlistDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistProducts);
  const totalItems = useSelector(selectWishlistTotal);

   useEffect(() => {
    if (isOpen) {
      dispatch(fetchWishlist());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, dispatch]);

   const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart({ productId: item.id, quantity: 1 }));
    dispatch(removeFromWishlist(item.id));
  };


  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist drawer"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              Wishlist{" "}
              {totalItems > 0 && (
                <span className="text-xs bg-[#E6F9FA] text-[#00C2D6] px-2.5 py-0.5 rounded-full font-bold">
                  {totalItems} items
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition duration-200 active:scale-90"
            aria-label="Close wishlist"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-gray-100 scrollbar-none">
          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4 border border-gray-100">
                <FiHeart size={32} />
              </div>
              <p className="text-gray-900 font-bold text-base">Your wishlist is empty</p>
              <p className="text-gray-400 text-xs max-w-[240px] mt-1 leading-normal">
                Start saving your favorite tumblers and accessories here.
              </p>
              <button
                onClick={onClose}
                className="mt-5 bg-gray-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#00C2D6] transition duration-200 shadow-xs uppercase tracking-wider"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            wishlistItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 py-4 first:pt-1 group"
              >
                {/* Image */}
                <Link
                  to={`/product/${item.id}`}
                  onClick={onClose}
                  className="shrink-0"
                >
                  <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden p-1 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="max-w-full max-h-full object-contain mix-blend-multiply"
                      loading="lazy"
                    />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link to={`/product/${item.id}`} onClick={onClose}>
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight hover:text-[#00C2D6] transition">
                        {item.title}
                      </h4>
                    </Link>
                    <p className="font-bold text-[#00C2D6] text-base mt-1">
                      ₹{item.price}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 bg-[#00C2D6] hover:bg-[#00A0B0] text-white text-xs font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                      aria-label={`Add ${item.title} to cart`}
                    >
                      <FiShoppingCart size={14} /> Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="ml-2 text-gray-400 hover:text-red-500 transition p-2 rounded-lg hover:bg-red-50"
                      aria-label="Remove from wishlist"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer – View Full Wishlist */}
        {wishlistItems.length > 0 && (
          <div className="border-t border-gray-100 p-5 bg-white shadow-[0_-8px_30px_rgb(0,0,0,0.02)]">
            <Link
              to="/dashboard/wishlist"
              onClick={onClose}
              className="block w-full bg-gray-900 hover:bg-[#00C2D6] text-white font-bold py-3.5 rounded-xl text-center transition duration-200 shadow-sm text-sm uppercase tracking-wide"
            >
              View Full Wishlist
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistDrawer;