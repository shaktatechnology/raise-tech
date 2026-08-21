"use client";

import React from 'react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchApi, getImageUrl } from '@/lib/api';

export default function SoftwareHero() {
  const [heroImage, setHeroImage] = useState('/images/products/software/software-hero.png');

  useEffect(() => {
    let isMounted = true;
    async function loadHeroImage() {
      try {
        const response = await fetchApi<{
          data?: { section?: { hero_image?: string | null } | null };
        }>("/software");
        const savedImage = getImageUrl(response.data?.section?.hero_image);
        if (isMounted && savedImage) {
          setHeroImage(savedImage);
        }
      } catch {
        // Keep bundled fallback
      }
    }

    void loadHeroImage();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative w-full h-[75vh] min-h-[450px] max-h-[660px] overflow-hidden bg-[#022c43]">
      {/* Background Image */}
      <Image
        src={heroImage}
        alt="Raise Tech Enterprise Software Solutions Banner"
        fill
        priority
        unoptimized={heroImage.startsWith("http")}
        className="object-cover object-center"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none" />
    </section>
  );
}
