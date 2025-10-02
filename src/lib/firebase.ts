
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type Storage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// This function is the single source of truth for Firebase client services
function getFirebaseClient() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  let app: FirebaseApp;

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);

    if (typeof window !== 'undefined') {
      const appCheckKey = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY;
      if (appCheckKey) {
        try {
          initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(appCheckKey),
            isTokenAutoRefreshEnabled: true
          });
        } catch (e) {
          console.error("Error initializing App Check", e);
        }
      } else {
        console.warn("Firebase App Check key is not defined. App Check will not be initialized.");
      }
    }
  } else {
    app = getApp();
  }
  
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  
  return { app, auth, db, storage };
}

// Export the function to be used in client components
export { getFirebaseClient };
