/**
 * Returns a program with the text for the given locale swapped in.
 * Anything missing in that language falls back to the English text, so
 * programs can be translated gradually without breaking anything.
 *
 * Expected shape in Firestore (English stays in the normal fields):
 *   {
 *     title, summary, duration, route,
 *     days: [
 *       {
 *         title, description, image,
 *         translations: { pt: { title, description } }
 *       }
 *     ],
 *     translations: {
 *       pt: { title, summary, duration, route }
 *     }
 *   }
 */
export function localizeProgram(program, locale) {
  if (!program) return program;

  const localized = { ...program };

  if (Array.isArray(program.days)) {
    localized.days = program.days.map((day) => {
      const tr = day.translations?.[locale];
      if (!tr) return day;
      return {
        ...day,
        title: tr.title || day.title,
        description: tr.description || day.description,
      };
    });
  }

  const tr = program.translations?.[locale];
  if (tr) {
    localized.title = tr.title || program.title;
    localized.summary = tr.summary || program.summary;
    localized.duration = tr.duration || program.duration;
    localized.route = tr.route || program.route;
  }

  return localized;
}