import { ArrowRight } from "lucide-react";

export default function WhatWeDoItem({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="flex items-center gap-4 rounded-full border border-brand-blue/15 bg-white py-3 pl-3 pr-6 shadow-sm shadow-brand-blue/5 transition hover:border-brand-blue/40 hover:shadow-md">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-cyan to-brand-blue-dark text-white">
        <ArrowRight className="size-5" />
      </span>
      <div>
        <h3 className="text-[16px] font-semibold text-brand-navy">{title}</h3>
        <p className="text-[13.5px] leading-snug text-brand-ink/75">{blurb}</p>
      </div>
    </div>
  );
}
