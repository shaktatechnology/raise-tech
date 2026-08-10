import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative bg-slate-900 text-white overflow-hidden py-20 lg:py-32 min-h-[85vh] flex items-center">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/home/hero-bg.png"
          alt="Technology Hero Background"
          fill
          priority
          className="object-cover object-center opacity-45 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl space-y-6">
          {/* Decorative Tagline */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#01A7E5]/20 border border-[#01A7E5]/40 backdrop-blur-sm text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#01A7E5] animate-pulse" />
            Empower Your Business With Technology
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Always deliver{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#01A7E5] via-cyan-300 to-emerald-400">
              more than expected
            </span>
          </h1>

          {/* Supporting Description */}
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
            We engineer secure, scalable, and intuitive digital solutions — from enterprise software and custom mobile apps to IoT tracking systems and high-grade printing solutions tailored for your business.
          </p>

          {/* CTA Actions */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-[#01A7E5] hover:bg-[#018bc0] transition-all duration-200 rounded-xl shadow-lg shadow-[#01A7E5]/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#01A7E5]"
            >
              Contact Us
              <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/services"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all duration-200 rounded-xl backdrop-blur-sm hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
