import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SERVICES_DATA } from '@/lib/data/homeData';

export default function ServicesSection() {
  return (
    <section className="py-20 bg-[#f2fcff] text-[#404040]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="font-carattere text-3xl sm:text-4xl text-[#01A7E5]">Our Services</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#404040] tracking-tight">
            High Quality Technology & Software Services
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            From enterprise cybersecurity and financial software engines to cloud server management and bespoke web development, we deliver tailored solutions that propel your operations forward.
          </p>
        </div>

        {/* Services Grid (8 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES_DATA.map((service) => (
            <Link
              key={service.id}
              href={service.href || '/services'}
              className="group bg-white p-6 rounded-2xl border border-cyan-100/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-[#01A7E5]"
            >
              <div>
                {/* Icon Wrapper */}
                <div className="w-14 h-14 mb-6 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center p-3 group-hover:bg-[#01A7E5] transition-colors duration-300">
                  <div className="relative w-full h-full">
                    <Image
                      src={service.iconPath}
                      alt={service.title}
                      fill
                      className="object-contain filter group-hover:brightness-0 group-hover:invert transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Service Title */}
                <h3 className="text-lg font-bold text-[#404040] group-hover:text-[#01A7E5] transition-colors mb-2.5">
                  {service.title}
                </h3>

                {/* Service Description */}
                <p className="text-sm text-gray-600 leading-relaxed font-normal">
                  {service.description}
                </p>
              </div>

              {/* Learn More link */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-xs font-bold text-[#01A7E5] group-hover:text-[#018bc0]">
                <span>Explore Feature</span>
                <svg
                  className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
