import React from 'react';
import type { Metadata } from 'next';
import ServicesHero from '@/components/services/ServicesHero';
import ServicesPageContent from '@/components/services/ServicesPageContent';

export const metadata: Metadata = {
  title: 'Services | Raise Tech Pvt. Ltd.',
  description:
    'Explore Raise Tech Pvt. Ltd. services including custom web development, React Native mobile apps, REST & GraphQL backend APIs, investor-ready UI/UX design, and AI & data science solutions.',
};

export default function ServicesPage() {
  return (
    <article className="w-full bg-white">
      {/* 1. Hero Banner */}
      <ServicesHero />

      {/* 2. Service Detail Sections */}
      <ServicesPageContent />
    </article>
  );
}
