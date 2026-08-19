import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ServiceDetail } from '@/lib/data/servicesData';

interface ServiceDetailSectionProps {
  service: ServiceDetail;
}

export default function ServiceDetailSection({ service }: ServiceDetailSectionProps) {
  const isImageRight = service.imagePosition === 'right';
  const isLightBlue = service.bgVariant === 'light-blue';

  return (
    <section
      id={service.id}
      className={`w-full py-16 sm:py-20 lg:py-24 transition-colors ${
        isLightBlue ? 'bg-[#f2fcff]' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16">
          {/* Text Content Column */}
          <div
            className={`flex flex-col justify-center ${
              isImageRight ? 'order-1 lg:order-1' : 'order-1 lg:order-2'
            }`}
          >
            {/* Decorative Script Title */}
            <p className="font-carattere text-5xl sm:text-6xl text-[#01A7E5] mb-2 leading-tight select-none">
              {service.scriptHeading}
            </p>

            {/* Subtitle Heading */}
            <h2 className="text-xl sm:text-2xl font-bold text-[#3c3c3c] tracking-tight mb-5 leading-snug">
              {service.subtitle}
            </h2>

            {/* Description Paragraphs: Text-Justified Alignment */}
            <div className="space-y-4 text-[#3c3c3c] text-base leading-relaxed font-normal text-justify [&_p]:text-justify">
              {service.paragraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Optional Call to Action */}
            {service.cta && (
              <div className="mt-8">
                <Link
                  href={service.cta.href}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#01A7E5] text-white font-semibold text-sm rounded-lg hover:bg-[#018bc0] transition-colors focus-visible:outline-2 focus-visible:outline-[#01A7E5] shadow-xs group"
                >
                  <span>{service.cta.label}</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* Image Illustration Column: Clean Uncropped View Without Border or Shadow */}
          <div
            className={`flex items-center justify-center ${
              isImageRight ? 'order-2 lg:order-2' : 'order-2 lg:order-1'
            }`}
          >
            <div className="w-full max-w-lg lg:max-w-xl flex items-center justify-center p-2">
              <Image
                src={service.imagePath}
                alt={service.imageAlt}
                width={800}
                height={600}
                className="w-full h-auto max-h-[480px] object-contain transition-transform duration-300 hover:scale-[1.01]"
                priority={service.id === 'web-development'}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
