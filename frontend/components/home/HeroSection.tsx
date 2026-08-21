"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Carattere } from 'next/font/google';
import type { Banner } from '@/lib/types/home';
import { getImageUrl } from '@/lib/api';

const carattere = Carattere({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

const MotionLink = motion.create(Link);

const titleContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

interface HeroSectionProps {
  banner: Banner | null;
}

export default function HeroSection({ banner }: HeroSectionProps) {
  const heroImage = getImageUrl(banner?.image) || '/images/home/hero-bg.png';
  const title = banner?.title || 'Always deliver more than Expected.';
  const description =
    banner?.description ||
    'Remember, constantly delivering more than expected requires dedication, effort, and a genuine desire to provide outstanding value. By embodying this principle, you can set yourself apart and create a lasting positive impression on those you interact with.';

  // Split so the first word can be styled larger than the rest of the headline.
  const [firstWord, ...restOfTitle] = title.trim().split(/\s+/);

  return (
    <section className="relative bg-[#022c43] text-white overflow-hidden py-16 lg:py-24 lg:min-h-[620px] flex items-center">
      {/* Background Hero Image displaying in full natural form */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0.85 }}
          animate={{ scale: 1.0, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full h-full"
        >
          <Image
            src={heroImage}
            alt="Technology Hero Background"
            fill
            priority
            className="object-cover object-center"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#011b2b]/95 via-[#022c43]/85 to-transparent" />
        
        {/* Animated Ambient Light Blobs */}
        <motion.div 
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-24 left-1/4 w-96 h-96 bg-[#01A7E5]/20 rounded-full blur-3xl pointer-events-none" 
        />
        <motion.div 
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-20 right-10 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" 
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-xl space-y-6">
          {/* Main Headline (dynamic, from admin-managed banner) */}
          <motion.h1
            variants={titleContainerVariants}
            initial="hidden"
            animate="visible"
            className={`${carattere.className} font-normal text-white drop-shadow-lg leading-tight tracking-wide flex flex-wrap items-baseline gap-x-4`}
          >
            <motion.span variants={wordVariants} className="text-[150px] inline-block select-none leading-[0.8]">
              {firstWord}
            </motion.span>
            {restOfTitle.length > 0 && (
              <span className="text-[55px] flex flex-wrap gap-x-3 gap-y-1 select-none leading-tight pt-2">
                {restOfTitle.map((word, idx) => (
                  <motion.span
                    key={idx}
                    variants={wordVariants}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            )}
          </motion.h1>

          {/* Supporting Description */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal pt-2 [&_p]:m-0 [&_p]:inline"
            dangerouslySetInnerHTML={{ __html: description }}
          />

          {/* CTA Action */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="pt-6"
          >
            <MotionLink
              href="/contact"
              whileHover={{ 
                scale: 1.03,
                borderColor: "rgba(255, 255, 255, 1)",
                boxShadow: "0 12px 24px -10px rgba(1, 167, 229, 0.5), 0 4px 12px -5px rgba(1, 167, 229, 0.3)"
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white border-2 border-white/80 rounded-full group cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>Contact Us</span>
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </span>
              {/* Shine Sweep Overlay */}
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
            </MotionLink>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
