import React from 'react';
import type { Metadata } from 'next';
import AboutHero from '@/components/about/AboutHero';
import CompanyIntroduction from '@/components/about/CompanyIntroduction';
import WhatWeDoSection from '@/components/about/WhatWeDoSection';
import WhyChooseUsSection from '@/components/about/WhyChooseUsSection';
import VisionMissionSection from '@/components/about/VisionMissionSection';

export const metadata: Metadata = {
  title: 'About Us | Raise Tech Pvt. Ltd.',
  description: 'Learn about Raise Tech Pvt. Ltd., an innovative software company in Nepal delivering cutting-edge web, mobile, GPS tracking, accounting, and custom CRM solutions since 2019.',
};

export default function AboutPage() {
  return (
    <article className="w-full bg-white">
      {/* 1. Hero Banner */}
      <AboutHero />

      {/* 2. Company Introduction & Expertise */}
      <CompanyIntroduction />

      {/* 3. What We Do */}
      <WhatWeDoSection />

      {/* 4. Why Choose Raise Tech */}
      <WhyChooseUsSection />

      {/* 5. Vision & Mission */}
      <VisionMissionSection />
    </article>
  );
}
