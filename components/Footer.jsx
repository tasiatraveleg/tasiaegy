import Image from "next/image";
import { useTranslations } from "next-intl";
import { AtSign, Phone, Globe, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import FooterContactForm from "@/components/FooterContactForm";

// Labels come from messages ("Footer.links.<key>"); only hrefs live here.
const EXPLORE_LINKS = [
  { key: "home", href: "/" },
  { key: "programs", href: "/programs" },
  { key: "gallery", href: "/gallery" },
  { key: "contact", href: "/contact" },
];

// Shown only if the form fails to send.
const EMAIL = "tasiatraveleg@gmail.com";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-charcoal text-warm-ivory">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        {/*
          below md : stacked and centered (small phones -> large phones -> small tablets)
          md+      : brand left | contact form right (tablet -> desktop)
        */}
        <div className="flex flex-col items-center gap-10 text-center md:flex-row md:items-center md:justify-between md:gap-12 md:text-left lg:gap-16">
          {/* Brand */}
          <div className="flex min-w-0 flex-col items-center md:flex-1 md:items-start">
            <div className="relative h-20 w-32 sm:h-24 sm:w-40 lg:h-28 lg:w-48">
              <Image
                src="/brand/logo-full-light.png"
                alt={t("logoAlt")}
                fill
                className="object-contain object-center md:object-left"
                sizes="(min-width: 1024px) 192px, (min-width: 640px) 160px, 128px"
              />
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-warm-ivory/70 sm:max-w-sm lg:max-w-md">
              {t("tagline")}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              {[AtSign, Phone, Globe, MessageCircle].map((Icon, i) => (
                <span
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-warm-ivory/25 text-warm-ivory/80 sm:h-10 sm:w-10"
                >
                  <Icon size={15} />
                </span>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div className="flex w-full min-w-0 justify-center md:flex-1 md:justify-end lg:flex-none lg:basis-96">
            <FooterContactForm email={EMAIL} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-warm-ivory/10 pt-6 text-center text-xs leading-relaxed text-warm-ivory/50 sm:mt-12 md:flex-row md:justify-between md:text-left lg:mt-14">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p>{t("credit")}</p>
        </div>
      </div>
    </footer>
  );
}