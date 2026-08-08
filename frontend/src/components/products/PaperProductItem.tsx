import type { PaperProduct } from "@/lib/data";

export default function PaperProductItem({ product }: { product: PaperProduct }) {
  return (
    <div className="grid gap-6 rounded-xl border border-black/5 bg-white p-6 shadow-sm shadow-black/5 md:grid-cols-[1fr_180px] md:items-start">
      <div>
        <div className="inline-block rounded-md bg-brand-green px-4 py-2 text-[14.5px] font-semibold text-white">
          {product.title}
        </div>
        {product.eyebrow && (
          <p className="mt-2 text-[13px] font-semibold uppercase tracking-wide text-brand-blue">{product.eyebrow}</p>
        )}
        <p className="mt-3 text-[14.5px] leading-relaxed text-brand-ink/85">{product.description}</p>

        {product.specs && (
          <dl className="mt-4 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {product.specs.map((spec) => (
              <div key={spec.label} className="flex gap-1.5 text-[13.5px]">
                <dt className="font-semibold text-brand-navy">{spec.label}:</dt>
                <dd className="text-brand-ink/80">{spec.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {/* Product visual placeholder in place of photography */}
      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-white to-brand-mist ring-8 ring-brand-mist md:mx-0 md:ml-auto">
        <div className="size-16 rounded-full border-[10px] border-white bg-brand-ink/10 shadow-inner" />
      </div>
    </div>
  );
}
