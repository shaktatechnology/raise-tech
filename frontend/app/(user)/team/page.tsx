import React from 'react';
import type { Metadata } from 'next';
import TeamHero from '@/components/team/TeamHero';
import TeamGrid from '@/components/team/TeamGrid';

export const metadata: Metadata = {
  title: 'Our Team | Raise Tech Pvt. Ltd.',
  description:
    'Meet the dedicated team of leaders, software engineers, UI/UX designers, and tech experts at Raise Tech Pvt. Ltd. delivering innovative enterprise IT solutions.',
};

export default function TeamPage() {
  return (
    <article className="w-full bg-white">
      {/* 1. Hero Banner */}
      <TeamHero />

      {/* 2. Team Members Grid */}
      <TeamGrid />
    </article>
  );
}
