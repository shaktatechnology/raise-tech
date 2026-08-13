"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

export interface ServiceHeaderAPI {
  id: number;
  title: string | null;
  hero_image: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ServiceAPI {
  id: number;
  title: string;
  slogan: string | null;
  image: string | null;
  description: string;
  order: number;
  is_active: boolean | number;
  created_at: string | null;
  updated_at: string | null;
}

export default function ServicesPageContent() {
  const [headerData, setHeaderData] = useState<ServiceHeaderAPI | null>(null);
  const [services, setServices] = useState<ServiceAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadServices() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi<{
          header: ServiceHeaderAPI | null;
          services: ServiceAPI[];
        }>("/services");

        if (res) {
          setHeaderData(res.header || null);
          setServices((res.services || []).filter((s) => Boolean(s.is_active)));
        }
      } catch (err: any) {
        console.error("Failed to fetch public services:", err);
        setError(err.message || "Failed to load services.");
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    if (path.startsWith("/storage/")) return `http://localhost:8000${path}`;
    if (path.startsWith("storage/")) return `http://localhost:8000/${path}`;
    if (path.startsWith("/")) return `http://localhost:8000${path}`;
    return `http://localhost:8000/storage/${path}`;
  };

  const heroImageUrl = getImageUrl(headerData?.hero_image) || "/images/services/services-hero.png";
  const heroTitle = headerData?.title || "Comprehensive IT & Software Solutions Designed to Scale Your Enterprise";

  return (
    <div className="w-full">
      {/* Dynamic Hero Banner */}
      <section className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[560px] overflow-hidden bg-[#022c43]">
        <Image
          src={heroImageUrl}
          alt="Raise Tech Services Banner"
          fill
          priority
          unoptimized
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#01a7e5]/90 via-[#01a7e5]/30 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
            Services
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-cyan-50 max-w-2xl font-medium leading-relaxed">
            {heroTitle}
          </p>
        </div>
      </section>

      {/* Services List Content */}
      <section className="py-16 sm:py-24 bg-[#f8fdff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="py-20 text-center text-gray-500">
              <div className="w-8 h-8 border-3 border-[#01A7E5] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-medium">Loading service offerings...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-md mx-auto my-8">
              <div className="text-3xl mb-2">⚠️</div>
              <p className="text-sm text-rose-700 font-medium">{error}</p>
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 max-w-lg mx-auto">
              <div className="text-5xl mb-4">🛠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Services</h2>
              <p className="text-sm text-gray-500">Check back later for updated IT and supply offerings.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {services
                .sort((a, b) => a.order - b.order)
                .map((service, idx) => {
                  const imageUrl = getImageUrl(service.image);
                  const isEven = idx % 2 === 0;

                  return (
                    <div
                      key={service.id}
                      className={`flex flex-col lg:flex-row items-center gap-10 lg:gap-16 bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 ${
                        isEven ? "" : "lg:flex-row-reverse"
                      }`}
                    >
                      {/* Image Column */}
                      {imageUrl && (
                        <div className="relative w-full lg:w-1/2 h-64 sm:h-80 rounded-2xl overflow-hidden shadow-md shrink-0 bg-slate-50">
                          <Image
                            src={imageUrl}
                            alt={service.title}
                            fill
                            unoptimized
                            className="object-cover object-center"
                          />
                        </div>
                      )}

                      {/* Content Column */}
                      <div className="flex-1 space-y-4">
                        <div className="inline-block px-3 py-1 bg-cyan-50 text-[#01A7E5] text-xs font-bold uppercase tracking-wider rounded-md">
                          Service #{service.order}
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                          {service.title}
                        </h2>

                        {service.slogan && (
                          <p className="text-sm font-semibold text-[#01A7E5]">
                            {service.slogan}
                          </p>
                        )}

                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
                          {service.description}
                        </p>

                        <div className="pt-4">
                          <Link
                            href={`/contact?subject=Inquiry%20about%20${encodeURIComponent(service.title)}`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
                          >
                            <span>Get Technical Consultation</span>
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}