import { ReactNode } from "react";

export default function PageHero({
  eyebrow,
  title,
  children,
  height = "h-[260px] md:h-[300px]",
}: {
  eyebrow?: string;
  title?: string;
  children?: ReactNode;
  height?: string;
}) {
  return (
    <section
      className={`relative flex ${height} items-center overflow-hidden bg-gradient-to-br from-brand-blue-darker via-brand-blue to-brand-cyan`}
    >
      {/* decorative circuit-style pattern to echo the source hero imagery without using stock photography */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.15]"
        viewBox="0 0 800 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={i * 100} y1="0" x2={i * 100 + 60} y2="300" stroke="white" strokeWidth="1" />
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={(i * 733) % 800} cy={(i * 271) % 300} r={3 + (i % 3)} fill="white" />
        ))}
      </svg>

      <div className="container-page relative z-10">
        {eyebrow && (
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.2em] text-white/75">{eyebrow}</p>
        )}
        {title && (
          <h1 className="max-w-2xl text-[32px] font-bold leading-tight text-white md:text-[42px]">{title}</h1>
        )}
        {children}
      </div>
    </section>
  );
}
