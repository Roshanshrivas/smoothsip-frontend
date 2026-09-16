// src/components/admin/products/ProductTabs.jsx
import React from "react";

const tabs = [
  { key: "all", label: "All Products" },
  { key: "active", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "outofstock", label: "Out of Stock" },
];

const ProductTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-wrap items-center gap-1 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === tab.key
              ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ProductTabs;