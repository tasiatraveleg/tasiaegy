# TASIA — travel agency website

Next.js 16 (App Router) + Tailwind CSS v4, with a Firebase-backed dashboard
for managing **Programs** and **Gallery** media, and Cloudinary for image/video
storage and delivery. No booking or payment flow — this is a content and
inquiry site.

## Stack

- **Frontend**: Next.js (TypeScript, App Router), Tailwind CSS v4
- **Data**: Firebase Firestore (`programs`, `gallery` collections)
- **Auth**: Firebase Authentication (email/password) — protects `/dashboard`
- **Media**: Cloudinary (unsigned client-side uploads from the dashboard)

## Project structure

```
app/
  page.tsx              Home (hero, about tabs, programs) — built from the Figma
  why-tasia/page.tsx    Why TASIA (full Vision/Impact/Why tabs)
  programs/page.tsx     Public programs listing (reads Firestore)
  gallery/page.tsx      Public gallery (reads Firestore + Cloudinary)
  contact/page.tsx      Contact page with inquiry form (static — wire up as needed)
  dashboard/
    login/page.tsx      Admin sign-in
    programs/page.tsx   Create/edit/delete programs + cover image upload
    gallery/page.tsx    Upload + delete gallery photos/videos
components/             Navbar, Hero, AboutTabs, ProgramCard, Programs, Footer
lib/
  firebase.ts           Firebase app/Firestore/Auth init
  cloudinary.ts         Client-side Cloudinary upload helper
  programs.ts           Firestore CRUD for programs
  gallery.ts            Firestore CRUD for gallery items
  auth-context.tsx       Auth state provider for the dashboard
types/index.ts          Program / GalleryItem types
```

## 1. Set up Firebase

1. Create a project at https://console.firebase.google.com
2. Add a **Web app** → copy the config values into `.env.local` (copy
   `.env.local.example` first).
3. Enable **Firestore Database** (production mode is fine).
4. Enable **Authentication → Sign-in method → Email/Password**.
5. Add yourself as a user under **Authentication → Users → Add user** —
   this is what you'll use to log into `/dashboard`.
6. Recommended Firestore rules — public can read programs/gallery, only
   signed-in users (you) can write:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /programs/{id} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /gallery/{id} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

## 2. Set up Cloudinary

1. Create an account at https://cloudinary.com — grab your **Cloud name**
   from the dashboard.
2. Go to **Settings → Upload → Upload presets → Add upload preset**.
3. Set **Signing Mode** to **Unsigned** (this lets the dashboard upload
   directly from the browser without exposing your API secret). Name it
   anything, e.g. `tasia_unsigned`.
4. Add the cloud name and preset name to `.env.local`.

## 3. Run it

```bash
cp .env.local.example .env.local   # then fill in your values
npm install
npm run dev
```

Visit `http://localhost:3000` for the public site and
`http://localhost:3000/dashboard` for the admin dashboard.

## Egypt places (Gallery schema)

The `gallery` Firestore collection holds named destinations, not just raw
photos — each document is:

```
{
  name: string             // "The Temples of Karnak"
  country: string          // "Egypt" — top level of the public Gallery
  region: string            // one of: Cairo & Giza, Sinai, Middle Egypt,
                             // Luxor, Aswan & Nubia, Western Desert Oases,
                             // Alexandria
  description: string       // short caption shown under the image
  mediaType: "image" | "video"
  url: string                // Cloudinary delivery URL
  publicId: string | null    // Cloudinary public_id (null for seed placeholders)
  order: number
  createdAt: timestamp
}
```

The public Gallery is two levels: `/gallery` lists countries (Egypt is the
only one seeded, but the dashboard's Country field accepts any name — add
a place with a new country and it appears here automatically); each
country links to `/gallery/[country-slug]`, which lists its places grouped
by region, stacked one under another. Manage entries from
`/dashboard/gallery` — the form there matches this schema exactly.

`lib/egypt-places-seed.js` has all 33 places from your source document
pre-filled with placeholder images, grouped by region. It's used as the
fallback shown before Firebase is configured, and as the source list for
the bulk-import script below.

### Bulk-import all 33 places into Firestore

Rather than adding each place through the dashboard one at a time:

1. Firebase console → **Project settings → Service accounts → Generate new
   private key**. Save the downloaded file as `serviceAccountKey.json` in
   the project root (already in `.gitignore` — never commit this).
2. `npm install firebase-admin --no-save`
3. `node scripts/seed-places.mjs`

This writes all 33 places with placeholder images. It's safe to re-run —
it skips any place whose name already exists. Once places are in Firestore,
go to `/dashboard/gallery`, click **Edit** on each one, and upload the real
photo to replace its placeholder.



- The hero image and a couple of about/gallery images currently point at
  Cloudinary's public demo account as placeholders — swap them for your own
  photography once uploaded (either hardcode the URL, or wire the Home page
  image to pull from your `gallery` collection).
- The **Contact** page form is static; connect its `onSubmit` to Firestore,
  an email service (e.g. Resend), or a form endpoint (e.g. Formspree) when
  you're ready to receive inquiries.
- Program detail pages (`/programs/[id]`) aren't built yet — each program
  currently links out via an "Explore this journey" button with no target
  page. Happy to build that next once you confirm what a detail page should
  show (day-by-day itinerary, pricing, etc).
