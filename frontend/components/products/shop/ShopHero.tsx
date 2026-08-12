import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ShopHero() {
  return (
    <section className="relative w-full h-[300px] sm:h-[380px] md:h-[440px] overflow-hidden bg-[#022c43]">
      {/* Background Image */}
      <Image
        src="/images/products/shop/shop-hero.png"
        alt="Raise Tech Paper Roll and Label Sticker Supplies"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#01a7e5]/90 via-[#01a7e5]/40 to-transparent pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
        {/* Breadcrumbs */}
        <nav className="inline-flex items-center gap-2 text-sm text-cyan-100 mb-3 font-medium">
          <Link href="/products" className="hover:text-white transition-colors">
            Products
          </Link>
          <span>›</span>
          <span className="text-white font-semibold">Paper Roll &amp; Label Sticker Shop</span>
        </nav>

        {/* H1 Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
          Paper Roll &amp; Label Sticker Shop
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-cyan-50 max-w-2xl font-medium leading-relaxed">
          Premium thermal paper rolls, POS receipt rolls, dot matrix computer paper, and barcode label stickers for retail, banking &amp; industrial packaging.
        </p>
      </div>
    </section>
  );
}
