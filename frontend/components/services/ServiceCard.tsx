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
  const [inView, setInView] = useState(false);
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

  // Trigger the reveal only once this card actually scrolls into view,
  // instead of animating immediately on mount regardless of scroll position.
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const imageUrl = getImageUrl(service.image);
  const showToggle = expanded || hasOverflow;

  const paragraphs = service.description
    .split(/(?=<p[ >])|<\/p>/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const imageFloatClass =
    imageSide === "left"
      ? "lg:float-left lg:me-8"
      : "lg:float-right lg:ms-8";

  // Scroll-linked reveal: elements sit translated/hidden until `inView`
  // flips true (from the IntersectionObserver above), then transition in.
  const reveal = (delaySeconds: number): React.CSSProperties => ({
    transitionDelay: `${delaySeconds}s`,
  });
  const revealClass =
    "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform " +
    (inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6");

  return (
    <>
      {/* Image */}
      {imageUrl && (
        <div
          className={`w-full lg:w-1/2 flex items-center justify-center p-2 overflow-hidden mb-6 lg:mb-4 ${imageFloatClass} ${revealClass}`}
          style={reveal(0.1)}
        >
          <Image
            src={imageUrl}
            alt={service.title}
            width={800}
            height={600}
            unoptimized
            className="w-full h-auto max-h-[350px] object-contain transition-transform duration-500 hover:scale-[1.03]"
          />
        </div>
      )}

      {/* Content + CTA wrapper */}
      <div>
        <div className="space-y-3">
          <h2
            className={`text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight ${revealClass}`}
            style={reveal(0.2)}
          >
            {service.title}
          </h2>

          {service.slogan && (
            <p
              className={`text-sm font-semibold text-[#01A7E5] ${revealClass}`}
              style={reveal(0.35)}
            >
              {service.slogan}
            </p>
          )}

          <div
            ref={textRef}
            className={!expanded ? "line-clamp-[5]" : ""}
          >
            {paragraphs.map((html, pIdx) => (
              <div
                key={pIdx}
                className={`text-sm sm:text-base text-gray-600 leading-relaxed text-justify [&_p]:text-justify [&_p]:mb-2 [&_p:last-child]:mb-0 ${revealClass}`}
                style={reveal(0.5 + pIdx * 0.2)}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ))}
          </div>
        </div>

        {/* See more/less + CTA: sit tight against the text while collapsed,
            then shift down and align right once expanded so the state
            change is visually obvious. */}
        <div
          className={`flex flex-wrap items-center justify-end gap-4 transition-all duration-500 ${
            expanded ? "mt-2" : "mt-6"
          } ${revealClass}`}
          style={reveal(0.6 + paragraphs.length * 0.2)}
        >
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