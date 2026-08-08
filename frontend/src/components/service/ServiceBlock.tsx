import { LucideIcon } from "lucide-react";

export default function ServiceBlock({
  icon: Icon,
  title,
  subtitle,
  paragraphs,
  reversed = false,
  tinted = false,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  paragraphs: string[];
  reversed?: boolean;
  tinted?: boolean;
}) {
  return (
    <section className={tinted ? "bg-brand-mist py-14" : "py-14"}>
      <div
        className={`container-page grid items-center gap-10 lg:grid-cols-2 ${
          reversed ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div>
          <h2 className="text-[24px] font-bold text-brand-blue md:text-[28px]">{title}</h2>
          <p className="mt-1 text-[14.5px] font-medium text-brand-ink/70">{subtitle}</p>
          <div className="mt-5 space-y-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-brand-ink/85">
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex size-56 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-brand-cyan to-brand-blue-darker shadow-xl shadow-brand-blue/20 md:size-64">
            <Icon className="size-24 text-white" strokeWidth={1.2} />
          </div>
        </div>
      </div>
    </section>
  );
}
