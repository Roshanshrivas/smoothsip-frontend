import React, { useState, useEffect, useMemo, lazy, Suspense, useRef } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import { FiFilter, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiX, FiShoppingCart, FiHeart, FiArrowUp } from "react-icons/fi";

// ✅ Updated imports — pull new selectors + thunk from slice
import {
  fetchProducts,
  fetchAvailableFilters,         // ✅ NEW
  selectProducts,
  selectProductsLoading,
  selectProductsTotal,
  selectProductsTotalPages,
  selectAvailableFilters,        // ✅ NEW
  selectFiltersLoading,          // ✅ NEW
  selectFiltersLoaded,           // ✅ NEW
} from '../store/slices/productsSlice';

import CartDrawer from "../components/CartDrawer";
import { addToCart } from '../store/slices/cartSlice';
import { selectCartTotalItems } from '../store/slices/cartSlice';
import SEO from '../components/SEO';

const ProductCard = lazy(() => import("../components/ProductCard"));

// ========== SKELETON COMPONENT ==========
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-8 bg-gray-200 rounded w-full" />
    </div>
  </div>
);

// ========== SIDEBAR CONTENT ==========
const SidebarContent = ({
  filterSections = {},
  selectedFilters,
  setSelectedFilters,
  priceRange,
  setPriceRange,
  handleFilterChange,
  filteredCount,
  isLoadingFilters,
}) => {
  const [openSections, setOpenSections] = useState({});

  // Auto-open all sections with options
  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      Object.keys(filterSections).forEach((key) => {
        if (next[key] === undefined) next[key] = true;
      });
      return next;
    });
  }, [filterSections]);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleReset = () => {
    setSelectedFilters({});
    setPriceRange([0, 3500]);
  };

  const sectionsWithOptions = Object.entries(filterSections).filter(
    ([, options]) => Array.isArray(options) && options.length > 0
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <p className="font-semibold text-gray-600">{filteredCount} products</p>
        <button
          onClick={handleReset}
          className="text-xs text-[#00C2D6] hover:underline font-medium"
        >
          Reset all
        </button>
      </div>
       
      {/* Price Range Filter (currently hidden) */}
      <div className="mb-6 hidden">
        <h3 className="font-bold text-gray-800 text-lg mb-3">Price</h3>
        <input
          type="range"
          min="0"
          max="3500"
          step="50"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00C2D6]"
        />
        <div className="flex justify-between mt-3">
          <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-lg">₹{priceRange[0]}</span>
          <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-lg">₹{priceRange[1]}</span>
        </div>
      </div>

      {/* Loading skeleton for filters */}
      {isLoadingFilters ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-t border-gray-100 pt-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : sectionsWithOptions.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-400 border-t border-gray-100">
          <p>No filters available</p>
          <p className="text-xs mt-1">Add product details to enable filters</p>
        </div>
      ) : (
        sectionsWithOptions.map(([section, options]) => (
          <div key={section} className="border-t border-gray-100 pt-4 mb-4">
            <button
              onClick={() => toggleSection(section)}
              className="flex justify-between items-center w-full text-left font-semibold text-gray-700 hover:text-[#00C2D6] transition"
            >
              <span>{section}</span>
              <span className="text-gray-400 text-xl">
                {openSections[section] ? "−" : "+"}
              </span>
            </button>
            {openSections[section] && (
              <div className="space-y-2 pl-2 mt-3 max-h-56 overflow-y-auto scrollbar-hide">
                {options.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-[#00C2D6] transition"
                  >
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        handleFilterChange(section, opt, e.target.checked)
                      }
                      checked={selectedFilters[section]?.includes(opt) || false}
                      className="rounded border-gray-300 text-[#00C2D6] focus:ring-[#00C2D6]"
                    />
                    <span className="truncate">{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </>
  );
};

// ========== MAIN PRODUCTS PAGE ==========
const ProductsPage = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const isLoading = useSelector(selectProductsLoading);
  const total = useSelector(selectProductsTotal);
  const totalPages = useSelector(selectProductsTotalPages);

  // ✅ NEW — read from Redux
  const availableFilters = useSelector(selectAvailableFilters);
  const isFiltersLoading = useSelector(selectFiltersLoading);
  const filtersLoaded = useSelector(selectFiltersLoaded);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [priceRange, setPriceRange] = useState([0, 3500]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [searchParams] = useSearchParams();

  const categoryId = searchParams.get("category");
  const itemsPerPage = 12;
  const productsContainerRef = useRef(null);

  // ✅ NEW — dispatch filter fetch thunk (once)
  useEffect(() => {
    if (!filtersLoaded) {
      dispatch(fetchAvailableFilters());
    }
  }, [dispatch, filtersLoaded]);

  // ✅ NEW — build filterSections from Redux state
  const filterSections = useMemo(() => {
    if (!availableFilters) return {};

    const sections = {
      // "Quick Filters": availableFilters.tags || [],
      Color: availableFilters.colors || [],
      "Size Range": availableFilters.sizes || [],
      Material: availableFilters.materials || [],
      Personalization: ["Yes", "No"],
      Availability: ["In Stock", "Out of Stock"],
    };

    // Remove empty sections (except static ones)
    Object.keys(sections).forEach((k) => {
      if (
        k !== "Personalization" &&
        k !== "Availability" &&
        (!sections[k] || sections[k].length === 0)
      ) {
        delete sections[k];
      }
    });

    return sections;
  }, [availableFilters]);

  // Scroll to top on page change
  useEffect(() => {
    if (productsContainerRef.current) {
      productsContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  // Back to top button
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Wishlist persistence
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // ========== FETCH PRODUCTS ON FILTER CHANGE ==========
  useEffect(() => {
    const filters = {
      page: currentPage,
      limit: itemsPerPage,
      sort: sortBy,
      category: categoryId || undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 3500 ? priceRange[1] : undefined,
      color: selectedFilters.Color?.length ? selectedFilters.Color.join(',') : undefined,
      size: selectedFilters['Size Range']?.length ? selectedFilters['Size Range'].join(',') : undefined,
      material: selectedFilters.Material?.length ? selectedFilters.Material.join(',') : undefined,
      tags: selectedFilters['Quick Filters']?.length ? selectedFilters['Quick Filters'].join(',') : undefined,
      personalizable: selectedFilters.Personalization?.includes('Yes')
        ? 'true'
        : selectedFilters.Personalization?.includes('No')
        ? 'false'
        : undefined,
      inStock: selectedFilters.Availability?.includes('In Stock')
        ? 'true'
        : selectedFilters.Availability?.includes('Out of Stock')
        ? 'false'
        : undefined,
    };
    dispatch(fetchProducts(filters));
  }, [dispatch, currentPage, sortBy, categoryId, priceRange, selectedFilters]);

  const addToCartHandler = (product, quantity = 1) => {
    dispatch(addToCart({ productId: product.id || product._id, quantity }));
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
    toast.success(
      wishlist.includes(productId) ? "Removed from wishlist" : "Added to wishlist",
      { duration: 1500, style: { background: "#00C2D6", color: "#fff" } }
    );
  };

  const handleFilterChange = (section, value, checked) => {
    setSelectedFilters((prev) => {
      const current = prev[section] || [];
      if (checked) return { ...prev, [section]: [...current, value] };
      return { ...prev, [section]: current.filter((v) => v !== value) };
    });
    setCurrentPage(1);
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating || 0);
    const half = rating % 1 !== 0;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(full)].map((_, i) => (
          <span key={i} className="text-yellow-400">★</span>
        ))}
        {half && <span className="text-yellow-400">½</span>}
        {[...Array(5 - Math.ceil(rating || 0))].map((_, i) => (
          <span key={i} className="text-gray-300">★</span>
        ))}
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12 } },
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const categoryNames = {
    1: "Insulated Tumblers",
    2: "Travel Tumblers",
    3: "Sports Tumblers",
    4: "Coffee Tumblers",
    5: "Limited Edition",
  };
  const categoryName = categoryId ? categoryNames[parseInt(categoryId)] : null;
  const totalItems = useSelector(selectCartTotalItems);

  const activeFilterCount = Object.values(selectedFilters).filter(
    (arr) => Array.isArray(arr) && arr.length > 0
  ).length;

  return (
    <>
      <SEO
        title={categoryName ? `${categoryName} SmoothSip` : "All Products"}
        description={`Browse our collection of ${categoryName ? categoryName.toLowerCase() : "premium"} tumblers.`}
        type="website"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-[1400px] mx-auto px-1 sm:px-6 lg:px-8 py-1 lg:py-6">

          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-1"
          >
            <div className="hidden lg:flex items-center gap-2 text-sm mb-4">
              <Link to="/" className="flex items-center gap-1 text-gray-500 hover:text-[#00C2D6] transition">
                🏠 Home
              </Link>
              <span className="text-gray-300">/</span>
              <span className="font-medium text-gray-700">Products</span>
              {categoryName && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="font-medium text-gray-900">{categoryName}</span>
                </>
              )}
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-3">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-80 bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-fit sticky top-24">
              <SidebarContent
                filterSections={filterSections}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                handleFilterChange={handleFilterChange}
                filteredCount={total}
                isLoadingFilters={isFiltersLoading}
              />
            </aside>

            {/* Mobile Sticky Toolbar */}
            <div className="lg:hidden sticky top-16 z-30 px-1 py-3 mb-4 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="relative flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all whitespace-nowrap"
                >
                  <FiFilter size={15} />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="ml-0.5 bg-[#00C2D6] text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#00C2D6] focus:border-transparent outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="availability">Availability</option>
                  <option value="rating">Top Rated</option>
                </select>

                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    className={`p-2 transition ${viewMode === "grid" ? "bg-[#00C2D6] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                  >
                    <FiGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    className={`p-2 border-l border-gray-200 transition ${viewMode === "list" ? "bg-[#00C2D6] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                  >
                    <FiList size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>{total} products found</span>
                {categoryName && (
                  <span className="font-medium text-[#00C2D6] truncate max-w-[50%]">{categoryName}</span>
                )}
              </div>
            </div>

            {/* Main Content */}
            <main ref={productsContainerRef} className="flex-1">
              <div className="hidden lg:flex justify-between items-center gap-4 mb-8 pb-4 border-b border-gray-200">
                <div className="text-sm text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full">
                  Showing {products.length} of {total} products
                </div>
                <div className="flex items-center gap-5">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-2 bg-white text-sm font-medium focus:ring-2 focus:ring-[#00C2D6]"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="availability">Availability</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-[#00C2D6] text-white shadow-md" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                    >
                      <FiGrid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-[#00C2D6] text-white shadow-md" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                    >
                      <FiList size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                  <FiFilter className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">No products found</h3>
                  <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or reset to see everything.</p>
                  <button
                    onClick={() => {
                      setSelectedFilters({});
                      setPriceRange([0, 3500]);
                      setCurrentPage(1);
                    }}
                    className="px-6 py-2 bg-[#00C2D6] hover:bg-[#00A0B0] text-white text-sm font-medium rounded-xl transition"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6" : "space-y-5"}
                >
                  <Suspense fallback={<SkeletonCard />}>
                    {products.map((product) => (
                      <motion.div key={product.id || product._id} variants={itemVariants}>
                        {viewMode === "grid" ? (
                          <ProductCard product={product} />
                        ) : (
                          <div className="bg-white rounded-2xl shadow-md border p-5 flex flex-col sm:flex-row gap-5 hover:shadow-xl transition">
                            <img src={product.image} alt={product.title} className="w-40 h-40 object-contain bg-gray-50 rounded-xl" />
                            <div className="flex-1">
                              <h3 className="text-xl font-bold">{product.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-2xl font-extrabold text-[#00C2D6]">₹{product.price}</span>
                                {product.oldPrice > product.price && (
                                  <span className="text-gray-400 line-through">₹{product.oldPrice}</span>
                                )}
                                {product.discount > 0 && (
                                  <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">-{product.discount}%</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {renderStars(product.rating)}
                                <span className="text-gray-400 text-xs">({product.reviews})</span>
                              </div>
                              <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                                {product.description || "Premium stainless steel tumbler with vacuum insulation."}
                              </p>
                              <div className="flex gap-3 mt-4">
                                <button
                                  onClick={() => addToCartHandler(product)}
                                  className="flex-1 bg-[#00C2D6] text-white py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00A0B0] transition"
                                >
                                  <FiShoppingCart /> Add to Cart
                                </button>
                                <button
                                  onClick={() => toggleWishlist(product.id || product._id)}
                                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 transition"
                                >
                                  <FiHeart
                                    className={wishlist.includes(product.id || product._id) ? "fill-red-500 text-red-500" : "text-gray-600"}
                                    size={20}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </Suspense>
                </motion.div>
              )}

              {!isLoading && totalPages > 1 && (
                <div className="flex justify-center mt-12 gap-2 flex-wrap">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-lg border bg-white disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    <FiChevronLeft className="mx-auto" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition ${currentPage === page ? "bg-[#00C2D6] text-white shadow-md" : "border bg-white hover:bg-gray-50"}`}
                        >
                          {page}
                        </button>
                      );
                    }
                    if (page === 2 && currentPage > 3)
                      return <span key="ellipsis1" className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                    if (page === totalPages - 1 && currentPage < totalPages - 2)
                      return <span key="ellipsis2" className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                    return null;
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-lg border bg-white disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    <FiChevronRight className="mx-auto" />
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Floating Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#00C2D6] text-white p-4 rounded-lg shadow-lg hover:scale-105 transition"
        >
          <FiShoppingCart size={24} />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-lg w-6 h-6 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>

        {/* Back to Top */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToTop}
              className="fixed bottom-24 right-6 z-40 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition"
            >
              <FiArrowUp size={20} />
            </motion.button>
          )}
        </AnimatePresence>

        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex justify-end"
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className="w-full max-w-sm bg-white h-full overflow-y-auto p-6 shadow-xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Filters</h3>
                  <button onClick={() => setIsMobileFilterOpen(false)}>
                    <FiX size={24} />
                  </button>
                </div>
                <SidebarContent
                  filterSections={filterSections}
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  handleFilterChange={handleFilterChange}
                  filteredCount={total}
                  isLoadingFilters={isFiltersLoading}
                />
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-[#00C2D6] text-white py-3 rounded-xl mt-6 font-semibold hover:bg-[#00A0B0] transition"
                >
                  Apply Filters
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ProductsPage;