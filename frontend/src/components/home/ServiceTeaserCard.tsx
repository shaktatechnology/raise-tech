import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

export default function ServiceTeaserCard({
  icon: Icon,
  title,
  blurb,
  href,
}: {
  icon: LucideIcon;
  title: string;
  blurb: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-black/5 bg-white p-6 shadow-sm shadow-black/5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-blue/15"
    >
      <span className="flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-brand-cyan to-brand-blue-dark text-white">
        <Icon className="size-6" strokeWidth={1.7} />
      </span>
      <h3 className="mt-4 text-[16px] font-semibold text-brand-navy">{title}</h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-brand-ink/75">{blurb}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-blue">
        Learn more
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
