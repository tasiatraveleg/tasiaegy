import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const PROGRAMS_COLLECTION = "programs";

// When a program was created, in milliseconds. Programs with no createdAt
// (for example ones typed in by hand in the Firebase console) count as
// newest, so they go to the end instead of disappearing.
const createdTime = (program) =>
  program.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;

/**
 * Oldest first, so programs appear in the order they were entered.
 * Sorted in code rather than with orderBy: a Firestore orderBy silently
 * leaves out documents that don't have that field.
 * @returns {Promise<import("@/types").Program[]>}
 */
export async function getPrograms() {
  const snapshot = await getDocs(collection(db, PROGRAMS_COLLECTION));
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort(
      (a, b) =>
        createdTime(a) - createdTime(b) ||
        (a.order ?? 9999) - (b.order ?? 9999)
    );
}

/** @returns {Promise<import("@/types").Program | null>} */
export async function getProgram(id) {
  const ref = doc(db, PROGRAMS_COLLECTION, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** @returns {Promise<string>} */
export async function createProgram(data) {
  const ref = await addDoc(collection(db, PROGRAMS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProgram(id, data) {
  const ref = doc(db, PROGRAMS_COLLECTION, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProgram(id) {
  await deleteDoc(doc(db, PROGRAMS_COLLECTION, id));
}