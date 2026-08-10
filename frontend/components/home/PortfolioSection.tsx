"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PORTFOLIO_DATA } from '@/lib/data/homeData';

export default function PortfolioSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % PORTFOLIO_DATA.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + PORTFOLIO_DATA.length) % PORTFOLIO_DATA.length);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  const currentProject = PORTFOLIO_DATA[currentIndex];

  return (
    <section className="py-20 bg-white text-[#404040]" tabIndex={0} onKeyDown={handleKeyDown} aria-label="Portfolio Section Carousel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <p className="font-carattere text-3xl sm:text-4xl text-[#01A7E5]">Featured Work</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#404040] tracking-tight">
              Our Recent Projects & Products
            </h2>
          </div>

          {/* Carousel Navigation Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-[#01A7E5] hover:text-white hover:border-[#01A7E5] transition-colors focus-visible:outline-2 focus-visible:outline-[#01A7E5]"
              aria-label="Previous portfolio project"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-[#01A7E5] hover:text-white hover:border-[#01A7E5] transition-colors focus-visible:outline-2 focus-visible:outline-[#01A7E5]"
              aria-label="Next portfolio project"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel Main Card Display */}
        <div className="bg-[#f2fcff] rounded-3xl border border-cyan-100 overflow-hidden shadow-lg p-6 lg:p-10 transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Image Column */}
            <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-[400px] w-full rounded-2xl overflow-hidden bg-slate-100 border border-cyan-200/60 shadow-xs">
              <Image
                src={currentProject.image}
                alt={currentProject.title}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Details Column */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                {currentProject.category}
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#404040]">
                {currentProject.title}
              </h3>

              <p className="text-gray-600 text-base leading-relaxed">
                {currentProject.description}
              </p>

              {/* Tags */}
              {currentProject.tags && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {currentProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white text-gray-700 text-xs font-medium rounded-lg border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA Link */}
              <div className="pt-4">
                <Link
                  href={currentProject.href || '/about'}
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#01A7E5] hover:bg-[#018bc0] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-[#01A7E5]"
                >
                  <span>View Project Details</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex justify-center items-center gap-2 mt-8 pt-4 border-t border-cyan-200/40">
            {PORTFOLIO_DATA.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[#01A7E5] ${
                  currentIndex === index ? 'w-8 bg-[#01A7E5]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
