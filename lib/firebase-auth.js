import { getAuth } from "firebase/auth";
import { firebaseApp } from "./firebase";

// Imported only by dashboard code (login page, auth-context, Sidebar).
// Kept separate from firebase.js so public pages that only read Firestore
// never initialize Auth, which validates its API key eagerly and would
// throw during the build/server render if .env.local isn't filled in yet.
export const auth = getAuth(firebaseApp);
