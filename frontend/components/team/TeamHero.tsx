import React from 'react';
import Image from 'next/image';

export default function TeamHero() {
  return (
    <section className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[800px] overflow-hidden bg-[#022c43]">
      {/* Background Image */}
      <Image
        src="/images/team/team-hero.png"
        alt="Raise Tech Team Workspace Banner"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Cyan/Blue Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#01a7e5]/90 via-[#01a7e5]/30 to-transparent pointer-events-none" />

      {/* Page Heading (Semantic H1) 
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
          Our Team
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-cyan-50 max-w-2xl font-medium">
          Meet the Dedicated Professionals &amp; Visionary Innovators Behind Raise Tech
        </p>
      </div>*/}
    </section>
  );
}
