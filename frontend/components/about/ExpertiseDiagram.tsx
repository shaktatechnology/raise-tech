import React from 'react';
import { EXPERTISE_ITEMS } from '@/lib/data/aboutData';
import Reveal from '@/components/motion/Reveal';
import StaggerGroup from '@/components/motion/StaggerGroup';
import StaggerItem from '@/components/motion/StaggerItem';

function getExpertiseIcon(id: string) {
  switch (id) {
    case 'modern-tech':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    case 'scalable-secure':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'user-centric':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      );
    case 'cross-platform':
    default:
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
  }
}

export default function ExpertiseDiagram() {
  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      {/* Header Pill Overlay */}
      <Reveal variant="fadeUp">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-cyan-100 mb-8 lg:mb-12 relative z-10 text-center lg:text-left">
          <h3 className="text-3xl sm:text-4xl font-bold text-[#01a7e5]">
            Our Expertise
          </h3>
          <p className="text-gray-600 text-sm sm:text-base mt-2 italic font-medium">
            Powered by knowledge & precision.
          </p>
        </div>
      </Reveal>

      {/* Hexagonal / Card Layout Grid */}
      <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {EXPERTISE_ITEMS.map((item, idx) => (
          <StaggerItem key={item.id}>
            <div
              className="group relative bg-gradient-to-br from-[#01A7E5] to-[#015D7F] text-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-center items-center text-center min-h-[150px] border border-cyan-300/20"
            >
              {/* Subtle decorative background icon */}
              <div className="absolute top-3 right-3 opacity-20 text-white pointer-events-none transition-transform duration-300 group-hover:scale-110">
                {getExpertiseIcon(item.id)}
              </div>

              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-200 mb-2">
                0{idx + 1}
              </span>
              <h4 className="text-lg sm:text-xl font-bold leading-snug">
                {item.title}
              </h4>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}
