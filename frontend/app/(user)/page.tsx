import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import PortfolioSection from '@/components/home/PortfolioSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import type { Banner, HomeService, Portfolio, Testimonial } from '@/lib/types/home';

// The homepage always fetches fresh data (cache: 'no-store').
// Declare it as dynamic so Next.js does not treat DYNAMIC_SERVER_USAGE as an error.
export const dynamic = 'force-dynamic';


interface HomeApiResponse {
  status: string;
  data: {
    banner: Banner | null;
    services: HomeService[];
    portfolio: Portfolio[];
    testimonials: Testimonial[];
  };
}

async function getHomeData() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  try {
    const res = await fetch(`${API_URL}/home`, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`Failed to fetch homepage data (${res.status})`);
    }

    const json: HomeApiResponse = await res.json();
    return json.data;
  } catch (err: unknown) {
    // Only log genuine network/API failures, not Next.js internal control-flow.
    const digest = (err as { digest?: string })?.digest;
    if (digest !== 'DYNAMIC_SERVER_USAGE') {
      console.error('Failed to load homepage data:', err);
    }
    // Fall back to empty state so the page still renders instead of crashing.
    return {
      banner: null,
      services: [] as HomeService[],
      portfolio: [] as Portfolio[],
      testimonials: [] as Testimonial[],
    };
  }
}

export default async function HomePage() {
  const { banner, services, portfolio, testimonials } = await getHomeData();

  return (
    <>
      <HeroSection banner={banner} />
      <ServicesSection services={services} />
      <PortfolioSection portfolio={portfolio} />
      <TestimonialsSection testimonials={testimonials} />
    </>
  );
}