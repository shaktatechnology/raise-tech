import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Products | Raise Tech Pvt. Ltd.',
  description:
    'Discover Raise Tech enterprise software solutions, point of sale software, thermal paper rolls, POS receipt rolls, and self-adhesive barcode label stickers.',
};

export default function ProductsLandingPage() {
  return (
    <article className="w-full bg-[#f2fcff] min-h-screen">
      {/* Hero Banner */}
      <section className="relative w-full h-[75vh] min-h-[450px] max-h-[660px] overflow-hidden bg-[#022c43]">
        <Image
          src="/images/products/software/software-hero.png"
          alt="Raise Tech Products Banner"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#01a7e5]/90 via-[#01a7e5]/40 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
            Raise Tech Products
          </h1>
          <p className="mt-3 text-base sm:text-lg text-cyan-50 max-w-2xl font-medium">
            Explore enterprise software platforms &amp; high-quality printing supplies tailored for Nepali businesses.
          </p>
        </div>
      </section>

      {/* Dual Offerings Navigation Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#01A7E5]">Product Ecosystem</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            Select Your Product Category
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Software Products */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
            <div>
              <div className="w-16 h-16 bg-cyan-50 text-[#01A7E5] rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                💻
              </div>
              <span className="text-xs font-bold text-[#01A7E5] uppercase tracking-wider block mb-2">
                Custom Applications &amp; SaaS
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#01A7E5] transition-colors">
                Software Solutions
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Enterprise point-of-sale systems, Trackingmandu GPS fleet software, eCalculo VAT billing suites, custom ERP, and school management applications.
              </p>
              <ul className="space-y-2 mb-8">
                {['Trackingmandu GPS Fleet Tracking', 'eCalculo POS & Billing Suite', 'Custom Enterprise CRM & ERP', 'School & Inventory Management'].map((feat) => (
                  <li key={feat} className="text-xs sm:text-sm text-gray-700 flex items-center gap-2">
                    <span className="w-4 h-4 bg-cyan-50 text-[#01A7E5] rounded-full flex items-center justify-center font-bold text-xs">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/products/software"
              className="w-full py-3.5 bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold rounded-xl text-center shadow-xs transition-colors block text-sm"
            >
              Explore Software Products →
            </Link>
          </div>

          {/* Card 2: Paper Roll & Label Sticker Shop */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
            <div>
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🖨️
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-2">
                E-Commerce Catalog &amp; Supplies
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                Paper Roll &amp; Label Sticker Shop
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Shop thermal receipt paper rolls (80x65mm, 58mm), dot matrix continuous paper, 2-ply/3-ply carbonless paper, and self-adhesive barcode label stickers.
              </p>
              <ul className="space-y-2 mb-8">
                {['80x65mm & 58mm Thermal POS Rolls', '5-Inch & 3-Inch Dot Matrix Paper', 'Self-Adhesive Barcode Label Stickers (50x25mm)', 'Fast Kathmandu Valley Delivery'].map((feat) => (
                  <li key={feat} className="text-xs sm:text-sm text-gray-700 flex items-center gap-2">
                    <span className="w-4 h-4 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/products/shop"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center shadow-xs transition-colors block text-sm"
            >
              Shop Paper &amp; Label Stickers →
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
