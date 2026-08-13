import React from 'react';
import type { Metadata } from 'next';
import ServicesPageContent from '@/components/services/ServicesPageContent';

export const metadata: Metadata = {
  title: 'Services | Raise Tech Pvt. Ltd.',
  description:
    'Explore Raise Tech Pvt. Ltd. services including custom web development, thermal paper roll manufacturing, POS solutions, and cloud infrastructure.',
};

export default function ServicesPage() {
  return (
    <article className="w-full bg-white">
      <ServicesPageContent />
    </article>
  );
}
