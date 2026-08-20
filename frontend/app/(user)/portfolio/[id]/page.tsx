import React from "react";
import type { Metadata } from "next";
import PortfolioDetailContent from "@/components/portfolio/PortfolioDetailContent";

interface PortfolioDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PortfolioDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Project Case Study | Raise Tech Pvt. Ltd.`,
    description: `Explore detailed case study and project delivery details for portfolio #${resolvedParams.id} at Raise Tech Pvt. Ltd.`,
  };
}

export default async function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  const resolvedParams = await params;
  return (
    <article className="w-full">
      <PortfolioDetailContent portfolioId={resolvedParams.id} />
    </article>
  );
}
