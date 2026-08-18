import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Carattere } from 'next/font/google';
import type { Banner } from '@/lib/types/home';
import { getImageUrl } from '@/lib/api';

const carattere = Carattere({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

interface HeroSectionProps {
  banner: Banner | null;
}

export default function HeroSection({ banner }: HeroSectionProps) {
  const heroImage = getImageUrl(banner?.image) || '/images/home/hero-bg.png';
  const title = banner?.title || 'Always deliver more than Expected.';
  const description =
    banner?.description ||
    'Remember, constantly delivering more than expected requires dedication, effort, and a genuine desire to provide outstanding value. By embodying this principle, you can set yourself apart and create a lasting positive impression on those you interact with.';

  // Split so the first word can be styled larger than the rest of the headline.
  const [firstWord, ...restOfTitle] = title.trim().split(/\s+/);
  const remainingTitle = restOfTitle.join(' ');

  return (
    <section className="relative bg-[#022c43] text-white overflow-hidden py-16 lg:py-24 lg:min-h-[620px] flex items-center">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={heroImage}
          alt="Technology Hero Background"
          fill
          priority
          className="object-cover object-center scale-115 sm:scale-120 lg:scale-125 origin-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#011b2b]/95 via-[#022c43]/80 to-transparent md:to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-xl space-y-6">
          {/* Main Headline (dynamic, from admin-managed banner) */}
          <h1
            className={`${carattere.className} font-normal text-white drop-shadow-md leading-tight`}
          >
            <span className="text-[150px]">{firstWord}</span>
            {remainingTitle && (
              <span className="text-[55px]"> {remainingTitle}</span>
            )}
          </h1>

          {/* Supporting Description */}
          <div
            className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal pt-2 [&_p]:m-0 [&_p]:inline"
            dangerouslySetInnerHTML={{ __html: description }}
          />

          {/* CTA Action */}
          <div className="pt-6">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white border-2 border-white rounded-full hover:bg-white/10 transition-all duration-200 shadow-md backdrop-blur-xs focus-visible:outline-2 focus-visible:outline-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
