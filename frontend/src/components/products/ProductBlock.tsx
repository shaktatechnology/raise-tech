export default function ProductBlock({
  name,
  tagline,
  paragraphs,
  reversed = false,
  tinted = false,
}: {
  name: string;
  tagline: string;
  paragraphs: string[];
  reversed?: boolean;
  tinted?: boolean;
}) {
  const initials = name
    .split(" ")
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <section className={tinted ? "bg-brand-mist py-14" : "py-14"}>
      <div
        className={`container-page grid items-center gap-10 lg:grid-cols-[1fr_1.2fr] ${
          reversed ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="flex justify-center">
          <div className="flex size-40 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-green to-brand-blue-dark text-4xl font-extrabold text-white shadow-xl shadow-brand-blue/20 md:size-48">
            {initials}
          </div>
        </div>

        <div>
          <h3 className="text-[24px] font-bold text-brand-blue">{name}</h3>
          <p className="mt-1 text-[14.5px] font-medium text-brand-ink/70">{tagline}</p>
          <div className="mt-4 space-y-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-brand-ink/85">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
