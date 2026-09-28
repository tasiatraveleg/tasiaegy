import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JourneyPath from "@/components/JourneyPath";
import { getGalleryItems, slugify } from "@/lib/gallery";
import { EGYPT_PLACES } from "@/lib/egypt-places-seed";
import { localizeGalleryItem } from "@/lib/localize-gallery";
import { getCountryRecord, localizeCountry } from "@/lib/countries";

// Filters by the ORIGINAL (English) country name so the URL slug stays
// the same in every language. Translation happens afterwards, for display.
async function getCountryItems(countrySlug) {
  let items = EGYPT_PLACES;
  try {
    const live = await getGalleryItems();
    if (live.length > 0) items = live;
  } catch {
    // Firebase not configured yet.
  }

  return items.filter(
    (item) => slugify(item.country || "Egypt") === countrySlug
  );
}

export async function generateMetadata({ params }) {
  const { country: countrySlug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "CountryPage" });

  const countryItems = await getCountryItems(countrySlug);
  if (countryItems.length === 0) return {};

  let record = null;
  try {
    record = await getCountryRecord(countrySlug);
  } catch {
    // Firebase not configured yet, or the collection isn't readable.
  }

  const countryName =
    (record && localizeCountry(record, locale).name) ||
    localizeGalleryItem(countryItems[0], locale).country ||
    t("defaultCountry");

  return {
    title: `${countryName} | ${t("galleryLabel")} | TASIA`,
    description: t("metaDescription", {
      count: countryItems.length,
      country: countryName,
    }),
  };
}

export default async function CountryGalleryPage({ params }) {
  const { country: countrySlug, locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("CountryPage");
  const countryItems = await getCountryItems(countrySlug);

  if (countryItems.length === 0) {
    notFound();
  }

  const stops = countryItems.map((raw) => {
    const item = localizeGalleryItem(raw, locale);
    return {
      id: item.id,
      title: item.name,
      description: item.description,
      image: item.url,
    };
  });

  return (
    <>
      <Navbar />
      <main>
        <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-10 lg:pt-16">
          <Link
            href="/gallery"
            className="group inline-flex items-center gap-2 rounded-full border border-charcoal/10 px-4 py-2 text-sm text-charcoal/70 transition-colors hover:border-navy/30 hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none"
            />
            {t("backToCountries")}
          </Link>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-20">
          <JourneyPath stops={stops} />
        </section>
      </main>
      <Footer />
    </>
  );
}