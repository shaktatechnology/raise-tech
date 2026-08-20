"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/api";
import { fetchPortfolioData, type PortfolioHeader } from "@/lib/portfolioApi";
import { PORTFOLIO_DATA } from "@/lib/data/homeData";
import type { Portfolio } from "@/lib/types/home";
import EnhancedImage from "@/components/ui/EnhancedImage";
import PageIntro from "@/components/motion/PageIntro";
import Reveal from "@/components/motion/Reveal";
import StaggerGroup from "@/components/motion/StaggerGroup";
import StaggerItem from "@/components/motion/StaggerItem";

interface PortfolioDetailContentProps {
  portfolioId: string;
}

export default function PortfolioDetailContent({ portfolioId }: PortfolioDetailContentProps) {
  const [header, setHeader] = useState<PortfolioHeader | null>(null);
  const [project, setProject] = useState<Portfolio | null>(null);
  const [allProjects, setAllProjects] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchPortfolioData();

        if (res?.header) {
          setHeader(res.header);
        }

        const list: Portfolio[] =
          res?.portfolio ||
          PORTFOLIO_DATA.map((item, idx) => ({
            id: idx + 1,
            title: item.title,
            image: item.image,
            description: item.description,
          }));

        setAllProjects(list);

        const found =
          list.find((p) => String(p.id) === portfolioId) ||
          list.find((p) => p.title.toLowerCase().replace(/\s+/g, "-") === portfolioId) ||
          list[0] ||
          null;

        if (found) {
          setProject(found);
        } else {
          setError("Project not found.");
        }
      } catch {
        const fallbackList: Portfolio[] = PORTFOLIO_DATA.map((item, idx) => ({
          id: idx + 1,
          title: item.title,
          image: item.image,
          description: item.description,
        }));
        setAllProjects(fallbackList);
        const found =
          fallbackList.find((p) => String(p.id) === portfolioId) ||
          fallbackList[0] ||
          null;
        setProject(found);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [portfolioId]);

  const relatedProjects = allProjects.filter((p) => project && p.id !== project.id).slice(0, 3);

  if (loading) {
    return (
      <div className="py-32 text-center text-gray-500 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#01A7E5] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <div className="text-5xl mb-4">📂</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
        <p className="text-gray-600 text-sm mb-6">The requested portfolio project could not be found.</p>
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#01A7E5] text-white font-bold rounded-xl shadow-xs hover:bg-[#018bc0] transition-colors"
        >
          <span>← Back to Portfolio</span>
        </Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(project.image);
  const heroBgUrl = header?.hero_image
    ? getImageUrl(header.hero_image)
    : "/images/services/services-hero.png";

  return (
    <PageIntro className="w-full bg-[#f8fdff]">
      {/* Hero Header Banner */}
      <section className="relative w-full h-[260px] sm:h-[320px] md:h-[380px] overflow-hidden bg-[#022c43] flex items-center justify-center">
        {heroBgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroBgUrl}
            alt="Raise Tech Portfolio Hero"
            className="absolute inset-0 w-full h-full object-cover [object-position:75%_center]"
          />
        ) : (
          <Image
            src="/images/services/services-hero.png"
            alt="Raise Tech Portfolio Hero"
            fill
            priority
            className="object-cover [object-position:75%_center]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#01a7e5]/90 via-[#01a7e5]/40 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-cyan-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs mb-3 inline-block">
            Case Study &amp; Technical Delivery
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold drop-shadow-md leading-tight">
            {project.title}
          </h1>
        </div>
      </section>

      {/* Main Content Body */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs & Back Navigation */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200/80">
            <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <Link href="/" className="hover:text-[#01A7E5] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/portfolio" className="hover:text-[#01A7E5] transition-colors">
                Portfolio
              </Link>
              <span>/</span>
              <span className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">
                {project.title}
              </span>
            </nav>

            <Link
              href="/portfolio"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#01A7E5] hover:text-[#018bc0] transition-colors"
            >
              <span>← All Projects</span>
            </Link>
          </div>

          {/* Project Details Card */}
          <Reveal variant="fadeUp" className="bg-white rounded-3xl shadow-lg border border-gray-100/90 overflow-hidden">
            {/* Project Image Banner */}
            {imageUrl && (
              <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-slate-900 flex items-center justify-center p-6 sm:p-10 border-b border-gray-100">
                <EnhancedImage
                  src={imageUrl}
                  alt={project.title}
                  fill
                  className="object-contain"
                  containerClassName="w-full h-full"
                />
              </div>
            )}

            {/* Description and Key Details */}
            <div className="p-6 sm:p-10 lg:p-12 space-y-8">
              <div>
                <span className="text-xs font-bold text-[#01A7E5] uppercase tracking-wider bg-cyan-50 px-3.5 py-1.5 rounded-lg inline-block mb-3">
                  Enterprise Solution Showcase
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                  {project.title}
                </h2>
              </div>

              {/* Rich Project Description */}
              <div
                className="prose prose-base sm:prose-lg max-w-none text-gray-700 leading-relaxed text-justify [&_p]:mb-4 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />

              {/* Action Buttons Box */}
              <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  href={`/contact?subject=Inquiry%20regarding%20${encodeURIComponent(project.title)}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Inquire About This Project</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>

                <Link
                  href="/contact?subject=Technical%20Consultation"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
                >
                  <span>Request Custom Consultation</span>
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Related / Other Projects Section */}
          {relatedProjects.length > 0 && (
            <div className="mt-16 sm:mt-24">
              <Reveal variant="fadeUp" className="text-center mb-10 space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">Explore Other Projects</h3>
                <p className="text-sm text-gray-500">Discover more digital systems and platforms engineered by Raise Tech.</p>
              </Reveal>

              <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProjects.map((item) => {
                  const itemImg = getImageUrl(item.image);
                  return (
                    <StaggerItem key={item.id}>
                      <Link
                        href={`/portfolio/${item.id}`}
                        className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col h-full group"
                      >
                        <div className="relative w-full aspect-[16/10] bg-slate-50 overflow-hidden">
                          {itemImg ? (
                            <EnhancedImage
                              src={itemImg}
                              alt={item.title}
                              fill
                              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                              containerClassName="w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-xs font-bold p-2">
                              {item.title}
                            </div>
                          )}
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-base text-gray-900 group-hover:text-[#01A7E5] transition-colors mb-1.5">
                              {item.title}
                            </h4>
                            <div
                              className="text-xs text-gray-500 line-clamp-2 [&_p]:m-0 [&_p]:inline"
                              dangerouslySetInnerHTML={{ __html: item.description }}
                            />
                          </div>

                          <div className="pt-4 text-xs font-bold text-[#01A7E5] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            <span>Read Case Study</span>
                            <span>→</span>
                          </div>
                        </div>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </StaggerGroup>
            </div>
          )}
        </div>
      </section>
    </PageIntro>
  );
}
