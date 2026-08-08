import Link from "next/link";

export default function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  return (
    <Link href="/" className="inline-flex flex-col leading-none group">
      <span className="flex items-baseline text-[26px] font-extrabold tracking-tight font-display">
        <span className="text-brand-green">R</span>
        <span className={variant === "light" ? "text-white" : "text-brand-blue"}>AISE TECH</span>
      </span>
      <span
        className={`mt-0.5 self-end text-[9px] font-semibold tracking-[0.25em] ${
          variant === "light" ? "text-white/70" : "text-brand-ink/60"
        }`}
      >
        PVT. LTD.
      </span>
    </Link>
  );
}
