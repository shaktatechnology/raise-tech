"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi, getApiErrorMessage, getImageUrl } from "@/lib/api";
import Reveal from "@/components/motion/Reveal";
import PageIntro from "@/components/motion/PageIntro";

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
      } catch (err: unknown) {
        console.error("Failed to fetch public services:", err);
        setError(getApiErrorMessage(err, "Failed to load services."));
      } finally {
        setLoading(false);
      }
    }
    const timeoutId = window.setTimeout(() => void loadServices(), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const heroImageUrl = getImageUrl(headerData?.hero_image) || "/images/services/services-hero.png";

  return (
    <PageIntro className="w-full">
      {/* Dynamic Hero Banner */}
      <section className="relative w-full h-[280px] sm:h-[360px] md:h-[440px] lg:h-[520px] overflow-hidden bg-[#022c43] flex items-center justify-center">
        <Image
          src={heroImageUrl}
          alt="Raise Tech Services Banner"
          fill
          priority
          unoptimized
          className="object-cover [object-position:75%_center]"
        />

        {/* Vibrant Cyan-Blue Cover Up Color Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#01a7e5]/90 via-[#01a7e5]/40 to-transparent pointer-events-none" />
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
                    <Reveal
                      key={service.id}
                      variant="fadeUp"
                      className={`flex flex-col lg:flex-row items-center gap-10 lg:gap-16 bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 ${
                        isEven ? "" : "lg:flex-row-reverse"
                      }`}
                    >
                      {/* Image Column */}
                      {imageUrl && (
                        <div className="w-full lg:w-1/2 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={service.title}
                            width={800}
                            height={600}
                            unoptimized
                            className="w-full h-auto max-h-[480px] object-contain transition-transform duration-500 hover:scale-[1.03]"
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

                        <div
                          className="text-sm sm:text-base text-gray-600 leading-relaxed text-justify [&_p]:text-justify [&_p]:mb-2 [&_p:last-child]:mb-0"
                          dangerouslySetInnerHTML={{ __html: service.description }}
                        />

                        <div className="pt-4">
                          <Link
                            href={`/contact?subject=Inquiry%20about%20${encodeURIComponent(service.title)}`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold text-sm rounded-xl shadow-xs transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                          >
                            <span>Get Technical Consultation</span>
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
            </div>
          )}
        </div>
      </section>
    </PageIntro>
  );
}
