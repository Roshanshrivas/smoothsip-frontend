import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  FiHeart,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiChevronRight,
  FiChevronDown,
  FiMessageSquare,
  FiCheckCircle,
  FiArrowUp,
} from "react-icons/fi";
import { BsSnow, BsCupHot, BsShieldCheck, BsStarFill } from "react-icons/bs";
import toast from "react-hot-toast";
import ProductCard from "../components/ProductCard";
import {
  fetchProductById,
  selectCurrentProduct,
  selectProductsLoading,
} from "../store/slices/productsSlice";
import { addToCart } from "../store/slices/cartSlice";
import {
  addToWishlist,
  removeFromWishlist,
  selectWishlistProducts,
} from "../store/slices/wishlistSlice";
import ReviewForm from "../components/reviews/ReviewForm";
import ReviewsList from "../components/reviews/ReviewsList";
import SEO from '../components/SEO';
import { productService } from '../services/productService';

// Helper: format weight from grams for display
const formatWeight = (grams) => {
  if (!grams || grams === 0) return "—";
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${grams} g`;
};

  // ─── Scroll related products carousel ───
  const scrollRelated = (direction) => {
    if (relatedScrollRef.current) {
      const scrollAmount = 320;
      relatedScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

// ─── Description truncation config ───────────────────
const DESCRIPTION_LIMIT = 150;

const getTruncatedDescription = (text, limit = DESCRIPTION_LIMIT) => {
  if (!text) return "";
  if (text.length <= limit) return text;
  // Cut at nearest word boundary before limit
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "...";
};


// ========== SKELETON COMPONENTS ==========
const SkeletonImage = () => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs min-h-[350px] md:min-h-[480px] flex items-center justify-center">
    <div className="w-full h-64 bg-gray-200 rounded-xl animate-pulse" />
  </div>
);

const SkeletonThumbnail = () => (
  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gray-200 animate-pulse" />
);

const SkeletonText = ({ width = "w-full", height = "h-4", className = "" }) => (
  <div
    className={`bg-gray-200 rounded animate-pulse ${width} ${height} ${className}`}
  />
);

const SkeletonFeature = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col items-center gap-1.5">
    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
    <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
  </div>
);

const SkeletonSpecRow = () => (
  <div className="grid grid-cols-3 p-4">
    <SkeletonText width="w-20" height="h-4" />
    <SkeletonText width="w-32" height="h-4" className="col-span-2" />
  </div>
);

const SkeletonReview = () => (
  <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100">
    <div className="flex items-center justify-between">
      <SkeletonText width="w-24" height="h-4" />
      <SkeletonText width="w-16" height="h-3" />
    </div>
    <div className="mt-2">
      <SkeletonText width="w-32" height="h-4" />
    </div>
    <div className="mt-2">
      <SkeletonText width="w-full" height="h-12" />
    </div>
  </div>
);

// ========== HELPER COMPONENTS (Animated) ==========
const FeatureCard = ({ icon, title, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, type: "spring", damping: 12 }}
      className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col items-center gap-1.5 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1"
    >
      <div className="w-10 h-10 rounded-full bg-orange-50 text-[#ff6b35] flex items-center justify-center text-lg">
        {icon}
      </div>
      <p className="font-bold text-[10px] sm:text-xs text-gray-800 tracking-wide uppercase">
        {title}
      </p>
    </motion.div>
  );
};

const InfoCard = ({ icon, title, text, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.1 }}
      className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 hover:border-gray-200"
    >
      <div className="w-9 h-9 rounded-full bg-orange-50 text-[#ff6b35] flex items-center justify-center text-base shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
        <p className="text-xs text-gray-500 mt-0.5 leading-normal">{text}</p>
      </div>
    </motion.div>
  );
};

// ========== MAIN COMPONENT ==========
const ProductDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const product = useSelector(selectCurrentProduct);
  const loading = useSelector(selectProductsLoading);
  // ─── Wishlist from Redux (same as ProductCard) ───
  const wishlistItems = useSelector(selectWishlistProducts);
  const isWishlisted = product
    ? wishlistItems.some((item) => item.id === product.id)
    : false;

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  // const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const pageRef = useRef(null);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const relatedScrollRef = useRef(null);

  const handleReviewSubmitted = () => {
    setReviewRefreshKey((prev) => prev + 1);
  };

  // Fetch product when id changes
  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  // Set default selections when product loads
  useEffect(() => {
    if (product) {
      setSelectedImage(product.images?.[0] || "");
      setSelectedColor(
        product.colors?.[0] || { name: "Default", code: "#000" },
      );
      setSelectedSize(product.sizes?.find((s) => s.available)?.label || "24oz");
    }
  }, [product]);

  // ─── Fetch related products when product loads ───
  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      try {
        setLoadingRelated(true);
        const categoryId = product.categoryId || product.category?._id;
        const categoryName = product.categoryName || product.category?.name;

        // Query products in the same category, exclude current
        const query = {
          limit: 8,
          page: 1,
        };
        if (categoryId) query.category = categoryId;
        else if (categoryName) query.category = categoryName;

        const response = await productService.getProducts(query);
        const products = response.products || response.data?.products || [];

        // Filter out the current product
        const filtered = products.filter(
          (p) => String(p.id) !== String(product.id)
        );

        setRelatedProducts(filtered.slice(0, 8));
      } catch (err) {
        console.error("Failed to fetch related products:", err);
        setRelatedProducts([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelated();
  }, [product]);

  // Back to top button visibility
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // ─── Mobile Accordion state ──────────────────────────
  const [accordionOpen, setAccordionOpen] = useState({
    description: true, // open by default on mobile
    specifications: false,
    shipping: false,
  });

  const toggleAccordion = (section) => {
    setAccordionOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ─── Shared content renderer ──────────────────────────
  const renderTabContent = (tab) => {
    switch (tab) {
      case "description":
        return (
          <div className="grid md:grid-cols-5 gap-4 md:gap-6 items-start">
            <div className="md:col-span-3 space-y-4 sm:space-y-5">
              {/* ─── Description ─── */}
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-normal">
                {product.description}
              </p>
              {/* ─── Key Features ─── */}
              {product.features && product.features.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#ff6b35] rounded-full"></span>
                    Key Features
                  </h4>
                  <ul className="space-y-2.5">
                    {product.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3 text-xs sm:text-sm text-gray-700 leading-relaxed"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span className="font-medium">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="md:col-span-2 hidden md:block rounded-xl overflow-hidden aspect-square bg-gray-50 border border-gray-100 p-2">
              <img
                src={selectedImage}
                alt="Product preview"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
          </div>
        );
      case "specifications":
        return (
          <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
            {/* ─── Core Product Specs (Weight / Dimensions / Material) ─── */}
            {product.weight > 0 && (
              <div className="grid grid-cols-3 p-3 sm:p-4 text-xs sm:text-sm bg-gray-50/50">
                <span className="font-bold text-gray-500 col-span-1">
                  ⚖️ Weight
                </span>
                <span className="text-gray-800 font-medium col-span-2 pl-2 sm:pl-4 break-words">
                  {formatWeight(product.weight)}
                </span>
              </div>
            )}

            {product.dimensions &&
              (product.dimensions.length ||
                product.dimensions.width ||
                product.dimensions.height) && (
                <div className="grid grid-cols-3 p-3 sm:p-4 text-xs sm:text-sm bg-white">
                  <span className="font-bold text-gray-500 col-span-1">
                    📐 Dimensions
                  </span>
                  <span className="text-gray-800 font-medium col-span-2 pl-2 sm:pl-4 break-words">
                    {product.dimensions.length} × {product.dimensions.width} ×{" "}
                    {product.dimensions.height} cm
                  </span>
                </div>
              )}

            {product.material && (
              <div className="grid grid-cols-3 p-3 sm:p-4 text-xs sm:text-sm bg-gray-50/50">
                <span className="font-bold text-gray-500 col-span-1">
                  🛡️ Material
                </span>
                <span className="text-gray-800 font-medium col-span-2 pl-2 sm:pl-4 break-words">
                  {product.material}
                </span>
              </div>
            )}

            {product.color && (
              <div className="grid grid-cols-3 p-3 sm:p-4 text-xs sm:text-sm bg-white">
                <span className="font-bold text-gray-500 col-span-1">
                  🎨 Color
                </span>
                <span className="text-gray-800 font-medium col-span-2 pl-2 sm:pl-4 break-words">
                  {product.color}
                </span>
              </div>
            )}

            {/* ─── Additional Specifications from DB ─── */}
            {product.specifications && product.specifications.length > 0 ? (
              product.specifications.map((spec, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-3 p-3 sm:p-4 text-xs sm:text-sm ${
                    i % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                  }`}
                >
                  <span className="font-bold text-gray-500 col-span-1">
                    {spec.label}
                  </span>
                  <span className="text-gray-800 font-medium col-span-2 pl-2 sm:pl-4 break-words">
                    {spec.value}
                  </span>
                </div>
              ))
            ) : (
              <>
                {!product.weight &&
                  !product.material &&
                  (!product.dimensions ||
                    (!product.dimensions.length &&
                      !product.dimensions.width &&
                      !product.dimensions.height)) && (
                    <p className="text-gray-500 text-sm p-4">
                      No specifications available.
                    </p>
                  )}
              </>
            )}
          </div>
        );
      case "shipping":
        return (
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl font-medium">
            <h4 className="font-bold text-gray-900">Fulfillment Framework</h4>
            <p>
              All warehouse orders undergo quality dispatch metrics loops within
              24 operational business hours. Dispatch updates link directly to
              accounts automatically.
            </p>
            <h4 className="font-bold text-gray-900">Returns Policy</h4>
            <p>
              We supply an automated 7-day hassle-free online portal loop to
              execute item replacements if functional thermal variations emerge.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const addToCartHandler = () => {
    if (!product) return;
    dispatch(
      addToCart({
        productId: product.id,
        quantity,
        color: selectedColor?.name,
        size: selectedSize,
      }),
    );
  };

  const toggleWishlist = () => {
    if (!product) return;
    if (isWishlisted) {
      dispatch(removeFromWishlist(product.id));
      toast.success("Removed from wishlist", { duration: 1500 });
    } else {
      dispatch(addToWishlist(product.id));
      toast.success("Added to wishlist", { duration: 1500 });
    }
  };

  const renderStars = (rating, sizeClass = "text-[#ffb800] text-sm") => {
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(full)].map((_, i) => (
          <BsStarFill key={`f-${i}`} className={sizeClass} />
        ))}
        {half && (
          <span className={`${sizeClass} font-bold leading-none -mt-0.5`}>
            ½
          </span>
        )}
        {[...Array(5 - full - (half ? 1 : 0))].map((_, i) => (
          <BsStarFill key={`e-${i}`} className="text-gray-200 text-sm" />
        ))}
      </div>
    );
  };

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };
  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 15 } },
  };
  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", damping: 15, delay: 0.1 },
    },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  // If still loading or no product yet
  if (loading || !product) {
    return (
      <div className="w-full bg-gray-50/50 min-h-screen py-6 md:py-12 antialiased text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex md:flex-col gap-3 order-2 md:order-1">
                {[...Array(4)].map((_, idx) => (
                  <SkeletonThumbnail key={idx} />
                ))}
              </div>
              <SkeletonImage />
            </div>
            <div className="flex flex-col space-y-6">
              <div>
                <SkeletonText width="w-32" height="h-6" />
                <SkeletonText width="w-3/4" height="h-8" className="mt-2" />
              </div>
              <div className="flex items-center gap-4">
                <SkeletonText width="w-24" height="h-8" />
                <SkeletonText width="w-20" height="h-6" />
              </div>
              <SkeletonText width="w-full" height="h-20" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <SkeletonFeature key={i} />
                ))}
              </div>
              <SkeletonText width="w-full" height="h-10" />
              <SkeletonText width="w-full" height="h-12" />
              <div className="flex gap-4">
                <SkeletonText width="w-32" height="h-12" />
                <SkeletonText width="w-full" height="h-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={product?.name}
        description={product?.description}
        image={product?.images?.[0]}
        url={`/product/${product?.id}`}
        type="product"
      />
      <motion.div
        ref={pageRef}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="w-full bg-gray-50/50 min-h-screen py-6 md:py-12 antialiased text-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Animated Breadcrumb (always visible) */}
          <motion.nav
            variants={fadeUp}
            className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 font-medium mb-8 overflow-x-auto whitespace-nowrap scrollbar-none"
          >
            <Link to="/" className="hover:text-[#ff6b35] transition-colors">
              Home
            </Link>
            <FiChevronRight className="text-gray-300 shrink-0" />
            <Link
              to="/allproducts"
              className="hover:text-[#ff6b35] transition-colors"
            >
              Products
            </Link>
            <FiChevronRight className="text-gray-300 shrink-0" />
            {/* <Link
            to="/products/tumblers"
            className="hover:text-[#ff6b35] transition-colors"
          >
            Tumblers
          </Link> */}
            {/* <FiChevronRight className="text-gray-300 shrink-0" /> */}
            <span className="text-gray-800 font-semibold truncate">
              {product.title}
            </span>
          </motion.nav>

          {/* MAIN PRODUCT SECTION with skeleton */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-14 items-start">
            {/* LEFT COLUMN: Image Gallery */}
            <motion.div
              variants={slideInLeft}
              className="flex flex-col md:flex-row gap-4 lg:sticky lg:top-6"
            >
              {/* Thumbnails */}
              <div className="flex md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 scrollbar-none">
                {loading
                  ? [...Array(4)].map((_, idx) => (
                      <SkeletonThumbnail key={idx} />
                    ))
                  : product.images.map((img, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedImage(img)}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 bg-white flex-shrink-0 transition-all ${
                          selectedImage === img
                            ? "border-[#ff6b35] shadow-sm scale-95"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Gallery ${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    ))}
              </div>

              {/* Main Image */}
              {loading ? (
                <SkeletonImage />
              ) : (
                <div className="flex-1 bg-white rounded-2xl p-1 relative border border-gray-100 shadow-xs order-1 md:order-2 flex items-center justify-center min-h-[350px] md:min-h-[480px]">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md mx-auto flex items-center justify-center"
                  >
                    <img
                      src={selectedImage}
                      alt={product.title}
                      className="w-full h-auto max-h-[420px] object-contain"
                    />
                  </motion.div>
                  <div className="absolute top-2 left-2 sm:left-4 z-10 bg-[#21BFC8] text-white px-2 sm:px-3 py-1 rounded-full text-[12px] sm:text-[16px] font-bold tracking-wider uppercase shadow-xs">
                    {product.discount}% Off
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleWishlist}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 border border-gray-100 transition"
                  >
                    <FiHeart
                      className={`text-lg transition-all duration-300 ${isWishlisted ? "fill-red-500 text-red-500 scale-110" : "text-gray-400"}`}
                    />
                  </motion.button>
                </div>
              )}
            </motion.div>

            {/* RIGHT COLUMN: Product Info */}
            <motion.div
              variants={slideInRight}
              className="flex flex-col space-y-4 sm:space-y-6"
            >
              {loading ? (
                <>
                  <div>
                    <SkeletonText width="w-32" height="h-6" />
                    <SkeletonText width="w-3/4" height="h-8" className="mt-2" />
                  </div>
                  <div className="flex items-center gap-4">
                    <SkeletonText width="w-24" height="h-8" />
                    <SkeletonText width="w-20" height="h-6" />
                  </div>
                  <SkeletonText width="w-full" height="h-20" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <SkeletonFeature key={i} />
                    ))}
                  </div>
                  <SkeletonText width="w-full" height="h-10" />
                  <SkeletonText width="w-full" height="h-12" />
                  <div className="flex gap-4">
                    <SkeletonText width="w-32" height="h-12" />
                    <SkeletonText width="w-full" height="h-12" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="hidden sm:inline-block text-xs font-bold text-[#ff6b35] uppercase tracking-widest bg-orange-50 px-2.5 py-1 rounded-md">
                      Premium Vessels
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mt-2.5">
                      {product.title}
                    </h1>
                    <div className="flex items-center gap-3 mt-3.5 flex-wrap">
                      {renderStars(product.rating)}
                      <span className="text-gray-500 font-semibold text-xs sm:text-sm">
                        ({product.reviews} Verified Customer Reviews)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-b border-gray-100 pb-5 flex-wrap">
                    <span className="text-2xl md:text-4xl font-bold text-[#353543] sm:text-[#21BFC8]">
                      ₹{product.price}
                    </span>
                    <span className="text-gray-400 line-through text-lg ">
                      ₹{product.oldPrice}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ml-auto flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                      In Stock
                    </span>
                  </div>

                  {/* ─── Description with Read More ─── */}
                  <div className="space-y-2">
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-normal">
                      {showFullDescription
                        ? product.description
                        : getTruncatedDescription(product.description)}
                    </p>
                    {product.description &&
                      product.description.length > DESCRIPTION_LIMIT && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowFullDescription((prev) => !prev)
                          }
                          className="text-xs sm:text-sm font-bold text-[#ff6b35] hover:text-[#e05621] transition-colors inline-flex items-center gap-1 group"
                        >
                          {showFullDescription ? "Show Less" : "Read More"}
                          <motion.span
                            animate={{ rotate: showFullDescription ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="inline-flex"
                          >
                            <FiChevronDown className="text-base" />
                          </motion.span>
                        </button>
                      )}
                  </div>

                  <div className="hidden sm:grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FeatureCard icon={<BsSnow />} title="Cold 24H" index={0} />
                    <FeatureCard
                      icon={<BsCupHot />}
                      title="Hot 12H"
                      index={1}
                    />
                    <FeatureCard
                      icon={<BsShieldCheck />}
                      title="BPA Free"
                      index={2}
                    />
                    <FeatureCard
                      icon={<FiTruck />}
                      title="Cup Ready"
                      index={3}
                    />
                  </div>

                  {product.colors && product.colors.length > 0 && (
                    <div className="pt-2 border-t border-gray-50">
                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm tracking-wide uppercase">
                        Color:{" "}
                        <span className="text-[#ff6b35] font-extrabold">
                          {selectedColor.name}
                        </span>
                      </h3>

                      <div className="flex flex-wrap gap-3.5 mt-3">
                        {product.colors.map((color, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedColor(color)}
                            className={`w-8 h-8 rounded-full ring-2 transition-all shadow-xs ${
                              selectedColor.code === color.code
                                ? "ring-[#ff6b35] ring-offset-4 scale-105"
                                : "ring-transparent"
                            }`}
                            style={{ backgroundColor: color.code }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="pt-2">
                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm tracking-wide uppercase">
                        Selected Capacity:{" "}
                        <span className="text-[#ff6b35] font-extrabold">
                          {selectedSize}
                        </span>
                      </h3>

                      <div className="flex flex-wrap gap-3 mt-3">
                        {product.sizes.map((size) => (
                          <motion.button
                            key={size.label}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedSize(size.label)}
                            disabled={!size.available}
                            className={`px-5 py-2.5 rounded-xl border-2 font-bold text-xs sm:text-sm tracking-wide transition-all ${
                              selectedSize === size.label
                                ? "border-[#ff6b35] text-[#ff6b35] bg-orange-50/30"
                                : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                            } ${!size.available && "opacity-30 cursor-not-allowed"}`}
                          >
                            {size.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity & Add to Cart */}
                  <div className="flex items-center gap-2 sm:gap-4 pt-4 border-t border-gray-50 flex-wrap">
                    <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-xs overflow-hidden shrink-0">
                      <button
                        onClick={() =>
                          setQuantity((prev) => Math.max(1, prev - 1))
                        }
                        className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
                      >
                        <FiMinus size={13} />
                      </button>
                      <div className="w-2 sm:w-10 text-center font-bold text-gray-900 text-sm">
                        {quantity}
                      </div>
                      <button
                        onClick={() => setQuantity((prev) => prev + 1)}
                        className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
                      >
                        <FiPlus size={13} />
                      </button>
                    </div>
                    <div className="flex-1 flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={addToCartHandler}
                        className="flex-1 bg-[#00C2D6] hover:bg-[#00A0B0] text-white font-bold px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <FiShoppingCart size={16} /> Add to Cart
                      </motion.button>
                      <Link to="/customize" className="flex-1 hidden sm:block">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full border-2 border-gray-400 text-gray-600 font-bold py-2.5 rounded-xl transition-all hover:bg-gray-900 hover:text-white bg-white"
                        >
                          Customize Now
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                  <Link to="/customize" className="w-full hidden pt-1">
                    <button className="w-full border-2 border-gray-900 text-gray-900 font-bold py-3 rounded-xl transition-all hover:bg-gray-900 hover:text-white bg-white">
                      Customize Now
                    </button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          {/* ─── TABS & REVIEWS (Desktop: Tabs | Mobile: Accordion) ─── */}
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mt-12 sm:mt-16 md:mt-20">
            {/* Left column: Tabs (desktop) + Accordion (mobile) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* ─── Desktop Tabs ─────────────────────────────── */}
              <div className="hidden md:block border-b border-gray-100 px-6 md:px-8 pt-4">
                <div className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-none">
                  {["description", "specifications", "shipping"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative font-bold text-sm sm:text-base pb-3 transition-all duration-200 whitespace-nowrap ${
                        activeTab === tab
                          ? "text-[#ff6b35]"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {tab === "shipping"
                        ? "Shipping & Logistics"
                        : tab.charAt(0).toUpperCase() + tab.slice(1)}
                      {activeTab === tab && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff6b35] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ─── Desktop Tab Content ───────────────────────── */}
              <div className="hidden md:block p-6 md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderTabContent(activeTab)}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ─── Mobile Accordion ───────────────────────────── */}
              <div className="block md:hidden divide-y divide-gray-100">
                {["description", "specifications", "shipping"].map(
                  (section) => {
                    const isOpen = accordionOpen[section];
                    return (
                      <div key={section} className="px-4 py-3">
                        {/* Accordion Header */}
                        <button
                          onClick={() => toggleAccordion(section)}
                          className="w-full flex items-center justify-between py-2 text-left"
                        >
                          <span className="font-bold text-gray-900 text-sm">
                            {section === "shipping"
                              ? "Shipping & Logistics"
                              : section.charAt(0).toUpperCase() +
                                section.slice(1)}
                          </span>
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FiChevronDown className="text-gray-400 text-lg" />
                          </motion.div>
                        </button>

                        {/* Accordion Content */}
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3 pb-2">
                                {renderTabContent(section)}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  },
                )}
              </div>

              {/* ─── Reviews (common) ───────────────────────────── */}
              <div className="border-t border-gray-100 px-4 sm:px-6 md:px-8 py-6 sm:py-8">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-4 sm:mb-6 flex items-center gap-2">
                  <FiMessageSquare className="text-[#ff6b35]" /> Customer
                  Reviews
                </h3>
                <ReviewForm
                  productId={id}
                  onReviewSubmitted={handleReviewSubmitted}
                />
                <div className="mt-6 sm:mt-8">
                  <ReviewsList productId={id} key={reviewRefreshKey} />
                </div>
              </div>
            </div>

            {/* ─── Customer Analytics Panel ────────────────────── */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <SkeletonText width="w-32" height="h-6" />
                <SkeletonText width="w-20" height="h-10" className="mt-4" />
                <SkeletonText width="w-full" height="h-20" className="mt-4" />
                <SkeletonText width="w-full" height="h-10" className="mt-6" />
              </div>
            ) : (
              <motion.div
                variants={fadeUp}
                className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm flex flex-col justify-between h-fit lg:sticky lg:top-6"
              >
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
                    Customer Analytics
                  </h3>
                  <div className="flex items-baseline gap-2 mt-3 sm:mt-4">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                      {product.rating}
                    </span>
                    <span className="text-gray-400 font-semibold text-sm">
                      / 5.0
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1">
                    {renderStars(
                      product.rating,
                      "text-[#ffb800] text-sm sm:text-base",
                    )}
                  </div>
                  <div className="space-y-2 sm:space-y-2.5 mt-4 sm:mt-6 border-t border-gray-50 pt-4 sm:pt-5">
                    {[
                      { stars: 5, percentage: "82%" },
                      { stars: 4, percentage: "12%" },
                      { stars: 3, percentage: "4%" },
                      { stars: 2, percentage: "1%" },
                      { stars: 1, percentage: "1%" },
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        className="flex items-center text-[10px] sm:text-xs text-gray-600 font-medium gap-2 sm:gap-3"
                      >
                        <span className="w-3 text-right font-bold">
                          {row.stars}★
                        </span>
                        <div className="flex-1 h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#ffb800] rounded-full"
                            style={{ width: row.percentage }}
                          />
                        </div>
                        <span className="w-6 sm:w-8 text-right text-gray-400 font-bold">
                          {row.percentage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 sm:mt-8 border-2 border-gray-900 text-gray-900 font-bold py-2.5 sm:py-3 rounded-xl text-sm transition-all hover:bg-gray-900 hover:text-white bg-white"
                >
                  Write a Review
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Logistics Info Cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
          >
            <InfoCard
              icon={<FiTruck />}
              title="Free Shipping Protection"
              text="Automatically active on all configurations crossing ₹999 total bounds."
              index={0}
            />
            <InfoCard
              icon={<FiRefreshCw />}
              title="Frictionless Exchanges"
              text="7-day completely automated account processing loops for replacements."
              index={1}
            />
            <InfoCard
              icon={<FiShield />}
              title="Secure Checkout Matrix"
              text="Validated safety security protocols executing certified standard checkout channels."
              index={2}
            />
          </motion.div>

          {/* ─── YOU MAY ALSO LIKE ─── */}
          <div className="mt-16 sm:mt-20 md:mt-24">
            {/* Header */}
            <div className="flex items-end justify-between mb-6 sm:mb-8">
              <div>
                <span className="text-xs font-bold text-[#ff6b35] uppercase tracking-widest">
                  Recommended Choices
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mt-1">
                  You May Also Like
                </h2>
              </div>
              <Link
                to="/allproducts"
                className="text-sm font-bold text-[#ff6b35] hover:text-[#e05621] transition-colors hidden sm:block"
              >
                View Collection →
              </Link>
            </div>

            {/* Loading Skeleton */}
            {loadingRelated ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : relatedProducts.length === 0 ? (
              /* Empty State */
              <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500 text-sm">
                  No related products found in this category.
                </p>
                <Link
                  to="/allproducts"
                  className="mt-3 inline-block text-sm font-bold text-[#ff6b35] hover:underline"
                >
                  Browse All Products →
                </Link>
              </div>
            ) : (
              <>
                {/* ─── Desktop: Grid ─── */}
                <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {relatedProducts.map((prod, idx) => (
                    <motion.div
                      key={prod.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <ProductCard product={prod} />
                    </motion.div>
                  ))}
                </div>

                {/* ─── Mobile: Horizontal Scroll ─── */}
                <div className="block sm:hidden relative">
                  <div
                    ref={relatedScrollRef}
                    className="flex overflow-x-auto gap-4 pb-4 scrollbar-none snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {relatedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="w-[200px] flex-shrink-0 snap-start"
                      >
                        <ProductCard product={prod} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile CTA */}
                <div className="text-center mt-6 sm:hidden">
                  <Link
                    to="/allproducts"
                    className="text-sm font-bold text-[#ff6b35] hover:text-[#e05621] transition-colors"
                  >
                    View All Products →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Back to Top Button */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-50 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition"
            >
              <FiArrowUp size={20} />
            </motion.button>
          )}
        </AnimatePresence>

        <style jsx global>{`
          .scrollbar-none::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-none {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          .animate-shimmer {
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 50%,
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
        `}</style>
      </motion.div>
    </>
  );
};;

// Skeleton Card for related products
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200" />
    <div className="p-4 space-y-2">
      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-8 bg-gray-200 rounded w-full mt-3" />
    </div>
  </div>
);

export default ProductDetailsPage;