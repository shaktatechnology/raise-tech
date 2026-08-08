import { LucideIcon } from "lucide-react";

export default function ContactInfoCard({
  icon: Icon,
  title,
  lines,
}: {
  icon: LucideIcon;
  title: string;
  lines: string[];
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-md shadow-brand-blue/10">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-cyan to-brand-blue-dark text-white">
        <Icon className="size-5" />
      </span>
      <div>
        <h3 className="text-[15px] font-semibold text-brand-navy">{title}</h3>
        {lines.map((line) => (
          <p key={line} className="text-[13.5px] text-brand-ink/80">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
