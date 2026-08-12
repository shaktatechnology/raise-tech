"use client";

import React, { useState, useMemo } from 'react';
import { SHOP_PRODUCTS_DATA, SHOP_CATEGORIES } from '@/lib/data/shopProductsData';
import ShopProductCard from './ShopProductCard';
import MobileFilterDrawer from './MobileFilterDrawer';

const ITEMS_PER_PAGE = 8;

export default function ShopCatalog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('default');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = SHOP_PRODUCTS_DATA.filter((p) => {
      const matchCat = category === 'All' || p.category === category;
      const query = search.trim().toLowerCase();
      const matchSearch =
        query === '' ||
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query));
      const matchStock = !onlyInStock || p.inStock;
      return matchCat && matchSearch && matchStock;
    });

    if (sortOption === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [search, category, sortOption, onlyInStock]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, page]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setSortOption('default');
    setOnlyInStock(false);
    setPage(1);
  };

  return (
    <section className="w-full py-12 sm:py-16 bg-[#f2fcff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 sticky top-24 space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#404040] mb-4">
                  Product Categories
                </h3>
                <ul className="space-y-1">
                  {SHOP_CATEGORIES.map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <li key={cat}>
                        <button
                          onClick={() => {
                            setCategory(cat);
                            setPage(1);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-50 text-[#01A7E5] font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {cat}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* In-Stock Filter */}
              <div className="pt-4 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => {
                      setOnlyInStock(e.target.checked);
                      setPage(1);
                    }}
                    className="w-4 h-4 rounded-md text-[#01A7E5] focus:ring-[#01A7E5]"
                  />
                  <span className="text-sm font-medium text-gray-700">In-Stock Only</span>
                </label>
              </div>

              {/* Reset Filters */}
              {(category !== 'All' || search !== '' || onlyInStock) && (
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2 text-xs font-semibold text-[#01A7E5] hover:text-[#018bc0] hover:underline"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Catalog View */}
          <main className="flex-1">
            {/* Top Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
              {/* Search Box */}
              <div className="relative flex-1">
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search thermal rolls, label stickers, paper sizes..."
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#01A7E5] shadow-xs text-gray-800"
                />
              </div>

              {/* Controls Group */}
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileDrawerOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50"
                >
                  <svg className="w-4 h-4 text-[#01A7E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Filter</span>
                </button>

                {/* Sort Selector */}
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-[#01A7E5] shadow-xs cursor-pointer"
                >
                  <option value="default">Sort: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Results Count Summary */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-6 px-1">
              <span>
                Showing {filteredProducts.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0}–
                {Math.min(page * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} items
              </span>
              {category !== 'All' && (
                <span className="font-semibold text-[#01A7E5]">
                  Active Category: {category}
                </span>
              )}
            </div>

            {/* Products Grid / Empty State */}
            {paginatedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-gray-100 my-4">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Matching Products Found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  We couldn&apos;t find any paper rolls or label stickers matching your search query or active filter settings.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-[#01A7E5] text-white font-semibold text-sm rounded-xl hover:bg-[#018bc0] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {paginatedProducts.map((product) => (
                  <ShopProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
                        page === p
                          ? 'bg-[#01A7E5] text-white shadow-xs'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Slide-Over Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        categories={SHOP_CATEGORIES}
        selectedCategory={category}
        onSelectCategory={(cat) => {
          setCategory(cat);
          setPage(1);
        }}
        onlyInStock={onlyInStock}
        onToggleInStock={(val) => {
          setOnlyInStock(val);
          setPage(1);
        }}
        sortOption={sortOption}
        onSelectSort={(s) => setSortOption(s)}
        onResetFilters={handleResetFilters}
      />
    </section>
  );
}
