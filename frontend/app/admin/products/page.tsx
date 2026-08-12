"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import AdminHeader from "@/components/admin/AdminHeader";
import { Product } from "@/lib/types";

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Thermal Paper Roll 80mm x 80mm",
    slug: "thermal-paper-roll-8080",
    sku: "TPR-8080",
    short_description: "High quality thermal paper rolls for POS printers and billing machines.",
    description: "Premium grade thermal paper rolls offering crisp image printouts, resistant to heat and humidity. Compatible with Epson, Citizen, and Star POS printers.",
    original_price: 150,
    discount_type: "percentage",
    discount_value: 10,
    stock_quantity: 1200,
    featured_image: "/images/products/thermal-roll.jpg",
    is_active: true,
    created_at: "2026-08-01T10:00:00Z",
  },
  {
    id: 2,
    title: "POS Receipt Paper 57mm x 40mm",
    slug: "pos-receipt-paper-5740",
    sku: "POS-5740",
    short_description: "Compact thermal paper rolls for handheld credit card machines and mobile POS.",
    description: "BPA free high density thermal rolls ideal for EDC card swipe machines and mobile receipt printers.",
    original_price: 60,
    discount_type: null,
    discount_value: null,
    stock_quantity: 450,
    featured_image: "/images/products/pos-roll.jpg",
    is_active: true,
    created_at: "2026-08-05T12:00:00Z",
  },
  {
    id: 3,
    title: "Sticky Label Thermal Roll 4x6 inch",
    slug: "sticky-label-roll-4x6",
    sku: "LBL-4060",
    short_description: "Barcode & shipping label thermal paper for courier dispatching.",
    description: "Self-adhesive high stickiness barcode labels compatible with Zebra and Xprinter barcode thermal printers.",
    original_price: 450,
    discount_type: "fixed",
    discount_value: 50,
    stock_quantity: 0,
    featured_image: "/images/products/label-roll.jpg",
    is_active: false,
    created_at: "2026-08-09T08:30:00Z",
  },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const filteredProducts = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      p.slug.toLowerCase().includes(q)
    );
  });

  const handleToggleActive = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this product catalog item?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.title || !editingProduct?.original_price) {
      alert("Please fill required fields (Title, Original Price)");
      return;
    }

    if (editingProduct.id) {
      // Update
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? ({ ...p, ...editingProduct } as Product) : p))
      );
    } else {
      // Create
      const newProd: Product = {
        id: Date.now(),
        title: editingProduct.title || "",
        slug: editingProduct.title.toLowerCase().replace(/\s+/g, "-"),
        sku: editingProduct.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
        short_description: editingProduct.short_description || null,
        description: editingProduct.description || null,
        original_price: Number(editingProduct.original_price),
        discount_type: editingProduct.discount_type || null,
        discount_value: editingProduct.discount_value ? Number(editingProduct.discount_value) : null,
        stock_quantity: Number(editingProduct.stock_quantity || 0),
        featured_image: editingProduct.featured_image || "/images/products/placeholder.jpg",
        is_active: editingProduct.is_active ?? true,
      };
      setProducts((prev) => [newProd, ...prev]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Products & Paper Rolls Catalog
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage thermal paper rolls, POS receipt rolls, label inventory, pricing & discounts.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingProduct({
                  title: "",
                  sku: "",
                  original_price: 100,
                  stock_quantity: 100,
                  is_active: true,
                });
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

          {/* Controls Bar */}
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
              Showing <span className="text-white font-bold">{filteredProducts.length}</span> products
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Item Details</th>
                    <th className="py-3.5 px-4">SKU</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center text-cyan-400 font-bold text-xs uppercase overflow-hidden">
                            {product.title.substring(0, 2)}
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
                          <div className="text-[10px] text-emerald-400">
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
                          onClick={() => handleToggleActive(product.id)}
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
                            setIsModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/50 rounded-lg text-xs transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add / Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <form
                onSubmit={handleSaveProduct}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingProduct?.id ? "Edit Product Item" : "Create New Paper Roll Product"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
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
                      <label className="block text-slate-400 mb-1">SKU Code</label>
                      <input
                        type="text"
                        value={editingProduct?.sku || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Stock Quantity</label>
                      <input
                        type="number"
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

                  <div>
                    <label className="block text-slate-400 mb-1">Short Summary</label>
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
                    <label className="block text-slate-400 mb-1">Detailed Specifications</label>
                    <textarea
                      rows={3}
                      value={editingProduct?.description || ""}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, description: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-950/40"
                  >
                    Save Product
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
