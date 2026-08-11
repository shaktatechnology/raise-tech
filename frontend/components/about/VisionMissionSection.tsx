import React from 'react';
import { ABOUT_PAGE_COPY } from '@/lib/data/aboutData';

export default function VisionMissionSection() {
  return (
    <section className="py-16 sm:py-20 bg-[#f2fcff] text-center border-t border-cyan-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <h2 className="font-carattere text-5xl sm:text-6xl text-[#01a7e5]">
          {ABOUT_PAGE_COPY.visionMissionHeading}
        </h2>
        <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-normal">
          {ABOUT_PAGE_COPY.visionMissionBody}
        </p>
      </div>
    </section>
  );
}
