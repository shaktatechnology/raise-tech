// Target path: src/app/about/page.tsx  (adjust to your actual route file)

import React from 'react';
import type { Metadata } from 'next';
import AboutHero from '@/components/about/AboutHero';
import CompanyIntroduction from '@/components/about/CompanyIntroduction';
import WhatWeDoSection from '@/components/about/WhatWeDoSection';
import WhyChooseUsSection from '@/components/about/WhyChooseUsSection';
import VisionMissionSection from '@/components/about/VisionMissionSection';
import { getAboutPageData } from '@/lib/data/getAboutPageData';

export const metadata: Metadata = {
  title: 'About Us | Raise Tech Pvt. Ltd.',
  description: 'Learn about Raise Tech Pvt. Ltd., an innovative software company in Nepal delivering cutting-edge web, mobile, GPS tracking, accounting, and custom CRM solutions since 2019.',
};

export default async function AboutPage() {
  const { about, whatWeDoItems, whyChooseUsItems } = await getAboutPageData();

  return (
    <article className="w-full bg-white">
      {/* 1. Hero Banner */}
      <AboutHero heroImage={about?.hero_image} />

      {/* 2. Company Introduction & Expertise */}
      <CompanyIntroduction aboutDescription={about?.about_description} aboutImage={about?.about_image} />

      {/* 3. What We Do */}
      <WhatWeDoSection items={whatWeDoItems} teamImage={about?.what_we_do_image} />

      {/* 4. Why Choose Raise Tech */}
      <WhyChooseUsSection items={whyChooseUsItems} />

      {/* 5. Vision & Mission */}
      <VisionMissionSection mission={about?.mission} />
    </article>
  );
}