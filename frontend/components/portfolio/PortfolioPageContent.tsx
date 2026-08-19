"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi, getImageUrl } from "@/lib/api";
import { PORTFOLIO_DATA } from "@/lib/data/homeData";
import type { Portfolio } from "@/lib/types/home";
import EnhancedImage from "@/components/ui/EnhancedImage";

export default function PortfolioPageContent() {
  const [portfolioItems, setPortfolioItems] = useState<Portfolio[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<Portfolio | null>(null);

  useEffect(() => {
    async function loadPortfolio() {
      setLoading(true);
      try {
        const res = await fetchApi<{
          status: string;
          data?: {
            banner?: unknown;
            services?: unknown[];
            portfolio?: Portfolio[];
            testimonials?: unknown[];
          };
          portfolio?: Portfolio[];
        }>("/home");

        const fetchedPortfolio = res?.data?.portfolio || res?.portfolio || [];

        if (fetchedPortfolio.length > 0) {
          setPortfolioItems(fetchedPortfolio);
        } else {
          setPortfolioItems(
            PORTFOLIO_DATA.map((item, idx) => ({
              id: idx + 1,
              title: item.title,
              image: item.image,
              description: item.description,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load portfolio items from API:", err);
        setPortfolioItems(
          PORTFOLIO_DATA.map((item, idx) => ({
            id: idx + 1,
            title: item.title,
            image: item.image,
            description: item.description,
          }))
        );
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  const categories = ["All", "Branding & Platform", "Enterprise Solutions", "E-Commerce"];

  const displayedPortfolioItems = selectedCategory === "All"
    ? portfolioItems
    : portfolioItems.filter((item) => {
        const text = `${item.title} ${item.description}`.toLowerCase();
        if (selectedCategory === "Branding & Platform") {
          return text.includes("brand") || text.includes("platform") || text.includes("mw") || text.includes("design");
        }
        if (selectedCategory === "Enterprise Solutions") {
          return text.includes("enterprise") || text.includes("portal") || text.includes("gurkha") || text.includes("solution") || text.includes("system");
        }
        if (selectedCategory === "E-Commerce") {
          return text.includes("e-commerce") || text.includes("commerce") || text.includes("shop") || text.includes("instyle") || text.includes("retail");
        }
        return true;
      });

  return (
    <div className="w-full">
      {/* Portfolio Hero Header Banner */}
      <section className="relative w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[420px] overflow-hidden bg-[#022c43] flex items-center justify-center">
        <Image
          src="/images/services/services-hero.png"
          alt="Raise Tech Portfolio Hero"
          fill
          priority
          className="object-cover [object-position:75%_center]"
        />

        {/* Vibrant Cyan-Blue Cover Overlay — same as Services & Team pages */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#01a7e5]/90 via-[#01a7e5]/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-center items-center text-center px-4">
          <p className="font-carattere text-5xl sm:text-7xl text-white drop-shadow-md">
            Our Portfolio
          </p>
        </div>
      </section>

      {/* Main Portfolio Showcase */}
      <section className="py-16 sm:py-24 bg-[#f8fdff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12 sm:mb-16 w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 shadow-2xs ${
                  selectedCategory === cat
                    ? "bg-[#01A7E5] text-white shadow-md scale-105"
                    : "bg-white text-gray-700 hover:bg-cyan-50 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="py-20 text-center text-gray-500">
              <div className="w-8 h-8 border-3 border-[#01A7E5] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-medium">Loading portfolio showcase...</p>
            </div>
          ) : displayedPortfolioItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 max-w-lg mx-auto">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Projects In This Category</h2>
              <p className="text-sm text-gray-500">Select another category or view All projects.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {displayedPortfolioItems.map((item) => {
                const imgUrl = getImageUrl(item.image);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100/90 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col group w-full cursor-pointer"
                  >
                    {/* Image Container */}
                    <div className="relative w-full aspect-[4/3] bg-slate-50 overflow-hidden">
                      {imgUrl ? (
                        <EnhancedImage
                          src={imgUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          containerClassName="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-sm font-semibold p-4 text-center">
                          {item.title}
                        </div>
                      )}

                      {/* Hover Overlay — "Click to View" */}
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center pointer-events-none gap-2">
                        <div className="w-12 h-12 rounded-full bg-white/95 text-[#01A7E5] flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <span className="text-white text-xs font-bold tracking-wide">Click to Read More</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-xs font-bold text-[#01A7E5] uppercase tracking-wider bg-cyan-50 px-3 py-1 rounded-md inline-block mb-3">
                          Featured Case Study
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#01A7E5] transition-colors mb-2">
                          {item.title}
                        </h3>
                        <div
                          className="text-sm text-gray-600 leading-relaxed font-normal [&_p]:m-0 [&_p]:inline line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      </div>
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#01A7E5] text-white font-semibold text-xs rounded-xl shadow-xs transition-all duration-300 group-hover:bg-[#018bc0]">
                          <span>View Project Details</span>
                          <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA Consultation Banner */}
          <div className="mt-16 sm:mt-24 rounded-3xl p-8 sm:p-12 text-center bg-gradient-to-r from-[#01A7E5] via-[#018bc0] to-[#015d7f] text-white shadow-xl w-full">
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Have a Similar Enterprise Vision for Your Business?
            </h3>
            <p className="text-sm sm:text-base text-cyan-100 max-w-2xl mx-auto mb-8 font-medium">
              Partner with Raise Tech to design, engineer, and deploy high-performing digital applications tailored specifically to your operational goals.
            </p>
            <Link
              href="/contact?subject=Portfolio%20Project%20Consultation"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#01A7E5] hover:bg-cyan-50 font-bold rounded-xl shadow-md transition-colors text-base"
            >
              <span>Schedule Free Technical Consultation</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Portfolio Detail Modal ──────────────────────────────────── */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-10"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image */}
            {getImageUrl(selectedItem.image) && (
              <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-3xl bg-slate-100">
                <Image
                  src={getImageUrl(selectedItem.image)}
                  alt={selectedItem.title}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {/* Modal Content */}
            <div className="p-8">
              <span className="text-xs font-bold text-[#01A7E5] uppercase tracking-wider bg-cyan-50 px-3 py-1 rounded-md inline-block mb-4">
                Featured Case Study
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                {selectedItem.title}
              </h2>
              <div
                className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: selectedItem.description }}
              />

              {/* Modal Actions */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/contact?subject=Inquiry%20regarding%20${encodeURIComponent(selectedItem.title)}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold rounded-xl shadow-xs transition-all duration-300"
                >
                  <span>Inquire About This Project</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
