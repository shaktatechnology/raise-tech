"use client";

import React from 'react';
import Image from 'next/image';
import type { HomeService } from '@/lib/types/home';
import Reveal from '@/components/motion/Reveal';
import StaggerGroup from '@/components/motion/StaggerGroup';
import StaggerItem from '@/components/motion/StaggerItem';

const SERVICE_ICONS = [
  '/images/home/service-1.png',
  '/images/home/service-2.png',
  '/images/home/service-3.png',
  '/images/home/service-4.png',
  '/images/home/service-5.png',
  '/images/home/service-6.png',
  '/images/home/service-7.png',
  '/images/home/service-8.png',
];

interface ServicesSectionProps {
  services: HomeService[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section className="py-20 bg-[#f7fdff] text-[#404040]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal variant="fadeUp" className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="font-carattere text-5xl sm:text-6xl text-[#01A7E5] drop-shadow-xs">Our Services</p>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            These are specialized services delivered by professionals with proven expertise, designed to ensure performance, security, and long-term reliability.
          </p>
        </Reveal>

        {services.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">No services to display yet.</p>
        ) : (
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {services.map((service, index) => {
              const isActive = index === 0;
              const iconPath = SERVICE_ICONS[index % SERVICE_ICONS.length];

              return (
                <StaggerItem key={service.id}>
                  <div
                    className={`group relative block h-full p-6 sm:p-7 rounded-2xl transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl ${
                      isActive
                        ? 'bg-[#01A7E5] text-white shadow-md'
                        : 'bg-white text-[#404040] border border-cyan-50 shadow-xs hover:border-[#01A7E5]/30'
                    }`}
                  >
                    {/* Circular Icon Container with Micro-scale on Hover */}
                    <div
                      className={`w-16 h-16 mb-5 rounded-full flex items-center justify-center p-3.5 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                        isActive ? 'bg-white text-[#01A7E5]' : 'bg-[#01A7E5] text-white'
                      }`}
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Image
                          src={iconPath}
                          alt={service.title}
                          fill
                          className={`object-contain transition-transform duration-300 ${
                            isActive ? '' : 'filter brightness-0 invert'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Service Title */}
                    <h3
                      className={`text-lg font-bold mb-3 transition-colors ${
                        isActive ? 'text-white' : 'text-[#404040] group-hover:text-[#01A7E5]'
                      }`}
                    >
                      {service.title}
                    </h3>

                    {/* Service Description */}
                    <div
                      className={`text-xs sm:text-sm leading-relaxed font-normal [&_p]:m-0 [&_p]:inline ${
                        isActive ? 'text-cyan-50' : 'text-gray-500'
                      }`}
                      dangerouslySetInnerHTML={{ __html: service.description }}
                    />
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        )}
      </div>
    </section>
  );
}