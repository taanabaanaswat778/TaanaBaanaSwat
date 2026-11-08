# Taana Baana Admin (separate admin website)

Upload products, update prices category by category, and manage orders.
It uses the SAME Firebase project as your store, so everything you change shows on the store instantly.

## Run it on your computer
1. Copy `.env.example` to `.env` and paste the same Firebase values you used for the store (plus the same VITE_ADMIN_UID).
2. `npm install`
3. `npm run dev`  (opens at http://localhost:5174)
4. Log in with the admin email and password you created in Firebase > Authentication.

## Put it online as a second website (free)
1. `npm install -g firebase-tools` then `firebase login`
2. Create a second hosting site in the same project:
   `firebase hosting:sites:create taana-admin`   (pick any free name)
3. `firebase target:apply hosting admin taana-admin`   (use the name from step 2)
4. `npm run build`
5. `firebase deploy --only hosting:admin`
Your admin site will be at https://taana-admin.web.app

## Firestore rules
Use the rules in `firestore.rules` (replace PASTE_ADMIN_UID_HERE with your UID) in Firebase > Firestore > Rules.
These are the same rules as the store, so if you already published them you do not need to change anything.
