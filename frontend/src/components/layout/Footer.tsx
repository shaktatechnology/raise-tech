import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/icons/SocialIcons";
import { quickLinks, siteInfo } from "@/lib/data";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-brand-ink/80">{siteInfo.description}</p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="inline-flex size-8 items-center justify-center rounded-full bg-brand-blue text-white transition hover:bg-brand-blue-dark"
            >
              <FacebookIcon className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="inline-flex size-8 items-center justify-center rounded-full bg-brand-blue text-white transition hover:bg-brand-blue-dark"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href="#"
              aria-label="TikTok"
              className="inline-flex size-8 items-center justify-center rounded-full bg-brand-blue text-white transition hover:bg-brand-blue-dark"
            >
              <TikTokIcon className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-[17px] font-semibold text-brand-blue">Quick Links</h3>
          <ul className="mt-4 space-y-2.5">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-2 text-[14px] text-brand-ink/85 transition hover:text-brand-blue"
                >
                  <span className="text-brand-blue">»</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[17px] font-semibold text-brand-blue">Contact Info</h3>
          <ul className="mt-4 space-y-3 text-[14px] text-brand-ink/85">
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-brand-blue" />
              <span>{siteInfo.phones.join(", ")}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand-blue" />
              <span>{siteInfo.emails.info}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-blue" />
              <span>{siteInfo.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-brand-blue py-3 text-center text-[13px] text-white">© {year} Raisetech</div>
    </footer>
  );
}
