"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Portfolio } from '@/lib/types/home';
import { getImageUrl } from '@/lib/api';
import EnhancedImage from '@/components/ui/EnhancedImage';

interface PortfolioSectionProps {
  portfolio: Portfolio[];
}

export default function PortfolioSection({ portfolio }: PortfolioSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Portfolio | null>(null);

  // Show up to 3 featured items.
  const items = portfolio.slice(0, 3);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-[#f7fdff] text-[#404040]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Project Cards Row & Pagination */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-3 gap-4 sm:gap-6 items-center">
              {items.map((project, idx) => {
                const imgUrl = getImageUrl(project.image);
                const isActive = activeIndex === idx;

                return (
                  <div
                    key={project.id}
                    onClick={() => {
                      setActiveIndex(idx);
                      setSelectedItem(project);
                    }}
                    className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all duration-300 transform hover:-translate-y-1.5 group ${
                      isActive
                        ? 'ring-4 ring-emerald-500 shadow-xl scale-102'
                        : 'opacity-85 hover:opacity-100 hover:shadow-lg'
                    }`}
                  >
                    {imgUrl ? (
                      <EnhancedImage
                        src={imgUrl}
                        alt={project.title}
                        fill
                        className="object-cover object-center"
                        containerClassName="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-semibold p-2 text-center">
                        {project.title}
                      </div>
                    )}

                    {/* Hover Overlay — "Click to View" */}
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center pointer-events-none gap-1.5">
                      <div className="w-9 h-9 rounded-full bg-white/95 text-emerald-600 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <span className="text-white text-[10px] font-bold tracking-wide">View Details</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Indicators */}
            <div className="flex items-center gap-2 pt-2">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeIndex === idx
                      ? 'w-9 bg-emerald-500 shadow-xs'
                      : 'w-2.5 bg-emerald-200 hover:bg-emerald-300'
                  }`}
                  aria-label={`Go to project ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Title & Subtitle */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <Link href="/portfolio" className="inline-block group">
              <p className="font-carattere text-6xl sm:text-7xl text-emerald-600 drop-shadow-xs animate-pulse-glow group-hover:text-emerald-700 transition-colors">
                Portfolio
              </p>
            </Link>

            <h2 className="text-xl sm:text-2xl font-medium leading-snug text-gray-800">
              A showcase of our{' '}
              <span className="font-bold text-emerald-600 block sm:inline">
                Expertise, Creativity, &amp; Successful projects.
              </span>
            </h2>

            <div className="pt-2">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>View Full Portfolio</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Portfolio Detail Modal (same as /portfolio page) ──────── */}
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
    </section>
  );
}
