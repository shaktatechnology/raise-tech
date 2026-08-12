"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { fetchApi } from "@/lib/api";
import { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Form states for file uploads
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi<{ status: string; data: Product[] }>("/admin/products");
      setProducts(res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load product catalog.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      p.slug.toLowerCase().includes(q)
    );
  });

  const handleToggleActive = async (product: Product) => {
    try {
      const formData = new FormData();
      formData.append("is_active", (!product.is_active) ? "1" : "0");

      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch(`http://localhost:8000/api/products/${product.id}`, {
        method: "POST", // Laravel accepts POST for update
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_active: !product.is_active } : p))
        );
      }
    } catch (err: any) {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product catalog item and its images?")) return;
    try {
      await fetchApi(`/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete product.");
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
    } catch (err: any) {
      alert(err.message || "Failed to delete gallery image.");
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

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", editingProduct.title || "");
      if (editingProduct.slug) formData.append("slug", editingProduct.slug);
      if (editingProduct.sku) formData.append("sku", editingProduct.sku);
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

      if (galleryFiles) {
        Array.from(galleryFiles).forEach((file) => {
          formData.append("gallery[]", file);
        });
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const url = editingProduct.id
        ? `http://localhost:8000/api/products/${editingProduct.id}`
        : `http://localhost:8000/api/products`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Failed to save product.");
      }

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
      setGalleryFiles(null);
    } catch (err: any) {
      alert(err.message || "Error saving product.");
    } finally {
      setActionLoading(false);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `http://localhost:8000/storage/${path}`;
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
                  const generatedSku = `SKU-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
                  setEditingProduct({
                    title: "",
                    sku: generatedSku,
                    original_price: 100,
                    stock_quantity: 100,
                    is_active: true,
                  });
                  setFeaturedImageFile(null);
                  setGalleryFiles(null);
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

          {/* Search Controls */}
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
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

            <div className="text-xs text-slate-400">
              Total: <span className="text-white font-bold">{filteredProducts.length}</span> items
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
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Product Details</th>
                      <th className="py-3.5 px-4">SKU</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Stock</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          No products found.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                                {product.featured_image ? (
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
                                product.stock_quantity > 0 ? "text-slate-200" : "text-red-400"
                              }`}
                            >
                              {product.stock_quantity > 0 ? `${product.stock_quantity} units` : "Out of stock"}
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
                          <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setFeaturedImageFile(null);
                                setGalleryFiles(null);
                                setIsModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/50 rounded-lg text-xs transition cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add / Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <form
                onSubmit={handleSaveProduct}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs"
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
                        <label className="block text-slate-400">SKU Code (Auto-generated)</label>
                        <button
                          type="button"
                          onClick={() => {
                            const newSku = `SKU-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
                            setEditingProduct({ ...editingProduct, sku: newSku });
                          }}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                        >
                          ↻ Regenerate
                        </button>
                      </div>
                      <input
                        type="text"
                        value={editingProduct?.sku || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
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
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            discount_type: (e.target.value as any) || null,
                          })
                        }
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

                  {/* Featured Image File */}
                  <div>
                    <label className="block text-slate-400 mb-1">
                      Featured Image {!editingProduct?.id && <span className="text-red-400">*</span>}
                    </label>
                    {editingProduct?.featured_image && (
                      <div className="mb-2 flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <img
                          src={getImageUrl(editingProduct.featured_image)}
                          alt="Current Featured"
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <span className="text-[11px] text-slate-400 truncate">{editingProduct.featured_image}</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFeaturedImageFile(e.target.files?.[0] || null)}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-cyan-950 file:text-cyan-400"
                    />
                  </div>

                  {/* Gallery Photos */}
                  <div>
                    <label className="block text-slate-400 mb-1">Gallery Images (Multiple)</label>
                    {editingProduct?.galleries && editingProduct.galleries.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {editingProduct.galleries.map((gallery) => (
                          <div key={gallery.id} className="relative group bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
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
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setGalleryFiles(e.target.files)}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200"
                    />
                  </div>

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
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-950/40 disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? "Saving Product..." : "Save Product"}
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
