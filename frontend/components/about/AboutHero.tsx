import React from 'react';
import Image from 'next/image';

export default function AboutHero() {
  return (
    <section className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[560px] overflow-hidden bg-[#022c43]">
      {/* Hero Image */}
      <Image
        src="/images/about/about-hero.png"
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
