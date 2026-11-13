import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore"; // Changed to initializeFirestore
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

export const LOCAL = forced || !hasKeys;
export const LOCAL_REASON = forced
  ? "VITE_LOCAL_MODE is set to true in your .env file. Delete that line and restart."
  : !hasKeys
  ? "No Firebase keys were found. Put a file named .env next to package.json, then stop and restart npm run dev."
  : "";

const app = LOCAL ? null : initializeApp(cfg);

// Use initializeFirestore with Long-Polling to fix connection drops
export const db = app ? initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
}) : null;

export const auth = app ? getAuth(app) : null;
export const PROJECT_ID = cfg.projectId;
export const ADMIN_UID = env(import.meta.env.VITE_ADMIN_UID);
export const STORE_URL = env(import.meta.env.VITE_STORE_URL);