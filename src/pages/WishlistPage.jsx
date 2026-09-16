import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiTrash2, FiHeart, FiShoppingCart, FiArrowLeft, FiMinus, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

import {
  fetchWishlist,
  removeFromWishlist,
  selectWishlistProducts,
  selectWishlistLoading,
} from "../store/slices/wishlistSlice";

import { addToCart } from "../store/slices/cartSlice";

const WishlistPage = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistProducts);
  const isLoading = useSelector(selectWishlistLoading);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart({ productId: item.id, quantity: 1 }));
    dispatch(removeFromWishlist(item.id));
  };

  // Skeleton loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-10 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-32 h-32 mx-auto bg-[#00C2D6] rounded-full flex items-center justify-center mb-6">
            <FiHeart className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save your favourite items here.</p>
          <Link to="/allproducts">
            <button className="bg-[#00C2D6] hover:bg-[#00A8B8] text-white font-semibold px-8 py-3 rounded-xl transition shadow-md">
              Start Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-5">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with back link and count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Link
            to="/allproducts"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#00C2D6] transition w-fit"
          >
            <FiArrowLeft size={18} /> Continue Shopping
          </Link>
          <div className="text-sm text-gray-500">
            {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">My Wishlist</h1>

        {/* Desktop header – hidden on mobile */}
        <div className="hidden md:grid grid-cols-12 gap-4 bg-white rounded-xl px-6 py-4 text-sm font-semibold text-gray-600 shadow-sm border border-gray-100 mb-4">
          <div className="col-span-6">Product</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-2 text-center">Actions</div>
          <div className="col-span-2 text-right">Remove</div>
        </div>

        {/* Wishlist items */}
        <div className="space-y-4">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group"
            >
              <div className="p-4 md:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Product image & info */}
                  <div className="flex gap-4 flex-1">
                    <Link to={`/product/${item.id}`}>
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-xl bg-gray-50 transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-bold text-gray-800 text-lg hover:text-orange-500 transition line-clamp-1">
                          {item.title}
                        </h3>
                      </Link>
                      {item.color && (
                        <p className="text-sm text-gray-500 mt-1">Color: {item.color}</p>
                      )}
                      {item.size && (
                        <p className="text-sm text-gray-500">Size: {item.size}</p>
                      )}
                      {/* Mobile price display */}
                      <div className="md:hidden mt-2">
                        <span className="text-2xl font-bold text-[#14C6D8]">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop price column */}
                  <div className="hidden md:block md:w-32 text-center">
                    <span className="text-xl font-bold text-[#14C6D8]">₹{item.price}</span>
                  </div>

                  {/* Actions: Add to Cart + Remove */}
                  <div className="flex flex-wrap items-center justify-start gap-3 mt-3 sm:mt-0">
                    <button
                      onClick={() => handleAddToCart(item, 1)}
                      className="bg-[#00C2D6] hover:bg-[#00A8B8] text-white font-semibold py-2.5 px-5 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-sm"
                    >
                      <FiShoppingCart size={16} /> Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-400 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50"
                      aria-label="Remove from wishlist"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Optional: Recommended products section – can be added later */}
      </div>
    </div>
  );
};

export default WishlistPage;