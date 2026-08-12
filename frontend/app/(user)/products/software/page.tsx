"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { SoftwareItem } from "@/lib/types";

interface SoftwareSectionData {
  id: number;
  hero_image: string | null;
}

export default function SoftwarePage() {
  const [section, setSection] = useState<SoftwareSectionData | null>(null);
  const [softwareList, setSoftwareList] = useState<SoftwareItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSoftware, setSelectedSoftware] = useState<SoftwareItem | null>(null);

  useEffect(() => {
    async function loadSoftware() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi<{
          status: string;
          data: {
            section: SoftwareSectionData | null;
            items: SoftwareItem[];
          };
        }>("/software");

        if (res.data) {
          setSection(res.data.section);
          setSoftwareList(res.data.items || []);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load software products.");
      } finally {
        setLoading(false);
      }
    }
    loadSoftware();
  }, []);

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 overflow-hidden">
        {section?.hero_image && (
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img
              src={getImageUrl(section.hero_image)!}
              alt="Software Hero Background"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="max-w-7xl mx-auto text-center space-y-4 relative z-10">
          <span className="px-3.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            Enterprise Software Solutions
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Pre-Built & Custom Software Suites
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Discover tailored software platforms, POS billing systems, hospital management software, and enterprise solutions developed by Raise Tech.
          </p>
        </div>
      </section>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-slate-500 space-y-3">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-400">Loading software products catalog...</p>
          </div>
        ) : softwareList.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-3">
            <svg className="w-14 h-14 text-purple-400/50 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h3 className="text-base font-bold text-white">No Software Products Listed</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Our active software suite catalog is currently being updated.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {softwareList.map((sw) => {
              const imageSrc = getImageUrl(sw.image);
              return (
                <div
                  key={sw.id}
                  className="group bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-purple-950/30"
                >
                  <div>
                    {imageSrc ? (
                      <div className="w-full h-44 bg-slate-950 rounded-2xl overflow-hidden mb-5 border border-slate-800">
                        <img
                          src={imageSrc}
                          alt={sw.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-black flex items-center justify-center text-base mb-5">
                        SW
                      </div>
                    )}

                    <h3 className="text-xl font-extrabold text-white group-hover:text-purple-400 transition-colors mb-2">
                      {sw.title}
                    </h3>
                    {sw.slogan && (
                      <p className="text-purple-300 text-xs font-semibold mb-3 leading-snug">
                        {sw.slogan}
                      </p>
                    )}
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                      {sw.description || "Comprehensive enterprise software solution tailored to meet modern industry requirements."}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedSoftware(sw)}
                      className="text-xs font-bold text-purple-400 group-hover:text-purple-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>Explore Features</span>
                      <span>→</span>
                    </button>
                    <Link
                      href="/contact"
                      className="px-3.5 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded-xl text-xs font-semibold transition"
                    >
                      Request Demo
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for detailed overview */}
        {selectedSoftware && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-5">
              <button
                onClick={() => setSelectedSoftware(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                ✕
              </button>

              {getImageUrl(selectedSoftware.image) && (
                <div className="w-full h-48 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
                  <img
                    src={getImageUrl(selectedSoftware.image)!}
                    alt={selectedSoftware.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold">
                  RaiseTech Software Suite
                </span>
                <h3 className="text-2xl font-black text-white mt-1">{selectedSoftware.title}</h3>
                {selectedSoftware.slogan && (
                  <p className="text-purple-300 text-xs font-semibold mt-1">{selectedSoftware.slogan}</p>
                )}
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Product Description</h4>
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {selectedSoftware.description || "No description provided."}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedSoftware(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
                <Link
                  href="/contact"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-purple-950/40"
                >
                  Contact for Licensing
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
