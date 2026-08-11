import React from 'react';
import { ABOUT_PAGE_COPY } from '@/lib/data/aboutData';
import ExpertiseDiagram from './ExpertiseDiagram';

export default function CompanyIntroduction() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h1 className="font-carattere text-5xl sm:text-6xl lg:text-7xl text-[#01a7e5] block leading-tight">
                {ABOUT_PAGE_COPY.companyTitle}
              </h1>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium text-[#3c3c3c] mt-2">
                {ABOUT_PAGE_COPY.companySubtitle}
              </h2>
            </div>

            <div className="space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed text-justify">
              <p>{ABOUT_PAGE_COPY.companyDescParagraph1}</p>
              <p>{ABOUT_PAGE_COPY.companyDescParagraph2}</p>
            </div>
          </div>

          {/* Right Column: Expertise Section */}
          <div className="lg:col-span-5 w-full">
            <ExpertiseDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}
