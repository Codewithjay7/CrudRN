# Crud_RN — Expo + Firebase Auth + Firestore CRUD

## 1. What was built
- Expo (SDK 52) + TypeScript + React Navigation (native-stack v7)
- Firebase Auth (email/password) with persistence via AsyncStorage
- Firestore CRUD on `products` collection
- Screens: Login, Register, ForgotPassword, ProductList (FlatList), ProductForm (add/edit), ProductDetail
- Reusable UI: AppButton, AppTextInput, Error/Success, LoadingView
- Services: `authService.ts`, `productService.ts`
- Validation: `utils/validation.ts`
- Rules: `firestore.rules`

## 2. Firebase configuration required (MANUAL STEPS)
Your folder was EMPTY — no Firebase config existed, so nothing was duplicated.

You must:
1. Go to https://console.firebase.google.com/ → Create project (or use existing)
2. Build → Authentication → Sign-in method → Enable **Email/Password**
3. Build → Firestore Database → Create database (Production mode) → choose region
4. Project Settings → General → Your apps → Add Web app (`</>`) → copy config:
   - apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId
5. In this project:
   - `cp .env.example .env` and fill values, OR edit `src/config/firebase.ts` directly
   - Restart Expo: `npx expo start -c`
6. Firestore → Rules → paste contents of `firestore.rules` → Publish
7. (Optional) Firestore → Indexes: `products` orderBy `createdAt desc` is automatic for single-field; no composite index needed.

`.env` example:
```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

## 3. Firestore structure used
```
products (collection)
 └── {autoId} (document)
     ├── name: string
     ├── description: string
     ├── price: number
     ├── ownerId: string | null
     ├── createdAt: timestamp (serverTimestamp)
     └── updatedAt: timestamp (serverTimestamp)
```

## 4. Security rules (see firestore.rules)
- `read/create/update/delete` on `/products/{docId}` only if `request.auth != null`
- `create/update` validates `name` non-empty string and `price >= 0`
- Everything else denied.

## 5. Commands to run
```bash
npm install
npx expo start -c
# then press: a (android) / i (ios) / w (web)
# typecheck:
npx tsc --noEmit
```

If `npm install` is slow, use `npm install --legacy-peer-deps` only if peer errors appear (not needed normally).

## 6. Testing checklist (manual)
- [ ] Register: invalid email → validation error; weak pass → error; valid → goes to Products
- [ ] Login: wrong creds → friendly error; correct → Products
- [ ] Forgot: empty/invalid → error; valid → success message + email received
- [ ] Create: empty name/price → validation; valid → success + appears in FlatList
- [ ] Read: FlatList shows name/desc/price; pull-to-refresh works; tap → Detail
- [ ] Update: Edit → prefilled → change → success → list reflects
- [ ] Delete: Delete → Alert confirmation → removed
- [ ] Logout: header Logout → back to Login; restart app → persists if still logged in
- [ ] Navigation: unauthenticated cannot see Products; authenticated cannot see Login (auto-switch via onAuthStateChanged)
- [ ] Rules: logged-out read via console simulator should deny; logged-in allow

## 7. Notes on Expo SDK version
- Pinned to SDK 52 (stable with React 18.3 + RN 0.76). Expo CLI 57 can still run SDK 52 projects.
- If you upgrade to SDK 53/57 later, run `npx expo install --fix`.

## 8. Files created / modified
See final summary from assistant.