import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getGalleryItems, getCountries } from "@/lib/gallery";
import { EGYPT_PLACES } from "@/lib/egypt-places-seed";
import { withTransform } from "@/lib/cloudinary";
import { getCountryRecords, localizeCountry } from "@/lib/countries";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "GalleryPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function GalleryPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("GalleryPage");

  let items = EGYPT_PLACES;
  try {
    const live = await getGalleryItems();
    if (live.length > 0) items = live;
  } catch {
    // Firebase not configured yet.
  }

  // Country records (managed in the dashboard) supply each country's cover
  // photo and translated name. Countries without a record keep working with
  // the values that getCountries() derives from their places.
  let records = [];
  try {
    records = await getCountryRecords();
  } catch {
    // Firebase not configured yet, or the collection isn't readable.
  }
  const recordBySlug = Object.fromEntries(records.map((r) => [r.id, r]));

  const countries = getCountries(items).map((country) => {
    const record = recordBySlug[country.slug];
    if (!record) return country;
    return {
      ...country,
      name: localizeCountry(record, locale).name || country.name,
      coverImageUrl: record.coverImageUrl || country.coverImageUrl,
    };
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-24">
        {/* Header */}
        <header className="mb-10 max-w-2xl sm:mb-14 lg:mb-16">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-navy" aria-hidden="true" />
            <span className="text-xs font-medium tracking-wide text-navy sm:text-sm">
              {t("eyebrow")}
            </span>
          </div>
          <h1 className="font-display text-3xl italic leading-tight text-charcoal sm:text-4xl lg:text-5xl">
            {t.rich("heading", {
              highlight: (chunks) => (
                <span className="text-navy">{chunks}</span>
              ),
            })}
          </h1>
        </header>

        {/* Countries */}
        {countries.length === 0 ? (
          <p className="rounded-2xl border border-charcoal/10 bg-charcoal/[0.03] px-6 py-12 text-center text-charcoal/70">
            {t("empty")}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
            {countries.map((country, i) => (
              <li key={country.slug}>
                <Link
                  href={`/gallery/${country.slug}`}
                  aria-label={`${country.name}, ${t("places", {
                    count: country.count,
                  })}`}
                  className="group relative block overflow-hidden rounded-3xl bg-charcoal/5 shadow-sm transition-shadow duration-300 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy"
                >
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src="https://res.cloudinary.com/dkpsmuui1/image/upload/v1790857265/2_xmxizd.jpg"
                      alt={country.name}
                      fill
                      priority={i < 2}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 480px) 50vw, 100vw"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <h2 className="font-display text-xl italic text-warm-ivory sm:text-2xl">
                      {country.name}
                    </h2>
                    <p className="mt-1 text-sm text-warm-ivory/80">
                      {t("places", { count: country.count })}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
