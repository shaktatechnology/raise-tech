import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfoCard from "@/components/contact/ContactInfoCard";
import { siteInfo } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact Us | Raise Tech Pvt. Ltd.",
  description: "Get in touch with Raise Tech Pvt. Ltd. in Kathmandu, Nepal.",
};

const mapQuery = encodeURIComponent(`${siteInfo.name}, ${siteInfo.address}`);

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="We'd Love to Hear From You" title="Contact Us" height="h-[220px] md:h-[240px]" />

      <section className="bg-brand-mist py-14">
        <div className="container-page grid gap-8 lg:grid-cols-2 lg:items-stretch">
          <ContactForm />

          <div className="overflow-hidden rounded-2xl shadow-xl shadow-brand-blue/10">
            <iframe
              title="Raise Tech Pvt. Ltd. location"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              className="h-full min-h-[420px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="container-page mt-10 grid gap-5 sm:grid-cols-3">
          <ContactInfoCard icon={Phone} title="Contact No" lines={siteInfo.phones} />
          <ContactInfoCard
            icon={Mail}
            title="Email"
            lines={[siteInfo.emails.support, siteInfo.emails.info]}
          />
          <ContactInfoCard icon={MapPin} title="Location" lines={[siteInfo.address]} />
        </div>
      </section>
    </>
  );
}
