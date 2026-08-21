"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import type { Portfolio } from '@/lib/types/home';
import { getImageUrl } from '@/lib/api';
import EnhancedImage from '@/components/ui/EnhancedImage';
import Reveal from '@/components/motion/Reveal';

interface PortfolioSectionProps {
  portfolio: Portfolio[];
}

export default function PortfolioSection({ portfolio }: PortfolioSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Show up to 3 featured items.
  const items = portfolio.slice(0, 3);

  if (items.length === 0) {
    return null;
  }

  const activeProject = items[activeIndex];

  return (
    <section className="py-20 bg-[#f7fdff] text-[#404040] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Project Cards Row & Pagination */}
          <Reveal variant="slideLeft" className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-3 gap-4 sm:gap-6 items-center">
              {items.map((project, idx) => {
                const imgUrl = getImageUrl(project.image);
                const isActive = activeIndex === idx;

                return (
                  <Link
                    key={project.id}
                    href={`/portfolio/${project.id}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className="relative block"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeHighlightOutline"
                        className="absolute -inset-1.5 border-4 border-emerald-500 rounded-[20px] z-20 pointer-events-none shadow-md shadow-emerald-500/20"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                    <motion.div
                      whileHover={{ y: -6 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all duration-300 group ${
                        isActive
                          ? 'shadow-xl scale-[1.01]'
                          : 'opacity-85 hover:opacity-100 hover:shadow-lg'
                      }`}
                    >
                      {imgUrl ? (
                        <EnhancedImage
                          src={imgUrl}
                          alt={project.title}
                          fill
                          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          containerClassName="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-semibold p-2 text-center">
                          {project.title}
                        </div>
                      )}

                      {/* Hover Overlay — "View Case Study" */}
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center pointer-events-none gap-1.5">
                        {/* <div className="w-9 h-9 rounded-full bg-white/95 text-emerald-600 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                        <span className="text-white text-[10px] font-bold tracking-wide">View Project</span> */}
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination Indicators */}
            <div className="flex items-center gap-2 pt-2">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx
                      ? 'w-9 bg-emerald-500 shadow-xs'
                      : 'w-2.5 bg-emerald-200 hover:bg-emerald-300'
                  }`}
                  aria-label={`Go to project ${idx + 1}`}
                />
              ))}
            </div>
          </Reveal>

          {/* Right Column: Dynamic Project Details */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left min-h-[320px]">
            <Link href="/portfolio" className="inline-block group mb-3">
              <p className="font-carattere text-6xl sm:text-7xl text-emerald-600 drop-shadow-xs group-hover:text-emerald-700 transition-colors">
                Portfolio
              </p>
            </Link>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full tracking-wider uppercase">
                    Featured Project
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug text-gray-800">
                    {activeProject.title}
                  </h2>
                </div>

                <div 
                  className="text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-4 font-normal [&_p]:m-0 [&_p]:inline"
                  dangerouslySetInnerHTML={{ __html: activeProject.description }}
                />

                <div className="pt-4 flex flex-wrap gap-4 items-center">
                  <Link
                    href={`/portfolio/${activeProject.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-emerald-600/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <span>View Case Study</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors py-2 px-3 hover:bg-emerald-50/50 rounded-lg cursor-pointer"
                  >
                    <span>View All Projects</span>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
