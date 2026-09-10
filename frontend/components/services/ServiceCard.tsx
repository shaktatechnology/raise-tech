"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/api";
import type { ServiceAPI } from "@/components/services/ServicesPageContent";

interface ServiceCardProps {
  service: ServiceAPI;
  imageSide?: "left" | "right";
}

export default function ServiceCard({
  service,
  imageSide = "left",
}: ServiceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const check = () => setHasOverflow(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener("resize", check);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, []);

  const imageUrl = getImageUrl(service.image);
  const showToggle = expanded || hasOverflow;

  const imageFloatClass =
    imageSide === "left"
      ? "lg:float-left lg:me-8"
      : "lg:float-right lg:ms-8";

  return (
    <>
      {/* Image — floats left/right on desktop, stacked on mobile */}
      {imageUrl && (
        <div
          className={`w-full lg:w-1/2 flex items-center justify-center p-2 overflow-hidden mb-6 lg:mb-4 ${imageFloatClass}`}
        >
          <Image
            src={imageUrl}
            alt={service.title}
            width={800}
            height={600}
            unoptimized
            className="w-full h-auto max-h-[300px] object-contain transition-transform duration-500 hover:scale-[1.03]"
          />
        </div>
      )}

      {/* Content — normal flow wraps around the floated image */}
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          {service.title}
        </h2>

        {service.slogan && (
          <p className="text-sm font-semibold text-[#01A7E5]">
            {service.slogan}
          </p>
        )}

        <div
          ref={textRef}
          className={`text-sm sm:text-base text-gray-600 leading-relaxed text-justify [&_p]:text-justify [&_p]:mb-2 [&_p:last-child]:mb-0 ${
            !expanded ? "line-clamp-[5]" : ""
          }`}
          dangerouslySetInnerHTML={{ __html: service.description }}
        />

        {showToggle && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#01A7E5] hover:text-[#018bc0] transition-colors cursor-pointer"
          >
            <span>{expanded ? "See less" : "See more"}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        <div className="pt-4 clear-both">
          <Link
            href={`/contact?subject=Inquiry%20about%20${encodeURIComponent(service.title)}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold text-sm rounded-xl shadow-xs transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
          >
            <span>Get Technical Consultation</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </>
  );
}
