import { getLocale, getTranslations } from "next-intl/server";
import ProgramCard from "./ProgramCard";
import { getPrograms } from "@/lib/programs";
import { localizeProgram } from "@/lib/localize";
import { FALLBACK_PROGRAMS } from "@/lib/fallback-data";

// limit: how many programs to show. Leave it out to show all of them.
export default async function Programs({ limit } = {}) {
  const t = await getTranslations("ProgramsSection");
  const locale = await getLocale();
  let programs = FALLBACK_PROGRAMS;

  try {
    const live = await getPrograms();
    console.log(`[Programs] Firestore returned ${live.length} program(s)`);
    if (live.length > 0) programs = live;
  } catch (error) {
    console.error("[Programs] Couldn't load from Firestore:", error);
  }

  const visible = limit ? programs.slice(0, limit) : programs;

  return (
    <section className="bg-warm-beige/40 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-navy" />
              <span className="text-xs text-navy">{t("eyebrow")}</span>
            </div>
            <h2 className="max-w-lg font-display text-3xl italic leading-tight text-charcoal sm:text-4xl">
              {t.rich("heading", {
                highlight: (chunks) => (
                  <span className="text-navy">{chunks}</span>
                ),
              })}
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-charcoal/70">
            {t("description")}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {visible.map((program) => {
            // Text in the visitor's language; blank fields fall back to English.
            const localized = localizeProgram(program, locale);
            return (
              <ProgramCard
                key={program.id}
                id={program.id}
                tag={program.tag}
                duration={localized.duration}
                route={localized.route}
                title={localized.title}
                summary={localized.summary}
                imageUrl={program.coverImageUrl}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
