// src/components/MobileEcommerceUI.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Mic,
  MapPin,
  ChevronRight,
  ArrowRight,
  Truck,
  ShieldCheck,
  Snowflake,
  Flame,
  X,
  Loader,
  RefreshCw,
  Award,
  RotateCcw,
} from "lucide-react";
import { publicCategoryService } from "../services/publicCategoryService";
import { productService } from "../services/productService";
import { addressService } from "../services/addressService"; // ✅ Added
import { debounce } from "lodash";
import toast from "react-hot-toast";

// ─── Helper to extract products from any API response ──────
const extractProducts = (response) => {
  if (Array.isArray(response)) return response;
  if (response?.products && Array.isArray(response.products))
    return response.products;
  if (response?.data?.products && Array.isArray(response.data.products))
    return response.data.products;
  if (response?.data && Array.isArray(response.data)) return response.data;
  if (response && typeof response === "object") {
    const possibleArray = Object.values(response).find((v) => Array.isArray(v));
    if (possibleArray) return possibleArray;
  }
  return [];
};

export default function MobileEcommerceUI() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const activeUser = user?.user || user;

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHoveringBanner, setIsHoveringBanner] = useState(false);
  const autoScrollRef = useRef(null);

  // ─── Categories state ──────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // ─── Address state (fetched from API) ─────────────────────
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState(null);

  // ─── Cache for all products (local fallback) ──────────────
  const allProductsCache = useRef(null);

  // ─── Hero Banner Slides ──────────────────────────────────
  const bannerSlides = [
    {
      id: 1,
      tag: "SUMMER COLLECTION",
      title: "Stay Hydrated. Anywhere.",
      subtitle: "Premium tumblers for every sip of your day.",
      // Full banner graphic image
      bannerImage:
        "https://res.cloudinary.com/dbkpwluh0/image/upload/v1783755632/ChatGPT_Image_Jul_11_2026_01_10_16_PM_ilivvu.png", // Replace with your uploaded image URL or local asset path e.g. '/images/banner1.png'
      cta: "Shop Now",
      link: "/shop",
    },
    {
      id: 2,
      tag: "NEW ARRIVALS",
      title: "Premium Steel. Timeless Design.",
      subtitle: "Eco-friendly tumblers for conscious living.",
      bannerImage:
        "https://res.cloudinary.com/dbkpwluh0/image/upload/v1784353050/ChatGPT_Image_Jul_18_2026_11_07_14_AM_abspmv.png",
      cta: "Explore Now",
      link: "/new-arrivals",
    },
    {
      id: 3,
      tag: "BEST SELLERS",
      title: "Most Loved. Most Refreshing.",
      subtitle: "Join 12,000+ happy customers worldwide.",
      bannerImage:
        "https://res.cloudinary.com/dbkpwluh0/image/upload/v1786093480/ChatGPT_Image_Jul_9_2026_12_31_38_PM_kgus5z.png",
      cta: "View Best Sellers",
      link: "/best-sellers",
    },
  ];

  // ─── Fetch real categories ──────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        let data;
        if (
          publicCategoryService &&
          typeof publicCategoryService.getCategories === "function"
        ) {
          data = await publicCategoryService.getCategories();
        } else {
          throw new Error("publicCategoryService not available");
        }
        const formatted = data.map((cat, idx) => ({
          name: cat.name,
          img: cat.image || "https://via.placeholder.com/150",
          active: idx === 0,
          id: cat.id,
          slug: cat.slug,
        }));
        setCategories(formatted);
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast.error("Could not load categories");
        setCategories(getFallbackCategories());
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const getFallbackCategories = () => [
    {
      name: "All Tumblers",
      img: "https://images.unsplash.com/photo-1589365267167-27b2c5890b0e?w=150&auto=format&fit=crop&q=80",
      active: true,
    },
    {
      name: "Coffee",
      img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop&q=80",
    },
    {
      name: "Kids",
      img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=150&auto=format&fit=crop&q=80",
    },
    {
      name: "Office",
      img: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=150&auto=format&fit=crop&q=80",
    },
    {
      name: "Sports",
      img: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=150&auto=format&fit=crop&q=80",
    },
    { name: "Gifts", isGift: true },
    { name: "More", isMore: true },
  ];

  // ─── Auto-scroll Logic ──────────────────────────────────
  useEffect(() => {
    if (isHoveringBanner) {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
        autoScrollRef.current = null;
      }
      return;
    }
    autoScrollRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isHoveringBanner, bannerSlides.length]);

  const goToSlide = (index) => setCurrentSlide(index);

  // ─── Fetch addresses when authenticated ───────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setAddresses([]);
      setDefaultAddress(null);
      setAddressError(null);
      return;
    }

    const fetchUserAddresses = async () => {
      try {
        setLoadingAddresses(true);
        setAddressError(null);
        const data = await addressService.fetchAddresses();
        setAddresses(data);
        // Find default address (isDefault flag) or use the first
        const defaultAddr =
          data.find((addr) => addr.isDefault) || data[0] || null;
        setDefaultAddress(defaultAddr);
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
        setAddressError("Could not load delivery address.");
        toast.error("Could not load your address");
        setAddresses([]);
        setDefaultAddress(null);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchUserAddresses();
  }, [isAuthenticated]);

  // ─── Local case‑insensitive search across multiple fields ──
  const localSearch = (products, searchTerm) => {
    const lower = searchTerm.toLowerCase();
    return products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const tags = (p.tags || []).join(" ").toLowerCase();
      const category = (p.category?.name || p.category || "").toLowerCase();
      return (
        name.includes(lower) ||
        desc.includes(lower) ||
        tags.includes(lower) ||
        category.includes(lower)
      );
    });
  };

  // ─── Search Logic (with fallback) ─────────────────────────
  const performSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setSearchLoading(false);
        setSearchError(null);
        return;
      }
      setSearchLoading(true);
      setSearchError(null);

      try {
        // 1️⃣ Try API search
        const response = await productService.getProducts({
          search: query,
          limit: 10,
          page: 1,
        });

        let products = extractProducts(response);
        let mapped = products.map((p) => ({
          id: p.id || p._id || p.productId || "",
          name: p.name || p.title || "Unnamed",
          price: p.price || 0,
          images: p.images || (p.mainImage ? [p.mainImage] : []),
          description: p.description || "",
          tags: p.tags || [],
          category: p.category?.name || p.category || "",
        }));

        // 2️⃣ If API returned 0 results, use local fallback
        if (mapped.length === 0) {
          // Fetch all products (cached) if not already loaded
          if (!allProductsCache.current) {
            const allResponse = await productService.getProducts({
              limit: 200, // adjust based on your catalog size
              page: 1,
            });
            const allProducts = extractProducts(allResponse);
            allProductsCache.current = allProducts.map((p) => ({
              id: p.id || p._id || p.productId || "",
              name: p.name || p.title || "Unnamed",
              price: p.price || 0,
              images: p.images || (p.mainImage ? [p.mainImage] : []),
              description: p.description || "",
              tags: p.tags || [],
              category: p.category?.name || p.category || "",
            }));
          }

          // Local search (case‑insensitive)
          const localResults = localSearch(allProductsCache.current, query);
          mapped = localResults.slice(0, 10); // limit to 10 for preview
        }

        setSearchResults(mapped);
      } catch (err) {
        console.error("❌ Search error:", err);
        setSearchError("Failed to fetch results. Please try again.");
        setSearchResults([]);
        // Dev fallback mock
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ Using mock search results (dev only)");
          setSearchResults([
            {
              id: "1",
              name: `Mock Product 1 for "${query}"`,
              price: 599,
              images: ["https://via.placeholder.com/50"],
            },
            {
              id: "2",
              name: `Mock Product 2 for "${query}"`,
              price: 799,
              images: ["https://via.placeholder.com/50"],
            },
          ]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    [],
  );

  useEffect(() => {
    performSearch(searchQuery);
    return () => performSearch.cancel();
  }, [searchQuery, performSearch]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
    setSearchLoading(false);
  };

  // ─── Location / Address Helpers (uses fetched defaultAddress) ──
  const getLocationDisplay = () => {
    if (!isAuthenticated) {
      return {
        name: "Sign in to add address",
        city: "Add delivery location to check extra discount",
        isLoginRequired: true,
      };
    }
    if (loadingAddresses) {
      return {
        name: activeUser?.name || "User",
        city: "Loading address...",
        isLoading: true,
      };
    }
    if (addressError) {
      return {
        name: activeUser?.name || "User",
        city: "Could not load address",
        hasError: true,
      };
    }
    if (!defaultAddress) {
      return {
        name: activeUser?.name || "User",
        city: "Add delivery address",
        isAddRequired: true,
      };
    }
    // Address exists: show city + pincode
    // const address = defaultAddress.address || '';
    const city = defaultAddress.city || "";
    const pincode = defaultAddress.pinCode || "";
    const display =
      city && pincode ? `${city}, ${pincode}` : city || pincode || "Address";
    return {
      //   name: activeUser?.name || 'User',
      city: display,
      fullAddress: display,
      isAddressPresent: true,
    };
  };

  const locationInfo = getLocationDisplay();
  const handleLocationChange = () => {
    if (!isAuthenticated) navigate("/login");
    else navigate("/dashboard/addresses");
  };

  // ─── Render Inline Search Results ────────────────────────
  const renderSearchResults = () => {
    if (!searchQuery.trim()) return null;

    if (searchLoading) {
      return (
        <div className="flex justify-center items-center py-4">
          <Loader className="w-5 h-5 text-[#00A9C0] animate-spin" />
          <span className="ml-2 text-sm text-gray-400">Searching...</span>
        </div>
      );
    }

    if (searchError) {
      return (
        <div className="py-4 text-center text-sm text-red-500">
          {searchError}
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="py-4 text-center text-sm text-gray-400">
          No products found for "{searchQuery}"
        </div>
      );
    }

    return (
      <>
        <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
          {searchResults.map((product) => (
            <div
              key={product.id}
              onClick={() => {
                navigate(`/product/${product.id}`);
                clearSearch();
              }}
              className="flex items-center gap-3 p-3 hover:bg-[#F4F5F7] cursor-pointer transition-colors"
            >
              <img
                src={product.images?.[0] || "https://via.placeholder.com/50"}
                alt={product.name}
                className="w-10 h-10 object-cover rounded-lg"
                loading="lazy"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500">₹{product.price}</p>
              </div>
            </div>
          ))}
        </div>
        {searchResults.length > 0 && (
          <div className="text-center pt-2 border-t border-gray-100">
            <button
              onClick={() => {
                navigate(
                  `/allproducts?search=${encodeURIComponent(searchQuery)}`,
                );
                clearSearch();
              }}
              className="text-xs text-[#00A9C0] font-medium hover:underline"
            >
              View all results
            </button>
          </div>
        )}
      </>
    );
  };
  return (
    <div className="bg-white mb-8 flex justify-center items-center p-0 sm:py-6">
      <div className="w-full sm:w-[390px] bg-white sm:rounded-[40px] shadow-none sm:shadow-2xl overflow-hidden border-0 sm:border border-gray-100 flex flex-col">
        {/* ─── Clean Outlined Search Bar ───────────────────────── */}
        <div className="px-3 pt-3 pb-2 bg-white">
          <div className="relative flex items-center">
            {/* Left Search Icon */}
            <Search className="absolute left-4 w-5 h-5 text-[#8C98A9] pointer-events-none stroke-[2.2]" />

            {/* Outlined Search Input */}
            <input
              type="text"
              placeholder="Search for Sarees, Kurtis, Cosmetics, etc."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className={`w-full bg-white text-[#1E293B] text-[14px] font- pl-11 pr-10 py-3.5 rounded-xl border border-[#D5DCED] focus:border-[#00A9C0] focus:outline-none placeholder-gray-400 transition-colors duration-200 ${
                isSearchFocused
                  ? "border-[#00A9C0] ring-1 ring-[#00A9C0]/20"
                  : ""
              }`}
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3.5 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Inline Search Results */}
          {searchQuery.trim() && (
            <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-2 animate-fadeIn z-50">
              {renderSearchResults()}
            </div>
          )}
        </div>

        {/* ─── Minimal Deliver To Bar ─── */}
        <div className="w-full bg-[#14C6D8]/5 px-5 py-2.5 flex items-center justify-between border-b border-gray-100">
          <button
            onClick={handleLocationChange}
            className="flex items-center space-x-2 text-left hover:opacity-80 transition-opacity w-full"
          >
            {/* Location Pin Icon */}
            <div className="flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-[#f9f8ff] fill-[#8BAEED]" />
            </div>

            {/* Text Label */}
            <div className="flex items-center space-x-1.5 text-xs text-[#52637A] font-normal truncate">
              {!isAuthenticated || !defaultAddress ? (
                <span className="font-medium text-[#1E293B]">
                  Select delivery location
                </span>
              ) : (
                <>
                  <span>Delivering to</span>
                  <span className="font-semibold text-[#1E293B]">
                    {locationInfo.isAddressPresent
                      ? locationInfo.fullAddress
                      : locationInfo.city}
                  </span>
                </>
              )}
            </div>

            {/* Right Chevron Arrow */}
            <ChevronRight className="w-3.5 h-3.5 text-[#334155] stroke-[2.5] flex-shrink-0 ml-auto" />
          </button>
        </div>

        {/* ─── Deliver To Section (unchanged design) ────── */}
        <div className="hidden px-4 py-2 bg-white">
          <div className="bg-[#F8F9FB] shadow-md border border-gray-100 rounded-xl p-2 flex items-center justify-between hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-[#E0F4F7] flex items-center justify-center text-[#00A9C0] flex-shrink-0">
                <MapPin className="w-5 h-5 fill-[#00A9C0] text-white" />
              </div>
              <div>
                <p className="text-[12px] text-gray-400 font-medium">
                  Deliver to
                </p>
                {/* <h4 className="text-[13px] font-bold text-gray-800 leading-tight">
                  {locationInfo.name}
                </h4> */}
                <p className="text-[11px] font-bold text-gray-500">
                  {locationInfo.isAddressPresent
                    ? locationInfo.fullAddress
                    : locationInfo.city}
                </p>
              </div>
            </div>
            <button
              onClick={handleLocationChange}
              className="flex items-center text-[#00A9C0] text-[10px] font-bold hover:opacity-80 transition-opacity"
            >
              {locationInfo.isLoginRequired ? "Login" : "Change"}
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>

        {/* ─── Categories (Dynamic) ────────────────────── */}
        <div className="px-4 py-3 bg-white">
          {loadingCategories ? (
            <div className="flex justify-center py-2">
              <div className="w-6 h-6 border-2 border-[#00A9C0] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex justify-between items-start gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center flex-shrink-0 w-[44px] group cursor-pointer"
                >
                  <div
                    className={`w-[44px] h-[44px] rounded-full p-[2px] flex items-center justify-center transition-all duration-200 ${cat.active ? "border-2 border-[#00A9C0] shadow-sm" : "border border-transparent group-hover:border-gray-200"}`}
                  >
                    {cat.isGift ? (
                      <div className="w-full h-full rounded-full bg-[#EBF5F6] flex items-center justify-center text-lg hover:scale-110 transition-transform">
                        🎁
                      </div>
                    ) : cat.isMore ? (
                      <div className="w-full h-full rounded-full bg-[#EBF5F6] flex items-center justify-center hover:scale-110 transition-transform">
                        <div className="grid grid-cols-2 gap-1">
                          <span className="w-1.5 h-1.5 bg-[#00A9C0] rounded-full"></span>
                          <span className="w-1.5 h-1.5 bg-[#00A9C0] rounded-full"></span>
                          <span className="w-1.5 h-1.5 bg-[#00A9C0] rounded-full"></span>
                          <span className="w-1.5 h-1.5 bg-[#00A9C0] rounded-full"></span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={cat.img}
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium mt-1.5 text-center leading-tight transition-colors ${cat.active ? "text-[#00A9C0]" : "text-gray-700 group-hover:text-[#00A9C0]"}`}
                  >
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Hero Banner Section ──────────────────────── */}
        <div
          className="px-2 py-2 bg-white"
          onMouseEnter={() => setIsHoveringBanner(true)}
          onMouseLeave={() => setIsHoveringBanner(false)}
        >
          <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 h-[210px]">
            {/* Slider Track */}
            <div
              className="flex transition-transform duration-700 ease-out h-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {bannerSlides.map((slide) => (
                <div
                  key={slide.id}
                  className="min-w-full h-full relative flex-shrink-0 bg-cover bg-center overflow-hidden"
                  style={{
                    backgroundImage: `url(${slide.bannerImage})`,
                  }}
                >
                  {/* Subtle overlay for enhanced text readability if image background is bright */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent w-3/4 z-0 pointer-events-none" />

                  {/* Foreground Text & Action Content */}
                  <div className="relative z-10 p-1 h-full flex flex-col justify-between max-w-[210px]">
                    {/* Top Tag Badge */}
                    {/* <div>
                      <span className="inline-block bg-white/90 backdrop-blur-md text-[#00A9C0] text-[7px] font-bold tracking-wider px-2 py-1 rounded-full uppercase shadow-sm border border-[#00A9C0]/10">
                        {slide.tag}
                      </span>
                    </div> */}

                    {/* Middle Title & Subtitle */}
                    {/* <div className="">
                      <h2 className="text-[18px] font-extrabold text-[#111827] leading-[1.15] tracking-tight mb-1.5">
                        {slide.title.split(" ").map((word, i) => {
                          const isHighlight =
                            word === "Hydrated." ||
                            word === "Steel." ||
                            word === "Refreshing.";
                          return isHighlight ? (
                            <span key={i} className="text-[#00A9C0]">
                              {word}{" "}
                            </span>
                          ) : (
                            <span key={i}>{word} </span>
                          );
                        })}
                      </h2>
                      <p className="text-[11px] text-gray-600 leading-snug font-normal line-clamp-2">
                        {slide.subtitle}
                      </p>
                    </div> */}

                    {/* Bottom CTA Button */}
                    {/* <div className="pb-1">
                      <button
                        onClick={() => navigate(slide.link || "/shop")}
                        className="bg-[#00A9C0] hover:bg-[#0092a8] text-white text-[12px] font-bold px-5 py-2.5 rounded-2xl flex items-center space-x-2 shadow-md shadow-[#00A9C0]/30 transition-all hover:scale-105 active:scale-95"
                      >
                        <span>{slide.cta}</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div> */}
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Pagination Dots */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-30">
              {bannerSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    currentSlide === index
                      ? "w-5 h-2 bg-[#00A9C0]"
                      : "w-2 h-2 bg-white/80 hover:bg-white shadow-xs"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ─── Features / Benefits Footer Bar ──────────── */}
        <div className="px-2 py-3 mb-4 bg-white">
          <div className="bg-[#FAFDFD] border border-[#EAF4F6] rounded-lg p-1 flex items-center justify-between text-center shadow-2xs">
            {/* 1. Free Shipping */}
            <div className="flex flex-col items-center flex-1 border-r border-[#EBF2F4] px-1">
              <div className="w-9 h-9 rounded-full bg-[#E3F6F8] flex items-center justify-center mb-2.5">
                <Truck className="w-4 h-4 text-[#00A9C0]" />
              </div>
              <span className="text-[10px] font-bold text-[#1E293B] leading-tight">
                Free Shipping
              </span>
              <span className="text-[10px] font-bold text-[#1E293B] leading-tight mt-0.5">
                above ₹499
              </span>
            </div>

            {/* 2. Secure Payments */}
            <div className="flex flex-col items-center flex-1 border-r border-[#EBF2F4] px-1">
              <div className="w-9 h-9 rounded-full bg-[#E3F6F8] flex items-center justify-center mb-2.5">
                <ShieldCheck className="w-4 h-4 text-[#00A9C0]" />
              </div>
              <span className="text-[10px] font-bold text-[#1E293B] leading-tight">
                Secure
              </span>
              <span className="text-[10px] font-bold text-[#1E293B] leading-tight mt-0.5">
                Payments
              </span>
            </div>

            {/* 3. Easy Returns */}
            <div className="flex flex-col items-center flex-1 border-r border-[#EBF2F4] px-1">
              <div className="w-9 h-9 rounded-full bg-[#E3F6F8] flex items-center justify-center mb-2.5">
                <RotateCcw className="w-4 h-4 text-[#00A9C0]" />
              </div>
              <span className="text-[10px] font-bold text-[#1E293B] leading-tight">
                Easy Returns
              </span>
              <span className="text-[10px] font-bold text-[#1E293B] leading-tight mt-0.5">
                7 Days
              </span>
            </div>

            {/* 4. Premium Quality */}
            <div className="flex flex-col items-center flex-1 px-1">
              <div className="w-9 h-9 rounded-full bg-[#E3F6F8] flex items-center justify-center mb-2.5">
                <Award className="w-4 h-4 text-[#00A9C0]" />
              </div>
              <span className="text-[10px] font-bold text-[#1E293B] leading-tight">
                Premium
              </span>
              <span className="text-[10px] font-bold text-[#1E293B] leading-tight mt-0.5">
                Quality
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .animate-bounce {
          animation: bounce 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
