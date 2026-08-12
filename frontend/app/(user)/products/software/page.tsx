import React from 'react';
import type { Metadata } from 'next';
import SoftwareHero from '@/components/products/software/SoftwareHero';
import SoftwareProductsGrid from '@/components/products/software/SoftwareProductsGrid';

export const metadata: Metadata = {
  title: 'Software Solutions | Raise Tech Pvt. Ltd.',
  description:
    'Explore Trackingmandu GPS tracking, eCalculo POS billing suite, custom CRM software, and ERP enterprise solutions from Raise Tech Pvt. Ltd.',
};

export default function SoftwarePage() {
  return (
    <article className="w-full bg-[#f2fcff] min-h-screen">
      {/* Software Hero Banner */}
      <SoftwareHero />

      {/* Software Showcase Grid */}
      <SoftwareProductsGrid />
    </article>
  );
}
