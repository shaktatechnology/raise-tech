import React from 'react';
import Image from 'next/image';
import { ABOUT_PAGE_COPY } from '@/lib/data/aboutData';
import { isValidImageSrc } from '@/lib/data/getAboutPageData';

interface CompanyIntroductionProps {
  aboutDescription?: string | null;
  aboutImage?: string | null;
}

export default function CompanyIntroduction({ aboutDescription, aboutImage }: CompanyIntroductionProps) {
  // Admin writes one free-text description; split on blank lines into paragraphs.
  // Falls back to the static two-paragraph copy if the admin hasn't set one yet.
  const paragraphs =
    aboutDescription && aboutDescription.trim()
      ? aboutDescription.split(/\n{2,}/).filter(Boolean)
      : [ABOUT_PAGE_COPY.companyDescParagraph1, ABOUT_PAGE_COPY.companyDescParagraph2];

  const imageSrc = isValidImageSrc(aboutImage) ? aboutImage : '/images/about/company-intro.png';

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
              {paragraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>

          {/* Right Column: About Section Image */}
          <div className="lg:col-span-5 w-full">
            <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[460px] rounded-2xl overflow-hidden">
              <Image
                src={imageSrc}
                alt="Raise Tech Pvt. Ltd. - About Us"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}