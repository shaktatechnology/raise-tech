"use client";

import React from 'react';
import Image from 'next/image';

export default function ShopHero() {
  return (
    <section className="relative w-full h-[75vh] min-h-[450px] max-h-[660px] overflow-hidden bg-[#022c43]">
      {/* Background Image */}
      <Image
        src="/images/products/shop/shop-hero.png"
        alt="Raise Tech Paper Roll and Label Sticker Supplies"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none" />
    </section>
  );
}
