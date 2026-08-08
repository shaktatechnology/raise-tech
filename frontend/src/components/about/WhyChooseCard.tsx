import { LucideIcon } from "lucide-react";

export default function WhyChooseCard({
  icon: Icon,
  title,
  blurb,
}: {
  icon: LucideIcon;
  title: string;
  blurb: string;
}) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-brand-blue-darker to-brand-blue p-7 text-center text-white shadow-lg shadow-brand-blue/20">
      <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border border-white/40">
        <Icon className="size-6" strokeWidth={1.6} />
      </span>
      <h3 className="text-[17px] font-semibold">{title}</h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-white/85">{blurb}</p>
    </div>
  );
}
