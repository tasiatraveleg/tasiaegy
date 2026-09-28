/**
 * Returns a gallery item with its Portuguese (or any other locale's) text
 * swapped in, when the item has a `translations` entry for that locale.
 * Any missing field falls back to the original (English) value.
 *
 * Expected shape in the database:
 *   {
 *     name: "Karnak Temple",
 *     description: "...",
 *     country: "Egypt",
 *     url: "...",
 *     translations: {
 *       pt: { name: "...", description: "...", country: "Egito" }
 *     }
 *   }
 */
export function localizeGalleryItem(item, locale) {
  const tr = item?.translations?.[locale];
  if (!tr) return item;

  return {
    ...item,
    name: tr.name || item.name,
    description: tr.description || item.description,
    country: tr.country || item.country,
  };
}
