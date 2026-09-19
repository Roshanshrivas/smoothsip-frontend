// ProductCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaStar } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, selectWishlistProducts } from '../store/slices/wishlistSlice';


const getOptimizedImage = (url, width = 400, height = 400) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('cloudinary.com')) return url;
  // Only transform if not already transformed
  if (url.includes('/w_')) return url;
  return url.replace(
    '/upload/',
    `/upload/w_${width},h_${height},c_limit,q_auto:good,f_auto/`
  );
};

const ProductCard = ({ product, displayTag = null }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ─── Defensive checks ───────
  if (!product || !product.id) {
    return <div className="p-4 bg-gray-100 rounded">Product unavailable</div>;
  }

  const tag = displayTag || (product.tags && product.tags[0]) || null;
  const wishlistItems = useSelector(selectWishlistProducts);
  const isWishlisted = wishlistItems.some(item => item.id === product.id);

  const {
    title = 'Product',
    price = 0,
    oldPrice = 0,
    discount = 0,
    image = '',
    rating = 0,
    reviews = 0,
    bg = '#f8f9fa',
  } = product;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-[#ffb800]">
            ★
          </span>
        ))}
        {halfStar && (
          <span className="text-[#ffb800]">½</span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">
            ★
          </span>
        ))}
      </>
    );
  };

  const handleNavigate = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart({ productId: product.id, quantity: 1 }));
  };

  const handleWishlist = (e) => {
  e.stopPropagation();
  if (isWishlisted) {
    dispatch(removeFromWishlist(product.id));
  } else {
    dispatch(addToWishlist(product.id));
  }
};

  return (
    <div onClick={handleNavigate}
      className="cursor-pointer group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
      {/* IMAGE SECTION */}
      <div className="relative w-full pt-[90%] overflow-hidden bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center"
          style={{backgroundColor: product.bg || "#fafafa"}}>
          <img
            src={getOptimizedImage(image, 400, 400)}
            alt={product.title}
            loading="lazy"
            decoding="async"
            width="400"
            height="400"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
        </div>
        {/* DISCOUNT */}
        <div className="absolute shadow-sm top-1 sm:top-2 left-1 sm:left-2 z-10 bg-[#21BFC8] text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
          -{product.discount}%
        </div>
        {/* TAG */}
        {tag && (
          <div
            className={`
              absolute flex items-center gap-1 sm:gap-2 shadow-md
              top-1 sm:top-2 right-1 sm:right-2 z-10 rounded-full
              text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1
              ${
                tag === "BEST SELLER"
                  ? "text-[#21BFC8] bg-white"
                  : tag === "TRENDING"
                  ? "bg-[#0FB2C3] text-white"
                  : tag === "NEW ARRIVAL"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                  : "bg-[#0FB2C3] text-white"
              }
            `}>
            <FaStar className="text-[10px] sm:text-xs" />
            {tag === "BEST SELLER"
              ? "Best Seller"
              : tag === "TRENDING"
              ? "Trending"
              : tag === "NEW ARRIVAL"
              ? "New"
              : tag}
          </div>
        )}
        {/* WISHLIST */}
        <button
          onClick={handleWishlist}
          className="
            absolute bottom-3 right-1.5 sm:right-3 z-10
            w-9 h-9 bg-white rounded-full
            flex items-center justify-center
            shadow-md hover:bg-[#21BFC8]
            transition-colors duration-200
            group/heart">
           <FiHeart
            className="text-gray-600 group-hover/heart:text-white"
            size={16} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-2 sm:p-4 flex flex-col flex-grow">
        {/* TITLE */}
        <h3 className="text-[16px] sm:text-[17px] font-bold text-gray-800/90 line-clamp-2">
          {product.title}
        </h3>
        {/* RATING */}
        <div className="flex items-center gap-1 mb-1">
          <div className="flex text-[20px]">
            {renderStars(product.rating)}
          </div>
          <span className="text-gray-500 text-xs">
            ({product.reviews})
          </span>
        </div>
        {/* PRICE */}
        <div className="flex items-center gap-2 mb-2 sm:mb-4">
          <span className="text-[19px] sm:text-xl md:text-2xl font-bold text-[#21BFC8]">
            ₹{product.price}
          </span>
          <span className="text-gray-500 line-through decoration-1 text-[18px]">
            ₹{product.oldPrice}
          </span>
        </div>
        {/* BUTTON */}
        <button
          onClick={handleAddToCart}
          className="text-[15px] sm:text-[18px]
            w-full py-2 sm:py-3 rounded-xl
            border-[1.5px] bg-[#00C2D6]
            text-white font-semibold
            flex items-center justify-center gap-2
            hover:bg-[#00A0B0] hover:shadow-lg
            hover:text-white hover:scale-[1.02]
            transition-all duration-300
            active:scale-95
            group/btn
            mt-auto">
          <FaShoppingCart size={18} className="transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:scale-110"/>
           Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;