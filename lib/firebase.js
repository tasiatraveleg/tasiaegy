import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// All values come from NEXT_PUBLIC_* env vars so this file works
// identically in the browser (dashboard) and on the server (SSR/RSC).
// Fill these in your .env.local — see .env.local.example.
//
// Well-formed placeholders are used as a fallback when .env.local hasn't
// been filled in yet. This lets the app build and render (showing friendly
// "couldn't load" states) instead of crashing on module load. Real
// reads/writes will still fail gracefully until you add your actual
// Firebase project's values.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDUMMY0000000000000000000000000",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
};

// Avoid re-initializing during Next.js hot reload / multiple imports.
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);

// Auth lives in ./firebase-auth so public pages that only read Firestore
// (Programs, Gallery) never touch Auth — which validates its API key
// eagerly and would throw during the build if .env.local isn't filled in
// yet. Dashboard code should import { auth } from "@/lib/firebase-auth".
