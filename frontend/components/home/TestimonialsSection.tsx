"use client";

import React from 'react';
import Image from 'next/image';
import type { Testimonial } from '@/lib/types/home';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const current = testimonials[0];

  if (!current) {
    return null;
  }

  return (
    <section className="py-20 bg-[#f7fdff] text-[#404040] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <p className="font-carattere text-5xl sm:text-6xl text-[#01A7E5] drop-shadow-xs">Testimonials</p>
          <p className="text-gray-600 text-sm sm:text-base">
            What our clients think about our services
          </p>
        </div>

        {/* Testimonials Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column: Wall Graphic + Overlay Pill */}
          <div className="lg:col-span-5 relative h-72 sm:h-80 lg:h-auto min-h-[320px] rounded-3xl overflow-hidden shadow-lg border border-cyan-100/60">
            <Image
              src="/images/home/testimonial-main.png"
              alt="Testimonials Visual"
              fill
              className="object-cover object-center"
            />

            {/* Trusted Clients Bottom Overlay */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/80 shadow-md flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                Trusted Clients
              </span>
              <div className="flex items-center -space-x-2">
                <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white relative shrink-0">
                  <Image src="/images/home/avatar-1.png" alt="Client 1" fill className="object-cover" />
                </div>
                <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white relative shrink-0">
                  <Image src="/images/home/avatar-2.png" alt="Client 2" fill className="object-cover" />
                </div>
                <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white relative shrink-0">
                  <Image src="/images/home/avatar-3.png" alt="Client 3" fill className="object-cover" />
                </div>
                <div className="w-7 h-7 rounded-full bg-[#01A7E5] border-2 border-white flex items-center justify-center text-white text-xs font-bold shrink-0">
                  +
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Cyan Testimonial Card */}
          <div className="lg:col-span-7">
            <div className="bg-[#01A7E5] text-white p-8 sm:p-10 rounded-3xl shadow-xl relative h-full flex flex-col justify-between">
              <div>
                {/* Header: Quote Icon & Stars */}
                <div className="flex items-center justify-between mb-6">
                  {/* Quote Icon */}
                  <div className="text-white opacity-90">
                    <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>

                  {/* Star Rating (dynamic, from testimonial.rating) */}
                  <div className="flex items-center gap-1 text-white">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 fill-current ${
                          i < current.rating ? 'opacity-100' : 'opacity-30'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Testimonial Quote */}
                <blockquote className="text-white text-sm sm:text-base font-normal leading-relaxed mb-8">
                  {current.description}
                </blockquote>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/20">
                <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center font-bold text-white text-base shrink-0">
                  {getInitials(current.name)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base leading-snug">{current.name}</h4>
                  <p className="text-xs text-cyan-100 font-medium">
                    {[current.role, current.company_name].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}