"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { PORTFOLIO_DATA } from '@/lib/data/homeData';

export default function PortfolioSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-20 bg-[#f7fdff] text-[#404040]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Project Cards Row & Pagination */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-3 gap-4 sm:gap-6 items-center">
              {PORTFOLIO_DATA.map((project, idx) => (
                <div
                  key={project.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all duration-300 transform hover:-translate-y-1 ${
                    activeIndex === idx
                      ? 'ring-4 ring-emerald-500 shadow-xl scale-102'
                      : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover object-center"
                  />
                </div>
              ))}
            </div>

            {/* Pagination Indicators */}
            <div className="flex items-center gap-2 pt-2">
              {PORTFOLIO_DATA.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === idx ? 'w-8 bg-emerald-500' : 'w-2 bg-emerald-200'
                  }`}
                  aria-label={`Go to project ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Title & Subtitle */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <p className="font-carattere text-6xl sm:text-7xl text-emerald-600 drop-shadow-xs">
              Portfolio
            </p>

            <h2 className="text-xl sm:text-2xl font-medium leading-snug text-gray-800">
              A showcase of our{' '}
              <span className="font-bold text-emerald-600 block sm:inline">
                Expertise, Creativity, & Successful projects.
              </span>
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

