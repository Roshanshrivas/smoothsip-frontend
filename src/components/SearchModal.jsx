// src/components/SearchModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiX, FiSearch, FiArrowRight } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";
import { productService } from "../services/productService";

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // Cache for all products (used for local fallback)
  const allProductsCache = useRef(null);

  // ─── Focus input when modal opens ──────────────────────
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ─── Body scroll lock ──────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // ─── Local case‑insensitive search across fields ──────
  const localSearch = (products, searchTerm) => {
    const lower = searchTerm.toLowerCase();
    return products.filter((p) => {
      const name = (p.title || p.name || "").toLowerCase();
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

  // ─── Debounced search (real API + fallback) ──────────
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        // 1️⃣ Try API search
        const response = await productService.getProducts({
          search: query,
          limit: 10,
          page: 1,
        });

        let products = [];
        if (response && Array.isArray(response)) {
          products = response;
        } else if (response && response.products && Array.isArray(response.products)) {
          products = response.products;
        } else if (response && response.data && Array.isArray(response.data)) {
          products = response.data;
        } else if (response && typeof response === "object") {
          const possibleArray = Object.values(response).find((v) => Array.isArray(v));
          if (possibleArray) products = possibleArray;
        }

        // Map to unified shape
        let mapped = products.map((p) => ({
          id: p.id || p._id || p.productId,
          title: p.name || p.title || "Unnamed",
          price: p.price || 0,
          image: p.images?.[0] || p.mainImage || "https://via.placeholder.com/80",
          description: p.description || "",
          tags: p.tags || [],
          category: p.category?.name || p.category || "",
        }));

        // 2️⃣ If API returned 0, use local fallback (case‑insensitive)
        if (mapped.length === 0) {
          // Fetch all products (cached) if not already loaded
          if (!allProductsCache.current) {
            const allResponse = await productService.getProducts({
              limit: 200, // adjust based on your catalog size
              page: 1,
            });
            let allProducts = [];
            if (allResponse && Array.isArray(allResponse)) {
              allProducts = allResponse;
            } else if (allResponse && allResponse.products && Array.isArray(allResponse.products)) {
              allProducts = allResponse.products;
            } else if (allResponse && allResponse.data && Array.isArray(allResponse.data)) {
              allProducts = allResponse.data;
            } else if (allResponse && typeof allResponse === "object") {
              const possibleArray = Object.values(allResponse).find((v) => Array.isArray(v));
              if (possibleArray) allProducts = possibleArray;
            }
            allProductsCache.current = allProducts.map((p) => ({
              id: p.id || p._id || p.productId,
              title: p.name || p.title || "Unnamed",
              price: p.price || 0,
              image: p.images?.[0] || p.mainImage || "https://via.placeholder.com/80",
              description: p.description || "",
              tags: p.tags || [],
              category: p.category?.name || p.category || "",
            }));
          }

          // Local search (case‑insensitive)
          const localResults = localSearch(allProductsCache.current, query);
          mapped = localResults.slice(0, 10); // limit to 10 for preview
        }

        setResults(mapped);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to fetch results. Please try again.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  // ─── Handlers ──────────────────────────────────────────
  const handleProductClick = () => {
    onClose();
    setQuery("");
    setResults([]);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setError(null);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Modal container */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Search Products</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
              aria-label="Close"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Search input */}
          <div className="p-5 border-b border-gray-100">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for tumblers..."
                className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl focus:border-[#14C6D8] focus:ring-2 focus:ring-[#09B0BE] outline-none transition"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <IoCloseOutline size={20} />
                </button>
              )}
            </div>
            {query && (
              <p className="text-xs text-gray-500 mt-2">
                {loading
                  ? "Searching..."
                  : error
                  ? "Error loading results"
                  : `${results.length} result${results.length !== 1 ? "s" : ""} found`}
              </p>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-5 space-y-4">
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    if (query.trim()) {
                      setLoading(true);
                      setQuery(query + " ");
                      setTimeout(() => setQuery(query), 10);
                    }
                  }}
                  className="mt-4 text-[#14C6D8] hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && results.length === 0 && query && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiSearch className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No products found for "{query}"</p>
                <button
                  onClick={clearSearch}
                  className="mt-4 text-orange-500 hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              results.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={handleProductClick}
                  className="flex gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded-lg bg-white"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-orange-600 font-bold mt-1">₹{product.price}</p>
                  </div>
                  <FiArrowRight className="text-gray-400 self-center" />
                </Link>
              ))
            )}
          </div>

          {/* Footer hint */}
          {results.length > 0 && (
            <div className="border-t border-gray-100 p-4 text-center text-xs text-gray-400">
              Click any result to view product
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;