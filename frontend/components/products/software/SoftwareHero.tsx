"use client";

import React from 'react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchApi, getImageUrl } from '@/lib/api';

export default function SoftwareHero() {
  const [heroImage, setHeroImage] = useState('/images/products/software/software-hero.png');

  useEffect(() => {
    async function loadHeroImage() {
      try {
        const response = await fetchApi<{
          data?: { section?: { hero_image?: string | null } | null };
        }>("/software");
        const savedImage = getImageUrl(response.data?.section?.hero_image);
        if (savedImage) setHeroImage(savedImage);
      } catch {
        // Keep the bundled fallback if the public API is unavailable.
      }
    }

    void loadHeroImage();
  }, []);

  return (
    <section className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] overflow-hidden bg-[#022c43]">
      {/* Background Image */}
      <Image
        src={heroImage}
        alt="Raise Tech Enterprise Software Solutions Banner"
        fill
        priority
        unoptimized={heroImage.startsWith("http")}
        className="object-cover object-center"
      />

      {/* Gradient Overlay
      <div className="absolute inset-0 bg-gradient-to-b from-[#01a7e5]/90 via-[#01a7e5]/40 to-transparent pointer-events-none" />

      {/* Hero Content 
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
        {/* Breadcrumb 
        <nav className="inline-flex items-center gap-2 text-sm text-cyan-100 mb-3 font-medium">
          <Link href="/products" className="hover:text-white transition-colors">
            Products
          </Link>
          <span>›</span>
          <span className="text-white font-semibold">Software Solutions</span>
        </nav>

        {/* H1 Heading 
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
          Enterprise Software Solutions
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-cyan-50 max-w-2xl font-medium leading-relaxed">
          High-performance, locally supported custom software applications built to scale Nepali businesses &amp; global enterprises.
        </p>
      </div> */}
    </section>
  );
}
