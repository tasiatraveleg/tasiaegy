export const LOCALES = ["en", "pt"];
export const DEFAULT_LOCALE = "en";
export const LOCALE_LABELS = { en: "English", pt: "Português" };

export const PROGRAM_TEXT_FIELDS = ["title", "duration", "route", "summary"];
export const DAY_TEXT_FIELDS = ["title", "description"];
export const INCLUDED_TEXT_FIELDS = ["text"];

function hasValue(value) {
  if (value == null) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function resolveText(base, translations, locale) {
  const out = { ...base };
  const layers = [
    translations?.[DEFAULT_LOCALE],
    locale !== DEFAULT_LOCALE ? translations?.[locale] : null,
  ];
  for (const layer of layers) {
    if (!layer) continue;
    for (const [key, value] of Object.entries(layer)) {
      if (hasValue(value)) out[key] = value;
    }
  }
  return out;
}

export function localizeProgram(program, locale = DEFAULT_LOCALE) {
  if (!program) return program;

  const { translations, days, itinerary, included, ...rest } = program;
  const localized = resolveText(rest, translations, locale);

  const dayList = days?.length ? days : itinerary ?? [];
  localized.days = dayList.map(({ translations: tr, ...day }) =>
    resolveText(day, tr, locale)
  );

  localized.included = (included ?? [])
    .map((item) => (typeof item === "string" ? { text: item } : item))
    .map(({ translations: tr, ...item }) => resolveText(item, tr, locale))
    .filter((item) => hasValue(item.text));

  return localized;
}
