"use client";

import React from 'react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
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

      {/* Hero Overlay Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-full flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl text-left"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold text-white leading-tight drop-shadow-md tracking-tight">
            Smart, Secure, &amp; Scalable Software Solutions for Business
          </h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "13rem" }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-1.5 bg-white rounded-full mt-4 shadow-sm"
          />
        </motion.div>
      </div>
    </section>
  );
}
