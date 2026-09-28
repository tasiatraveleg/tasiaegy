// One-time bulk import: writes every place in lib/egypt-places-seed.js into
// the Firestore "gallery" collection, using placeholder images. Safe to
// re-run — it skips any place whose name already exists in Firestore.
//
// Setup:
//   1. Firebase console → Project settings → Service accounts →
//      "Generate new private key". Save the downloaded file as
//      serviceAccountKey.json in the project root (already gitignored).
//   2. npm install firebase-admin --no-save   (or add it to package.json)
//   3. node scripts/seed-places.mjs
//
// This uses the Admin SDK, which bypasses Firestore security rules, so it
// works even though writes normally require a signed-in dashboard user.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { EGYPT_PLACES } from "../lib/egypt-places-seed.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = join(__dirname, "..", "serviceAccountKey.json");

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));
} catch {
  console.error(
    `Couldn't read ${keyPath}.\n` +
      "Download a service account key from Firebase console → Project settings → " +
      "Service accounts → Generate new private key, and save it as serviceAccountKey.json " +
      "in the project root."
  );
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function seed() {
  const existing = await db.collection("gallery").get();
  const existingNames = new Set(existing.docs.map((d) => d.data().name));

  let created = 0;
  let skipped = 0;

  for (const { id, ...place } of EGYPT_PLACES) {
    if (existingNames.has(place.name)) {
      skipped++;
      continue;
    }
    await db.collection("gallery").add({
      ...place,
      createdAt: Date.now(),
    });
    created++;
    console.log(`Added: ${place.name}`);
  }

  console.log(`\nDone. ${created} places added, ${skipped} already existed.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
