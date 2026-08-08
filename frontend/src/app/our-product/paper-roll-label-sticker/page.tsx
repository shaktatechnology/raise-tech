import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ProductSubNav from "@/components/products/ProductSubNav";
import PaperProductItem from "@/components/products/PaperProductItem";
import { paperProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Paper Roll & Label Sticker | Raise Tech Pvt. Ltd.",
  description: "Thermal paper rolls, dot matrix paper, and label stickers supplied by Raise Tech Pvt. Ltd.",
};

export default function PaperRollProductPage() {
  return (
    <>
      <PageHero eyebrow="Our Product" title="Paper Roll & Label Sticker" height="h-[240px] md:h-[260px]" />
      <ProductSubNav active="paper" />

      <section className="py-14">
        <div className="container-page flex flex-col gap-6">
          {paperProducts.map((product) => (
            <PaperProductItem key={product.title} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
