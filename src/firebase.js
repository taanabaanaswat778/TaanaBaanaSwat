import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const env = (v) => String(v || "").trim();

const cfg = {
  apiKey: env(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: env(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: env(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: env(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: env(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: env(import.meta.env.VITE_FIREBASE_APP_ID),
};

const forced = env(import.meta.env.VITE_LOCAL_MODE) === "true";
const hasKeys = !!cfg.apiKey && !!cfg.projectId;

// LOCAL = Firebase is off (data stays in this browser only)
export const LOCAL = forced || !hasKeys;
export const LOCAL_REASON = forced
  ? "VITE_LOCAL_MODE is set to true in your .env file. Delete that line and restart."
  : !hasKeys
  ? "No Firebase keys were found. Put a file named .env next to package.json, then stop and restart npm run dev."
  : "";

const app = LOCAL ? null : initializeApp(cfg);
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const PROJECT_ID = cfg.projectId;
export const ADMIN_UID = env(import.meta.env.VITE_ADMIN_UID); // optional: leave empty to allow any signed-in user (Firestore rules still protect your data)
export const STORE_URL = env(import.meta.env.VITE_STORE_URL);
