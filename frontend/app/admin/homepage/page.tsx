"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import AdminImageField from "@/components/admin/AdminImageField";
import {
  fetchApi,
  getApiErrorMessage,
  getImageFilename,
  getImageUrl,
  getValidationError,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import RichTextEditor from "@/components/admin/RichTextEditor";

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

export type HomepageTab = "banner" | "services" | "portfolio" | "testimonials";

export default function AdminHomePage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<HomepageTab>("banner");
  const [banner, setBanner] = useState<BannerData>({ title: "", image: "", description: "" });
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [removeBannerImage, setRemoveBannerImage] = useState(false);
  const [bannerImageError, setBannerImageError] = useState<string>();
  const [services, setServices] = useState<HomeServiceData[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioData[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [isSavingBanner, setIsSavingBanner] = useState<boolean>(false);
  const [isOptimizingBannerImage, setIsOptimizingBannerImage] = useState(false);

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
  const [removePortfolioImage, setRemovePortfolioImage] = useState(false);
  const [portfolioImageError, setPortfolioImageError] = useState<string>();
  const [isSavingPortfolio, setIsSavingPortfolio] = useState(false);
  const [isOptimizingPortfolioImage, setIsOptimizingPortfolioImage] = useState(false);

  // Testimonial modal (add/edit)
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<number | null>(null);
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonial);
  const [isSavingTestimonial, setIsSavingTestimonial] = useState(false);

  // Pagination & Search & View Modal States
  const ITEMS_PER_PAGE = 10;

  // Services tab
  const [servicesSearchTerm, setServicesSearchTerm] = useState("");
  const [servicesCurrentPage, setServicesCurrentPage] = useState(1);
  const [viewingService, setViewingService] = useState<HomeServiceData | null>(null);

  // Portfolio tab
  const [portfolioSearchTerm, setPortfolioSearchTerm] = useState("");
  const [portfolioCurrentPage, setPortfolioCurrentPage] = useState(1);
  const [viewingPortfolio, setViewingPortfolio] = useState<PortfolioData | null>(null);

  // Testimonials tab
  const [testimonialsSearchTerm, setTestimonialsSearchTerm] = useState("");
  const [testimonialsCurrentPage, setTestimonialsCurrentPage] = useState(1);
  const [viewingTestimonial, setViewingTestimonial] = useState<TestimonialData | null>(null);

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
        } else {
          setBanner({ title: "", image: "", description: "" });
        }
        setBannerImageFile(null);
        setRemoveBannerImage(false);
        setBannerImageError(undefined);
        setServices(res.data.services || []);
        setPortfolioItems(res.data.portfolio || []);
        setTestimonials(res.data.testimonials || []);
      }
    } catch (err: unknown) {
      console.error("Failed to load Home data:", err);
      toast.error(getApiErrorMessage(err, "Failed to load Homepage data."));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadHomeData(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadHomeData]);

  // Computed & Paginated Services
  const filteredServices = React.useMemo(() => {
    if (!servicesSearchTerm.trim()) return services;
    const q = servicesSearchTerm.toLowerCase();
    return services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }, [services, servicesSearchTerm]);

  const servicesTotalPages = Math.max(1, Math.ceil(filteredServices.length / ITEMS_PER_PAGE));
  const servicesStartIndex = (servicesCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedServices = filteredServices.slice(
    servicesStartIndex,
    servicesStartIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setServicesCurrentPage(1);
  }, [servicesSearchTerm]);

  useEffect(() => {
    if (servicesCurrentPage > servicesTotalPages) {
      setServicesCurrentPage(servicesTotalPages);
    }
  }, [servicesCurrentPage, servicesTotalPages]);

  // Computed & Paginated Portfolio
  const filteredPortfolio = React.useMemo(() => {
    if (!portfolioSearchTerm.trim()) return portfolioItems;
    const q = portfolioSearchTerm.toLowerCase();
    return portfolioItems.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [portfolioItems, portfolioSearchTerm]);

  const portfolioTotalPages = Math.max(1, Math.ceil(filteredPortfolio.length / ITEMS_PER_PAGE));
  const portfolioStartIndex = (portfolioCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPortfolio = filteredPortfolio.slice(
    portfolioStartIndex,
    portfolioStartIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPortfolioCurrentPage(1);
  }, [portfolioSearchTerm]);

  useEffect(() => {
    if (portfolioCurrentPage > portfolioTotalPages) {
      setPortfolioCurrentPage(portfolioTotalPages);
    }
  }, [portfolioCurrentPage, portfolioTotalPages]);

  // Computed & Paginated Testimonials
  const filteredTestimonials = React.useMemo(() => {
    if (!testimonialsSearchTerm.trim()) return testimonials;
    const q = testimonialsSearchTerm.toLowerCase();
    return testimonials.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.role && t.role.toLowerCase().includes(q)) ||
        (t.company_name && t.company_name.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }, [testimonials, testimonialsSearchTerm]);

  const testimonialsTotalPages = Math.max(1, Math.ceil(filteredTestimonials.length / ITEMS_PER_PAGE));
  const testimonialsStartIndex = (testimonialsCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTestimonials = filteredTestimonials.slice(
    testimonialsStartIndex,
    testimonialsStartIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setTestimonialsCurrentPage(1);
  }, [testimonialsSearchTerm]);

  useEffect(() => {
    if (testimonialsCurrentPage > testimonialsTotalPages) {
      setTestimonialsCurrentPage(testimonialsTotalPages);
    }
  }, [testimonialsCurrentPage, testimonialsTotalPages]);

  // POST /home/banner/update
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingBanner || isOptimizingBannerImage) return;
    setIsSavingBanner(true);
    setBannerImageError(undefined);
    try {
      const formData = new FormData();
      formData.append("title", banner.title?.trim() || "");
      formData.append("description", banner.description?.trim() || "");
      if (bannerImageFile) formData.append("image", bannerImageFile);
      formData.append("remove_image", removeBannerImage ? "1" : "0");

      const res = await fetchApi<{ message: string; data: BannerData }>("/home/banner/update", {
        method: "POST",
        body: formData,
      });

      if (res && res.data) {
        setBanner(res.data);
      }
      setBannerImageFile(null);
      setRemoveBannerImage(false);
      toast.success(res.message || "Banner updated successfully");
    } catch (err: unknown) {
      console.error("Failed to update banner:", err);
      setBannerImageError(getValidationError(err, "image"));
      toast.error(getApiErrorMessage(err, "Error updating Banner."));
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
    } catch (err: unknown) {
      console.error("Failed to save service:", err);
      toast.error(getApiErrorMessage(err, "Failed to save Service."));
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
    } catch (err: unknown) {
      console.error("Failed to delete service:", err);
      toast.error(getApiErrorMessage(err, "Failed to delete Service."));
    }
  };

  // ---------- Portfolio ----------
  const openAddPortfolio = () => {
    setEditingPortfolioId(null);
    setPortfolioForm(emptyPortfolio);
    setPortfolioImageFile(null);
    setRemovePortfolioImage(false);
    setPortfolioImageError(undefined);
    setIsPortfolioModalOpen(true);
  };

  const openEditPortfolio = (item: PortfolioData) => {
    setEditingPortfolioId(item.id);
    setPortfolioForm({ title: item.title, image: item.image || "", description: item.description });
    setPortfolioImageFile(null);
    setRemovePortfolioImage(false);
    setPortfolioImageError(undefined);
    setIsPortfolioModalOpen(true);
  };

  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioForm.title.trim() || !portfolioForm.description.trim()) {
      toast.error("Title and Description are required.");
      return;
    }
    if (isSavingPortfolio || isOptimizingPortfolioImage) return;

    setIsSavingPortfolio(true);
    setPortfolioImageError(undefined);
    try {
      const formData = new FormData();
      formData.append("title", portfolioForm.title.trim());
      formData.append("description", portfolioForm.description.trim());
      if (portfolioImageFile) formData.append("image", portfolioImageFile);
      formData.append("remove_image", removePortfolioImage ? "1" : "0");

      if (editingPortfolioId) {
        const res = await fetchApi<{ message: string; data: PortfolioData }>(
          `/home/portfolio/${editingPortfolioId}`,
          { method: "POST", body: formData }
        );
        setPortfolioItems((prev) =>
          prev.map((p) => (p.id === editingPortfolioId ? res.data : p))
        );
        toast.success(res.message || "Portfolio item updated successfully");
      } else {
        const res = await fetchApi<{ message: string; data: PortfolioData }>(
          "/home/portfolio/store",
          { method: "POST", body: formData }
        );
        setPortfolioItems((prev) => [...prev, res.data]);
        toast.success(res.message || "Portfolio item created successfully");
      }

      setIsPortfolioModalOpen(false);
      setPortfolioForm(emptyPortfolio);
      setPortfolioImageFile(null);
      setRemovePortfolioImage(false);
      setEditingPortfolioId(null);
    } catch (err: unknown) {
      console.error("Failed to save portfolio item:", err);
      setPortfolioImageError(getValidationError(err, "image"));
      toast.error(getApiErrorMessage(err, "Failed to save Portfolio item."));
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
    } catch (err: unknown) {
      console.error("Failed to delete portfolio item:", err);
      toast.error(getApiErrorMessage(err, "Failed to delete Portfolio item."));
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
    } catch (err: unknown) {
      console.error("Failed to save testimonial:", err);
      toast.error(getApiErrorMessage(err, "Failed to save Testimonial."));
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
    } catch (err: unknown) {
      console.error("Failed to delete testimonial:", err);
      toast.error(getApiErrorMessage(err, "Failed to delete Testimonial."));
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

          {/* Tab Navigation Buttons */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("banner")}
              className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                activeTab === "banner"
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/40 ring-2 ring-cyan-400/50"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Banner</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("services")}
              className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                activeTab === "services"
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/40 ring-2 ring-cyan-400/50"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Our Services ({services.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("portfolio")}
              className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                activeTab === "portfolio"
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/40 ring-2 ring-cyan-400/50"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Portfolio ({portfolioItems.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("testimonials")}
              className={`px-5 py-3 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shrink-0 ${
                activeTab === "testimonials"
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/40 ring-2 ring-cyan-400/50"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>Testimonials ({testimonials.length})</span>
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
              {activeTab === "banner" && (
                <form
                  onSubmit={handleSaveBanner}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200"
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
                      {isOptimizingBannerImage ? (
                        "Optimizing image…"
                      ) : isSavingBanner ? (
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

                    <AdminImageField
                      label="Banner image"
                      existingImageUrl={getImageUrl(banner.image)}
                      existingImageFilename={getImageFilename(banner.image)}
                      existingImageAlt="Current saved homepage banner"
                      selectedFile={bannerImageFile}
                      onSelectFile={(file) => {
                        setBannerImageFile(file);
                        setRemoveBannerImage(false);
                        setBannerImageError(undefined);
                      }}
                      onClearSelection={() => setBannerImageFile(null)}
                      onProcessingChange={setIsOptimizingBannerImage}
                      onRemoveExisting={() => setRemoveBannerImage(true)}
                      onUndoRemoval={() => setRemoveBannerImage(false)}
                      isExistingMarkedForRemoval={removeBannerImage}
                      disabled={isSavingBanner || isOptimizingBannerImage}
                      error={bannerImageError}
                      aspectRatioGuidance="Recommended: a wide JPEG, PNG, or WebP source image."
                    />

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Description</label>
                      <RichTextEditor
                        value={banner.description || ""}
                        onChange={(html) =>
                          setBanner({ ...banner, description: html })
                        }
                        placeholder="Banner description..."
                        minHeight="80px"                
                        />
                    </div>
                  </div>
                </form>
              )}

              {/* Section 2: Our Services */}
              {activeTab === "services" && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
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

                  {/* Search Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div className="relative w-full sm:w-80">
                      <input
                        type="text"
                        placeholder="Search services by title or description..."
                        value={servicesSearchTerm}
                        onChange={(e) => setServicesSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    <div className="text-xs text-slate-400">
                      Total: <span className="text-white font-bold">{filteredServices.length}</span> services
                    </div>
                  </div>

                  {/* Services Table */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-3 text-center w-14">S.No</th>
                          <th className="py-3 px-3">Service Details</th>
                          <th className="py-3 px-3 text-center w-32 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {paginatedServices.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-12 text-center text-slate-500">
                              {services.length === 0
                                ? "No services created yet."
                                : "No matching services found."}
                            </td>
                          </tr>
                        ) : (
                          paginatedServices.map((item, index) => {
                            const serialNumber = servicesStartIndex + index + 1;

                            return (
                              <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="py-3 px-3 text-center font-mono text-slate-400 font-semibold">
                                  {serialNumber}
                                </td>
                                <td className="py-3 px-3 min-w-0">
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold text-white text-sm truncate" title={item.title}>
                                      {item.title}
                                    </div>
                                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title={item.description}>
                                      {item.description}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {/* View Button */}
                                    <button
                                      type="button"
                                      onClick={() => setViewingService(item)}
                                      title="View Service Details"
                                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-lg border border-slate-800 transition cursor-pointer shadow-sm"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </button>

                                    {/* Edit Button */}
                                    <button
                                      type="button"
                                      onClick={() => openEditService(item)}
                                      title="Edit Service"
                                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 rounded-lg border border-slate-800 transition cursor-pointer shadow-sm"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteService(item.id)}
                                      title="Delete Service"
                                      className="p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900/50 rounded-lg transition cursor-pointer shadow-sm"
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

                    {/* Pagination Controls */}
                    {filteredServices.length > 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-800/80 bg-slate-900/40 text-xs text-slate-400">
                        <div>
                          Showing <span className="text-white font-semibold">{servicesStartIndex + 1}</span> to{" "}
                          <span className="text-white font-semibold">
                            {Math.min(servicesStartIndex + ITEMS_PER_PAGE, filteredServices.length)}
                          </span>{" "}
                          of <span className="text-white font-semibold">{filteredServices.length}</span> services
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setServicesCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={servicesCurrentPage === 1}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 rounded-lg text-slate-300 transition cursor-pointer"
                          >
                            ‹ Prev
                          </button>

                          {Array.from({ length: servicesTotalPages }, (_, i) => i + 1)
                            .filter((page) => {
                              return (
                                page === 1 ||
                                page === servicesTotalPages ||
                                Math.abs(page - servicesCurrentPage) <= 1
                              );
                            })
                            .map((page, idx, arr) => {
                              const prev = arr[idx - 1];
                              const showEllipsis = prev && page - prev > 1;

                              return (
                                <React.Fragment key={page}>
                                  {showEllipsis && <span className="px-1 text-slate-600">...</span>}
                                  <button
                                    type="button"
                                    onClick={() => setServicesCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg font-semibold transition text-xs cursor-pointer ${
                                      servicesCurrentPage === page
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
                            type="button"
                            onClick={() => setServicesCurrentPage((p) => Math.min(p + 1, servicesTotalPages))}
                            disabled={servicesCurrentPage === servicesTotalPages}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 rounded-lg text-slate-300 transition cursor-pointer"
                          >
                            Next ›
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 3: Portfolio */}
              {activeTab === "portfolio" && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
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

                  {/* Search Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div className="relative w-full sm:w-80">
                      <input
                        type="text"
                        placeholder="Search portfolio by title or description..."
                        value={portfolioSearchTerm}
                        onChange={(e) => setPortfolioSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    <div className="text-xs text-slate-400">
                      Total: <span className="text-white font-bold">{filteredPortfolio.length}</span> items
                    </div>
                  </div>

                  {/* Portfolio Table */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-3 text-center w-14">S.No</th>
                          <th className="py-3 px-3">Portfolio Details</th>
                          <th className="py-3 px-3 text-center w-32 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {paginatedPortfolio.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-12 text-center text-slate-500">
                              {portfolioItems.length === 0
                                ? "No portfolio items created yet."
                                : "No matching portfolio items found."}
                            </td>
                          </tr>
                        ) : (
                          paginatedPortfolio.map((item, index) => {
                            const serialNumber = portfolioStartIndex + index + 1;
                            const img = getImageUrl(item.image);

                            return (
                              <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="py-3 px-3 text-center font-mono text-slate-400 font-semibold">
                                  {serialNumber}
                                </td>
                                <td className="py-3 px-3 min-w-0">
                                  <div className="flex items-center gap-3">
                                    <div className="w-14 h-10 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                                      {img ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={img}
                                          alt={item.title}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <span className="text-cyan-400 font-bold text-xs">
                                          PR
                                        </span>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-bold text-white text-sm truncate" title={item.title}>
                                        {item.title}
                                      </div>
                                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title={item.description}>
                                        {item.description}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {/* View Button */}
                                    <button
                                      type="button"
                                      onClick={() => setViewingPortfolio(item)}
                                      title="View Portfolio Details"
                                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-lg border border-slate-800 transition cursor-pointer shadow-sm"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </button>

                                    {/* Edit Button */}
                                    <button
                                      type="button"
                                      onClick={() => openEditPortfolio(item)}
                                      title="Edit Portfolio Item"
                                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 rounded-lg border border-slate-800 transition cursor-pointer shadow-sm"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeletePortfolio(item.id)}
                                      title="Delete Portfolio Item"
                                      className="p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900/50 rounded-lg transition cursor-pointer shadow-sm"
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

                    {/* Pagination Controls */}
                    {filteredPortfolio.length > 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-800/80 bg-slate-900/40 text-xs text-slate-400">
                        <div>
                          Showing <span className="text-white font-semibold">{portfolioStartIndex + 1}</span> to{" "}
                          <span className="text-white font-semibold">
                            {Math.min(portfolioStartIndex + ITEMS_PER_PAGE, filteredPortfolio.length)}
                          </span>{" "}
                          of <span className="text-white font-semibold">{filteredPortfolio.length}</span> items
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPortfolioCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={portfolioCurrentPage === 1}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 rounded-lg text-slate-300 transition cursor-pointer"
                          >
                            ‹ Prev
                          </button>

                          {Array.from({ length: portfolioTotalPages }, (_, i) => i + 1)
                            .filter((page) => {
                              return (
                                page === 1 ||
                                page === portfolioTotalPages ||
                                Math.abs(page - portfolioCurrentPage) <= 1
                              );
                            })
                            .map((page, idx, arr) => {
                              const prev = arr[idx - 1];
                              const showEllipsis = prev && page - prev > 1;

                              return (
                                <React.Fragment key={page}>
                                  {showEllipsis && <span className="px-1 text-slate-600">...</span>}
                                  <button
                                    type="button"
                                    onClick={() => setPortfolioCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg font-semibold transition text-xs cursor-pointer ${
                                      portfolioCurrentPage === page
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
                            type="button"
                            onClick={() => setPortfolioCurrentPage((p) => Math.min(p + 1, portfolioTotalPages))}
                            disabled={portfolioCurrentPage === portfolioTotalPages}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 rounded-lg text-slate-300 transition cursor-pointer"
                          >
                            Next ›
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 4: Testimonials */}
              {activeTab === "testimonials" && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
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

                  {/* Search Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div className="relative w-full sm:w-80">
                      <input
                        type="text"
                        placeholder="Search testimonials by name, role, or review..."
                        value={testimonialsSearchTerm}
                        onChange={(e) => setTestimonialsSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    <div className="text-xs text-slate-400">
                      Total: <span className="text-white font-bold">{filteredTestimonials.length}</span> testimonials
                    </div>
                  </div>

                  {/* Testimonials Table */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-3 text-center w-14">S.No</th>
                          <th className="py-3 px-3">Client Details</th>
                          <th className="py-3 px-3 text-center w-28">Rating</th>
                          <th className="py-3 px-3 text-center w-32 whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {paginatedTestimonials.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-slate-500">
                              {testimonials.length === 0
                                ? "No testimonials created yet."
                                : "No matching testimonials found."}
                            </td>
                          </tr>
                        ) : (
                          paginatedTestimonials.map((item, index) => {
                            const serialNumber = testimonialsStartIndex + index + 1;

                            return (
                              <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="py-3 px-3 text-center font-mono text-slate-400 font-semibold">
                                  {serialNumber}
                                </td>
                                <td className="py-3 px-3 min-w-0">
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold text-white text-sm truncate" title={item.name}>
                                      {item.name}
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate" title={[item.role, item.company_name].filter(Boolean).join(" · ")}>
                                      {[item.role, item.company_name].filter(Boolean).join(" · ") || "Client"}
                                    </div>
                                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" title={item.description}>
                                      {item.description}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                  <span className="text-amber-400 font-semibold text-xs tracking-wider">
                                    {"★".repeat(item.rating)}
                                    <span className="text-slate-600">{"☆".repeat(5 - item.rating)}</span>
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {/* View Button */}
                                    <button
                                      type="button"
                                      onClick={() => setViewingTestimonial(item)}
                                      title="View Testimonial Details"
                                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-lg border border-slate-800 transition cursor-pointer shadow-sm"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </button>

                                    {/* Edit Button */}
                                    <button
                                      type="button"
                                      onClick={() => openEditTestimonial(item)}
                                      title="Edit Testimonial"
                                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 rounded-lg border border-slate-800 transition cursor-pointer shadow-sm"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTestimonial(item.id)}
                                      title="Delete Testimonial"
                                      className="p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900/50 rounded-lg transition cursor-pointer shadow-sm"
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

                    {/* Pagination Controls */}
                    {filteredTestimonials.length > 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-800/80 bg-slate-900/40 text-xs text-slate-400">
                        <div>
                          Showing <span className="text-white font-semibold">{testimonialsStartIndex + 1}</span> to{" "}
                          <span className="text-white font-semibold">
                            {Math.min(testimonialsStartIndex + ITEMS_PER_PAGE, filteredTestimonials.length)}
                          </span>{" "}
                          of <span className="text-white font-semibold">{filteredTestimonials.length}</span> testimonials
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setTestimonialsCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={testimonialsCurrentPage === 1}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 rounded-lg text-slate-300 transition cursor-pointer"
                          >
                            ‹ Prev
                          </button>

                          {Array.from({ length: testimonialsTotalPages }, (_, i) => i + 1)
                            .filter((page) => {
                              return (
                                page === 1 ||
                                page === testimonialsTotalPages ||
                                Math.abs(page - testimonialsCurrentPage) <= 1
                              );
                            })
                            .map((page, idx, arr) => {
                              const prev = arr[idx - 1];
                              const showEllipsis = prev && page - prev > 1;

                              return (
                                <React.Fragment key={page}>
                                  {showEllipsis && <span className="px-1 text-slate-600">...</span>}
                                  <button
                                    type="button"
                                    onClick={() => setTestimonialsCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg font-semibold transition text-xs cursor-pointer ${
                                      testimonialsCurrentPage === page
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
                            type="button"
                            onClick={() => setTestimonialsCurrentPage((p) => Math.min(p + 1, testimonialsTotalPages))}
                            disabled={testimonialsCurrentPage === testimonialsTotalPages}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-800 rounded-lg text-slate-300 transition cursor-pointer"
                          >
                            Next ›
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Modal: Add/Edit Service */}
          {isServiceModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <form
                onSubmit={handleSaveService}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
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
                    disabled={isSavingPortfolio || isOptimizingPortfolioImage}
                    onClick={() => {
                      setIsPortfolioModalOpen(false);
                      setPortfolioImageFile(null);
                      setRemovePortfolioImage(false);
                      setPortfolioImageError(undefined);
                    }}
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

                  <AdminImageField
                    label="Portfolio image"
                    existingImageUrl={getImageUrl(portfolioForm.image)}
                    existingImageFilename={getImageFilename(portfolioForm.image)}
                    existingImageAlt={`Current saved image for ${
                      portfolioForm.title || "this portfolio item"
                    }`}
                    selectedFile={portfolioImageFile}
                    onSelectFile={(file) => {
                      setPortfolioImageFile(file);
                      setRemovePortfolioImage(false);
                      setPortfolioImageError(undefined);
                    }}
                    onClearSelection={() => setPortfolioImageFile(null)}
                    onProcessingChange={setIsOptimizingPortfolioImage}
                    onRemoveExisting={() => setRemovePortfolioImage(true)}
                    onUndoRemoval={() => setRemovePortfolioImage(false)}
                    isExistingMarkedForRemoval={removePortfolioImage}
                    disabled={isSavingPortfolio || isOptimizingPortfolioImage}
                    error={portfolioImageError}
                    aspectRatioGuidance="JPEG, PNG, or WebP source image."
                  />

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
                    disabled={isSavingPortfolio || isOptimizingPortfolioImage}
                    onClick={() => {
                      setIsPortfolioModalOpen(false);
                      setPortfolioImageFile(null);
                      setRemovePortfolioImage(false);
                      setPortfolioImageError(undefined);
                    }}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPortfolio || isOptimizingPortfolioImage}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg disabled:opacity-50"
                  >
                    {isOptimizingPortfolioImage
                      ? "Optimizing image…"
                      : isSavingPortfolio
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

          {/* Modal: View Service Details */}
          {viewingService && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Service Details</h3>
                  <button
                    type="button"
                    onClick={() => setViewingService(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Service Title</span>
                    <p className="text-base font-bold text-white">{viewingService.title}</p>
                  </div>

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Description</span>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                      {viewingService.description}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewingService(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const toEdit = viewingService;
                      setViewingService(null);
                      openEditService(toEdit);
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer"
                  >
                    Edit Service
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: View Portfolio Details */}
          {viewingPortfolio && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Portfolio Item Details</h3>
                  <button
                    type="button"
                    onClick={() => setViewingPortfolio(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {viewingPortfolio.image && (
                    <div className="w-full h-48 relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getImageUrl(viewingPortfolio.image)}
                        alt={viewingPortfolio.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Project Title</span>
                    <p className="text-base font-bold text-white">{viewingPortfolio.title}</p>
                  </div>

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Description</span>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                      {viewingPortfolio.description}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewingPortfolio(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const toEdit = viewingPortfolio;
                      setViewingPortfolio(null);
                      openEditPortfolio(toEdit);
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer"
                  >
                    Edit Portfolio
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: View Testimonial Details */}
          {viewingTestimonial && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Testimonial Review Details</h3>
                  <button
                    type="button"
                    onClick={() => setViewingTestimonial(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Client Name</span>
                    <p className="text-base font-bold text-white">{viewingTestimonial.name}</p>
                  </div>

                  {(viewingTestimonial.role || viewingTestimonial.company_name) && (
                    <div>
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Role / Company</span>
                      <p className="text-cyan-400 font-medium">
                        {[viewingTestimonial.role, viewingTestimonial.company_name].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Rating</span>
                    <span className="text-amber-400 font-semibold text-sm tracking-wider">
                      {"★".repeat(viewingTestimonial.rating)}
                      <span className="text-slate-600">{"☆".repeat(5 - viewingTestimonial.rating)}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Client Review</span>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                      {viewingTestimonial.description}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewingTestimonial(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const toEdit = viewingTestimonial;
                      setViewingTestimonial(null);
                      openEditTestimonial(toEdit);
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer"
                  >
                    Edit Testimonial
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
