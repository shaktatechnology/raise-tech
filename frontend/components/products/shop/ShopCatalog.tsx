"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { fetchApi, getImageUrl as resolveImageUrl } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import MobileFilterDrawer from './MobileFilterDrawer';
import StaggerGroup from '@/components/motion/StaggerGroup';
import StaggerItem from '@/components/motion/StaggerItem';

const ITEMS_PER_PAGE = 16;

export default function ShopCatalog() {
  const { addItem, isLoading: isCartLoading, isUpdating: isCartUpdating } = useCart();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<string>('default');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi<{ status: string; data: Product[] }>("/products");
        setProducts(res.data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load products.");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const getImageUrl = (path: string | null) => {
    return resolveImageUrl(path) || "/placeholder.jpg";
  };

  const calculateDiscountedPrice = (product: Product) => {
    const price = Number(product.original_price);
    if (!product.discount_type || !product.discount_value) return price;
    if (product.discount_type === "percentage") {
      return Math.max(0, price - price * (Number(product.discount_value) / 100));
    }
    if (product.discount_type === "fixed") {
      return Math.max(0, price - Number(product.discount_value));
    }
    return price;
  };

  const getDiscountPercent = (product: Product) => {
    if (!product.discount_type || !product.discount_value) return null;
    if (product.discount_type === "percentage") return Math.round(Number(product.discount_value));
    if (product.discount_type === "fixed") {
      const original = Number(product.original_price);
      if (original <= 0) return null;
      return Math.round((Number(product.discount_value) / original) * 100);
    }
    return null;
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    if (product.stock_quantity <= 0 || isCartLoading || isCartUpdating) return;

    try {
      await addItem({
        id: String(product.id),
        productId: product.id,
        productSlug: product.slug,
        name: product.title,
        category: "Shop",
        price: calculateDiscountedPrice(product),
        quantity: 1,
        image: getImageUrl(product.featured_image),
        inStock: product.stock_quantity > 0,
      });

      setAddedProductId(product.id);
      setTimeout(() => setAddedProductId(null), 1600);
    } catch (cartError) {
      toast.error(
        cartError instanceof Error ? cartError.message : "Failed to add this product to your cart."
      );
    }
  };

  // Filter and sort
  const filteredProducts = useMemo(() => {
    let list = products.filter((p: Product) => {
      const query = search.trim().toLowerCase();
      const matchSearch =
        query === '' ||
        p.title.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.short_description && p.short_description.toLowerCase().includes(query));
      const matchStock = !onlyInStock || p.stock_quantity > 0;
      const matchActive = p.is_active === undefined || p.is_active;
      return matchSearch && matchStock && matchActive;
    });

    if (sortOption === 'price-asc') {
      list = [...list].sort((a, b) => calculateDiscountedPrice(a) - calculateDiscountedPrice(b));
    } else if (sortOption === 'price-desc') {
      list = [...list].sort((a, b) => calculateDiscountedPrice(b) - calculateDiscountedPrice(a));
    }

    return list;
  }, [products, search, sortOption, onlyInStock]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, page]);

  const handleResetFilters = () => {
    setSearch('');
    setSortOption('default');
    setOnlyInStock(false);
    setPage(1);
  };

  const CATEGORIES = ['All'] as readonly string[];

  return (
    <section className="w-full py-12 sm:py-16 bg-[#f2fcff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 sticky top-24 space-y-6">
              {/* In-Stock Filter */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#404040] mb-4">
                  Filters
                </h3>
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
              {(search !== '' || onlyInStock) && (
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
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-gray-100 my-4">
                <div className="w-8 h-8 border-3 border-[#01A7E5] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Loading products from catalog...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center my-4">
                <div className="text-3xl mb-3">⚠️</div>
                <p className="text-sm text-rose-700 font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 transition"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Results Count Summary */}
            {!loading && !error && (
              <div className="flex items-center justify-between text-xs text-gray-500 mb-6 px-1">
                <span>
                  Showing {filteredProducts.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0}–
                  {Math.min(page * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} items
                </span>
              </div>
            )}

            {/* Products Grid / Empty State */}
            {!loading && !error && (
              <>
                {paginatedProducts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-gray-100 my-4">
                    <div className="text-5xl mb-4">📦</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Matching Products Found</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                      We couldn&apos;t find any products matching your search query or active filter settings.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-6 py-2.5 bg-[#01A7E5] text-white font-semibold text-sm rounded-xl hover:bg-[#018bc0] transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <StaggerGroup key={`${page}-${sortOption}-${onlyInStock}`} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {paginatedProducts.map((product) => {
                      const discountedPrice = calculateDiscountedPrice(product);
                      const discountPercent = getDiscountPercent(product);
                      const inStock = product.stock_quantity > 0;
                      const isAdded = addedProductId === product.id;

                      return (
                        <StaggerItem key={product.id}>
                          <div
                            className="bg-white rounded-2xl shadow-xs hover:shadow-xl border border-gray-100/90 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between h-full overflow-hidden group"
                          >
                            {/* Product Image */}
                            <div className="relative w-full h-48 bg-slate-50 overflow-hidden flex items-center justify-center p-4">
                              <Link href={`/products/shop/${product.slug}`} className="relative w-full h-full block">
                                <Image
                                  src={getImageUrl(product.featured_image)}
                                  alt={product.title}
                                  fill
                                  unoptimized
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                />
                              </Link>

                              {/* Discount Badge */}
                              {discountPercent && discountPercent > 0 && (
                                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                                  {discountPercent}% OFF
                                </span>
                              )}

                              {/* Stock Status Badge */}
                              <span
                                className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                  inStock
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>

                            {/* Product Details */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div>
                                {product.sku && (
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                                    SKU: {product.sku}
                                  </span>
                                )}

                                <Link href={`/products/shop/${product.slug}`}>
                                  <h3 className="text-base font-bold text-gray-900 group-hover:text-[#01A7E5] transition-colors leading-snug line-clamp-2 mb-2">
                                    {product.title}
                                  </h3>
                                </Link>

                                {product.short_description && (
                                  <div
                                    className="text-xs text-gray-500 line-clamp-2 mb-3 [&_p]:m-0 [&_p]:inline"
                                    dangerouslySetInnerHTML={{ __html: product.short_description }}
                                  />
                                )}

                                {/* Price */}
                                <div className="flex items-baseline gap-2 mb-4">
                                  <span className="text-lg font-extrabold text-[#01A7E5]">
                                    NPR {Math.round(discountedPrice).toLocaleString()}
                                  </span>
                                  {discountPercent && discountPercent > 0 && (
                                    <span className="text-xs text-gray-400 line-through">
                                      NPR {Number(product.original_price).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Buttons */}
                              <div className="space-y-2">
                                <button
                                  onClick={(e) => void handleAddToCart(e, product)}
                                  disabled={!inStock || isCartLoading || isCartUpdating}
                                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                                    isAdded
                                      ? 'bg-emerald-600 text-white'
                                      : !inStock
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-[#01A7E5] hover:bg-[#018bc0] text-white shadow-xs hover:shadow-md'
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                      <span>Added to Cart!</span>
                                    </>
                                  ) : !inStock ? (
                                    <span>Out of Stock</span>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                                      </svg>
                                      <span>Add to Cart</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </StaggerItem>
                      );
                    })}
                  </StaggerGroup>
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
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Slide-Over Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        categories={CATEGORIES}
        selectedCategory={'All'}
        onSelectCategory={() => {}}
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
