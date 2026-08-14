import React from 'react';
import Image from 'next/image';
import { ABOUT_PAGE_COPY } from '@/lib/data/aboutData';
import { isValidImageSrc } from '@/lib/data/getAboutPageData';

interface CompanyIntroductionProps {
  aboutDescription?: string | null;
  aboutImage?: string | null;
}

export default function CompanyIntroduction({ aboutDescription, aboutImage }: CompanyIntroductionProps) {
  // The admin writes this with a rich text editor, so it's stored as HTML.
  // Falls back to the static two-paragraph copy if the admin hasn't set one yet.
  const hasDescription = Boolean(aboutDescription && aboutDescription.trim());

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

            {hasDescription ? (
              <div
                className="prose prose-p:text-gray-700 prose-p:text-base sm:prose-p:text-lg prose-p:leading-relaxed prose-headings:text-[#3c3c3c] prose-a:text-[#01a7e5] prose-strong:text-[#3c3c3c] max-w-none text-justify"
                dangerouslySetInnerHTML={{ __html: aboutDescription as string }}
              />
            ) : (
              <div className="space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed text-justify">
                <p>{ABOUT_PAGE_COPY.companyDescParagraph1}</p>
                <p>{ABOUT_PAGE_COPY.companyDescParagraph2}</p>
              </div>
            )}
          </div>

          {/* Right Column: About Section Image */}
          <div className="lg:col-span-5 w-full">
            <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[460px] rounded-2xl overflow-hidden shadow-xl border border-cyan-100">
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