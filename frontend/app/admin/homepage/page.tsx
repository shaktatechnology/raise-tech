"use client";

// Target path: src/app/admin/home/page.tsx (adjust to match your admin route structure)

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import { fetchApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export interface BannerData {
  id?: number;
  title: string | null;
  image: string | null;
  description: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HomeServiceData {
  id: number;
  title: string;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PortfolioData {
  id: number;
  title: string;
  image: string | null;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TestimonialData {
  id: number;
  rating: number;
  name: string;
  role: string | null;
  company_name: string | null;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
}

const emptyService = { title: "", description: "" };
const emptyPortfolio = { title: "", image: "", description: "" };
const emptyTestimonial = { rating: 5, name: "", role: "", company_name: "", description: "" };

export default function AdminHomePage() {
  const { toast } = useToast();

  const [banner, setBanner] = useState<BannerData>({ title: "", image: "", description: "" });
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [services, setServices] = useState<HomeServiceData[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioData[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [isSavingBanner, setIsSavingBanner] = useState<boolean>(false);

  // Service modal (add/edit)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [isSavingService, setIsSavingService] = useState(false);

  // Portfolio modal (add/edit)
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState<number | null>(null);
  const [portfolioForm, setPortfolioForm] = useState(emptyPortfolio);
  const [portfolioImageFile, setPortfolioImageFile] = useState<File | null>(null);
  const [isSavingPortfolio, setIsSavingPortfolio] = useState(false);

  // Testimonial modal (add/edit)
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<number | null>(null);
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonial);
  const [isSavingTestimonial, setIsSavingTestimonial] = useState(false);

  // Load GET /home
  const loadHomeData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi<{
        status: string;
        data: {
          banner: BannerData | null;
          services: HomeServiceData[];
          portfolio: PortfolioData[];
          testimonials: TestimonialData[];
        };
      }>("/home");

      if (res && res.data) {
        if (res.data.banner) {
          setBanner({
            title: res.data.banner.title || "",
            image: res.data.banner.image || "",
            description: res.data.banner.description || "",
          });
        }
        setServices(res.data.services || []);
        setPortfolioItems(res.data.portfolio || []);
        setTestimonials(res.data.testimonials || []);
      }
    } catch (err: any) {
      console.error("Failed to load Home data:", err);
      toast.error(err.message || "Failed to load Homepage data.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  // POST /home/banner/update
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBanner(true);
    try {
      let body: FormData | string;

      if (bannerImageFile) {
        const formData = new FormData();
        formData.append("title", banner.title?.trim() || "");
        formData.append("description", banner.description?.trim() || "");
        formData.append("image", bannerImageFile);
        body = formData;
      } else {
        body = JSON.stringify({
          title: banner.title?.trim() || null,
          image: banner.image?.trim() || null,
          description: banner.description?.trim() || null,
        });
      }

      const res = await fetchApi<{ message: string; data: BannerData }>("/home/banner/update", {
        method: "POST",
        body,
      });

      if (res && res.data) {
        setBanner(res.data);
      }
      setBannerImageFile(null);
      toast.success(res.message || "Banner updated successfully");
    } catch (err: any) {
      console.error("Failed to update banner:", err);
      toast.error(err.message || "Error updating Banner.");
    } finally {
      setIsSavingBanner(false);
    }
  };

  // ---------- Services ----------
  const openAddService = () => {
    setEditingServiceId(null);
    setServiceForm(emptyService);
    setIsServiceModalOpen(true);
  };

  const openEditService = (item: HomeServiceData) => {
    setEditingServiceId(item.id);
    setServiceForm({ title: item.title, description: item.description });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title.trim() || !serviceForm.description.trim()) {
      toast.error("Title and Description are required.");
      return;
    }

    setIsSavingService(true);
    try {
      const payload = {
        title: serviceForm.title.trim(),
        description: serviceForm.description.trim(),
      };

      if (editingServiceId) {
        const res = await fetchApi<{ message: string; data: HomeServiceData }>(
          `/home/services/${editingServiceId}`,
          { method: "POST", body: JSON.stringify(payload) }
        );
        setServices((prev) => prev.map((s) => (s.id === editingServiceId ? res.data : s)));
        toast.success(res.message || "Service updated successfully");
      } else {
        const res = await fetchApi<{ message: string; data: HomeServiceData }>(
          "/home/services/store",
          { method: "POST", body: JSON.stringify(payload) }
        );
        setServices((prev) => [...prev, res.data]);
        toast.success(res.message || "Service created successfully");
      }

      setIsServiceModalOpen(false);
      setServiceForm(emptyService);
      setEditingServiceId(null);
    } catch (err: any) {
      console.error("Failed to save service:", err);
      toast.error(err.message || "Failed to save Service.");
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm("Delete this service? This cannot be undone.")) return;
    try {
      const res = await fetchApi<{ message: string }>(`/home/services/${id}`, {
        method: "DELETE",
      });
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success(res.message || "Service deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete service:", err);
      toast.error(err.message || "Failed to delete Service.");
    }
  };

  // ---------- Portfolio ----------
  const openAddPortfolio = () => {
    setEditingPortfolioId(null);
    setPortfolioForm(emptyPortfolio);
    setPortfolioImageFile(null);
    setIsPortfolioModalOpen(true);
  };

  const openEditPortfolio = (item: PortfolioData) => {
    setEditingPortfolioId(item.id);
    setPortfolioForm({ title: item.title, image: item.image || "", description: item.description });
    setPortfolioImageFile(null);
    setIsPortfolioModalOpen(true);
  };

  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioForm.title.trim() || !portfolioForm.description.trim()) {
      toast.error("Title and Description are required.");
      return;
    }

    setIsSavingPortfolio(true);
    try {
      let body: FormData | string;

      if (portfolioImageFile) {
        const formData = new FormData();
        formData.append("title", portfolioForm.title.trim());
        formData.append("description", portfolioForm.description.trim());
        formData.append("image", portfolioImageFile);
        body = formData;
      } else {
        body = JSON.stringify({
          title: portfolioForm.title.trim(),
          image: portfolioForm.image.trim() || null,
          description: portfolioForm.description.trim(),
        });
      }

      if (editingPortfolioId) {
        const res = await fetchApi<{ message: string; data: PortfolioData }>(
          `/home/portfolio/${editingPortfolioId}`,
          { method: "POST", body }
        );
        setPortfolioItems((prev) =>
          prev.map((p) => (p.id === editingPortfolioId ? res.data : p))
        );
        toast.success(res.message || "Portfolio item updated successfully");
      } else {
        const res = await fetchApi<{ message: string; data: PortfolioData }>(
          "/home/portfolio/store",
          { method: "POST", body }
        );
        setPortfolioItems((prev) => [...prev, res.data]);
        toast.success(res.message || "Portfolio item created successfully");
      }

      setIsPortfolioModalOpen(false);
      setPortfolioForm(emptyPortfolio);
      setPortfolioImageFile(null);
      setEditingPortfolioId(null);
    } catch (err: any) {
      console.error("Failed to save portfolio item:", err);
      toast.error(err.message || "Failed to save Portfolio item.");
    } finally {
      setIsSavingPortfolio(false);
    }
  };

  const handleDeletePortfolio = async (id: number) => {
    if (!window.confirm("Delete this portfolio item? This cannot be undone.")) return;
    try {
      const res = await fetchApi<{ message: string }>(`/home/portfolio/${id}`, {
        method: "DELETE",
      });
      setPortfolioItems((prev) => prev.filter((p) => p.id !== id));
      toast.success(res.message || "Portfolio item deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete portfolio item:", err);
      toast.error(err.message || "Failed to delete Portfolio item.");
    }
  };

  // ---------- Testimonials ----------
  const openAddTestimonial = () => {
    setEditingTestimonialId(null);
    setTestimonialForm(emptyTestimonial);
    setIsTestimonialModalOpen(true);
  };

  const openEditTestimonial = (item: TestimonialData) => {
    setEditingTestimonialId(item.id);
    setTestimonialForm({
      rating: item.rating,
      name: item.name,
      role: item.role || "",
      company_name: item.company_name || "",
      description: item.description,
    });
    setIsTestimonialModalOpen(true);
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialForm.name.trim() || !testimonialForm.description.trim()) {
      toast.error("Name and Description are required.");
      return;
    }

    setIsSavingTestimonial(true);
    try {
      const payload = {
        rating: testimonialForm.rating,
        name: testimonialForm.name.trim(),
        role: testimonialForm.role.trim() || null,
        company_name: testimonialForm.company_name.trim() || null,
        description: testimonialForm.description.trim(),
      };

      if (editingTestimonialId) {
        const res = await fetchApi<{ message: string; data: TestimonialData }>(
          `/home/testimonials/${editingTestimonialId}`,
          { method: "POST", body: JSON.stringify(payload) }
        );
        setTestimonials((prev) =>
          prev.map((t) => (t.id === editingTestimonialId ? res.data : t))
        );
        toast.success(res.message || "Testimonial updated successfully");
      } else {
        const res = await fetchApi<{ message: string; data: TestimonialData }>(
          "/home/testimonials/store",
          { method: "POST", body: JSON.stringify(payload) }
        );
        setTestimonials((prev) => [...prev, res.data]);
        toast.success(res.message || "Testimonial created successfully");
      }

      setIsTestimonialModalOpen(false);
      setTestimonialForm(emptyTestimonial);
      setEditingTestimonialId(null);
    } catch (err: any) {
      console.error("Failed to save testimonial:", err);
      toast.error(err.message || "Failed to save Testimonial.");
    } finally {
      setIsSavingTestimonial(false);
    }
  };

  const handleDeleteTestimonial = async (id: number) => {
    if (!window.confirm("Delete this testimonial? This cannot be undone.")) return;
    try {
      const res = await fetchApi<{ message: string }>(`/home/testimonials/${id}`, {
        method: "DELETE",
      });
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      toast.success(res.message || "Testimonial deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete testimonial:", err);
      toast.error(err.message || "Failed to delete Testimonial.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Homepage Management
                </h1>
                <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  API Connected
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Manage the homepage banner, services, portfolio, and testimonials.
              </p>
            </div>

            <button
              onClick={loadHomeData}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Loading Homepage configurations...</p>
            </div>
          ) : (
            <>
              {/* Section 1: Banner */}
              <form
                onSubmit={handleSaveBanner}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400">1.</span> Banner
                  </h2>
                  <button
                    type="submit"
                    disabled={isSavingBanner}
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSavingBanner ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      "Save Banner"
                    )}
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Title</label>
                    <input
                      type="text"
                      value={banner.title || ""}
                      onChange={(e) => setBanner({ ...banner, title: e.target.value })}
                      placeholder="e.g. Empowering Businesses with Next-Gen Technology"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Image</label>
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="banner-image-input"
                        className="shrink-0 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition"
                      >
                        Choose File
                      </label>
                      <input
                        id="banner-image-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setBannerImageFile(e.target.files?.[0] || null)}
                      />
                      <span className="text-slate-400 truncate">
                        {bannerImageFile ? bannerImageFile.name : banner.image || "No file chosen"}
                      </span>
                    </div>
                    {(bannerImageFile || banner.image) && (
                      <img
                        src={bannerImageFile ? URL.createObjectURL(bannerImageFile) : banner.image || ""}
                        alt="Banner preview"
                        className="mt-3 h-28 rounded-xl border border-slate-800 object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Description</label>
                    <textarea
                      rows={4}
                      value={banner.description || ""}
                      onChange={(e) => setBanner({ ...banner, description: e.target.value })}
                      placeholder="Banner description..."
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                    />
                  </div>
                </div>
              </form>

              {/* Section 2: Our Services */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="text-cyan-400">2.</span> Our Services
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Services shown on the homepage.
                    </p>
                  </div>
                  <button
                    onClick={openAddService}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                  >
                    + Add Service
                  </button>
                </div>

                {services.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No services created yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white text-sm">{item.title}</h4>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => openEditService(item)}
                              className="text-cyan-400 hover:text-cyan-300 font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteService(item.id)}
                              className="text-red-400 hover:text-red-300 font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-400 leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Portfolio */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="text-cyan-400">3.</span> Portfolio
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Project / work showcase items.
                    </p>
                  </div>
                  <button
                    onClick={openAddPortfolio}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                  >
                    + Add Portfolio Item
                  </button>
                </div>

                {portfolioItems.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No portfolio items created yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white text-sm">{item.title}</h4>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => openEditPortfolio(item)}
                              className="text-cyan-400 hover:text-cyan-300 font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePortfolio(item.id)}
                              className="text-red-400 hover:text-red-300 font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {item.image && (
                          <p className="text-slate-500 truncate">{item.image}</p>
                        )}
                        <p className="text-slate-400 leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4: Testimonials */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="text-cyan-400">4.</span> Testimonials
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Client reviews and ratings.
                    </p>
                  </div>
                  <button
                    onClick={openAddTestimonial}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
                  >
                    + Add Testimonial
                  </button>
                </div>

                {testimonials.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No testimonials created yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testimonials.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-white text-sm">{item.name}</h4>
                            <p className="text-slate-500">
                              {[item.role, item.company_name].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => openEditTestimonial(item)}
                              className="text-cyan-400 hover:text-cyan-300 font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTestimonial(item.id)}
                              className="text-red-400 hover:text-red-300 font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-cyan-400 font-semibold">
                          {"★".repeat(item.rating)}
                          {"☆".repeat(5 - item.rating)}
                        </p>
                        <p className="text-slate-400 leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Modal: Add/Edit Service */}
          {isServiceModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <form
                onSubmit={handleSaveService}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingServiceId ? "Edit Service" : "Add Service"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsServiceModalOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={serviceForm.title}
                      onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                      placeholder="e.g. Web Development"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Description *</label>
                    <textarea
                      rows={4}
                      required
                      value={serviceForm.description}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, description: e.target.value })
                      }
                      placeholder="Describe this service..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsServiceModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingService}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg disabled:opacity-50"
                  >
                    {isSavingService
                      ? "Saving..."
                      : editingServiceId
                      ? "Save Changes"
                      : "Create Service"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Modal: Add/Edit Portfolio */}
          {isPortfolioModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <form
                onSubmit={handleSavePortfolio}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingPortfolioId ? "Edit Portfolio Item" : "Add Portfolio Item"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsPortfolioModalOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={portfolioForm.title}
                      onChange={(e) =>
                        setPortfolioForm({ ...portfolioForm, title: e.target.value })
                      }
                      placeholder="e.g. Trackingmandu"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Image</label>
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="portfolio-image-input"
                        className="shrink-0 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition"
                      >
                        Choose File
                      </label>
                      <input
                        id="portfolio-image-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setPortfolioImageFile(e.target.files?.[0] || null)}
                      />
                      <span className="text-slate-400 truncate">
                        {portfolioImageFile
                          ? portfolioImageFile.name
                          : portfolioForm.image || "No file chosen"}
                      </span>
                    </div>
                    {(portfolioImageFile || portfolioForm.image) && (
                      <img
                        src={
                          portfolioImageFile
                            ? URL.createObjectURL(portfolioImageFile)
                            : portfolioForm.image
                        }
                        alt="Portfolio preview"
                        className="mt-3 h-28 rounded-xl border border-slate-800 object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Description *</label>
                    <textarea
                      rows={4}
                      required
                      value={portfolioForm.description}
                      onChange={(e) =>
                        setPortfolioForm({ ...portfolioForm, description: e.target.value })
                      }
                      placeholder="Describe this project..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsPortfolioModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPortfolio}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg disabled:opacity-50"
                  >
                    {isSavingPortfolio
                      ? "Saving..."
                      : editingPortfolioId
                      ? "Save Changes"
                      : "Create Item"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Modal: Add/Edit Testimonial */}
          {isTestimonialModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <form
                onSubmit={handleSaveTestimonial}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">
                    {editingTestimonialId ? "Edit Testimonial" : "Add Testimonial"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsTestimonialModalOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Rating (1–5) *</label>
                    <select
                      required
                      value={testimonialForm.rating}
                      onChange={(e) =>
                        setTestimonialForm({
                          ...testimonialForm,
                          rating: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} {"★".repeat(n)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={testimonialForm.name}
                        onChange={(e) =>
                          setTestimonialForm({ ...testimonialForm, name: e.target.value })
                        }
                        placeholder="e.g. Sita Sharma"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Role</label>
                      <input
                        type="text"
                        value={testimonialForm.role}
                        onChange={(e) =>
                          setTestimonialForm({ ...testimonialForm, role: e.target.value })
                        }
                        placeholder="e.g. Operations Manager"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={testimonialForm.company_name}
                      onChange={(e) =>
                        setTestimonialForm({
                          ...testimonialForm,
                          company_name: e.target.value,
                        })
                      }
                      placeholder="e.g. Kathmandu Logistics Pvt. Ltd."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Description *</label>
                    <textarea
                      rows={4}
                      required
                      value={testimonialForm.description}
                      onChange={(e) =>
                        setTestimonialForm({
                          ...testimonialForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="What did they say?"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsTestimonialModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingTestimonial}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg disabled:opacity-50"
                  >
                    {isSavingTestimonial
                      ? "Saving..."
                      : editingTestimonialId
                      ? "Save Changes"
                      : "Create Testimonial"}
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