import React from 'react';
import Image from 'next/image';
import { ABOUT_PAGE_COPY, WHAT_WE_DO_ITEMS } from '@/lib/data/aboutData';

function getProductIcon(id: string) {
  switch (id) {
    case 'trackingmandu':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'ecalculo':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m-6 4h6m-6 4h4m-6 4h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'crm':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'web-dev':
    default:
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
  }
}

export default function WhatWeDoSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#f2fcff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-10 sm:mb-14">
          <h2 className="font-carattere text-5xl sm:text-6xl text-[#01a7e5]">
            {ABOUT_PAGE_COPY.whatWeDoHeading}
          </h2>
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
            {ABOUT_PAGE_COPY.whatWeDoSubtitle}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Team / Company Image */}
          <div className="lg:col-span-5 relative w-full h-[350px] sm:h-[450px] lg:h-[580px] rounded-2xl overflow-hidden shadow-xl border border-cyan-100 group">
            <Image
              src="/images/about/raise-tech-team.png"
              alt="Raise Tech Engineering Team & Office Culture"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Right Column: 4 Product Cards */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {WHAT_WE_DO_ITEMS.map((item) => (
              <div
                key={item.id}
                className="group relative bg-gradient-to-r from-[#01a7e5] via-[#0188ba] to-[#015d7f] text-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border border-cyan-300/20"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 text-white transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/30">
                    {getProductIcon(item.id)}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold mb-1">
                      {item.title}
                    </h3>
                    <p className="text-cyan-50 text-sm sm:text-base italic leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

