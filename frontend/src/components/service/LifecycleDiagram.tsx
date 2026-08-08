import { dataScienceLifecycle } from "@/lib/data";

export default function LifecycleDiagram() {
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-brand-blue/15 bg-white p-6 shadow-lg shadow-brand-blue/10">
        <p className="text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-brand-blue">
          Data Science Lifecycle
        </p>
        <ol className="mt-5 space-y-3">
          {dataScienceLifecycle.map((item) => (
            <li key={item.step} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-cyan to-brand-blue-dark text-[13px] font-bold text-white">
                {item.step}
              </span>
              <span className="text-[14px] font-medium text-brand-navy">{item.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
