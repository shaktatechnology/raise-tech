import React from 'react';
import Image from 'next/image';
import { isValidImageSrc } from '@/lib/data/getAboutPageData';

interface AboutHeroProps {
  heroImage?: string | null;
}

export default function AboutHero({ heroImage }: AboutHeroProps) {
  const imageSrc = isValidImageSrc(heroImage) ? heroImage : '/images/about/about-hero.png';

  return (
    <section className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[560px] overflow-hidden bg-[#022c43]">
      {/* Hero Image */}
      <Image
        src={imageSrc}
        alt="Raise Tech Office and Technology Workspace Banner"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Cyan/Blue Gradient Overlay matching Figma design */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#01a7e5]/90 via-[#01a7e5]/30 to-transparent pointer-events-none" />
    </section>
  );
}