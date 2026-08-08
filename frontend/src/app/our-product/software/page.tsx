import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ProductSubNav from "@/components/products/ProductSubNav";
import ProductBlock from "@/components/products/ProductBlock";
import { flagshipProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Software | Raise Tech Pvt. Ltd.",
  description: "eCalculo, Trackingmandu, and custom CRM software built by Raise Tech Pvt. Ltd.",
};

const [ecalculo, trackingmandu, argusCrm] = flagshipProducts;

export default function SoftwareProductPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Product"
        title="Smart, Secure, & Scalable Software Solutions for Business"
        height="h-[300px] md:h-[340px]"
      />
      <ProductSubNav active="software" />

      <ProductBlock name={ecalculo.name} tagline={ecalculo.tagline} paragraphs={ecalculo.paragraphs} />
      <ProductBlock
        name={trackingmandu.name}
        tagline={trackingmandu.tagline}
        paragraphs={trackingmandu.paragraphs}
        reversed
        tinted
      />
      <ProductBlock name={argusCrm.name} tagline={argusCrm.tagline} paragraphs={argusCrm.paragraphs} />
    </>
  );
}
