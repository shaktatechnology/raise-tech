import React from 'react';
import { ABOUT_PAGE_COPY } from '@/lib/data/aboutData';
import Reveal from '@/components/motion/Reveal';

interface VisionMissionSectionProps {
  mission?: string | null;
}

export default function VisionMissionSection({ mission }: VisionMissionSectionProps) {
  const hasMission = Boolean(mission && mission.trim());

  if (!hasMission) {
    return (
      <section className="py-16 sm:py-20 bg-[#f2fcff] text-center border-t border-cyan-100">
        <Reveal variant="fadeUp" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h2 className="font-carattere text-5xl sm:text-6xl text-[#01a7e5]">
            {ABOUT_PAGE_COPY.visionMissionHeading}
          </h2>
          <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed max-w-5xl mx-auto font-normal text-justify sm:text-center">
            {ABOUT_PAGE_COPY.visionMissionBody}
          </p>
        </Reveal>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-[#f2fcff] text-center border-t border-cyan-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <Reveal variant="fadeUp">
          <h2 className="font-carattere text-5xl sm:text-6xl text-[#01a7e5]">
            {ABOUT_PAGE_COPY.visionMissionHeading}
          </h2>
        </Reveal>

        <Reveal variant="fadeUp" delay={0.15} className="text-center">
          <div className="p-6 sm:p-8">
            <div
              className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-5xl mx-auto [&_p]:mb-3 [&_p:last-child]:mb-0 font-normal text-justify sm:text-center"
              dangerouslySetInnerHTML={{ __html: mission as string }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}