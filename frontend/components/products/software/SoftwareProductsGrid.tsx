import React from 'react';
import Link from 'next/link';
import { SOFTWARE_PRODUCTS_DATA } from '@/lib/data/softwareProductsData';
import SoftwareProductCard from './SoftwareProductCard';

export default function SoftwareProductsGrid() {
  return (
    <section className="w-full py-14 sm:py-20 bg-[#f2fcff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-sm font-bold uppercase tracking-wider text-[#01A7E5]">
            Custom Business Applications
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#404040] tracking-tight mt-2">
            Tailored Enterprise Software Engineered for High Growth
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3">
            Explore ready-to-deploy POS systems, billing platforms, GPS tracking, ERP, and custom business management tools.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SOFTWARE_PRODUCTS_DATA.map((product) => (
            <SoftwareProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Custom Software CTA Banner */}
        <div className="mt-16 sm:mt-20 rounded-3xl p-8 sm:p-12 text-center bg-gradient-to-r from-[#01A7E5] to-[#0070a0] text-white shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Require a Custom Enterprise Software Solution?
          </h3>
          <p className="text-sm sm:text-base text-cyan-100 max-w-2xl mx-auto mb-8 font-medium">
            We design, develop, and deploy tailor-made web, mobile, and cloud software built specifically around your business workflows.
          </p>
          <Link
            href="/contact?subject=Custom%20Software%20Consultation"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#01A7E5] hover:bg-cyan-50 font-bold rounded-xl shadow-md transition-colors text-base"
          >
            <span>Schedule Free Technical Consultation</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
