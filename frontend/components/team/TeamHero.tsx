import React from 'react';
import Image from 'next/image';

export default function TeamHero() {
  return (
    <section className="relative w-full h-[280px] sm:h-[360px] md:h-[440px] lg:h-[520px] overflow-hidden bg-[#022c43] flex items-center justify-center">
      {/* Background Image Perfectly Centered */}
      <Image
        src="/images/team/team-hero.png"
        alt="Raise Tech Team Workspace Banner"
        fill
        priority
        className="object-cover [object-position:75%_center]"
      />

      {/* Vibrant Cyan-Blue Cover Up Color Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#01a7e5]/90 via-[#01a7e5]/40 to-transparent pointer-events-none" />
    </section>
  );
}
