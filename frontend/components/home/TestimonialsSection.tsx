"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { TESTIMONIALS_DATA } from '@/lib/data/homeData';

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS_DATA.length) % TESTIMONIALS_DATA.length);
  }, []);

  const current = TESTIMONIALS_DATA[currentIndex];

  return (
    <section className="py-20 bg-[#f2fcff] text-[#404040] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="font-carattere text-3xl sm:text-4xl text-[#01A7E5]">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#404040] tracking-tight">
            What Our Clients Say About Us
          </h2>
          <p className="text-gray-600 text-base">
            Trusted by top enterprises, financial institutions, and fast-growing organizations.
          </p>
        </div>

        {/* Testimonials Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Visual Image Column */}
          <div className="lg:col-span-5 relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-xl border border-cyan-100">
            <Image
              src="/images/home/testimonial-main.png"
              alt="Testimonials Supporting Image"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#01A7E5]/40 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 text-xs font-semibold text-gray-800">
              Transforming businesses with proven digital products & reliable engineering.
            </div>
          </div>

          {/* Testimonial Card Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-lg border border-cyan-100/80 relative">
              {/* Quote Icon */}
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-[#01A7E5] mb-6">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1 mb-4 text-amber-400">
                {[...Array(current.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote Text */}
              <blockquote className="text-gray-700 text-lg sm:text-xl italic font-normal leading-relaxed mb-8">
                &ldquo;{current.quote}&rdquo;
              </blockquote>

              {/* Author Details */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#01A7E5] shrink-0">
                    <Image
                      src={current.avatar}
                      alt={current.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#404040] text-base">{current.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">
                      {current.role} &bull; {current.company}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevTestimonial}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#01A7E5] hover:text-white hover:border-[#01A7E5] transition-colors focus-visible:outline-2 focus-visible:outline-[#01A7E5]"
                    aria-label="Previous testimonial"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={nextTestimonial}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#01A7E5] hover:text-white hover:border-[#01A7E5] transition-colors focus-visible:outline-2 focus-visible:outline-[#01A7E5]"
                    aria-label="Next testimonial"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
