import type { Metadata } from "next";
import {
  Gauge,
  HeartHandshake,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import ExpertiseHex from "@/components/about/ExpertiseHex";
import WhatWeDoItem from "@/components/about/WhatWeDoItem";
import WhyChooseCard from "@/components/about/WhyChooseCard";
import { expertise, siteInfo, whatWeDo, whyChooseUs } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Us | Raise Tech Pvt. Ltd.",
  description: siteInfo.description,
};

const whyChooseIcons = [HeartHandshake, Gauge, Rocket, Sparkles, Wrench, ShieldCheck];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About Raise Tech" title="Innovative Software Company in Nepal" />

      {/* Intro */}
      <section className="py-16">
        <div className="container-page grid gap-12 md:grid-cols-2 md:items-start">
          <div>
            <h2 className="text-[26px] font-bold text-brand-blue md:text-[30px]">{siteInfo.name}</h2>
            <p className="mt-1 text-[15px] font-medium text-brand-ink/70">Innovative Software Company in Nepal</p>

            <p className="mt-5 text-[15px] leading-relaxed text-brand-ink/85">
              Based in Kathmandu, Nepal, Raise Tech Pvt. Ltd. is a vibrant and progressive software development
              firm committed to providing dependable and creative IT solutions. Since our founding in{" "}
              {siteInfo.founded}, we have established a solid reputation for offering top-notch desktop, web, and
              mobile software solutions that are customised to satisfy the particular requirements of companies in
              a variety of sectors.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/85">
              At Raise Tech, we think technology should improve efficiency, streamline procedures, and produce
              genuine business value. Our team of talented experts designs and develops scalable, secure, and
              user-friendly solutions by fusing technical know-how with innovative problem-solving techniques. We
              concentrate on producing outcomes that support our clients in remaining competitive in a quickly
              changing digital landscape, from custom software development to end-to-end digital transformation.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="mb-4 text-center">
              <h3 className="text-[19px] font-bold text-brand-navy">Our Expertise</h3>
              <p className="text-[13.5px] italic text-brand-ink/60">Powered by knowledge &amp; precision.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ExpertiseHex label={expertise[0].label} />
              <ExpertiseHex label={expertise[1].label} offset />
              <ExpertiseHex label={expertise[2].label} offset />
              <ExpertiseHex label={expertise[3].label} />
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="bg-brand-mist py-16">
        <div className="container-page grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <SectionHeading
              title="What We Do?"
              subtitle="We offer a comprehensive range of software products and services designed to meet the evolving needs of modern businesses. Our flagship solutions include:"
            />
            <div className="mt-7 flex flex-col gap-4">
              {whatWeDo.map((item) => (
                <WhatWeDoItem key={item.title} title={item.title} blurb={item.blurb} />
              ))}
            </div>
          </div>

          {/* Illustrative device mock instead of stock photography */}
          <div className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-center">
            <div className="absolute h-[300px] w-[220px] -rotate-6 rounded-2xl bg-gradient-to-br from-brand-blue-darker to-brand-navy shadow-2xl" />
            <div className="absolute right-2 top-4 h-[260px] w-[190px] rotate-3 rounded-xl bg-white shadow-xl ring-1 ring-black/5">
              <div className="flex h-8 items-center gap-1.5 rounded-t-xl bg-brand-mist px-3">
                <span className="size-2 rounded-full bg-red-400" />
                <span className="size-2 rounded-full bg-amber-400" />
                <span className="size-2 rounded-full bg-emerald-400" />
              </div>
              <div className="space-y-2 p-3">
                <div className="h-2.5 w-3/4 rounded bg-brand-blue/25" />
                <div className="h-2.5 w-1/2 rounded bg-brand-blue/15" />
                <div className="mt-3 h-16 rounded-lg bg-brand-mist" />
                <div className="h-2.5 w-2/3 rounded bg-brand-blue/15" />
              </div>
            </div>
            <span className="absolute -bottom-2 left-2 rounded-full bg-brand-green px-3 py-1 text-[12px] font-semibold text-white shadow-lg">
              Next Steps
            </span>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-16">
        <div className="container-page">
          <SectionHeading
            align="center"
            title="Why Choose Raise Tech?"
            subtitle={
              'At Raise Tech, we proudly say "We are Young!" – not just in age, but in mindset. Our team is composed of skilled software engineers, creative web designers, and strategic business developers who are passionate about solving problems and reimagining what software can do. We thrive on innovation and continuously explore new ways to improve the digital experience for our clients.'
            }
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyChooseUs.map((item, i) => (
              <WhyChooseCard key={item.title} icon={whyChooseIcons[i]} title={item.title} blurb={item.blurb} />
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-brand-mist py-16">
        <div className="container-page max-w-3xl text-center">
          <h2 className="text-[26px] font-bold text-brand-blue md:text-[30px]">Our Vision &amp; Mission</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-brand-ink/85">
            Our vision is to become a leading force in Nepal&rsquo;s software industry by providing smart,
            sustainable solutions that drive digital transformation. Our mission is to utilize our domain expertise
            and technical excellence to deliver high-quality, cost-effective, and innovative IT solutions that
            create real value for our clients.
          </p>
        </div>
      </section>
    </>
  );
}
