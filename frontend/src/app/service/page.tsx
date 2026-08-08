import type { Metadata } from "next";
import { Globe, Palette, Server, Smartphone } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import ServiceBlock from "@/components/service/ServiceBlock";
import LifecycleDiagram from "@/components/service/LifecycleDiagram";
import { services } from "@/lib/data";

export const metadata: Metadata = {
  title: "Our Services | Raise Tech Pvt. Ltd.",
  description: "Web, mobile, backend, design, and data science services from Raise Tech Pvt. Ltd.",
};

const [webDev, mobileDev, backendDev, design, dataScience] = services;

export default function ServicePage() {
  return (
    <>
      <PageHero eyebrow="What We Offer" title="Services Built Around Your Business Goals" />

      <ServiceBlock icon={Globe} title={webDev.title} subtitle={webDev.subtitle} paragraphs={webDev.paragraphs} />
      <ServiceBlock
        icon={Smartphone}
        title={mobileDev.title}
        subtitle={mobileDev.subtitle}
        paragraphs={mobileDev.paragraphs}
        reversed
        tinted
      />
      <ServiceBlock
        icon={Server}
        title={backendDev.title}
        subtitle={backendDev.subtitle}
        paragraphs={backendDev.paragraphs}
      />
      <ServiceBlock
        icon={Palette}
        title={design.title}
        subtitle={design.subtitle}
        paragraphs={design.paragraphs}
        reversed
        tinted
      />

      {/* Data Science gets a bespoke layout with the lifecycle diagram */}
      <section className="py-16">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading title={dataScience.title} subtitle={undefined} />
            <p className="mt-1 text-[14.5px] font-medium text-brand-ink/70">{dataScience.subtitle}</p>
            <div className="mt-5 space-y-4">
              {dataScience.paragraphs.map((p, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-brand-ink/85">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <LifecycleDiagram />
        </div>
      </section>
    </>
  );
}
