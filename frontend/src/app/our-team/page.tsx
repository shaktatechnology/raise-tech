import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import PageHero from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Our Team | Raise Tech Pvt. Ltd.",
  description: "Meet the team behind Raise Tech Pvt. Ltd.",
};

export default function OurTeamPage() {
  return (
    <>
      <PageHero eyebrow="The People Behind Raise Tech" title="Our Team" height="h-[220px] md:h-[240px]" />
      <section className="py-20">
        <div className="container-page flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-brand-mist text-brand-blue">
            <Users className="size-7" />
          </span>
          <h2 className="mt-5 text-[22px] font-bold text-brand-navy">Team profiles coming soon</h2>
          <p className="mt-2 max-w-md text-[14.5px] text-brand-ink/75">
            We&rsquo;re putting together profiles for our engineers, designers, and business developers. In the
            meantime, get in touch and we&rsquo;ll introduce you to the right people directly.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 text-[14.5px] font-semibold text-brand-blue"
          >
            Contact us
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
