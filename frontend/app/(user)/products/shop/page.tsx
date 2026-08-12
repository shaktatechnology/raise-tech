"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { Product } from "@/lib/types";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi<{ status: string; data: Product[] }>("/products");
        setProducts(res.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load active products catalog.");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const openProductDetail = async (product: Product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
    // Fetch single product by slug for full gallery details if needed
    try {
      const res = await fetchApi<{ status: string; data: Product }>(`/products/${product.slug}`);
      if (res.data) {
        setSelectedProduct(res.data);
      }
    } catch (err) {
      console.error("Could not fetch detailed product info", err);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  const calculateDiscountedPrice = (product: Product) => {
    if (!product.discount_type || !product.discount_value) {
      return Number(product.original_price);
    }
    if (product.discount_type === "percentage") {
      const discount = Number(product.original_price) * (Number(product.discount_value) / 100);
      return Math.max(0, Number(product.original_price) - discount);
    }
    if (product.discount_type === "fixed") {
      return Math.max(0, Number(product.original_price) - Number(product.discount_value));
    }
    return Number(product.original_price);
  };

  const filteredProducts = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      (p.short_description && p.short_description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="px-3.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            Enterprise Paper Roll & POS Store
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            High-Grade Thermal Paper Rolls & Labels
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Supplying BPA-free thermal paper rolls, POS receipt rolls, and sticky barcode labels engineered for maximum print clarity and durability across Nepal.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {/* Search & Counter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search paper rolls, POS paper, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> active catalog items
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center text-slate-500 space-y-3">
            <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold">Fetching paper roll products catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <svg className="w-14 h-14 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-base font-bold text-slate-800">No Products Available</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no matching active products found in the catalog right now.
            </p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const effectivePrice = calculateDiscountedPrice(product);
              const hasDiscount = product.discount_value && Number(product.discount_value) > 0;

              return (
                <div
                  key={product.id}
                  className="group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Container */}
                    <div className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => openProductDetail(product)}>
                      <img
                        src={getImageUrl(product.featured_image)}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {hasDiscount && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                          {product.discount_type === "percentage"
                            ? `${product.discount_value}% OFF`
                            : `NPR ${product.discount_value} OFF`}
                        </span>
                      )}
                      {product.stock_quantity <= 0 && (
                        <span className="absolute top-3 right-3 bg-slate-900/80 text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Product Body */}
                    <div className="p-5 space-y-2">
                      {product.sku && (
                        <span className="text-[10px] font-mono text-cyan-700 uppercase tracking-wider font-bold">
                          SKU: {product.sku}
                        </span>
                      )}
                      <h3
                        onClick={() => openProductDetail(product)}
                        className="text-base font-bold text-slate-900 group-hover:text-cyan-600 transition-colors cursor-pointer line-clamp-1"
                      >
                        {product.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {product.short_description || "High quality thermal paper roll suitable for POS billing systems."}
                      </p>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-4">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Price</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-slate-900">
                          NPR {effectivePrice.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through font-medium">
                            NPR {Number(product.original_price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => openProductDetail(product)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Images Preview */}
                <div className="space-y-3">
                  <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                    <img
                      src={
                        selectedProduct.galleries && selectedProduct.galleries[activeImageIndex]
                          ? getImageUrl(selectedProduct.galleries[activeImageIndex].image)
                          : getImageUrl(selectedProduct.featured_image)
                      }
                      alt={selectedProduct.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {selectedProduct.galleries && selectedProduct.galleries.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      <button
                        onClick={() => setActiveImageIndex(0)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                          activeImageIndex === 0 ? "border-cyan-600" : "border-slate-200"
                        }`}
                      >
                        <img src={getImageUrl(selectedProduct.featured_image)} alt="Featured" className="w-full h-full object-cover" />
                      </button>
                      {selectedProduct.galleries.map((gal, idx) => (
                        <button
                          key={gal.id}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                            activeImageIndex === idx ? "border-cyan-600" : "border-slate-200"
                          }`}
                        >
                          <img src={getImageUrl(gal.image)} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    {selectedProduct.sku && (
                      <span className="text-xs font-mono font-bold text-cyan-600 uppercase">
                        SKU: {selectedProduct.sku}
                      </span>
                    )}
                    <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{selectedProduct.title}</h2>
                  </div>

                  <div className="flex items-baseline gap-3 border-y border-slate-100 py-3">
                    <span className="text-2xl font-black text-slate-900">
                      NPR {calculateDiscountedPrice(selectedProduct).toLocaleString()}
                    </span>
                    {selectedProduct.discount_value && Number(selectedProduct.discount_value) > 0 && (
                      <span className="text-sm text-slate-400 line-through font-medium">
                        NPR {Number(selectedProduct.original_price).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Description</h4>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {selectedProduct.description || selectedProduct.short_description || "High durability thermal receipt paper."}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Stock Availability:</span>
                      <span className={`font-bold ${selectedProduct.stock_quantity > 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {selectedProduct.stock_quantity > 0 ? `${selectedProduct.stock_quantity} Units in stock` : "Out of stock"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Paper Grade:</span>
                      <span className="font-semibold text-slate-800">Premium BPA-Free Thermal</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/contact"
                      className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/20"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Inquire / Place Order Request
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
