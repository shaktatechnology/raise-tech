import React from 'react';
import Link from 'next/link';
import { ABOUT_PAGE_COPY, WHY_CHOOSE_US_ITEMS } from '@/lib/data/aboutData';
import type { WhyChooseUsApiItem } from '@/lib/data/getAboutPageData';

function getWhyChooseUsIcon(index: number, isBlue: boolean) {
  const iconClass = `w-6 h-6 ${isBlue ? 'text-[#01a7e5]' : 'text-white'}`;
  const icons = [
    <svg key="0" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>,
    <svg key="1" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>,
    <svg key="2" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>,
    <svg key="3" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>,
  ];
  return icons[index % icons.length];
}

interface NormalizedWhyChooseUsItem {
  id: string | number;
  title: string;
  description: string;
  highlighted: boolean;
  ctaText: string;
  ctaHref: string;
}

interface WhyChooseUsSectionProps {
  items?: WhyChooseUsApiItem[];
}

export default function WhyChooseUsSection({ items }: WhyChooseUsSectionProps) {
  // API only gives { id, name, description } — normalize to the shape this
  // component renders, defaulting the CTA and highlighting the first card.
  const displayItems: NormalizedWhyChooseUsItem[] =
    items && items.length > 0
      ? items.map((item, idx) => ({
          id: item.id,
          title: item.name,
          description: item.description,
          highlighted: idx === 0,
          ctaText: 'Join Now',
          ctaHref: '/contact',
        }))
      : WHY_CHOOSE_US_ITEMS.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          highlighted: Boolean(item.highlighted),
          ctaText: item.ctaText,
          ctaHref: item.ctaHref,
        }));

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-10 sm:mb-14">
          <h2 className="font-carattere text-5xl sm:text-6xl text-[#01a7e5]">
            {ABOUT_PAGE_COPY.whyChooseUsHeading}
          </h2>
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
            {ABOUT_PAGE_COPY.whyChooseUsSubtitle}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayItems.map((card, idx) => {
            const isBlue = card.highlighted;
            return (
              <div
                key={card.id}
                className={`group flex flex-col justify-between p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-1.5 shadow-md hover:shadow-xl border ${
                  isBlue
                    ? 'bg-[#01a7e5] text-white border-[#01a7e5]'
                    : 'bg-[#f2fcff] text-[#3c3c3c] border-cyan-100 hover:border-[#01a7e5]/50'
                }`}
              >
                <div className="space-y-4">
                  {/* Icon Container */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl transition-transform duration-300 group-hover:scale-110 ${
                      isBlue
                        ? 'bg-white text-[#01a7e5]'
                        : 'bg-[#01a7e5] text-white'
                    }`}
                  >
                    {getWhyChooseUsIcon(idx, isBlue)}
                  </div>

                  <h3
                    className={`text-xl font-semibold leading-snug ${
                      isBlue ? 'text-white' : 'text-[#01a7e5]'
                    }`}
                  >
                    {card.title}
                  </h3>

                  <div
                    className={`text-sm leading-relaxed italic [&_p]:m-0 [&_p]:inline ${
                      isBlue ? 'text-cyan-50' : 'text-gray-600'
                    }`}
                    dangerouslySetInnerHTML={{ __html: card.description }}
                  />
                </div>

                {/* CTA Link / Button */}
                <div className="pt-6">
                  <Link
                    href={card.ctaHref}
                    className={`inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm transform group-hover:scale-102 focus-visible:outline-2 focus-visible:outline-[#01a7e5] ${
                      isBlue
                        ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs shadow-xs'
                        : 'bg-[#01a7e5] hover:bg-[#018bc0] text-white shadow-xs'
                    }`}
                  >
                    <span>{card.ctaText}</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}