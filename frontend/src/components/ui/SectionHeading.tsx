export default function SectionHeading({
  title,
  subtitle,
  align = "left",
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <h2 className="text-[26px] font-bold text-brand-blue md:text-[30px]">{title}</h2>
      {subtitle && (
        <p className={`mt-2 text-[15px] text-brand-ink/80 ${align === "center" ? "mx-auto max-w-2xl" : "max-w-xl"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
