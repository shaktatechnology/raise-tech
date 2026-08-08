import { Mail, MapPin, Phone } from "lucide-react";
import { siteInfo } from "@/lib/data";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/icons/SocialIcons";

export default function TopBar() {
  return (
    <div className="hidden bg-brand-blue text-white sm:block">
      <div className="container-page flex h-10 items-center justify-between text-[13px]">
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5">
            <Phone className="size-3.5" strokeWidth={2} />
            {siteInfo.phones.join(", ")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mail className="size-3.5" strokeWidth={2} />
            {siteInfo.emails.info}
          </span>
          <span className="hidden items-center gap-1.5 lg:inline-flex">
            <MapPin className="size-3.5" strokeWidth={2} />
            {siteInfo.address}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" aria-label="Facebook" className="opacity-90 transition hover:opacity-100">
            <FacebookIcon className="size-4" />
          </a>
          <a href="#" aria-label="Instagram" className="opacity-90 transition hover:opacity-100">
            <InstagramIcon className="size-4" />
          </a>
          <a href="#" aria-label="TikTok" className="opacity-90 transition hover:opacity-100">
            <TikTokIcon className="size-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
