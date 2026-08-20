"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SoftwareItem } from '@/lib/types';
import { fetchApi, getApiErrorMessage, getImageUrl } from '@/lib/api';
import Reveal from '@/components/motion/Reveal';
import StaggerGroup from '@/components/motion/StaggerGroup';
import StaggerItem from '@/components/motion/StaggerItem';

export default function SoftwareProductsGrid() {
  const [softwareList, setSoftwareList] = useState<SoftwareItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSoftware() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi<{
          status: string;
          data: {
            section: unknown;
            items: SoftwareItem[];
          };
        }>("/software");

        if (res.data) {
          setSoftwareList(res.data.items || []);
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Failed to load software products."));
      } finally {
        setLoading(false);
      }
    }
    loadSoftware();
  }, []);

  return (
    <section className="w-full py-14 sm:py-20 bg-[#f2fcff] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <Reveal variant="fadeUp" className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-sm font-bold uppercase tracking-wider text-[#01A7E5]">
            Custom Business Applications
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#404040] tracking-tight mt-2">
            Tailored Enterprise Software Engineered for High Growth
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3">
            Explore ready-to-deploy POS systems, billing platforms, GPS tracking, ERP, and custom business management tools.
          </p>
        </Reveal>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-3 border-[#01A7E5] border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-500 text-sm font-medium">Loading software products...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="text-sm text-rose-700 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && softwareList.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-gray-100 max-w-md mx-auto">
            <div className="text-5xl mb-4">💻</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Software Products</h3>
            <p className="text-sm text-gray-500">Software products are coming soon. Check back later!</p>
          </div>
        )}

        {/* 3-Column Grid */}
        {!loading && !error && softwareList.length > 0 && (
          <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {softwareList.map((item) => {
              const imageUrl = getImageUrl(item.image);
              return (
                <StaggerItem key={item.id}>
                  <div
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100/90 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between h-full overflow-hidden group"
                  >
                    {/* Software Image: Uncropped Full View */}
                    {imageUrl && (
                      <div className="relative w-full h-52 sm:h-60 bg-slate-50/80 overflow-hidden flex items-center justify-center p-3 border-b border-gray-100">
                        <Image
                          src={imageUrl}
                          alt={item.title}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain object-center p-2 transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    <div className="p-6 sm:p-7 flex-1 flex flex-col">
                      {/* Product Title */}
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#01A7E5] transition-colors mb-2">
                        {item.title}
                      </h3>

                      {/* Slogan */}
                      {item.slogan && (
                        <p className="text-xs font-semibold text-[#01A7E5] uppercase tracking-wider mb-3">
                          {item.slogan}
                        </p>
                      )}

                      {item.description && (
                        <div
                          className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-4 [&_p]:m-0 [&_p]:inline"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      )}
                    </div>

                    {/* CTA Footer */}
                    <div className="p-6 sm:p-7 pt-4 bg-slate-50/50 border-t border-gray-100 flex items-center justify-end gap-2">
                      <Link
                        href={`/contact?subject=Demo%20Request%20for%20${encodeURIComponent(item.title)}`}
                        className="px-4 py-2.5 text-center bg-[#01A7E5] hover:bg-[#018ec3] text-white font-semibold text-sm rounded-xl shadow-xs transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                      >
                        Request Demo
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        )}

        {/* Custom Software CTA Banner */}
        <Reveal variant="fadeUp" className="mt-16 sm:mt-20 rounded-3xl p-8 sm:p-12 text-center bg-gradient-to-r from-[#01A7E5] to-[#0070a0] text-white shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Require a Custom Enterprise Software Solution?
          </h3>
          <p className="text-sm sm:text-base text-cyan-100 max-w-2xl mx-auto mb-8 font-medium">
            We design, develop, and deploy tailor-made web, mobile, and cloud software built specifically around your business workflows.
          </p>
          <Link
            href="/contact?subject=Custom%20Software%20Consultation"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#01A7E5] hover:bg-cyan-50 font-bold rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02] text-base"
          >
            <span>Schedule Free Technical Consultation</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
