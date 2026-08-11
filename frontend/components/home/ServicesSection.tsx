import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SERVICES_DATA } from '@/lib/data/homeData';

export default function ServicesSection() {
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

        {/* Services Grid (8 cards in 4x2 grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {SERVICES_DATA.map((service, index) => {
            const isActive = index === 0; // First card "Security Services" is highlighted blue in mockup

            return (
              <Link
                key={service.id}
                href={service.href || '/services'}
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
                      src={service.iconPath}
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
      </div>
    </section>
  );
}

