"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminGalleryImageField from "@/components/admin/AdminGalleryImageField";
import AdminImageField from "@/components/admin/AdminImageField";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import {
  fetchApi,
  getApiErrorMessage,
  getImageFilename,
  getImageUrl,
  getValidationError,
} from "@/lib/api";

interface ProductGallery {
  id: number;
  image: string;
}

interface Product {
  id: number;
  title: string;
  slug: string;
  sku: string | null;
  short_description?: string | null;
  description?: string | null;
  original_price: number;
  discount_type?: "percentage" | "fixed" | null;
  discount_value?: number | null;
  stock_quantity?: number | null;
  is_active: boolean;
  featured_image?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  galleries?: ProductGallery[];
}

const generateSkuCode = (): string => {
  const part1 = Math.floor(100000 + Math.random() * 900000);
  const part2 = Math.floor(100 + Math.random() * 900);
  return `SKU-${part1}-${part2}`;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [stockSort, setStockSort] = useState<"default" | "asc" | "desc">("default");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Form states for file uploads
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [featuredImageError, setFeaturedImageError] = useState<string>();
  const [galleryImageError, setGalleryImageError] = useState<string>();
  const [isOptimizingFeaturedImage, setIsOptimizingFeaturedImage] = useState(false);
  const [isOptimizingGalleryImages, setIsOptimizingGalleryImages] = useState(false);
  const isOptimizingImages = isOptimizingFeaturedImage || isOptimizingGalleryImages;

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<{ status: string; data: Product[] }>("/admin/products");
      setProducts(res.data || []);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to load product catalog."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadProducts(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadProducts]);

  const filteredAndSortedProducts = React.useMemo(() => {
    let result = products.filter((p) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.slug.toLowerCase().includes(q)
      );
    });

    if (stockSort === "asc") {
      result = [...result].sort(
        (a, b) => (a.stock_quantity ?? 0) - (b.stock_quantity ?? 0)
      );
    } else if (stockSort === "desc") {
      result = [...result].sort(
        (a, b) => (b.stock_quantity ?? 0) - (a.stock_quantity ?? 0)
      );
    }

    return result;
  }, [products, searchTerm, stockSort]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredAndSortedProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset to page 1 whenever search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stockSort]);

  // Adjust page if out of range
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleStockSort = () => {
    setStockSort((prev) => {
      if (prev === "default") return "asc";
      if (prev === "asc") return "desc";
      return "default";
    });
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const formData = new FormData();
      formData.append("is_active", (!product.is_active) ? "1" : "0");

      const res = await fetchApi(`/products/${product.id}`, {
        method: "POST",
        body: formData,
      });

      if (res) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_active: !product.is_active } : p))
        );
      }
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product catalog item and its images?")) return;
    try {
      await fetchApi(`/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Failed to delete product."));
    }
  };

  const handleDeleteGalleryImage = async (galleryId: number, productId: number) => {
    if (!confirm("Delete this gallery image?")) return;
    try {
      await fetchApi(`/products/gallery/${galleryId}`, { method: "DELETE" });
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId && p.galleries) {
            return { ...p, galleries: p.galleries.filter((g) => g.id !== galleryId) };
          }
          return p;
        })
      );
      if (editingProduct?.galleries) {
        setEditingProduct((prev) => ({
          ...prev,
          galleries: prev?.galleries?.filter((g) => g.id !== galleryId),
        }));
      }
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Failed to delete gallery image."));
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.title || editingProduct?.original_price === undefined) {
      alert("Title and Original Price are required.");
      return;
    }

    if (!editingProduct.id && !featuredImageFile) {
      alert("Featured Image is required for new products.");
      return;
    }
    if (actionLoading || isOptimizingImages) return;

    setActionLoading(true);
    setFeaturedImageError(undefined);
    setGalleryImageError(undefined);
    try {
      const formData = new FormData();
      formData.append("title", editingProduct.title || "");
      if (editingProduct.slug) formData.append("slug", editingProduct.slug);
      
      // Auto generate SKU if empty
      const finalSku = editingProduct.sku?.trim() || generateSkuCode();
      formData.append("sku", finalSku);

      if (editingProduct.short_description) formData.append("short_description", editingProduct.short_description);
      if (editingProduct.description) formData.append("description", editingProduct.description);
      formData.append("original_price", String(editingProduct.original_price));
      if (editingProduct.discount_type) formData.append("discount_type", editingProduct.discount_type);
      if (editingProduct.discount_value !== undefined && editingProduct.discount_value !== null) {
        formData.append("discount_value", String(editingProduct.discount_value));
      }
      if (editingProduct.stock_quantity !== undefined && editingProduct.stock_quantity !== null) {
        formData.append("stock_quantity", String(editingProduct.stock_quantity));
      }
      formData.append("is_active", editingProduct.is_active ? "1" : "0");
      if (editingProduct.meta_title) formData.append("meta_title", editingProduct.meta_title);
      if (editingProduct.meta_description) formData.append("meta_description", editingProduct.meta_description);

      if (featuredImageFile) {
        formData.append("featured_image", featuredImageFile);
      }

      if (galleryFiles.length > 0) {
        galleryFiles.forEach((file) => {
          formData.append("gallery[]", file);
        });
      }

      const endpoint = editingProduct.id
        ? `/products/${editingProduct.id}`
        : `/products`;

      const resData = await fetchApi(endpoint, {
        method: "POST",
        body: formData,
      });

      if (editingProduct.id) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? resData.data : p))
        );
      } else {
        setProducts((prev) => [resData.data, ...prev]);
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      setFeaturedImageFile(null);
      setGalleryFiles([]);
    } catch (err: unknown) {
      setFeaturedImageError(getValidationError(err, "featured_image"));
      setGalleryImageError(
        getValidationError(err, "gallery") || getValidationError(err, "gallery.0")
      );
      alert(getApiErrorMessage(err, "Error saving product."));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Products & Paper Rolls Catalog
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage thermal paper rolls, POS receipt rolls, label inventory, pricing & gallery images.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadProducts}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold transition"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  setEditingProduct({
                    title: "",
                    sku: generateSkuCode(),
                    original_price: 100,
                    stock_quantity: 100,
                    is_active: true,
                  });
                  setFeaturedImageFile(null);
                  setGalleryFiles([]);
                  setFeaturedImageError(undefined);
                  setGalleryImageError(undefined);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-950/40 transition cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add New Product</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search products by title or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Stock Filter Dropdown */}
              <div className="flex items-center gap-2">
                {/* <label className="text-xs text-slate-400 whitespace-nowrap">Filter Stock:</label>
                <select
                  value={stockSort}
                  onChange={(e) => setStockSort(e.target.value as "default" | "asc" | "desc")}
                  className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="default">All / Default Order</option>
                  <option value="asc">Stock: Low to High (Ascending)</option>
                  <option value="desc">Stock: High to Low (Descending)</option>
                </select> */}
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Total: <span className="text-white font-bold">{filteredAndSortedProducts.length}</span> items
            </div>
          </div>

          {/* Products Table */}
          {loading ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Loading products from database...</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div>
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 w-16 text-center">S.No</th>
                      <th className="py-3.5 px-4">Product Details</th>
                      <th className="py-3.5 px-4">SKU</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th 
                        onClick={toggleStockSort}
                        className="py-3.5 px-4 cursor-pointer select-none hover:text-white transition group"
                        title="Click to toggle stock order (Ascending / Descending / Default)"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Stock</span>
                          <span className="flex flex-col text-[8px] leading-[8px] text-slate-500 group-hover:text-slate-300">
                            <span className={stockSort === "asc" ? "text-cyan-400 font-bold" : ""}>▲</span>
                            <span className={stockSort === "desc" ? "text-cyan-400 font-bold" : ""}>▼</span>
                          </span>
                        </div>
                      </th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center w-28 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          No products found.
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((product, index) => {
                        const serialNumber = startIndex + index + 1;

                        return (
                          <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-semibold">
                              {serialNumber}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                                  {product.featured_image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={getImageUrl(product.featured_image)}
                                      alt={product.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-cyan-400 font-bold text-xs">
                                      {product.title.substring(0, 2)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-sm">{product.title}</div>
                                  <div className="text-[11px] text-slate-500 max-w-xs truncate">
                                    {product.short_description || "No short description"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold">
                              {product.sku || "N/A"}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white">NPR {product.original_price}</div>
                              {product.discount_value && (
                                <div className="text-[10px] text-emerald-400 font-medium">
                                  Disc: {product.discount_type === "percentage" ? `${product.discount_value}%` : `NPR ${product.discount_value}`}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`font-semibold ${
                                  (product.stock_quantity ?? 0) > 0 ? "text-slate-200" : "text-red-400"
                                }`}
                              >
                                {(product.stock_quantity ?? 0) > 0 ? `${product.stock_quantity} units` : "Out of stock"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => handleToggleActive(product)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                                  product.is_active
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                    : "bg-slate-800 text-slate-500 border-slate-700"
                                }`}
                              >
                                {product.is_active ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Pencil Icon / Edit Button */}
                                <button
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setFeaturedImageFile(null);
                                    setGalleryFiles([]);
                                    setFeaturedImageError(undefined);
                                    setGalleryImageError(undefined);
                                    setIsModalOpen(true);
                                  }}
                                  title="Edit Product"
                                  className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 rounded-lg border border-slate-700 transition cursor-pointer shadow-sm"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                {/* Trash Icon / Delete Button */}
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  title="Delete Product"
                                  className="p-2 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900/50 rounded-lg transition cursor-pointer shadow-sm"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {filteredAndSortedProducts.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
                  <div>
                    Showing <span className="text-white font-semibold">{startIndex + 1}</span> to{" "}
                    <span className="text-white font-semibold">
                      {Math.min(startIndex + ITEMS_PER_PAGE, filteredAndSortedProducts.length)}
                    </span>{" "}
                    of <span className="text-white font-semibold">{filteredAndSortedProducts.length}</span> products
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 rounded-lg text-slate-300 transition cursor-pointer"
                    >
                      ‹ Prev
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, idx, arr) => {
                        const prev = arr[idx - 1];
                        const showEllipsis = prev && page - prev > 1;

                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && <span className="px-1 text-slate-600">...</span>}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-lg font-semibold transition text-xs cursor-pointer ${
                                currentPage === page
                                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-950/50"
                                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 rounded-lg text-slate-300 transition cursor-pointer"
                    >
                      Next ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add / Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <form
                onSubmit={handleSaveProduct}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-4xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingProduct?.id ? `Edit Product #${editingProduct.id}` : "Create New Product Catalog Item"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-400 hover:text-white text-base"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct?.title || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-400">SKU Code</label>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct((prev) => ({
                              ...prev,
                              sku: generateSkuCode(),
                            }))
                          }
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
                        >
                          ⚡ Auto Generate
                        </button>
                      </div>
                      <input
                        type="text"
                        value={editingProduct?.sku || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                        placeholder="Auto generated e.g. SKU-741809-936"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        min={0}
                        value={editingProduct?.stock_quantity ?? 100}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })
                        }
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Original Price (NPR) *</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={editingProduct?.original_price ?? 0}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, original_price: Number(e.target.value) })
                        }
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Discount Type</label>
                      <select
                        value={editingProduct?.discount_type || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditingProduct({
                            ...editingProduct,
                            discount_type:
                              value === "percentage" || value === "fixed" ? value : null,
                          });
                        }}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">None</option>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed (NPR)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Discount Value</label>
                      <input
                        type="number"
                        min={0}
                        value={editingProduct?.discount_value ?? ""}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            discount_value: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <AdminImageField
                    label={`Featured image${editingProduct?.id ? "" : " *"}`}
                    existingImageUrl={getImageUrl(editingProduct?.featured_image)}
                    existingImageFilename={getImageFilename(editingProduct?.featured_image)}
                    existingImageAlt={editingProduct?.title || "Current featured product image"}
                    selectedFile={featuredImageFile}
                    onSelectFile={setFeaturedImageFile}
                    onClearSelection={() => setFeaturedImageFile(null)}
                    onProcessingChange={setIsOptimizingFeaturedImage}
                    disabled={actionLoading}
                    error={featuredImageError}
                    aspectRatioGuidance="JPEG, PNG, or WebP up to 10 MB. Large images are optimized before upload."
                    accent="cyan"
                  />

                  {/* Gallery Photos */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-300">Current saved gallery</p>
                    {editingProduct?.galleries && editingProduct.galleries.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {editingProduct.galleries.map((gallery) => (
                          <div key={gallery.id} className="relative group bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getImageUrl(gallery.image)}
                              alt="Gallery"
                              className="w-full h-16 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteGalleryImage(gallery.id, editingProduct.id!)}
                              className="absolute top-1 right-1 p-1 bg-red-950/80 text-red-400 rounded opacity-0 group-hover:opacity-100 transition text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {(!editingProduct?.galleries || editingProduct.galleries.length === 0) && (
                      <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/50 px-4 py-6 text-center text-[11px] text-slate-600">
                        No current saved gallery images
                      </div>
                    )}
                  </div>

                  <AdminGalleryImageField
                    selectedFiles={galleryFiles}
                    onChange={setGalleryFiles}
                    onProcessingChange={setIsOptimizingGalleryImages}
                    disabled={actionLoading}
                    error={galleryImageError}
                    optimizationOptions={{ targetBytes: 500 * 1024 }}
                  />

                  <div>
                    <label className="block text-slate-400 mb-1">Short Description</label>
                    <input
                      type="text"
                      value={editingProduct?.short_description || ""}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, short_description: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Detailed Description</label>
                    <textarea
                      rows={3}
                      value={editingProduct?.description || ""}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, description: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 pt-1">
                    <input
                      type="checkbox"
                      checked={editingProduct?.is_active ?? true}
                      onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>Active on store catalog</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={actionLoading || isOptimizingImages}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || isOptimizingImages}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-950/40 disabled:opacity-50 cursor-pointer"
                  >
                    {isOptimizingImages
                      ? "Optimizing Images..."
                      : actionLoading
                        ? "Saving Product..."
                        : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
