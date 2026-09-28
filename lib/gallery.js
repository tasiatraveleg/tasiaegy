import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const GALLERY_COLLECTION = "gallery";

/** @returns {Promise<import("@/types").GalleryItem[]>} */
export async function getGalleryItems() {
  const q = query(collection(db, GALLERY_COLLECTION), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** @returns {Promise<string>} */
export async function addGalleryItem(data) {
  const ref = await addDoc(collection(db, GALLERY_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateGalleryItem(id, data) {
  const ref = doc(db, GALLERY_COLLECTION, id);
  await updateDoc(ref, data);
}

export async function deleteGalleryItem(id) {
  await deleteDoc(doc(db, GALLERY_COLLECTION, id));
}

/** URL-safe slug for a country name: "Egypt" -> "egypt". */
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Distinct countries present in a list of gallery items, each with a slug
 * for routing, a representative cover image, and a place count — in the
 * order countries first appear (so Egypt, added first, stays first).
 * @param {import("@/types").GalleryItem[]} items
 */
export function getCountries(items) {
  const countries = new Map();
  for (const item of items) {
    const name = item.country || "Egypt";
    if (!countries.has(name)) {
      countries.set(name, { name, slug: slugify(name), count: 0, coverImageUrl: "/images/egypt1.jpg" });
    }
    countries.get(name).count++;
  }
  return [...countries.values()];
}

/**
 * Groups a flat list of gallery items into { region, items[] } buckets, in
 * the canonical Egypt travel order (Cairo first, Alexandria last), rather
 * than alphabetically.
 * @param {import("@/types").GalleryItem[]} items
 */
export function groupByRegion(items) {
  const REGION_ORDER = [
    "Cairo & Giza",
    "Sinai",
    "Middle Egypt",
    "Luxor",
    "Aswan & Nubia",
    "Western Desert Oases",
    "Alexandria",
  ];
  const groups = new Map();
  for (const item of items) {
    const region = item.region || "Other";
    if (!groups.has(region)) groups.set(region, []);
    groups.get(region).push(item);
  }
  return [...groups.entries()]
    .sort((a, b) => REGION_ORDER.indexOf(a[0]) - REGION_ORDER.indexOf(b[0]))
    .map(([region, regionItems]) => ({ region, items: regionItems }));
}
