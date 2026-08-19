import React from 'react';
import type { Metadata } from 'next';
import PortfolioPageContent from '@/components/portfolio/PortfolioPageContent';

export const metadata: Metadata = {
  title: 'Portfolio | Raise Tech Pvt. Ltd.',
  description:
    'Explore Raise Tech Pvt. Ltd. portfolio showcase featuring enterprise software systems, mobile applications, custom web platforms, and digital client solutions.',
};

export default function PortfolioPage() {
  return (
    <article className="w-full bg-white">
      <PortfolioPageContent />
    </article>
  );
}
