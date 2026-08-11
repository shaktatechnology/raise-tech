import React from 'react';

export default function TopBar() {
  return (
    <div className="bg-[#01A7E5] text-white text-xs py-2 px-4 border-b border-[#018bc0]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left Side Contact Details */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
          <a
            href="tel:+9779844702792"
            className="flex items-center gap-1.5 hover:text-cyan-100 transition-colors focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Call Raise Tech"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>+977 9844702792, 015705475</span>
          </a>

          <a
            href="mailto:info@raisetech.com.np"
            className="flex items-center gap-1.5 hover:text-cyan-100 transition-colors focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Email Raise Tech"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>info@raisetech.com.np</span>
          </a>
        </div>

        {/* Right Side Address */}
        <div className="hidden md:flex items-center gap-1.5 text-cyan-50">
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Bhakti Thapa Sadak, Kathmandu</span>
        </div>
      </div>
    </div>
  );
}
