// src/components/admin/FilterBar.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiX,
  FiFilter,
  FiPlus,
  FiChevronDown,
  FiCheck,
  FiDownload
} from "react-icons/fi";

// Simple Button component
const Button = ({ children, onClick, className = "" }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${className}`}
  >
    {children}
  </motion.button>
);

// FilterDropdown component (unchanged)
const FilterDropdown = ({ label, icon: Icon, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isActive = value !== "all" && value !== "";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-3 py-2 text-[13px] rounded-lg transition-all duration-150 ring-1 ring-inset font-medium ${
          isActive
            ? "bg-orange-50 text-orange-600 ring-orange-200"
            : "bg-white text-gray-600 ring-gray-200 hover:ring-gray-300 hover:text-gray-800 hover:bg-gray-50"
        }`}
      >
        {Icon && <Icon size={12} strokeWidth={1.5} />}
        <span>{selectedOption?.label || label}</span>
        <FiChevronDown size={12} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-[100] min-w-[180px] bg-white rounded-xl shadow-lg ring-1 ring-gray-200 py-1.5 animate-in fade-in-0 zoom-in-95 duration-150">
          {options.map(option => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                onClick={() => { onChange(option.value); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors ${
                  isSelected
                    ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40 font-semibold"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                {option.icon && <option.icon size={14} strokeWidth={1.8} className="text-gray-500" />}
                {option.dot && (
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ring-1 ring-inset ring-black/5 ${option.dot}`} />
                )}
                <span className="flex-1 text-left">{option.label}</span>
                {isSelected && <FiCheck size={14} strokeWidth={2.5} className="text-orange-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ========== SKELETON COMPONENT ==========
const FilterBarSkeleton = () => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 mb-6 animate-pulse">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Left side skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gray-200 rounded-xl" />
        <div>
          <div className="h-5 bg-gray-200 rounded w-32 mb-1.5" />
          <div className="h-3 bg-gray-200 rounded w-40" />
        </div>
      </div>

      {/* Right side skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input skeleton */}
        <div className="relative flex-1 min-w-[200px]">
          <div className="w-full h-10 bg-gray-200 rounded-lg" />
        </div>

        {/* Desktop filters + buttons skeleton */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-24 h-9 bg-gray-200 rounded-lg" />
          <div className="w-24 h-9 bg-gray-200 rounded-lg" />
          <div className="w-16 h-9 bg-gray-200 rounded-lg" />
          <div className="w-28 h-9 bg-gray-200 rounded-lg" />
        </div>

        {/* Mobile toggle skeleton */}
        <div className="sm:hidden w-full h-10 bg-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
);

// ========== MAIN COMPONENT ==========
const FilterBar = ({
  title = "Filter Items",
  subtitle = "Filter and manage",
  searchTerm = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onClearFilters,
  addButton = null,
  exportButton = null,
  containerClassName = "",
  isLoading = false, // ✅ new prop
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const hasActiveFilters = searchTerm || filters.some(f => f.value !== "all" && f.value !== "");

  // ✅ Show skeleton when loading
  if (isLoading) {
    return <FilterBarSkeleton />;
  }

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 mb-6 ${containerClassName}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Title + Filter Indicator */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md"
            >
              <FiFilter className="text-white" size={18} />
            </motion.div>
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>

        {/* Right: Search + Filters + Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 group/search min-w-[200px]">
            <FiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within/search:text-orange-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-[14px] bg-gray-50 border border-gray-200/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-sm hover:shadow"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          {/* Desktop Filters & Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {filters.map(filter => (
              <FilterDropdown
                key={filter.key}
                label={filter.label}
                icon={filter.icon}
                options={filter.options}
                value={filter.value}
                onChange={filter.onChange}
              />
            ))}
            {exportButton && (
              <button
                onClick={exportButton.onClick}
                className="h-9 px-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-1.5 text-sm text-gray-700"
              >
                <FiDownload size={16} />
                {exportButton.label}
              </button>
            )}
            {addButton && (
              <Button onClick={addButton.onClick} className="flex items-center gap-2 whitespace-nowrap">
                {addButton.icon || <FiPlus size={18} />}
                {addButton.label}
              </Button>
            )}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1 px-2 py-2"
              >
                <FiX size={14} />
                Clear
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="sm:hidden inline-flex items-center justify-between px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-white transition-all group"
          >
            <span className="flex items-center gap-2">
              <FiFilter className="text-orange-500" size={16} />
              <span>{showMobileFilters ? "Hide filters" : "Show filters"}</span>
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${showMobileFilters ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Expandable Filters Panel */}
      {showMobileFilters && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 sm:hidden space-y-3"
          >
            {filters.map(filter => (
              <FilterDropdown
                key={filter.key}
                label={filter.label}
                icon={filter.icon}
                options={filter.options}
                value={filter.value}
                onChange={filter.onChange}
              />
            ))}
            <div className="flex flex-col gap-2 pt-2">
              {exportButton && (
                <button
                  onClick={exportButton.onClick}
                  className="w-full py-2.5 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                  <FiDownload size={16} /> {exportButton.label}
                </button>
              )}
              {addButton && (
                <Button onClick={addButton.onClick} className="w-full flex items-center justify-center gap-2">
                  {addButton.icon || <FiPlus size={18} />}
                  {addButton.label}
                </Button>
              )}
              {hasActiveFilters && (
                <button
                  onClick={onClearFilters}
                  className="w-full text-sm text-orange-600 hover:text-orange-700 flex items-center justify-center gap-1"
                >
                  <FiX size={14} /> Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default FilterBar;