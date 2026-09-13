import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  Auth,
  browserLocalPersistence,
  // @ts-ignore - getReactNativePersistence is exported from firebase/auth
  getReactNativePersistence,
} from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Firebase configuration.
 * Fill these values from Firebase Console > Project Settings > Your apps > Web app.
 * You can also use Expo env vars: EXPO_PUBLIC_FIREBASE_API_KEY etc. (see .env.example)
 *
 * IMPORTANT: apiKey etc. are PUBLIC identifiers, not private secrets.
 * Security is enforced by Firestore Rules + Auth, not by hiding the apiKey.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'YOUR_AUTH_DOMAIN',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'YOUR_PROJECT_ID',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'YOUR_STORAGE_BUCKET',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? 'YOUR_SENDER_ID',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? 'YOUR_APP_ID',
};

export function isFirebaseConfigured(): boolean {
  return !Object.values(firebaseConfig).some(
    (v) => !v || (typeof v === 'string' && v.startsWith('YOUR_'))
  );
}

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let auth: Auth;
try {
  if (Platform.OS === 'web') {
    // Web must use browser persistence. React Native persistence breaks
    // auth tokens on web, causing request.auth == null in Firestore rules
    // (every read/write fails with Missing or insufficient permissions).
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    });
  } else {
    // Persist auth state with AsyncStorage on React Native (required for Expo).
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
} catch (e: any) {
  // initializeAuth throws if already initialized (e.g. Fast Refresh). Fall back.
  auth = getAuth(app);
}

let db: Firestore;
try {
  // experimentalAutoDetectLongPolling fixes "Could not reach Cloud Firestore
  // backend" on Expo Web where WebChannel streaming is blocked by
  // adblockers / VPNs / corporate proxies. It falls back to long-polling
  // automatically and is a no-op on native where it already works.
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  } as any);
} catch (e: any) {
  // Already initialized (Fast Refresh) — reuse existing instance.
  db = getFirestore(app);
}

if (!isFirebaseConfigured()) {
  console.warn(
    '[Firebase] EXPO_PUBLIC_FIREBASE_* missing or placeholder. ' +
      'Firestore will run offline and report code=unavailable. ' +
      'Fill .env from Firebase Console > Project Settings > Your apps.'
  );
} else {
  console.log('[Firebase] projectId:', firebaseConfig.projectId);
}

export { app, auth, db };
