import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { slugify } from "./gallery";

// One document per country. The document ID is the slug (e.g. "egypt"),
// so there can never be two records for the same country, and lookups by
// URL slug are a direct read.
//
//   {
//     name: "Egypt",                 // English, same spelling as on the places
//     slug: "egypt",
//     coverImageUrl: "https://...",
//     coverImagePublicId: "...",
//     translations: { pt: { name: "Egito" } }
//   }
const COLLECTION = "countries";

export async function getCountryRecords() {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCountryRecord(slug) {
  const snap = await getDoc(doc(db, COLLECTION, slug));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Creates or fully replaces the record for this country.
export async function saveCountry(name, data) {
  const slug = slugify(name);
  await setDoc(doc(db, COLLECTION, slug), { ...data, name, slug });
  return slug;
}

export async function deleteCountry(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}

// Swaps in the translated name for the given locale, falling back to English.
export function localizeCountry(record, locale) {
  if (!record) return record;
  return {
    ...record,
    name: record.translations?.[locale]?.name || record.name,
  };
}