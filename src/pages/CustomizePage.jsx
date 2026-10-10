// src/pages/CustomizePage.jsx
import React, { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiGrid, FiChevronRight } from "react-icons/fi";
import TumblerCustomizer from "../components/TumblerCustomizer";
import { fetchCustomProducts } from "../store/slices/customProductsSlice";

const CustomizePage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Pull from Redux — no local state, no direct API
  const { items: customProducts, status } = useSelector((s) => s.customProducts);

  useEffect(() => {
    // Thunk skips the request automatically if cached < 1 hour
    dispatch(fetchCustomProducts());
  }, [dispatch]);

  const loading = status === "idle" || status === "loading";

  // ─── Single product view ───
  if (productId && !loading) {
    const match = customProducts.find(
      (cp) => String(cp._id) === String(productId)
    );

    if (match) {
      return (
        <TumblerCustomizer
          products={customProducts}
          loadingProducts={false}
          activeProductId={match._id}
        />
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md text-center border border-gray-100">
          <FiGrid size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            Customize Template Not Found
          </h2>
          <p className="text-gray-500 mt-2">
            This product doesn't have a customization template available.
          </p>
          <Link
            to="/allproducts"
            className="mt-6 inline-block px-6 py-2 bg-[#00C2D6] text-white rounded-lg hover:bg-[#00A0B0] transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Grid view ───
  if (customProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md text-center border border-gray-100">
          <FiGrid size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">No Custom Templates Yet</h2>
          <p className="text-gray-500 mt-2">
            There are no customizable tumblers right now.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block px-6 py-2 bg-[#00C2D6] text-white rounded-lg hover:bg-[#00A0B0] transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Choose Your <span className="text-[#00C2D6]">Custom Tumbler</span>
            </h1>
            <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
              Select a base design and personalise it with your own text, logo, and fonts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {customProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/customize/${product._id}`)}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-[#00C2D6]/30"
              >
                <div className="relative h-56 bg-gray-100 flex items-center justify-center p-4">
                  <img
                    src={product.mainImage || "https://placehold.co/400x400/FFF4E6/78350F?text=No+Image"}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-bold text-[#00C2D6]">
                      ₹{product.basePrice}
                    </span>
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      Customise{" "}
                      <FiChevronRight
                        size={14}
                        className="group-hover:translate-x-1 transition"
                      />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizePage;