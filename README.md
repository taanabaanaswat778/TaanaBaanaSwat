# Clothing Store (React + Bootstrap + Firebase)

## Setup
1. Create a project at https://console.firebase.google.com
2. Add a **Web app**, copy its config into `.env` (see `.env.example`).
3. **Authentication** > Sign-in method > enable **Email/Password**. Add your admin user under Users and copy its **UID** into `.env` (`VITE_ADMIN_UID`).
4. **Firestore Database** > Create database. Then open the **Rules** tab and paste `firestore.rules`, replacing `PASTE_ADMIN_UID_HERE` with the same UID. Publish.
5. `npm install` then `npm run dev`.

## Use
- Store: `/`  Admin: `/#/admin` (log in with your admin email and password).
- In Admin > Settings set your store name and WhatsApp number (with country code, e.g. 923001234567).

## Deploy (free)
`npm i -g firebase-tools && firebase login && firebase init hosting` (public dir `dist`, single-page app: yes), then `npm run build && firebase deploy`.
