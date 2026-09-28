import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  Clock,
  MapPin,
  Compass,
  Users,
  Footprints,
  Home,
  Star,
  Utensils,
  Car,
  Ticket,
  Phone,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DayCarousel from "@/components/DayCarousel";
import { getProgram, getPrograms } from "@/lib/programs";
import { localizeProgram } from "@/lib/localize";
import { FALLBACK_PROGRAMS } from "@/lib/fallback-data";
import { INCLUDED_ICONS, getIncludedIcon } from "@/lib/includedIcons";

// Shown only when a program has no "What's included" items of its own.
const DEFAULT_INCLUDED = [
  { icon: Home, text: "Hand-selected heritage hotels for every night of the trip" },
  { icon: Utensils, text: "Daily breakfast, plus curated dinners along the way" },
  { icon: Phone, text: "A dedicated 24/7 trip lead and concierge line" },
  { icon: Car, text: "All ground & river transfers, private guide and driver" },
  { icon: Ticket, text: "Entry to every site, temple and museum on the itinerary" },
  { icon: Compass, text: "Airport meet and greet on arrival" },
];

// Icons from the dashboard are saved as strings ("star"); the defaults above
// are already components. Handle both.
function resolveIcon(icon) {
  if (typeof icon === "string") return getIncludedIcon(icon);
  return icon ?? Star;
}

export default async function ProgramJourneyPage({ params }) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Program");
  const tNav = await getTranslations("Nav");
  const tCard = await getTranslations("ProgramCard");

  // Translate a tag for display (e.g. "Signature" → "Assinatura").
  // The stored value in Firestore stays English.
  const tagLabel = (tag) =>
    tag && tCard.has(`tags.${tag}`) ? tCard(`tags.${tag}`) : tag;

  // Use the translation if the key exists in the messages file, otherwise
  // the English default, so a missing key never breaks the page.
  const label = (key, fallback) => (t.has(key) ? t(key) : fallback);

  let program = null;
  try {
    program = await getProgram(id);
  } catch (error) {
    // Check your terminal for this line if a Firestore program won't load.
    console.error(`[program page] Couldn't load "${id}" from Firestore:`, error);
  }
  if (!program) {
    program = FALLBACK_PROGRAMS.find((p) => p.id === id) ?? null;
  }

  if (!program) {
    notFound();
  }

  // Text for the visitor's language, falling back to English where blank.
  const localized = localizeProgram(program, locale);

  const days = localized.days?.length
    ? localized.days
    : program.itinerary ?? [];

  const fields = program.fields?.length
    ? program.fields
    : [tagLabel(program.tag)].filter(Boolean);

  const highlights = program.highlights?.length
    ? program.highlights
    : t.raw("defaultHighlights");

  const included = localized.included?.length
    ? localized.included.map((item) =>
        typeof item === "string" ? { text: item } : item
      )
    : DEFAULT_INCLUDED;

  let otherPrograms = [];
  try {
    const all = await getPrograms();
    otherPrograms = all.filter((p) => p.id !== program.id).slice(0, 2);
  } catch (error) {
    console.error("[program page] Couldn't load other programs:", error);
    otherPrograms = FALLBACK_PROGRAMS.filter((p) => p.id !== program.id).slice(0, 2);
  }

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-charcoal">
          <div className="relative aspect-[16/9] w-full sm:aspect-[2.1/1]">
            {program.coverImageUrl && (
              <Image
                src={program.coverImageUrl}
                alt={localized.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-charcoal/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-charcoal/30" />

            <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-center px-6 lg:px-10">
              <div className="mt-6 flex items-center gap-3 text-xs tracking-[0.2em] text-warm-ivory/70">
                <span className="h-px w-8 bg-warm-ivory/50" />
                <span>
                  {tagLabel(program.tag)?.toLocaleUpperCase(locale)} ·{" "}
                  {localized.duration?.toLocaleUpperCase(locale)}
                </span>
              </div>

              <h1 className="mt-4 max-w-2xl font-display text-4xl italic leading-tight text-warm-ivory sm:text-5xl">
                {localized.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-warm-ivory/70">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {localized.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {localized.route}
                </span>
                {fields.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Compass size={14} />
                    {fields.join(" · ")}
                  </span>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/contact"
                  className="flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-warm-ivory transition-colors hover:bg-navy-dark"
                >
                  {t("reserve")}
                  <ArrowRight size={15} />
                </Link>
                {days.length > 0 && (
                  <a
                    href="#itinerary"
                    className="rounded-full border border-warm-ivory/50 px-6 py-3 text-sm font-medium text-warm-ivory transition-colors hover:bg-warm-ivory/10"
                  >
                    {t("viewItinerary")}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* The Journey + At a Glance */}
        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[1fr_360px] lg:gap-16">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-navy" />
                <span className="text-xs tracking-[0.2em] text-navy">
                  {t("theJourney")}
                </span>
              </div>
              <p className="max-w-2xl text-lg leading-relaxed text-charcoal/85">
                {localized.summary}
              </p>

              <div className="mt-8 border-l-2 border-gold/60 pl-5">
                <p className="text-xs tracking-[0.15em] text-charcoal/50">
                  {t("setsApart")}
                </p>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {highlights.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-charcoal/80"
                    >
                      <Star size={14} className="mt-0.5 shrink-0 text-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="rounded-[1.75rem] bg-warm-beige/60 p-7">
              <p className="text-xs font-medium tracking-[0.15em] text-charcoal/60">
                {t("atAGlance")}
              </p>

              <dl className="mt-5 flex flex-col gap-4 text-sm">
                <GlanceRow
                  icon={Clock}
                  label={t("duration")}
                  value={localized.duration}
                />
                <GlanceRow
                  icon={Users}
                  label={t("group")}
                  value={program.groupSize ?? t("defaultGroup")}
                />
                <GlanceRow
                  icon={MapPin}
                  label={t("route")}
                  value={localized.route}
                />
                <GlanceRow
                  icon={Footprints}
                  label={t("pace")}
                  value={program.pace ?? t("defaultPace")}
                />
                <GlanceRow
                  icon={Home}
                  label={t("stayingIn")}
                  value={program.stayingIn ?? t("defaultStayingIn")}
                />
              </dl>

              {fields.length > 0 && (
                <div className="mt-6 border-t border-charcoal/10 pt-5">
                  <p className="text-xs font-medium tracking-[0.15em] text-charcoal/60">
                    {t("fieldsOfStudy")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {fields.map((f) => (
                      <span
                        key={f}
                        className="rounded-full bg-warm-ivory px-3 py-1 text-xs text-charcoal/70"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>

        {/* Day by day */}
        {days.length > 0 && (
          <section id="itinerary" className="bg-warm-beige/40 py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-px w-8 bg-navy" />
                    <span className="text-xs tracking-[0.2em] text-navy">
                      {t("dayByDay")}
                    </span>
                  </div>
                  <h2 className="font-display text-3xl italic text-charcoal sm:text-4xl">
                    {t("dayByDayTitle")}
                  </h2>
                </div>
                <p className="max-w-xs text-xs leading-relaxed text-charcoal/60">
                  {t("dayByDayNote")}
                </p>
              </div>

              <DayCarousel days={days} />
            </div>
          </section>
        )}

        {/* What's included — intentionally left untranslated for now */}
        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-navy" />
                <span className="text-xs tracking-[0.2em] text-navy">
                  WHAT&apos;S INCLUDED
                </span>
              </div>
              <h2 className="font-display text-3xl italic leading-tight text-charcoal sm:text-4xl">
                Everything handled, nothing diluted.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-charcoal/70">
                Your only decisions are the ones that make the journey yours.
                Transport, entry, guides and stays are arranged so you can stay
                inside the story.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {included.map((item, i) => {
                const Icon = resolveIcon(item.icon);
                return (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warm-beige">
                      <Icon size={16} className="text-navy" />
                    </span>
                    <p className="text-sm leading-relaxed text-charcoal/80">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Keep exploring */}
        {otherPrograms.length > 0 && (
          <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px w-8 bg-navy" />
                  <span className="text-xs tracking-[0.2em] text-navy">
                    {t("keepExploring")}
                  </span>
                </div>
                <h2 className="font-display text-3xl italic text-charcoal sm:text-4xl">
                  {t("otherJourneys")}
                </h2>
              </div>
              <Link
                href="/programs"
                className="flex items-center gap-1.5 text-sm font-medium text-navy hover:underline"
              >
                {t("viewAll")}
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {otherPrograms.map((p) => {
                const lp = localizeProgram(p, locale);
                return (
                  <Link
                    key={p.id}
                    href={`/programs/${p.id}`}
                    className="group relative flex h-[340px] flex-col justify-end overflow-hidden rounded-[1.75rem] p-7"
                  >
                    {p.coverImageUrl && (
                      <Image
                        src={p.coverImageUrl}
                        alt={lp.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 640px) 50vw, 100vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />

                    <div className="relative">
                      <div className="flex items-center gap-2 text-xs text-warm-ivory/80">
                        {p.tag && (
                          <span className="rounded-full bg-gold/90 px-2.5 py-1 text-[11px] font-medium text-charcoal">
                            {tagLabel(p.tag)}
                          </span>
                        )}
                        <span>
                          {lp.duration} · {lp.route}
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-2xl italic text-warm-ivory">
                        {lp.title}
                      </h3>
                      <p className="mt-2 max-w-sm text-sm leading-relaxed text-warm-ivory/80">
                        {lp.summary}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-warm-ivory/50 px-5 py-2.5 text-xs font-medium text-warm-ivory transition-colors group-hover:bg-warm-ivory/10">
                        {t("explore")}
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mx-auto max-w-2xl px-6 pb-24 text-center lg:px-10">
          <p className="font-display text-2xl italic text-charcoal">
            {t("ready")}
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-full bg-navy px-8 py-3 text-sm font-medium text-warm-ivory transition-colors hover:bg-navy-dark"
          >
            {tNav("cta")}
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

function GlanceRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-navy" />
      <div>
        <dt className="text-[11px] uppercase tracking-wide text-charcoal/50">
          {label}
        </dt>
        <dd className="mt-0.5 text-charcoal/85">{value}</dd>
      </div>
    </div>
  );
}