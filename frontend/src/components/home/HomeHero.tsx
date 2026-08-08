import Link from "next/link";
import { ArrowRight, PhoneCall } from "lucide-react";

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-blue-darker via-brand-blue to-brand-cyan">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]"
        viewBox="0 0 1000 480"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`l-${i}`} x1={i * 110} y1="0" x2={i * 110 + 90} y2="480" stroke="white" strokeWidth="1" />
        ))}
        {Array.from({ length: 22 }).map((_, i) => (
          <circle key={`c-${i}`} cx={(i * 617) % 1000} cy={(i * 233) % 480} r={3 + (i % 4)} fill="white" />
        ))}
      </svg>

      <div className="container-page relative z-10 flex min-h-[440px] flex-col justify-center py-20 md:min-h-[520px]">
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.25em] text-white/75">
          Raise Tech Pvt. Ltd. · Kathmandu, Nepal
        </p>
        <h1 className="max-w-2xl text-[36px] font-bold leading-tight text-white md:text-[52px]">
          Smart, Secure, &amp; Scalable Software Solutions for Business
        </h1>
        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/85">
          We design and build dependable desktop, web, and mobile software — from custom CRMs and GPS fleet
          tracking to end-to-end digital transformation — for businesses across Nepal.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-7 text-[15px] font-semibold text-brand-blue-darker shadow-lg transition hover:brightness-95"
          >
            Get In Touch
            <ArrowRight className="size-4" />
          </Link>
          <a
            href="tel:+9779844702792"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/50 px-7 text-[15px] font-semibold text-white transition hover:bg-white/10"
          >
            <PhoneCall className="size-4" />
            +977 9844702792
          </a>
        </div>
      </div>
    </section>
  );
}
