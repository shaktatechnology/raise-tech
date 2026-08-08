import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gauge, Globe, HeartHandshake, MapPinned, Palette, Rocket, Server, Smartphone, Wallet } from "lucide-react";
import HomeHero from "@/components/home/HomeHero";
import SectionHeading from "@/components/ui/SectionHeading";
import ServiceTeaserCard from "@/components/home/ServiceTeaserCard";
import WhyChooseCard from "@/components/about/WhyChooseCard";
import { siteInfo, whyChooseUs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Raise Tech Pvt. Ltd. | Smart, Secure & Scalable Software Solutions",
  description: siteInfo.description,
};

const serviceTeasers = [
  { icon: Globe, title: "Web Development", blurb: "Fast, responsive websites and web apps built to scale.", href: "/service" },
  { icon: Smartphone, title: "Mobile App Development", blurb: "Cross-platform apps for iOS and Android with React Native.", href: "/service" },
  { icon: Server, title: "Backend Development", blurb: "Robust REST & GraphQL APIs tailored to your architecture.", href: "/service" },
  { icon: Palette, title: "UI/UX Design", blurb: "Investor-ready interfaces backed by user-centered research.", href: "/service" },
];

const productTeasers = [
  { icon: Wallet, title: "eCalculo", blurb: "All-in-one accounting & inventory management software.", href: "/our-product/software" },
  { icon: MapPinned, title: "Trackingmandu", blurb: "GPS vehicle tracking & fleet management device.", href: "/our-product/software" },
];

export default function HomePage() {
  return (
    <>
      <HomeHero />

      {/* About teaser */}
      <section className="py-16">
        <div className="container-page grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <SectionHeading title={siteInfo.name} subtitle="Innovative Software Company in Nepal" />
            <p className="mt-5 text-[15px] leading-relaxed text-brand-ink/85">
              Since {siteInfo.founded}, we&rsquo;ve built a reputation in Kathmandu for dependable, creative IT
              solutions — combining technical know-how with user-centric design to help businesses stay competitive
              in a fast-changing digital landscape.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 text-[14.5px] font-semibold text-brand-blue"
            >
              More about us
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[HeartHandshake, Gauge, Rocket, Globe].map((Icon, i) => (
              <div
                key={i}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-cyan/15 to-brand-blue/10 text-brand-blue-dark"
              >
                <Icon className="size-8" strokeWidth={1.6} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services teaser */}
      <section className="bg-brand-mist py-16">
        <div className="container-page">
          <SectionHeading
            align="center"
            title="Services"
            subtitle="A comprehensive range of software products and services designed for modern businesses."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {serviceTeasers.map((s) => (
              <ServiceTeaserCard key={s.title} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Products teaser */}
      <section className="py-16">
        <div className="container-page">
          <SectionHeading
            align="center"
            title="Our Flagship Products"
            subtitle="Software built in-house, trusted by businesses across Nepal."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {productTeasers.map((p) => (
              <ServiceTeaserCard key={p.title} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* Why choose teaser */}
      <section className="bg-brand-mist py-16">
        <div className="container-page">
          <SectionHeading align="center" title="Why Choose Raise Tech?" />
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {whyChooseUs.slice(0, 3).map((item, i) => (
              <WhyChooseCard
                key={item.title}
                icon={[HeartHandshake, Gauge, Rocket][i]}
                title={item.title}
                blurb={item.blurb}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-brand-blue-darker to-brand-blue py-16 text-center text-white">
        <div className="container-page">
          <h2 className="text-[26px] font-bold md:text-[30px]">Ready to build something smart?</h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-white/85">
            Tell us about your project and we&rsquo;ll help you turn it into a scalable, secure software solution.
          </p>
          <Link
            href="/contact"
            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-8 text-[15px] font-semibold text-brand-blue-darker shadow-lg transition hover:brightness-95"
          >
            Contact Us
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
