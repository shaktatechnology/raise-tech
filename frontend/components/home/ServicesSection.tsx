import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { HomeService } from '@/lib/types/home';

// The /home API doesn't return icons or links for services yet, so we cycle
// through the existing local icon set by index and link everything to /services.
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
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="font-carattere text-5xl sm:text-6xl text-[#01A7E5] drop-shadow-xs">Our Services</p>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            These are specialized services delivered by professionals with proven expertise, designed to ensure performance, security, and long-term reliability.
          </p>
        </div>

        {services.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">No services to display yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {services.map((service, index) => {
              const isActive = index === 0; // First card highlighted, same as before
              const iconPath = SERVICE_ICONS[index % SERVICE_ICONS.length];

              return (
                <Link
                  key={service.id}
                  href="/services"
                  className={`relative p-6 sm:p-7 rounded-2xl transition-all duration-300 flex flex-col justify-start text-center items-center shadow-xs hover:shadow-lg hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-[#01A7E5] ${
                    isActive
                      ? 'bg-[#01A7E5] text-white'
                      : 'bg-white text-[#404040] border border-cyan-50'
                  }`}
                >
                  {/* Circular Icon Container */}
                  <div
                    className={`w-16 h-16 mb-5 rounded-full flex items-center justify-center p-3.5 shadow-sm ${
                      isActive ? 'bg-white text-[#01A7E5]' : 'bg-[#01A7E5] text-white'
                    }`}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src={iconPath}
                        alt={service.title}
                        fill
                        className={`object-contain ${
                          isActive ? '' : 'filter brightness-0 invert'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Service Title */}
                  <h3
                    className={`text-lg font-bold mb-3 ${
                      isActive ? 'text-white' : 'text-[#404040]'
                    }`}
                  >
                    {service.title}
                  </h3>

                  {/* Service Description */}
                  <p
                    className={`text-xs sm:text-sm leading-relaxed font-normal ${
                      isActive ? 'text-cyan-50' : 'text-gray-500'
                    }`}
                  >
                    {service.description}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}