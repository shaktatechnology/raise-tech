export default function ExpertiseHex({ label, offset = false }: { label: string; offset?: boolean }) {
  return (
    <div
      className={`flex h-[132px] w-[132px] items-center justify-center bg-gradient-to-br from-brand-cyan to-brand-blue-darker p-4 text-center text-[13px] font-semibold leading-snug text-white shadow-lg shadow-brand-blue/20 ${
        offset ? "md:mt-10" : ""
      }`}
      style={{ clipPath: "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)" }}
    >
      {label}
    </div>
  );
}
