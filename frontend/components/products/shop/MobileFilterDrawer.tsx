"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: readonly string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onlyInStock: boolean;
  onToggleInStock: (val: boolean) => void;
  sortOption: string;
  onSelectSort: (sort: string) => void;
  onResetFilters: () => void;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  onlyInStock,
  onToggleInStock,
  sortOption,
  onSelectSort,
  onResetFilters,
}: MobileFilterDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filter products drawer"
        >
          {/* Backdrop click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative ml-auto w-4/5 max-w-xs h-full bg-white shadow-2xl flex flex-col z-10 overflow-y-auto"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Filter &amp; Sort</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-lg focus-visible:outline-2 focus-visible:outline-[#01A7E5] cursor-pointer"
                aria-label="Close filters"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-5 space-y-6 flex-1">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">Categories</h3>
                <div className="space-y-1">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          onSelectCategory(cat);
                          onClose();
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-50 text-[#01A7E5] font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">Sort By</h3>
                <select
                  value={sortOption}
                  onChange={(e) => onSelectSort(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-[#01A7E5]"
                >
                  <option value="default">Default Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Customer Rating</option>
                </select>
              </div>

              {/* Availability */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => onToggleInStock(e.target.checked)}
                    className="w-4 h-4 rounded-md text-[#01A7E5] focus:ring-[#01A7E5]"
                  />
                  <span className="text-sm font-medium text-gray-800">In-Stock Only</span>
                </label>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  onResetFilters();
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-[#01A7E5] text-white text-sm font-semibold hover:bg-[#018bc0] transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
